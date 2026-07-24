import { z } from "zod";
import { SubscriptionStatus } from "@prisma/client";
import { prisma } from "../../../../../lib/prisma";
import { json, route, bad, readBody } from "../../../../../lib/api";
import { requireStaff } from "../../../../../lib/auth-helpers";

type Params = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  status: z.nativeEnum(SubscriptionStatus),
});

/** PATCH /api/admin/subscriptions/[id] — pause / resume / cancel a plan. */
export const PATCH = route(async (req: Request, { params }: Params) => {
  await requireStaff();
  const { id } = await params;
  const { status } = await readBody(req, patchSchema);

  const sub = await prisma.subscription.findUnique({ where: { id } });
  if (!sub) return bad("Subscription not found", 404);
  if (sub.status === "CANCELED") return bad("Subscription is already canceled", 409);

  const updated = await prisma.subscription.update({
    where: { id },
    data: { status },
  });
  return json(updated);
});
