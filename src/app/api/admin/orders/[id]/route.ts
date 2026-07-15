import { z } from "zod";
import { OrderStatus, PaymentStatus, OrderEventKind } from "@prisma/client";
import { prisma } from "../../../../../lib/prisma";
import { json, route, bad, readBody } from "../../../../../lib/api";
import { requireStaff } from "../../../../../lib/auth-helpers";

type Params = { params: Promise<{ id: string }> };

const orderInclude = {
  items: { include: { product: { select: { slug: true } } } },
  events: {
    orderBy: { createdAt: "desc" as const },
    include: { actor: { select: { name: true, email: true } } },
  },
  user: { select: { id: true, name: true, email: true, phone: true } },
};

/** Accepts either the cuid or the public "FS-XXXXX" code. */
async function findOrder(idOrCode: string) {
  return prisma.order.findFirst({
    where: { OR: [{ id: idOrCode }, { code: idOrCode }] },
    include: orderInclude,
  });
}

/** GET /api/admin/orders/[id] — full order with items, events, customer. */
export const GET = route(async (_req: Request, { params }: Params) => {
  await requireStaff();
  const { id } = await params;
  const order = await findOrder(id);
  if (!order) return bad("Order not found", 404);
  return json(order);
});

const patchSchema = z
  .object({
    status: z.nativeEnum(OrderStatus).optional(),
    paymentStatus: z.nativeEnum(PaymentStatus).optional(),
    note: z.string().min(1).max(500).optional(),
  })
  .refine((d) => d.status || d.paymentStatus || d.note, {
    message: "Nothing to update",
  });

const STATUS_EVENT: Record<OrderStatus, OrderEventKind> = {
  NEW: "ACCEPTED",
  TYING: "TYING",
  READY: "READY",
  OUT_FOR_DELIVERY: "OUT",
  DELIVERED: "DELIVERED",
  CANCELED: "CANCELED",
};

/** PATCH /api/admin/orders/[id] — change status / payment, append a note. */
export const PATCH = route(async (req: Request, { params }: Params) => {
  const staff = await requireStaff();
  const { id } = await params;
  const data = await readBody(req, patchSchema);

  const order = await findOrder(id);
  if (!order) return bad("Order not found", 404);

  await prisma.$transaction(async (tx) => {
    const events: { kind: OrderEventKind; message?: string }[] = [];

    if (data.status && data.status !== order.status) {
      // Canceling returns tracked stock to the shelf.
      if (data.status === "CANCELED") {
        for (const it of order.items) {
          if (!it.variantId) continue;
          await tx.productVariant.update({
            where: { id: it.variantId },
            data: { stockQty: { increment: it.qty } },
          });
        }
      }
      events.push({ kind: STATUS_EVENT[data.status] });
    }

    if (data.paymentStatus && data.paymentStatus !== order.paymentStatus) {
      if (data.paymentStatus === "PAID") events.push({ kind: "PAID" });
      else if (data.paymentStatus === "REFUNDED") events.push({ kind: "REFUNDED" });
      else events.push({ kind: "NOTE", message: "Payment set back to pending." });
    }

    if (data.note) events.push({ kind: "NOTE", message: data.note });

    await tx.order.update({
      where: { id: order.id },
      data: {
        ...(data.status ? { status: data.status } : {}),
        ...(data.paymentStatus ? { paymentStatus: data.paymentStatus } : {}),
        events: {
          create: events.map((e) => ({ ...e, actorId: staff.id })),
        },
      },
    });
  });

  const updated = await findOrder(order.id);
  return json(updated);
});
