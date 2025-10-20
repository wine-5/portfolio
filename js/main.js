/* ===================================
   メインアプリケーションクラス
   =================================== */
class PortfolioApp {
    constructor() {
        this.header = document.getElementById('header');
        this.hamburger = document.getElementById('hamburger');
        this.navList = document.querySelector('.header__nav-list');
        this.loading = document.getElementById('loading');
        this.scrollManager = new ScrollManager();
        this.animationManager = new AnimationManager();
        this.worksManager = new WorksManager();
        this.skillsManager = new SkillsManager();
        this.contactForm = new ContactForm();
        this.updatesManager = new UpdatesManager();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.hideLoading();
        this.scrollManager.init();
        this.animationManager.init();
        this.worksManager.init();
        this.skillsManager.init();
        this.contactForm.init();
        this.updatesManager.init();
    }

    setupEventListeners() {
        // ハンバーガーメニュー
        this.hamburger?.addEventListener('click', () => this.toggleMobileMenu());
        
        // ナビゲーションリンクのクリック
        document.querySelectorAll('.header__nav-link').forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e));
        });

        // スクロールイベント
        window.addEventListener('scroll', () => this.handleScroll());
        
        // リサイズイベント
        window.addEventListener('resize', () => this.handleResize());
    }

    toggleMobileMenu() {
        this.hamburger?.classList.toggle('active');
        this.navList?.classList.toggle('active');
        document.body.style.overflow = this.navList?.classList.contains('active') ? 'hidden' : '';
    }

    handleNavClick(e) {
        e.preventDefault();
        const target = e.target.getAttribute('href');
        const targetElement = document.querySelector(target);
        
        if (targetElement) {
            const headerHeight = this.header.offsetHeight;
            const targetPosition = targetElement.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }

        // モバイルメニューを閉じる
        if (this.navList?.classList.contains('active')) {
            this.toggleMobileMenu();
        }

        // アクティブリンクの更新
        this.updateActiveNavLink(target);
    }

    updateActiveNavLink(target) {
        document.querySelectorAll('.header__nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[href="${target}"]`)?.classList.add('active');
    }

    handleScroll() {
        const scrollY = window.scrollY;
        
        // ヘッダーのスクロール効果
        if (scrollY > 100) {
            this.header?.classList.add('scrolled');
        } else {
            this.header?.classList.remove('scrolled');
        }

        // アクティブセクションの検出
        this.updateActiveSection();
    }

    updateActiveSection() {
        const sections = document.querySelectorAll('section[id]');
        const headerHeight = this.header.offsetHeight;
        
        sections.forEach(section => {
            const top = section.offsetTop - headerHeight - 100;
            const bottom = top + section.offsetHeight;
            const scrollY = window.scrollY;
            
            if (scrollY >= top && scrollY <= bottom) {
                const navLink = document.querySelector(`[href="#${section.id}"]`);
                document.querySelectorAll('.header__nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                navLink?.classList.add('active');
            }
        });
    }

    handleResize() {
        // モバイルメニューが開いている状態でPC画面になった場合の対応
        if (window.innerWidth > 768 && this.navList?.classList.contains('active')) {
            this.toggleMobileMenu();
        }
    }

    hideLoading() {
        setTimeout(() => {
            this.loading?.classList.add('hidden');
            setTimeout(() => {
                this.loading?.remove();
            }, 500);
        }, 1000);
    }
}

/* ===================================
   スクロール管理クラス
   =================================== */
class ScrollManager {
    constructor() {
        this.observer = null;
    }

    init() {
        this.setupIntersectionObserver();
        this.observeElements();
    }

    setupIntersectionObserver() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, options);
    }

    observeElements() {
        const elements = document.querySelectorAll('.fade-in, .work-card, .skill');
        elements.forEach(el => {
            el.classList.add('fade-in');
            this.observer?.observe(el);
        });
    }
}

/* ===================================
   作品管理クラス
   =================================== */
