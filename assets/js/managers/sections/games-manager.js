/* ===================================
   ゲーム管理クラス
   =================================== */
class GamesManager {
    constructor() {
        this.worksGrid = document.getElementById('works-grid');
        this.projects = [];
    }

    async init() {
        if (!this.worksGrid) {
            console.error('GamesManager: works-grid element not found in DOM');
            return;
        }
        
        // projectsDataがまだロードされていない場合はロードを待つ
        if (window.projectsData && !window.projectsData.isReady()) {
            const lang = window.i18n ? window.i18n.getCurrentLanguage() : 'ja';
            await window.projectsData.load(lang);
        }
        
        // プロジェクトデータを取得
        this.projects = window.PROJECTS_DATA || [];
        
        if (this.projects.length === 0) {
            console.error('GamesManager: No projects data available');
            return;
        }
        
        this.renderGames();
        this.setupImageSliders();
        this.setupLanguageListener();
    }

    /**
     * 言語変更リスナーを設定
     */
    setupLanguageListener() {
        window.addEventListener('languageChanged', async (e) => {
            const newLang = e.detail.language;
            
            // 新しい言語でデータを再読み込み
            if (window.projectsData) {
                await window.projectsData.load(newLang);
                this.projects = window.PROJECTS_DATA || [];
                this.renderGames();
                // スライダーの再初期化は不要(renderGames内でHTMLが再生成されるため)
            }
        });
    }

    renderGames() {
        if (!this.worksGrid) {
            console.error('works-grid element not found');
            return;
        }

        const projectsHtml = this.projects.map(project => 
            this.createGameCard(project)
        ).join('');
        
        this.worksGrid.innerHTML = projectsHtml;
    }

