/* ===================================
   タイムラインページ専用アプリケーション
   =================================== */
class TimelinePageApp {
    constructor() {
        // DOM要素の取得
        this.header = document.getElementById('header');
        this.hamburger = document.getElementById('hamburger');
        this.navList = document.querySelector('.header__nav-list');
        this.loading = document.getElementById('loading');
        
        // マネージャーの初期化
        this.scrollManager = new ScrollManager();
        this.timelineManager = new TimelineManager();
    }

    init() {
        this.setupEventListeners();
        this.hideLoading();
        
        // マネージャーを初期化
        this.scrollManager.init();
        this.timelineManager.init();
        
        // スムーズスクロールの初期化
        this.initSmoothScrolling();
    }

    setupEventListeners() {
        // ナビゲーションメニューのイベント
        this.setupNavigationEvents();
        
        // スクロールイベント（ヘッダー背景のみ）
        window.addEventListener('scroll', debounce(() => {
            this.updateHeaderBackground();
        }, 10));

        // リサイズイベント
        window.addEventListener('resize', debounce(() => {
            this.handleResize();
        }, 250));
    }

    initSmoothScrolling() {
        // スムーズスクロールの体験向上
        document.documentElement.style.scrollBehavior = 'smooth';
        
        // スクロールヒント表示
        this.showScrollHint();
    }

    showScrollHint() {
        // 初回訪問時のスクロールヒント
        const hint = document.createElement('div');
        hint.className = 'scroll-hint';
        hint.innerHTML = `
            <div class="scroll-hint-content">
                <i class="fas fa-mouse"></i>
                <span>スクロールして開発の軌跡を辿る</span>
                <div class="scroll-hint-arrow">
                    <i class="fas fa-chevron-down"></i>
                </div>
            </div>
        `;
        
        document.body.appendChild(hint);
        
        // 3秒後にフェードアウト、またはスクロール開始で消去
        const removeHint = () => {
            hint.style.opacity = '0';
            setTimeout(() => hint.remove(), 500);
            window.removeEventListener('scroll', removeHint);
        };
        
        setTimeout(removeHint, 4000);
        window.addEventListener('scroll', removeHint, { once: true });
    }

    setupNavigationEvents() {
        // ハンバーガーメニュー
        this.hamburger?.addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        // ナビゲーションリンク（外部ページは除く）
        const navLinks = document.querySelectorAll('.header__nav-link:not([href*="index.html"])');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    smoothScrollTo(href);
                    this.closeMobileMenu();
                });
            }
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
}

/* ===================================
   アプリケーション初期化
   =================================== */
// 重複初期化を防ぐフラグ
let isTimelinePageInitialized = false;

document.addEventListener('DOMContentLoaded', function() {
    if (isTimelinePageInitialized) return;
    
    // タイムラインページアプリケーションを初期化
    const app = new TimelinePageApp();
    app.init();
    
    isTimelinePageInitialized = true;
});