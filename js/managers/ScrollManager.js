/* ===================================
   スクロール管理クラス
   =================================== */
class ScrollManager {
    constructor() {
        this.observer = null;
    }

    init() {
        this.setupIntersectionObserver();
        this.observeElements();
    }

    setupIntersectionObserver() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, options);
    }

    observeElements() {
        const elements = document.querySelectorAll('.fade-in, .work-card, .skill');
        elements.forEach(el => {
            el.classList.add('fade-in');
            this.observer?.observe(el);
        });
    }
}