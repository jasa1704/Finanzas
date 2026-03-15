import type { NextAuthConfig } from "next-auth"

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const protectedPaths = ["/dashboard", "/transactions", "/budgets"]
      const isProtected = protectedPaths.some((p) =>
        nextUrl.pathname.startsWith(p)
      )
      if (isProtected) return isLoggedIn
      return true
    },
  },
  pages: {
    signIn: "/login",
  },
}
