/* ===================================
   メインアプリケーションクラス（簡潔版）
   =================================== */
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

    init() {
        this.setupEventListeners();
        this.hideLoading();
        
        // マネージャーの一括初期化
        this.managerFactory.initAll();
        
        // WebGL水面反射システムの初期化
        this.managerFactory.initWaterReflection();
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
}

/* ===================================
   アプリケーション初期化
   =================================== */
let isInitialized = false;

document.addEventListener('DOMContentLoaded', function() {
    if (isInitialized) return;
    
    const app = new PortfolioApp();
    app.init();
    
    isInitialized = true;
});

// パーティクルシステムの遅延初期化
window.addEventListener('load', function() {
    const particleCanvas = document.getElementById('particle-canvas');
    if (particleCanvas && typeof ParticleSystem !== 'undefined') {
        const particleSystem = new ParticleSystem('particle-canvas');
        particleSystem.init();
    }
});