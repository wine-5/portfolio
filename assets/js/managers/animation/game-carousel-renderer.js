/**
 * ゲームカルーセルレンダラークラス
 * 責任: 円形配置の描画処理
 */
class GameCarouselRenderer {
    constructor(container, config) {
        this.container = container;
        this.config = config;
        
        this.setupDOM();
    }

    /**
     * DOM構造を構築
     */
    setupDOM() {
        this.container.classList.add('game-carousel');
        this.container.innerHTML = `
            <div class="game-carousel__stage">
                <div class="game-carousel__center-label">wine-5</div>
                <div class="game-carousel__items"></div>
            </div>
            <div class="game-carousel__controls">
                <button class="game-carousel__control-btn game-carousel__control-btn--prev" aria-label="前へ">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>
                <button class="game-carousel__control-btn game-carousel__control-btn--next" aria-label="次へ">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>
            </div>
        `;

        this.itemsContainer = this.container.querySelector('.game-carousel__items');
    }

    /**
     * カルーセルを描画
     * @param {Array} games - ゲームデータ配列
     * @param {Array} positions - 位置情報配列
     * @param {number} rotation - 現在の回転角度
     */
    render(games, positions, rotation) {
        this.renderItems(games, positions, rotation);
    }

    /**
     * アイテムを描画（円形配置）
     * @private
     */
    renderItems(games, positions, rotation) {
        this.itemsContainer.innerHTML = positions.map(({ angle, index, game }) => {
            const radians = (angle * Math.PI) / 180;
            const x = Math.cos(radians) * this.config.radiusX;
            const z = Math.sin(radians) * this.config.radiusZ;
            
            // 手前に来ているアイテムを大きく表示
            const scale = 1 + (Math.cos(radians) * 0.3);
            const opacity = Math.max(0.7, 1 - Math.abs(z) / (this.config.radiusZ * 3));
            
            // 画像パスの取得（thumbnailImage を優先使用）
            let imageSrc = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 200"%3E%3Crect fill="%23667eea" width="140" height="200"/%3E%3C/svg%3E';
            if (game.thumbnailImage) {
                imageSrc = game.thumbnailImage;
            } else if (game.images && game.images.length > 0) {
                imageSrc = game.images[0];
            }

            return `
                <div class="game-carousel__item" 
                     data-index="${index}"
                     style="
                        transform: 
                            translateX(${x}px) 
                            translateZ(${z}px) 
                            scale(${scale});
                     ">
                    <div class="game-carousel__item-content" style="opacity: ${opacity};">
                        <img src="${imageSrc}" alt="${game.title}" class="game-carousel__item-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 140 140%22%3E%3Crect fill=%22%23667eea%22 width=%22140%22 height=%22140%22/%3E%3C/svg%3E'">
                    </div>
                </div>
            `;
        }).join('');
    }
}

