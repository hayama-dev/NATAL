from fastapi import FastAPI
from db.supabase import supabase

app = FastAPI()

@app.get("/")
def root():
    return {"message": "動いてる！"}

@app.get("/birthday")
def birthday(month: int, day: int):
    # datesテーブルからdate_idを取得
    date_res = supabase.table("dates").select("id").eq("month", month).eq("day", day).execute()
    
    if not date_res.data:
        return {"error": "日付が見つかりません"}
    
    date_id = date_res.data[0]["id"]

    # birthstonesテーブルから誕生石を取得
    stone_res = supabase.table("birthstones").select("stone_name, meaning, source_note").eq("date_id", date_id).execute()

    return {
        "month": month,
        "day": day,
        "birthstones": stone_res.data,
    }