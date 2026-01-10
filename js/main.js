/* ===================================
   メインアプリケーションクラス（簡潔版）
   =================================== */

// 定数定義は js/config/app-config.js に移動済み

// [強制無効化] パーティクル・波描画システムを完全に無効化（wine-5テキストは維持）
(function() {
    // パーティクル・波関連のcanvas要素のみを削除
    document.querySelectorAll('canvas').forEach(canvas => {
        const id = canvas.id || '';
        const className = canvas.className || '';
        
        // wine-5テキスト表示用canvas以外を削除
        // （パーティクル、水面反射関連のcanvasを特定して削除）
        if (id.includes('particle') || id.includes('water') || 
            className.includes('particle') || className.includes('water')) {
            canvas.remove();
        }
    });
    
    // パーティクルコンテナ削除
    const particleContainers = document.querySelectorAll('[class*="particle"], [class*="water"], [id*="particle"], [id*="water"]');
    particleContainers.forEach(el => {
        if (el.tagName !== 'SCRIPT' && el.tagName !== 'CANVAS') {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
        }
    });
})();

class PortfolioApp {
    constructor() {
        // DOM要素
        this.header = document.getElementById('header');
        this.hamburger = document.getElementById('hamburger');
        this.navList = document.querySelector('.header__nav-list');
        this.loading = document.getElementById('loading');
        
        // マネージャーファクトリー
        this.managerFactory = new ManagerFactory();
        this.managers = this.managerFactory.createAll();
    }

    async init() {
        // デバッグコントローラーの初期化
        if (window.debugController) {
            window.debugController.init();
        }
        
        // テーマとi18nの初期化
        this.initializeCoreSystems();
        
        this.setupEventListeners();
        this.animateLoading();
        this.setupW5ClickAnimation();
        
        // スキルデータの読み込み（awaitで待機）
        await this.loadSkillData();
        
        // マネージャーの一括初期化（データ読み込み後）
        await this.managerFactory.initAll();
    }

    initializeCoreSystems() {
        // テーママネージャーの初期化とボタン追加
        if (window.themeManager) {
            window.themeManager.init();
            const headerControls = document.getElementById('header-controls');
            if (headerControls) {
                window.themeManager.createToggleButton(headerControls);
            }
        }
        
        // 多言語マネージャーの初期化とボタン追加
        if (window.i18n) {
            const currentLang = window.i18n.getCurrentLanguage();
            window.i18n.loadTranslations(currentLang).then(() => {
                // 翻訳データ読み込み後に翻訳を適用
                window.i18n.applyTranslations();
            });
            
            const headerControls = document.getElementById('header-controls');
            if (headerControls) {
                window.i18n.createLanguageSwitcher(headerControls);
            }
        }
    }

    async loadSkillData() {
        const lang = window.i18n ? window.i18n.getCurrentLanguage() : 'ja';
        
        // スキル詳細データを読み込む
        if (window.skillDetailsData) {
            await window.skillDetailsData.load(lang);
        }
        
        // プロジェクトデータを読み込む
        if (window.projectsData) {
            await window.projectsData.load(lang);
        }
        
        // 更新履歴データを読み込む
        if (window.updatesData) {
            await window.updatesData.load(lang);
        }
        
        // タイムラインデータを読み込む
        if (window.timelineData) {
            await window.timelineData.load(lang);
        }
    }

    setupEventListeners() {
        // ナビゲーションメニューのイベント
        this.setupNavigationEvents();
        
        // スクロールイベント
        window.addEventListener('scroll', debounce(() => {
            this.updateHeaderBackground();
        }, CONFIG.SCROLL_DEBOUNCE_DELAY));

        // リサイズイベント
        window.addEventListener('resize', debounce(() => {
            this.handleResize();
        }, CONFIG.RESIZE_DEBOUNCE_DELAY));
    }

