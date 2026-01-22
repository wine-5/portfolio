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
        this.autoRotationTimeout = null;

        this.renderer = null;
        this.interaction = null;
        this.transition = null;

        this.config = {
            animationDuration: 600,
            autoPlayInterval: 0,
            perspective: 2000,
            radiusX: 450,
            radiusZ: 200,
            itemSize: 140,
            autoRotationDelay: 5000
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

        // 初期状態でアイコンを均等に配置してからレンダリング
        this.currentRotation = 45;
        this.render();

        this.interaction.setupListeners();
        
        // 自動回転を開始
        this.startAutoRotation();

        if (this.config.autoPlayInterval > 0) {
            this.startAutoPlay();
        }
    }

    /**
     * 自動回転を開始
     */
    startAutoRotation() {
        if (this.autoRotationInterval) {
            clearInterval(this.autoRotationInterval);
        }

        // 30秒で180度回転 = 0.1度/100ms
        const rotationSpeed = 1.2; // 度/100ms = 12度/秒（速度2倍）
        
        this.autoRotationInterval = setInterval(() => {
            if (!this.isAnimating) {
                this.currentRotation += rotationSpeed;
                // 180度を超えたら-180から開始
                if (this.currentRotation > 180) {
                    this.currentRotation -= 360;
                }
                this.render();
            }
        }, 100);
    }

    /**
     * 自動回転を停止
     */
    stopAutoRotation() {
        if (this.autoRotationInterval) {
            clearInterval(this.autoRotationInterval);
            this.autoRotationInterval = null;
        }
    }

    /**
     * 円形配置の角度を計算（180度範囲内）
     * @returns {Array} 各ゲームの回転角度
     */
    calculatePositions() {
        if (this.games.length === 0) return [];
        
        // 180度範囲内に配置（-90度から90度）
        const angleStep = 180 / Math.max(1, this.games.length - 1);
        return this.games.map((game, index) => {
            const baseAngle = -90 + (angleStep * index);
            return {
                angle: baseAngle + this.currentRotation,
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

        // 180度範囲内での回転ステップ
        const angleStep = 180 / Math.max(1, this.games.length - 1);
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

        // 180度範囲内での回転ステップ
        const angleStep = 180 / Math.max(1, this.games.length - 1);
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
