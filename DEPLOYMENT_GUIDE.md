# Food Delivery App Deployment Guide

## Overview

Your app has 3 components:

- **Backend** (Node.js + Express + PostgreSQL)
- **Frontend** (React - Customer app)
- **Admin** (React - Admin panel)
- **Delivery** (React - Delivery app)

## Option 1: Free Cloud Deployment (Recommended)

### 1. Database Setup - Neon (Free PostgreSQL)

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new database project
3. Copy the connection string (format: `postgresql://username:password@host/database`)
4. Update your `.env` file with the new database credentials

### 2. Backend Deployment - Railway/Render (Free)

#### Using Railway (Recommended):

1. Go to [railway.app](https://railway.app) and sign up with GitHub
2. Connect your GitHub repository
3. Deploy the `backend` folder
4. Add environment variables in Railway dashboard
5. Railway will provide a public URL

#### Using Render:

1. Go to [render.com](https://render.com) and sign up
2. Create a new "Web Service"
3. Connect your GitHub repo, select `backend` folder
4. Add environment variables
5. Deploy

### 3. Frontend Deployment - Vercel/Netlify (Free)

#### For all 3 React apps (Frontend, Admin, Delivery):

**Using Vercel:**

1. Go to [vercel.com](https://vercel.com) and sign up
2. Import your GitHub repository
3. Deploy each folder separately:
   - `frontend` → Customer app
   - `admin` → Admin panel
   - `delivery` → Delivery app
4. Update API endpoints to point to your deployed backend

**Using Netlify:**

1. Go to [netlify.com](https://netlify.com) and sign up
2. Drag and drop your built folders or connect GitHub
3. Deploy each React app separately

## Option 2: VPS Deployment (Paid but more control)

### Platforms:

- **DigitalOcean** ($6/month droplet)
- **Linode** ($5/month)
- **Vultr** ($6/month)
- **AWS EC2** (Free tier for 1 year)

### Setup Process:

1. Create Ubuntu server
2. Install Node.js, PostgreSQL, Nginx
3. Clone your repository
4. Set up environment variables
5. Configure Nginx as reverse proxy
6. Set up SSL with Let's Encrypt
7. Use PM2 for process management

## Option 3: Local Network Deployment

If you want to deploy locally for testing:

1. **Set up local PostgreSQL database**
2. **Run all components locally**
3. **Access via local network IP**

## Environment Variables Needed

Create `.env` files for each component:

### Backend (.env):

```
DB_USER=your_db_user
DB_HOST=your_db_host
DB_NAME=your_db_name
DB_PASSWORD=your_db_password
DB_PORT=5432
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
PORT=5000
```

### Frontend/Admin/Delivery:

Update API base URLs to point to your deployed backend.

## Database Migration

Since your database is offline, you'll need to:

1. **Export your current schema** (if you have it)
2. **Set up new cloud database**
3. **Run migration scripts**
4. **Import sample data**

## Build Commands

### Backend:

```bash
cd backend
npm install
npm start
```

### Frontend:

```bash
cd frontend
npm install
npm run build
```

### Admin:

```bash
cd admin
npm install
npm run build
```

### Delivery:

```bash
cd delivery
npm install
npm run build
```

## Post-Deployment Steps

1. **Test all endpoints**
2. **Verify database connections**
3. **Check CORS settings**
4. **Set up monitoring**
5. **Configure domain names** (optional)

## Troubleshooting

- **CORS errors**: Update backend CORS settings
- **Database connection**: Check environment variables
- **Build failures**: Check Node.js versions
- **API errors**: Verify endpoint URLs

## Cost Breakdown (Free Option)

- **Database**: Neon.tech (Free tier - 1GB)
- **Backend**: Railway/Render (Free tier - 500 hours/month)
- **Frontend**: Vercel/Netlify (Free tier - unlimited static hosting)
- **Images**: Cloudinary (Free tier - 25GB storage)

**Total: FREE** ✅

## Next Steps

Choose your preferred deployment method and I'll help you implement it step by step!
