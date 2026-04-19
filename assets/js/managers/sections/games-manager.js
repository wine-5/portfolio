/* ===================================
   ゲーム管理クラス
   =================================== */
class GamesManager {
    constructor() {
        this.worksGrid = document.getElementById('works-grid');
        this.projects = [];
        this.activeCategory = 'all';
        this.activeTech = 'all';
    }

    async init() {
        if (!this.worksGrid) {
            // ワークグリッド要素不在
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
            // プロジェクトデータ不在
            return;
        }
        
        // ゲームセクションを初期化
        this.initializeGameSection();
        
        this.renderGames();
        this.setupImageSliders();
        this.setupFilters();
        this.setupLanguageListener();
    }

    /**
     * ゲームセクションを初期化（表示状態の設定）
     */
    initializeGameSection() {
        const gamesSection = document.querySelector('.works');
        if (gamesSection) {
            // 初期状態を不可視に設定
            gamesSection.style.opacity = '0';
            gamesSection.style.visibility = 'hidden';
            gamesSection.style.display = 'block';
            gamesSection.style.transition = 'opacity 0.8s ease-in-out';
        }
    }

    /**
     * ゲームセクションを表示（フェードイン）
     */
    showGameSection() {
        const gamesSection = document.querySelector('.works');
        if (gamesSection) {
            // 強制的にブラウザにレイアウト再計算させる
            void gamesSection.offsetHeight;
            
            // フェードイン
            gamesSection.style.opacity = '1';
            gamesSection.style.visibility = 'visible';
        }
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
        
        // ウィンドウリサイズ時に表示を再チェック
        window.addEventListener('resize', () => {
            this.checkAndUpdateGameSection();
        });
    }

    /**
     * ゲームセクションの表示状態を確認・更新
     */
    checkAndUpdateGameSection() {
        if (!this.worksGrid) return;
        
        // ゲームカード数をチェック
        const gameCards = this.worksGrid.querySelectorAll('.work-card');
        
        // カードが見つからない場合は再描画
        if (gameCards.length === 0 && this.projects.length > 0) {
            this.renderGames();
        }
    }

    renderGames() {
        if (!this.worksGrid) {
            return;
        }

        try {
            const projectsHtml = this.getFilteredProjects().map(project =>
                this.createGameCard(project)
            ).join('');
            
            if (!projectsHtml) {
                return;
            }
            
            this.worksGrid.innerHTML = projectsHtml;
            
            // ブラウザのレイアウト再計算を強制実行
            this.forceReflow();
            
            // スライダーの初期化：最初のスライドが確実に表示されるようにする
            setTimeout(() => {
                this.forceReflow();
                
                const allSliders = document.querySelectorAll('.image-slider');
                
                allSliders.forEach(slider => {
                    const firstSlide = slider.querySelector('.slider-image');
                    if (firstSlide && !firstSlide.classList.contains('active')) {
                        firstSlide.classList.add('active');
                    }
                    
                    const firstIndicator = slider.querySelector('.indicator');
                    if (firstIndicator && !firstIndicator.classList.contains('active')) {
                        firstIndicator.classList.add('active');
                    }
                });
                
                // ゲームセクションをフェードイン表示
                this.showGameSection();
            }, 150);
        } catch (error) {
            // ゲームカードレンダリングエラーハンドリング
        }
    }

    /**
     * ブラウザのレイアウト再計算を強制実行
     */
    forceReflow() {
        // DOMを強制的に再フロー
        if (this.worksGrid) {
            // offsetHeightへのアクセスでレイアウト再計算を強制
            const height = this.worksGrid.offsetHeight;
        }
    }

    /**
     * フィルタを適用したプロジェクト配列を返す
     */
    getFilteredProjects() {
        return this.projects.filter(project => {
            const catMatch = this.activeCategory === 'all' || project.category === this.activeCategory;
            const techMatch = this.activeTech === 'all' || (project.technologies || []).includes(this.activeTech);
            return catMatch && techMatch;
        });
    }

