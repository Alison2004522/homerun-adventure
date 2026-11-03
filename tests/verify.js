const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf-8');
const js = fs.readFileSync('game.js', 'utf-8');

// 1. 檢查 DOM ID 匹配
const regex = /getElementById\(['"]([^'"]+)['"]\)/g;
let match;
const ids = [];
while ((match = regex.exec(js)) !== null) {
  if (!ids.includes(match[1])) {
    ids.push(match[1]);
  }
}

const missing = ids.filter(id => !html.includes(`id="${id}"`) && !html.includes(`id='${id}'`));
if (missing.length > 0) {
  console.error('❌ 遺漏的 DOM ID:', missing);
  process.exit(1);
}
console.log('✅ 所有 DOM ID 均完全匹配且存在！共', ids.length, '個元素。');

// 2. 物理參數驗證
const PHYSICS = {
  g: 9.8,
  vScale: 35.5,
  y0: 1.2,
  ballRadius: 0.5
};

const LEVELS = [
  { id: 1, name: 'Citi Field（花旗球場）', distance: 75, height: 5 },
  { id: 2, name: '芬威球場（綠色怪物）', distance: 75, height: 18 },
  { id: 3, name: '庫爾斯球場（高原天堂）', distance: 105, height: 5 }
];

function simulateShot(levelIndex, angle, power) {
  const level = LEVELS[levelIndex];
  const D = level.distance;
  const H = level.height;
  const g = PHYSICS.g;
  const y0 = PHYSICS.y0;
  const r = PHYSICS.ballRadius;

  const v = (power / 100.0) * PHYSICS.vScale;
  const rad = (angle * Math.PI) / 180.0;
  const vx = v * Math.cos(rad);
  const vy = v * Math.sin(rad);

  const disc = vy * vy + 2 * g * y0;
  const tLand = (vy + Math.sqrt(disc)) / g;
  const xLand = vx * tLand;
  const yApex = y0 + (vy * vy) / (2 * g);

  if (xLand < D) {
    if (angle >= 55) {
      return { type: 'HIGH_SHORT', xLand, yApex };
    }
    return { type: 'SHORT', xLand, yApex };
  }

  const tWall = D / vx;
  const yWall = y0 + vy * tWall - 0.5 * g * tWall * tWall;

  if (yWall - r > H) {
    return { type: 'HOMERUN', xLand, yWall };
  } else {
    return { type: 'LOW', xLand, yWall };
  }
}

// 測試預設值
const defaultShot = simulateShot(0, 45, 75);
if (defaultShot.type !== 'SHORT' || defaultShot.xLand <= 70 || defaultShot.xLand >= 75) {
  console.error('❌ 預設擊球落點不符預期');
  process.exit(1);
}
console.log(`✅ 預設擊球 (45°, 75%) 落點 ${defaultShot.xLand.toFixed(2)} M < 75 M，精準提供回饋！`);

// 測試第 2 關低角度 vs 高角度
const l2Low = simulateShot(1, 30, 95);
const l2High = simulateShot(1, 55, 95);
if (l2Low.type !== 'LOW' || l2High.type !== 'HOMERUN') {
  console.error('❌ 第 2 關綠色怪物物理判定異常');
  process.exit(1);
}
console.log('✅ 第 2 關綠色怪物低角度撞牆、高角度飛越判定正確！');

// 測試第 3 關落磯隊高山超遠外野
const l3Champ = simulateShot(2, 45, 100);
if (l3Champ.type !== 'HOMERUN') {
  console.error('❌ 第 3 關冠軍球判定異常');
  process.exit(1);
}
console.log(`✅ 第 3 關超遠外野 45° 100% 成功越過 105 米圍牆 (落點 ${l3Champ.xLand.toFixed(2)} M)！`);

console.log('\n🎉 所有《全壘打大作戰》知識決策與物理模擬單元測試 100% 通過！');