class WorksManager {
    constructor() {
        this.worksGrid = document.getElementById('works-grid');
        this.projects = [
            {
                title: 'サンプルゲーム1',
                description: 'Unity × C#で開発したアクションゲーム。プレイヤーは様々なステージを攻略していきます。',
                technologies: ['Unity', 'C#', 'DOTween'],
                image: 'images/games/game1.jpg',
                playUrl: 'https://unityroom.com/users/wine-555',
                githubUrl: 'https://github.com/wine-5'
            },
            {
                title: 'サンプルゲーム2',
                description: 'パズルゲーム。美しいビジュアルと直感的な操作性を重視して開発しました。',
                technologies: ['Unity', 'C#', 'Timeline'],
                image: 'images/games/game2.jpg',
                playUrl: 'https://unityroom.com/users/wine-555',
                githubUrl: 'https://github.com/wine-5'
            },
            {
                title: 'サンプルゲーム3',
                description: 'モバイル向けカジュアルゲーム。今後App Storeでの公開を予定しています。',
                technologies: ['Unity', 'C#', 'Firebase'],
                image: 'images/games/game3.jpg',
                playUrl: 'https://unityroom.com/users/wine-555',
                githubUrl: 'https://github.com/wine-5'
            }
        ];
    }

    init() {
        this.renderProjects();
    }

    renderProjects() {
        if (!this.worksGrid) return;

        this.worksGrid.innerHTML = this.projects.map(project => 
            this.createProjectCard(project)
        ).join('');
    }

    createProjectCard(project) {
        return `
            <div class="work-card fade-in">
                <div class="work-card__image">
                    <img src="${project.image}" alt="${project.title}" 
                         onerror="this.src='https://via.placeholder.com/400x250/6366f1/ffffff?text=Game+Screenshot'">
                </div>
                <div class="work-card__content">
                    <h3 class="work-card__title">${project.title}</h3>
                    <p class="work-card__description">${project.description}</p>
                    <div class="work-card__tags">
                        ${project.technologies.map(tech => 
                            `<span class="work-card__tag">${tech}</span>`
                        ).join('')}
                    </div>
                    <div class="work-card__buttons">
                        <a href="${project.playUrl}" target="_blank" class="btn btn--primary work-card__button">
                            Play Now
                        </a>
                        <a href="${project.githubUrl}" target="_blank" class="btn btn--secondary work-card__button">
                            GitHub
                        </a>
                    </div>
                </div>
            </div>
        `;
    }
}

/* ===================================
   スキル管理クラス
   =================================== */
class SkillsManager {
    constructor() {
        this.skills = document.querySelectorAll('.skill');
    }

    init() {
        this.setupSkillAnimation();
    }

    setupSkillAnimation() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        this.skills.forEach(skill => {
            skill.classList.add('fade-in');
            observer.observe(skill);
        });
    }
}

/* ===================================
   更新履歴管理クラス
   =================================== */
class UpdatesManager {
    constructor() {
        this.timelineContainer = document.getElementById('updates-timeline');
        this.lastUpdatedElement = document.getElementById('last-updated-date');
        this.updates = [
            {
                date: '2025-10-20',
                title: 'wine-5ポートフォリオサイト公開',
                description: 'ゲーム開発者・wine-5のポートフォリオサイトを公開しました。レスポンシブ対応、パーティクルアニメーション、EmailJS統合を実装。'
            },
            {
                date: '2025-10-20',
                title: 'スキルセクション改良',
                description: 'スキルのパーセンテージ表示を削除し、より詳細な説明を追加しました。成長の余地を示すデザインに変更。'
            },
            {
                date: '2025-10-20',
                title: '更新履歴機能追加',
                description: 'Webサイトの更新履歴を表示する機能を追加。最終更新日と詳細な更新内容を確認できるようになりました。'
            }
        ];
    }

    init() {
        this.updateLastModifiedDate();
        this.renderUpdateHistory();
    }

