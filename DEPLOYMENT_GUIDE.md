# Deployment Guide

## Recommended: Single Monorepo Deployment

Deploy both client and server together as one Vercel project. This is the best approach because:

✅ **Single domain** - No CORS issues  
✅ **Shared environment variables** - Easier management  
✅ **Simpler configuration** - One project to manage  
✅ **Better performance** - Same origin for API calls  
✅ **Cost effective** - One project instead of two

## Deployment Steps

### 1. Prepare Environment Variables

Before deploying, set all environment variables in Vercel:

**Required Variables:**

```
DB_HOST=your-db-host
DB_PORT=3306
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
JWT_SECRET=your-jwt-secret-64-chars
COOKIE_SECURE=true
CLIENT_URL=https://your-app.vercel.app
NODE_ENV=production
PORT=4000
NEXT_PUBLIC_API_URL=https://your-app.vercel.app/api
```

**Quick Setup:**

```bash
npm run vercel:env
```

### 2. Deploy to Vercel

#### Option A: Via Vercel CLI (Recommended)

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account/team)
# - Link to existing project? No (first time) or Yes (if updating)
# - Project name? tratics (or your preferred name)
# - Directory? ./
# - Override settings? No

# For production deployment
vercel --prod
```

#### Option B: Via GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click **"New Project"**
4. Import your repository
5. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./` (root)
   - **Build Command:** `npm run build:server && cd client && npm run build`
   - **Output Directory:** `client/.next`
   - **Install Command:** `npm install`
6. Add all environment variables
7. Click **"Deploy"**

### 3. Verify Deployment

After deployment, test:

1. **Frontend:** `https://your-app.vercel.app`
2. **API Health:** `https://your-app.vercel.app/api/health`
3. **API Docs:** `https://your-app.vercel.app/docs`
4. **Auth Endpoint:** `https://your-app.vercel.app/api/auth/login`

### 4. Update Database IP Whitelist

If your database has IP restrictions:

- Add Vercel's IP ranges (or use `%` for all IPs in development)
- Vercel functions use dynamic IPs, so you may need to allow all IPs

## How It Works

### Architecture

```
Vercel Deployment
├── Next.js Frontend (client/)
│   └── Served at: https://your-app.vercel.app/*
│
└── Express API (server/)
    └── Serverless function at: /api/index.ts
    └── Served at: https://your-app.vercel.app/api/*
```

### Request Flow

1. **Frontend requests** → Served by Next.js
2. **API requests** (`/api/*`) → Rewritten to `/api` serverless function
3. **Express app** → Handles all `/api/*` routes

### Build Process

1. Build server TypeScript → `server/dist/`
2. Build Next.js client → `client/.next/`
3. Vercel serves Next.js for frontend
4. Vercel serves `/api/index.ts` as serverless function

## Troubleshooting

### Build Fails

- Check that `npm run build:server` works locally
- Verify all dependencies are in `package.json`
- Check TypeScript compilation errors

### API Routes Not Working

- Verify `/api/index.ts` exists in root
- Check Vercel function logs in dashboard
- Ensure environment variables are set

### CORS Errors

- Verify `CLIENT_URL` matches your Vercel domain exactly
- Check that `credentials: true` is set in fetch requests
- Ensure cookies are being sent

### Database Connection Issues

- Verify all DB environment variables are set
- Check database allows connections from Vercel IPs
- Review Vercel function logs for connection errors

## Alternative: Separate Deployments

If you prefer separate deployments:

1. **Deploy Client:**
   - Create Vercel project for `client/` directory
   - Set `NEXT_PUBLIC_API_URL` to your server URL

2. **Deploy Server:**
   - Create Vercel project for `server/` directory
   - Use `/api/index.ts` as entry point
   - Configure CORS for client domain

**Not recommended** because:

- More complex CORS configuration
- Two domains to manage
- Higher cost (two projects)
- More environment variable management

## Post-Deployment Checklist

- [ ] Frontend loads correctly
- [ ] API health check works (`/api/health`)
- [ ] API documentation accessible (`/docs`)
- [ ] Registration works (`/api/auth/register`)
- [ ] Login works (`/api/auth/login`)
- [ ] Cookies are being set (check browser DevTools)
- [ ] Database connection successful
- [ ] Environment variables all set correctly

## Need Help?

- Check Vercel deployment logs
- Review function logs in Vercel dashboard
- Test endpoints with curl or Postman
- Verify environment variables are set correctly
