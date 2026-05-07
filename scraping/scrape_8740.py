import requests
from bs4 import BeautifulSoup
import time
import csv

MONTH_URLS = [
    ("january-birthstone", 1),
    ("february-birthstone", 2),
    ("march-birthstone", 3),
    ("april-birthstone", 4),
    ("may-birthstone", 5),
    ("june-birthstone", 6),
    ("july-birthstone", 7),
    ("august-birthstone", 8),
    ("september-birthstone", 9),
    ("october-birthstone", 10),
    ("november-birthstone", 11),
    ("december-birthstone", 12),
]

def get_day_urls(month_slug):
    """一覧ページから各日のURLを収集する"""
    urls = []
    page = 1

    while True:
        if page == 1:
            url = f"https://www.8740.jp/birthstone/{month_slug}/"
        else:
            url = f"https://www.8740.jp/birthstone/{month_slug}/page/{page}/"

        response = requests.get(url)
        if response.status_code != 200:
            break

        soup = BeautifulSoup(response.text, "lxml")
        links = soup.select("a.main-recent-image")

        if not links:
            break

        for link in links:
            urls.append(link["href"])

        page += 1
        time.sleep(1)

    return urls

def scrape_birthstone(url, month):
    """各日のページから誕生石情報を取得する"""
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "lxml")

    # タイトルから日を取得
    title = soup.select_one("h1")
    day_text = title.text if title else ""
    # 例：「1月1日の誕生石」から日を取得
    try:
        day = int(day_text.split("月")[1].split("日")[0])
    except:
        day = 0

    # 誕生石名を取得（h2タグから「第１誕生日石　〇〇」）
    stones = []
    meanings = []
    for h2 in soup.select("h2"):
        if "誕生日石" in h2.text:
            stone_name = h2.text.strip().split("　")[-1]
            stones.append(stone_name)

            # 石言葉を取得（直後のstrong→次のテキスト）
            strong = h2.find_next("strong")
            if strong and "石言葉" in strong.text:
                meaning_text = strong.next_sibling
                if meaning_text:
                    meanings.append(meaning_text.strip().lstrip("：").strip())
                else:
                    meanings.append("")
            else:
                meanings.append("")

    return [{
        "month": month,
        "day": day,
        "stone_name": stone,
        "color": "",
        "meaning": meaning,
        "source_note": "8740.jp",
    } for stone, meaning in zip(stones, meanings)]

# メイン処理
all_data = []

for month_slug, month_num in MONTH_URLS:
    print(f"{month_num}月の記事URLを収集中...")
    day_urls = get_day_urls(month_slug)
    print(f"  {len(day_urls)}件のURLを取得")

    for url in day_urls:
        print(f"  スクレイピング中: {url}")
        data_list = scrape_birthstone(url, month_num)
        all_data.extend(data_list)
        time.sleep(1)

# CSVに保存
with open("birthstones_8740.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["month", "day", "stone_name", "color", "meaning", "source_note"])
    writer.writeheader()
    writer.writerows(all_data)

print(f"\n完了！{len(all_data)}件のデータをbirthstones_8740.csvに保存しました。")