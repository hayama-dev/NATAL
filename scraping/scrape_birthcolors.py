import time
import csv
import re
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# ブラウザ設定（ヘッドレスモード）
options = Options()
options.add_argument("--headless")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument("--window-size=1280,800")

driver = webdriver.Chrome(options=options)
wait = WebDriverWait(driver, 15)

results = []

# 各月の日数
days_in_month = {
    1: 31, 2: 29, 3: 31, 4: 30, 5: 31, 6: 30,
    7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31
}

def rgb_to_hex(rgb_str):
    """rgb(82, 61, 0) → #523d00 に変換"""
    match = re.search(r'rgb\((\d+),\s*(\d+),\s*(\d+)\)', rgb_str)
    if match:
        r, g, b = int(match.group(1)), int(match.group(2)), int(match.group(3))
        return f"#{r:02x}{g:02x}{b:02x}"
    return ""

try:
    for month, days in days_in_month.items():
        for day in range(1, days + 1):
            date_str = f"{month:02d}-{day:02d}"
            url = f"https://photoshopvip.net/birthday-color/?date={date_str}"

            try:
                driver.get(url)
                time.sleep(2.5)  # ページ読み込み＋サーバー負荷軽減

                # 色名：font-bold text-3xl を持つdivの中のstrongタグ
                color_name = ""
                try:
                    name_el = driver.find_element(
                        By.CSS_SELECTOR, "div.font-bold.text-3xl strong"
                    )
                    color_name = name_el.text.strip()
                except:
                    pass

                # カラーコード：data-main-color-paletteのbackground-colorから取得
                color_hex = ""
                try:
                    palette_el = driver.find_element(
                        By.CSS_SELECTOR, "[data-main-color-palette='true']"
                    )
                    bg_color = palette_el.get_attribute("style")
                    hex_val = rgb_to_hex(bg_color)
                    if hex_val:
                        color_hex = hex_val
                except:
                    pass

                # 色言葉（短い一言）
                meaning = ""
                try:
                    meaning_el = driver.find_element(
                        By.CSS_SELECTOR, "p.text-gray-200.text-lg.mb-8.leading-relaxed"
                    )
                    meaning = meaning_el.text.strip()
                except:
                    pass

                # 詳細説明（長文）
                description = ""
                try:
                    desc_el = driver.find_element(
                        By.CSS_SELECTOR, "p.text-gray-200.leading-relaxed.text-lg"
                    )
                    description = desc_el.text.strip()
                except:
                    pass

                results.append({
                    "month": month,
                    "day": day,
                    "color_name": color_name,
                    "color_hex": color_hex,
                    "meaning": meaning,
                    "description": description,
                    "source_note": "photoshopvip.net"
                })

                print(f"✅ {month}/{day}: {color_name} {color_hex} / {meaning[:15]}...")

            except Exception as e:
                print(f"❌ {month}/{day}: エラー - {e}")
                results.append({
                    "month": month,
                    "day": day,
                    "color_name": "",
                    "color_hex": "",
                    "meaning": "",
                    "description": "",
                    "source_note": "photoshopvip.net"
                })

finally:
    driver.quit()

# CSVに保存
with open("birthcolors.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["month", "day", "color_name", "color_hex", "meaning", "description", "source_note"])
    writer.writeheader()
    writer.writerows(results)

print(f"\n完了！{len(results)}件を birthcolors.csv に保存しました")