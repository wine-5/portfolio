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
                        ${this.createPlayButton(project)}
                        <a href="${project.githubUrl}" target="_blank" class="btn btn--secondary work-card__button">
                            GitHub
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    createPlayButton(project) {
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
                    </a>`;
        }
        
        // プレイできない場合
        return `<button class="btn btn--primary work-card__button" disabled>
                    <i class="fas fa-clock"></i>
                    Coming Soon
                </button>`;
    }
}