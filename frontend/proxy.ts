import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const ownerOnlyRoutes = [
  "/dashboard/analytics",
  "/dashboard/billing",
  "/dashboard/suppliers",
];

export default withAuth(
  function proxy(req) {
    const { pathname } = req.nextUrl;
    const userRole = req.nextauth.token?.role;

    const isOwnerRoute = ownerOnlyRoutes.some((route) =>
      pathname.startsWith(route)
    );

    if (isOwnerRoute && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    secret: process.env.NEXTAUTH_SECRET || "super-secret-key-for-local-dev-12345",
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