    createGameCard(project) {
        const awardBadge = project.award ? `<div class="work-card__award">🏆 ${project.award}</div>` : '';
        const noteBadge = project.note ? `<div class="work-card__note">${project.note}</div>` : '';
        
        // 画像の処理（単一画像または複数画像）
        const hasImages = (project.images && project.images.length > 0) || (project.image && project.image.trim() !== '');
        const playUrl = project.locked ? '' : this.getPlayUrl(project); // ロック時はプレイURLを無効化
        
        let imageElement;
        if (project.images && project.images.length > 0) {
            // 複数画像の場合：スライダー表示
            imageElement = this.createImageSlider(project.images, project.title, playUrl, project.locked);
        } else if (project.image && project.image.trim() !== '') {
            // 単一画像の場合
            const lockClass = project.locked ? 'locked-image' : '';
            imageElement = `
                <div class="single-image-container ${lockClass}" data-play-url="${playUrl || ''}" data-locked="${project.locked || false}">
                    <img src="${project.image}" alt="${project.title}のスクリーンショット" 
                         class="work-card__main-image ${project.locked ? '' : 'clickable-image'}"
                         loading="lazy"
                         data-play-url="${playUrl || ''}"
                         onerror="this.src='https://via.placeholder.com/400x250/6366f1/ffffff?text=${encodeURIComponent(project.title)}'">
                    ${project.locked ? `
                        <div class="lock-overlay">
                            <i class="fas fa-lock"></i>
                            <span>${project.lockReason || '準備中'}</span>
                        </div>
                    ` : `
                        <div class="play-hint">
                            <i class="fas fa-play-circle"></i>
                            <span>クリックしてプレイ</span>
                        </div>
                    `}
                </div>`;
        } else {
            // 画像がない場合：プレースホルダー
            imageElement = `<div class="placeholder-image">
                               <div class="placeholder-icon">
                                   <i class="fas fa-${project.category === 'web' ? 'code' : 'gamepad'}"></i>
                               </div>
                               <h3>${project.title}</h3>
                               <p>スクリーンショット準備中</p>
                           </div>`;
        }
        
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
                        ${project.supportedPlatforms ? `
                        <div class="work-card__detail">
                            <span class="detail-label">対応端末:</span>
                            <span class="detail-value">${project.supportedPlatforms.join(', ')}</span>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="work-card__tags">
                        ${project.technologies.map(tech => 
                            `<span class="work-card__tag">${tech}</span>`
                        ).join('')}
                    </div>
                    
                    <!-- 詳細情報の折りたたみ -->
                    ${project.detailedFeatures ? `
                        <details class="work-card__details">
                            <summary class="work-card__details-summary">
                                <i class="fas fa-chevron-down"></i>
                                <span>詳細な特徴を見る</span>
                            </summary>
                            <div class="work-card__details-content">
                                ${project.myResponsibilities ? `
                                    <div class="work-card__responsibilities">
                                        <h5 class="work-card__responsibilities-title">
                                            <i class="fas fa-user-cog"></i>
                                            自分の担当箇所
                                        </h5>
                                        <p class="work-card__responsibilities-content">${project.myResponsibilities}</p>
                                    </div>
                                ` : ''}
                                <div class="work-card__features-section">
                                    <h5 class="work-card__features-title">
                                        <i class="fas fa-info-circle"></i>
                                        詳細な説明
                                    </h5>
                                    <p class="work-card__features">${project.detailedFeatures}</p>
                                </div>
                            </div>
                        </details>
                    ` : ''}
                    
                    ${noteBadge}
                    
                    <div class="work-card__buttons">
                        ${this.createPlayButton(project)}
                        ${this.createGitHubButton(project)}
                    </div>
                </div>
            </div>
        `;
    }

    createImageSlider(images, title, playUrl, isLocked) {
        const sliderId = `slider-${Math.random().toString(36).substr(2, 9)}`;
        const lockClass = isLocked ? 'locked-image' : '';
        
        return `
            <div class="image-slider ${lockClass}" data-slider-id="${sliderId}" data-play-url="${playUrl || ''}" data-locked="${isLocked || false}">
                <div class="slider-container">
                    ${images.map((image, index) => `
                        <img src="${image}" 
                             alt="${title}のスクリーンショット ${index + 1}" 
                             class="slider-image ${index === 0 ? 'active' : ''} ${isLocked ? '' : 'clickable-image'}"
                             loading="lazy"
                             data-play-url="${playUrl || ''}"
                             onerror="this.src='https://via.placeholder.com/400x250/6366f1/ffffff?text=${encodeURIComponent(title)}'">
                    `).join('')}
                </div>
                
                <!-- スライダーコントロール -->
                <div class="slider-controls">
                    <button class="slider-btn slider-prev" data-slider="${sliderId}">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button class="slider-btn slider-next" data-slider="${sliderId}">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
                
                <!-- インジケーター -->
                <div class="slider-indicators">
                    ${images.map((_, index) => `
                        <button class="indicator ${index === 0 ? 'active' : ''}" 
                                data-slider="${sliderId}" 
                                data-slide="${index}"></button>
                    `).join('')}
                </div>
                
                <!-- プレイヒントまたはロック表示 -->
                ${isLocked ? `
                    <div class="lock-overlay">
                        <i class="fas fa-lock"></i>
                        <span>準備中</span>
                    </div>
                ` : `
                    <div class="play-hint">
                        <i class="fas fa-play-circle"></i>
                        <span>クリックしてプレイ</span>
                    </div>
                `}
            </div>
        `;
    }

    createPlayButton(project) {
        // ロックされている場合
        if (project.locked) {
            return `<button class="btn btn--locked work-card__button" disabled>
                        <i class="fas fa-lock"></i>
                        ${project.lockReason || '準備中'}
                    </button>`;
        }
        
        // ウェブ公開用パスがある場合は、オンラインでプレイ可能
        if (project.webPath) {
            return `<a href="${project.webPath}" target="_blank" class="btn btn--primary work-card__button">
                        <i class="fas fa-play"></i>
                        Play Game
                    </a>`;
        }
        
        // localPathがある場合は、ローカルファイルを開くボタンを表示
        if (project.localPath) {
            return `<a href="${project.localPath}" target="_blank" class="btn btn--primary work-card__button">
                        <i class="fas fa-desktop"></i>
                        Play Game (Local)
                    </a>`;
        }
        
        // 通常のplayUrlボタン
        if (project.playUrl && project.playUrl !== '#') {
            return `<a href="${project.playUrl}" target="_blank" class="btn btn--primary work-card__button">
                        <i class="fas fa-external-link-alt"></i>
                        ${project.category === 'web' ? 'Visit Site' : 'Play Game'}
                </button>`;
        }
        
        // プレイできない場合
        return `<button class="btn btn--primary work-card__button" disabled>
                    <i class="fas fa-clock"></i>
                    Coming Soon
                </button>`;
    }

    createGitHubButton(project) {
        // GitHubリンクが有効な場合のみボタンを表示
        if (!project.githubUrl || project.githubUrl === '#' || project.githubUrl === 'https://github.com/wine-5') {
            return ''; // 無効なリンクの場合は非表示
        }
        
        return `<a href="${project.githubUrl}" target="_blank" class="btn btn--secondary work-card__button">
                    <i class="fab fa-github"></i>
                    GitHub
                </a>`;
    }

    setupImageSliders() {
        // スライダーボタンのイベントリスナー
        document.addEventListener('click', (e) => {
            if (e.target.closest('.slider-prev')) {
                const sliderId = e.target.closest('.slider-prev').dataset.slider;
                this.changeSlide(sliderId, -1);
            } else if (e.target.closest('.slider-next')) {
                const sliderId = e.target.closest('.slider-next').dataset.slider;
                this.changeSlide(sliderId, 1);
            } else if (e.target.closest('.indicator')) {
                const button = e.target.closest('.indicator');
                const sliderId = button.dataset.slider;
                const slideIndex = parseInt(button.dataset.slide);
                this.goToSlide(sliderId, slideIndex);
            } else if (e.target.closest('.clickable-image')) {
                // 画像をクリックしてゲームをプレイ
                const playUrl = e.target.dataset.playUrl || e.target.closest('[data-play-url]')?.dataset.playUrl;
                this.handleImageClick(playUrl);
            }
        });
    }

    handleImageClick(playUrl) {
        if (!playUrl || playUrl === '' || playUrl === '#') {
            // プレイできない場合は何もしない、または通知を表示
            return;
        }
        
        // 新しいタブでゲームを開く
        window.open(playUrl, '_blank');
    }

    getPlayUrl(project) {
        // ウェブ公開用パスがある場合
        if (project.webPath) {
            return project.webPath;
        }
        
        // localPathがある場合
        if (project.localPath) {
            return project.localPath;
        }
        
        // 通常のplayUrl
        if (project.playUrl && project.playUrl !== '#') {
            return project.playUrl;
        }
        
        return '';
    }

    changeSlide(sliderId, direction) {
        const slider = document.querySelector(`[data-slider-id="${sliderId}"]`);
        if (!slider) return;

        const images = slider.querySelectorAll('.slider-image');
        const indicators = slider.querySelectorAll('.indicator');
        const currentIndex = Array.from(images).findIndex(img => img.classList.contains('active'));
        
        let newIndex = currentIndex + direction;
        if (newIndex >= images.length) newIndex = 0;
        if (newIndex < 0) newIndex = images.length - 1;

        this.goToSlide(sliderId, newIndex);
    }

    goToSlide(sliderId, index) {
        const slider = document.querySelector(`[data-slider-id="${sliderId}"]`);
        if (!slider) return;

        const images = slider.querySelectorAll('.slider-image');
        const indicators = slider.querySelectorAll('.indicator');

        // 全ての画像からactiveクラスを削除
        images.forEach(img => img.classList.remove('active'));
        indicators.forEach(ind => ind.classList.remove('active'));

        // 新しい画像とインジケーターにactiveクラスを追加
        if (images[index]) images[index].classList.add('active');
        if (indicators[index]) indicators[index].classList.add('active');
    }
}