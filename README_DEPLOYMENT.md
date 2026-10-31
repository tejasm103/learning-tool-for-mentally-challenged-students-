# MindVerse Inclusive Learning Lab — Production Deployment Guide
### Stack: Frontend on **Netlify**, Backend API on **Render**, Database on **MongoDB Atlas ("mango db")** or **Supabase (PostgreSQL)**

This guide provides complete, step-by-step instructions for deploying the entire MindVerse Inclusive Learning Lab platform to the production cloud with flexible database support.

---

## Architecture Overview

```
 ┌─────────────────────────┐               ┌─────────────────────────┐
 │   NETLIFY (Frontend)    │               │     RENDER (Backend)    │
 │   Global High-Speed CDN │               │     Python Flask API    │
 │                         │  /api/* Proxy │                         │
 │  • HTML / CSS / JS      ├──────────────►│  • REST API Endpoints   │
 │  • 3D Three.js Worlds   │  (No CORS     │  • Video Library Engine │
 │  • Web Audio / Bells    │   Issues!)    │  • Activity Workflow    │
 │  • Feedback System      │               │  • Teacher Verification │
 └─────────────────────────┘               └────────────┬────────────┘
                                                        │
                         ┌──────────────────────────────┴──────────────────────────────┐
                         │                                                             │
                         ▼                                                             ▼
            ┌─────────────────────────┐                                   ┌─────────────────────────┐
            │   MONGODB ATLAS         │                                   │   SUPABASE (PostgreSQL) │
            │   ("mango db" Cloud)    │                                   │   Relational Store      │
            │                         │                                   │                         │
            │  • Platform Feedback    │                                   │  • Relational Schema    │
            │    ("What to change?")  │                                   │  • Multi-table Queries  │
            │  • Synced Video Docs    │                                   │  • Session State        │
            │  • Activity Backups     │                                   │  • Fallback Store       │
            └─────────────────────────┘                                   └─────────────────────────┘
```

---

## Step 1A: Set Up MongoDB Atlas ("mango db")

MindVerse includes first-class support for **MongoDB Atlas** ("mango db").

1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign in (or register a free account).
2. Click **Create a Deployment** and select the **M0 FREE** shared cluster tier:
   - **Provider**: AWS or Google Cloud.
   - **Region**: Choose a region close to your Render deployment (e.g., `us-east-1` or `eu-central-1`).
   - **Name**: `Cluster0` (or `mindverse-cluster`).
   - Click **Create Deployment**.
3. **Set Up Security & Credentials**:
   - **Username**: e.g., `mindverse_admin`
   - **Password**: Click **Autogenerate Secure Password** or set your own (e.g. `MindVerseSafe2026!`). **Save this password!**
   - Click **Create Database User**.
4. **Configure Network Access**:
   - In the **Network Access** tab (under Security in the left sidebar), click **Add IP Address**.
   - Click **Allow Access from Anywhere** (`0.0.0.0/0`).
   - Click **Confirm** (Render web services use dynamic outbound IP addresses, so `0.0.0.0/0` is required).
5. **Get Connection String**:
   - Click **Database** in the left sidebar > click **Connect** on your cluster.
   - Choose **Drivers** > Driver: **Python**, Version: **3.12 or later**.
   - Copy the connection string:
     ```
     mongodb+srv://mindverse_admin:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
     ```
   - Replace `<password>` with your actual database user password.
6. When deploying to Render, set this string as the `MONGO_URI` environment variable!

---

## Step 1B: (Optional) Set Up Supabase (PostgreSQL)

