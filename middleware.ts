import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/meal-plans/:path*",
    "/api/recipes/:path*",
    "/api/shopping-lists/:path*",
    "/api/users/:path*",
  ],
}
