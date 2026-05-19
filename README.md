# NATAL - 誕生日プレゼントヒントサイト

誕生日を入力すると、**誕生石・誕生酒・誕生色**を返すWebアプリケーションです。
友人への誕生日プレゼントのヒントになるサイトをコンセプトに、個人開発の学習目的で作成しました。

🔗 [サイトを見る](https://natal-846x.onrender.com)

---

## 使用技術

| 役割 | 技術 |
|------|------|
| バックエンド | Python / FastAPI / Uvicorn |
| データベース | Supabase（PostgreSQL） |
| フロントエンド | HTML / CSS / JavaScript |
| バックエンドホスティング | Render |
| フロントエンドホスティング | Render |
| バージョン管理 | GitHub |
| スクレイピング | Python / Selenium / BeautifulSoup |

---

## 機能一覧

- 月・日を入力して検索
- 誕生石の表示（石言葉・出典付き）
- 誕生酒の表示（酒言葉・材料比率・レシピ付き）
- 誕生色の表示（カラーコード・色言葉付き）

---

## DB設計

```sql
-- 366日分の日付マスタ
dates (id, month, day)

-- 誕生石（1830件・複数サイトから収集）
birthstones (id, date_id, stone_name, color, meaning, source_note, group_id)

-- 誕生酒（366件）
birthdrinks (id, date_id, drink_name, word, recipe, source_note)

-- 誕生色（366件）
birthcolors (id, date_id, color_name, color_hex, meaning, source_note)
```

---

## ローカル起動方法

### 必要なもの
- Python 3.10以上
- Supabaseアカウント
- `.env` ファイル（後述）

### 手順

```bash
# リポジトリをクローン
git clone https://github.com/yourname/NATAL.git
cd NATAL

# 仮想環境を作成・有効化
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Mac/Linux

# 依存パッケージをインストール
pip install -r requirements.txt

# バックエンドを起動
uvicorn main:app --reload
```

### .envファイル
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
ENV=development
```

フロントエンドはVSCodeの **Live Server** 拡張機能で `index.html` を開いてください。

---

## 工夫した点

### robots.txtによるスクレイピング許可確認
データ収集の際、各サイトの `robots.txt` を確認し、スクレイピングが許可されているサイトのみを対象としました。また、サーバーへの負荷を考慮してリクエスト間に待機時間を設けています。

### Renderでのバックエンド・フロントエンド分離デプロイ
バックエンド（FastAPI）とフロントエンド（HTML/CSS/JS）を別々のサービスとしてRenderにデプロイしました。CORS設定により本番環境では自サイトからのリクエストのみを許可し、開発環境では環境変数（`ENV=development`）で切り替える設計にしています。

---

## ディレクトリ構成

```
NATAL/
├── main.py
├── db/
│   ├── __init__.py
│   └── supabase.py
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── main.js
├── scraping/
│   ├── scrape_birthstones.py
│   ├── scrape_8740.py
│   ├── scrape_monokotoba.py
│   ├── scrape_birthdrinks_i879.py
│   ├── scrape_birthcolors.py
│   ├── import_birthstones.py
│   ├── import_8740.py
│   ├── import_mononkotoba.py
│   ├── import_birthdrinks.py
│   ├── import_birthcolors.py
├── requirements.txt
├── .env
└── .gitignore
```