If you also wish to connect Supabase as the primary relational database:
1. Go to [https://supabase.com](https://supabase.com) and sign in.
2. Click **New Project**:
   - **Name**: `mindverse-db`
   - **Database Password**: Choose a strong password and save it securely.
   - **Region**: Choose the region closest to your users or Render service (e.g. `US East / Oregon`).
   - Click **Create new project**.
3. Once the project finishes provisioning, go to **Project Settings > Database**.
4. Scroll to **Connection string > URI**:
   - Copy the URI:
     ```
     postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
     ```
   - Replace `[YOUR-PASSWORD]` with your actual password.
   - Set this as `DATABASE_URL` in Render.

---

## Step 2: Deploy Backend to Render

1. Push your repository to GitHub or GitLab.
2. Sign in to your [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** > **Web Service**.
4. Connect your MindVerse repository.
5. Fill in the service configuration:
   - **Name**: `mindverse-learning-lab`
   - **Environment**: `Python 3`
   - **Region**: `Oregon` (or matching your database)
   - **Branch**: `main`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn "backend.app:create_app()" --bind 0.0.0.0:$PORT`
   - **Plan**: Free
6. Under **Environment Variables**, add:
   | Key | Value | Purpose |
   |---|---|---|
   | `MONGO_URI` | `mongodb+srv://mindverse_admin:<password>@cluster0...` | **MongoDB Atlas connection** |
   | `MONGO_DB_NAME` | `mindverse` | Database name |
   | `DATABASE_URL` | *(Optional Supabase PostgreSQL URI)* | Supabase / PostgreSQL |
   | `SECRET_KEY` | *(Click generate or type strong secret)* | Cookie & session security |
   | `PYTHON_VERSION` | `3.11.8` | Standard runtime |
   | `FLASK_ENV` | `production` | Production mode |
7. Click **Create Web Service**.
8. Render will build and deploy your service, assigning a live URL:
   `https://mindverse-learning-lab.onrender.com`
9. Test the health endpoint in your browser:
   `https://mindverse-learning-lab.onrender.com/api/health`
   Returns:
   ```json
   {
     "status": "healthy",
     "platform": "MindVerse Inclusive Learning Lab",
     "version": "2.2.0",
     "primary_db": "SQLite",
     "mongodb_connected": true,
     "modules": ["auth", "curriculum", "games", "videos", "activities", "progress", "teacher", "caregiver", "mindbot", "feedback"]
   }
   ```

---

## Step 3: Deploy Frontend to Netlify

1. Sign in to your [Netlify Dashboard](https://app.netlify.com/).
2. Click **Add new site** > **Import an existing project**.
3. Select your GitHub repository.
4. Netlify will read the included `netlify.toml`:
   - **Publish directory**: `frontend`
5. Open `netlify.toml` in your repository and ensure the redirect points to your actual Render backend URL:
   ```toml
   [[redirects]]
     from = "/api/*"
     to = "https://mindverse-learning-lab.onrender.com/api/:splat"
     status = 200
     force = true
   ```
6. Click **Deploy Site**.
7. Netlify gives you your live global URL (e.g. `https://mindverse-inclusive-lab.netlify.app`).

---

## Step 4: Community Feedback System ("💡 What Should We Change?")

Users, students, caregivers, and teachers can submit ideas and suggestions on what to improve:
- **Floating Button**: On every page, an accessible button says: `💡 What Should We Change?`.
- **Feedback Modal**:
  - Lets users choose a category (Teaching Sound, Curriculum, Videos/Shorts, 3D Worlds, Games, Accessibility).
  - Rate experience (1–5 stars).
  - Type what they want changed (e.g. "Speak slower during phonics", "Add more animals").
  - Identifies role (Student, Teacher, Caregiver, Visitor).
- **Storage**:
  - Saved immediately to the primary database.
  - Automatically synced to MongoDB Atlas collection `feedback`.
- **Educator Management**:
  - Teachers and administrators can view all suggestions in the **Teacher Portal** (`teacher_dashboard.html`), track community needs, and update status (`Received`, `Reviewed`, `Planned`, `Implemented`).

---

## Teaching Sounds & Audio Verification

MindVerse includes an enhanced **Speech Synthesis and Web Audio Module** (`frontend/js/speech.js`) with:
* **Autoplay Policy Auto-Unlock**: Browser audio unlocks automatically on any user click, tap, or keypress.
* **1-Click Test Button**: Every page includes a floating `🔊 Test Teacher Sound` button in the bottom-right corner.
* **Procedural Sounds**: Web Audio API generates classroom bells, teacher chimes, success fanfares, star sweeps, and gentle try-again cues even if the browser does not have external audio files.

---

## Default Accounts Seeded in Database

| Role | Username | Password | Purpose |
|---|---|---|---|
| **Student** | `aarav` | `student123` | Learner with active IEP and video activities |
| **Teacher** | `teacher` | `teacher123` | Educator managing review queue & report cards |
| **Caregiver** | `caregiver` | `parent123` | Family member tracking daily progress |
| **Admin** | `admin` | `admin123` | Platform & system administrator |
