# 🚀 Vercel Deployment - Quick Guide

Your code is now on GitHub: https://github.com/INTHEDARKK/startupswipe

## Step-by-Step Vercel Deployment

### 1. Go to Vercel
Visit [vercel.com](https://vercel.com) and sign in with GitHub

### 2. Import Your Repository
1. Click **"New Project"**
2. Find **"startupswipe"** in your repositories
3. Click **"Import"**

### 3. Configure Environment Variables

**Before deploying**, click **"Environment Variables"** and add these:

```
DATABASE_URL
```
Value: Get from your `.env` file (your Neon database connection string)

```
NEXTAUTH_URL
```
Value: `https://your-project.vercel.app` (Vercel will show your domain after first deploy - update this after)

```
NEXTAUTH_SECRET
```
Value: Get from your `.env` file

```
GOOGLE_CLIENT_ID
```
Value: Get from your `.env` file

```
GOOGLE_CLIENT_SECRET
```
Value: Get from your `.env` file

**Important:** All these values are in your local `.env` file. Copy them exactly as they appear there.

### 4. Deploy!
1. Click **"Deploy"**
2. Wait for build to complete (2-3 minutes)
3. Copy your deployment URL (e.g., `https://startupswipe-xyz.vercel.app`)

### 5. Update NEXTAUTH_URL
1. Go to **Settings** → **Environment Variables**
2. Edit `NEXTAUTH_URL` with your actual Vercel domain
3. Redeploy (or it will auto-redeploy)

### 6. Update Google OAuth Redirect URI
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** → **Credentials**
3. Click your OAuth 2.0 Client ID
4. Add redirect URI: `https://your-actual-vercel-domain.vercel.app/api/auth/callback/google`
5. Save

### 7. Test Your App!
Visit your Vercel URL and test:
- ✅ Home page loads
- ✅ Sign in with Google works
- ✅ Submit a startup
- ✅ Vote on startups

## ✅ You're Live!

Your StartupSwipe app is now deployed and ready to use!

## 🔗 Quick Links
- **GitHub**: https://github.com/INTHEDARKK/startupswipe
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Google Cloud Console**: https://console.cloud.google.com/

