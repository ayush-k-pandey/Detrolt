from pydantic import BaseModel
from datetime import date
from typing import Optional, List


class RegisterIn(BaseModel):
    name: str
    email: str
    password: str

class LoginIn(BaseModel):
    email: str
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_name: str
    user_id: str

class UserOut(BaseModel):
    id: str
    name: str
    email: str
    daily_goal: int
    level: int
    xp: int
    title: str

class UserGoalUpdate(BaseModel):
    daily_goal: int

class ActivityCreate(BaseModel):
    name: str
    category: str
    points: int
    weekly_goal: int = 3
    color: str = "#2d6a4f"

class ActivityOut(BaseModel):
    id: str
    name: str
    category: str
    points: int
    weekly_goal: int
    color: str
    completed_this_week: int = 0

class CompletionItem(BaseModel):
    activity_id: str
    completed: bool

class LogCreate(BaseModel):
    date: date
    completions: List[CompletionItem]
    notes: str = ""

class LogOut(BaseModel):
    date: str
    total_points_earned: int
    total_points_possible: int
    accuracy: float
    notes: str
    completions: List[CompletionItem]

class StatsSummary(BaseModel):
    today_score: int
    daily_goal: int
    streak: int
    consistency: float
    accuracy: float
    total_xp: int
    level: int
    title: str

class MLPredictions(BaseModel):
    tomorrow_score: int
    consistency_forecast: float
    effort_gap: int
    burnout_risk: str
    burnout_risk_color: str
    best_day: str
    top_activity: str
    weekly_trend: str
    monthly_goal_date: Optional[str] = None

class InsightCard(BaseModel):
    type: str
    text: str
