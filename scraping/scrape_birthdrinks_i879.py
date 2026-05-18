import requests
from bs4 import BeautifulSoup
import csv
import time

URL = "https://www.i879.com/hanablog/gift/2021/04/09/12798/"

MONTH_MAP = {
    "1月": 1, "2月": 2, "3月": 3, "4月": 4,
    "5月": 5, "6月": 6, "7月": 7, "8月": 8,
    "9月": 9, "10月": 10, "11月": 11, "12月": 12
}

def scrape():
    response = requests.get(URL)
    soup = BeautifulSoup(response.text, "lxml")

    results = []
    current_month = None

    # h3タグで月を判定、tableで日別データを取得
    for element in soup.select("h3, table.reg"):
        if element.name == "h3":
            text = element.text.strip()
            for month_str, month_num in MONTH_MAP.items():
                if month_str in text:
                    current_month = month_num
                    break

        elif element.name == "table" and current_month:
            rows = element.select("tr")
            # ヘッダー行をスキップ
            for row in rows[1:]:
                cells = row.select("td")
                if len(cells) != 3:
                    continue

                day_text = cells[0].text.strip()
                drink_name = cells[1].text.strip()
                word = cells[2].text.strip()

                try:
                    day = int(day_text.replace("日", ""))
                except:
                    continue

                results.append({
                    "month": current_month,
                    "day": day,
                    "drink_name": drink_name,
                    "base": "",
                    "word": word,
                    "source_note": "i879.com",
                })

    return results

all_data = scrape()

with open("birthdrinks_i879.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["month", "day", "drink_name", "base", "word", "source_note"])
    writer.writeheader()
    writer.writerows(all_data)

print(f"完了！{len(all_data)}件のデータをbirthdrinks_i879.csvに保存しました。")