# StartupSwipe - Backend Setup Guide

This project has been converted to Next.js with a full backend using Prisma, NextAuth, and PostgreSQL.

## Prerequisites

- Node.js 18+ installed
- A Google Cloud account (for OAuth)
- A Neon or Supabase account (for free PostgreSQL)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Choose "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for local dev)
   - `https://your-domain.vercel.app/api/auth/callback/google` (for production)
7. Copy the Client ID and Client Secret

### 3. Set Up Neon Database (Free)

1. Go to [Neon](https://neon.tech/) and sign up
2. Create a new project
3. Copy the connection string (it looks like: `postgresql://user:pass@host/dbname?sslmode=require`)
4. This will be your `DATABASE_URL`

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 5. Set Up Prisma

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push
```

### 6. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [Vercel](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Add environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `NEXTAUTH_URL` (your Vercel domain)
   - `NEXTAUTH_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
5. Deploy!

### 3. Update Google OAuth Redirect URI

After deployment, update your Google OAuth redirect URI to:
```
https://your-project.vercel.app/api/auth/callback/google
```

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts  # NextAuth handler
│   │   ├── startups/route.ts              # GET/POST startups
│   │   ├── vote/route.ts                   # POST votes
│   │   └── user/route.ts                   # GET current user
│   ├── layout.tsx                          # Root layout
│   ├── page.tsx                            # Main page
│   └── globals.css                         # Styles
├── lib/
│   ├── auth.ts                             # NextAuth config
│   └── prisma.ts                           # Prisma client
├── prisma/
│   └── schema.prisma                       # Database schema
└── components/
    └── StartupSwipe.tsx                    # Main client component
```

## API Endpoints

- `GET /api/startups` - Get all startups (public)
- `POST /api/startups` - Create startup (requires auth)
- `POST /api/vote` - Submit vote (public, tracks user if logged in)
- `GET /api/user` - Get current user info
- `GET /api/auth/signin` - Sign in with Google
- `GET /api/auth/signout` - Sign out

## Database Schema

- **User** - NextAuth users
- **Startup** - Submitted startups
- **Vote** - User votes on startups
- **Account/Session** - NextAuth tables

## Troubleshooting

### Database Connection Issues
- Check your `DATABASE_URL` is correct
- Ensure SSL mode is enabled (`?sslmode=require`)
- Verify Neon project is active

### OAuth Not Working
- Check redirect URIs match exactly
- Verify `NEXTAUTH_URL` matches your domain
- Ensure `NEXTAUTH_SECRET` is set

### Build Errors
- Run `npm run db:generate` before building
- Check all environment variables are set in Vercel

## Free Tier Limits

- **Neon**: 0.5 GB storage, 1 project (free forever)
- **Vercel**: Unlimited deployments, 100 GB bandwidth/month
- **Google OAuth**: Free, unlimited requests

All services used are free tier compatible!

