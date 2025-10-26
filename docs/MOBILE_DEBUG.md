# モバイルデバイスでのコマンド実行方法

## 概要
デフォルトではPCのみでしか実行できないコマンド（開発者ツール、コンソールなど）を、iPhoneやAndroidなどのモバイルデバイスからも実行できるようにする方法を説明します。

## 方法1: デバッグモードを有効にする

### 手順
1. `js/config/debug-config.js` を開く
2. 以下の行を変更:
   ```javascript
   // 変更前
   isDebug: false,
   
   // 変更後
   isDebug: true,
   ```
3. ファイルを保存してサイトをリロード

これにより、以下が有効になります:
- コンソールログの表示
- 開発者ツールへのアクセス
- 右クリックメニュー
- キーボードショートカット

## 方法2: モバイルデバッグコンソールの追加

### 実装方法
モバイル専用のデバッグコンソールを画面に表示する機能を追加できます。

#### ステップ1: モバイルデバッグコンソールクラスを作成
`js/utils/mobile-console.js` を作成:

```javascript
class MobileDebugConsole {
    constructor() {
        this.logs = [];
        this.isVisible = false;
        this.maxLogs = 100;
    }

    init() {
        this.createConsoleUI();
        this.interceptConsoleLogs();
        this.addToggleGesture();
    }

    createConsoleUI() {
        const consoleEl = document.createElement('div');
        consoleEl.id = 'mobile-debug-console';
        consoleEl.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 40vh;
            background: rgba(0, 0, 0, 0.95);
            color: #00ff00;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            padding: 10px;
            overflow-y: auto;
            z-index: 10000;
            display: none;
            border-top: 2px solid #00ff00;
        `;
        
        document.body.appendChild(consoleEl);
        this.consoleEl = consoleEl;
    }

    interceptConsoleLogs() {
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;

        console.log = (...args) => {
            this.addLog('LOG', args);
            originalLog.apply(console, args);
        };

        console.error = (...args) => {
            this.addLog('ERROR', args);
            originalError.apply(console, args);
        };

        console.warn = (...args) => {
            this.addLog('WARN', args);
            originalWarn.apply(console, args);
        };
    }

    addLog(type, args) {
        const timestamp = new Date().toLocaleTimeString();
        const message = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');

        const logEntry = `[${timestamp}] ${type}: ${message}`;
        this.logs.push(logEntry);

        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        this.updateConsoleDisplay();
    }

    updateConsoleDisplay() {
        if (this.consoleEl && this.isVisible) {
            this.consoleEl.innerHTML = this.logs
                .map(log => `<div>${log}</div>`)
                .join('');
            this.consoleEl.scrollTop = this.consoleEl.scrollHeight;
        }
    }

    addToggleGesture() {
        let touchCount = 0;
        let touchTimer = null;

        document.addEventListener('touchstart', (e) => {
            if (e.touches.length === 3) {
                touchCount++;
                
                if (touchCount === 1) {
                    touchTimer = setTimeout(() => {
                        touchCount = 0;
                    }, 1000);
                } else if (touchCount === 3) {
                    this.toggle();
                    touchCount = 0;
                    clearTimeout(touchTimer);
                }
            }
        });
    }

    toggle() {
        this.isVisible = !this.isVisible;
        this.consoleEl.style.display = this.isVisible ? 'block' : 'none';
        
        if (this.isVisible) {
            this.updateConsoleDisplay();
        }
    }
}

// 自動初期化
if (window.DEBUG_CONFIG && window.DEBUG_CONFIG.isDebug) {
    const mobileConsole = new MobileDebugConsole();
    mobileConsole.init();
    window.mobileConsole = mobileConsole;
}
```

#### ステップ2: index.htmlに追加
```html
<script src="js/utils/mobile-console.js"></script>
```

#### 使い方
- **3本指で3回タップ** するとモバイルデバッグコンソールが表示/非表示されます
- コンソールログがリアルタイムで表示されます

## 方法3: ブラウザの開発者ツールを使用

### iPhone (Safari)
1. 設定アプリを開く
2. Safari → 詳細 → Webインスペクタをオン
3. MacでSafariを開く
4. 開発 → [デバイス名] → [ページ] を選択

### Android (Chrome)
1. Chromeの設定 → デベロッパーツール
2. PCでChrome DevToolsを開く
3. More tools → Remote devices
4. USBデバッグを有効にしてデバイスを接続

## 推奨方法

開発中は **方法1** を使用し、本番環境では `isDebug: false` に設定してください。

モバイルでのデバッグが頻繁に必要な場合は、**方法2** のモバイルデバッグコンソールを実装することをお勧めします。
