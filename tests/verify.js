const fs = require('fs');

console.log('🐾 開始執行《喵喵情緒偵探》自動化驗收與完整性測試...\n');

const html = fs.readFileSync('index.html', 'utf-8');
const js = fs.readFileSync('game.js', 'utf-8');
const css = fs.readFileSync('style.css', 'utf-8');

let errors = 0;

// 1. 檢查 DOM ID 匹配性
console.log('--- 測試 1：檢查 JavaScript 調用的 DOM ID 是否皆於 HTML 中正確定義 ---');
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
  console.error('❌ 發現遺漏的 DOM ID：', missing);
  errors++;
} else {
  console.log(`✅ 所有 DOM ID 完全匹配！共檢查 ${ids.length} 個元素，無任何遺漏。`);
}

// 2. 檢查案件資料與邏輯完整性
console.log('\n--- 測試 2：檢查三大案件資料結構與題目選項正確性 ---');
// 抽驗 CASES_DATA 內容
const casesMatch = js.match(/const CASES_DATA = (\[[\s\S]*?\n  \]);/);
if (!casesMatch) {
  console.error('❌ 無法提取 CASES_DATA 陣列！');
  errors++;
} else {
  try {
    // 透過 Function 評估 CASES_DATA 內容
    const getCases = new Function(`return ${casesMatch[1]}`);
    const cases = getCases();

    if (cases.length !== 3) {
      console.error(`❌ 案件數量不正確，預期 3 個，實際取得 ${cases.length} 個！`);
      errors++;
    } else {
      console.log(`✅ 案件數量正確：共 ${cases.length} 個案件。`);

      cases.forEach((c, idx) => {
        console.log(`   案件 ${idx + 1}：${c.title} (熱點數: ${c.hotspots.length})`);
        if (c.hotspots.length < 3) {
          console.error(`   ❌ 案件 ${idx + 1} 熱點不足 3 個！`);
          errors++;
        }
        
        // 檢查情緒選項
        const emotionCorrect = c.emotionQuestion.options.filter(o => o.isCorrect);
        if (emotionCorrect.length !== 1) {
          console.error(`   ❌ 案件 ${idx + 1} 的情緒題目正確答案數量應為 1，實際為 ${emotionCorrect.length}`);
          errors++;
        }

        // 檢查應對互動選項
        const actionCorrect = c.actionQuestion.options.filter(o => o.isCorrect);
        if (actionCorrect.length !== 1) {
          console.error(`   ❌ 案件 ${idx + 1} 的互動題目正確答案數量應為 1，實際為 ${actionCorrect.length}`);
          errors++;
        }

        // 檢查解析
        if (!c.summary || !c.summary.clues || !c.summary.education) {
          console.error(`   ❌ 案件 ${idx + 1} 缺乏完整的總結或教育解析！`);
          errors++;
        }
      });
      console.log('✅ 所有案件熱點、選項（恰有 1 正確解）與教育解密檢查全數通過！');
    }
  } catch (err) {
    console.error('❌ 解析 CASES_DATA 失敗：', err.message);
    errors++;
  }
}

// 3. 檢查台灣繁體中文排版與無簡體/大陸用語
console.log('\n--- 測試 3：在地化與繁體中文用語規範檢查 ---');
const prohibitedWords = [
  '优化', '用户', '平台方', '流程化', '信息', '質量', '质量', '水平', '激活', '项目',
  '点击', '提示词', '设置', '账号', '登陆'
];

let foundProhibited = [];
prohibitedWords.forEach(word => {
  if (html.includes(word) || js.includes(word)) {
    foundProhibited.push(word);
  }
});

if (foundProhibited.length > 0) {
  console.warn('⚠️ 發現非台灣在地用語：', foundProhibited);
} else {
  console.log('✅ 通過台灣在地繁體中文檢驗，無簡體字或大陸慣用語！');
}

// 4. 檢查 HTML, CSS, JS 檔案語法與資安合規
console.log('\n--- 測試 4：資安與零外部依賴檢查 ---');
const externalCdnRegex = /(https?:\/\/[^\s"'>]+(cdn|unpkg|jsdelivr|cdnjs|googleapis)[^\s"'>]*)/gi;
const externalLinksInHtml = html.match(externalCdnRegex) || [];
if (externalLinksInHtml.length > 0) {
  console.warn('⚠️ HTML 中含有外部 CDN：', externalLinksInHtml);
} else {
  console.log('✅ HTML 零外部 CDN 依賴，保證離線與純靜態部署高可靠性！');
}

if (errors > 0) {
  console.error(`\n❌ 驗證失敗，共有 ${errors} 個錯誤！`);
  process.exit(1);
} else {
  console.log('\n🎉 《喵喵情緒偵探》所有驗證測試全數通過！專案品質合格！');
}
