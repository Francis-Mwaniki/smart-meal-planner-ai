# Environment Setup Guide

This application requires several environment variables to function properly. Create a `.env.local` file in the root directory with the following variables:

## Required Environment Variables

### Database
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/meal_planner"
```

### NextAuth Authentication
```bash
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

### OpenRouter AI (Optional - for AI features)
```bash
OPENROUTER_API_KEY="your_openrouter_api_key_here"
```

**Note:** If you don't have an OpenRouter API key, the application will still work but will use fallback data instead of AI-generated content.

### Resend Email (Optional - for email features)
```bash
RESEND_API_KEY="your_resend_api_key_here"
```

### Google OAuth (Optional - for Google sign-in)
```bash
GOOGLE_CLIENT_ID="your_google_client_id_here"
GOOGLE_CLIENT_SECRET="your_google_client_secret_here"
```

## Getting API Keys

### OpenRouter API Key
1. Go to [OpenRouter](https://openrouter.ai/)
2. Sign up for an account
3. Navigate to the API Keys section
4. Create a new API key
5. Copy the key to your `.env.local` file

### Resend API Key
1. Go to [Resend](https://resend.com/)
2. Sign up for an account
3. Navigate to the API Keys section
4. Create a new API key
5. Copy the key to your `.env.local` file

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to Credentials
5. Create OAuth 2.0 Client ID
6. Add authorized redirect URIs (e.g., `http://localhost:3000/api/auth/callback/google`)
7. Copy the Client ID and Client Secret to your `.env.local` file

## Running Without API Keys

The application is designed to work even without the optional API keys:

- **Without OpenRouter API Key**: AI features will use fallback data (sample meal plans, recipes, etc.)
- **Without Resend API Key**: Email features will be disabled
- **Without Google OAuth**: Only email/password authentication will be available

## Security Notes

- Never commit your `.env.local` file to version control
- The `.env.local` file is already in `.gitignore`
- Use strong, unique secrets for production environments
- Rotate API keys regularly for security


