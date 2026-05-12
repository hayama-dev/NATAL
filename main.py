from fastapi import FastAPI
from db.supabase import supabase
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

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

    # birthstonesテーブルから誕生石を取得（group_idを含める）
    stone_res = supabase.table("birthstones").select("stone_name, meaning, source_note, group_id").eq("date_id", date_id).execute()

    # group_idでグループ化して統合
    groups = {}
    for stone in stone_res.data:
        group_id = stone.get("group_id")
        if group_id not in groups:
            groups[group_id] = []
        groups[group_id].append(stone)
    
    # 各グループから最も詳細な情報を選ぶ
    birthstones = []
    for group_id, stones in groups.items():
        # meaningが最も長いものを「正確」と判断
        best_stone = max(stones, key=lambda s: len(s.get("meaning", "")))
        birthstones.append({
            "stone_name": best_stone["stone_name"],
            "meaning": best_stone["meaning"],
            "source_note": best_stone["source_note"],
            "group_id": group_id,
        })

    return {
        "month": month,
        "day": day,
        "birthstones": birthstones,
    }