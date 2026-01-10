/**
 * ゲームカルーセル管理クラス
 * 責任: カルーセルの状態管理と総合制御
 * SOLID: 単一責任の原則に従う
 */
class GameCarousel {
    constructor(containerSelector) {
        // DOM参照
        this.container = document.querySelector(containerSelector);
        if (!this.container) {
            throw new Error(`GameCarousel: Container "${containerSelector}" not found`);
        }

        // 状態管理
        this.currentIndex = 0;
        this.games = [];
        this.isAnimating = false;

        // 依存注入（インターフェース分離）
        this.renderer = null;
        this.interaction = null;
        this.transition = null;

        // 設定
        this.config = {
            animationDuration: 500,
            autoPlayInterval: 0, // 0 = 無効
            perspective: 1200,
            centerScale: 1.2,
            edgeScale: 0.7,
            rotationAngle: 15
        };
    }

    /**
     * 初期化
     * @param {Array} games - ゲームデータ配列
     * @param {Object} dependencies - 依存オブジェクト
     */
    init(games, dependencies = {}) {
        this.games = games;

        // 依存性の注入
        this.renderer = dependencies.renderer || new GameCarouselRenderer(this.container, this.config);
        this.interaction = dependencies.interaction || new GameCarouselInteraction(this);
        this.transition = dependencies.transition || new GameCarouselTransition(this.config);

        // 初期描画
        this.render();

        // イベントリスナー設定
        this.interaction.setupListeners();

        // 自動再生設定
        if (this.config.autoPlayInterval > 0) {
            this.startAutoPlay();
        }
    }

    /**
     * 現在のインデックスを取得（読み取り専用）
     */
    getCurrentIndex() {
        return this.currentIndex;
    }

    /**
     * ゲーム配列を取得（読み取り専用）
     */
    getGames() {
        return [...this.games];
    }

    /**
     * スライドを変更
     * @param {number} index - ターゲットインデックス
     */
    async goToSlide(index) {
        if (this.isAnimating || index === this.currentIndex) {
            return;
        }

        // インデックスのバリデーション
        if (index < 0 || index >= this.games.length) {
            return;
        }

        this.isAnimating = true;

        // トランジション実行
        await this.transition.execute(
            this.currentIndex,
            index,
            this.games.length
        );

        this.currentIndex = index;
        this.render();

        this.isAnimating = false;
    }

    /**
     * 次のスライドへ
     */
    async nextSlide() {
        const nextIndex = (this.currentIndex + 1) % this.games.length;
        await this.goToSlide(nextIndex);
    }

    /**
     * 前のスライドへ
     */
    async previousSlide() {
        const prevIndex = (this.currentIndex - 1 + this.games.length) % this.games.length;
        await this.goToSlide(prevIndex);
    }

    /**
     * 描画を実行
     */
    render() {
        this.renderer.render(this.games, this.currentIndex);
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
