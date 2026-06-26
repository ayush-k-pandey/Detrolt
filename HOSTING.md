# DETROLT — COMPLETE HOSTING GUIDE
# Author: Ayush Pandey | VIT Chennai | 24BCE5299
# ================================================================
# This guide hosts Detrolt on Render.com (FREE) with MongoDB Atlas (FREE)
# Total time: ~20 minutes
# ================================================================


# ================================================================
# STEP 1 — SET UP MONGODB ATLAS (your cloud database)
# ================================================================

1. Go to https://www.mongodb.com/atlas and sign in

2. You should already have a cluster called "detrolt-cluster"
   If not, click "Create" → choose FREE (M0) → any region → Create

3. LEFT SIDEBAR → "Database Access"
   → Click "Add New Database User"
   → Username: detrolt
   → Click "Autogenerate Secure Password" → COPY AND SAVE IT
   → Role: Atlas Admin
   → Click "Add User"

4. LEFT SIDEBAR → "Network Access"
   → Click "Add IP Address"
   → Click "Allow Access from Anywhere" (adds 0.0.0.0/0)
   → Click "Confirm"
   (This lets Render connect to your database)

5. LEFT SIDEBAR → "Database"
   → Click green "Connect" button on your cluster
   → Click "Drivers"
   → Driver: Python | Version: 3.12 or later
   → Copy the connection string. It looks like:
     mongodb+srv://detrolt:<password>@detrolt-cluster.lb88vjm.mongodb.net/

6. Build your final MongoDB URL:
   → Replace <password> with your actual password
   → Add "detrolt" at the end after the /
   
   FINAL URL LOOKS LIKE:
   mongodb+srv://detrolt:YOURPASSWORD@detrolt-cluster.lb88vjm.mongodb.net/detrolt

   YOUR URL (fill in your password):
   mongodb+srv://ayush2006pandey11_db_user:YOURPASSWORD@detrolt-cluster.lb88vjm.mongodb.net/detrolt

   SAVE THIS — you need it in Step 3


# ================================================================
# STEP 2 — PUSH CODE TO GITHUB
# ================================================================

Open terminal and run these commands ONE BY ONE:

# Go into your project folder
cd ~/Desktop/Detrolt

# Remove any old git setup
rm -rf .git

# Initialize fresh
git init
git branch -m main

# Stage everything
git add .

# First commit
git commit -m "Detrolt v1 — final production ready"

# Connect to your GitHub repo
git remote add origin https://github.com/ayush-k-pandey/Detrolt.git

# Push (will ask for GitHub username and token)
git push -f origin main

NOTE: GitHub needs a Personal Access Token as password:
  → github.com → Profile → Settings → Developer Settings
  → Personal Access Tokens → Tokens (classic)
  → Generate new token → check "repo" box → Generate
  → Copy token → use as password when git asks

After push, go to https://github.com/ayush-k-pandey/Detrolt
You MUST see these at root level:
  backend/
  frontend/
  .gitignore
  HOSTING.md

