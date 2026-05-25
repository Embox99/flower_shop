/**
 * Auth guards for route handlers + server components.
 * Throw early — the global error boundary / route handler turns them into JSON.
 */
import { auth } from "./auth";
import type { Role } from "@prisma/client";

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

/** Returns the session, throws 401 otherwise. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new AuthError("Sign in required", 401);
  return session.user;
}

/** Requires STAFF or OWNER. */
export async function requireStaff() {
  const u = await requireUser();
  if (u.role !== "STAFF" && u.role !== "OWNER") {
    throw new AuthError("Staff access required", 403);
  }
  return u;
}

/** Requires OWNER (settings, payments, team). */
export async function requireOwner() {
  const u = await requireUser();
  if (u.role !== "OWNER") {
    throw new AuthError("Owner access required", 403);
  }
  return u;
}

/** Helper: wrap route handlers in try/catch that converts AuthError → JSON. */
export function withAuth<T extends (...args: any[]) => any>(handler: T): T {
  return (async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (e: any) {
      if (e instanceof AuthError) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: e.status,
          headers: { "content-type": "application/json" },
        });
      }
      throw e;
    }
  }) as T;
}

export function roleAtLeast(role: Role, min: Role): boolean {
  const order: Role[] = ["CUSTOMER", "STAFF", "OWNER"];
  return order.indexOf(role) >= order.indexOf(min);
}
