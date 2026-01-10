/* ===================================
   アニメーション管理クラス（軽量版）
   =================================== */
class AnimationManager {
    constructor() {
        this.particles = [];
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
    }

    init() {
        // this.createParticleSystem(); // 白い球（パーティクル）を削除
        this.setupScrollAnimations();
    }

    /* ===================================
       パーティクルシステム（削除済み）
       =================================== */
    // 白い球（パーティクル）の描画機能を削除しました

    /* ===================================
       スクロールアニメーション
       =================================== */
    setupScrollAnimations() {
        // パララックス効果
        const parallaxElements = document.querySelectorAll('.hero__background');
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            parallaxElements.forEach(element => {
                element.style.transform = `translateY(${rate}px)`;
            });
        });
    }

    /* ===================================
       クリーンアップ
       =================================== */
    destroy() {
        // パーティクル関連のクリーンアップは削除済み
    }
}