from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from bson import ObjectId
from datetime import date, datetime, timedelta
from pathlib import Path
import numpy as np
import os
from dotenv import load_dotenv

from database import users_col, activities_col, logs_col, completions_col
from auth import hash_password, verify_password, create_token, get_current_user
from schemas import *

load_dotenv()

# ── Level system ───────────────────────────────────────────────────────
LEVELS = [
    (0,     1, "Beginner"),
    (500,   2, "Consistent"),
    (1200,  3, "Focused"),
    (2500,  4, "Disciplined"),
    (5000,  5, "Elite"),
    (10000, 6, "Legendary"),
]
XP_THRESHOLDS = [0, 500, 1200, 2500, 5000, 10000, 99999]

def compute_level(xp: int):
    level, title = 1, "Beginner"
    for t, l, n in LEVELS:
        if xp >= t:
            level, title = l, n
    return level, title

def log_for(uid, d):
    return logs_col.find_one({"user_id": uid, "date": str(d)}) or {}

def get_scores(uid, days=14):
    return [log_for(uid, date.today() - timedelta(days=i)).get("total_points_earned", 0)
            for i in range(days - 1, -1, -1)]

def get_streak(uid, goal):
    streak = 0
    for i in range(90):
        if log_for(uid, date.today() - timedelta(days=i)).get("total_points_earned", 0) >= goal:
            streak += 1
        else:
            break
    return streak

def get_consistency(uid, goal, days=30):
    hit = sum(1 for i in range(days)
              if log_for(uid, date.today() - timedelta(days=i)).get("total_points_earned", 0) >= goal)
    return round(hit / days * 100, 1)


