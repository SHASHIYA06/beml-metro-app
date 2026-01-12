# Deployment Guide — BEML Metro Operations Platform

## Overview
This guide covers running locally and deploying to Vercel / Netlify and setting up Supabase and Google Apps Script.

## Prerequisites
- Node 18+ and npm
- A Supabase project (for realtime, backup, embeddings)
- Google account with Google Sheets & Drive access for the Apps Script backend
- Vercel or Netlify account for deployment

## Local setup
1. Copy `.env.example` to `.env` and fill values.
2. Install: `npm install`
3. Run dev server: `npm run dev` (default port 3000 as configured)

## Google Apps Script
1. Open `gapps/Code.gs` as a new project in Google Apps Script.
2. Deploy -> New deployment -> Web app -> Execute as: Me, Who has access: Anyone.
3. Copy the Web App URL and set `VITE_GOOGLE_SCRIPT_URL` in `.env` / deployment env.

## 3D Train model
**Option A (applied):** The project is configured to use a CDN-hosted model by default via the `VITE_TRAIN_MODEL_URL` environment variable. If set, the app will load the GLB from the CDN; otherwise a small sample GLB (ToyCar sample from Khronos) is used as a placeholder.

**How to switch to Option B (embed model in repo):** place a low-poly glTF/GLB at `public/models/train.glb`. The app will fallback to this local file if `VITE_TRAIN_MODEL_URL` is not set.

Set optional env variable `VITE_TRAIN_MODEL_URL` to override the model path (e.g., `https://cdn.example.com/models/train.glb`). If you'd like me to commit a permissive-licensed model into `public/models/train.glb` (Option B), say so and I will add it and include proper attribution.

## Supabase setup
1. Go to your Supabase project SQL editor and run `db/supabase_schema.sql`.
2. Enable `vector` (pgvector) extension via SQL if available.
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in env.

## Deploy to Vercel
Option 1 (recommended, easiest):
1. Go to https://vercel.com and import this GitHub repository.
2. In Vercel Project Settings, set environment variables (same keys as `.env`).
3. Vercel will build on every push; for production deploys push to `main`.

Option 2 (automatic via GitHub Actions):
1. Create a Vercel Personal Token in https://vercel.com/account/tokens and get your `VERCEL_TOKEN`.
2. From the Vercel project settings, get `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`.
3. In your GitHub repo, add repository secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
4. The included workflow `.github/workflows/vercel_deploy.yml` will run on pushes to `main` and deploy to Vercel using those secrets.

If you'd like, I can help set this up or prepare the Vercel project if you give me a deploy token & repo push access — otherwise, push the repo changes locally and then connect the project in Vercel.
## Deploy to Netlify
1. Connect repo in Netlify and use `npm run build` with `dist` as publish directory.
2. Add environment variables in Site settings.

## Deploy to GitHub Pages (automatic)
This repository includes a GitHub Actions workflow that will build the Vite app and publish the `dist` output to GitHub Pages on every push to `main`.

How it works:
- On push to `main`, `deploy_pages.yml` will run `npm ci` and `npm run build`, upload `dist` and deploy via the official `actions/deploy-pages` action.
- No extra secrets are required; the workflow uses `GITHUB_TOKEN` to publish.

After the first successful run, your site will be available at `https://<your-github-username>.github.io/<repo-name>/` (for a user/org site, or via the Pages URL shown in the repo Pages settings).

Notes:
- If you'd like a custom domain, add it in the Pages settings.
- If the workflow fails due to package or build errors, share the Actions log and I will debug and fix the issues.

## Notes
- Do not commit `.env` with secrets.
- For RAG embeddings, configure Supabase Vector DB and upload embeddings.
- If you want me to deploy a demo, give me permission or invite a service account/enable deployment integration.

