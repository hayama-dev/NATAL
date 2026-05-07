import requests
from bs4 import BeautifulSoup
import time
import csv

# 1月=53から2ずつ増える
MONTH_URLS = [
    (month, f"https://monokotoba.com/archives/stone/{53 + (month - 1) * 2}")
    for month in range(1, 13)
]

def scrape_month(month, url):
    """1ヶ月分のページから全日の誕生石を取得する"""
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "lxml")

    results = []
    for row in soup.select("tr"):
        cells = row.select("td")
        if len(cells) != 3:
            continue

        # 日付を取得（例：「1月1日」）
        date_text = cells[0].text.strip()
        try:
            day = int(date_text.split("月")[1].split("日")[0])
        except:
            continue

        # 誕生石名を取得
        stone_name = cells[1].text.strip()

        # 石言葉を取得
        meaning = cells[2].text.strip()

        results.append({
            "month": month,
            "day": day,
            "stone_name": stone_name,
            "color": "",
            "meaning": meaning,
            "source_note": "monokotoba.com",
        })

    return results

# メイン処理
all_data = []

for month, url in MONTH_URLS:
    print(f"{month}月をスクレイピング中: {url}")
    data = scrape_month(month, url)
    print(f"  {len(data)}件取得")
    all_data.extend(data)
    time.sleep(1)

# CSVに保存
with open("birthstones_monokotoba.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["month", "day", "stone_name", "color", "meaning", "source_note"])
    writer.writeheader()
    writer.writerows(all_data)

print(f"\n完了！{len(all_data)}件のデータをbirthstones_monokotoba.csvに保存しました。")