/* ===================================
   メインアプリケーションクラス（簡潔版）
   =================================== */

// 定数定義
const CONFIG = {
    SCROLL_DEBOUNCE_DELAY: 10,
    RESIZE_DEBOUNCE_DELAY: 250,
    HEADER_SCROLL_THRESHOLD: 50,
    MOBILE_BREAKPOINT: 768,
    LOADING_PROGRESS_INCREMENT: 15,
    LOADING_PROGRESS_INTERVAL: 200,
    LOADING_HIDE_DELAY: 500,
    HINT_ANIMATION_DELAY: 0.5,
    PARTICLE_COUNT: 30,
    PARTICLE_CREATION_DELAY: 50,
    PARTICLE_MIN_SIZE: 2,
    PARTICLE_MAX_SIZE: 8,
    PARTICLE_MIN_DURATION: 2,
    PARTICLE_MAX_DURATION: 5,
    PARTICLE_MAX_DELAY: 2,
    W5_CLICK_ANIMATION_DURATION: 800,
    W5_PARTICLE_COUNT: 12,
    W5_PARTICLE_MIN_DISTANCE: 50,
    W5_PARTICLE_MAX_DISTANCE: 80,
    W5_PARTICLE_MIN_SIZE: 4,
    W5_PARTICLE_MAX_SIZE: 10,
    W5_MESSAGE_DURATION: 3000,
    W5_CLICK_THRESHOLD_5: 5,
    W5_CLICK_THRESHOLD_10: 10
};

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
        
        // WebGL水面反射システムの初期化
        this.managerFactory.initWaterReflection();
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
        
        // パーティクルエフェクト生成
        this.createLoadingParticles(particlesContainer);
        
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

    createLoadingParticles(container) {
        if (!container) return;
        
        for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                const size = Math.random() * (CONFIG.PARTICLE_MAX_SIZE - CONFIG.PARTICLE_MIN_SIZE) + CONFIG.PARTICLE_MIN_SIZE;
                const duration = Math.random() * (CONFIG.PARTICLE_MAX_DURATION - CONFIG.PARTICLE_MIN_DURATION) + CONFIG.PARTICLE_MIN_DURATION;
                const delay = Math.random() * CONFIG.PARTICLE_MAX_DELAY;
                const opacity = Math.random() * 0.8 + 0.2;
                
                particle.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    background: radial-gradient(circle, 
                        rgba(99, 102, 241, ${opacity}), 
                        transparent);
                    border-radius: 50%;
                    left: ${Math.random() * 100}%;
                    top: ${Math.random() * 100}%;
                    animation: floatParticle ${duration}s linear infinite;
                    animation-delay: ${delay}s;
                `;
                container.appendChild(particle);
            }, i * CONFIG.PARTICLE_CREATION_DELAY);
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
            
            // パーティクル生成
            this.createW5ClickParticles(logoCenter);
            
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

    createW5ClickParticles(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < CONFIG.W5_PARTICLE_COUNT; i++) {
            const particle = document.createElement('div');
            const angle = (Math.PI * 2 * i) / CONFIG.W5_PARTICLE_COUNT;
            const distance = CONFIG.W5_PARTICLE_MIN_DISTANCE + Math.random() * (CONFIG.W5_PARTICLE_MAX_DISTANCE - CONFIG.W5_PARTICLE_MIN_DISTANCE);
            const size = CONFIG.W5_PARTICLE_MIN_SIZE + Math.random() * (CONFIG.W5_PARTICLE_MAX_SIZE - CONFIG.W5_PARTICLE_MIN_SIZE);
            
            particle.style.cssText = `
                position: fixed;
                left: ${centerX}px;
                top: ${centerY}px;
                width: ${size}px;
                height: ${size}px;
                background: linear-gradient(135deg, #6366f1, #a855f7);
                border-radius: 50%;
                pointer-events: none;
                z-index: 10001;
                box-shadow: 0 0 10px rgba(99, 102, 241, 0.8);
            `;
            
            document.body.appendChild(particle);
            
            const endX = centerX + Math.cos(angle) * distance;
            const endY = centerY + Math.sin(angle) * distance;
            
            particle.animate([
                { transform: 'translate(-50%, -50%) scale(0)', opacity: 1 },
                { transform: `translate(${endX - centerX}px, ${endY - centerY}px) scale(1)`, opacity: 0.8, offset: 0.5 },
                { transform: `translate(${(endX - centerX) * 1.5}px, ${(endY - centerY) * 1.5}px) scale(0)`, opacity: 0 }
            ], {
                duration: CONFIG.W5_CLICK_ANIMATION_DURATION,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
            }).onfinish = () => particle.remove();
        }
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