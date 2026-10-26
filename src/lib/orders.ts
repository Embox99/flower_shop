/**
 * Customer-facing order access.
 *
 * Order codes are short (FS-12345) and therefore guessable, so a code alone
 * never unlocks an order. A visitor may view an order when either:
 *  - it belongs to their signed-in account, or
 *  - it was placed from this browser — checkout records the code in an
 *    httpOnly cookie (see `rememberOrder`).
 */
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { auth } from "./auth";

const ORDERS_COOKIE = "fs_orders";
const ORDERS_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const MAX_REMEMBERED = 10;

async function rememberedCodes(): Promise<string[]> {
  const raw = (await cookies()).get(ORDERS_COOKIE)?.value;
  return raw ? raw.split(".").filter(Boolean) : [];
}

/** Record an order placed from this browser so its confirmation stays viewable. */
export async function rememberOrder(code: string) {
  const codes = [code, ...(await rememberedCodes()).filter((c) => c !== code)].slice(0, MAX_REMEMBERED);
  (await cookies()).set(ORDERS_COOKIE, codes.join("."), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ORDERS_MAX_AGE,
    path: "/",
  });
}

/** Fetch an order by code if the current visitor may see it, else null. */
export async function findViewableOrder(code: string) {
  const order = await prisma.order.findUnique({
    where: { code },
    include: {
      items: true,
      // Customers never see internal staff notes.
      events: { where: { kind: { not: "NOTE" } }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!order) return null;

  const session = await auth();
  if (order.userId && order.userId === session?.user?.id) return order;
  if ((await rememberedCodes()).includes(code)) return order;
  return null;
}