# ── App ────────────────────────────────────────────────────────────────
app = FastAPI(title="Detrolt API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Serve React static files ───────────────────────────────────────────
STATIC = Path(__file__).parent / "static"


# ── HEALTH ────────────────────────────────────────────────────────────
@app.get("/api/health", tags=["Health"])
def health():
    return {"status": "ok", "app": "Detrolt", "version": "1.0.0"}


# ── AUTH ──────────────────────────────────────────────────────────────
@app.post("/auth/register", response_model=TokenOut, tags=["Auth"])
def register(body: RegisterIn):
    email = body.email.lower().strip()
    if users_col.find_one({"email": email}):
        raise HTTPException(400, "Email already registered")
    doc = {
        "name": body.name.strip(), "email": email,
        "password": hash_password(body.password),
        "daily_goal": 50, "xp": 0, "level": 1,
        "title": "Beginner", "created_at": datetime.utcnow(),
    }
    r   = users_col.insert_one(doc)
    uid = str(r.inserted_id)
    return TokenOut(access_token=create_token(uid), user_name=body.name.strip(), user_id=uid)


@app.post("/auth/login", response_model=TokenOut, tags=["Auth"])
def login(body: LoginIn):
    u = users_col.find_one({"email": body.email.lower().strip()})
    if not u or not verify_password(body.password, u["password"]):
        raise HTTPException(401, "Invalid email or password")
    uid = str(u["_id"])
    return TokenOut(access_token=create_token(uid), user_name=u["name"], user_id=uid)


@app.get("/auth/me", response_model=UserOut, tags=["Auth"])
def me(cu=Depends(get_current_user)):
    return UserOut(id=str(cu["_id"]), name=cu["name"], email=cu["email"],
                   daily_goal=cu.get("daily_goal", 50), level=cu.get("level", 1),
                   xp=cu.get("xp", 0), title=cu.get("title", "Beginner"))


# ── USER ──────────────────────────────────────────────────────────────
@app.get("/user/profile", response_model=UserOut, tags=["User"])
def get_profile(cu=Depends(get_current_user)):
    return UserOut(id=str(cu["_id"]), name=cu["name"], email=cu["email"],
                   daily_goal=cu.get("daily_goal", 50), level=cu.get("level", 1),
                   xp=cu.get("xp", 0), title=cu.get("title", "Beginner"))


@app.put("/user/goal", tags=["User"])
def update_goal(body: UserGoalUpdate, cu=Depends(get_current_user)):
    users_col.update_one({"_id": cu["_id"]}, {"$set": {"daily_goal": body.daily_goal}})
    return {"detail": "Goal updated"}


# ── ACTIVITIES ────────────────────────────────────────────────────────
@app.get("/activities", response_model=list[ActivityOut], tags=["Activities"])
def list_activities(cu=Depends(get_current_user)):
    uid = str(cu["_id"])
    ws  = str(date.today() - timedelta(days=date.today().weekday()))
    result = []
    for a in activities_col.find({"user_id": uid}):
        count = completions_col.count_documents({
            "user_id": uid, "activity_id": str(a["_id"]),
            "completed": True, "date": {"$gte": ws},
        })
        result.append(ActivityOut(
            id=str(a["_id"]), name=a["name"], category=a["category"],
            points=a["points"], weekly_goal=a.get("weekly_goal", 3),
            color=a.get("color", "#2d6a4f"), completed_this_week=count,
        ))
    return result


@app.post("/activities", response_model=ActivityOut, status_code=201, tags=["Activities"])
def create_activity(body: ActivityCreate, cu=Depends(get_current_user)):
    doc = {**body.model_dump(), "user_id": str(cu["_id"])}
    r   = activities_col.insert_one(doc)
    return ActivityOut(id=str(r.inserted_id), **body.model_dump(), completed_this_week=0)


@app.delete("/activities/{activity_id}", tags=["Activities"])
def delete_activity(activity_id: str, cu=Depends(get_current_user)):
    r = activities_col.delete_one({"_id": ObjectId(activity_id), "user_id": str(cu["_id"])})
    if r.deleted_count == 0:
        raise HTTPException(404, "Activity not found")
    return {"detail": "deleted"}


# ── LOG ───────────────────────────────────────────────────────────────
@app.post("/log", response_model=LogOut, tags=["Log"])
def save_log(body: LogCreate, cu=Depends(get_current_user)):
    uid  = str(cu["_id"])
    acts = {str(a["_id"]): a for a in activities_col.find({"user_id": uid})}

    earned   = sum(acts[c.activity_id]["points"]
                   for c in body.completions
                   if c.completed and c.activity_id in acts)
    possible = sum(a["points"] for a in acts.values())
    accuracy = round(earned / possible * 100, 1) if possible else 0.0

    logs_col.update_one(
        {"user_id": uid, "date": str(body.date)},
        {"$set": {"user_id": uid, "date": str(body.date),
                  "total_points_earned": earned, "total_points_possible": possible,
                  "accuracy": accuracy, "notes": body.notes}},
        upsert=True,
    )
    completions_col.delete_many({"user_id": uid, "date": str(body.date)})
    for c in body.completions:
        completions_col.insert_one({
            "user_id": uid, "activity_id": c.activity_id,
            "date": str(body.date), "completed": c.completed,
        })

    new_xp     = cu.get("xp", 0) + earned
    lvl, title = compute_level(new_xp)
    users_col.update_one({"_id": cu["_id"]},
                         {"$set": {"xp": new_xp, "level": lvl, "title": title}})

    comps = [CompletionItem(activity_id=c.activity_id, completed=c.completed)
             for c in body.completions]
    return LogOut(date=str(body.date), total_points_earned=earned,
                  total_points_possible=possible, accuracy=accuracy,
                  notes=body.notes, completions=comps)


@app.get("/log/history/14days", tags=["Log"])
def log_history(cu=Depends(get_current_user)):
    uid  = str(cu["_id"])
    goal = cu.get("daily_goal", 50)
    return [{"date": (date.today() - timedelta(days=i)).strftime("%b %-d"),
             "points": log_for(uid, date.today() - timedelta(days=i)).get("total_points_earned", 0),
             "goal": goal}
            for i in range(13, -1, -1)]


@app.get("/log/{log_date}", response_model=LogOut, tags=["Log"])
def get_log(log_date: date, cu=Depends(get_current_user)):
    uid = str(cu["_id"])
    log = logs_col.find_one({"user_id": uid, "date": str(log_date)})
    if not log:
        raise HTTPException(404, "No log for this date")
    comps = [CompletionItem(activity_id=c["activity_id"], completed=c["completed"])
             for c in completions_col.find({"user_id": uid, "date": str(log_date)})]
    return LogOut(date=str(log_date), total_points_earned=log["total_points_earned"],
                  total_points_possible=log["total_points_possible"],
                  accuracy=log["accuracy"], notes=log.get("notes", ""),
                  completions=comps)


# ── STATS ─────────────────────────────────────────────────────────────
@app.get("/stats/summary", response_model=StatsSummary, tags=["Stats"])
def stats_summary(cu=Depends(get_current_user)):
    uid  = str(cu["_id"])
    goal = cu.get("daily_goal", 50)
    tl   = log_for(uid, date.today())
    return StatsSummary(
        today_score  = tl.get("total_points_earned", 0),
        daily_goal   = goal,
        streak       = get_streak(uid, goal),
        consistency  = get_consistency(uid, goal),
        accuracy     = tl.get("accuracy", 0.0),
        total_xp     = cu.get("xp", 0),
        level        = cu.get("level", 1),
        title        = cu.get("title", "Beginner"),
    )


@app.get("/stats/chart", tags=["Stats"])
def stats_chart(cu=Depends(get_current_user)):
    uid  = str(cu["_id"])
    goal = cu.get("daily_goal", 50)
    daily = [{"date": (date.today() - timedelta(days=i)).strftime("%b %-d"),
               "points": log_for(uid, date.today() - timedelta(days=i)).get("total_points_earned", 0),
               "goal": goal}
             for i in range(13, -1, -1)]

    since   = str(date.today() - timedelta(days=30))
    cat_pts = {}
    COLORS  = {"Study": "#2d6a4f", "Health": "#40916c", "Personal": "#74c69d",
               "Creative": "#1b4332", "Work": "#52b788"}
    for c in completions_col.find({"user_id": uid, "completed": True, "date": {"$gte": since}}):
        try:
            a = activities_col.find_one({"_id": ObjectId(c["activity_id"])})
            if a:
                cat_pts[a["category"]] = cat_pts.get(a["category"], 0) + a["points"]
        except Exception:
            pass

    total = sum(cat_pts.values()) or 1
    cats  = [{"name": k, "value": round(v / total * 100, 1), "color": COLORS.get(k, "#2d6a4f")}
             for k, v in sorted(cat_pts.items(), key=lambda x: -x[1])]
    return {"daily": daily, "categories": cats}


@app.get("/stats/weekly", tags=["Stats"])
def stats_weekly(cu=Depends(get_current_user)):
    uid   = str(cu["_id"])
    today = date.today()
    ws    = today - timedelta(days=today.weekday())
    ls    = ws - timedelta(days=7)
    result = [{"date": d,
               "this_week": log_for(uid, ws + timedelta(days=i)).get("total_points_earned", 0),
               "last_week": log_for(uid, ls + timedelta(days=i)).get("total_points_earned", 0)}
              for i, d in enumerate(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"])]
    tw = sum(d["this_week"] for d in result)
    lw = sum(d["last_week"] for d in result)
    return {"data": result, "trend": f"+{round((tw - lw) / lw * 100)}%" if lw else "+0%"}


# ── ML ────────────────────────────────────────────────────────────────
@app.get("/ml/predictions", response_model=MLPredictions, tags=["ML"])
def ml_predictions(cu=Depends(get_current_user)):
    uid    = str(cu["_id"])
    goal   = cu.get("daily_goal", 50)
    scores = get_scores(uid, 14)

    ts   = max(0, int(round(np.mean(scores[-3:])))) if any(s > 0 for s in scores) else goal
    ra   = np.mean(scores[-7:]) if scores else 0
    miss = sum(1 for s in scores[-7:] if s < goal)
    risk, rc = (("High", "#dc2626") if miss >= 5 or ra < goal * 0.5
                else ("Medium", "#d97706") if miss >= 3 or ra < goal * 0.75
                else ("Low", "#2d6a4f"))

    dow = {}
    for i in range(60):
        d   = date.today() - timedelta(days=i)
        pts = log_for(uid, d).get("total_points_earned", 0)
        if pts > 0:
            dow.setdefault(d.strftime("%A"), []).append(pts)
    best = max(dow, key=lambda d: np.mean(dow[d])) if dow else "Tuesday"

    ac = {}
    for c in completions_col.find({"user_id": uid, "completed": True}):
        ac[c["activity_id"]] = ac.get(c["activity_id"], 0) + 1
    top = "—"
    if ac:
        try:
            a = activities_col.find_one({"_id": ObjectId(max(ac, key=ac.get))})
            if a:
                top = a["name"]
        except Exception:
            pass

    hit  = sum(1 for s in scores if s >= goal)
    cf   = round(hit / len(scores) * 100, 1) if scores else 0.0
    tp   = log_for(uid, date.today()).get("total_points_earned", 0)
    gap  = max(0, goal - tp)

    today = date.today()
    ws    = today - timedelta(days=today.weekday())
    ls    = ws - timedelta(days=7)
    tw    = sum(log_for(uid, ws + timedelta(days=i)).get("total_points_earned", 0) for i in range(7))
    lw    = sum(log_for(uid, ls + timedelta(days=i)).get("total_points_earned", 0) for i in range(7))
    trend = f"+{round((tw - lw) / lw * 100)}%" if lw else "+0%"

    return MLPredictions(tomorrow_score=ts, consistency_forecast=cf, effort_gap=gap,
                         burnout_risk=risk, burnout_risk_color=rc, best_day=best,
                         top_activity=top, weekly_trend=trend)


@app.get("/ml/insights", tags=["ML"])
def ml_insights(cu=Depends(get_current_user)):
    uid    = str(cu["_id"])
    goal   = cu.get("daily_goal", 50)
    streak = get_streak(uid, goal)
    scores = get_scores(uid, 14)
    tp     = log_for(uid, date.today()).get("total_points_earned", 0)
    gap    = max(0, goal - tp)
    hit    = sum(1 for s in scores if s >= goal)
    cons   = round(hit / len(scores) * 100, 1) if scores else 0

    cards = []
    cards.append({"type": "streak", "text": f"Day {streak} 🔥 — don't break it!"} if streak >= 3
                 else {"type": "warning", "text": "No active streak. Log today to start one."})
    cards.append({"type": "warning", "text": f"Need {gap} more points to hit your {goal}pt goal today."} if gap > 0
                 else {"type": "predict", "text": f"Goal hit! 🎉 {tp} points earned today."})
    cards.append({"type": "predict", "text": f"Consistency at {cons}% — strong rhythm!"} if cons >= 60
                 else {"type": "warning", "text": f"Consistency at {cons}%. Aim for 4+ goal days this week."})
    cards.append({"type": "pattern", "text": "Log for 14 days to unlock day-of-week pattern insights."})
    cards.append({"type": "impact", "text": "Complete diverse activities across categories to boost your score."})
    return cards


@app.get("/ml/forecast", tags=["ML"])
def ml_forecast(cu=Depends(get_current_user)):
    uid    = str(cu["_id"])
    goal   = cu.get("daily_goal", 50)
    scores = []
    actual = []
    for i in range(13, -1, -1):
        d   = date.today() - timedelta(days=i)
        pts = log_for(uid, d).get("total_points_earned", 0)
        scores.append(pts)
        actual.append({"date": d.strftime("%b %-d"), "points": pts, "goal": goal})
    avg      = int(np.mean(scores[-7:])) if any(s > 0 for s in scores) else goal
    forecast = [{"date": (date.today() + timedelta(days=i)).strftime("%b %-d"),
                 "points": None, "predicted": max(0, avg + (i % 3 - 1) * 3)}
                for i in range(1, 8)]
    return {"actual": actual, "forecast": forecast}


@app.get("/ml/activity-impact", tags=["ML"])
def ml_activity_impact(cu=Depends(get_current_user)):
    uid   = str(cu["_id"])
    since = str(date.today() - timedelta(days=30))
    result = []
    for a in activities_col.find({"user_id": uid}):
        count = completions_col.count_documents({
            "user_id": uid, "activity_id": str(a["_id"]),
            "completed": True, "date": {"$gte": since},
        })
        result.append({"id": str(a["_id"]), "name": a["name"], "sessions": count,
                        "impact": round(count * a["points"] / 30, 1),
                        "color": a.get("color", "#2d6a4f")})
    return sorted(result, key=lambda x: -x["impact"])


# ── SERVE REACT (must be last) ────────────────────────────────────────
if STATIC.exists():
    app.mount("/assets", StaticFiles(directory=str(STATIC / "assets")), name="assets")

@app.get("/{full_path:path}")
def serve_spa(full_path: str):
    index = STATIC / "index.html"
    if index.exists():
        return FileResponse(str(index))
    raise HTTPException(404, "Frontend not built. Run npm run build first.")
