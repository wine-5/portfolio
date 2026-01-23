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
        this.footerAnimationManager = new FooterAnimationManager();
    }

    init() {
        this.setupEventListeners();
        this.hideLoading();
        
        // マネージャーを初期化
        this.scrollManager.init();
        this.timelineManager.init();
        this.footerAnimationManager.init();
        
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
        const HINT_FADE_DURATION = 500; // ヒントのフェードアウト時間（ミリ秒）
        const HINT_AUTO_REMOVE_DELAY = 4000; // ヒント自動削除までの時間（ミリ秒）
        
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
            setTimeout(() => hint.remove(), HINT_FADE_DURATION);
            window.removeEventListener('scroll', removeHint);
        };
        
        setTimeout(removeHint, HINT_AUTO_REMOVE_DELAY);
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

// より確実な初期化関数
async function initializeTimelinePage() {
    if (isTimelinePageInitialized) return;
    
    // 必要なクラスが読み込まれているかチェック
    if (typeof ScrollManager === 'undefined') {
        return;
    }
    
    if (typeof TimelineManager === 'undefined') {
        return;
    }
    
    // timelineDataオブジェクトが存在し、データが読み込まれるまで待機
    if (!window.timelineData) {
        return;
    }
    
    // データが読み込まれているか確認
    const data = window.timelineData.getAllItems();
    if (!data || data.length === 0) {
        // データがまだ読み込まれていない場合は少し待つ
        setTimeout(initializeTimelinePage, 100);
        return;
    }
    
    try {
        // タイムラインページアプリケーションを初期化
        const app = new TimelinePageApp();
        app.init();
        isTimelinePageInitialized = true;
    } catch (error) {
        // エラー出現時をサイレントに处理
    }
}

// timelineDataLoaded イベントを待機して初期化
window.addEventListener('timelineDataLoaded', initializeTimelinePage);

// フォールバック: DOMContentLoaded でも試行
document.addEventListener('DOMContentLoaded', () => {
    // 少し遅延させてデータ読み込みを待つ
    setTimeout(initializeTimelinePage, 500);
});

// 最終フォールバック: window.load
window.addEventListener('load', () => {
    const INIT_RETRY_DELAY = 100;
    
    if (!isTimelinePageInitialized) {
        setTimeout(initializeTimelinePage, INIT_RETRY_DELAY);
    }
});