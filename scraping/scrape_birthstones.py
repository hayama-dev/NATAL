import requests
from bs4 import BeautifulSoup
import time
import csv

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
    urls = []
    page = 1

    while True:
        if page == 1:
            url = month_url
        else:
            url = month_url + f"page/{page}/"

        response = requests.get(url)

        if response.status_code != 200:
            break

        soup = BeautifulSoup(response.text, "lxml")
        links = soup.select("h5 a")

        if not links:
            break

        for link in links:
            urls.append(link["href"])

        page += 1
        time.sleep(1)

    return urls

def scrape_birthstone(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "lxml")

    # 月と日を取得
    title = soup.select_one("h1").text
    month = int(title.split("月")[0])
    day = int(title.split("月")[1].split("日")[0])

    # 誕生石名を取得
    stone_h3 = soup.select_one("h2.wp-block-heading + h3")
    stone_name = stone_h3.text.strip() if stone_h3 else ""

    # 色を取得（20文字以上は説明文とみなして空欄）
    tables = soup.select("table")
    color = ""
    if tables:
        rows = tables[0].select("tr")
        for row in rows:
            cells = row.select("td")
            if len(cells) == 2 and cells[0].text.strip() == "色":
                value = cells[1].text.strip()
                color = value if len(value) <= 20 else ""

    # 石言葉を取得（「石言葉」h5の直後のpタグ）
    meaning = ""
    for tag in soup.select("h5, h2"):
        if "石言葉" in tag.text:
            next_p = tag.find_next_sibling("p")
            if next_p:
                meaning = next_p.text.strip()
            break

    return {
        "month": month,
        "day": day,
        "stone_name": stone_name,
        "color": color,
        "meaning": meaning,
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
        time.sleep(1)

# CSVに保存
with open("birthstones.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["month", "day", "stone_name", "color", "meaning", "source_note"])
    writer.writeheader()
    writer.writerows(all_data)

print(f"\n完了！{len(all_data)}件のデータをbirthstones.csvに保存しました。")