    updateLastModifiedDate() {
        if (!this.lastUpdatedElement || this.updates.length === 0) return;
        
        const latestUpdate = this.updates[0];
        const date = new Date(latestUpdate.date);
        const formatOptions = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
        };
        
        this.lastUpdatedElement.textContent = date.toLocaleDateString('ja-JP', formatOptions);
    }

    renderUpdateHistory() {
        if (!this.timelineContainer) return;

        this.timelineContainer.innerHTML = this.updates.map(update => 
            this.createUpdateItem(update)
        ).join('');
    }

    createUpdateItem(update) {
        const date = new Date(update.date);
        const formattedDate = date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });

        return `
            <div class="update-item fade-in">
                <div class="update-item__date">${formattedDate}</div>
                <div class="update-item__content">
                    <h4 class="update-item__title">${update.title}</h4>
                    <p class="update-item__description">${update.description}</p>
                </div>
            </div>
        `;
    }

    // 新しい更新を追加するメソッド（将来的な拡張用）
    addUpdate(date, title, description) {
        const newUpdate = { date, title, description };
        this.updates.unshift(newUpdate);
        this.updateLastModifiedDate();
        this.renderUpdateHistory();
    }
}

/* ===================================
   コンタクトフォーム管理クラス
   =================================== */
class ContactForm {
    constructor() {
        this.form = document.getElementById('contact-form');
        this.isEmailJSInitialized = false;
    }

    init() {
        this.initEmailJS();
        this.setupFormSubmission();
    }

    initEmailJS() {
        try {
            // EmailJSの初期化（実際のキーに置き換えてください）
            if (typeof emailjs !== 'undefined') {
                emailjs.init('YOUR_PUBLIC_KEY');
                this.isEmailJSInitialized = true;
            }
        } catch (error) {
            console.warn('EmailJS not available:', error);
        }
    }

    setupFormSubmission() {
        this.form?.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.isEmailJSInitialized) {
            this.showMessage('メール送信機能が利用できません。', 'error');
            return;
        }

        const formData = new FormData(this.form);
        const templateParams = {
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message')
        };

        try {
            this.showLoading(true);
            
            // EmailJSでメール送信（実際のサービスIDとテンプレートIDに置き換えてください）
            await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams);
            
            this.showMessage('メッセージが送信されました！', 'success');
            this.form.reset();
        } catch (error) {
            console.error('Email send error:', error);
            this.showMessage('送信に失敗しました。もう一度お試しください。', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    showMessage(message, type) {
        // 既存のメッセージを削除
        const existingMessage = document.querySelector('.form-message');
        existingMessage?.remove();

        // 新しいメッセージを作成
        const messageElement = document.createElement('div');
        messageElement.className = `form-message form-message--${type}`;
        messageElement.textContent = message;
        messageElement.style.cssText = `
            padding: 1rem;
            margin-top: 1rem;
            border-radius: 8px;
            font-weight: 500;
            text-align: center;
            ${type === 'success' 
                ? 'background-color: #10b981; color: white;' 
                : 'background-color: #ef4444; color: white;'}
        `;

        this.form?.appendChild(messageElement);

        // 3秒後にメッセージを削除
        setTimeout(() => {
            messageElement?.remove();
        }, 3000);
    }

    showLoading(show) {
        const submitButton = this.form?.querySelector('[type="submit"]');
        if (!submitButton) return;

        if (show) {
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
        } else {
            submitButton.disabled = false;
            submitButton.textContent = 'Send Message';
        }
    }
}

/* ===================================
   アプリケーション初期化
   =================================== */
document.addEventListener('DOMContentLoaded', () => {
    new PortfolioApp();
});

/* ===================================
   ユーティリティ関数
   =================================== */

// デバウンス関数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// スムーズスクロール（古いブラウザ対応）
function smoothScrollTo(target, duration = 1000) {
    const targetElement = document.querySelector(target);
    if (!targetElement) return;

    const startPosition = window.pageYOffset;
    const targetPosition = targetElement.offsetTop - 80;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    function ease(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
}