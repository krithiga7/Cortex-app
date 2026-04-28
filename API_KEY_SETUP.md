# 🔑 API Key Setup Guide

## ⚠️ Current Status: **Fallback Mode Active**

Your app is currently running in **fallback mode** because the Gemini API key is invalid. This means:
- ✅ **App still works** - All features functional
- ✅ **Matching engine works** - Uses deterministic algorithm
- ✅ **Database works** - Firebase integration ready
- ✅ **Map works** - Chennai map fully functional
- ⚠️ **AI features limited** - Using smart mock responses instead of real AI

---

## 🎯 Quick Fix: Get Free Gemini API Key (5 minutes)

### **Step 1: Get API Key**

1. **Go to:** https://makersuite.google.com/app/apikey
2. **Sign in** with your Google account (Gmail)
3. **Click "Create API Key"** button
4. **Copy the key** - it looks like: `AIzaSyAxxxxxxxxxxxxxxxxxxxxxxxxxxx`
5. **Important:** The key you had before was incomplete/truncated

### **Step 2: Add to Project**

1. **Open file:** `.env` (in project root)
2. **Paste your key:**

```env
VITE_GEMINI_API_KEY=AIzaSyAxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

3. **Save the file**

### **Step 3: Restart Server**

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### **Step 4: Verify**

1. Open browser console (F12)
2. You should **NOT** see the warning: "⚠️ Gemini API key not configured"
3. Submit a form in Data Ingestion
4. Check console - should see AI processing logs

---

## 🆓 Gemini API - Completely FREE!

- ✅ **Free tier:** 60 requests/minute
- ✅ **Free tier:** 1,500 requests/day
- ✅ **No credit card required**
- ✅ **Perfect for development**
- ✅ **Generous limits**

**This is more than enough for your crisis response app!**

---

## 🔧 Alternative: Continue Without API Key

If you don't want to get an API key right now, **the app still works perfectly!**

### **What Works Without API Key:**

| Feature | Status | How It Works |
|---------|--------|--------------|
| **Chennai Map** | ✅ Full | Real map, real coordinates |
| **Volunteer Matching** | ✅ Full | Deterministic algorithm (accurate!) |
| **Data Ingestion** | ✅ Full | Form submission works |
| **Priority Scoring** | ⚠️ Mock | Smart fallback scores |
| **Data Parsing** | ⚠️ Mock | Smart fallback responses |
| **Firebase DB** | ✅ Full | Database storage works |

### **What's Limited:**

- AI-powered priority calculations (uses smart defaults)
- Natural language understanding (uses pattern matching)
- Smart document analysis (uses templates)

**Bottom line: The app is fully functional, just not "AI-powered" until you add the key.**

---

## 📝 Complete .env File Example

Here's what your `.env` file should look like:

```env
# Gemini AI API Key
VITE_GEMINI_API_KEY=AIzaSyB1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p

# Firebase Configuration (Optional)
VITE_FIREBASE_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=my-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=my-project-id
VITE_FIREBASE_STORAGE_BUCKET=my-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

---

## 🔒 Security Best Practices

### **✅ DO:**
- Store API keys in `.env` file
- Add `.env` to `.gitignore`
- Use environment variables
- Keep keys private

### **❌ DON'T:**
- Commit `.env` to Git
- Share API keys publicly
- Hardcode keys in source code
- Post keys in chat/forums

**Your `.env` file is already in `.gitignore` - you're safe!**

---

## 🚀 Testing After Setup

### **Test 1: Check Console**
```javascript
// Open browser console (F12)
// You should see:
✅ Gemini AI service initialized
✅ API key configured
```

### **Test 2: Submit Form**
1. Go to Data Ingestion
2. Fill out form
3. Submit
4. Check console for AI processing logs

### **Test 3: Check Priority Score**
1. Submit a Medical request
2. Look at priority score
3. Should be calculated by AI (not fallback)

---

## ❓ Troubleshooting

### **"API key not valid" error**

**Problem:** Your API key is invalid or truncated

**Solution:**
1. Go back to https://makersuite.google.com/app/apikey
2. **Delete** the old key
3. **Create a new key**
4. **Copy the ENTIRE key** (should be ~40 characters)
5. Paste in `.env`
6. Restart server

### **"403 Forbidden" error**

**Problem:** API key doesn't have permission

**Solution:**
1. Go to Google Cloud Console
2. Enable "Generative Language API"
3. Wait 2 minutes
4. Try again

### **App not picking up .env changes**

**Problem:** Server needs restart

**Solution:**
```bash
# Stop server (Ctrl+C)
# Delete cache
rm -rf node_modules/.vite
# Restart
npm run dev
```

---

## 🎉 After Setup

Once you add a valid API key:

1. ✅ **AI priority scoring** - Real-time intelligent calculations
2. ✅ **Smart data parsing** - Understands natural language
3. ✅ **Document analysis** - OCR + AI understanding
4. ✅ **Voice processing** - Transcription + intent extraction
5. ✅ **Image understanding** - Vision capabilities

**Your crisis response engine becomes fully AI-powered!** 🚀

---

## 📞 Need Help?

If you're stuck:

1. **Check console logs** - They show what's happening
2. **Verify API key** - Make sure it's complete (~40 chars)
3. **Restart server** - Always restart after .env changes
4. **Check .env syntax** - No spaces around `=` sign

**Example of correct syntax:**
```env
✅ VITE_GEMINI_API_KEY=AIzaSyB...
❌ VITE_GEMINI_API_KEY = AIzaSyB...  (no spaces!)
```

---

## 🎯 Summary

**Right now:**
- ✅ App works in fallback mode
- ✅ All core features functional
- ⚠️ AI features use smart defaults

**After adding API key:**
- ✅ Everything works with real AI
- ✅ Intelligent priority scoring
- ✅ Smart data understanding
- ✅ Full AI capabilities

**Getting an API key takes 5 minutes and is completely FREE!** 🎉
