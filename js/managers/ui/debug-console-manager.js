/* ===================================
   デバッグコンソールマネージャー
   Footerのコンソールボタンから起動するコマンド入力UI
   =================================== */

class DebugConsoleManager {
    constructor() {
        // DOM要素
        this.trigger = null;
        this.modal = null;
        this.closeBtn = null;
        this.input = null;
        this.output = null;
        
        // コマンド履歴
        this.history = [];
        this.historyIndex = -1;
        
        // 利用可能なコマンド
        this.commands = {
            clear: this.clearOutput.bind(this),
            theme: this.toggleTheme.bind(this),
            lang: this.changeLanguage.bind(this),
            debug: this.toggleDebugMode.bind(this),
            info: this.showInfo.bind(this),
            reload: this.reloadPage.bind(this),
            version: this.showVersion.bind(this),
            easter: this.triggerEasterEgg.bind(this)
        };
    }

    init() {
        // DOMの読み込みを待つ
        this.trigger = document.getElementById('debug-console-trigger');
        this.modal = document.getElementById('console-modal');
        this.closeBtn = document.getElementById('console-close');
        this.input = document.getElementById('console-input');
        this.output = document.getElementById('console-output');
        
        if (!this.trigger || !this.modal) {
            console.warn('Debug console elements not found');
            return;
        }

        this.setupEventListeners();
        this.addWelcomeMessage();
    }

