import type React from "react"
import type { Metadata } from "next"
import { Josefin_Sans, Montserrat, Playfair_Display } from "next/font/google"
import "./globals.css"
import AuthSessionProvider from "@/components/session-provider"

// Force dynamic rendering for the entire app
export const dynamic = 'force-dynamic'
export const revalidate = 0

const josefin = Josefin_Sans({ 
  subsets: ["latin"],
  variable: "--font-josefin",
  display: "swap"
})

const montserrat = Montserrat({ 
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap"
})

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap"
})

export const metadata: Metadata = {
  title: "SmartMeal AI - Railway Hackathon 2025",
  description:
    "AI-powered meal planning with intelligent recommendations, automated shopping lists, and personalized nutrition tracking. Built for Railway Hackathon 2025.",
  keywords: "meal planning, AI, nutrition, recipes, shopping list, Railway, hackathon",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
 children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${josefin.variable} ${montserrat.variable} ${playfair.variable} font-montserrat`}>
        <AuthSessionProvider>
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  )
}
