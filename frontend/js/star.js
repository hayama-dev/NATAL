const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.pointerEvents = 'none';
canvas.style.zIndex = '0';

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// 背景色アニメーション
const bgColors = [
    [42, 16, 85],
    [74, 32, 128],
    [139, 45, 139],
    [80, 20, 120],
    [42, 16, 85],
];
let bgIndex = 0;
let bgProgress = 0;
const bgSpeed = 0.002;

function lerpColor(a, b, t) {
    return a.map((v, i) => Math.round(v + (b[i] - v) * t));
}

function updateBackground() {
    bgProgress += bgSpeed;
    if (bgProgress >= 1) {
        bgProgress = 0;
        bgIndex = (bgIndex + 1) % (bgColors.length - 1);
    }
    const c = lerpColor(bgColors[bgIndex], bgColors[bgIndex + 1], bgProgress);
    const c2 = lerpColor(bgColors[(bgIndex + 1) % (bgColors.length - 1)], bgColors[(bgIndex + 2) % (bgColors.length - 1)], bgProgress);
    document.body.style.background = `linear-gradient(135deg, rgb(${c[0]},${c[1]},${c[2]}), rgb(${c2[0]},${c2[1]},${c2[2]}))`;
}

// 12星座データ
const constellations = [
    {
        name: "おひつじ座",
        stars: [
            { x: 20, y: 45, mag: 2 },
            { x: 35, y: 40, mag: 2 },
            { x: 45, y: 38, mag: 3 },
            { x: 60, y: 35, mag: 3 },
        ],
        lines: [[0,1],[1,2],[2,3]],
    },
    {
        name: "おうし座",
        stars: [
            { x: 50, y: 50, mag: 1 },
            { x: 30, y: 40, mag: 2 },
            { x: 20, y: 30, mag: 2 },
            { x: 65, y: 35, mag: 2 },
            { x: 75, y: 25, mag: 2 },
            { x: 70, y: 55, mag: 3 },
            { x: 80, y: 60, mag: 3 },
        ],
        lines: [[0,1],[1,2],[0,3],[3,4],[0,5],[5,6]],
    },
    {
        name: "ふたご座",
        stars: [
            { x: 20, y: 20, mag: 1 },
            { x: 15, y: 15, mag: 1 },
            { x: 30, y: 40, mag: 2 },
            { x: 25, y: 35, mag: 2 },
            { x: 45, y: 60, mag: 2 },
            { x: 40, y: 55, mag: 3 },
            { x: 55, y: 75, mag: 3 },
            { x: 50, y: 70, mag: 3 },
        ],
        lines: [[0,2],[2,4],[4,6],[1,3],[3,5],[5,7],[2,3],[4,5]],
    },
    {
        name: "かに座",
        stars: [
            { x: 50, y: 50, mag: 2 },
            { x: 35, y: 35, mag: 2 },
            { x: 65, y: 35, mag: 2 },
            { x: 35, y: 65, mag: 2 },
            { x: 65, y: 65, mag: 2 },
        ],
        lines: [[0,1],[0,2],[0,3],[0,4]],
    },
    {
        name: "しし座",
        stars: [
            { x: 50, y: 40, mag: 1 },
            { x: 35, y: 25, mag: 2 },
            { x: 20, y: 30, mag: 2 },
            { x: 25, y: 45, mag: 2 },
            { x: 65, y: 35, mag: 2 },
            { x: 75, y: 50, mag: 2 },
            { x: 70, y: 65, mag: 2 },
            { x: 55, y: 70, mag: 3 },
        ],
        lines: [[0,1],[1,2],[2,3],[3,0],[0,4],[4,5],[5,6],[6,7],[7,0]],
    },
    {
        name: "おとめ座",
        stars: [
            { x: 50, y: 50, mag: 1 },
            { x: 30, y: 35, mag: 2 },
            { x: 20, y: 25, mag: 2 },
            { x: 35, y: 20, mag: 2 },
            { x: 55, y: 25, mag: 2 },
            { x: 70, y: 35, mag: 2 },
            { x: 65, y: 65, mag: 3 },
            { x: 40, y: 70, mag: 3 },
        ],
        lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,6],[0,7]],
    },
    {
        name: "てんびん座",
        stars: [
            { x: 50, y: 30, mag: 2 },
            { x: 30, y: 50, mag: 2 },
            { x: 70, y: 50, mag: 2 },
            { x: 50, y: 70, mag: 3 },
        ],
        lines: [[0,1],[0,2],[1,3],[2,3]],
    },
    {
        name: "さそり座",
        stars: [
            { x: 40, y: 30, mag: 1 },
            { x: 25, y: 20, mag: 2 },
            { x: 20, y: 35, mag: 2 },
            { x: 30, y: 45, mag: 2 },
            { x: 50, y: 40, mag: 2 },
            { x: 60, y: 50, mag: 2 },
            { x: 65, y: 65, mag: 2 },
            { x: 60, y: 75, mag: 2 },
            { x: 50, y: 80, mag: 3 },
        ],
        lines: [[0,1],[0,2],[0,3],[0,4],[4,5],[5,6],[6,7],[7,8]],
    },
    {
        name: "いて座",
        stars: [
            { x: 50, y: 60, mag: 2 },
            { x: 35, y: 50, mag: 2 },
            { x: 25, y: 35, mag: 2 },
            { x: 40, y: 25, mag: 2 },
            { x: 60, y: 30, mag: 2 },
            { x: 70, y: 45, mag: 2 },
            { x: 65, y: 65, mag: 3 },
            { x: 45, y: 75, mag: 3 },
        ],
        lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,6],[0,7]],
    },
    {
        name: "やぎ座",
        stars: [
            { x: 20, y: 40, mag: 2 },
            { x: 35, y: 25, mag: 2 },
            { x: 55, y: 20, mag: 2 },
            { x: 75, y: 30, mag: 2 },
            { x: 80, y: 55, mag: 2 },
            { x: 60, y: 70, mag: 3 },
            { x: 35, y: 65, mag: 3 },
        ],
        lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,0]],
    },
    {
        name: "みずがめ座",
        stars: [
            { x: 30, y: 30, mag: 2 },
            { x: 45, y: 25, mag: 2 },
            { x: 55, y: 35, mag: 2 },
            { x: 50, y: 50, mag: 2 },
            { x: 35, y: 60, mag: 3 },
            { x: 60, y: 65, mag: 3 },
            { x: 70, y: 55, mag: 3 },
        ],
        lines: [[0,1],[1,2],[2,3],[3,4],[3,5],[5,6]],
    },
    {
        name: "うお座",
        stars: [
            { x: 25, y: 40, mag: 2 },
            { x: 15, y: 25, mag: 2 },
            { x: 30, y: 15, mag: 3 },
            { x: 45, y: 20, mag: 3 },
            { x: 55, y: 35, mag: 2 },
            { x: 65, y: 50, mag: 2 },
            { x: 75, y: 40, mag: 3 },
            { x: 80, y: 25, mag: 3 },
            { x: 70, y: 15, mag: 3 },
        ],
        lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8]],
    },
];

