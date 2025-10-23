/* ===================================
   フッターアニメーションマネージャー
   =================================== */
class FooterAnimationManager {
    constructor() {
        this.footer = document.querySelector('.footer');
        this.footerLinks = null;
        this.observer = null;
        this.hasAnimated = false;
    }

    init() {
        if (!this.footer) return;
        
        this.footerLinks = this.footer.querySelectorAll('.footer__link');
        this.setupObserver();
    }

    setupObserver() {
        const observerOptions = {
            threshold: 0.3, // フッターの30%が見えたらトリガー
            rootMargin: '0px 0px -50px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.hasAnimated) {
                    this.animateFooter();
                    this.hasAnimated = true;
                }
            });
        }, observerOptions);

        this.observer.observe(this.footer);
    }

    animateFooter() {
        // フッターリンクを順番にアニメーション
        this.footerLinks.forEach((link, index) => {
            setTimeout(() => {
                link.classList.add('animate-in');
            }, index * 80); // 0.08秒ずつ遅延
        });
    }

    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}
