/**
 * テーマ管理クラス
 * ダークモード/ライトモードの切り替えを管理
 */

class ThemeManager {
    constructor() {
        this.themes = ['dark', 'light'];
        this.defaultTheme = 'dark';
        this.currentTheme = this.detectTheme();
    }

    /**
     * ユーザーのテーマ設定を検出
     * 優先順位: LocalStorage > システム設定 > デフォルト
     */
    detectTheme() {
        // LocalStorageから取得
        const stored = localStorage.getItem('theme');
        if (stored && this.themes.includes(stored)) {
            return stored;
        }

        // システムのダークモード設定を確認
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'light';
        }

        return this.defaultTheme;
    }

    /**
     * テーマを初期化
     */
    init() {
        this.applyTheme(this.currentTheme);
        this.setupSystemThemeListener();
    }

    /**
     * テーマを適用
     */
    applyTheme(theme) {
        if (!this.themes.includes(theme)) {
            console.warn(`Theme ${theme} is not supported. Using default.`);
            theme = this.defaultTheme;
        }

        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        localStorage.setItem('theme', theme);

        // イベント発火
        window.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { theme } 
        }));
    }

    /**
     * テーマを切り替え
     */
    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
        return newTheme;
    }

    /**
     * 特定のテーマに設定
     */
    setTheme(theme) {
        if (this.themes.includes(theme)) {
            this.applyTheme(theme);
            return true;
        }
        return false;
    }

    /**
     * 現在のテーマを取得
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * ダークモードかどうか
     */
    isDark() {
        return this.currentTheme === 'dark';
    }

    /**
     * ライトモードかどうか
     */
    isLight() {
        return this.currentTheme === 'light';
    }

    /**
     * システムのテーマ変更を監視
     */
    setupSystemThemeListener() {
        if (!window.matchMedia) return;

        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        darkModeQuery.addEventListener('change', (e) => {
            // LocalStorageに設定がない場合のみ自動切り替え
            if (!localStorage.getItem('theme')) {
                const systemTheme = e.matches ? 'dark' : 'light';
                this.applyTheme(systemTheme);
            }
        });
    }

    /**
     * テーマトグルボタンを作成
     */
    createToggleButton(container) {
        const wrapper = document.createElement('div');
        wrapper.className = 'theme-toggle';
        
        const button = document.createElement('button');
        button.className = 'theme-toggle__button';
        button.setAttribute('aria-label', 'テーマ切り替え');
        button.innerHTML = this.getButtonIcon();

        button.addEventListener('click', () => {
            this.toggleTheme();
            button.innerHTML = this.getButtonIcon();
        });

        // テーマ変更時にアイコンを更新
        window.addEventListener('themeChanged', () => {
            button.innerHTML = this.getButtonIcon();
        });

        wrapper.appendChild(button);
        
        if (container instanceof HTMLElement) {
            container.appendChild(wrapper);
        } else if (typeof container === 'string') {
            const target = document.querySelector(container);
            if (target) {
                target.appendChild(wrapper);
            }
        }

        return wrapper;
    }

    /**
     * ボタンのアイコンを取得
     */
    getButtonIcon() {
        if (this.isDark()) {
            return `
                <svg class="theme-toggle__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
                <span class="sr-only">ライトモードに切り替え</span>
            `;
        } else {
            return `
                <svg class="theme-toggle__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
                <span class="sr-only">ダークモードに切り替え</span>
            `;
        }
    }
}

// グローバルインスタンス作成
const themeManager = new ThemeManager();
window.themeManager = themeManager;

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}
