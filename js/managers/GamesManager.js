/* ===================================
   ゲーム管理クラス
   =================================== */
class GamesManager {
    constructor() {
        this.worksGrid = document.getElementById('works-grid');
        this.projects = PROJECTS_DATA; // 外部データを参照
    }

    init() {
        this.renderGames();
        this.setupImageSliders(); // スライダーイベント設定
    }

    renderGames() {
        if (!this.worksGrid) return;

        const projectsHtml = this.projects.map(project => 
            this.createGameCard(project)
        ).join('');
        this.worksGrid.innerHTML = projectsHtml;
        
        // レンダリング後にアニメーション用のクラスを追加
        this.setupGameAnimations();
    }
    
    setupGameAnimations() {
        // DOM更新後に実行
        setTimeout(() => {
            const workCards = this.worksGrid.querySelectorAll('.work-card');
            workCards.forEach((card, index) => {
                // 各カードに遅延を設定してアニメーション
                setTimeout(() => {
                    card.classList.add('fade-in', 'visible');
                }, index * 150); // 150ms間隔でアニメーション
            });
        }, 50);
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
                    </div>
                    
                    <div class="work-card__tags">
                        ${project.technologies.map(tech => 
                            `<span class="work-card__tag">${tech}</span>`
                        ).join('')}
                    </div>
                    
                    ${noteBadge}
                    
                    <div class="work-card__buttons">
                        ${this.createPlayButton(project)}
                        <a href="${project.githubUrl}" target="_blank" class="btn btn--secondary work-card__button">
                            GitHub
                        </a>
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