import type { Metadata, Viewport } from "next"
import "./globals.css"
import { SessionProvider } from "next-auth/react"

export const metadata: Metadata = {
  title: "FinanzApp",
  description: "Tu app de finanzas personales",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FinanzApp",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#7c3aed",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
