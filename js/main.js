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
        this.animateLoading();
        
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

    animateLoading() {
        const percentageElement = document.querySelector('.loading__percentage');
        const particlesContainer = document.querySelector('.loading__particles');
        
        // パーティクルエフェクト生成
        this.createLoadingParticles(particlesContainer);
        
        // プログレス表示
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(progressInterval);
                setTimeout(() => this.hideLoading(), 500);
            }
            if (percentageElement) {
                percentageElement.textContent = Math.floor(progress) + '%';
            }
        }, 200);
    }

    createLoadingParticles(container) {
        if (!container) return;
        
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.style.cssText = `
                    position: absolute;
                    width: ${Math.random() * 6 + 2}px;
                    height: ${Math.random() * 6 + 2}px;
                    background: radial-gradient(circle, 
                        rgba(99, 102, 241, ${Math.random() * 0.8 + 0.2}), 
                        transparent);
                    border-radius: 50%;
                    left: ${Math.random() * 100}%;
                    top: ${Math.random() * 100}%;
                    animation: floatParticle ${Math.random() * 3 + 2}s linear infinite;
                    animation-delay: ${Math.random() * 2}s;
                `;
                container.appendChild(particle);
            }, i * 50);
        }
        
        // アニメーション定義
        const style = document.createElement('style');
        style.textContent = `
            @keyframes floatParticle {
                0% {
                    transform: translateY(0) scale(0);
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                }
                90% {
                    opacity: 1;
                }
                100% {
                    transform: translateY(-100vh) scale(1);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    hideLoading() {
        if (this.loading) {
            this.loading.style.opacity = '0';
            setTimeout(() => {
                this.loading.style.display = 'none';
            }, 500);
        }
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