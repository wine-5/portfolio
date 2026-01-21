/**
 * ゲームカルーセルインタラクションクラス
 * 責任: ユーザー操作の処理
 */
class GameCarouselInteraction {
    constructor(carousel) {
        this.carousel = carousel;
        this.container = carousel.container;
        
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.isTouch = false;

        this.keyboardEnabled = true;

        this.handlePrevClick = this.handlePrevClick.bind(this);
        this.handleNextClick = this.handleNextClick.bind(this);
        this.handleItemClick = this.handleItemClick.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    /**
     * イベントリスナーを設定
     */
    setupListeners() {
        const prevBtn = this.container.querySelector('.game-carousel__control-btn--prev');
        const nextBtn = this.container.querySelector('.game-carousel__control-btn--next');

        if (prevBtn) prevBtn.addEventListener('click', this.handlePrevClick);
        if (nextBtn) nextBtn.addEventListener('click', this.handleNextClick);

        // アイテムクリック
        const itemsContainer = this.container.querySelector('.game-carousel__items');
        if (itemsContainer) {
            itemsContainer.addEventListener('click', this.handleItemClick);
        }

        this.container.addEventListener('touchstart', this.handleTouchStart, false);
        this.container.addEventListener('touchend', this.handleTouchEnd, false);

        document.addEventListener('keydown', this.handleKeyDown);
    }

    /**
     * イベントリスナーを削除
     */
    removeListeners() {
        const prevBtn = this.container.querySelector('.game-carousel__control-btn--prev');
        const nextBtn = this.container.querySelector('.game-carousel__control-btn--next');

        if (prevBtn) prevBtn.removeEventListener('click', this.handlePrevClick);
        if (nextBtn) nextBtn.removeEventListener('click', this.handleNextClick);

        const itemsContainer = this.container.querySelector('.game-carousel__items');
        if (itemsContainer) {
            itemsContainer.removeEventListener('click', this.handleItemClick);
        }

        this.container.removeEventListener('touchstart', this.handleTouchStart);
        this.container.removeEventListener('touchend', this.handleTouchEnd);

        document.removeEventListener('keydown', this.handleKeyDown);
    }

    /**
     * 前のスライドボタンクリック
     * @private
     */
    handlePrevClick() {
        this.carousel.previousSlide();
    }

    /**
     * 次のスライドボタンクリック
     * @private
     */
    handleNextClick() {
        this.carousel.nextSlide();
    }

    /**
     * アイテムをクリック - ゲームセクションにジャンプ
     * @private
     */
    handleItemClick(e) {
        const item = e.target.closest('.game-carousel__item');
        if (!item) return;

        const index = parseInt(item.dataset.index, 10);
        const game = this.carousel.games[index];
        if (!game) return;

        // ゲームセクションにスクロール
        const gamesSection = document.getElementById('games');
        if (gamesSection) {
            gamesSection.scrollIntoView({ behavior: 'smooth' });
            
            // ゲームセクションをハイライト
            setTimeout(() => {
                const gameCards = document.querySelectorAll('.work-card');
                gameCards.forEach((card, idx) => {
                    if (idx === index) {
                        card.classList.add('highlight');
                        setTimeout(() => card.classList.remove('highlight'), 2000);
                    }
                });
            }, 500);
        }
    }

    /**
     * タッチ開始
     * @private
     */
    handleTouchStart(e) {
        this.touchStartX = e.changedTouches[0].screenX;
        this.isTouch = true;
    }

    /**
     * タッチ終了
     * @private
     */
    handleTouchEnd(e) {
        this.touchEndX = e.changedTouches[0].screenX;
        this.detectSwipe();
    }

    /**
     * スワイプを検出
     * @private
     */
    detectSwipe() {
        const swipeThreshold = 50;
        const difference = this.touchStartX - this.touchEndX;

        if (Math.abs(difference) > swipeThreshold) {
            if (difference > 0) {
                // 左にスワイプ → 次へ
                this.carousel.nextSlide();
            } else {
                // 右にスワイプ → 前へ
                this.carousel.previousSlide();
            }
        }

        this.isTouch = false;
    }

    /**
     * キーボード入力を処理
     * @private
     */
    handleKeyDown(e) {
        if (!this.keyboardEnabled) return;

        switch (e.key) {
            case 'ArrowLeft':
                this.carousel.previousSlide();
                e.preventDefault();
                break;
            case 'ArrowRight':
                this.carousel.nextSlide();
                e.preventDefault();
                break;
        }
    }
}
