/* ===================================
   モバイルデバッグコンソール
   3本指で3回タップするとコンソールを表示/非表示
   =================================== */

class MobileDebugConsole {
    constructor() {
        this.logs = [];
        this.isVisible = false;
        this.maxLogs = 100;
        this.TOGGLE_TAP_COUNT = 3; // トグルに必要なタップ回数
        this.TOGGLE_FINGER_COUNT = 3; // トグルに必要な指の本数
        this.TAP_TIMEOUT = 1000; // タップのタイムアウト（ミリ秒）
    }

    init() {
        if (!('ontouchstart' in window)) {
            // タッチデバイスでない場合は初期化しない
            return;
        }
        
        this.createConsoleUI();
        this.interceptConsoleLogs();
        this.addToggleGesture();
    }

    /**
     * コンソールUIを作成
     */
    createConsoleUI() {
        const consoleEl = document.createElement('div');
        consoleEl.id = 'mobile-debug-console';
        consoleEl.innerHTML = `
            <div class="mobile-console-header">
                <span>📱 モバイルデバッグコンソール</span>
                <button class="mobile-console-close">✕</button>
            </div>
            <div class="mobile-console-content"></div>
        `;
        
        // スタイル適用
        consoleEl.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 40vh;
            background: rgba(0, 0, 0, 0.95);
            color: #00ff00;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            z-index: 10000;
            display: none;
            border-top: 2px solid #00ff00;
            box-shadow: 0 -4px 20px rgba(0, 255, 0, 0.3);
        `;
        
        document.body.appendChild(consoleEl);
        this.consoleEl = consoleEl;
        this.contentEl = consoleEl.querySelector('.mobile-console-content');
        
        // コンテンツ領域のスタイル
        this.contentEl.style.cssText = `
            padding: 10px;
            overflow-y: auto;
            height: calc(100% - 40px);
        `;
        
        // ヘッダーのスタイル
        const header = consoleEl.querySelector('.mobile-console-header');
        header.style.cssText = `
            padding: 10px;
            background: rgba(0, 255, 0, 0.1);
            border-bottom: 1px solid #00ff00;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: bold;
        `;
        
        // 閉じるボタンのスタイル
        const closeBtn = consoleEl.querySelector('.mobile-console-close');
        closeBtn.style.cssText = `
            background: none;
            border: 1px solid #00ff00;
            color: #00ff00;
            font-size: 16px;
            padding: 5px 10px;
            cursor: pointer;
            border-radius: 3px;
        `;
        
        // 閉じるボタンのイベント
        closeBtn.addEventListener('click', () => this.hide());
    }

    /**
     * コンソールログをインターセプト
     */
    interceptConsoleLogs() {
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        const originalInfo = console.info;

        console.log = (...args) => {
            this.addLog('LOG', args, '#00ff00');
            originalLog.apply(console, args);
        };

        console.error = (...args) => {
            this.addLog('ERROR', args, '#ff0000');
            originalError.apply(console, args);
        };

        console.warn = (...args) => {
            this.addLog('WARN', args, '#ffaa00');
            originalWarn.apply(console, args);
        };

        console.info = (...args) => {
            this.addLog('INFO', args, '#00aaff');
            originalInfo.apply(console, args);
        };
    }

    /**
     * ログを追加
     */
    addLog(type, args, color) {
        const timestamp = new Date().toLocaleTimeString();
        const message = args.map(arg => {
            if (typeof arg === 'object') {
                try {
                    return JSON.stringify(arg, null, 2);
                } catch (e) {
                    return String(arg);
                }
            }
            return String(arg);
        }).join(' ');

        const logEntry = {
            timestamp,
            type,
            message,
            color
        };

        this.logs.push(logEntry);

        // ログ数の制限
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        this.updateConsoleDisplay();
    }

    /**
     * コンソール表示を更新
     */
    updateConsoleDisplay() {
        if (this.contentEl && this.isVisible) {
            this.contentEl.innerHTML = this.logs
                .map(log => `
                    <div style="margin-bottom: 8px; padding: 5px; border-left: 3px solid ${log.color}; background: rgba(255,255,255,0.05);">
                        <span style="color: #888;">[${log.timestamp}]</span>
                        <span style="color: ${log.color}; font-weight: bold;">${log.type}:</span>
                        <pre style="margin: 5px 0 0 0; white-space: pre-wrap; word-wrap: break-word;">${log.message}</pre>
                    </div>
                `)
                .join('');
            this.contentEl.scrollTop = this.contentEl.scrollHeight;
        }
    }

    /**
     * トグルジェスチャーを追加（3本指で3回タップ）
     */
    addToggleGesture() {
        let touchCount = 0;
        let touchTimer = null;

        document.addEventListener('touchstart', (e) => {
            // 3本指でのタッチをチェック
            if (e.touches.length === this.TOGGLE_FINGER_COUNT) {
                touchCount++;
                
                // 最初のタップの場合、タイマーをセット
                if (touchCount === 1) {
                    touchTimer = setTimeout(() => {
                        touchCount = 0;
                    }, this.TAP_TIMEOUT);
                } 
                // 規定回数タップされた場合、コンソールをトグル
                else if (touchCount === this.TOGGLE_TAP_COUNT) {
                    this.toggle();
                    touchCount = 0;
                    if (touchTimer) {
                        clearTimeout(touchTimer);
                    }
                }
            }
        });
    }

    /**
     * コンソールを表示/非表示
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * コンソールを表示
     */
    show() {
        this.isVisible = true;
        this.consoleEl.style.display = 'block';
        this.updateConsoleDisplay();
        
        // 表示時に通知ログを追加
        console.info('モバイルデバッグコンソールを開きました');
    }

    /**
     * コンソールを非表示
     */
    hide() {
        this.isVisible = false;
        this.consoleEl.style.display = 'none';
    }

    /**
     * ログをクリア
     */
    clear() {
        this.logs = [];
        this.updateConsoleDisplay();
    }
}

// 自動初期化（デバッグモードの場合のみ）
if (window.DEBUG_CONFIG && window.DEBUG_CONFIG.isDebug) {
    const mobileConsole = new MobileDebugConsole();
    mobileConsole.init();
    window.mobileConsole = mobileConsole;
    
    // グローバルに公開
    window.showMobileConsole = () => mobileConsole.show();
    window.hideMobileConsole = () => mobileConsole.hide();
    window.clearMobileConsole = () => mobileConsole.clear();
}
