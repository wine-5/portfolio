/**
 * ゲームカルーセル管理クラス
 * 責任: 円形配置のカルーセル状態管理と総合制御
 */
class GameCarousel {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        if (!this.container) {
            throw new Error(`GameCarousel: Container "${containerSelector}" not found`);
        }

        this.currentRotation = 0;
        this.games = [];
        this.isAnimating = false;

        this.renderer = null;
        this.interaction = null;
        this.transition = null;

        this.config = {
            animationDuration: 600,
            autoPlayInterval: 0,
            perspective: 2000,
            radius: 250,
            itemSize: 140
        };
    }

    /**
     * 初期化
     * @param {Array} games - ゲームデータ配列
     * @param {Object} dependencies - 依存オブジェクト
     */
    init(games, dependencies = {}) {
        this.games = games;

        this.renderer = dependencies.renderer || new GameCarouselRenderer(this.container, this.config);
        this.interaction = dependencies.interaction || new GameCarouselInteraction(this);
        this.transition = dependencies.transition || new GameCarouselTransition(this.config);

        this.render();

        this.interaction.setupListeners();

        if (this.config.autoPlayInterval > 0) {
            this.startAutoPlay();
        }
    }

    /**
     * 円形配置の角度を計算
     * @returns {Array} 各ゲームの回転角度
     */
    calculatePositions() {
        if (this.games.length === 0) return [];
        
        const angleStep = 360 / this.games.length;
        return this.games.map((game, index) => {
            return {
                angle: angleStep * index + this.currentRotation,
                index,
                game
            };
        });
    }

    /**
     * ゲーム配列を取得（読み取り専用）
     */
    getGames() {
        return [...this.games];
    }

    /**
     * 次のゲームへ回転
     */
    async nextSlide() {
        if (this.isAnimating) return;
        this.isAnimating = true;

        const angleStep = 360 / this.games.length;
        const newRotation = this.currentRotation - angleStep;

        await this.transition.executeRotation(this.currentRotation, newRotation);

        this.currentRotation = newRotation;
        this.render();

        this.isAnimating = false;
    }

    /**
     * 前のゲームへ回転
     */
    async previousSlide() {
        if (this.isAnimating) return;
        this.isAnimating = true;

        const angleStep = 360 / this.games.length;
        const newRotation = this.currentRotation + angleStep;

        await this.transition.executeRotation(this.currentRotation, newRotation);

        this.currentRotation = newRotation;
        this.render();

        this.isAnimating = false;
    }

    /**
     * 描画を実行
     */
    render() {
        const positions = this.calculatePositions();
        this.renderer.render(this.games, positions, this.currentRotation);
    }

    /**
     * 自動再生を開始
     */
    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, this.config.autoPlayInterval);
    }

    /**
     * 自動再生を停止
     */
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    /**
     * クリーンアップ
     */
    destroy() {
        this.stopAutoPlay();
        if (this.interaction) {
            this.interaction.removeListeners();
        }
    }
}
