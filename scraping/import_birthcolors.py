import csv
import os
import time
from supabase import create_client
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

csv_path = os.path.join(os.path.dirname(__file__), "birthcolors.csv")

success = 0
errors = 0

with open(csv_path, "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        month = int(row["month"])
        day = int(row["day"])

        if not row["color_name"]:
            print(f"⚠️  {month}/{day}: color_nameが空のためスキップ")
            errors += 1
            continue

        try:
            date_res = supabase.table("dates").select("id").eq("month", month).eq("day", day).execute()
            if not date_res.data:
                print(f"❌ {month}/{day}: datesテーブルに存在しません")
                errors += 1
                continue

            date_id = date_res.data[0]["id"]

            supabase.table("birthcolors").insert({
                "date_id": date_id,
                "color_name": row["color_name"],
                "color_hex": row["color_hex"],
                "meaning": row["meaning"] or None,
                "source_note": row["source_note"],
            }).execute()

            print(f"✅ {month}/{day}: {row['color_name']} {row['color_hex']}")
            success += 1

        except Exception as e:
            print(f"❌ {month}/{day}: エラー - {e}")
            errors += 1

        time.sleep(0.1)

print(f"\n完了！ 成功: {success}件 / エラー: {errors}件")