    setupNavigationEvents() {
        // ハンバーガーメニュー
        this.hamburger?.addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        // ナビゲーションリンク
        const navLinks = document.querySelectorAll('.header__nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                // 外部ページへのリンクは直接遷移
                if (href.startsWith('pages/') || href.includes('.html')) {
                    this.closeMobileMenu();
                    return;
                }
                
                // ページ内アンカーはスムーズスクロール
                if (href.startsWith('#')) {
                    e.preventDefault();
                    smoothScrollTo(href);
                    this.closeMobileMenu();
                }
            });
        });
    }

    updateHeaderBackground() {
        if (!this.header) return;
        const scrolled = window.pageYOffset > CONFIG.HEADER_SCROLL_THRESHOLD;
        this.header.classList.toggle('header--scrolled', scrolled);
    }

    toggleMobileMenu() {
        this.navList?.classList.toggle('active');
        this.hamburger?.classList.toggle('active');
    }

    closeMobileMenu() {
        this.navList?.classList.remove('active');
        this.hamburger?.classList.remove('active');
    }

    handleResize() {
        if (window.innerWidth > CONFIG.MOBILE_BREAKPOINT) {
            this.closeMobileMenu();
        }
    }

    animateLoading() {
        const percentageElement = document.querySelector('.loading__percentage');
        const particlesContainer = document.querySelector('.loading__particles');
        const logoCenter = document.querySelector('.logo-center');
        
        // ヒントテキストを回転させて表示
        this.createRotatingHints(logoCenter);
        
        // プログレス表示
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * CONFIG.LOADING_PROGRESS_INCREMENT;
            if (progress >= 100) {
                progress = 100;
                clearInterval(progressInterval);
                setTimeout(() => this.hideLoading(), CONFIG.LOADING_HIDE_DELAY);
            }
            if (percentageElement) {
                percentageElement.textContent = Math.floor(progress) + '%';
            }
        }, CONFIG.LOADING_PROGRESS_INTERVAL);
    }

    createRotatingHints(logoCenter) {
        if (!logoCenter) return;
        
        const hints = ['wine-5', 'debug'];
        const hintsContainer = document.createElement('div');
        hintsContainer.className = 'loading-hints-container';
        
        hints.forEach((hint, index) => {
            const hintElement = document.createElement('div');
            hintElement.className = 'loading-hint';
            hintElement.textContent = hint;
            hintElement.style.animationDelay = `${index * CONFIG.HINT_ANIMATION_DELAY}s`;
            hintsContainer.appendChild(hintElement);
        });
        
        logoCenter.appendChild(hintsContainer);
    }

    setupW5ClickAnimation() {
        const logoCenter = document.querySelector('.logo-center');
        if (!logoCenter) return;

        let isAnimating = false;
        let clickCount = 0;

        logoCenter.addEventListener('click', () => {
            if (isAnimating) return;
            
            clickCount++;
            isAnimating = true;
            
            logoCenter.classList.add('w5-clicked');
            
            // 特別なエフェクト（5回目と10回目）
            if (clickCount === CONFIG.W5_CLICK_THRESHOLD_5) {
                this.showW5Message('発見！隠し要素が近い...');
            } else if (clickCount === CONFIG.W5_CLICK_THRESHOLD_10) {
                this.showW5Message('完璧！すべてのクリックを達成しました');
                clickCount = 0;
            }
            
            setTimeout(() => {
                logoCenter.classList.remove('w5-clicked');
                isAnimating = false;
            }, CONFIG.W5_CLICK_ANIMATION_DURATION);
        });
    }

    showW5Message(message) {
        const messageBox = document.createElement('div');
        messageBox.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            background: linear-gradient(135deg, #6366f1, #a855f7);
            color: white;
            padding: 20px 40px;
            border-radius: 15px;
            font-size: 18px;
            font-weight: bold;
            z-index: 10002;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        `;
        messageBox.textContent = message;
        document.body.appendChild(messageBox);
        
        messageBox.animate([
            { transform: 'translate(-50%, -50%) scale(0)', opacity: 0 },
            { transform: 'translate(-50%, -50%) scale(1.1)', opacity: 1, offset: 0.5 },
            { transform: 'translate(-50%, -50%) scale(1)', opacity: 1, offset: 0.6 },
            { transform: 'translate(-50%, -50%) scale(1)', opacity: 1, offset: 0.9 },
            { transform: 'translate(-50%, -50%) scale(0)', opacity: 0 }
        ], {
            duration: CONFIG.W5_MESSAGE_DURATION,
            easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
        }).onfinish = () => messageBox.remove();
    }

    hideLoading() {
        if (this.loading) {
            this.loading.style.opacity = '0';
            setTimeout(() => {
                this.loading.style.display = 'none';
            }, CONFIG.LOADING_HIDE_DELAY);
        }
    }
}

/* ===================================
   アプリケーション初期化
   =================================== */
let isInitialized = false;

document.addEventListener('DOMContentLoaded', async function() {
    if (isInitialized) return;
    
    const app = new PortfolioApp();
    await app.init(); // awaitを追加
    
    // グローバルに参照できるようにする
    window.portfolioApp = app;
    
    isInitialized = true;
});

