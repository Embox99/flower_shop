/**
 * Edge middleware — protects /admin routes.
 *
 * NextAuth's `withAuth` wrapper checks for a valid JWT *and* runs an `authorized`
 * callback we use to require STAFF/OWNER. Customers hitting /admin get bounced
 * back to the storefront with a redirect.
 *
 * Visitor-token bootstrap from the Wix days is no longer needed — anonymous
 * carts work via cookie (see lib/cart.ts).
 */
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (!req.nextUrl.pathname.startsWith("/admin")) return true;
        return token?.role === "STAFF" || token?.role === "OWNER";
      },
    },
    pages: { signIn: "/login" },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
