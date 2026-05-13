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
        const res = await fetch(`https://natal-back-5mdq.onrender.com/birthday?month=${month}&day=${day}`);
        const data = await res.json();

        loader.style.display = "none";

        if (data.error) {
            result.innerHTML = `<p class="error">${data.error}</p>`;
            return;
        }

        let html = `<p class="result-title">${data.month}月${data.day}日の誕生石</p>`;
        data.birthstones.forEach((stone, i) => {
            const color = getStoneColor(stone.stone_name);
            html += `
                <div class="card" id="card-${i}" style="border-left-color: ${color}">
                    <div class="stone-name" style="color: ${color}">${stone.stone_name}</div>
                    <div class="meaning">${stone.meaning || "石言葉なし"}</div>
                    <div class="source">出典：${stone.source_note}</div>
                </div>
            `;
        });

        result.innerHTML = html;

        // カードを1枚ずつフェードイン
        data.birthstones.forEach((_, i) => {
            setTimeout(() => {
                const card = document.getElementById(`card-${i}`);
                if (card) card.classList.add("visible");
            }, i * 150);
        });

    } catch (e) {
        loader.style.display = "none";
        result.innerHTML = `<p class="error">APIに接続できませんでした</p>`;
    }
}