If you see a subfolder instead, run:
  mv subfoldername/* .
  mv subfoldername/.gitignore . 2>/dev/null
  rm -rf subfoldername
  git add . && git commit -m "Fix structure" && git push -f origin main


# ================================================================
# STEP 3 — DEPLOY ON RENDER
# ================================================================

1. Go to https://render.com → sign in or create account

2. Click "New +" → "Web Service"

3. Click "Connect account" → connect your GitHub

4. Find "Detrolt" repo → click "Connect"

5. Fill in these settings EXACTLY:

   Name:           detrolt
   Region:         Singapore (nearest to India)
   Branch:         main
   Root Directory: backend
   Runtime:        Python 3
   
   Build Command (copy this EXACTLY — it's one long line):
   pip install -r requirements.txt && cd ../frontend && npm install && npm run build && cd ../backend && mkdir -p static && cp -r ../frontend/dist/* static/
   
   Start Command:
   uvicorn main:app --host 0.0.0.0 --port $PORT
   
   Instance Type: Free

6. Scroll down to "Environment Variables"
   Click "Add Environment Variable" for each one:

   KEY                  VALUE
   ---                  -----
   MONGODB_URL          mongodb+srv://ayush2006pandey11_db_user:YOURPASSWORD@detrolt-cluster.lb88vjm.mongodb.net/detrolt
   DB_NAME              detrolt
   SECRET_KEY           detrolt2024xK9pM2nR7qL5jW8vT3hBnQ
   ALGORITHM            HS256
   TOKEN_EXPIRE_DAYS    7

7. Click "Create Web Service"

8. Watch the build logs — takes 3-5 minutes
   You will see lines like:
   ==> Installing Python dependencies...
   ==> Building React frontend...
   ==> Copying frontend build...
   ==> Your service is live 🎉

9. Your live URL appears at top:
   https://detrolt-xxxx.onrender.com


# ================================================================
# STEP 4 — TEST YOUR LIVE APP
# ================================================================

Open https://detrolt-xxxx.onrender.com in browser

Test checklist:
  □ Landing page loads with green theme
  □ Features section works (click each feature)
  □ How It Works section works (click each step)
  □ Click "Get Started" → goes to login page
  □ Sign Up with name + email + password → goes to dashboard
  □ Dashboard shows (empty state is fine)
  □ Go to Activities → add an activity
  □ Go to Daily Log → check off activities → Save log
  □ Go to Dashboard → see charts update
  □ Go to Insights → see ML predictions

If login works → everything works ✅


# ================================================================
# STEP 5 — UPDATING AFTER CHANGES
# ================================================================

Whenever you make changes to the code:

cd ~/Desktop/Detrolt
git add .
git commit -m "describe what you changed"
git push origin main

Render detects the push and rebuilds automatically.
Wait 3-5 minutes → your changes are live.


# ================================================================
# TROUBLESHOOTING
# ================================================================

PROBLEM: "Root Directory backend does not exist"
FIX: Your files are in a subfolder. Run:
     ls (check what's there)
     mv subfolder/* .
     git add . && git commit -m "fix" && git push -f origin main

PROBLEM: "NetworkError when attempting to fetch resource"
FIX: This is fixed in this version. api.js uses BASE=""
     which means all calls go to same domain. No more localhost.

PROBLEM: "Email already registered"
FIX: Use a different email or go to MongoDB Atlas → 
     Collections → users → delete your test document

PROBLEM: Build fails on Render
FIX: Check build logs. Usually missing dependency.
     Add it to backend/requirements.txt and push again.

PROBLEM: App is slow to load first time
FIX: Normal on free tier. Render spins down after 15 mins
     of inactivity. First visit wakes it up (takes ~30 secs).
     Paid plan ($7/mo) keeps it always on.

PROBLEM: MongoDB connection error in logs
FIX: Check MONGODB_URL in Render environment variables.
     Make sure Network Access in Atlas allows 0.0.0.0/0


# ================================================================
# YOUR DATA IS PERMANENT
# ================================================================

Once hosted:
- Users register → account saved forever in MongoDB Atlas
- Every activity, log, XP, streak saved to their account
- Sign in from any device → full history available
- Each user's data is completely private
- MongoDB Atlas free tier never expires or deletes data


# ================================================================
# LOCAL DEVELOPMENT (unchanged)
# ================================================================

Terminal 1:
  cd backend
  source venv/bin/activate
  uvicorn main:app --reload

Terminal 2:
  cd frontend
  npm run dev

Open http://localhost:5173
Vite proxy forwards API calls to localhost:8000 automatically.


# ================================================================
# PROJECT STRUCTURE
# ================================================================

detrolt/
├── .gitignore
├── HOSTING.md          ← this file
├── backend/
│   ├── main.py         ← FastAPI + all routes + serves React
│   ├── auth.py         ← JWT authentication
│   ├── database.py     ← MongoDB connection
│   ├── schemas.py      ← data models
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── package.json
    ├── vite.config.js  ← proxy config for local dev
    ├── index.html
    └── src/
        ├── api.js      ← BASE="" = same domain (KEY FIX)
        ├── App.jsx
        ├── AppLayout.jsx
        ├── index.css
        ├── context/AuthContext.jsx
        ├── hooks/useAuth.js + useApi.js
        ├── components/
        │   ├── Hero.jsx     (landing page)
        │   ├── Sidebar.jsx
        │   ├── Logo.jsx
        │   └── StateViews.jsx
        └── pages/
            ├── Login.jsx
            ├── Dashboard.jsx
            ├── Activities.jsx
            ├── DailyLog.jsx
            └── Insights.jsx
