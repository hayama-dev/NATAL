import csv
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv("../.env")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

response = supabase.table("dates").select("id, month, day").execute()
dates = response.data
date_map = {(d["month"], d["day"]): d["id"] for d in dates}

with open("birthstones_monokotoba.csv", "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    rows = []
    for row in reader:
        month = int(row["month"])
        day = int(row["day"])
        date_id = date_map.get((month, day))

        if date_id is None:
            print(f"日付が見つかりません: {month}月{day}日")
            continue

        rows.append({
            "date_id": date_id,
            "stone_name": row["stone_name"],
            "color": row["color"],
            "meaning": row["meaning"],
            "source_note": row["source_note"],
        })

response = supabase.table("birthstones").insert(rows).execute()
print(f"完了！{len(rows)}件のデータを挿入しました。")