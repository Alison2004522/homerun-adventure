/**
 * ============================================================================
 * 《全壘打大作戰》（Home Run Adventure）
 * 核心遊戲邏輯、物理引擎、Canvas 2D 渲染與 Web Audio 音效合成模組
 * ============================================================================
 */

(function () {
  "use strict";

  /* ==========================================================================
     一、 音效管理模組（Web Audio API 程序化合成，零外部依賴）
     ========================================================================== */
  class SoundManager {
    constructor() {
      this.ctx = null;
      this.enabled = true;
      this.initialized = false;
    }

    init() {
      if (this.initialized) return;
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
          this.initialized = true;
        }
      } catch (e) {
        console.warn("Web Audio API not supported", e);
      }
    }

    resume() {
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume();
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      return this.enabled;
    }

    // 1. 按鈕點擊聲（清脆泡泡音）
    playClick() {
      if (!this.enabled || !this.ctx) return;
      this.resume();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    }

    // 2. 揮棒破空聲（風切聲）
    playSwing() {
      if (!this.enabled || !this.ctx) return;
      this.resume();
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.2);
      filter.Q.value = 3.0;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.2);
    }

    // 3. 擊球木棒清脆聲
    playHit() {
      if (!this.enabled || !this.ctx) return;
      this.resume();
      const now = this.ctx.currentTime;

      // 擊球高頻瞬態沖擊
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = "triangle";
      osc1.frequency.setValueAtTime(1200, now);
      osc1.frequency.exponentialRampToValueAtTime(320, now + 0.12);
      gain1.gain.setValueAtTime(0.5, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.12);

      // 木質共振低音
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(260, now);
      osc2.frequency.exponentialRampToValueAtTime(90, now + 0.18);
      gain2.gain.setValueAtTime(0.4, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now);
      osc2.stop(now + 0.18);
    }

    // 4. 擊中全壘打牆撞擊聲
    playWallHit() {
      if (!this.enabled || !this.ctx) return;
      this.resume();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    }

    // 5. 全壘打慶祝歡呼與勝利和弦
    playHomeRun() {
      if (!this.enabled || !this.ctx) return;
      this.resume();
      const notes = [261.63, 329.63, 392.0, 523.25]; // C4, E4, G4, C5
      notes.forEach((freq, i) => {
        const startTime = this.ctx.currentTime + i * 0.12;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.45);
      });

      // 觀眾歡呼聲（模擬多重噪聲）
      const bufferSize = this.ctx.sampleRate * 1.8;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      filter.Q.value = 1.5;

      const cheerGain = this.ctx.createGain();
      const cNow = this.ctx.currentTime + 0.2;
      cheerGain.gain.setValueAtTime(0.01, cNow);
      cheerGain.gain.linearRampToValueAtTime(0.25, cNow + 0.4);
      cheerGain.gain.exponentialRampToValueAtTime(0.001, cNow + 1.6);

      noise.connect(filter);
      filter.connect(cheerGain);
      cheerGain.connect(this.ctx.destination);
      noise.start(cNow);
      noise.stop(cNow + 1.6);
    }

    // 6. 挑戰失敗音效（下行沮喪滑音）
    playFail() {
      if (!this.enabled || !this.ctx) return;
      this.resume();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(330, now);
      osc.frequency.linearRampToValueAtTime(140, now + 0.5);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    }

    // 7. 最終冠軍盛大慶典和弦
    playChampion() {
      if (!this.enabled || !this.ctx) return;
      this.resume();
      const melody = [
        { f: 261.63, d: 0.2 },
        { f: 261.63, d: 0.2 },
        { f: 261.63, d: 0.2 },
        { f: 329.63, d: 0.4 },
        { f: 392.0, d: 0.3 },
        { f: 523.25, d: 0.8 },
      ];
      let t = this.ctx.currentTime;
      melody.forEach((note) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(note.f, t);
        gain.gain.setValueAtTime(0.28, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + note.d);
        t += note.d * 0.9;
      });
    }
  }

  /* ==========================================================================
     二、 關卡資料與物理常數設定
     ========================================================================== */
  const PHYSICS = {
    g: 9.8, // 重力加速度 (遊戲單位/秒^2)
    vScale: 35.5, // 滿力道初速基準 (遊戲單位/秒)
    y0: 1.2, // 打擊點離地高度 (遊戲單位)
    ballRadius: 0.5, // 棒球物理半徑 (遊戲單位)
    originX: 150, // Canvas 打擊點像素 X
    groundY: 570, // Canvas 地面像素 Y
    scale: 9.0, // 像素 / 遊戲單位 (1 遊戲單位 = 9.0 像素)
  };

  const LEVELS = [
    {
      id: 1,
      name: "新手練習場",
      difficulty: "簡單",
      distance: 75,
      height: 5,
      tip: "第一座球場的全壘打牆比較低，試著調整角度與力道，擊出你的第一支全壘打吧！",
      successMsg: "全壘打！漂亮的一擊！你成功越過第一座球場的圍牆！",
      wallColor: "#43a047",
      wallTopColor: "#fdd835",
      skyColor: ["#64b5f6", "#e3f2fd"],
      flagText: "新手訓練場",
    },
    {
      id: 2,
      name: "巨人高牆",
      difficulty: "中等",
      distance: 75,
      height: 18,
      tip: "這次的全壘打牆變高了！光是打得遠還不夠，還要讓球飛得夠高！",
      successMsg: "太厲害了！你成功飛越巨人高牆！",
      wallColor: "#1b5e20",
      wallTopColor: "#ffeb3b",
      skyColor: ["#42a5f5", "#bbdefb"],
      flagText: "巨人高牆挑戰",
    },
    {
      id: 3,
      name: "超遠全壘打牆",
      difficulty: "較高",
      distance: 105,
      height: 5,
      tip: "最後一關！這次的圍牆雖然不高，但距離非常遠！你能擊出冠軍全壘打嗎？",
      successMsg: "冠軍全壘打！你成功征服所有球場！",
      wallColor: "#0d47a1",
      wallTopColor: "#ffc107",
      skyColor: ["#ff9800", "#fff3e0"], // 冠軍黃昏決戰氛圍
      flagText: "總冠軍決戰",
    },
  ];

  /* ==========================================================================
     三、 粒子系統（彩帶與星星火花）
     ========================================================================== */
  class ParticleSystem {
    constructor() {
      this.particles = [];
      this.colors = ["#f44336", "#e91e63", "#9c27b0", "#2196f3", "#4caf50", "#ffeb3b", "#ff9800"];
    }

    // 爆發慶祝彩帶
    explodeConfetti(x, y, count = 120) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 8;
        this.particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 3,
          color: this.colors[Math.floor(Math.random() * this.colors.length)],
          size: 6 + Math.random() * 6,
          rotation: Math.random() * 360,
          rotSpeed: (Math.random() - 0.5) * 15,
          alpha: 1,
          gravity: 0.15,
          life: 90 + Math.random() * 40,
          type: Math.random() > 0.4 ? "rect" : "star",
        });
      }
    }

    // 擊球火花
    sparkHit(x, y, count = 20) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 5;
        this.particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: "#fff59d",
          size: 3 + Math.random() * 4,
          rotation: 0,
          rotSpeed: 0,
          alpha: 1,
          gravity: 0.05,
          life: 25,
          type: "spark",
        });
      }
    }

    update() {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.rotSpeed;
        p.life--;
        p.alpha = Math.max(0, p.life / 60);

        if (p.life <= 0 || p.y > 750) {
          this.particles.splice(i, 1);
        }
      }
    }

    draw(ctx) {
      this.particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        if (p.type === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        } else if (p.type === "star") {
          ctx.beginPath();
          for (let s = 0; s < 5; s++) {
            ctx.lineTo(
              Math.cos(((18 + s * 72) * Math.PI) / 180) * p.size,
              -Math.sin(((18 + s * 72) * Math.PI) / 180) * p.size
            );
            ctx.lineTo(
              Math.cos(((54 + s * 72) * Math.PI) / 180) * (p.size / 2),
              -Math.sin(((54 + s * 72) * Math.PI) / 180) * (p.size / 2)
            );
          }
          ctx.closePath();
          ctx.fill();
        } else {
          // spark
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });
    }

    clear() {
      this.particles = [];
    }
  }

  /* ==========================================================================
     四、 主遊戲控制類別
     ========================================================================== */
  class HomeRunGame {
    constructor() {
      this.sound = new SoundManager();
      this.particles = new ParticleSystem();

      // 遊戲狀態與關卡進度
      this.currentLevelIndex = 0; // 0, 1, 2
      this.chancesLeft = 3;
      this.angle = 45; // 擊球角度 15° ~ 75°
      this.power = 75; // 擊球力道 40% ~ 100%

      // 揮棒與球飛行狀態
      this.isSwinging = false;
      this.swingPhase = 0; // 0: 準備, 1: 揮擊中, 2: 慶祝, 3: 失敗懊惱
      this.batterAnimTimer = 0;
      this.flightActive = false;
      this.flightStartTime = 0;
      this.ballPath = []; // 歷史軌跡紀錄
      this.ball = {
        x: 0,
        y: PHYSICS.y0,
        vx: 0,
        vy: 0,
        landed: false,
        hitWall: false,
        isHomeRun: false,
      };

      // 判定結果暫存
      this.lastResult = null; // { type: 'HOMERUN' | 'SHORT' | 'LOW' | 'HIGH_SHORT', msg: '' }

      // 畫面元素綁定
      this.canvas = document.getElementById("game-canvas");
      this.ctx = this.canvas.getContext("2d");

      // UI 元素
      this.levelNumEl = document.getElementById("hud-level-num");
      this.levelNameEl = document.getElementById("hud-level-name");
      this.chancesContainerEl = document.getElementById("hud-chances");
      this.soundToggleBtn = document.getElementById("sound-toggle-btn");
      this.soundIconEl = document.getElementById("sound-icon");
      this.levelBannerEl = document.getElementById("level-banner");

      this.angleSlider = document.getElementById("angle-slider");
      this.angleValEl = document.getElementById("angle-val");
      this.powerSlider = document.getElementById("power-slider");
      this.powerValEl = document.getElementById("power-val");
      this.swingBtn = document.getElementById("swing-btn");

      this.toastEl = document.getElementById("toast-notice");
      this.toastMsgEl = document.getElementById("toast-message");
      this.homerunBannerEl = document.getElementById("homerun-banner");

      // 遮罩彈窗
      this.startScreen = document.getElementById("start-screen");
      this.startBtn = document.getElementById("start-btn");

      this.levelClearScreen = document.getElementById("level-clear-screen");
      this.levelClearTitle = document.getElementById("level-clear-title");
      this.levelClearMsg = document.getElementById("level-clear-msg");
      this.nextLevelBtn = document.getElementById("next-level-btn");

      this.levelFailScreen = document.getElementById("level-fail-screen");
      this.levelFailHint = document.getElementById("level-fail-hint");
      this.retryBtn = document.getElementById("retry-btn");
      this.failHomeBtn = document.getElementById("fail-home-btn");

      this.championScreen = document.getElementById("champion-screen");
      this.championRestartBtn = document.getElementById("champion-restart-btn");
      this.championHomeBtn = document.getElementById("champion-home-btn");

      // 雲朵裝飾
      this.clouds = [
        { x: 120, y: 70, s: 0.9, spd: 0.2 },
        { x: 480, y: 110, s: 1.2, spd: 0.25 },
        { x: 890, y: 60, s: 0.8, spd: 0.18 },
        { x: 1180, y: 130, s: 1.0, spd: 0.22 },
      ];

      // 觀眾小人隨機擺動相位
      this.audienceCount = 38;
      this.audienceOffsets = Array.from({ length: this.audienceCount }, () => Math.random() * Math.PI * 2);

      this.initEvents();
      this.resizeCanvas();
      window.addEventListener("resize", () => this.resizeCanvas());

      // 啟動主繪圖迴圈
      this.lastFrameTime = performance.now();
      requestAnimationFrame((t) => this.loop(t));
    }

    // 事件監聽與綁定
    initEvents() {
      // 點擊開始挑戰：依照規範直接進第一關，不出現任何教學
      this.startBtn.addEventListener("click", () => {
        this.sound.init();
        this.sound.playClick();
        this.hideAllOverlays();
        this.startLevel(0);
      });

      // 角度滑桿即時連動
      this.angleSlider.addEventListener("input", (e) => {
        this.angle = parseInt(e.target.value, 10);
        this.angleValEl.textContent = `${this.angle}°`;
      });

      // 力道滑桿即時連動
      this.powerSlider.addEventListener("input", (e) => {
        this.power = parseInt(e.target.value, 10);
        this.powerValEl.textContent = `${this.power}%`;
        this.updatePowerTrackStyle();
      });

      // 揮棒按鈕
      this.swingBtn.addEventListener("click", () => {
        this.handleSwingAction();
      });

      // 音效切換按鈕
      this.soundToggleBtn.addEventListener("click", () => {
        this.sound.init();
        const enabled = this.sound.toggle();
        this.soundIconEl.textContent = enabled ? "🔊" : "🔇";
        if (enabled) this.sound.playClick();
      });

      // 關卡過關「下一關」按鈕
      this.nextLevelBtn.addEventListener("click", () => {
        this.sound.playClick();
        this.hideAllOverlays();
        if (this.currentLevelIndex + 1 < LEVELS.length) {
          this.startLevel(this.currentLevelIndex + 1);
        } else {
          this.showChampionScreen();
        }
      });

      // 挑戰失敗「重新挑戰本關」按鈕
      this.retryBtn.addEventListener("click", () => {
        this.sound.playClick();
        this.hideAllOverlays();
        this.startLevel(this.currentLevelIndex);
      });

      // 挑戰失敗「返回首頁」按鈕
      this.failHomeBtn.addEventListener("click", () => {
        this.sound.playClick();
        this.hideAllOverlays();
        this.showStartScreen();
      });

      // 冠軍「重新挑戰」按鈕
      this.championRestartBtn.addEventListener("click", () => {
        this.sound.playClick();
        this.hideAllOverlays();
        this.startLevel(0);
      });

      // 冠軍「返回首頁」按鈕
      this.championHomeBtn.addEventListener("click", () => {
        this.sound.playClick();
        this.hideAllOverlays();
        this.showStartScreen();
      });

      // 預設更新一次力道顏色條
      this.updatePowerTrackStyle();
    }

    // 更新力道滑桿背景漸層色彩
    updatePowerTrackStyle() {
      const min = 40;
      const max = 100;
      const pct = ((this.power - min) / (max - min)) * 100;
      this.powerSlider.style.background = `linear-gradient(to right, #4caf50 0%, #fbc02d 50%, #f44336 100%)`;
    }

    // Canvas 邏輯解析度維持 1280x720，高 DPI 銳利繪製
    resizeCanvas() {
      const rect = this.canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = 1280 * dpr;
      this.canvas.height = 720 * dpr;
      this.ctx.resetTransform();
      this.ctx.scale(dpr, dpr);
    }

    // 關卡初始化
    startLevel(index) {
      this.currentLevelIndex = index;
      this.chancesLeft = 3;
      this.isSwinging = false;
      this.swingPhase = 0;
      this.flightActive = false;
      this.ballPath = [];
      this.particles.clear();
      this.hideToast();
      this.homerunBannerEl.classList.remove("active");

      const level = LEVELS[this.currentLevelIndex];
      this.levelNumEl.textContent = `${level.id}／${LEVELS.length}`;
      this.levelNameEl.textContent = level.name;
      this.levelBannerEl.textContent = `第 ${level.id} 關：${level.name}（全壘打牆高度：${level.height}，距離：${level.distance}）- ${level.tip}`;

      this.updateChancesHUD();
      this.enableControls(true);

      // 重設球位置到擊球點
      this.ball.x = 0;
      this.ball.y = PHYSICS.y0;
      this.ball.vx = 0;
      this.ball.vy = 0;
      this.ball.landed = false;
      this.ball.hitWall = false;
      this.ball.isHomeRun = false;
    }

    // 更新剩餘揮棒次數圖示
    updateChancesHUD() {
      this.chancesContainerEl.innerHTML = "";
      for (let i = 0; i < 3; i++) {
        const ball = document.createElement("div");
        ball.className = "ball-chance" + (i >= this.chancesLeft ? " used" : "");
        this.chancesContainerEl.appendChild(ball);
      }
    }

    // 啟用或鎖定控制元件（避免揮棒動畫中重複點擊）
    enableControls(enable) {
      this.swingBtn.disabled = !enable;
      this.angleSlider.disabled = !enable;
      this.powerSlider.disabled = !enable;
    }

    // 執行揮棒動作
    handleSwingAction() {
      if (this.isSwinging || this.chancesLeft <= 0) return;
      this.sound.init();

      // 1. 扣除揮棒次數
      this.chancesLeft--;
      this.updateChancesHUD();

      // 2. 停用操作控制項
      this.enableControls(false);
      this.isSwinging = true;
      this.swingPhase = 1; // 揮棒中
      this.batterAnimTimer = 0;
      this.ballPath = [];
      this.hideToast();

      // 3. 播放揮棒音效
      this.sound.playSwing();

      // 4. 計算初速度與物理軌跡
      const v = (this.power / 100.0) * PHYSICS.vScale;
      const rad = (this.angle * Math.PI) / 180.0;
      const vx = v * Math.cos(rad);
      const vy = v * Math.sin(rad);

      // 模擬整個飛行過程並事先算出判定結果
      this.lastResult = this.calculatePhysicsResult(vx, vy);

      // 揮棒延遲約 180ms 後正中球心擊出
      setTimeout(() => {
        this.sound.playHit();
        const pX = PHYSICS.originX;
        const pY = PHYSICS.groundY - PHYSICS.y0 * PHYSICS.scale;
        this.particles.sparkHit(pX, pY, 25);

        // 啟動球的飛行動畫
        this.flightActive = true;
        this.flightStartTime = performance.now();
        this.ball.x = 0;
        this.ball.y = PHYSICS.y0;
        this.ball.vx = vx;
        this.ball.vy = vy;
        this.ball.landed = false;
        this.ball.hitWall = false;
      }, 180);
    }

    // 依據物理公式精確計算挑戰結果與提示訊息
    calculatePhysicsResult(vx, vy) {
      const level = LEVELS[this.currentLevelIndex];
      const D = level.distance;
      const H = level.height;
      const g = PHYSICS.g;
      const y0 = PHYSICS.y0;
      const r = PHYSICS.ballRadius;

      // 落地時間：y(t) = y0 + vy*t - 0.5*g*t^2 = 0
      const disc = vy * vy + 2 * g * y0;
      const tLand = (vy + Math.sqrt(disc)) / g;
      const xLand = vx * tLand;

      // 頂點高度與頂點時間
      const tApex = vy / g;
      const yApex = y0 + (vy * vy) / (2 * g);

      // 判斷是否能達到牆面
      if (xLand < D) {
        // 尚未抵達牆面即落地
        if (this.angle >= 55) {
          return {
            type: "HIGH_SHORT",
            tLand: tLand,
            xLand: xLand,
            msg: "這顆球飛得很高！試著降低一點角度，看看會不會飛得更遠！",
          };
        } else {
          return {
            type: "SHORT",
            tLand: tLand,
            xLand: xLand,
            msg: "差一點就到圍牆了！試著增加力道，或調整角度！",
          };
        }
      }

      // 能抵達全壘打牆水平位置 x = D
      const tWall = D / vx;
      const yWall = y0 + vy * tWall - 0.5 * g * tWall * tWall;

      if (yWall - r > H) {
        // 成功飛越全壘打牆
        return {
          type: "HOMERUN",
          tLand: tLand,
          xLand: xLand,
          tWall: tWall,
          yWall: yWall,
          msg: level.successMsg,
        };
      } else {
        // 抵達牆面時高度不足，撞在牆上
        return {
          type: "LOW",
          tWall: tWall,
          yWall: Math.max(0, yWall),
          msg: "球飛得很遠，但高度不夠！試試調整擊球角度！",
        };
      }
    }

    // 棒球飛行結束後的結算處理
    onFlightCompleted() {
      this.flightActive = false;

      if (this.lastResult.type === "HOMERUN") {
        // 成功擊出全壘打！
        this.swingPhase = 2; // 慶祝姿勢
        this.sound.playHomeRun();
        this.homerunBannerEl.classList.add("active");

        // 全螢幕爆發彩帶
        this.particles.explodeConfetti(640, 260, 160);

        setTimeout(() => {
          this.showLevelClearScreen();
        }, 1800);
      } else {
        // 挑戰未成功
        this.swingPhase = 3; // 懊惱姿勢

        if (this.chancesLeft > 0) {
          // 仍有機會：顯示氣泡提示，並重新啟用按鈕
          this.sound.playFail();
          this.showToast(this.lastResult.msg);
          setTimeout(() => {
            this.isSwinging = false;
            this.swingPhase = 0;
            this.enableControls(true);
          }, 1200);
        } else {
          // 3 次機會用盡：判定關卡挑戰失敗
          this.sound.playFail();
          setTimeout(() => {
            this.showLevelFailScreen(this.lastResult.msg);
          }, 1000);
        }
      }
    }

    // 彈出短暫非阻塞提示
    showToast(msg) {
      this.toastMsgEl.textContent = msg;
      this.toastEl.classList.add("show");
    }

    hideToast() {
      this.toastEl.classList.remove("show");
    }

    // 顯示關卡成功結算畫面
    showLevelClearScreen() {
      const level = LEVELS[this.currentLevelIndex];
      this.levelClearTitle.textContent = `第 ${level.id} 關挑戰成功！`;
      this.levelClearMsg.textContent = level.successMsg;
      this.levelClearScreen.classList.add("active");
    }

    // 顯示關卡失敗結算畫面
    showLevelFailScreen(hint) {
      this.levelFailHint.textContent = `💡 提示：${hint}`;
      this.levelFailScreen.classList.add("active");
    }

    // 顯示最終冠軍畫面
    showChampionScreen() {
      this.sound.playChampion();
      this.particles.explodeConfetti(640, 200, 200);
      this.championScreen.classList.add("active");
    }

    // 顯示首頁
    showStartScreen() {
      this.startScreen.classList.add("active");
    }

    // 隱藏所有彈窗
    hideAllOverlays() {
      const overlays = document.querySelectorAll(".overlay-screen");
      overlays.forEach((el) => el.classList.remove("active"));
    }

    /* ==========================================================================
       五、 主循環動畫更新與繪製
       ========================================================================== */
    loop(currentTime) {
      const dt = Math.min(0.05, (currentTime - this.lastFrameTime) / 1000.0);
      this.lastFrameTime = currentTime;

      this.update(dt, currentTime);
      this.draw();

      requestAnimationFrame((t) => this.loop(t));
    }

    update(dt, currentTime) {
      // 1. 雲朵移動
      this.clouds.forEach((c) => {
        c.x += c.spd;
        if (c.x > 1350) c.x = -150;
      });

      // 2. 揮棒計時更新
      if (this.swingPhase === 1) {
        this.batterAnimTimer += dt;
      }

      // 3. 棒球飛行更新
      if (this.flightActive) {
        const elapsed = (currentTime - this.flightStartTime) / 1000.0;
        const res = this.lastResult;
        const level = LEVELS[this.currentLevelIndex];
        const g = PHYSICS.g;

        if (res.type === "HOMERUN") {
          // 全壘打：越過牆面，飛行時間至 tLand 後落地
          if (elapsed >= res.tLand) {
            this.ball.x = res.xLand;
            this.ball.y = 0;
            this.ball.landed = true;
            this.onFlightCompleted();
          } else {
            this.ball.x = this.ball.vx * elapsed;
            this.ball.y = PHYSICS.y0 + this.ball.vy * elapsed - 0.5 * g * elapsed * elapsed;
          }
        } else if (res.type === "LOW") {
          // 高度不足：抵達牆面時撞牆
          if (elapsed >= res.tWall) {
            if (!this.ball.hitWall) {
              this.ball.hitWall = true;
              this.sound.playWallHit();
              const pX = PHYSICS.originX + level.distance * PHYSICS.scale;
              const pY = PHYSICS.groundY - res.yWall * PHYSICS.scale;
              this.particles.sparkHit(pX, pY, 18);
            }
            // 撞牆後沿著牆面下落
            const dropTime = elapsed - res.tWall;
            this.ball.x = level.distance;
            this.ball.y = Math.max(0, res.yWall - 0.5 * g * dropTime * dropTime * 4);
            if (this.ball.y <= 0) {
              this.ball.landed = true;
              this.onFlightCompleted();
            }
          } else {
            this.ball.x = this.ball.vx * elapsed;
            this.ball.y = PHYSICS.y0 + this.ball.vy * elapsed - 0.5 * g * elapsed * elapsed;
          }
        } else {
          // 距離不足 (SHORT / HIGH_SHORT)：在牆前落地
          if (elapsed >= res.tLand) {
            this.ball.x = res.xLand;
            this.ball.y = 0;
            this.ball.landed = true;
            this.onFlightCompleted();
          } else {
            this.ball.x = this.ball.vx * elapsed;
            this.ball.y = PHYSICS.y0 + this.ball.vy * elapsed - 0.5 * g * elapsed * elapsed;
          }
        }

        // 記錄軌跡點
        this.ballPath.push({
          px: PHYSICS.originX + this.ball.x * PHYSICS.scale,
          py: PHYSICS.groundY - this.ball.y * PHYSICS.scale,
        });
      }

      // 4. 粒子更新
      this.particles.update();
    }

    /* ==========================================================================
       六、 Canvas 畫面繪製細節（日系精緻 Q 版棒球風格）
       ========================================================================== */
    draw() {
      const ctx = this.ctx;
      const level = LEVELS[this.currentLevelIndex];

      // 1. 天空漸層背景
      const skyGrad = ctx.createLinearGradient(0, 0, 0, PHYSICS.groundY);
      skyGrad.addColorStop(0, level.skyColor[0]);
      skyGrad.addColorStop(1, level.skyColor[1]);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, 1280, 720);

      // 2. 雲朵繪製
      this.drawClouds(ctx);

      // 3. 觀眾看台與觀眾小人
      this.drawAudienceStand(ctx);

      // 4. 球場草皮與內野打擊區紅土
      this.drawField(ctx);

      // 5. 外野全壘打牆（視覺比例精準呈現三關差異）
      this.drawOutfieldWall(ctx, level);

      // 6. 瞄準方向指示虛線（未揮棒時）
      if (!this.isSwinging) {
        this.drawAimGuide(ctx);
      }

      // 7. Q 版可愛棒球小選手
      this.drawBatter(ctx);

      // 8. 棒球飛行軌跡
      this.drawBallPath(ctx);

      // 9. 棒球本體與立體投影
      this.drawBall(ctx);

      // 10. 粒子特效（彩帶、火花）
      this.particles.draw(ctx);
    }

    // 繪製多層次立體蓬鬆白雲
    drawClouds(ctx) {
      ctx.save();
      this.clouds.forEach((c) => {
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.beginPath();
        ctx.arc(c.x, c.y, 30 * c.s, 0, Math.PI * 2);
        ctx.arc(c.x + 25 * c.s, c.y - 12 * c.s, 38 * c.s, 0, Math.PI * 2);
        ctx.arc(c.x + 55 * c.s, c.y, 28 * c.s, 0, Math.PI * 2);
        ctx.arc(c.x + 20 * c.s, c.y + 10 * c.s, 24 * c.s, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    // 繪製遠景觀眾看台與熱情觀眾
    drawAudienceStand(ctx) {
      ctx.save();
      const standTopY = 320;
      const standBottomY = 440;

      // 看台斜坡本體
      const standGrad = ctx.createLinearGradient(0, standTopY, 0, standBottomY);
      standGrad.addColorStop(0, "#78909c");
      standGrad.addColorStop(1, "#cfd8dc");
      ctx.fillStyle = standGrad;
      ctx.fillRect(0, standTopY, 1280, standBottomY - standTopY);

      // 看台橫條階梯
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 3;
      for (let y = standTopY + 25; y < standBottomY; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1280, y);
        ctx.stroke();
      }

      // 觀眾小人（彩色小頭與擺動加油棒）
      const colors = ["#e53935", "#1e88e5", "#fdd835", "#43a047", "#8e24aa", "#fb8c00"];
      for (let i = 0; i < this.audienceCount; i++) {
        const x = 30 + i * 33;
        const row = i % 3;
        const baseY = standTopY + 20 + row * 32;
        const bob = Math.sin(performance.now() * 0.004 + this.audienceOffsets[i]) * 3;
        const col = colors[i % colors.length];

        // 身體
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(x, baseY + bob, 8, 0, Math.PI * 2);
        ctx.fill();

        // 頭盔或帽子
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(x, baseY + bob - 3, 5, 0, Math.PI, true);
        ctx.fill();

        // 揮舞的小加油旗
        if (i % 4 === 0) {
          ctx.strokeStyle = "#ffeb3b";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x + 6, baseY + bob);
          ctx.lineTo(x + 12, baseY + bob - 14);
          ctx.stroke();

          ctx.fillStyle = "#e53935";
          ctx.beginPath();
          ctx.moveTo(x + 12, baseY + bob - 14);
          ctx.lineTo(x + 22, baseY + bob - 10);
          ctx.lineTo(x + 12, baseY + bob - 6);
          ctx.closePath();
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // 繪製草坪與內野打擊紅土
    drawField(ctx) {
      ctx.save();
      const groundY = PHYSICS.groundY;

      // 1. 草皮條紋（深淺綠交替）
      ctx.fillStyle = "#43a047";
      ctx.fillRect(0, 440, 1280, 280);

      ctx.fillStyle = "rgba(76, 175, 80, 0.4)";
      for (let x = 0; x < 1280; x += 90) {
        ctx.fillRect(x, 440, 45, 280);
      }

      // 2. 本壘板打擊區紅土橢圓
      ctx.fillStyle = "#bcaaa4";
      ctx.beginPath();
      ctx.ellipse(PHYSICS.originX - 10, groundY + 10, 80, 36, 0, 0, Math.PI * 2);
      ctx.fill();

      // 打擊白線方框
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.strokeRect(PHYSICS.originX - 60, groundY - 14, 50, 44);

      // 本壘板五邊形
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      const hx = PHYSICS.originX + 8;
      const hy = groundY;
      ctx.moveTo(hx, hy);
      ctx.lineTo(hx + 14, hy);
      ctx.lineTo(hx + 14, hy + 10);
      ctx.lineTo(hx + 7, hy + 18);
      ctx.lineTo(hx, hy + 10);
      ctx.closePath();
      ctx.fill();

      // 草地邊界線
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(hx + 7, hy);
      ctx.lineTo(1280, hy - 40);
      ctx.stroke();

      ctx.restore();
    }

    // 繪製全壘打牆（視覺比例鮮明、包含全壘打黃線與距離標記）
    drawOutfieldWall(ctx, level) {
      ctx.save();
      const wallPixelX = PHYSICS.originX + level.distance * PHYSICS.scale;
      const wallPixelH = level.height * PHYSICS.scale;
      const wallTopPixelY = PHYSICS.groundY - wallPixelH;
      const wallWidth = 24;

      // 牆本體
      ctx.fillStyle = level.wallColor;
      ctx.fillRect(wallPixelX, wallTopPixelY, wallWidth, wallPixelH);

      // 牆面立體邊線
      ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
      ctx.lineWidth = 2;
      ctx.strokeRect(wallPixelX, wallTopPixelY, wallWidth, wallPixelH);

      // 牆頂亮黃色全壘打頂線（Home Run Line）
      ctx.fillStyle = level.wallTopColor;
      ctx.fillRect(wallPixelX - 2, wallTopPixelY - 5, wallWidth + 4, 7);

      // 標註高度與距離標牌
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px system-ui";
      ctx.textAlign = "center";

      // 距離標誌牌（例如：75 或 105）
      ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
      ctx.fillRect(wallPixelX - 18, PHYSICS.groundY - 35, 60, 24);
      ctx.fillStyle = "#ffeb3b";
      ctx.fillText(`${level.distance} M`, wallPixelX + 12, PHYSICS.groundY - 18);

      // 高度標誌牌（如果是巨人高牆，在頂部標示超高高度）
      if (level.height >= 15) {
        ctx.fillStyle = "rgba(229, 57, 53, 0.9)";
        ctx.fillRect(wallPixelX - 24, wallTopPixelY + 12, 72, 22);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 12px system-ui";
        ctx.fillText(`高牆 ${level.height} M`, wallPixelX + 12, wallTopPixelY + 28);
      }

      ctx.restore();
    }

    // 繪製擊球瞄準輔助虛線
    drawAimGuide(ctx) {
      ctx.save();
      const rad = (this.angle * Math.PI) / 180.0;
      const len = 90;
      const startX = PHYSICS.originX - 10;
      const startY = PHYSICS.groundY - PHYSICS.y0 * PHYSICS.scale - 12;
      const endX = startX + Math.cos(rad) * len;
      const endY = startY - Math.sin(rad) * len;

      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = "rgba(255, 235, 59, 0.9)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // 瞄準箭頭頭部
      ctx.setLineDash([]);
      ctx.fillStyle = "#ffca28";
      ctx.beginPath();
      ctx.arc(endX, endY, 6, 0, Math.PI * 2);
      ctx.fill();

      // 顯示角度文字浮水印
      ctx.font = "bold 13px system-ui";
      ctx.fillStyle = "#fff8e1";
      ctx.fillText(`${this.angle}°`, endX + 10, endY - 4);

      ctx.restore();
    }

    // 繪製 Q 版棒球選手（頭戴帽子、球衣、持棒、多狀態切換）
    drawBatter(ctx) {
      ctx.save();
      const bx = PHYSICS.originX - 35;
      const by = PHYSICS.groundY - 14;

      // 呼吸律動浮動
      const idleBob = Math.sin(performance.now() * 0.005) * 2;

      // 1. 雙腳與鞋子
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#37474f";
      ctx.lineWidth = 2;

      // 左腳
      ctx.fillRect(bx - 12, by - 12, 10, 16);
      ctx.fillStyle = "#e53935";
      ctx.fillRect(bx - 14, by + 4, 14, 6); // 球鞋

      // 右腳
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(bx + 8, by - 12, 10, 16);
      ctx.fillStyle = "#e53935";
      ctx.fillRect(bx + 6, by + 4, 14, 6);

      // 2. 身體（球衣）
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(bx - 16, by - 44 + idleBob, 36, 34, 8);
      ctx.fill();
      ctx.stroke();

      // 球衣號碼條紋
      ctx.strokeStyle = "#1e88e5";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(bx + 2, by - 40 + idleBob);
      ctx.lineTo(bx + 2, by - 14 + idleBob);
      ctx.stroke();

      // 3. 頭部（Q 版大頭圓形）
      ctx.fillStyle = "#ffe0b2"; // 膚色
      ctx.beginPath();
      ctx.arc(bx + 2, by - 60 + idleBob, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#37474f";
      ctx.lineWidth = 2;
      ctx.stroke();

      // 臉部表情
      ctx.fillStyle = "#37474f";
      if (this.swingPhase === 2) {
        // 慶祝大笑 ^_^
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(bx - 3, by - 60 + idleBob, 4, Math.PI, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(bx + 7, by - 60 + idleBob, 4, Math.PI, 0);
        ctx.stroke();
        // 微笑大嘴
        ctx.fillStyle = "#d32f2f";
        ctx.beginPath();
        ctx.arc(bx + 2, by - 54 + idleBob, 5, 0, Math.PI);
        ctx.fill();
      } else if (this.swingPhase === 3) {
        // 懊惱 >_<
        ctx.fillText(">", bx - 7, by - 58 + idleBob);
        ctx.fillText("<", bx + 3, by - 58 + idleBob);
      } else {
        // 專注眼神
        ctx.beginPath();
        ctx.arc(bx - 2, by - 60 + idleBob, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(bx + 8, by - 60 + idleBob, 3, 0, Math.PI * 2);
        ctx.fill();
        // 腮紅
        ctx.fillStyle = "rgba(255, 138, 128, 0.6)";
        ctx.beginPath();
        ctx.arc(bx - 6, by - 54 + idleBob, 3, 0, Math.PI * 2);
        ctx.arc(bx + 12, by - 54 + idleBob, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. 棒球帽
      ctx.fillStyle = "#1565c0";
      ctx.beginPath();
      ctx.arc(bx + 2, by - 64 + idleBob, 18, Math.PI, 0);
      ctx.fill();

      // 帽簷
      ctx.fillStyle = "#0d47a1";
      ctx.beginPath();
      ctx.ellipse(bx + 12, by - 64 + idleBob, 14, 5, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // 5. 木質球棒與雙手揮動
      ctx.save();
      ctx.translate(bx + 6, by - 36 + idleBob);

      let batAngle = -0.6; // 預設斜後舉起
      if (this.swingPhase === 1) {
        // 揮棒中：0.35 秒內快速劃出一道圓弧
        const prog = Math.min(1.0, this.batterAnimTimer / 0.35);
        batAngle = -0.8 + prog * 2.2;
      } else if (this.swingPhase === 2) {
        // 慶祝時高舉球棒！
        batAngle = -1.9;
      }

      ctx.rotate(batAngle);

      // 球棒本體
      ctx.fillStyle = "#d7ccc8";
      ctx.fillRect(-3, -48, 7, 44);
      ctx.fillStyle = "#8d6e63"; // 棒頭加粗
      ctx.fillRect(-4, -48, 9, 20);
      // 球棒握把布
      ctx.fillStyle = "#3e2723";
      ctx.fillRect(-2, -14, 5, 12);

      ctx.restore();

      ctx.restore();
    }

    // 繪製棒球飛行軌跡（淡藍色光芒軌跡帶）
    drawBallPath(ctx) {
      if (this.ballPath.length < 2) return;
      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      ctx.lineWidth = 3;
      ctx.setLineDash([4, 4]);

      ctx.beginPath();
      ctx.moveTo(this.ballPath[0].px, this.ballPath[0].py);
      for (let i = 1; i < this.ballPath.length; i++) {
        ctx.lineTo(this.ballPath[i].px, this.ballPath[i].py);
      }
      ctx.stroke();
      ctx.restore();
    }

    // 繪製棒球本體與地面陰影
    drawBall(ctx) {
      ctx.save();
      const px = PHYSICS.originX + this.ball.x * PHYSICS.scale;
      const py = PHYSICS.groundY - this.ball.y * PHYSICS.scale;
      const groundShadowY = PHYSICS.groundY;

      // 1. 地面投射陰影（高度越高陰影越淡越小）
      const heightAboveGround = Math.max(0, this.ball.y);
      const shadowAlpha = Math.max(0.08, 0.35 - heightAboveGround * 0.015);
      const shadowSize = Math.max(3, 8 - heightAboveGround * 0.2);

      ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
      ctx.beginPath();
      ctx.ellipse(px, groundShadowY + 2, shadowSize * 1.5, shadowSize * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. 棒球球體
      const r = 7;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#e53935";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 棒球紅色縫線弧度
      ctx.beginPath();
      ctx.arc(px - 2, py, 4, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(px + 2, py, 4, Math.PI / 2, -Math.PI / 2);
      ctx.stroke();

      ctx.restore();
    }
  }

  // 視窗載入完成後啟動遊戲
  window.addEventListener("DOMContentLoaded", () => {
    window.gameInstance = new HomeRunGame();
  });
})();
