import { z } from "zod";
import { prisma } from "../../../../../lib/prisma";
import { json, route, bad, readBody } from "../../../../../lib/api";
import { requireStaff } from "../../../../../lib/auth-helpers";
import { serializeOrder } from "../../../orders/route";

/** GET /api/admin/orders/[id] — full order incl. events + customer. */
export const GET = route(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  await requireStaff();
  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { OR: [{ id }, { code: id }] },
    include: {
      items: true,
      events: { orderBy: { createdAt: "asc" }, include: { actor: { select: { name: true, email: true } } } },
      user: { select: { id: true, name: true, email: true, phone: true } },
    },
  });
  if (!order) return bad("Order not found", 404);
  return json({
    order: {
      ...serializeOrder(order),
      customer: order.user,
      events: order.events.map((e: any) => ({
        kind: e.kind, message: e.message, createdAt: e.createdAt,
        actorName: e.actor?.name || e.actor?.email || null,
      })),
    },
  });
});

const patchSchema = z.object({
  status: z.enum(["NEW","TYING","READY","OUT_FOR_DELIVERY","DELIVERED","CANCELED"]).optional(),
  paymentStatus: z.enum(["PENDING","PAID","REFUNDED"]).optional(),
  internalNotes: z.string().max(2000).nullable().optional(),
  note: z.string().max(500).optional(),  // appends an OrderEvent(kind=NOTE)
});

/** PATCH /api/admin/orders/[id] — change status / payment / add a note. */
export const PATCH = route(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const staff = await requireStaff();
  const { id } = await params;
  const data = await readBody(req, patchSchema);

  const existing = await prisma.order.findFirst({ where: { OR: [{ id }, { code: id }] } });
  if (!existing) return bad("Order not found", 404);

  await prisma.$transaction(async (tx) => {
    const updates: any = {};
    if (data.status && data.status !== existing.status) updates.status = data.status;
    if (data.paymentStatus && data.paymentStatus !== existing.paymentStatus) updates.paymentStatus = data.paymentStatus;
    if (data.internalNotes !== undefined) updates.internalNotes = data.internalNotes;

    if (Object.keys(updates).length > 0) {
      await tx.order.update({ where: { id: existing.id }, data: updates });
    }

    // Auto-log status/payment changes as events.
    const events: any[] = [];
    if (updates.status) {
      const kindMap: Record<string, string> = {
        TYING: "TYING", READY: "READY",
        OUT_FOR_DELIVERY: "OUT", DELIVERED: "DELIVERED", CANCELED: "CANCELED", NEW: "ACCEPTED",
      };
      events.push({ kind: kindMap[updates.status] as any, actorId: staff.id, orderId: existing.id });
    }
    if (updates.paymentStatus === "PAID") {
      events.push({ kind: "PAID", actorId: staff.id, orderId: existing.id, message: "Payment marked PAID by staff." });
    }
    if (updates.paymentStatus === "REFUNDED") {
      events.push({ kind: "REFUNDED", actorId: staff.id, orderId: existing.id });
    }
    if (data.note) {
      events.push({ kind: "NOTE" as any, actorId: staff.id, orderId: existing.id, message: data.note });
    }
    for (const e of events) await tx.orderEvent.create({ data: e });
  });

  const fresh = await prisma.order.findUnique({
    where: { id: existing.id },
    include: { items: true, events: { orderBy: { createdAt: "asc" } } },
  });
  return json({ order: serializeOrder(fresh) });
});
