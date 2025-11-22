/* ===================================
   湖面反射タイトルアニメーションマネージャー
   =================================== */
class WaterReflectionTitleManager {
    constructor() {
        this.letters = [];
        this.reflectionLetters = [];
        this.animationDelay = 300; // 各文字間の遅延時間(ms)
        this.startDelay = 800; // 開始遅延時間(ms)
        this.particleSystem = [];
        this.lightningEffects = [];
        this.isAnimating = false;
    }

    init() {
        this.letters = document.querySelectorAll('.letter');
        this.reflectionLetters = document.querySelectorAll('.letter-reflection');
        
        // ページロード後にアニメーション開始
        setTimeout(() => {
            this.startTitleAnimation();
        }, this.startDelay);
    }

    startTitleAnimation() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        // 文字を順番にアニメーション（シンプルに）
        this.letters.forEach((letter, index) => {
            setTimeout(() => {
                // メイン文字の登場
                letter.classList.add('animate-in');
                
                // 反射のアニメーション
                setTimeout(() => {
                    if (this.reflectionLetters[index]) {
                        this.reflectionLetters[index].classList.add('animate-in');
                    }
                }, 150);
                
                // 最後の文字の場合、完了イベントを発火
                if (index === this.letters.length - 1) {
                    setTimeout(() => {
                        this.onAnimationComplete();
                    }, 600);
                }
            }, index * this.animationDelay);
        });
    }

    onAnimationComplete() {
        // アニメーション完了後の処理
        
        // サブタイトルとボタンを表示
        this.showSubElements();
        
        // インタラクティブ効果を有効化
        this.enableInteractiveEffects();
    }

    showSubElements() {
        const subtitle = document.querySelector('.hero__subtitle');
        const buttons = document.querySelector('.hero__buttons');
        
        if (subtitle) {
            subtitle.style.opacity = '0';
            subtitle.style.transform = 'translateY(30px)';
            subtitle.style.transition = 'all 0.8s ease';
            
            setTimeout(() => {
                subtitle.style.opacity = '1';
                subtitle.style.transform = 'translateY(0)';
            }, 200);
        }
        
        if (buttons) {
            buttons.style.opacity = '0';
            buttons.style.transform = 'translateY(30px)';
            buttons.style.transition = 'all 0.8s ease';
            
            setTimeout(() => {
                buttons.style.opacity = '1';
                buttons.style.transform = 'translateY(0)';
            }, 400);
        }
    }

    enableInteractiveEffects() {
        // 文字にホバー効果を追加
        this.letters.forEach((letter, index) => {
            letter.addEventListener('mouseenter', () => {
                letter.style.transform = 'translateX(0) rotateY(0deg) scale(1.1) translateZ(20px)';
                letter.style.textShadow = `
                    0 8px 20px rgba(99, 102, 241, 0.6),
                    0 15px 40px rgba(139, 92, 246, 0.4)
                `;
                
                // 反射も一緒に動かす
                if (this.reflectionLetters[index]) {
                    this.reflectionLetters[index].style.transform = 'translateX(0) rotateY(0deg) scale(1.1)';
                }
            });
            
            letter.addEventListener('mouseleave', () => {
                letter.style.transform = 'translateX(0) rotateY(0deg) scale(1) translateZ(0px)';
                letter.style.textShadow = `
                    0 5px 15px rgba(99, 102, 241, 0.4),
                    0 10px 30px rgba(139, 92, 246, 0.3)
                `;
                
                if (this.reflectionLetters[index]) {
                    this.reflectionLetters[index].style.transform = 'translateX(0) rotateY(0deg) scale(1)';
                }
            });
        });
    }

    // タイトルをリセットして再アニメーション
    resetAndReplay() {
        this.letters.forEach(letter => {
            letter.classList.remove('animate-in');
        });
        
        this.reflectionLetters.forEach(letter => {
            letter.classList.remove('animate-in');
        });
        
        setTimeout(() => {
            this.startTitleAnimation();
        }, 100);
    }
}