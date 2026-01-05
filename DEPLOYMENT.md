# Deployment Guide - Vercel

## ✅ Pre-Deployment Checklist

- [x] Dependencies installed
- [x] Database schema pushed
- [x] Environment variables configured
- [x] Prisma client generated

## 🚀 Deploy to Vercel

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - StartupSwipe with backend"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"New Project"**
3. Import your GitHub repository
4. Vercel will auto-detect Next.js

### Step 3: Add Environment Variables in Vercel

In the Vercel project settings, add these environment variables:

```
DATABASE_URL=your-neon-database-connection-string

NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-here

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Note:** Get these values from your `.env` file. Do NOT commit your `.env` file to GitHub.

**Important:** 
- Replace `https://your-project.vercel.app` with your actual Vercel domain after first deployment
- You can find your domain in Vercel dashboard after deployment

### Step 4: Update Google OAuth Redirect URI

After deployment, update your Google OAuth settings:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Go to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Add authorized redirect URI:
   ```
   https://your-project.vercel.app/api/auth/callback/google
   ```
5. Save

### Step 5: Deploy!

Click **"Deploy"** in Vercel. The build will:
- Install dependencies
- Generate Prisma Client
- Build Next.js app
- Deploy to production

## 🔧 Build Settings (Auto-configured)

Vercel will automatically:
- Detect Next.js framework
- Run `npm install`
- Run `npm run build`
- Deploy to edge network

## ✅ Post-Deployment

1. **Test the app**: Visit your Vercel URL
2. **Test Google Sign-In**: Click "Be a Seed" and sign in
3. **Test Startup Submission**: Submit a test startup
4. **Test Voting**: Vote on startups

## 🐛 Troubleshooting

### Build Fails
- Check that all environment variables are set in Vercel
- Ensure `DATABASE_URL` is correct
- Check build logs in Vercel dashboard

### OAuth Not Working
- Verify redirect URI matches exactly in Google Console
- Check `NEXTAUTH_URL` matches your Vercel domain
- Ensure `NEXTAUTH_SECRET` is set

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check Neon database is active
- Ensure SSL mode is enabled (`sslmode=require`)

## 📝 Notes

- Your `.env` file is already in `.gitignore` (safe to commit)
- Database migrations run automatically on Vercel
- Prisma Client is generated during build
- All free tier services are used (Vercel, Neon, Google OAuth)

