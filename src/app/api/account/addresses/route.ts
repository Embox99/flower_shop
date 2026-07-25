import { z } from "zod";
import { prisma } from "../../../../lib/prisma";
import { json, route, readBody } from "../../../../lib/api";
import { requireUser } from "../../../../lib/auth-helpers";

const addressSchema = z.object({
  label: z.string().max(40).optional(),
  line1: z.string().min(1, "Required").max(120),
  line2: z.string().max(120).optional(),
  city: z.string().min(1, "Required").max(80),
  zip: z.string().max(20).optional(),
  country: z.string().max(2).default("IL"),
  phone: z.string().max(30).optional(),
  isDefault: z.boolean().optional(),
});

/** GET /api/account/addresses — the signed-in user's saved addresses. */
export const GET = route(async () => {
  const user = await requireUser();
  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { id: "asc" }],
  });
  return json({ addresses });
});

/** POST /api/account/addresses — add a saved address. */
export const POST = route(async (req: Request) => {
  const user = await requireUser();
  const data = await readBody(req, addressSchema);

  // First address becomes the default automatically.
  const count = await prisma.address.count({ where: { userId: user.id } });
  const makeDefault = data.isDefault || count === 0;

  const address = await prisma.$transaction(async (tx) => {
    if (makeDefault) {
      await tx.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
    }
    return tx.address.create({
      data: {
        userId: user.id,
        label: data.label,
        line1: data.line1,
        line2: data.line2,
        city: data.city,
        zip: data.zip,
        country: data.country,
        phone: data.phone,
        isDefault: makeDefault,
      },
    });
  });
  return json({ address }, { status: 201 });
});
