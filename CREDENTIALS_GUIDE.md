# 🔑 Complete Credentials Guide for Vercel Deployment

## ✅ Found Credentials

### 1. Google Apps Script URL ✅

**Found in your Google Apps Script project: "Metro work Project"**

```
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/AKfycbzY1SDzboOAGMPOhXPafZ0Ru8vxBy0FnbFisTFALuHmbKsvUZDBT2ktT4R4o-AotWxK/exec
```

![Google Apps Script Deployment](/Users/shashishekharmishra/.gemini/antigravity/brain/223fcf17-3794-4a1b-a6f9-d413fd214b2b/google_script_deployment_1768223874481.png)

**Status:** ✅ **Ready to use**

---

### 2. Gemini API Key ✅

**From your `.env.example` file:**

```
VITE_GEMINI_API_KEY=AIzaSyChaQzjOaJqK9oz5OsmpCtWbTVpgdWDKxQ
```

> [!WARNING]
> This API key is visible in your public repository. For production use, consider getting a new API key from [Google AI Studio](https://makersuite.google.com/app/apikey) and keeping it private.

**Status:** ✅ **Ready to use** (but consider replacing for security)

---

### 3. Supabase Credentials ⏳

**You need to log in to Supabase to get these values.**

![Supabase Login Page](/Users/shashishekharmishra/.gemini/antigravity/brain/223fcf17-3794-4a1b-a6f9-d413fd214b2b/supabase_signin_page_1768223508279.png)

#### How to Get Your Supabase Credentials:

1. **Go to:** https://supabase.com/dashboard
2. **Log in** with your account (GitHub or email)
3. **Select your project** (or create a new one if you don't have one)
4. **Navigate to:** Settings (⚙️) → **API**
5. **Copy these values:**
   - **Project URL** → This is your `VITE_SUPABASE_URL`
   - **anon public** key → This is your `VITE_SUPABASE_ANON_KEY`

**Status:** ⏳ **Waiting for you to log in and retrieve**

---

## 📋 Complete Environment Variables List

Once you have your Supabase credentials, here's the complete list to add to Vercel:

### Required Variables:

```bash
# Google Apps Script (✅ Found)
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/AKfycbzY1SDzboOAGMPOhXPafZ0Ru8vxBy0FnbFisTFALuHmbKsvUZDBT2ktT4R4o-AotWxK/exec

# Gemini API (✅ Found)
VITE_GEMINI_API_KEY=AIzaSyChaQzjOaJqK9oz5OsmpCtWbTVpgdWDKxQ

# Supabase (⏳ You need to get these)
VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL_HERE
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY_HERE
```

### 2. Google Integration (PRD 2.0)
- **Web App URL (Backend):** `https://script.google.com/macros/s/AKfycbwC9YmAmXzwjkGAexhKfYW9_cE2XrXUtvRaxAwG_4Y0IHNCnBkxO8GjgkwWCwa6mwbU/exec`
- **Spreadsheet URL (Data Source):** `https://script.google.com/macros/s/AKfycbw5cLHYrXQP9mTrG3dviblQhjobZQBgHop1pm7w-oxv8i_WeSy8rxADngoPSBM4uNrS/exec`
- **Google Drive Folder ID:** `1PBlW6ih36BSt47Ex4j4vb2Et-7XnGvX7`
- **Shared Drive Folder:** `https://drive.google.com/drive/folders/1PBlW6ih36BSt47Ex4j4vb2Et-7XnGvX7?usp=sharing`

> **Note:** These URLs are configured in `src/config.js` AND configurable at runtime via the **Admin Panel > System Config** tab.

### Optional Variables (with defaults):

```bash
VITE_GOOGLE_SHEET_ID=1fUHu5fb5Z77Aq4cAiK4Zybq-Dpgjf0xlzEDsxIgT9m8
VITE_GOOGLE_DRIVE_FOLDER_ID=1PBlW6ih36BSt47Ex4j4vb2Et-7XnGvX7
VITE_SESSION_TIMEOUT=3600000
VITE_MAX_FILE_SIZE=10485760
VITE_TRAIN_MODEL_URL=https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/ToyCar/glTF-Binary/ToyCar.glb
```

---

## 🚀 Step-by-Step: Add to Vercel

### Step 1: Get Supabase Credentials

1. Open https://supabase.com/dashboard in a new tab
2. Log in to your account
3. Select your project
4. Go to **Settings** → **API**
5. Copy the **Project URL** and **anon public** key

### Step 2: Add Variables to Vercel

1. Go to https://vercel.com/dashboard
2. Click on **beml-metro-app** project
3. Go to **Settings** → **Environment Variables**
4. For each variable below, click **Add New**:

| Variable Name | Value | Environments |
|---------------|-------|--------------|
| `VITE_GOOGLE_SCRIPT_URL` | `https://script.google.com/macros/s/AKfycbzY1SDzboOAGMPOhXPafZ0Ru8vxBy0FnbFisTFALuHmbKsvUZDBT2ktT4R4o-AotWxK/exec` | ✅ Production, ✅ Preview, ✅ Development |
| `VITE_GEMINI_API_KEY` | `AIzaSyChaQzjOaJqK9oz5OsmpCtWbTVpgdWDKxQ` | ✅ Production, ✅ Preview, ✅ Development |
| `VITE_SUPABASE_URL` | *Your Supabase Project URL* | ✅ Production, ✅ Preview, ✅ Development |
| `VITE_SUPABASE_ANON_KEY` | *Your Supabase Anon Key* | ✅ Production, ✅ Preview, ✅ Development |

> [!IMPORTANT]
> Make sure to select **all three environments** for each variable!

### Step 3: Redeploy

1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Wait ~30 seconds for the build to complete
4. Visit https://beml-metro-app.vercel.app

---

## ✅ Verification Checklist

After adding all variables and redeploying:

- [ ] No blank page on https://beml-metro-app.vercel.app
- [ ] App loads with the BEML Metro interface
- [ ] No console errors about missing environment variables
- [ ] Supabase connection works (no "supabaseUrl is required" error)

---

## 🆘 Need Help?

### If you don't have a Supabase project:

1. Go to https://supabase.com
2. Click **Start your project**
3. Create a new project (it's free)
4. Wait for the project to be created (~2 minutes)
5. Follow the steps above to get your credentials

### If you need a new Gemini API key:

1. Go to https://makersuite.google.com/app/apikey
2. Click **Create API key**
3. Copy the new key
4. Replace the value in Vercel

---

## 📊 Summary

| Credential | Status | Action Required |
|------------|--------|-----------------|
| Google Apps Script URL | ✅ Found | Copy to Vercel |
| Gemini API Key | ✅ Found | Copy to Vercel (consider replacing) |
| Supabase URL | ⏳ Pending | Log in to Supabase and retrieve |
| Supabase Anon Key | ⏳ Pending | Log in to Supabase and retrieve |

**Next Step:** Log in to Supabase to get your credentials, then add all 4 variables to Vercel and redeploy! 🚀
