"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { ChefHat, LogOut, Settings } from "lucide-react"
import Link from "next/link"

interface DashboardHeaderProps {
  showBackButton?: boolean
  backHref?: string
  backLabel?: string
  title?: string
  subtitle?: string
}

export default function DashboardHeader({
  showBackButton = false,
  backHref = "/dashboard",
  backLabel = "Back to Dashboard",
  title,
  subtitle
}: DashboardHeaderProps) {
  const { data: session } = useSession()

  return (
    <>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-xl shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <ChefHat className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">SmartMeal AI</span>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {session?.user?.name}</span>
              <Button 
                variant="ghost" 
                className="text-gray-600 hover:text-gray-900"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Header */}
      <div className="container mx-auto px-4 py-8 mt-20">
        {showBackButton && (
          <div className="mb-4">
            <Link href={backHref}>
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900 p-0 h-auto">
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {backLabel}
              </Button>
            </Link>
          </div>
        )}
        
        {title && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
            {subtitle && <p className="text-gray-600">{subtitle}</p>}
          </div>
        )}
      </div>
    </>
  )
}