    setupEventListeners() {
        // トリガーボタン
        this.trigger.addEventListener('click', () => this.open());
        
        // 閉じるボタン
        this.closeBtn.addEventListener('click', () => this.close());
        
        // モーダル背景クリックで閉じる
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
        
        // Escキーで閉じる
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.close();
            }
        });
        
        // タッチデバイス用: スワイプダウンで閉じる
        let touchStartY = 0;
        let touchEndY = 0;
        
        const modalContent = this.modal.querySelector('.console-content');
        if (modalContent) {
            modalContent.addEventListener('touchstart', (e) => {
                touchStartY = e.touches[0].clientY;
            }, { passive: true });
            
            modalContent.addEventListener('touchend', (e) => {
                touchEndY = e.changedTouches[0].clientY;
                // 下方向に100px以上スワイプで閉じる
                if (touchEndY - touchStartY > 100) {
                    this.close();
                }
            }, { passive: true });
        }
        
        // コマンド入力
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.executeCommand();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateHistory(-1);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateHistory(1);
            }
        });
    }

    open() {
        this.modal.classList.add('active');
        this.input.focus();
    }

    close() {
        this.modal.classList.remove('active');
    }

    addWelcomeMessage() {
        // ウェルカムメッセージは表示しない（シンプルに）
    }

    addOutput(text, type = 'info') {
        const line = document.createElement('div');
        line.className = `console-line ${type}`;
        line.textContent = text;
        this.output.appendChild(line);
        this.output.scrollTop = this.output.scrollHeight;
    }

    executeCommand() {
        const input = this.input.value.trim();
        
        if (!input) return;
        
        // コマンドを表示
        this.addOutput(`$ ${input}`, 'command');
        
        // 履歴に追加
        this.history.push(input);
        this.historyIndex = this.history.length;
        
        // コマンドをパース
        const [command, ...args] = input.split(' ');
        
        // コマンド実行
        if (this.commands[command]) {
            this.commands[command](args);
        } else {
            this.addOutput(`コマンドが見つかりません: ${command}`, 'error');
        }
        
        // 入力をクリア
        this.input.value = '';
    }

    navigateHistory(direction) {
        const newIndex = this.historyIndex + direction;
        
        if (newIndex >= 0 && newIndex < this.history.length) {
            this.historyIndex = newIndex;
            this.input.value = this.history[this.historyIndex];
        } else if (newIndex === this.history.length) {
            this.historyIndex = newIndex;
            this.input.value = '';
        }
    }

    // ===== コマンド実装 =====

    clearOutput() {
        this.output.innerHTML = '';
    }

    toggleTheme(args) {
        if (!window.themeManager) {
            this.addOutput('テーママネージャーが見つかりません', 'error');
            return;
        }

        const targetTheme = args[0];
        
        if (targetTheme === 'dark' || targetTheme === 'light') {
            const currentTheme = window.themeManager.currentTheme;
            if (currentTheme !== targetTheme) {
                window.themeManager.toggleTheme();
                this.addOutput(`テーマを ${targetTheme} に変更しました`, 'success');
            } else {
                this.addOutput(`既に ${targetTheme} テーマです`, 'info');
            }
        } else {
            window.themeManager.toggleTheme();
            const newTheme = window.themeManager.currentTheme;
            this.addOutput(`テーマを ${newTheme} に切り替えました`, 'success');
        }
    }

    changeLanguage(args) {
        if (!window.i18n) {
            this.addOutput('i18nマネージャーが見つかりません', 'error');
            return;
        }

        const lang = args[0];
        const validLangs = ['ja', 'en', 'zh'];
        
        if (!lang) {
            const current = window.i18n.getCurrentLanguage();
            this.addOutput(`現在の言語: ${current}`, 'info');
            this.addOutput(`利用可能な言語: ${validLangs.join(', ')}`, 'info');
            return;
        }

        if (validLangs.includes(lang)) {
            window.i18n.setLanguage(lang);
            this.addOutput(`言語を ${lang} に変更しました`, 'success');
        } else {
            this.addOutput(`無効な言語コード: ${lang}`, 'error');
            this.addOutput(`利用可能な言語: ${validLangs.join(', ')}`, 'info');
        }
    }

    toggleDebugMode() {
        if (!window.DEBUG_CONFIG) {
            this.addOutput('デバッグ設定が見つかりません', 'error');
            return;
        }

        window.DEBUG_CONFIG.isDebug = !window.DEBUG_CONFIG.isDebug;
        const status = window.DEBUG_CONFIG.isDebug ? '有効' : '無効';
        this.addOutput(`デバッグモードを ${status} にしました`, 'success');
        
        if (window.DEBUG_CONFIG.isDebug && window.debugController) {
            window.debugController.enableDebugMode();
            this.addOutput('コンソールログが有効になりました', 'info');
        } else {
            this.addOutput('変更を反映するにはページをリロードしてください', 'info');
        }
    }

    showInfo() {
        this.addOutput('=== サイト情報 ===', 'success');
        this.addOutput('タイトル: wine-5 Portfolio', 'info');
        this.addOutput('説明: ゲーム開発者のポートフォリオサイト', 'info');
        this.addOutput(`現在のテーマ: ${window.themeManager?.currentTheme || 'unknown'}`, 'info');
        this.addOutput(`現在の言語: ${window.i18n?.getCurrentLanguage() || 'unknown'}`, 'info');
        this.addOutput(`デバッグモード: ${window.DEBUG_CONFIG?.isDebug ? 'ON' : 'OFF'}`, 'info');
        this.addOutput(`画面幅: ${window.innerWidth}px`, 'info');
        this.addOutput(`画面高さ: ${window.innerHeight}px`, 'info');
    }

    showVersion() {
        this.addOutput('=== バージョン情報 ===', 'success');
        this.addOutput('Version: 2.0.0', 'info');
        this.addOutput('Build Date: 2025-10-24', 'info');
        this.addOutput('Debug Console: 1.0.0', 'info');
    }

    reloadPage() {
        this.addOutput('ページをリロードしています...', 'info');
        setTimeout(() => {
            window.location.reload();
        }, 500);
    }

    triggerEasterEgg() {
        // イースターエッグマネージャーは無効化されているため、代替メッセージを表示
        this.addOutput('🎉 イースターエッグ機能は現在無効化されています', 'info');
        this.addOutput('パーティクル削除によりこの機能は利用できません', 'warning');
    }
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    const debugConsole = new DebugConsoleManager();
    debugConsole.init();
    window.debugConsole = debugConsole;
});
