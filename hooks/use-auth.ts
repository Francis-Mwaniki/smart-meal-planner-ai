import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const isAuthenticated = !!session?.user?.id
  const isLoading = status === "loading"
  const user = session?.user

  const requireAuth = (redirectTo = "/auth/signin") => {
    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push(redirectTo)
      }
    }, [isLoading, isAuthenticated, router, redirectTo])
  }

  return {
    session,
    user,
    isAuthenticated,
    isLoading,
    requireAuth,
  }
}