    /**
     * フィルタUIのイベントリスナーを設定
     */
    setupFilters() {
        const filterBtns = document.querySelectorAll('.works__filter-btn');
        const techSelect = document.getElementById('tech-filter');

        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // ボタンのアクティブ状態を更新
                filterBtns.forEach(b => b.classList.remove('works__filter-btn--active'));
                e.target.classList.add('works__filter-btn--active');

                // フィルタ状態を更新
                this.activeCategory = e.target.dataset.filter;
                this.renderGames();
            });
        });

        if (techSelect) {
            techSelect.addEventListener('change', (e) => {
                // フィルタ状態を更新
                this.activeTech = e.target.value;
                this.renderGames();
            });
        }
    }

    /**
     * プレースホルダー画像のDataURLを生成
     * @param {string} text - 表示するテキスト
     * @returns {string} SVG DataURL
     */
    createPlaceholderImage(text) {
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250">
                <rect width="400" height="250" fill="#6366f1"/>
                <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" 
                      fill="#ffffff" text-anchor="middle" dominant-baseline="middle">
                    ${text}
                </text>
            </svg>
        `;
        return `data:image/svg+xml,${encodeURIComponent(svg)}`;
    }

    createGameCard(project) {
        const awardBadge = project.award ? `<div class="work-card__award">🏆 ${project.award}</div>` : '';
        const noteBadge = project.note ? `<div class="work-card__note">${project.note}</div>` : '';
        
        // 画像の処理（単一画像または複数画像）
        const hasImages = (project.images && project.images.length > 0) || (project.image && project.image.trim() !== '');
        const playUrl = project.locked ? '' : this.getPlayUrl(project); // ロック時はプレイURLを無効化
        
        let imageElement;
        if (project.images && project.images.length > 1) {
            // 複数画像の場合：スライダー表示
            imageElement = this.createImageSlider(project.images, project.title, playUrl, project.locked);
        } else if (project.images && project.images.length === 1) {
            // 単一画像または動画の場合
            const singleItem = project.images[0];
            const isVideo = singleItem.toLowerCase().endsWith('.mp4') || singleItem.toLowerCase().endsWith('.webm') || singleItem.toLowerCase().endsWith('.ogg');
            
            if (isVideo) {
                // 単一動画の場合
                imageElement = `
                    <div class="single-video-container">
                        <video src="${singleItem}" 
                               class="work-card__main-video"
                               controls
                               muted
                               preload="metadata"
                               style="width: 100%; height: 100%; object-fit: cover;"
                               onloadedmetadata="this.currentTime = 1;">
                            お使いのブラウザは動画の再生に対応していません。
                        </video>
                        <div class="video-info-overlay">
                            <div class="video-info-hint">
                                <i class="fas fa-play"></i>
                                <span>動画を再生</span>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                // 単一画像の場合
                const lockClass = project.locked ? 'locked-image' : '';
                imageElement = `
                    <div class="single-image-container ${lockClass}" data-play-url="${playUrl || ''}" data-locked="${project.locked || false}">
                        <img src="${singleItem}" alt="${project.title}のスクリーンショット" 
                             class="work-card__main-image ${project.locked ? '' : 'clickable-image'}"
                             loading="lazy"
                             data-play-url="${playUrl || ''}"
                             onerror="this.src='${this.createPlaceholderImage(project.title)}'">
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
                    </div>
                `;
            }
        } else if (project.image && project.image.trim() !== '') {
            // レガシー：単一画像の場合
            const lockClass = project.locked ? 'locked-image' : '';
            imageElement = `
                <div class="single-image-container ${lockClass}" data-play-url="${playUrl || ''}" data-locked="${project.locked || false}">
                    <img src="${project.image}" alt="${project.title}のスクリーンショット" 
                         class="work-card__main-image ${project.locked ? '' : 'clickable-image'}"
                         loading="lazy"
                         data-play-url="${playUrl || ''}"
                         onerror="this.src='${this.createPlaceholderImage(project.title)}'">
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
        
        // プロジェクトに動画が含まれているかチェック
        const hasVideo = images.some(image => 
            image.toLowerCase().endsWith('.mp4') || 
            image.toLowerCase().endsWith('.webm') || 
            image.toLowerCase().endsWith('.ogg')
        );
        
        return `
            <div class="image-slider ${lockClass}" data-slider-id="${sliderId}" data-play-url="${playUrl || ''}" data-locked="${isLocked || false}">
                <div class="slider-container">
                    ${images.map((image, index) => {
                        const isVideo = image.toLowerCase().endsWith('.mp4') || image.toLowerCase().endsWith('.webm') || image.toLowerCase().endsWith('.ogg');
                        
                        if (isVideo) {
                            return `
                                <div class="video-container slider-image ${index === 0 ? 'active' : ''}" data-video="true">
                                    <video src="${image}" 
                                           class="video-element"
                                           controls
                                           muted
                                           preload="metadata"
                                           style="width: 100%; height: 100%; object-fit: cover;"
                                           onloadedmetadata="this.currentTime = 1;">
                                        お使いのブラウザは動画の再生に対応していません。
                                    </video>
                                    <div class="video-info-overlay">
                                        <div class="video-info-hint">
                                            <i class="fas fa-play"></i>
                                            <span>動画を再生</span>
                                        </div>
                                    </div>
                                </div>
                            `;
                        } else {
                            // 画像の場合：動画がある場合はクリック無効、動画がない場合はクリック有効
                            const isClickable = !hasVideo && !isLocked;
                            return `
                                <div class="image-container slider-image ${index === 0 ? 'active' : ''}">
                                    <img src="${image}" 
                                         alt="${title}のスクリーンショット ${index + 1}" 
                                         class="image-element ${isClickable ? 'clickable-image' : ''}"
                                         loading="lazy"
                                         data-play-url="${isClickable ? (playUrl || '') : ''}"
                                         onerror="this.src='${this.createPlaceholderImage(title)}'">
                                    ${isClickable ? `
                                        <div class="image-play-overlay clickable-image" data-play-url="${playUrl || ''}">
                                            <div class="play-game-hint">
                                                <i class="fas fa-external-link-alt"></i>
                                                <span>ゲームをプレイ</span>
                                            </div>
                                        </div>
                                    ` : ''}
                                </div>
                            `;
                        }
                    }).join('')}
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
                ` : (!hasVideo ? `
                    <div class="play-hint">
                        <i class="fas fa-play-circle"></i>
                        <span>クリックしてプレイ</span>
                    </div>
                ` : '')}
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
        
        // App Store等のインストールリンクがある場合
        if (project.install && project.install !== '#') {
            return `<a href="${project.install}" target="_blank" class="btn btn--primary work-card__button">
                        <i class="fas fa-download"></i>
                        Install
                    </a>`;
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
                // 画像または動画オーバーレイをクリックしてゲームをプレイ
                const clickedElement = e.target.closest('.clickable-image');
                const playUrl = clickedElement.dataset.playUrl || clickedElement.closest('[data-play-url]')?.dataset.playUrl;
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
        // installフィールドがある場合（App Store等）
        if (project.install && project.install !== '#') {
            return project.install;
        }
        
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
        if (!slider) {
            return;
        }

        const images = slider.querySelectorAll('.slider-image');
        const indicators = slider.querySelectorAll('.indicator');

        // 現在アクティブな動画を一時停止
        const currentActiveVideo = slider.querySelector('.slider-image.active video');
        if (currentActiveVideo) {
            currentActiveVideo.pause();
        }

        // 全ての画像・動画からactiveクラスを削除
        images.forEach(img => img.classList.remove('active'));
        indicators.forEach(ind => ind.classList.remove('active'));

        // 新しい画像・動画とインジケーターにactiveクラスを追加
        if (images[index]) {
            images[index].classList.add('active');
            
            // 新しくアクティブになった要素が動画の場合、サムネイルを表示
            const newVideo = images[index].querySelector('video');
            if (newVideo) {
                // 動画の最初のフレームにリセット
                newVideo.currentTime = 1;
            }
        }
        if (indicators[index]) indicators[index].classList.add('active');
    }
}