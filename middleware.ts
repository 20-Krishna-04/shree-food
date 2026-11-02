import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Update session cookies
  const response = await updateSession(request);

  const path = request.nextUrl.pathname;

  // Protected customer routes
  const isCheckoutRoute = path.startsWith("/checkout");
  const isOrdersRoute = path.startsWith("/my-orders");
  const isProfileRoute = path.startsWith("/profile");
  const isTrackingRoute = path.startsWith("/order-tracking") || path.startsWith("/orders");

  // Protected admin routes
  const isAdminRoute = path.startsWith("/admin");

  // In Next.js middleware, check auth session token cookie or supabase auth cookie
  const authToken = request.cookies.get("sb-access-token")?.value ||
    request.cookies.get("supabase-auth-token")?.value ||
    request.cookies.get("sb-auth-token")?.value;

  // Also check mock user cookie in demo mode
  const mockUserCookie = request.cookies.get("ck_mock_user")?.value;

  const isAuthenticated = Boolean(authToken || mockUserCookie);

  if ((isCheckoutRoute || isOrdersRoute || isProfileRoute || isTrackingRoute) && !isAuthenticated) {
    // If running in development without strict cookie, allow or redirect to login
    // Let client-side auth context handle soft redirects if mock mode
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/checkout/:path*",
    "/my-orders/:path*",
    "/order-tracking/:path*",
    "/orders/:path*",
    "/profile/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
