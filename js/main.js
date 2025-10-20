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
        
        // 重複初期化を防ぐ
        // this.init();
    }

    init() {
        console.log('PortfolioApp initializing...');
        this.setupEventListeners();
        this.hideLoading();
        this.scrollManager.init();
        this.animationManager.init();
        console.log('About to initialize WorksManager...');
        this.worksManager.init();
        this.skillsManager.init();
        this.contactForm.init();
        this.updatesManager.init();
        console.log('PortfolioApp initialization complete');
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
            // 2年次 - 最新作品
            {
                title: 'たかし、人生ベット中',
                description: '学内ゲームジャム3日間で開発した2Dシューティングゲーム。5人チームでのリーダー経験。株式会社インフィニットループ堀川賞受賞。',
                technologies: ['Unity', 'C#', 'シングルトン', 'ObjectPool'],
                // image: 'https://picsum.photos/400/250?random=1',
                playUrl: 'https://unityroom.com/games/i-want-hosurus',
                githubUrl: 'https://github.com/wine-5',
                year: '2年次',
                category: 'game',
                teamSize: '5人（プログラマー4人、デザイナー1人）',
                period: '3日間',
                award: '株式会社インフィニットループ堀川賞'
            },
            {
                title: '蝶々反乱',
                description: 'Sapporo Game Camp2025参加作品。全員初対面の7人チームで開発した2Dアクションゲーム。学外ゲームジャム初挑戦。',
                technologies: ['Unity', 'C#', '設計パターン', 'チーム開発'],
                // image: 'https://picsum.photos/400/250?random=2',
                playUrl: 'https://unityroom.com/users/wine-555',
                githubUrl: 'https://github.com/wine-5',
                year: '2年次',
                category: 'game',
                teamSize: '7人（現役プログラマー1人、学生プログラマー2人、現役デザイナー1人、学生デザイナー2人、学生プランナー1人）',
                period: '2日間（現在ブラッシュアップ中）',
                note: 'リファクタリング・ブラッシュアップ進行中'
            },
            {
                title: 'Git Command Helper',
                description: 'Git学習用のコマンド専用Webサイト。実用性を重視した学習ツール。',
                technologies: ['HTML', 'CSS', 'JavaScript', 'Web Design'],
                // image: 'https://picsum.photos/400/250?random=3',
                playUrl: 'https://git-command.com/',
                githubUrl: 'https://github.com/wine-5',
                year: '2年次',
                category: 'web',
                teamSize: '1人',
                period: '継続開発中'
            },
            // 1年次作品
            {
                title: 'UnderOver',
                description: 'Unity独自メソッドの学習を兼ねて開発した2Dアクションゲーム。Unity基礎固めの集大成。',
                technologies: ['Unity', 'C#', '2D Physics'],
                // image: 'https://picsum.photos/400/250?random=4',
                playUrl: 'https://github.com/wine-5', // UnityRoom公開後に更新予定
                githubUrl: 'https://github.com/wine-5',
                year: '1年次',
                category: 'game',
                teamSize: '1人',
                period: '2〜3ヶ月',
                note: 'UnityRoom公開予定'
            },
            {
                title: 'Split',
                description: '初めてのチーム開発で作った2Dアクションゲーム。企画からデバッグまで全工程を経験。Git初体験作品。',
                technologies: ['HTML', 'CSS', 'JavaScript', 'Git'],
                // image: 'https://picsum.photos/400/250?random=5',
                playUrl: '#', // 後日ゲームファイル追加予定
                githubUrl: '#', // リポジトリ状況確認後更新
                year: '1年次',
                category: 'web-game',
                teamSize: '3人（プログラマー3人）',
                period: '6ヶ月',
                note: '企画〜デバッグ全工程経験'
            },
            {
                title: 'ElementBattle',
                description: '記念すべき初作品のカードゲーム。関数・変数を学習しながら開発。プログラミングの基礎を身につけた思い出の作品。',
                technologies: ['HTML', 'CSS', 'JavaScript'],
                // image: 'https://picsum.photos/400/250?random=6',
                playUrl: '#', // 後日ゲームファイル追加予定
                githubUrl: 'https://github.com/wine-5',
                year: '1年次',
                category: 'web-game',
                teamSize: '1人',
                period: '約1ヶ月（2025年1月〜2月）',
                note: '記念すべき初作品'
            }
        ];
    }

    init() {
        console.log('WorksManager initializing...');
        console.log('worksGrid element:', this.worksGrid);
        console.log('projects array length:', this.projects.length);
        this.renderProjects();
    }

    renderProjects() {
        if (!this.worksGrid) {
            console.error('works-grid element not found!');
            return;
        }

        console.log('Rendering projects...');
        const projectsHtml = this.projects.map(project => 
            this.createProjectCard(project)
        ).join('');
        console.log('Generated HTML length:', projectsHtml.length);
        console.log('First 500 characters of HTML:', projectsHtml.substring(0, 500));
        this.worksGrid.innerHTML = projectsHtml;
        console.log('Projects rendered successfully');
    }

    createProjectCard(project) {
        const awardBadge = project.award ? `<div class="work-card__award">🏆 ${project.award}</div>` : '';
        const noteBadge = project.note ? `<div class="work-card__note">${project.note}</div>` : '';
        
        // 画像があるかチェック（undefinedや空文字列でない場合）
        const hasImage = project.image && project.image.trim() !== '';
        const imageElement = hasImage 
            ? `<img src="${project.image}" alt="${project.title}" 
                     onerror="this.src='https://via.placeholder.com/400x250/6366f1/ffffff?text=${encodeURIComponent(project.title)}'">` 
            : `<div class="placeholder-image">
                   <h3>${project.title}</h3>
                   <p>画像準備中</p>
               </div>`;
        
        return `
            <div class="work-card" data-category="${project.category}">
                ${awardBadge}
                <div class="work-card__image">
                    ${imageElement}
                    <div class="work-card__year-badge">${project.year}</div>
                </div>
                <div class="work-card__content">
                    <h3 class="work-card__title">${project.title}</h3>
                    <p class="work-card__description">${project.description}</p>
                    
                    <div class="work-card__details">
                        <div class="work-card__detail">
                            <span class="detail-label">開発規模:</span>
                            <span class="detail-value">${project.teamSize}</span>
                        </div>
                        <div class="work-card__detail">
                            <span class="detail-label">開発期間:</span>
                            <span class="detail-value">${project.period}</span>
                        </div>
                    </div>
                    
                    <div class="work-card__tags">
                        ${project.technologies.map(tech => 
                            `<span class="work-card__tag">${tech}</span>`
                        ).join('')}
                    </div>
                    
                    ${noteBadge}
                    
                    <div class="work-card__buttons">
                        <a href="${project.playUrl}" target="_blank" class="btn btn--primary work-card__button">
                            ${project.category === 'web' ? 'Visit Site' : 'Play Game'}
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
        this.emailService = null;
    }

    init() {
        this.initEmailService();
        this.setupFormSubmission();
        this.setupFormValidation();
    }

    initEmailService() {
        try {
            this.emailService = new EmailService();
        } catch (error) {
            console.warn('EmailService initialization failed:', error);
            this.showMessage('メール送信機能の初期化に失敗しました。', 'error');
        }
    }

    setupFormSubmission() {
        this.form?.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    setupFormValidation() {
        // リアルタイムバリデーション
        const inputs = this.form?.querySelectorAll('.form__input, .form__textarea');
        inputs?.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        switch (field.type) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = '正しいメールアドレスを入力してください';
                }
                break;
            case 'text':
                if (value.length < 2) {
                    isValid = false;
                    errorMessage = '2文字以上入力してください';
                }
                break;
            default:
                if (value.length < 10) {
                    isValid = false;
                    errorMessage = '10文字以上入力してください';
                }
        }

        this.toggleFieldError(field, !isValid, errorMessage);
        return isValid;
    }

    toggleFieldError(field, hasError, message) {
        const errorElement = field.parentNode.querySelector('.field-error');
        
        if (hasError) {
            if (!errorElement) {
                const error = document.createElement('div');
                error.className = 'field-error';
                error.textContent = message;
                error.style.cssText = `
                    color: #ef4444;
                    font-size: 1.2rem;
                    margin-top: 0.5rem;
                `;
                field.parentNode.appendChild(error);
            }
            field.style.borderColor = '#ef4444';
        } else {
            errorElement?.remove();
            field.style.borderColor = '';
        }
    }

    clearFieldError(field) {
        const errorElement = field.parentNode.querySelector('.field-error');
        errorElement?.remove();
        field.style.borderColor = '';
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.emailService) {
            this.showMessage('メール送信機能が利用できません。', 'error');
            return;
        }

        // フォーム全体のバリデーション
        const formData = new FormData(this.form);
        const templateParams = {
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message'),
            // 追加情報
            timestamp: new Date().toLocaleString('ja-JP'),
            source: 'wine-5 Portfolio Website'
        };

        try {
            // バリデーション
            this.emailService.validateTemplateParams(templateParams);
            
            this.showLoading(true);
            
            // メール送信
            await this.emailService.sendEmail(templateParams);
            
            this.showMessage('メッセージが送信されました！ご連絡ありがとうございます。', 'success');
            this.form.reset();
            this.clearAllFieldErrors();
            
        } catch (error) {
            console.error('Email send error:', error);
            
            let errorMessage = '送信に失敗しました。';
            if (error.message.includes('Required fields')) {
                errorMessage = '必須項目を入力してください。';
            } else if (error.message.includes('Invalid email')) {
                errorMessage = '正しいメールアドレスを入力してください。';
            } else {
                errorMessage += 'もう一度お試しください。';
            }
            
            this.showMessage(errorMessage, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    clearAllFieldErrors() {
        const errorElements = this.form?.querySelectorAll('.field-error');
        errorElements?.forEach(error => error.remove());
        
        const inputs = this.form?.querySelectorAll('.form__input, .form__textarea');
        inputs?.forEach(input => {
            input.style.borderColor = '';
        });
    }

    showMessage(message, type) {
        // 既存のメッセージを削除
        const existingMessage = document.querySelector('.form-message');
        existingMessage?.remove();

        // 新しいメッセージを作成
        const messageElement = document.createElement('div');
        messageElement.className = `form-message form-message--${type}`;
        messageElement.textContent = message;
        
        const baseStyles = `
            padding: 1.5rem;
            margin-top: 2rem;
            border-radius: 8px;
            font-weight: 500;
            text-align: center;
            animation: slideInUp 0.3s ease;
        `;
        
        messageElement.style.cssText = baseStyles + (type === 'success' 
            ? 'background-color: #10b981; color: white;' 
            : 'background-color: #ef4444; color: white;');

        this.form?.appendChild(messageElement);

        // アニメーション用CSS追加
        if (!document.querySelector('#message-animation-style')) {
            const style = document.createElement('style');
            style.id = 'message-animation-style';
            style.textContent = `
                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateY(1rem);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // 5秒後にメッセージを削除
        setTimeout(() => {
            messageElement?.remove();
        }, 5000);
    }

    showLoading(show) {
        const submitButton = this.form?.querySelector('[type="submit"]');
        if (!submitButton) return;

        if (show) {
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
            submitButton.style.opacity = '0.7';
        } else {
            submitButton.disabled = false;
            submitButton.textContent = 'Send Message';
            submitButton.style.opacity = '1';
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

/* ===================================
   アプリケーション初期化
   =================================== */
// 重複初期化を防ぐフラグ
let isInitialized = false;

document.addEventListener('DOMContentLoaded', function() {
    if (isInitialized) {
        console.log('Already initialized, skipping...');
        return;
    }
    
    console.log('DOM loaded, initializing portfolio app...');
    // ポートフォリオアプリケーションを初期化
    const app = new PortfolioApp();
    app.init();
    
    isInitialized = true;
    
    // ローディング画面を非表示
    setTimeout(() => {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
    }, 1000);
});

// ページロード完了後にパーティクルアニメーション開始
window.addEventListener('load', function() {
    console.log('Window loaded, initializing particle system...');
    const particleCanvas = document.getElementById('particle-canvas');
    if (particleCanvas && typeof ParticleSystem !== 'undefined') {
        const particleSystem = new ParticleSystem('particle-canvas');
        particleSystem.init();
    }
});