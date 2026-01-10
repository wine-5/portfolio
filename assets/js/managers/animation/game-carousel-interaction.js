/**
 * ゲームカルーセルインタラクションクラス
 * 責任: ユーザー操作の処理
 * SOLID: 単一責任の原則に従う
 */
class GameCarouselInteraction {
    constructor(carousel) {
        this.carousel = carousel;
        this.container = carousel.container;
        
        // タッチイベント用
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.isTouch = false;

        // キーボード用
        this.keyboardEnabled = true;

        // バインド
        this.handlePrevClick = this.handlePrevClick.bind(this);
        this.handleNextClick = this.handleNextClick.bind(this);
        this.handleIndicatorClick = this.handleIndicatorClick.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    /**
     * イベントリスナーを設定
     */
    setupListeners() {
        // ボタンクリック
        const prevBtn = this.container.querySelector('.game-carousel__control-btn--prev');
        const nextBtn = this.container.querySelector('.game-carousel__control-btn--next');

        if (prevBtn) prevBtn.addEventListener('click', this.handlePrevClick);
        if (nextBtn) nextBtn.addEventListener('click', this.handleNextClick);

        // インジケータークリック
        const indicators = this.container.querySelectorAll('.game-carousel__indicator');
        indicators.forEach(indicator => {
            indicator.addEventListener('click', this.handleIndicatorClick);
        });

        // タッチイベント
        this.container.addEventListener('touchstart', this.handleTouchStart, false);
        this.container.addEventListener('touchend', this.handleTouchEnd, false);

        // キーボードイベント
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

        const indicators = this.container.querySelectorAll('.game-carousel__indicator');
        indicators.forEach(indicator => {
            indicator.removeEventListener('click', this.handleIndicatorClick);
        });

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
     * インジケーターをクリック
     * @private
     */
    handleIndicatorClick(e) {
        const index = parseInt(e.target.dataset.index, 10);
        this.carousel.goToSlide(index);
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
