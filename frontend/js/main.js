// 環境によってAPIのURLを切り替え
const API_BASE = window.location.hostname === "127.0.0.1"
    ? "http://localhost:8000"
    : "https://natal-back-5mdq.onrender.com";

// Enterキーで検索
document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") search();
});

const INGREDIENT_COLORS = [
    "#e8c07d", // シャンパンゴールド
    "#7db8e8", // アイスブルー
    "#e87d9a", // ローズピンク
    "#7de8c0", // ミントグリーン
    "#b87de8", // モーブパープル
    "#e8a07d", // テラコッタ
];

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

function parseRecipe(recipe) {
    if (!recipe) return { ingredients: [], ratios: [], optional: "" };

    const parts = recipe.split("|");
    const mainPart = parts[0].trim();
    const optional = parts[1] ? parts[1].trim() : "";

    const eqSplit = mainPart.split("=");
    const ingredients = eqSplit[0].split(":").map(s => s.trim());
    const ratios = eqSplit[1] ? eqSplit[1].split(":").map(s => s.trim()) : [];

    return { ingredients, ratios, optional };
}

function isLightColor(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6;
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
                </div>
            `;
        });

        // 誕生酒セクション
        if (data.birthdrinks && data.birthdrinks.length > 0) {
            html += `<p class="result-title">${data.month}月${data.day}日の誕生酒</p>`;
            data.birthdrinks.forEach((drink, i) => {
                const color = getDrinkColor(drink.drink_name);
                const recipe = parseRecipe(drink.recipe);

                const ingredientRows = recipe.ingredients.map((ing, idx) => {
                    const c = INGREDIENT_COLORS[idx % INGREDIENT_COLORS.length];
                    return `<li style="color: ${c}">・${ing}</li>`;
                }).join("");

                const ratioNums = recipe.ratios.map((r, idx) => {
                    const c = INGREDIENT_COLORS[idx % INGREDIENT_COLORS.length];
                    return `<span style="color: ${c}">${r}</span>`;
                }).join(' : ');

                html += `
                    <div class="card" id="card-drink-${i}" style="border-left-color: ${color}">
                        <div class="stone-name" style="color: ${color}">🍹 ${drink.drink_name}</div>
                        <div class="meaning">${drink.word || ""}</div>
                        <ul class="recipe-list">${ingredientRows}</ul>
                        ${ratioNums ? `<div class="recipe-ratio">比率 ${ratioNums}</div>` : ""}
                        ${recipe.optional ? `<div class="recipe-optional">✨ ${recipe.optional}</div>` : ""}
                    </div>
                `;
            });
        }

        // 誕生色セクション
        if (data.birthcolors && data.birthcolors.length > 0) {
            html += `<p class="result-title">${data.month}月${data.day}日の誕生色</p>`;
            data.birthcolors.forEach((color, i) => {
                const textShadow = isLightColor(color.color_hex)
                    ? "0 0 3px #000, 0 0 3px #000"
                    : "0 0 3px #fff, 0 0 3px #fff";
                html += `
                    <div class="card" id="card-color-${i}" style="border-left-color: ${color.color_hex}">
                        <div class="color-swatch-row">
                            <div class="color-swatch" style="background-color: ${color.color_hex}"></div>
                            <div class="stone-name" style="color: ${color.color_hex}; text-shadow: ${textShadow}">${color.color_name}</div>
                        </div>
                        <div class="color-hex">${color.color_hex}</div>
                        <div class="meaning">${color.meaning || ""}</div>
                    </div>
                `;
            });
        }

        result.innerHTML = html;

        // カードを1枚ずつフェードイン
        const allCards = document.querySelectorAll(".card");
        allCards.forEach((card, i) => {
            setTimeout(() => card.classList.add("visible"), i * 150);
        });

    } catch (e) {
        loader.style.display = "none";
        result.innerHTML = `<p class="error">APIに接続できませんでした</p>`;
    }
}