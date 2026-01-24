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
        this.setupScrollAnimations();
    }

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
        // クリーンアップ処理
    }
}