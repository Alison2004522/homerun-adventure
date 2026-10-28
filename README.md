# 《全壘打大作戰》（Home Run Adventure）

一款專為國小五、六年級至國中一年級學生設計的 2D 互動式棒球物理教育遊戲。

玩家扮演 Q 版棒球選手，透過調整**擊球角度**與**擊球力道**，探索物理拋體運動規律，挑戰三座不同全壘打牆高度與距離的特色球場！

---

## 🎮 遊戲核心特色與理念

- **做中學的物理探索**：不透過冗長文字灌輸知識，而是讓學生在闖關、嘗試、失敗與修正中，親身體會角度與初速度對飛行高度與水平距離的影響。
- **純原生前端開發**：使用 HTML5、CSS3、原生 JavaScript（Canvas 2D 渲染與 Web Audio API 程序化音效合成），零外部庫依賴、無 CDN 失效風險。
- **即開即玩**：點擊「開始挑戰」直接進入球場實戰，無須註冊登入、無廣告、無教學彈窗干擾。
- **響應式跨平台支援**：完美支援桌機（Chrome / Edge / Safari）、平板觸控與手機操作。

---

## 🏟️ 三大關卡設定與通關策略

| 關卡 | 球場名稱 | 全壘打牆距離 | 全壘打牆高度 | 每關揮棒次數 | 挑戰核心與學習目標 |
| :---: | :---: | :---: | :---: | :---: | :--- |
| **第 1 關** | 新手練習場 | 75 單位 | 5 單位 | 3 次 | 掌握基礎操作，體會中等力道與適當角度即可順利越過低矮圍牆。 |
| **第 2 關** | 巨人高牆 | 75 單位 | 18 單位 | 3 次 | 圍牆高度大幅提升，需要提高擊球角度與足夠力道，體會高度對障礙翻越的影響。 |
| **第 3 關** | 超遠全壘打牆 | 105 單位 | 5 單位 | 3 次 | 圍牆距離極遠，需要接近 40°～45° 之最佳射程角度並推滿力道，追求極限飛行距離。 |

---

## ⚙️ 物理模擬公式說明

遊戲採用簡化拋體運動模型：

- **水平位置**：
  $$x(t) = v \cdot \cos(\theta) \cdot t$$
- **垂直位置**：
  $$y(t) = y_0 + v \cdot \sin(\theta) \cdot t - \frac{1}{2} g \cdot t^2$$

其中：
- $v$：依玩家調整之力道（$40\% \sim 100\%$）所換算之初速度。
- $\theta$：擊球角度（$15^\circ \sim 75^\circ$）。
- $g$：重力加速度（設定為 $9.8\text{ 單位/s}^2$）。
- $y_0$：球員腰部擊球點離地高度（設定為 $1.2\text{ 單位}$）。
- 判定機制嚴格計算棒球物理半徑，保證視覺動畫與判定結果精確一致。

---

## 🚀 靜態網站部署指引

本專案為純靜態網站架構，所有資源皆使用相對路徑，可無縫部署至任何靜態託管平台。

### 方案 A：部署至 Cloudflare Pages

1. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com/)，進入 **Workers & Pages**。
2. 點擊 **Create application** ➔ 選擇 **Pages** ➔ **Connect to Git**。
3. 選擇本專案之儲存庫。
4. 設定建置參數：
   - **Framework preset**：`None`
   - **Build command**：（留空，不需建置指令）
   - **Build output directory**：（留空或填入 `/`）
5. 點擊 **Save and Deploy**，即可在數秒內完成全域 CDN 發布！

### 方案 B：部署至 GitHub Pages

1. 將本專案程式碼推送到 GitHub 儲存庫：
   ```bash
   git add .
   git commit -m "feat: Initial commit for Home Run Adventure"
   git push origin main
   ```
2. 進入 GitHub 儲存庫頁面 ➔ 點選 **Settings** ➔ **Pages**。
3. 在 **Build and deployment** 下方的 **Source** 選擇 `Deploy from a branch`。
4. Branch 選擇 `main`，資料夾選擇 `/ (root)`，點擊 **Save**。
5. 稍候數分鐘即可在 `https://<您的帳號>.github.io/<專案名稱>/` 線上暢玩。

---

## 📁 專案檔案結構

```text
homerun-adventure/
├── .gitignore          # Git 忽略設定
├── .nojekyll           # 防止 GitHub Pages 阻擋底線與特殊靜態資源
├── index.html          # 遊戲主要 HTML 頁面結構
├── style.css           # 2D 日系活潑卡通風格樣式表
├── game.js             # 遊戲狀態機、物理引擎與 Web Audio 合成音效
├── assets/
│   ├── images/
│   │   └── baseball.svg # 棒球圖示與 Favicon
│   └── sounds/         # 備用資源目錄（所有音效由 Web Audio API 即時程序化生成）
└── README.md           # 專案說明與操作手冊
```

---

## 📝 授權與宣告

本專案遵循 MIT 開源授權，適合各級學校教育工作者用於課堂物理與科技跨領域教學。
