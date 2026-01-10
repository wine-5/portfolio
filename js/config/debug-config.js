/* ===================================
   デバッグ設定
   開発モードとプロダクションモードの切り替え
   =================================== */

const DEBUG_CONFIG = {
    // デバッグモードのオン/オフ（本番環境ではfalseに設定）
    isDebug: true,
    
    // 開発者ツールの無効化（デバッグモードがオフの場合）
    disableDevTools: true,
    
    // コンソールログの無効化（デバッグモードがオフの場合）
    disableConsole: true,
    
    // 右クリックメニューの無効化
    disableContextMenu: true,
    
    // キーボードショートカットの無効化
    disableKeyboardShortcuts: true
};

/* ===================================
   デバッグ制御クラス
   =================================== */
class DebugController {
    constructor(config) {
        this.config = config;
        this.originalConsole = {};
    }

    init() {
        if (!this.config.isDebug) {
            // プロダクションモード
            if (this.config.disableConsole) {
                this.disableConsole();
            }
            
            if (this.config.disableDevTools) {
                this.setupDevToolsDetection();
            }
            
            if (this.config.disableContextMenu) {
                this.disableContextMenu();
            }
            
            if (this.config.disableKeyboardShortcuts) {
                this.disableKeyboardShortcuts();
            }
        } else {
            // デバッグモード
            console.log('%c🔧 デバッグモード有効', 'color: #10b981; font-size: 14px; font-weight: bold;');
            console.log('開発者ツール、コンソールログ、右クリックメニューがすべて利用可能です。');
        }
    }

    /**
     * コンソールログを無効化
     */
    disableConsole() {
        // 元のコンソールメソッドを保存（デバッグ時に復元可能）
        this.originalConsole = {
            log: console.log,
            warn: console.warn,
            error: console.error,
            info: console.info,
            debug: console.debug
        };

        // エラーログのみ残し、その他を無効化
        console.log = () => {};
        console.debug = () => {};
        console.info = () => {};
        console.warn = () => {};
        // console.error は残す（重要なエラー情報）
    }

    /**
     * 開発者ツールの検出と無効化
     */
    setupDevToolsDetection() {
        // F12、Ctrl+Shift+I、Ctrl+Shift+J、Ctrl+U の無効化は
        // disableKeyboardShortcuts() で処理

        // 開発者ツールが開かれているかを検出（幅と高さの差で判定）
        const detectDevTools = () => {
            const widthThreshold = window.outerWidth - window.innerWidth > 160;
            const heightThreshold = window.outerHeight - window.innerHeight > 160;
            
            if (widthThreshold || heightThreshold) {
                // 開発者ツールが開かれている可能性が高い
                // ユーザーに警告（オプション）
                // document.body.innerHTML = '<h1 style="color: red; text-align: center; margin-top: 50px;">開発者ツールの使用は許可されていません</h1>';
            }
        };

        // 定期的にチェック
        setInterval(detectDevTools, 1000);
    }

    /**
     * 右クリックメニューを無効化
     */
    disableContextMenu() {
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });
    }

    /**
     * キーボードショートカットを無効化
     */
    disableKeyboardShortcuts() {
        const DISABLED_KEY_DELAY = 100; // キー無効化の処理遅延（ミリ秒）
        
        document.addEventListener('keydown', (e) => {
            // F12（開発者ツール）
            if (e.key === 'F12') {
                e.preventDefault();
                return false;
            }
            
            // Ctrl+Shift+I（開発者ツール）
            if (e.ctrlKey && e.shiftKey && e.key === 'I') {
                e.preventDefault();
                return false;
            }
            
            // Ctrl+Shift+J（コンソール）
            if (e.ctrlKey && e.shiftKey && e.key === 'J') {
                e.preventDefault();
                return false;
            }
            
            // Ctrl+U（ソースコード表示）
            if (e.ctrlKey && e.key === 'u') {
                e.preventDefault();
                return false;
            }
            
            // Ctrl+Shift+C（要素の検証）
            if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                return false;
            }
            
            // Cmd+Option+I（Mac：開発者ツール）
            if (e.metaKey && e.altKey && e.key === 'i') {
                e.preventDefault();
                return false;
            }
            
            // Cmd+Option+J（Mac：コンソール）
            if (e.metaKey && e.altKey && e.key === 'j') {
                e.preventDefault();
                return false;
            }
            
            // Cmd+Option+C（Mac：要素の検証）
            if (e.metaKey && e.altKey && e.key === 'c') {
                e.preventDefault();
                return false;
            }
        });
    }

    /**
     * デバッグモードを動的に有効化（緊急用）
     */
    enableDebugMode() {
        this.config.isDebug = true;
        
        // コンソールを復元
        if (this.originalConsole.log) {
            console.log = this.originalConsole.log;
            console.warn = this.originalConsole.warn;
            console.error = this.originalConsole.error;
            console.info = this.originalConsole.info;
            console.debug = this.originalConsole.debug;
        }
        
        console.log('%c🔧 デバッグモード有効化', 'color: #10b981; font-size: 14px; font-weight: bold;');
    }
}

// グローバルに公開
const debugController = new DebugController(DEBUG_CONFIG);
window.debugController = debugController;
window.DEBUG_CONFIG = DEBUG_CONFIG;

// 緊急デバッグモード有効化用（コンソールで window.enableDebug() を実行）
window.enableDebug = () => debugController.enableDebugMode();
