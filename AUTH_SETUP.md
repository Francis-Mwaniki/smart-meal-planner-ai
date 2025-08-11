# Authentication Setup Guide

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/meal_planner"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Email (Resend)
RESEND_API_KEY="your-resend-api-key"

# OpenAI (for meal plan generation)
OPENAI_API_KEY="your-openai-api-key"
```

## Database Setup

1. Update your Prisma schema (already done - password field added to User model)
2. Run database migrations:
   ```bash
   npx prisma migrate dev --name add-password-field
   ```
3. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

## Features Implemented

### ✅ Authentication System
- **NextAuth.js v4** with credentials provider
- **Email/Password** authentication
- **Password hashing** with bcryptjs
- **JWT sessions** for stateless authentication
- **Protected routes** with middleware
- **Session management** with React hooks

### ✅ User Management
- **User registration** with validation
- **User login** with error handling
- **Password security** with bcrypt hashing
- **Session persistence** across page reloads
- **Automatic redirects** for authenticated users

### ✅ Protected Routes
- **Dashboard** - requires authentication
- **API routes** - protected with middleware
- **Route guards** - automatic redirects to signin

### ✅ UI Components
- **Sign In page** - with error handling and loading states
- **Sign Up page** - with form validation
- **Protected Route component** - for wrapping authenticated content
- **Session Provider** - for app-wide auth state

## Usage Examples

### Protecting a Page
```tsx
import ProtectedRoute from "@/components/protected-route"

export default function MyPage() {
  return (
    <ProtectedRoute>
      <div>This content is only visible to authenticated users</div>
    </ProtectedRoute>
  )
}
```

### Using Authentication in Components
```tsx
import { useSession, signOut } from "next-auth/react"

export default function MyComponent() {
  const { data: session } = useSession()
  
  return (
    <div>
      <p>Welcome, {session?.user?.name}!</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  )
}
```

### Custom Hook for Auth
```tsx
import { useAuth } from "@/hooks/use-auth"

export default function MyComponent() {
  const { user, isAuthenticated, isLoading } = useAuth()
  
  if (isLoading) return <div>Loading...</div>
  if (!isAuthenticated) return <div>Please sign in</div>
  
  return <div>Welcome, {user?.name}!</div>
}
```

## Security Features

- **Password hashing** with bcryptjs (12 rounds)
- **JWT tokens** for secure session management
- **Protected API routes** with middleware
- **CSRF protection** built into NextAuth.js
- **Secure cookie handling** with httpOnly flags

## Next Steps

1. **Set up environment variables** in `.env.local`
2. **Run database migrations** to add password field
3. **Test authentication flow** by registering and signing in
4. **Customize UI** to match your design requirements
5. **Add additional providers** (Google, GitHub, etc.) if needed

## Troubleshooting

### Common Issues

1. **"Invalid credentials" error**: Check if user exists and password is correct
2. **Session not persisting**: Verify NEXTAUTH_SECRET is set
3. **Database connection errors**: Check DATABASE_URL format
4. **TypeScript errors**: Ensure types/next-auth.d.ts is properly configured

### Debug Mode

Enable NextAuth debug mode by adding to your `.env.local`:
```bash
NEXTAUTH_DEBUG=true
```
