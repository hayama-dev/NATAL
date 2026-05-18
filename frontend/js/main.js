// 環境によってAPIのURLを切り替え
// ローカル（file://で開く）→ localhost:8000
// 本番（ブラウザでアクセス）→ RenderのURL
const API_BASE = window.location.protocol === "file:"
    ? "http://localhost:8000"
    : "https://natal-back-5mdq.onrender.com";

// Enterキーで検索
document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") search();
});

// 石の名前から色を推定
function getStoneColor(name) {
    const colorMap = [
        { keywords: ["ルビー", "ガーネット", "赤", "レッド", "コーラル", "珊瑚"], color: "#e74c3c" },
        { keywords: ["サファイア", "アクアマリン", "ブルー", "青", "トパーズ", "ターコイズ"], color: "#3498db" },
        { keywords: ["エメラルド", "ジェイド", "翡翠", "グリーン", "緑", "ペリドット"], color: "#2ecc71" },
        { keywords: ["アメジスト", "パープル", "紫", "スギライト"], color: "#9b59b6" },
        { keywords: ["ダイヤモンド", "水晶", "クォーツ", "クリスタル", "ホワイト", "白"], color: "#95a5a6" },
        { keywords: ["シトリン", "アンバー", "琥珀", "イエロー", "黄"], color: "#f39c12" },
        { keywords: ["オパール", "ラブラドライト", "レインボー"], color: "#6c63ff" },
        { keywords: ["ローズ", "ピンク", "モルガナイト", "ロードナイト"], color: "#e91e8c" },
        { keywords: ["オニキス", "ブラック", "黒", "ジェット"], color: "#555" },
        { keywords: ["真珠", "パール", "ムーンストーン"], color: "#d5d8dc" },
    ];

    for (const entry of colorMap) {
        if (entry.keywords.some(k => name.includes(k))) {
            return entry.color;
        }
    }
    return "#6c63ff";
}

// カクテルの色を推定
function getDrinkColor(name) {
    const colorMap = [
        { keywords: ["ブルー", "スカイ", "アクア", "チャイナブルー", "ラグーン"], color: "#3498db" },
        { keywords: ["グリーン", "ミドリ", "ミント", "エメラルド", "グラスホッパー"], color: "#2ecc71" },
        { keywords: ["レッド", "ブラッディ", "カンパリ", "ルビー", "ストロベリー", "クランベリー"], color: "#e74c3c" },
        { keywords: ["ピンク", "ロゼ", "コスモポリタン", "キール"], color: "#e91e8c" },
        { keywords: ["オレンジ", "サンライズ", "アプリコット", "マンゴ"], color: "#f39c12" },
        { keywords: ["ブラック", "コーヒー", "カルーア", "エスプレッソ", "チョコ"], color: "#6d4c41" },
        { keywords: ["ホワイト", "ミルク", "クリーム", "ピニャ", "コラーダ"], color: "#95a5a6" },
        { keywords: ["パープル", "バイオレット", "カシス", "ブルーベリー"], color: "#9b59b6" },
        { keywords: ["イエロー", "シャンパン", "ゴールデン", "ミモザ"], color: "#f1c40f" },
    ];

    for (const entry of colorMap) {
        if (entry.keywords.some(k => name.includes(k))) {
            return entry.color;
        }
    }
    return "#6c63ff";
}

// レシピ文字列を2つのパーツに分割して表示用に整形
// 例: "ラム : ライムジュース = 2 : 1 | シュガーシロップはお好みで"
// → { ratio: "ラム : ライムジュース = 2 : 1", optional: "シュガーシロップはお好みで" }
function parseRecipe(recipe) {
    if (!recipe) return { ratio: "", optional: "" };
    const parts = recipe.split("|");
    return {
        ratio: parts[0].trim(),
        optional: parts[1] ? parts[1].trim() : ""
    };
}

// 検索処理
async function search() {
    const month = document.getElementById("month").value;
    const day = document.getElementById("day").value;
    const loader = document.getElementById("loader");
    const result = document.getElementById("result");

    if (!month || !day) {
        result.innerHTML = `<p class="error">月と日を入力してください</p>`;
        return;
    }

    // ローディング表示
    loader.style.display = "block";
    result.innerHTML = "";

    try {
        const res = await fetch(`${API_BASE}/birthday?month=${month}&day=${day}`);
        const data = await res.json();

        loader.style.display = "none";

        if (data.error) {
            result.innerHTML = `<p class="error">${data.error}</p>`;
            return;
        }

        // 誕生石セクション
        let html = `<p class="result-title">${data.month}月${data.day}日の誕生石</p>`;
        data.birthstones.forEach((stone, i) => {
            const color = getStoneColor(stone.stone_name);
            html += `
                <div class="card" id="card-stone-${i}" style="border-left-color: ${color}">
                    <div class="stone-name" style="color: ${color}">${stone.stone_name}</div>
                    <div class="meaning">${stone.meaning || "石言葉なし"}</div>
                    <div class="source">出典：${stone.source_note}</div>
                </div>
            `;
        });

        // 誕生酒セクション
        if (data.birthdrinks && data.birthdrinks.length > 0) {
            html += `<p class="result-title">${data.month}月${data.day}日の誕生酒</p>`;
            data.birthdrinks.forEach((drink, i) => {
                const color = getDrinkColor(drink.drink_name);
                const recipe = parseRecipe(drink.recipe);
                html += `
                    <div class="card" id="card-drink-${i}" style="border-left-color: ${color}">
                        <div class="stone-name" style="color: ${color}">🍹 ${drink.drink_name}</div>
                        <div class="meaning">${drink.word || ""}</div>
                        <div class="recipe-ratio">${recipe.ratio}</div>
                        ${recipe.optional ? `<div class="recipe-optional">✨ ${recipe.optional}</div>` : ""}
                        <div class="source">出典：${drink.source_note}</div>
                    </div>
                `;
            });
        }

        result.innerHTML = html;

        // カードを1枚ずつフェードイン（石＋酒まとめて）
        const allCards = document.querySelectorAll(".card");
        allCards.forEach((card, i) => {
            setTimeout(() => card.classList.add("visible"), i * 150);
        });

    } catch (e) {
        loader.style.display = "none";
        result.innerHTML = `<p class="error">APIに接続できませんでした</p>`;
    }
}