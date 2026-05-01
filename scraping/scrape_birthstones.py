import requests
from bs4 import BeautifulSoup
import time
import csv

# 月ごとの一覧ページURL
MONTH_URLS = [
    "https://differencee-jewel.com/category/daily-birthstone/daily-birthstone-01/",
    "https://differencee-jewel.com/category/daily-birthstone/daily-birthstone-02/",
    "https://differencee-jewel.com/category/daily-birthstone/daily-birthstone-03/",
    "https://differencee-jewel.com/category/daily-birthstone/daily-birthstone-04/",
    "https://differencee-jewel.com/category/daily-birthstone/daily-birthstone-05/",
    "https://differencee-jewel.com/category/daily-birthstone/daily-birthstone-06/",
    "https://differencee-jewel.com/category/daily-birthstone/daily-birthstone-07/",
    "https://differencee-jewel.com/category/daily-birthstone/daily-birthstone-08/",
    "https://differencee-jewel.com/category/daily-birthstone/daily-birthstone-09/",
    "https://differencee-jewel.com/category/daily-birthstone/daily-birthstone-10/",
    "https://differencee-jewel.com/category/daily-birthstone/daily-birthstone-11/",
    "https://differencee-jewel.com/category/daily-birthstone/daily-birthstone-12/",
]

def get_day_urls(month_url):
    """一覧ページから各日のURLを全ページ分収集する"""
    urls = []
    page = 1

    while True:
        # ページネーションのURL
        if page == 1:
            url = month_url
        else:
            url = month_url + f"page/{page}/"

        response = requests.get(url)

        # ページが存在しない場合は終了
        if response.status_code != 200:
            break

        soup = BeautifulSoup(response.text, "lxml")

        # 記事リンクを取得（h5タグのaタグ）
        links = soup.select("h5 a")
        if not links:
            break

        for link in links:
            urls.append(link["href"])

        page += 1
        time.sleep(1)  # サーバーへの負荷を減らすため1秒待つ

    return urls

def scrape_birthstone(url):
    """各日のページから誕生石情報を取得する"""
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "lxml")

    # タイトルから月と日を取得（例：「1月1日〜366日の誕生石〜」）
    title = soup.select_one("h1").text
    month = int(title.split("月")[0])
    day = int(title.split("月")[1].split("日")[0])

    # 誕生石名を取得（h3タグ）
    stone_h3 = soup.select_one("h2.wp-block-heading + h3")
    stone_name = stone_h3.text.strip() if stone_h3 else ""

    # 色を取得（テーブルの2行目）
    tables = soup.select("table")
    color = ""
    if tables:
        rows = tables[0].select("tr")
        for row in rows:
            cells = row.select("td")
            if len(cells) == 2 and cells[0].text.strip() == "色":
                color = cells[1].text.strip()

    return {
        "month": month,
        "day": day,
        "stone_name": stone_name,
        "color": color,
        "source_note": "differencee-jewel.com",
    }

# メイン処理
all_data = []

for month_num, month_url in enumerate(MONTH_URLS, start=1):
    print(f"{month_num}月の記事URLを収集中...")
    day_urls = get_day_urls(month_url)
    print(f"  {len(day_urls)}件のURLを取得")

    for url in day_urls:
        print(f"  スクレイピング中: {url}")
        data = scrape_birthstone(url)
        all_data.append(data)
        time.sleep(1)  # サーバーへの負荷を減らすため1秒待つ

# CSVに保存
with open("birthstones.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["month", "day", "stone_name", "color", "source_note"])
    writer.writeheader()
    writer.writerows(all_data)

print(f"\n完了！{len(all_data)}件のデータをbirthstones.csvに保存しました。")