/**
 * 《喵喵情緒偵探》Cat Detective
 * 貓咪肢體語言觀察推理教育遊戲核心邏輯腳本
 *
 * 設計原則：
 * 1. 純原生 JavaScript（無任何外部相依套件）
 * 2. 嚴格遵循台灣繁體中文排版與無障礙點擊
 * 3. 採用 Web Audio API 實現純程式合成音效（保證離線與靜態部署 100% 正常發聲）
 * 4. 具備完整的案件狀態流轉與容錯教育反饋機制
 */

(function () {
  'use strict';

  // ==========================================================================
  // 一、 Web Audio API 音效合成引擎
  // ==========================================================================

  class SoundEffects {
    constructor() {
      this.audioCtx = null;
      this.soundEnabled = true;
      this.initialized = false;
    }

    init() {
      if (this.initialized) return;
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
          this.initialized = true;
        }
      } catch (err) {
        console.warn('Web Audio API 初始化略過：', err);
      }
    }

    resume() {
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
    }

    toggle() {
      this.soundEnabled = !this.soundEnabled;
      return this.soundEnabled;
    }

    // 1. 輕快按鈕點擊音（柔和泡泡波）
    playClick() {
      if (!this.soundEnabled) return;
      this.init();
      this.resume();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.audioCtx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.08);
    }

    // 2. 發現線索音（清脆水晶鈴聲）
    playClue() {
      if (!this.soundEnabled) return;
      this.init();
      this.resume();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const notes = [587.33, 880, 1174.66]; // D5, A5, D6

      notes.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0.14, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.28);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.28);
      });
    }

    // 3. 答對成功和弦（清亮愉悅叮咚）
    playCorrect() {
      if (!this.soundEnabled) return;
      this.init();
      this.resume();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const chord = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

      chord.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);

        gain.gain.setValueAtTime(0.18, now + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.45);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.45);
      });
    }

    // 4. 提示/答錯柔和音（不挫折低音撫慰提示）
    playWrong() {
      if (!this.soundEnabled) return;
      this.init();
      this.resume();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const notes = [349.23, 293.66]; // F4, D4

      notes.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0.12, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.25);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.25);
      });
    }

    // 5. 通關大勝利號角小調
    playFanfare() {
      if (!this.soundEnabled) return;
      this.init();
      this.resume();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const fanfare = [
        { f: 523.25, d: 0.14 }, // C5
        { f: 659.25, d: 0.14 }, // E5
        { f: 783.99, d: 0.14 }, // G5
        { f: 1046.5, d: 0.42 }  // C6
      ];

      let elapsed = 0;
      fanfare.forEach((note) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, now + elapsed);

        gain.gain.setValueAtTime(0.2, now + elapsed);
        gain.gain.exponentialRampToValueAtTime(0.001, now + elapsed + note.d);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now + elapsed);
        osc.stop(now + elapsed + note.d);

        elapsed += note.d * 0.85;
      });
    }
  }

  const sounds = new SoundEffects();

  // ==========================================================================
  // 二、 案件資料庫（三關完整內容與科普教育知識庫）
  // ==========================================================================

  const CASES_DATA = [
    {
      id: 1,
      badge: '案件一（1／3）',
      title: '活力橘貓的邀請',
      sceneClass: 'scene-case-1',
      description: '客廳裡的橘貓一直盯著我看，尾巴豎得高高的，甚至發出呼嚕聲，牠想表達什麼呢？',
      catType: 'orange-cat',
      hotspots: [
        {
          id: 'tail',
          name: '尾巴部位',
          icon: '🐾',
          xPercent: 18,
          yPercent: 44,
          observation: '尾巴高高豎立，尾端帶點微彎，輕輕搖擺。',
          meaning: '尾巴直立表示開心、想玩與自信。',
          memo: '直立的尾巴代表友善與放鬆的心情喔！'
        },
        {
          id: 'ears',
          name: '耳朵部位',
          icon: '👂',
          xPercent: 42,
          yPercent: 22,
          observation: '雙耳自然朝前豎起，對聲音好奇專注。',
          meaning: '耳朵向前傾表示警戒或對周遭感到好奇。',
          memo: '搭配放鬆的姿勢，表示對眼前事物很感興趣！'
        },
        {
          id: 'eyes',
          name: '眼睛與眼神',
          icon: '👀',
          xPercent: 62,
          yPercent: 34,
          observation: '雙眼圓睜溫和，在光線下瞳孔微微放大。',
          meaning: '瞳孔放大可能放鬆，也可能興奮想玩。',
          memo: '單看瞳孔不夠，要搭配尾巴與身體綜合判斷！'
        },
        {
          id: 'body',
          name: '身體與前腳',
          icon: '🐾',
          xPercent: 64,
          yPercent: 74,
          observation: '身體姿勢放鬆舒展，前腳掌正溫柔踩踏。',
          meaning: '身體放鬆、輕輕踩踏表示感到安心與信任。',
          memo: '幼貓時期的踩奶行為，只有在最放鬆時才會出現！'
        }
      ],
      emotionQuestion: {
        title: '這隻橘貓現在的心情是什麼呢？',
        options: [
          {
            key: 'A',
            text: '開心／放鬆／想玩',
            isCorrect: true,
            hint: '答對了！尾巴直立搭配放鬆舒展的身體，代表牠心情極佳！'
          },
          {
            key: 'B',
            text: '緊張／害怕',
            isCorrect: false,
            hint: '再想想看！害怕的貓咪通常會把尾巴夾起來、身體壓低，但這隻貓咪尾巴高高豎立喔！'
          },
          {
            key: 'C',
            text: '生氣／警戒',
            isCorrect: false,
            hint: '再想想看！生氣時通常會炸毛、背部拱起並劇烈甩尾，這隻貓咪神態很安詳放鬆喔！'
          }
        ]
      },
      actionQuestion: {
        title: '身為專業情緒偵探，現在最好的互動方式是？',
        confirmedText: '開心／放鬆／想玩',
        options: [
          {
            key: 'A',
            text: '拿出玩具溫和互動，例如用逗貓棒陪牠玩',
            isCorrect: true,
            hint: '做得好！當貓咪放鬆又想玩時，用逗貓棒進行適度溫和的互動最能增進感情！'
          },
          {
            key: 'B',
            text: '突然衝過去用力抱緊牠轉圈圈',
            isCorrect: false,
            hint: '太急了喔！即使貓咪心情好，突如其來的粗魯動作還是會嚇到牠！'
          },
          {
            key: 'C',
            text: '在牠耳邊用力拍手大喊「你好棒」',
            isCorrect: false,
            hint: '這樣不行喔！貓咪耳朵非常敏銳，巨大噪音會瞬間引發驚嚇與恐慌！'
          }
        ]
      },
      summary: {
        clues: '耳朵自然朝前豎立、尾巴筆直高高豎起、眼神溫和瞳孔微放大、身體放鬆踩踏。',
        education: '答對了！這隻貓咪雖然瞳孔放大，但搭配尾巴直立、身體放鬆，可以推測牠現在心情極佳、想互動玩耍。此時拿出逗貓棒陪牠玩，是培養默契的最佳時機！'
      }
    },
    {
      id: 2,
      badge: '案件二（2／3）',
      title: '躲在角落的小灰貓',
      sceneClass: 'scene-case-2',
      description: '剛到新家的小灰貓躲在房間角落動也不敢動，周遭環境對牠來說很陌生，該怎麼讀懂牠的心情？',
      catType: 'gray-cat',
      hotspots: [
        {
          id: 'ears',
          name: '耳朵部位',
          icon: '👂',
          xPercent: 38,
          yPercent: 30,
          observation: '耳朵朝兩側折平貼在頭頂，形成俗稱的「飛機耳」。',
          meaning: '耳朵向後折平（飛機耳）表示害怕或受到驚嚇。',
          memo: '飛機耳代表貓咪感受到威脅或不安！'
        },
        {
          id: 'eyes',
          name: '眼睛眼神',
          icon: '👀',
          xPercent: 60,
          yPercent: 38,
          observation: '眼睛睜得很大、瞳孔擴大，驚恐警覺地盯著周圍。',
          meaning: '瞳孔緊繃放大，眼神警覺，隨時防備危險。',
          memo: '處於防備狀態，正在評估周圍環境是否安全。'
        },
        {
          id: 'tail',
          name: '尾巴部位',
          icon: '🐾',
          xPercent: 24,
          yPercent: 68,
          observation: '尾巴緊緊夾在兩隻後腳之間，縮得小小的。',
          meaning: '尾巴夾在後腿間表示極度害怕與缺乏安全感。',
          memo: '把尾巴藏起來是為了保護自己不被攻擊！'
        },
        {
          id: 'posture',
          name: '身體姿勢',
          icon: '📦',
          xPercent: 66,
          yPercent: 72,
          observation: '整個身體緊繃壓低，緊緊縮在角落紙箱旁。',
          meaning: '身體壓低縮成一團，代表極度緊張或試圖隱藏自己。',
          memo: '新環境容易讓貓咪感到不安，需要時間適應。'
        }
      ],
      emotionQuestion: {
        title: '這隻小灰貓現在的心情是什麼呢？',
        options: [
          {
            key: 'A',
            text: '緊張／害怕',
            isCorrect: true,
            hint: '觀察得太精準了！飛機耳、夾尾巴、身體壓低，全部指向極度緊張不安！'
          },
          {
            key: 'B',
            text: '放鬆／想睡覺',
            isCorrect: false,
            hint: '不對喔！放鬆的貓咪身體會舒展伸直，不會出現飛機耳與緊繃的姿態！'
          },
          {
            key: 'C',
            text: '興奮／想抓老鼠',
            isCorrect: false,
            hint: '再想想看！興奮想打獵的貓咪尾巴會抽動、眼神專注，而不會把尾巴緊緊夾在兩腳之間！'
          }
        ]
      },
      actionQuestion: {
        title: '面對剛到新環境、緊張害怕的小灰貓，最適當的做法是？',
        confirmedText: '緊張／害怕',
        options: [
          {
            key: 'A',
            text: '先不要強迫接觸，給牠安靜的時間與空間適應',
            isCorrect: true,
            hint: '做得好！貓咪到新環境容易緊張，耐心給牠時間與獨立空間，才是最溫柔的尊重！'
          },
          {
            key: 'B',
            text: '強行把牠從角落拖出來抱在懷裡安撫',
            isCorrect: false,
            hint: '千萬不可！強抱只會讓受到驚嚇的貓咪更加恐懼，甚至引發劇烈的防衛性抓咬！'
          },
          {
            key: 'C',
            text: '叫全家大小一起圍上去大聲呼叫牠的名字',
            isCorrect: false,
            hint: '這會嚇壞貓咪！吵雜的人群與環境會讓剛到家的新貓咪陷入極大恐慌！'
          }
        ]
      },
      summary: {
        clues: '耳朵向後折平（飛機耳）、眼神驚恐警戒、尾巴夾在後腳間、身體緊繃壓低縮成一團。',
        education: '答對了！這隻小灰貓初來乍到，對陌生環境充滿不安。請記得教育重點：貓咪到新環境容易緊張，需要充足的時間與空間適應，絕對不能急著強行抱摸牠喔！'
      }
    },
    {
      id: 3,
      badge: '案件三（3／3）',
      title: '快要爆炸的花貓',
      sceneClass: 'scene-case-3',
      description: '走廊上突然有雜物傾倒發出巨響，驚動了這隻花貓。牠現在弓著背全身毛髮豎起，我們該怎麼辦？',
      catType: 'calico-cat',
      hotspots: [
        {
          id: 'fur',
          name: '背部與被毛',
          icon: '🦔',
          xPercent: 50,
          yPercent: 32,
          observation: '背部高高拱起，全身毛髮根根豎直（俗稱「炸毛」）。',
          meaning: '被毛豎直、炸毛表示生氣或高度緊張。',
          memo: '拱起背部並炸毛，是為了讓自己看起來巨大以嚇退對手！'
        },
        {
          id: 'tail',
          name: '尾巴部位',
          icon: '🐾',
          xPercent: 18,
          yPercent: 44,
          observation: '尾巴毛髮炸開，正大幅度、快速地左右劇烈擺動拍打。',
          meaning: '尾巴大幅度擺動可能表示煩躁、不開心或警戒。',
          memo: '不同於狗狗，貓咪尾巴大幅劇烈甩動通常是生氣的警告！'
        },
        {
          id: 'teeth',
          name: '牙齒與嘴巴',
          icon: '🦷',
          xPercent: 74,
          yPercent: 48,
          observation: '嘴角向後拉扯、露出銳利牙齒，伴隨低沈嘶嘶聲（哈氣）。',
          meaning: '露出牙齒或發出哈氣聲，代表發出最後攻擊警告。',
          memo: '貓咪哈氣或露牙時，表示防衛界線已達到極限！'
        },
        {
          id: 'paws',
          name: '前腳爪子',
          icon: '🐾',
          xPercent: 68,
          yPercent: 78,
          observation: '前腳尖銳爪子伸出，肌肉緊繃緊扣地面，重心下沉。',
          meaning: '前腳伸爪緊扣地面，代表可能準備隨時發動攻擊。',
          memo: '已進入攻擊預備姿態，切勿靠近！'
        }
      ],
      emotionQuestion: {
        title: '這隻花貓現在的心情是什麼呢？',
        options: [
          {
            key: 'A',
            text: '生氣／警戒／可能準備攻擊',
            isCorrect: true,
            hint: '非常敏銳！炸毛、拱背、甩尾加露齒哈氣，是典型的生氣與警戒反擊訊號！'
          },
          {
            key: 'B',
            text: '開心撒嬌討摸摸',
            isCorrect: false,
            hint: '千萬別誤會！貓咪撒嬌會發出溫和呼嚕聲，而這隻花貓露齒哈氣又炸毛，非常生氣危險！'
          },
          {
            key: 'C',
            text: '無聊想睡午覺',
            isCorrect: false,
            hint: '再想想看！睡覺的貓咪身體會放鬆蜷曲，不會背部高高拱起、毛髮根根豎立喔！'
          }
        ]
      },
      actionQuestion: {
        title: '面對已經發出生氣警告訊號的花貓，最安全的應對是？',
        confirmedText: '生氣／警戒／可能準備攻擊',
        options: [
          {
            key: 'A',
            text: '停止接觸，保持距離，讓牠自行冷靜',
            isCorrect: true,
            hint: '答對了！當貓咪出現生氣或攻擊訊號時，人類唯一的安全法則就是停止接觸並退後！'
          },
          {
            key: 'B',
            text: '試著伸手摸摸牠的頭讓牠冷靜下來',
            isCorrect: false,
            hint: '極度危險！此時伸手接近，貓咪會視為威脅攻擊，絕對會立刻伸爪抓傷或咬傷你！'
          },
          {
            key: 'C',
            text: '拿零食直接塞到牠嘴邊討好牠',
            isCorrect: false,
            hint: '不適當喔！警戒中的貓咪完全沒有食慾，強行將手靠近嘴邊極易被咬傷！'
          }
        ]
      },
      summary: {
        clues: '背部高高拱起、全身炸毛、尾巴毛炸開大幅劇烈甩動、露齒哈氣、前腳伸爪備戰。',
        education: '答對了！這是一次完美的偵探推理。請永遠牢記：當貓咪出現炸毛、拱背或露牙哈氣等生氣或攻擊訊號時，請立即停止一切接觸，保持安全距離，讓牠有時間自我平復！'
      }
    }
  ];

  // ==========================================================================
  // 三、 貓咪 2D SVG 向量插畫產生器（精緻可愛 Q 版日系風格）
  // ==========================================================================

  const CatSvgGenerator = {
    // 1. 案件一：活力橘貓（放鬆、大眼、豎直尾巴晃動、踩踩腳）
    getOrangeCatSvg() {
      return `
        <svg viewBox="0 0 400 320" width="100%" height="100%" aria-hidden="true" style="overflow: visible;">
          <defs>
            <linearGradient id="orangeFurGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFA447"/>
              <stop offset="50%" stop-color="#FF8E26"/>
              <stop offset="100%" stop-color="#EA6700"/>
            </linearGradient>
            <linearGradient id="stripeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#C85000"/>
              <stop offset="100%" stop-color="#A73E00"/>
            </linearGradient>
          </defs>

          <!-- 尾巴（高高直立搖擺動畫） -->
          <g class="cat-tail-playful" id="svg-part-tail">
            <path d="M 120 180 C 80 150 70 80 85 50 C 95 30 115 25 125 38 C 132 48 118 75 110 110 C 105 130 115 160 135 185 Z" 
                  fill="url(#orangeFurGrad)"/>
            <!-- 尾巴橘色斑紋 -->
            <path d="M 88 56 Q 100 50 112 55" stroke="url(#stripeGrad)" stroke-width="4" fill="none" stroke-linecap="round"/>
            <path d="M 94 80 Q 105 75 116 82" stroke="url(#stripeGrad)" stroke-width="4" fill="none" stroke-linecap="round"/>
            <path d="M 100 110 Q 112 105 120 112" stroke="url(#stripeGrad)" stroke-width="4" fill="none" stroke-linecap="round"/>
          </g>

          <!-- 貓咪身體（放鬆舒展橢圓） -->
          <g id="svg-part-body">
            <ellipse cx="210" cy="205" rx="95" ry="68" fill="url(#orangeFurGrad)"/>
            <!-- 背部花紋 -->
            <path d="M 170 145 Q 185 165 170 185" stroke="url(#stripeGrad)" stroke-width="5" fill="none" stroke-linecap="round"/>
            <path d="M 200 140 Q 215 162 202 188" stroke="url(#stripeGrad)" stroke-width="5" fill="none" stroke-linecap="round"/>
            <path d="M 230 142 Q 242 165 232 185" stroke="url(#stripeGrad)" stroke-width="5" fill="none" stroke-linecap="round"/>
            <!-- 白肚肚 -->
            <ellipse cx="230" cy="225" rx="55" ry="38" fill="#FFF8EE"/>
          </g>

          <!-- 後腳 -->
          <ellipse cx="145" cy="245" rx="32" ry="22" fill="#EA6700"/>
          <ellipse cx="155" cy="250" rx="20" ry="14" fill="#FFF8EE"/>

          <!-- 前腳（輕微踏踏踩奶放鬆姿勢） -->
          <g id="svg-part-paws">
            <rect x="250" y="210" width="24" height="52" rx="12" fill="#FFA447"/>
            <rect x="280" y="212" width="24" height="50" rx="12" fill="#FFA447"/>
            <ellipse cx="262" cy="260" rx="15" ry="9" fill="#FFF8EE"/>
            <ellipse cx="292" cy="260" rx="15" ry="9" fill="#FFF8EE"/>
            <!-- 粉紅小肉墊線條 -->
            <circle cx="262" cy="261" r="3" fill="#FFAB91"/>
            <circle cx="292" cy="261" r="3" fill="#FFAB91"/>
          </g>

          <!-- 貓咪頭部 -->
          <g id="svg-part-head">
            <ellipse cx="270" cy="130" rx="66" ry="56" fill="url(#orangeFurGrad)"/>

            <!-- 耳朵（自然豎直朝前） -->
            <g id="svg-part-ears">
              <polygon points="225,95 210,35 258,68" fill="#EA6700"/>
              <polygon points="226,90 216,45 250,70" fill="#FFCCBC"/>
              <polygon points="305,92 345,35 320,85" fill="#EA6700"/>
              <polygon points="308,88 335,46 318,80" fill="#FFCCBC"/>
            </g>

            <!-- 額頭虎斑花紋 -->
            <path d="M 270 82 L 270 98" stroke="url(#stripeGrad)" stroke-width="4" stroke-linecap="round"/>
            <path d="M 260 86 Q 270 96 280 86" stroke="url(#stripeGrad)" stroke-width="3" fill="none" stroke-linecap="round"/>

            <!-- 眼睛（好奇大眼溫和放鬆） -->
            <g id="svg-part-eyes">
              <ellipse cx="244" cy="128" rx="12" ry="16" fill="#43A047"/>
              <ellipse cx="290" cy="128" rx="12" ry="16" fill="#43A047"/>
              <!-- 瞳孔微放大（好奇想玩） -->
              <ellipse cx="244" cy="128" rx="7" ry="13" fill="#1B5E20"/>
              <ellipse cx="290" cy="128" rx="7" ry="13" fill="#1B5E20"/>
              <!-- 水亮高光 -->
              <circle cx="240" cy="122" r="4.5" fill="#FFFFFF"/>
              <circle cx="286" cy="122" r="4.5" fill="#FFFFFF"/>
              <circle cx="246" cy="132" r="2" fill="#FFFFFF"/>
              <circle cx="292" cy="132" r="2" fill="#FFFFFF"/>
            </g>

            <!-- 鼻子與三叉嘴 -->
            <polygon points="267,144 261,138 273,138" fill="#FF8A80"/>
            <path d="M 261,146 Q 267,152 267,145 Q 267,152 273,146" fill="none" stroke="#5D4037" stroke-width="2.5" stroke-linecap="round"/>

            <!-- 鬍鬚（放鬆舒展） -->
            <line x1="228" y1="142" x2="195" y2="138" stroke="#5D4037" stroke-width="2" stroke-linecap="round"/>
            <line x1="228" y1="148" x2="192" y2="152" stroke="#5D4037" stroke-width="2" stroke-linecap="round"/>
            <line x1="305" y1="142" x2="338" y2="138" stroke="#5D4037" stroke-width="2" stroke-linecap="round"/>
            <line x1="305" y1="148" x2="340" y2="152" stroke="#5D4037" stroke-width="2" stroke-linecap="round"/>
          </g>
        </svg>
      `;
    },

    // 2. 案件二：害怕的小灰貓（飛機耳、縮在角落紙箱旁、夾尾巴、大恐慌眼神）
    getGrayCatSvg() {
      return `
        <svg viewBox="0 0 400 320" width="100%" height="100%" aria-hidden="true" style="overflow: visible;">
          <defs>
            <linearGradient id="grayFurGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#B0BEC5"/>
              <stop offset="50%" stop-color="#90A4AE"/>
              <stop offset="100%" stop-color="#607D8B"/>
            </linearGradient>
            <linearGradient id="boxGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#D7CCC8"/>
              <stop offset="100%" stop-color="#A1887F"/>
            </linearGradient>
          </defs>

          <!-- 角落瓦楞紙箱背景 -->
          <g id="svg-part-box" opacity="0.85">
            <polygon points="60,260 140,230 140,300 60,320" fill="#8D6E63"/>
            <polygon points="140,230 330,225 330,295 140,300" fill="url(#boxGrad)"/>
            <polygon points="60,260 140,230 330,225 240,255" fill="#BCAAA4"/>
            <!-- 紙箱膠帶痕跡 -->
            <line x1="180" y1="227" x2="180" y2="298" stroke="#FFE082" stroke-width="8" opacity="0.6"/>
          </g>

          <!-- 尾巴（夾在兩腳之間縮緊緊、微弱顫抖） -->
          <g class="cat-tail-scared" id="svg-part-tail">
            <path d="M 170 240 C 140 250 120 262 125 272 C 130 278 145 275 165 262 C 185 250 200 248 185 242 Z" 
                  fill="#78909C"/>
          </g>

          <!-- 縮小壓低緊繃的身體 -->
          <g class="cat-body-scared" id="svg-part-body">
            <ellipse cx="230" cy="225" rx="80" ry="52" fill="url(#grayFurGrad)"/>
            <!-- 緊繃蜷縮的後腿 -->
            <ellipse cx="175" cy="240" rx="34" ry="22" fill="#607D8B"/>
            <!-- 前腳縮在胸口不敢伸出 -->
            <ellipse cx="255" cy="252" rx="14" ry="12" fill="#CFD8DC"/>
            <ellipse cx="278" cy="252" rx="14" ry="12" fill="#CFD8DC"/>
          </g>

          <!-- 貓咪頭部（壓得很低） -->
          <g id="svg-part-head">
            <ellipse cx="260" cy="165" rx="58" ry="46" fill="url(#grayFurGrad)"/>

            <!-- 飛機耳（向兩側橫向折平貼在頭頂） -->
            <g id="svg-part-ears">
              <!-- 左耳橫向貼平 -->
              <polygon points="215,152 145,158 200,172" fill="#607D8B"/>
              <polygon points="212,154 155,160 198,170" fill="#FFCCBC"/>
              <!-- 右耳橫向貼平 -->
              <polygon points="305,152 375,158 320,172" fill="#607D8B"/>
              <polygon points="308,154 365,160 322,170" fill="#FFCCBC"/>
            </g>

            <!-- 眼睛（瞳孔高度放大、驚恐不安水汪汪） -->
            <g id="svg-part-eyes">
              <ellipse cx="238" cy="162" rx="15" ry="16" fill="#FFF"/>
              <ellipse cx="282" cy="162" rx="15" ry="16" fill="#FFF"/>
              <!-- 瞳孔極度放大（驚嚇受威脅） -->
              <circle cx="238" cy="162" r="12.5" fill="#263238"/>
              <circle cx="282" cy="162" r="12.5" fill="#263238"/>
              <!-- 驚恐淚珠光澤 -->
              <circle cx="233" cy="157" r="4.5" fill="#FFFFFF"/>
              <circle cx="277" cy="157" r="4.5" fill="#FFFFFF"/>
              <circle cx="242" cy="166" r="2" fill="#FFFFFF"/>
              <circle cx="286" cy="166" r="2" fill="#FFFFFF"/>
            </g>

            <!-- 緊抿的小鼻子與小嘴 -->
            <polygon points="260,178 255,173 265,173" fill="#FFAB91"/>
            <path d="M 255,180 Q 260,183 260,179 Q 260,183 265,180" fill="none" stroke="#37474F" stroke-width="2" stroke-linecap="round"/>

            <!-- 緊繃垂下的鬍鬚 -->
            <line x1="225" y1="178" x2="198" y2="185" stroke="#455A64" stroke-width="1.8" stroke-linecap="round"/>
            <line x1="225" y1="184" x2="202" y2="194" stroke="#455A64" stroke-width="1.8" stroke-linecap="round"/>
            <line x1="295" y1="178" x2="322" y2="185" stroke="#455A64" stroke-width="1.8" stroke-linecap="round"/>
            <line x1="295" y1="184" x2="318" y2="194" stroke="#455A64" stroke-width="1.8" stroke-linecap="round"/>
          </g>
        </svg>
      `;
    },

    // 3. 案件三：生氣炸毛花貓（拱背炸毛鋸齒、劇烈拍打甩尾、露齒哈氣嘴、倒豎伸爪）
    getCalicoCatSvg() {
      return `
        <svg viewBox="0 0 400 320" width="100%" height="100%" aria-hidden="true" style="overflow: visible;">
          <defs>
            <linearGradient id="calicoOrange" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FF7043"/>
              <stop offset="100%" stop-color="#D84315"/>
            </linearGradient>
            <linearGradient id="calicoBlack" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#424242"/>
              <stop offset="100%" stop-color="#212121"/>
            </linearGradient>
          </defs>

          <!-- 尾巴（炸毛、蓬鬆巨幅且劇烈快速抽打動畫） -->
          <g class="cat-tail-angry" id="svg-part-tail">
            <!-- 炸開毛躁鋸齒尾巴 -->
            <path d="M 120 185 
                     L 85 170 L 98 155 L 70 145 L 85 130 L 60 115 L 80 100 L 55 80 L 80 70 L 65 45
                     L 85 30 L 105 52 L 100 70 L 120 88 L 115 110 L 132 135 L 125 160 Z" 
                  fill="url(#calicoBlack)"/>
            <path d="M 75 75 L 90 60 L 85 85 L 105 75" stroke="#FF7043" stroke-width="3" fill="none"/>
          </g>

          <!-- 拱背炸毛身體（鋸齒狀背部突起） -->
          <g id="svg-part-body">
            <!-- 拱起的鋸齒背部外型 -->
            <path d="M 115 235 
                     L 125 190 L 118 180 L 135 155 L 128 145 L 150 120 L 142 110 L 175 90 L 170 82 
                     L 205 70 L 215 82 L 235 75 L 245 90 L 265 92 L 275 110 L 285 135 L 295 180 
                     L 280 245 L 210 240 Z" 
                  fill="#FFF8E7"/>

            <!-- 三花斑塊（背部黑橘相間） -->
            <path d="M 135 155 L 150 120 L 175 90 L 195 110 L 180 160 L 140 180 Z" fill="url(#calicoBlack)"/>
            <path d="M 195 75 L 235 75 L 245 90 L 230 135 L 190 130 Z" fill="url(#calicoOrange)"/>

            <!-- 後腳緊繃抓地 -->
            <path d="M 125 210 L 110 260 L 145 265 L 155 225 Z" fill="#212121"/>
          </g>

          <!-- 前腳（伸出鋒利爪子抓扣地面） -->
          <g id="svg-part-paws">
            <rect x="250" y="195" width="22" height="65" rx="6" fill="#FFF8E7"/>
            <rect x="280" y="195" width="22" height="65" rx="6" fill="url(#calicoOrange)"/>
            <!-- 伸出的爪子 -->
            <path d="M 248 260 L 242 268 M 255 260 L 253 270 M 264 260 L 266 270" stroke="#FFF" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M 278 260 L 272 268 M 285 260 L 283 270 M 294 260 L 296 270" stroke="#FFF" stroke-width="2.5" stroke-linecap="round"/>
          </g>

          <!-- 貓咪頭部（壓平怒視） -->
          <g id="svg-part-head">
            <ellipse cx="285" cy="150" rx="55" ry="46" fill="#FFF8E7"/>
            <path d="M 245 130 Q 285 110 325 130 Q 300 170 245 130" fill="url(#calicoOrange)"/>

            <!-- 耳朵（壓平緊貼向後，防衛戒備） -->
            <g id="svg-part-ears">
              <polygon points="250,135 190,115 235,150" fill="#212121"/>
              <polygon points="245,135 200,122 232,146" fill="#FF8A80"/>
              <polygon points="325,135 385,115 340,150" fill="url(#calicoOrange)"/>
              <polygon points="322,135 370,122 338,146" fill="#FF8A80"/>
            </g>

            <!-- 眼睛（倒八字怒視眼，犀利警戒） -->
            <g id="svg-part-eyes">
              <!-- 左眼怒視線條 -->
              <polygon points="255,140 278,145 265,158" fill="#FDD835"/>
              <line x1="266" y1="142" x2="266" y2="156" stroke="#212121" stroke-width="4" stroke-linecap="round"/>
              <!-- 右眼怒視線條 -->
              <polygon points="315,140 292,145 305,158" fill="#FDD835"/>
              <line x1="304" y1="142" x2="304" y2="156" stroke="#212121" stroke-width="4" stroke-linecap="round"/>
            </g>

            <!-- 嘴巴（露齒哈氣嘶嘶嘴） -->
            <g id="svg-part-mouth">
              <path d="M 270 162 Q 285 158 300 162 Q 285 184 270 162 Z" fill="#880E4F"/>
              <!-- 上尖牙 -->
              <polygon points="274,162 278,172 282,162" fill="#FFFFFF"/>
              <polygon points="288,162 292,172 296,162" fill="#FFFFFF"/>
              <!-- 下尖牙 -->
              <polygon points="281,180 285,173 289,180" fill="#FFFFFF"/>
            </g>

            <!-- 炸開怒張的鬍鬚 -->
            <line x1="250" y1="158" x2="215" y2="148" stroke="#212121" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="250" y1="165" x2="210" y2="168" stroke="#212121" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="320" y1="158" x2="355" y2="148" stroke="#212121" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="320" y1="165" x2="360" y2="168" stroke="#212121" stroke-width="2.5" stroke-linecap="round"/>
          </g>
        </svg>
      `;
    }
  };

  // ==========================================================================
  // 四、 遊戲主核心控制器（GameEngine）
  // ==========================================================================

  class CatDetectiveGame {
    constructor() {
      this.currentCaseIndex = 0;
      this.collectedClues = new Set();
      this.idleTimer = null;
      this.idleReminderSeconds = 12;

      // 快取 DOM 節點
      this.dom = {
        app: document.getElementById('game-app'),
        hudBadgeText: document.getElementById('hud-case-badge-text'),
        hudCaseName: document.getElementById('hud-case-name'),
        clueCountNum: document.getElementById('clue-count-num'),
        clueTotalNum: document.getElementById('clue-total-num'),
        soundToggleBtn: document.getElementById('btn-sound-toggle'),
        soundIcon: document.getElementById('sound-icon'),
        soundStatusText: document.getElementById('sound-status-text'),

        sceneBg: document.getElementById('scene-background'),
        bannerTitle: document.getElementById('banner-case-title'),
        bannerDesc: document.getElementById('banner-case-desc'),
        catSvgWrapper: document.getElementById('cat-svg-wrapper'),
        hotspotsLayer: document.getElementById('hotspots-layer'),

        guideTooltip: document.getElementById('guide-tooltip'),
        guideTooltipText: document.getElementById('guide-tooltip-text'),

        cluePopupCard: document.getElementById('clue-popup-card'),
        cluePartIcon: document.getElementById('clue-card-part-icon'),
        cluePartName: document.getElementById('clue-card-part-name'),
        clueDetail: document.getElementById('clue-card-detail'),
        clueMemo: document.getElementById('clue-card-memo'),
        btnCloseClue: document.getElementById('btn-close-clue'),
        btnConfirmClue: document.getElementById('btn-confirm-clue'),

        panelClueStatus: document.getElementById('panel-clue-status-text'),
        cluesTagList: document.getElementById('clues-tag-list'),
        btnTriggerDeduction: document.getElementById('btn-trigger-deduction'),

        // 全螢幕畫面模態
        screenStart: document.getElementById('screen-start'),
        btnStartGame: document.getElementById('btn-start-game'),

        screenEmotion: document.getElementById('screen-emotion-guess'),
        emotionClueRecap: document.getElementById('emotion-clue-recap'),
        emotionOptionsGroup: document.getElementById('emotion-options-group'),
        emotionFeedbackBox: document.getElementById('emotion-feedback-box'),
        emotionFeedbackText: document.getElementById('emotion-feedback-text'),
        btnBackToObserve1: document.getElementById('btn-back-to-observe-1'),

        screenAction: document.getElementById('screen-action-guess'),
        confirmedEmotionBadge: document.getElementById('confirmed-emotion-badge'),
        actionOptionsGroup: document.getElementById('action-options-group'),
        actionFeedbackBox: document.getElementById('action-feedback-box'),
        actionFeedbackText: document.getElementById('action-feedback-text'),
        btnBackToObserve2: document.getElementById('btn-back-to-observe-2'),

        screenSuccess: document.getElementById('screen-case-success'),
        successCaseName: document.getElementById('success-case-name'),
        successExpClues: document.getElementById('success-exp-clues'),
        successExpEducation: document.getElementById('success-exp-education'),
        btnNextCase: document.getElementById('btn-next-case'),
        btnNextCaseText: document.getElementById('btn-next-case-text'),

        screenComplete: document.getElementById('screen-game-complete'),
        btnReplayGame: document.getElementById('btn-replay-game'),
        btnReturnHome: document.getElementById('btn-return-home')
      };

      this.currentInspectedClue = null;
      this.bindEvents();
    }

    // 綁定事件監聽器
    bindEvents() {
      // 1. 音效切換
      this.dom.soundToggleBtn.addEventListener('click', () => {
        const isEnabled = sounds.toggle();
        this.dom.soundIcon.textContent = isEnabled ? '🔊' : '🔇';
        this.dom.soundStatusText.textContent = isEnabled ? '音效' : '靜音';
        sounds.playClick();
      });

      // 2. 開始遊戲
      this.dom.btnStartGame.addEventListener('click', () => {
        sounds.playClick();
        this.hideAllScreens();
        this.loadCase(0);
        // 第一關初始給予簡短提示
        this.showGuideToast('點擊貓咪身上的發光部位，蒐集線索，再判斷牠的情緒！');
      });

      // 3. 關閉與確認線索卡
      this.dom.btnCloseClue.addEventListener('click', () => {
        sounds.playClick();
        this.hideClueCard();
      });

      this.dom.btnConfirmClue.addEventListener('click', () => {
        sounds.playClick();
        this.hideClueCard();
      });

      // 4. 點擊「我知道了！開始推理」
      this.dom.btnTriggerDeduction.addEventListener('click', () => {
        sounds.playClick();
        this.handleStartDeduction();
      });

      // 5. 返回觀察按鈕
      this.dom.btnBackToObserve1.addEventListener('click', () => {
        sounds.playClick();
        this.dom.screenEmotion.classList.add('hidden');
      });

      this.dom.btnBackToObserve2.addEventListener('click', () => {
        sounds.playClick();
        this.dom.screenAction.classList.add('hidden');
      });

      // 6. 前往下一個案件
      this.dom.btnNextCase.addEventListener('click', () => {
        sounds.playClick();
        this.dom.screenSuccess.classList.add('hidden');
        if (this.currentCaseIndex < CASES_DATA.length - 1) {
          this.loadCase(this.currentCaseIndex + 1);
        } else {
          this.showCompleteScreen();
        }
      });

      // 7. 再玩一次
      this.dom.btnReplayGame.addEventListener('click', () => {
        sounds.playClick();
        this.hideAllScreens();
        this.loadCase(0);
      });

      // 8. 返回首頁
      this.dom.btnReturnHome.addEventListener('click', () => {
        sounds.playClick();
        this.hideAllScreens();
        this.dom.screenStart.classList.remove('hidden');
        this.dom.screenStart.classList.add('active-screen');
      });

      // 9. 監聽全域點擊以重設閒置計時器
      window.addEventListener('pointerdown', () => {
        this.resetIdleTimer();
      });
    }

    // 隱藏所有彈窗畫面
    hideAllScreens() {
      this.dom.screenStart.classList.add('hidden');
      this.dom.screenStart.classList.remove('active-screen');
      this.dom.screenEmotion.classList.add('hidden');
      this.dom.screenAction.classList.add('hidden');
      this.dom.screenSuccess.classList.add('hidden');
      this.dom.screenComplete.classList.add('hidden');
      this.hideClueCard();
    }

    // 載入案件
    loadCase(index) {
      this.currentCaseIndex = index;
      this.collectedClues.clear();
      const caseData = CASES_DATA[index];

      // 更新 HUD
      this.dom.hudBadgeText.textContent = caseData.badge;
      this.dom.hudCaseName.textContent = caseData.title;
      this.dom.clueCountNum.textContent = '0';
      this.dom.clueTotalNum.textContent = caseData.hotspots.length.toString();

      // 更新背景與橫幅
      this.dom.sceneBg.className = `scene-bg ${caseData.sceneClass}`;
      this.dom.bannerTitle.textContent = caseData.badge;
      this.dom.bannerDesc.textContent = caseData.description;

      // 渲染貓咪 SVG
      this.renderCatSvg(caseData.catType);

      // 渲染熱點按鈕
      this.renderHotspots(caseData.hotspots);

      // 重設底部筆記本摘要
      this.updateCluesNotebookUI();

      // 重設閒置計時器
      this.resetIdleTimer();
    }

    // 渲染貓咪 SVG
    renderCatSvg(type) {
      let svgHtml = '';
      if (type === 'orange-cat') {
        svgHtml = CatSvgGenerator.getOrangeCatSvg();
      } else if (type === 'gray-cat') {
        svgHtml = CatSvgGenerator.getGrayCatSvg();
      } else if (type === 'calico-cat') {
        svgHtml = CatSvgGenerator.getCalicoCatSvg();
      }
      this.dom.catSvgWrapper.innerHTML = svgHtml;
    }

    // 渲染熱點按鈕
    renderHotspots(hotspots) {
      this.dom.hotspotsLayer.innerHTML = '';

      hotspots.forEach((spot) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'hotspot-btn';
        btn.style.left = `${spot.xPercent}%`;
        btn.style.top = `${spot.yPercent}%`;
        btn.setAttribute('aria-label', `觀察貓咪${spot.name}`);
        btn.innerHTML = `
          <span>${spot.icon}</span>
          <span class="hotspot-label-tip">${spot.name}</span>
        `;

        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.inspectHotspot(spot, btn);
        });

        this.dom.hotspotsLayer.appendChild(btn);
      });
    }

    // 點擊熱點進行檢查
    inspectHotspot(spot, btnElement) {
      sounds.playClue();
      this.collectedClues.add(spot.id);

      if (btnElement) {
        btnElement.classList.add('collected');
      }

      this.currentInspectedClue = spot;
      this.showClueCard(spot);
      this.updateCluesNotebookUI();
      this.hideGuideToast();
    }

    // 顯示線索卡片彈窗
    showClueCard(spot) {
      this.dom.cluePartIcon.textContent = spot.icon;
      this.dom.cluePartName.textContent = spot.name;
      this.dom.clueDetail.textContent = spot.observation;
      this.dom.clueMemo.textContent = spot.memo || '記得結合其他部位一起綜合推理喔！';
      this.dom.cluePopupCard.classList.remove('hidden');
    }

    hideClueCard() {
      this.dom.cluePopupCard.classList.add('hidden');
    }

    // 更新底部偵探筆記本標籤清單
    updateCluesNotebookUI() {
      const caseData = CASES_DATA[this.currentCaseIndex];
      const count = this.collectedClues.size;
      const total = caseData.hotspots.length;

      this.dom.clueCountNum.textContent = count.toString();
      this.dom.panelClueStatus.textContent = `已蒐集 ${count}／${total} 個線索`;

      this.dom.cluesTagList.innerHTML = '';

      if (count === 0) {
        const emptyHint = document.createElement('div');
        emptyHint.className = 'clue-empty-hint';
        emptyHint.textContent = '請點擊畫面上貓咪身上的發光光圈，獲取身體語言線索！';
        this.dom.cluesTagList.appendChild(emptyHint);
      } else {
        caseData.hotspots.forEach((spot) => {
          if (this.collectedClues.has(spot.id)) {
            const tag = document.createElement('span');
            tag.className = 'clue-tag-item';
            tag.innerHTML = `<span>${spot.icon}</span> <span>${spot.name}</span>`;
            this.dom.cluesTagList.appendChild(tag);
          }
        });
      }
    }

    // 觸發推理步驟判斷
    handleStartDeduction() {
      const caseData = CASES_DATA[this.currentCaseIndex];
      const count = this.collectedClues.size;

      // 若未蒐集任何線索，給予溫暖引導提示
      if (count === 0) {
        sounds.playWrong();
        this.showGuideToast('請先點擊貓咪身上的發光部位，至少蒐集 1 個線索再推理喔！');
        return;
      }

      // 若只蒐集 1 個線索，跳出提示但仍允許繼續
      if (count === 1) {
        this.showGuideToast('提示：單一訊號不一定足夠，再多觀察幾個部位，答案會更清楚喔！');
      }

      this.openEmotionGuessModal();
    }

    // 開啟步驟一：貓咪心情推理彈窗
    openEmotionGuessModal() {
      const caseData = CASES_DATA[this.currentCaseIndex];
      this.dom.emotionFeedbackBox.classList.add('hidden');

      // 渲染已蒐集線索摘要條
      this.dom.emotionClueRecap.innerHTML = '';
      if (this.collectedClues.size > 0) {
        caseData.hotspots.forEach((spot) => {
          if (this.collectedClues.has(spot.id)) {
            const item = document.createElement('span');
            item.className = 'recap-item';
            item.textContent = `🔍 ${spot.name}：${spot.meaning}`;
            this.dom.emotionClueRecap.appendChild(item);
          }
        });
      }

      // 渲染選項按鈕
      this.dom.emotionOptionsGroup.innerHTML = '';
      caseData.emotionQuestion.options.forEach((opt) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'option-btn';
        btn.innerHTML = `
          <span class="option-key-badge">${opt.key}</span>
          <span class="option-text">${opt.text}</span>
        `;

        btn.addEventListener('click', () => {
          this.handleEmotionSelect(opt);
        });

        this.dom.emotionOptionsGroup.appendChild(btn);
      });

      this.dom.screenEmotion.classList.remove('hidden');
    }

    // 處理情緒選擇
    handleEmotionSelect(selectedOpt) {
      if (selectedOpt.isCorrect) {
        sounds.playCorrect();
        this.dom.screenEmotion.classList.add('hidden');
        // 進入步驟二：互動選擇
        this.openActionGuessModal();
      } else {
        sounds.playWrong();
        this.dom.emotionFeedbackText.textContent = selectedOpt.hint || '再想想看！單看一個部位可能不夠，要把耳朵、尾巴和身體姿勢一起看喔！';
        this.dom.emotionFeedbackBox.classList.remove('hidden');
      }
    }

    // 開啟步驟二：適當互動方式選擇彈窗
    openActionGuessModal() {
      const caseData = CASES_DATA[this.currentCaseIndex];
      this.dom.actionFeedbackBox.classList.add('hidden');
      this.dom.confirmedEmotionBadge.innerHTML = `<span>✅ 貓咪心情確認：<strong>${caseData.actionQuestion.confirmedText}</strong></span>`;

      this.dom.actionOptionsGroup.innerHTML = '';
      caseData.actionQuestion.options.forEach((opt) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'option-btn';
        btn.innerHTML = `
          <span class="option-key-badge">${opt.key}</span>
          <span class="option-text">${opt.text}</span>
        `;

        btn.addEventListener('click', () => {
          this.handleActionSelect(opt);
        });

        this.dom.actionOptionsGroup.appendChild(btn);
      });

      this.dom.screenAction.classList.remove('hidden');
    }

    // 處理互動選擇
    handleActionSelect(selectedOpt) {
      if (selectedOpt.isCorrect) {
        sounds.playCorrect();
        this.dom.screenAction.classList.add('hidden');
        // 顯示單關破案結果
        this.showCaseSuccessModal();
      } else {
        sounds.playWrong();
        this.dom.actionFeedbackText.textContent = selectedOpt.hint || '請選擇最安全且尊重貓咪感受的做法喔！';
        this.dom.actionFeedbackBox.classList.remove('hidden');
      }
    }

    // 顯示單關破案成功視窗
    showCaseSuccessModal() {
      const caseData = CASES_DATA[this.currentCaseIndex];
      this.dom.successCaseName.textContent = caseData.title;
      this.dom.successExpClues.textContent = caseData.summary.clues;
      this.dom.successExpEducation.textContent = caseData.summary.education;

      if (this.currentCaseIndex === CASES_DATA.length - 1) {
        this.dom.btnNextCaseText.textContent = '查看特級偵探結算證書 🏆';
      } else {
        this.dom.btnNextCaseText.textContent = '前往下一個委託案件 🐾';
      }

      this.dom.screenSuccess.classList.remove('hidden');
    }

    // 顯示最終全通關證書畫面
    showCompleteScreen() {
      sounds.playFanfare();
      this.hideAllScreens();
      this.dom.screenComplete.classList.remove('hidden');
    }

    // 浮動導引氣泡小提示
    showGuideToast(msg) {
      this.dom.guideTooltipText.textContent = msg;
      this.dom.guideTooltip.classList.remove('hidden');
    }

    hideGuideToast() {
      this.dom.guideTooltip.classList.add('hidden');
    }

    // 閒置計時器（若玩家太久沒動作，自動跳出友善引導）
    resetIdleTimer() {
      if (this.idleTimer) {
        clearTimeout(this.idleTimer);
      }

      this.idleTimer = setTimeout(() => {
        // 僅在進行案件觀察且未開啟任何模態視窗時提示
        const isObserving = this.dom.screenStart.classList.contains('hidden') &&
                            this.dom.screenEmotion.classList.contains('hidden') &&
                            this.dom.screenAction.classList.contains('hidden') &&
                            this.dom.screenSuccess.classList.contains('hidden') &&
                            this.dom.screenComplete.classList.contains('hidden') &&
                            this.dom.cluePopupCard.classList.contains('hidden');

        if (isObserving) {
          if (this.collectedClues.size === 0) {
            this.showGuideToast('💡 先點擊貓咪身上發光的部位找線索！');
          } else if (this.collectedClues.size < 3) {
            this.showGuideToast('💡 再多觀察幾個部位，線索會更齊全喔！');
          } else {
            this.showGuideToast('💡 線索收集齊全了！點擊右下角「我知道了！」開始推理！');
          }
        }
      }, this.idleReminderSeconds * 1000);
    }
  }

  // DOM 載入後啟動遊戲
  document.addEventListener('DOMContentLoaded', () => {
    window.catDetectiveApp = new CatDetectiveGame();
  });

})();
