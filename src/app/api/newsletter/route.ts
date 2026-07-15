import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { json, route, readBody } from "../../../lib/api";
import { enforceRateLimit } from "../../../lib/rate-limit";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});

/** POST /api/newsletter — footer signup. Idempotent: re-subscribing an existing email just succeeds. */
export const POST = route(async (req: Request) => {
  await enforceRateLimit(req, "newsletter", { limit: 5, windowSec: 60 });
  const data = await readBody(req, schema);
  const email = data.email.toLowerCase();

  await prisma.newsletterSubscriber.upsert({
    where: { email },
    create: { email },
    update: {},
  });

  return json({ ok: true }, { status: 201 });
});
