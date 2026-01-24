class GameCarouselInteraction {
    constructor(carousel) {
        this.carousel = carousel;
        this.container = carousel.container;
        
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.isTouch = false;

        // マウスドラッグ用
        this.mouseStartX = 0;
        this.isMouseDown = false;

        this.keyboardEnabled = true;

        this.handlePrevClick = this.handlePrevClick.bind(this);
        this.handleNextClick = this.handleNextClick.bind(this);
        this.handleItemClick = this.handleItemClick.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
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

        // マウスドラッグイベント
        this.container.addEventListener('mousedown', this.handleMouseDown, false);
        document.addEventListener('mousemove', this.handleMouseMove, false);
        document.addEventListener('mouseup', this.handleMouseUp, false);

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

        this.container.removeEventListener('mousedown', this.handleMouseDown);
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);

        document.removeEventListener('keydown', this.handleKeyDown);
    }

    /**
     * 前のスライドボタンクリック
     * @private
     */
    handlePrevClick() {
        this.carousel.stopAutoRotation();
        this.carousel.previousSlide();
        // 3秒後に自動回転再開
        setTimeout(() => this.carousel.startAutoRotation(), 3000);
    }

    /**
     * 次のスライドボタンクリック
     * @private
     */
    handleNextClick() {
        this.carousel.stopAutoRotation();
        this.carousel.nextSlide();
        // 3秒後に自動回転再開
        setTimeout(() => this.carousel.startAutoRotation(), 3000);
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
            this.carousel.stopAutoRotation();
            
            if (difference > 0) {
                this.carousel.nextSlide();
            } else {
                this.carousel.previousSlide();
            }
            
            // 3秒後に自動回転再開
            setTimeout(() => {
                this.carousel.startAutoRotation();
            }, 3000);
        }

        this.isTouch = false;
    }

    /**
     * マウスダウン - ドラッグ開始
     * @private
     */
    handleMouseDown(e) {
        // 右クリックは無視
        if (e.button !== 0) return;
        
        this.mouseStartX = e.clientX;
        this.isMouseDown = true;
        this.container.style.cursor = 'grabbing';
    }

    /**
     * マウスムーブ - ドラッグ中
     * @private
     */
    handleMouseMove(e) {
        if (!this.isMouseDown) return;
        // マウス移動中の処理（将来的なビジュアルフィードバック用）
    }

    /**
     * マウスアップ - ドラッグ終了
     * @private
     */
    handleMouseUp(e) {
        if (!this.isMouseDown) return;
        
        const mouseEndX = e.clientX;
        const swipeThreshold = 50;
        const difference = this.mouseStartX - mouseEndX;

        if (Math.abs(difference) > swipeThreshold) {
            // ドラッグ判定
            this.carousel.stopAutoRotation();
            
            if (difference > 0) {
                // 右にドラッグ → 次へ
                this.carousel.nextSlide();
            } else {
                // 左にドラッグ → 前へ
                this.carousel.previousSlide();
            }
            
            // 3秒後に自動回転再開
            setTimeout(() => {
                this.carousel.startAutoRotation();
            }, 3000);
        } else {
            // クリック判定（ドラッグが小さい場合）
            const clickTarget = e.target.closest('.game-carousel__item');
            if (clickTarget) {
                this.handleItemClick({ target: clickTarget });
            }
        }

        this.isMouseDown = false;
        this.container.style.cursor = 'grab';
    }

    /**
     * キーボード入力を処理
     * @private
     */
    handleKeyDown(e) {
        if (!this.keyboardEnabled) return;

        switch (e.key) {
            case 'ArrowLeft':
                this.carousel.stopAutoRotation();
                this.carousel.previousSlide();
                setTimeout(() => this.carousel.startAutoRotation(), 3000);
                e.preventDefault();
                break;
            case 'ArrowRight':
                this.carousel.stopAutoRotation();
                this.carousel.nextSlide();
                setTimeout(() => this.carousel.startAutoRotation(), 3000);
                e.preventDefault();
                break;
        }
    }
}
