from fastapi import FastAPI

app = FastAPI()

BIRTHSTOENES = {
    1: "ガーネット",
    2: "アメジスト",
    3: "アクアマリン",
    4: "ダイヤモンド",
    5: "エメラルド",
    6: "真珠",
    7: "ルビー",
    8: "ペリドット",
    9: "サファイア",
    10: "オパール",
    11: "トパーズ",
    12: "ターコイズ",
}

@app.get("/")
def root():
    return {"message": "動いてる！"}

@app.get("/hello")
def hello():
    return {"greeting": "こんにちは", "from": "私のAPI"}

@app.get("/birthday")
def birthday(month: int, day: int):
    stone = BIRTHSTOENES[month]
    return {
        "month": month, 
        "day": day,
        "stone": stone,    
    }

