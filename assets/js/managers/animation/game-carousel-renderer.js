/**
 * ゲームカルーセルレンダラークラス
 * 責任: 描画処理のみ
 * SOLID: 単一責任の原則に従う
 */
class GameCarouselRenderer {
    constructor(container, config) {
        this.container = container;
        this.config = config;
        
        // HTML構造を構築
        this.setupDOM();
    }

    /**
     * DOM構造を構築
     */
    setupDOM() {
        this.container.classList.add('game-carousel');
        this.container.innerHTML = `
            <div class="game-carousel__track">
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
            <div class="game-carousel__indicators"></div>
        `;

        this.itemsContainer = this.container.querySelector('.game-carousel__items');
        this.indicatorsContainer = this.container.querySelector('.game-carousel__indicators');
    }

    /**
     * カルーセルアイテムを描画
     * @param {Array} games - ゲームデータ配列
     * @param {number} currentIndex - 現在のインデックス
     */
    render(games, currentIndex) {
        // アイテムを描画
        this.renderItems(games, currentIndex);
        
        // インジケーターを描画
        this.renderIndicators(games, currentIndex);
    }

    /**
     * アイテムを描画
     * @private
     */
    renderItems(games, currentIndex) {
        this.itemsContainer.innerHTML = games.map((game, index) => {
            const distance = Math.abs(index - currentIndex);
            const scale = this.calculateScale(distance, games.length);
            const zIndex = games.length - distance;
            const rotation = this.calculateRotation(index, currentIndex, games.length);

            return `
                <div class="game-carousel__item" 
                     data-index="${index}"
                     style="
                        transform: scale(${scale}) rotateY(${rotation}deg);
                        z-index: ${zIndex};
                        opacity: ${this.calculateOpacity(distance)};
                     ">
                    <div class="game-carousel__item-content">
                        <img src="${game.images[0]}" alt="${game.title}" class="game-carousel__item-image">
                        <div class="game-carousel__item-overlay">
                            <h3 class="game-carousel__item-title">${game.title}</h3>
                            <p class="game-carousel__item-description">${game.description}</p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * インジケーターを描画
     * @private
     */
    renderIndicators(games, currentIndex) {
        this.indicatorsContainer.innerHTML = games.map((_, index) => `
            <button class="game-carousel__indicator ${index === currentIndex ? 'active' : ''}" 
                    data-index="${index}"
                    aria-label="ゲーム ${index + 1}"></button>
        `).join('');
    }

    /**
     * スケール値を計算
     * @private
     */
    calculateScale(distance, totalItems) {
        if (distance === 0) {
            return this.config.centerScale;
        }
        
        const factor = distance / (totalItems / 2);
        return Math.max(
            this.config.edgeScale,
            this.config.centerScale - (factor * (this.config.centerScale - this.config.edgeScale))
        );
    }

    /**
     * 回転角度を計算
     * @private
     */
    calculateRotation(currentPos, centerPos, totalItems) {
        const distance = currentPos - centerPos;
        const direction = distance > 0 ? 1 : distance < 0 ? -1 : 0;
        const maxRotation = this.config.rotationAngle;
        
        return Math.min(Math.abs(distance) * maxRotation, maxRotation) * direction;
    }

    /**
     * 透明度を計算
     * @private
     */
    calculateOpacity(distance) {
        if (distance === 0) return 1;
        if (distance === 1) return 0.8;
        if (distance === 2) return 0.5;
        return 0;
    }
}
