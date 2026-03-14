export { auth as middleware } from "@/lib/auth"

export const config = {
  matcher: ["/dashboard/:path*", "/transactions/:path*", "/budgets/:path*"],
}
