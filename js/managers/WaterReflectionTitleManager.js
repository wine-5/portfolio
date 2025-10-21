/* ===================================
   湖面反射タイトルアニメーションマネージャー
   =================================== */
class WaterReflectionTitleManager {
    constructor() {
        this.letters = [];
        this.reflectionLetters = [];
        this.animationDelay = 400; // 各文字間の遅延時間(ms)を増加
        this.startDelay = 1000; // 開始遅延時間(ms)
    }

    init() {
        this.letters = document.querySelectorAll('.letter');
        this.reflectionLetters = document.querySelectorAll('.letter-reflection');
        
        // ページロード後にアニメーション開始
        setTimeout(() => {
            this.startTitleAnimation();
        }, this.startDelay);
        
        // 水面のアニメーション強化
        this.enhanceWaterAnimation();
    }

    startTitleAnimation() {
        // 文字を順番にアニメーション
        this.letters.forEach((letter, index) => {
            setTimeout(() => {
                // メイン文字のアニメーション
                letter.classList.add('animate-in');
                
                // パーティクル効果
                this.createLetterParticles(letter);
                
                // 反射のアニメーション（少し遅れて）
                setTimeout(() => {
                    if (this.reflectionLetters[index]) {
                        this.reflectionLetters[index].classList.add('animate-in');
                    }
                }, 200);
                
                // 最後の文字の場合、完了イベントを発火
                if (index === this.letters.length - 1) {
                    setTimeout(() => {
                        this.onAnimationComplete();
                    }, 800);
                }
            }, index * this.animationDelay);
        });
    }

    createLetterParticles(letter) {
        const rect = letter.getBoundingClientRect();
        const heroContent = document.querySelector('.hero__content');
        
        // 各文字に対して小さなパーティクルを生成
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: linear-gradient(45deg, #6366f1, #8b5cf6);
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
                left: ${rect.left - heroContent.getBoundingClientRect().left + rect.width / 2}px;
                top: ${rect.top - heroContent.getBoundingClientRect().top + rect.height / 2}px;
            `;
            
            heroContent.appendChild(particle);
            
            const angle = (i / 8) * Math.PI * 2;
            const velocity = 30 + Math.random() * 40;
            const life = 800 + Math.random() * 400;
            
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            particle.animate([
                {
                    transform: 'translate(0, 0) scale(1)',
                    opacity: 1
                },
                {
                    transform: `translate(${vx}px, ${vy}px) scale(0)`,
                    opacity: 0
                }
            ], {
                duration: life,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }).onfinish = () => {
                particle.remove();
            };
        }
    }

    enhanceWaterAnimation() {
        const waterPath = document.querySelector('.water-path');
        if (!waterPath) return;

        // 水面の波の動きをより動的に
        let waveOffset = 0;
        const animateWaves = () => {
            waveOffset += 0.02;
            
            const wave1 = 130 + Math.sin(waveOffset) * 10;
            const wave2 = 150 + Math.cos(waveOffset * 1.5) * 8;
            const wave3 = 145 + Math.sin(waveOffset * 0.8) * 12;
            const wave4 = 155 + Math.cos(waveOffset * 1.2) * 6;
            
            const pathData = `M0,${wave1} Q300,${wave2} 600,${wave3} T1200,${wave4} L1200,300 L0,300 Z`;
            waterPath.setAttribute('d', pathData);
            
            requestAnimationFrame(animateWaves);
        };
        
        animateWaves();
    }

    onAnimationComplete() {
        // アニメーション完了後の処理
        console.log('Title animation completed!');
        
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