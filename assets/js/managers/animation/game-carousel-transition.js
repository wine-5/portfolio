/**
 * ゲームカルーセルトランジションクラス
 * 責任: アニメーション・トランジション効果の管理
 * SOLID: 単一責任の原則に従う
 */
class GameCarouselTransition {
    constructor(config) {
        this.config = config;
    }

    /**
     * トランジション実行
     * @param {number} fromIndex - 開始インデックス
     * @param {number} toIndex - 終了インデックス
     * @param {number} totalItems - 総アイテム数
     * @returns {Promise} トランジション完了のPromise
     */
    async execute(fromIndex, toIndex, totalItems) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, this.config.animationDuration);
        });
    }

    /**
     * スパークルエフェクトを実行
     * @param {HTMLElement} element - 対象要素
     */
    async executeSparkle(element) {
        if (!element) return;

        const sparkles = this.createSparkles(10);
        sparkles.forEach(sparkle => element.appendChild(sparkle));

        // アニメーション実行
        return new Promise((resolve) => {
            setTimeout(() => {
                sparkles.forEach(sparkle => sparkle.remove());
                resolve();
            }, 800);
        });
    }

    /**
     * スパークル要素を生成
     * @private
     */
    createSparkles(count) {
        const sparkles = [];

        for (let i = 0; i < count; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'carousel-sparkle';
            sparkle.style.cssText = `
                position: absolute;
                width: 8px;
                height: 8px;
                background: radial-gradient(circle, #ffd700, #ffed4e);
                border-radius: 50%;
                pointer-events: none;
                animation: sparkleAnimation 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                box-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
            `;

            sparkles.push(sparkle);
        }

        return sparkles;
    }

    /**
     * スケール トランジション
     * @param {HTMLElement} element - 対象要素
     * @param {number} fromScale - 開始スケール
     * @param {number} toScale - 終了スケール
     */
    async executeScale(element, fromScale, toScale) {
        if (!element) return;

        element.style.transition = `transform ${this.config.animationDuration}ms ease-out`;
        element.style.transform = `scale(${toScale})`;

        return new Promise((resolve) => {
            setTimeout(() => {
                element.style.transition = '';
                resolve();
            }, this.config.animationDuration);
        });
    }

    /**
     * フェード トランジション
     * @param {HTMLElement} element - 対象要素
     * @param {number} fromOpacity - 開始透明度
     * @param {number} toOpacity - 終了透明度
     */
    async executeFade(element, fromOpacity, toOpacity) {
        if (!element) return;

        element.style.transition = `opacity ${this.config.animationDuration}ms ease-out`;
        element.style.opacity = toOpacity;

        return new Promise((resolve) => {
            setTimeout(() => {
                element.style.transition = '';
                resolve();
            }, this.config.animationDuration);
        });
    }
}
