from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME     = os.getenv("DB_NAME", "detrolt")

client = MongoClient(MONGODB_URL)
db     = client[DB_NAME]

users_col       = db["users"]
activities_col  = db["activities"]
logs_col        = db["daily_logs"]
completions_col = db["completions"]

try:
    users_col.create_index("email", unique=True)
    activities_col.create_index("user_id")
    logs_col.create_index([("user_id", 1), ("date", 1)], unique=True)
    completions_col.create_index([("user_id", 1), ("date", 1)])
except Exception:
    pass
