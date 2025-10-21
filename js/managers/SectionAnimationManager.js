/* ===================================
   セクションアニメーションマネージャー
   =================================== */
class SectionAnimationManager {
    constructor() {
        this.observer = null;
        this.animatedSections = new Set();
    }

    init() {
        this.setupSectionAnimation();
    }

    setupSectionAnimation() {
        // IntersectionObserverを使用してセクションの出現を監視
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.animatedSections.has(entry.target)) {
                        // セクションが表示されたらアニメーションを開始
                        entry.target.classList.add('animate-in');
                        this.animatedSections.add(entry.target);
                        
                        // セクション内のタイトルアニメーションも実行
                        this.animateSectionTitle(entry.target);
                    }
                });
            },
            {
                threshold: 0.2, // セクションの20%が見えたらトリガー
                rootMargin: '0px 0px -100px 0px' // 少し早めにトリガー
            }
        );

        // 監視対象のセクションを追加
        this.addSectionsToObserver();
    }

    addSectionsToObserver() {
        const sections = document.querySelectorAll('section:not(.hero)');
        
        sections.forEach(section => {
            // セクションにアニメーションクラスを追加
            section.classList.add('section-animate');
            this.observer.observe(section);
        });
    }

    animateSectionTitle(section) {
        const title = section.querySelector('.section__title');
        if (title) {
            // タイトルを文字ごとに分割してアニメーション
            this.animateTextByChars(title);
        }
    }

    animateTextByChars(element) {
        const text = element.textContent;
        element.innerHTML = '';
        
        // 各文字をspanで囲む
        Array.from(text).forEach((char, index) => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char; // スペースを保持
            span.style.display = 'inline-block';
            span.style.opacity = '0';
            span.style.transform = 'translateY(30px)';
            span.style.transition = `all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${index * 0.05}s`;
            element.appendChild(span);
            
            // アニメーション実行
            setTimeout(() => {
                span.style.opacity = '1';
                span.style.transform = 'translateY(0)';
            }, 200 + (index * 50));
        });
    }

    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}