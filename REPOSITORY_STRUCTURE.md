# 📁 Repository Structure - Complete Overview

This document lists all files in the repository and their purpose.

## 🎯 Core Application Files

### Frontend (Next.js App Router)
- `app/layout.tsx` - Root layout with providers
- `app/page.tsx` - Main page component
- `app/globals.css` - Global styles (moved from style.css)
- `app/providers.tsx` - NextAuth session provider

### Components
- `components/StartupSwipe.tsx` - Main client component with all UI

### Public Assets
- `public/api-integrated-script.js` - Client-side JavaScript (API integration)

## 🔌 API Routes (Backend)

### Authentication
- `app/api/auth/[...nextauth]/route.ts` - NextAuth handler (Google OAuth)

### Data APIs
- `app/api/startups/route.ts` - GET (all startups) / POST (create startup)
- `app/api/vote/route.ts` - POST (submit vote)
- `app/api/user/route.ts` - GET (current user info)

## 🗄️ Database

- `prisma/schema.prisma` - Database schema (User, Startup, Vote models)
- `lib/prisma.ts` - Prisma client singleton
- `lib/auth.ts` - NextAuth configuration

## ⚙️ Configuration

- `package.json` - Dependencies and scripts
- `package-lock.json` - Locked dependency versions
- `next.config.js` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `vercel.json` - Vercel deployment configuration
- `.gitignore` - Git ignore rules (excludes .env, node_modules, etc.)

## 📝 Type Definitions

- `types/next-auth.d.ts` - NextAuth TypeScript types

## 📚 Documentation

- `README.md` - Setup and installation guide
- `DEPLOYMENT.md` - Deployment instructions
- `VERCEL_DEPLOYMENT.md` - Quick Vercel deployment guide
- `CHANGES.md` - List of changes made
- `SETUP_COMPLETE.md` - Setup completion summary
- `REPOSITORY_STRUCTURE.md` - This file

## 🗂️ Legacy Files (Kept for Reference)

- `index.html` - Original HTML (now in components)
- `script.js` - Original script (now in public/api-integrated-script.js)
- `style.css` - Original styles (now in app/globals.css)

## 🚫 Excluded Files (Not in Repository)

- `.env` - Environment variables (contains secrets)
- `node_modules/` - Dependencies (installed via npm)
- `.next/` - Next.js build output
- `.vercel/` - Vercel deployment cache

## ✅ Vercel Deployment Ready

All files are committed and ready for Vercel:
- ✅ Next.js App Router structure
- ✅ API routes configured
- ✅ Prisma schema ready
- ✅ Build scripts optimized
- ✅ Environment variables documented

## 🔄 Auto-Deploy on Push

When you push to GitHub, Vercel will:
1. Detect Next.js framework
2. Run `npm install` (includes `postinstall: prisma generate`)
3. Run `npm run build` (generates Prisma client + builds Next.js)
4. Deploy to production

