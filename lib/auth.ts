import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { db } from "./db"
import { z } from "zod"

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = z
          .object({ email: z.string().email(), password: z.string().min(1) })
          .safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data
        const user = await db.user.findUnique({ where: { email } })
        if (!user || !user.hashedPassword) return null

        const valid = await bcrypt.compare(password, user.hashedPassword)
        if (!valid) return null

        return { id: user.id, email: user.email, name: user.name }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    session({ session, token }) {
      if (token?.id) session.user.id = token.id as string
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
})
