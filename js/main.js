/* ===================================
   メインアプリケーションクラス（初期化・統合のみ）
   =================================== */
class PortfolioApp {
    constructor() {
        // DOM要素の取得
        this.header = document.getElementById('header');
        this.hamburger = document.getElementById('hamburger');
        this.navList = document.querySelector('.header__nav-list');
        this.loading = document.getElementById('loading');
        
        // 各マネージャーの初期化
        this.scrollManager = new ScrollManager();
        this.animationManager = new AnimationManager();
        this.sectionAnimationManager = new SectionAnimationManager();
        
        // WebGL水面反射システム（フォールバック付き）
        this.webglWaterManager = new WebGLWaterReflectionManager();
        this.waterReflectionTitleManager = new WaterReflectionTitleManager();
        this.gamesManager = new GamesManager();
        this.skillsManager = new SkillsManager();
        // this.timelineManager = new TimelineManager(); // タイムラインは別ページでのみ表示
        this.contactForm = new ContactForm();
        this.updatesManager = new UpdatesManager();
    }

    init() {
        this.setupEventListeners();
        this.hideLoading();
        
        // 各マネージャーを初期化
        console.log('Starting manager initialization...');
        this.scrollManager.init();
        this.animationManager.init();
        this.sectionAnimationManager.init();
        
        // WebGL対応チェック後、適切なマネージャーを初期化
        this.initWaterReflectionSystem();
        this.gamesManager.init();
        this.skillsManager.init();
        // this.timelineManager.init(); // タイムラインは別ページでのみ表示
        this.contactForm.init();
        
        // UpdatesManagerは他の初期化完了後に実行
        setTimeout(() => {
            console.log('Initializing UpdatesManager...');
            this.updatesManager.init();
        }, 100);
    }

    setupEventListeners() {
        // ナビゲーションメニューのイベント
        this.setupNavigationEvents();
        
        // スクロールイベント
        window.addEventListener('scroll', debounce(() => {
            this.updateHeaderBackground();
        }, 10));

        // リサイズイベント
        window.addEventListener('resize', debounce(() => {
            this.handleResize();
        }, 250));
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
                
                // 外部ページや pages/ フォルダへのリンクは直接遷移
                if (href.startsWith('pages/') || href.includes('.html')) {
                    // デフォルトの動作を許可（直接遷移）
                    this.closeMobileMenu();
                    return;
                }
                
                // ページ内アンカーの場合はスムーズスクロール
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
        
        const scrolled = window.pageYOffset > 50;
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
        // モバイルメニューを閉じる
        if (window.innerWidth > 768) {
            this.closeMobileMenu();
        }
    }

    hideLoading() {
        setTimeout(() => {
            if (this.loading) {
                this.loading.style.opacity = '0';
                setTimeout(() => {
                    this.loading.style.display = 'none';
                }, 300);
            }
        }, 1000);
    }

    // WebGL水面反射システムの初期化
    async initWaterReflectionSystem() {
        try {
            console.log('Checking WebGL support and device capabilities...');
            
            // WebGLマネージャー内のチェックを使用
            await this.webglWaterManager.init();
            
            // WebGLが正常に初期化された場合のみアニメーション開始
            if (this.webglWaterManager.isInitialized) {
                console.log('WebGL initialized successfully, starting animations...');
                // 1秒後に文字アニメーション開始
                setTimeout(() => {
                    this.webglWaterManager.animateLettersIn();
                }, 1000);
            } else {
                throw new Error('WebGL initialization failed');
            }
        } catch (error) {
            console.log('Falling back to CSS water system:', error.message);
            // CSS版のタイトル要素を確実に表示
            this.showCSSElements();
            this.waterReflectionTitleManager.init();
        }
    }

    showCSSElements() {
        // CSS版の要素を強制的に表示
        const elements = [
            '.hero__content',
            '.hero__title-container', 
            '.hero__title-letters',
            '.hero__title-reflection'
        ];
        
        elements.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.style.display = element === '.hero__title-letters' || element === '.hero__title-reflection' ? 'flex' : 'block';
                element.style.opacity = '1';
                element.style.visibility = 'visible';
            }
        });
    }
}

/* ===================================
   アプリケーション初期化
   =================================== */
// 重複初期化を防ぐフラグ
let isInitialized = false;

document.addEventListener('DOMContentLoaded', function() {
    if (isInitialized) return;
    
    // ポートフォリオアプリケーションを初期化
    const app = new PortfolioApp();
    app.init();
    
    isInitialized = true;
});

// ページロード完了後にパーティクルアニメーション開始
window.addEventListener('load', function() {
    const particleCanvas = document.getElementById('particle-canvas');
    if (particleCanvas && typeof ParticleSystem !== 'undefined') {
        const particleSystem = new ParticleSystem('particle-canvas');
        particleSystem.init();
    }
});