// 背景の小さい星
const bgStars = Array.from({length: 5000}, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 0.8 + 0.2,
    alpha: Math.random() * 0.5 + 0.3,
    speedX: -(Math.random() * 0.2 + 0.05),
    arcPhase: Math.random() * Math.PI * 2,
    arcSpeed: Math.random() * 0.002 + 0.001,
    arcAmplitude: Math.random() * 30 + 10,
}));

const W = canvas.width;
const H = canvas.height;
const CONSTELLATION_WIDTH = 200;
const CONSTELLATION_HEIGHT = 150;
const SPACING = 350;
const SCROLL_SPEED = 0.4;
const TOTAL_WIDTH = constellations.length * SPACING;

// 弧を描くパラメータ付きで星座を配置
let constellationInstances = constellations.map((c, idx) => ({
    ...c,
    offsetX: idx * SPACING,
    baseY: Math.random() * (H * 0.25) + H * 0.25, // 弧の頂点Y
    arcAmplitude: Math.random() * 100 + 80,        // 弧の振れ幅
    arcWidth: SPACING * 1.5,                        // 弧の横幅
}));


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateBackground();

    // 背景の小さい星を描画
    bgStars.forEach(s => {
        s.arcPhase += s.arcSpeed;
        s.x += s.speedX;
        if (s.x < -5) {
            s.x = canvas.width + 5;
            s.y = Math.random() * canvas.height;
        }
        const y = s.y + Math.sin(s.arcPhase) * s.arcAmplitude;
        ctx.beginPath();
        ctx.arc(s.x, y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220,210,255,${s.alpha})`;
        ctx.fill();
    });

    constellationInstances.forEach(c => {
        c.offsetX -= SCROLL_SPEED;

        // 画面外に出たら右端に再配置
        if (c.offsetX + CONSTELLATION_WIDTH < -50) {
            c.offsetX = canvas.width + SPACING;
            c.baseY = Math.random() * (canvas.height * 0.25) + canvas.height * 0.25;
            c.arcAmplitude = Math.random() * 100 + 80;
        }

        // 弧のY座標を計算（サイン波で山なり）
        const centerX = c.offsetX + CONSTELLATION_WIDTH / 2;
        const normalizedX = (centerX / canvas.width) * 2 - 1; // -1〜1
        const arcY = c.baseY + c.arcAmplitude * 2.5 * (normalizedX * normalizedX); // 弧を強める

        const positions = c.stars.map(s => ({
            x: c.offsetX + (s.x / 100) * CONSTELLATION_WIDTH,
            y: arcY + (s.y / 100) * CONSTELLATION_HEIGHT,
            mag: s.mag,
        }));

        // 星座の線
        c.lines.forEach(([i, j]) => {
            ctx.beginPath();
            ctx.moveTo(positions[i].x, positions[i].y);
            ctx.lineTo(positions[j].x, positions[j].y);
            ctx.strokeStyle = 'rgba(200,180,255,0.2)';
            ctx.lineWidth = 0.5;
            ctx.stroke();
        });

        // 星を描画
        positions.forEach(p => {
            const r = p.mag === 1 ? 2.5 : p.mag === 2 ? 1.8 : 1.2;
            const alpha = p.mag === 1 ? 1.0 : p.mag === 2 ? 0.85 : 0.65;

            if (p.mag === 1) {
                const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 8);
                glow.addColorStop(0, 'rgba(255,240,200,0.6)');
                glow.addColorStop(1, 'rgba(255,240,200,0)');
                ctx.beginPath();
                ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
                ctx.fillStyle = glow;
                ctx.fill();
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(220,210,255,${alpha})`;
            ctx.fill();
        });
    });

    // 流星
    for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];

        const grad = ctx.createLinearGradient(
            m.x - Math.cos(m.angle) * m.length,
            m.y - Math.sin(m.angle) * m.length,
            m.x,
            m.y
        );
        grad.addColorStop(0, 'rgba(255,255,255,0)');
        grad.addColorStop(1, `rgba(255,255,255,${m.alpha})`);

        ctx.beginPath();
        ctx.moveTo(m.x - Math.cos(m.angle) * m.length, m.y - Math.sin(m.angle) * m.length);
        ctx.lineTo(m.x, m.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        m.x += Math.cos(m.angle) * m.speed;
        m.y += Math.sin(m.angle) * m.speed;
        m.alpha -= m.fade;

        if (m.alpha <= 0 || m.x < -100 || m.y > canvas.height + 100) {
            meteors.splice(i, 1);
        }
    }

    requestAnimationFrame(draw);
}

// 流星データ
const meteors = [];
function createMeteor() {
    meteors.push({
        x: Math.random() * canvas.width + canvas.width * 0.3,
        y: Math.random() * canvas.height * 0.4,
        length: Math.random() * 100 + 80,
        speed: Math.random() * 8 + 6,
        angle: Math.PI / 4 + (Math.random() * 0.3 - 0.15), // 斜め下左方向
        alpha: 1,
        fade: Math.random() * 0.015 + 0.01,
    });
}
function scheduleMeteor() {
    createMeteor();
    setTimeout(scheduleMeteor, Math.random() * 10000 + 5000);
}
scheduleMeteor();

draw();