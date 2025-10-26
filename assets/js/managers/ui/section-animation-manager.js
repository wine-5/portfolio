/* ===================================
   セクションアニメーションマネージャー
   =================================== */
class SectionAnimationManager {
    constructor() {
        // 定数定義
        this.INTERSECTION_THRESHOLD = 0.2; // セクションが表示されたと判定する割合（20%）
        this.INTERSECTION_ROOT_MARGIN = '0px 0px -100px 0px'; // 少し早めにトリガー
        
        this.observer = null;
        this.animatedSections = new Set();
    }

    init() {
        // タイトルを即座に表示
        this.ensureTitlesVisible();
        this.setupSectionAnimation();
    }

    ensureTitlesVisible() {
        // すべてのsection__titleを強制的に表示し、CSSスタイルを保持
        const titles = document.querySelectorAll('.section__title');
        titles.forEach(title => {
            title.style.opacity = '1';
            title.style.transform = 'translateY(0)';
            title.style.visibility = 'visible';
            title.style.display = 'block';
            
            // CSSのグラデーション背景を確実に適用するため、インラインスタイルをクリア
            title.style.color = '';
            title.style.background = '';
            title.style.backgroundClip = '';
            title.style.webkitBackgroundClip = '';
            title.style.webkitTextFillColor = '';
            
            // 確実にCSSクラスが適用されるようにクラスを再適用
            title.classList.add('section__title');
            
            console.log('Title made visible with CSS preserved:', title.textContent);
        });
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
                        
                        // 背景テキストのアニメーション
                        this.animateBgText(entry.target);
                    }
                });
            },
            {
                threshold: this.INTERSECTION_THRESHOLD,
                rootMargin: this.INTERSECTION_ROOT_MARGIN
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
            
            // セクションタイトルは常に表示（アニメーション無効化）
            const sectionTitle = section.querySelector('.section__title');
            if (sectionTitle) {
                sectionTitle.style.opacity = '1';
                sectionTitle.style.transform = 'translateY(0)';
                sectionTitle.style.visibility = 'visible';
                sectionTitle.style.display = 'block';
                sectionTitle.style.color = ''; // 元の色を保持
                // アニメーションを無効化
                sectionTitle.classList.add('no-animate');
            }
            
            this.observer.observe(section);
        });
    }

    animateSectionTitle(section) {
        const title = section.querySelector('.section__title');
        if (title) {
            // タイトルアニメーションは無効化、即座に表示
            title.style.opacity = '1';
            title.style.transform = 'translateY(0)';
            title.style.visibility = 'visible';
            title.style.display = 'block';
            // CSSのbackground-clipを確実に適用
            title.style.background = '';  // インラインスタイルをクリア
            title.style.backgroundClip = '';  // インラインスタイルをクリア
            title.style.webkitBackgroundClip = '';  // インラインスタイルをクリア
            title.style.webkitTextFillColor = '';  // インラインスタイルをクリア
        }
    }

    animateTextByChars(element) {
        // タイトルアニメーションは無効化（CSSスタイルを保持）
        // HTMLを変更せず、元のスタイルを維持
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
        element.style.visibility = 'visible';
        element.style.display = 'block';
        
        // 簡単なフェードインアニメーションのみ適用
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        // 即座にアニメーションを実行
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 100);
    }

    animateBgText(section) {
        const bgText = section.querySelector('.section__bg-text');
        if (bgText) {
            // 少し遅延させて背景テキストをアニメーション
            setTimeout(() => {
                bgText.classList.add('visible');
            }, 300); // セクションのフェードインより少し遅れて登場
        }
    }

    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}