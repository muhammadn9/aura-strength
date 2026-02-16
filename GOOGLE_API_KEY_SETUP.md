# 🚨 URGENT: Google AI API Key Missing

## Issue Found

The workout generation is failing because the **Google Generative AI API key is not configured**.

---

## Quick Fix Steps

### 1. Get Your Google AI API Key

1. Go to **[Google AI Studio](https://aistudio.google.com/app/apikey)**
2. Sign in with your Google account
3. Click **"Get API Key"** or **"Create API Key"**
4. Copy the API key (starts with `AIza...`)

---

### 2. Add to Local Environment

Add this line to your `.env.local` file:

```bash
GOOGLE_GENERATIVE_AI_API_KEY="your-api-key-here"
```

**Full `.env.local` should look like:**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://tzyjfgcasifincmfnerj.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Google AI (Gemini)
GOOGLE_GENERATIVE_AI_API_KEY="AIza..."

# Vercel (if using Vercel CLI)
VERCEL_OIDC_TOKEN="..."
```

---

### 3. Add to Vercel Production

**Option A: Using Vercel Dashboard**
1. Go to [Vercel Dashboard](https://vercel.com/muhammad-naseems-projects/aura-strength/settings/environment-variables)
2. Click **"Environment Variables"**
3. Add new variable:
   - **Key:** `GOOGLE_GENERATIVE_AI_API_KEY`
   - **Value:** `your-api-key-here`
   - **Environments:** Production, Preview, Development
4. Click **"Save"**
5. **Redeploy** your application

**Option B: Using Vercel CLI**
```bash
vercel env add GOOGLE_GENERATIVE_AI_API_KEY
# Paste your API key when prompted
# Select: Production, Preview, Development
```

---

### 4. Restart Development Server

```bash
npm run dev
```

---

### 5. Test the Fix

1. Go to your app
2. Navigate to "Generate Workout"
3. Select a workout type (e.g., "Push Day")
4. Click "Generate Workout"
5. ✅ Should now work!

---

## Why This Happened

The AI coach system requires the Google Gemini API to generate workouts. Without the API key:
- The `/api/coach` endpoint fails
- You see "Generation Failed" error
- Console shows authentication errors

---

## API Key Security

✅ **Safe:**
- Stored in environment variables
- Never committed to Git (`.env.local` is gitignored)
- Only accessible server-side

❌ **Never:**
- Commit API keys to GitHub
- Share keys publicly
- Use in client-side code

---

## Free Tier Limits

**Google AI Free Tier:**
- **15 requests per minute**
- **1,500 requests per day**
- **1 million tokens per day**

This is **more than enough** for development and initial users!

---

## After Setting Up

Once the key is configured:
1. ✅ Workout generation will work
2. ✅ AI coach will create personalized plans
3. ✅ Progressive overload recommendations
4. ✅ Context-aware suggestions

---

## Need Help?

1. **Can't get API key?** Check [Google AI Studio](https://aistudio.google.com/app/apikey)
2. **Key not working?** Make sure it starts with `AIza`
3. **Still failing?** Check browser console for detailed errors

---

**Once this is fixed, you're ready to start Phase 3!** 🚀

