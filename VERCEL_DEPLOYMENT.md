# 🚀 VERCEL DEPLOYMENT GUIDE

## ✅ Files Created (SAFE - Your code untouched):

- `vercel.json` - Vercel configuration
- `.vercelignore` - Files to ignore during deployment
- `api/` folder - Serverless functions (optional)

---

## 📋 DEPLOYMENT OPTIONS:

### **Option 1: Frontend Only (RECOMMENDED & EASIEST)**

**What gets deployed:** React frontend only
**Backend:** Stays on your current server (Render/Railway)
**Best for:** Quick deployment, minimal changes

#### Steps:

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push
   ```

2. **Deploy to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repo
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Click "Deploy"

3. **Set Environment Variables in Vercel**
   Go to Project Settings → Environment Variables:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   VITE_SUPABASE_URL=https://gdqsnkmhoyutyaynkyav.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_YjpPvL5McrPk0Dvn4S2KLQ_SJsjkdgg
   VITE_GEMINI_API_KEY=AIzaSyCwHvlanIaqtVM2H2FLfv0HEpWWZsAyPL8
   ```

4. **Deploy Backend to Render (FREE)**
   - Go to https://render.com
   - New Web Service
   - Connect your GitHub repo
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Add environment variables:
     ```
     SUPABASE_URL=https://gdqsnkmhoyutyaynkyav.supabase.co
     SUPABASE_ANON_KEY=sb_publishable_YjpPvL5McrPk0Dvn4S2KLQ_SJsjkdgg
     GEMINI_API_KEY=AIzaSyCwHvlanIaqtVM2H2FLfv0HEpWWZsAyPL8
     JWT_SECRET=your-secret-key
     PORT=5000
     ```

---

### **Option 2: Full Stack on Vercel (Advanced)**

**What gets deployed:** Frontend + Backend API routes
**Best for:** Everything in one place

#### Additional Steps:

1. **Install Vercel dependencies**
   ```bash
   npm install -D @vercel/node
   npm install jsonwebtoken bcryptjs
   ```

2. **Copy API routes to `api/` folder**
   - Convert each Express route to serverless function
   - See `api/auth.ts` for example

3. **Deploy to Vercel**
   - Same as Option 1
   - Vercel automatically detects `api/` folder

---

## 🎯 **RECOMMENDED: Option 1 (Frontend on Vercel + Backend on Render)**

**Why?**
- ✅ Easiest setup
- ✅ No code changes needed
- ✅ Your backend stays exactly as-is
- ✅ Both platforms are FREE
- ✅ Always active (no spin down)

---

## 🔧 Environment Variables Needed:

### **Frontend (Vercel):**
```
VITE_API_URL=<your-backend-url>/api
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-key>
VITE_GEMINI_API_KEY=<your-gemini-key>
```

### **Backend (Render):**
```
SUPABASE_URL=<your-supabase-url>
SUPABASE_ANON_KEY=<your-supabase-key>
GEMINI_API_KEY=<your-gemini-key>
JWT_SECRET=any-secret-string
PORT=5000
ALLOWED_ORIGINS=https://your-app.vercel.app
```

---

## 🌐 After Deployment:

**Your app will be accessible at:**
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-api.onrender.com/api`

**Features working:**
- ✅ Login/Register
- ✅ Admin Dashboard
- ✅ Volunteer Dashboard
- ✅ Data Ingestion (Forms, WhatsApp, OCR, Google Forms)
- ✅ AI Matching Engine
- ✅ Real-time Updates
- ✅ All AI features

---

## ❓ Need Help?

1. Check Vercel logs: Project → Logs
2. Check Render logs: Dashboard → Logs
3. Test API: `https://your-api.onrender.com/api/health`

---

## 🎉 That's it! Your CORTEX app is now live!
