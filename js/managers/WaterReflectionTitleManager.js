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
        
        // 水面のアニメーション強化
        this.enhanceWaterAnimation();
    }

    startTitleAnimation() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        console.log('Starting enhanced CSS title animation!');
        
        // 1. 全体的な稲妻エフェクト
        this.createLightningBurst();
        
        // 2. 背景パルス効果
        this.createBackgroundPulse();
        
        // 3. 文字を順番にアニメーション（より派手に）
        this.letters.forEach((letter, index) => {
            setTimeout(() => {
                // 前震動エフェクト
                this.createPreShakeEffect(letter);
                
                setTimeout(() => {
                    // メイン文字の爆発的登場
                    letter.classList.add('animate-in');
                    this.createExplosionEffect(letter);
                    this.createLetterParticles(letter);
                    this.createShockwave(letter);
                    
                    // 反射のアニメーション（劇的に）
                    setTimeout(() => {
                        if (this.reflectionLetters[index]) {
                            this.reflectionLetters[index].classList.add('animate-in');
                            this.createReflectionRipple(this.reflectionLetters[index]);
                        }
                    }, 150);
                    
                    // 最後の文字の場合、完了イベントを発火
                    if (index === this.letters.length - 1) {
                        setTimeout(() => {
                            this.createFinalBurst();
                            this.onAnimationComplete();
                        }, 600);
                    }
                }, 100);
            }, index * this.animationDelay);
        });
    }

    createLightningBurst() {
        const heroSection = document.querySelector('.hero');
        
        // 稲妻エフェクト
        for (let i = 0; i < 5; i++) {
            const lightning = document.createElement('div');
            lightning.style.cssText = `
                position: absolute;
                width: 2px;
                height: 100vh;
                background: linear-gradient(to bottom, transparent, #fff, #6366f1, transparent);
                left: ${Math.random() * 100}%;
                top: 0;
                opacity: 0;
                z-index: 100;
                transform: skewX(${-10 + Math.random() * 20}deg);
            `;
            
            heroSection.appendChild(lightning);
            
            setTimeout(() => {
                lightning.animate([
                    { opacity: 0, transform: `skewX(${-10 + Math.random() * 20}deg) translateY(-100px)` },
                    { opacity: 1, transform: `skewX(${-5 + Math.random() * 10}deg) translateY(0)` },
                    { opacity: 0, transform: `skewX(${-10 + Math.random() * 20}deg) translateY(100px)` }
                ], {
                    duration: 200 + Math.random() * 300,
                    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                }).onfinish = () => lightning.remove();
            }, i * 100);
        }
    }

    createBackgroundPulse() {
        const hero = document.querySelector('.hero');
        const originalFilter = hero.style.filter || '';
        
        hero.animate([
            { filter: originalFilter },
            { filter: `${originalFilter} brightness(1.5) contrast(1.2) saturate(1.3)` },
            { filter: originalFilter }
        ], {
            duration: 1000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
    }

    createPreShakeEffect(letter) {
        letter.style.filter = 'blur(2px)';
        letter.animate([
            { transform: 'translateX(0) scale(1)', filter: 'blur(2px)' },
            { transform: 'translateX(-2px) scale(1.02)', filter: 'blur(1px)' },
            { transform: 'translateX(2px) scale(0.98)', filter: 'blur(1px)' },
            { transform: 'translateX(-1px) scale(1.01)', filter: 'blur(0.5px)' },
            { transform: 'translateX(0) scale(1)', filter: 'blur(0px)' }
        ], {
            duration: 300,
            easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
        });
    }

    createExplosionEffect(letter) {
        const rect = letter.getBoundingClientRect();
        const heroContent = document.querySelector('.hero__content');
        
        // 爆発リング
        const ring = document.createElement('div');
        ring.style.cssText = `
            position: absolute;
            width: 20px;
            height: 20px;
            border: 3px solid #6366f1;
            border-radius: 50%;
            left: ${rect.left - heroContent.getBoundingClientRect().left + rect.width / 2}px;
            top: ${rect.top - heroContent.getBoundingClientRect().top + rect.height / 2}px;
            transform: translate(-50%, -50%);
            opacity: 1;
            z-index: 1000;
            pointer-events: none;
        `;
        
        heroContent.appendChild(ring);
        
        ring.animate([
            { transform: 'translate(-50%, -50%) scale(0)', opacity: 1 },
            { transform: 'translate(-50%, -50%) scale(3)', opacity: 0 }
        ], {
            duration: 600,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }).onfinish = () => ring.remove();
    }

    createShockwave(letter) {
        const rect = letter.getBoundingClientRect();
        const heroContent = document.querySelector('.hero__content');
        
        for (let i = 0; i < 3; i++) {
            const wave = document.createElement('div');
            wave.style.cssText = `
                position: absolute;
                width: 10px;
                height: 10px;
                border: 2px solid rgba(99, 102, 241, ${0.8 - i * 0.2});
                border-radius: 50%;
                left: ${rect.left - heroContent.getBoundingClientRect().left + rect.width / 2}px;
                top: ${rect.top - heroContent.getBoundingClientRect().top + rect.height / 2}px;
                transform: translate(-50%, -50%);
                z-index: 999;
                pointer-events: none;
            `;
            
            heroContent.appendChild(wave);
            
            setTimeout(() => {
                wave.animate([
                    { transform: 'translate(-50%, -50%) scale(0)', opacity: 0.8 },
                    { transform: 'translate(-50%, -50%) scale(5)', opacity: 0 }
                ], {
                    duration: 800 + i * 200,
                    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                }).onfinish = () => wave.remove();
            }, i * 100);
        }
    }

    createReflectionRipple(reflectionLetter) {
        const rect = reflectionLetter.getBoundingClientRect();
        const heroContent = document.querySelector('.hero__content');
        
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            width: 100px;
            height: 20px;
            background: radial-gradient(ellipse, rgba(6, 182, 212, 0.6), transparent);
            border-radius: 50%;
            left: ${rect.left - heroContent.getBoundingClientRect().left + rect.width / 2}px;
            top: ${rect.top - heroContent.getBoundingClientRect().top + rect.height / 2}px;
            transform: translate(-50%, -50%);
            z-index: 998;
            pointer-events: none;
        `;
        
        heroContent.appendChild(ripple);
        
        ripple.animate([
            { transform: 'translate(-50%, -50%) scaleX(0) scaleY(1)', opacity: 0.8 },
            { transform: 'translate(-50%, -50%) scaleX(2) scaleY(0.5)', opacity: 0 }
        ], {
            duration: 800,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }).onfinish = () => ripple.remove();
    }

    createLetterParticles(letter) {
        const rect = letter.getBoundingClientRect();
        const heroContent = document.querySelector('.hero__content');
        
        // 各文字に対してより多くのパーティクルを生成（より派手に）
        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('div');
            const size = 3 + Math.random() * 4;
            const hue = 220 + Math.random() * 60; // 青〜紫の範囲
            
            particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: hsl(${hue}, 80%, 60%);
                border-radius: 50%;
                pointer-events: none;
                z-index: 1001;
                left: ${rect.left - heroContent.getBoundingClientRect().left + rect.width / 2}px;
                top: ${rect.top - heroContent.getBoundingClientRect().top + rect.height / 2}px;
                box-shadow: 0 0 10px hsl(${hue}, 80%, 60%);
            `;
            
            heroContent.appendChild(particle);
            
            const angle = (i / 15) * Math.PI * 2;
            const velocity = 40 + Math.random() * 60;
            const life = 1000 + Math.random() * 800;
            
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            particle.animate([
                {
                    transform: 'translate(0, 0) scale(1) rotate(0deg)',
                    opacity: 1
                },
                {
                    transform: `translate(${vx}px, ${vy}px) scale(0) rotate(720deg)`,
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

    createFinalBurst() {
        const heroContent = document.querySelector('.hero__content');
        const titleContainer = document.querySelector('.hero__title-container');
        const rect = titleContainer.getBoundingClientRect();
        
        // 最終的な大爆発エフェクト
        for (let i = 0; i < 30; i++) {
            const star = document.createElement('div');
            const size = 2 + Math.random() * 6;
            
            star.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: #fff;
                clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
                left: ${rect.left - heroContent.getBoundingClientRect().left + rect.width / 2}px;
                top: ${rect.top - heroContent.getBoundingClientRect().top + rect.height / 2}px;
                z-index: 1002;
                pointer-events: none;
            `;
            
            heroContent.appendChild(star);
            
            const angle = (i / 30) * Math.PI * 2;
            const velocity = 80 + Math.random() * 100;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            star.animate([
                {
                    transform: 'translate(-50%, -50%) scale(1) rotate(0deg)',
                    opacity: 1
                },
                {
                    transform: `translate(${vx - 50}%, ${vy - 50}%) scale(0) rotate(1080deg)`,
                    opacity: 0
                }
            ], {
                duration: 1500 + Math.random() * 1000,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }).onfinish = () => star.remove();
        }
    }

    enhanceWaterAnimation() {
        const waterPath = document.querySelector('.water-path');
        const waterReflection = document.querySelector('.water-reflection');
        
        if (!waterPath) return;

        // 水面の波の動きをより動的かつ劇的に
        let waveOffset = 0;
        let intensity = 1;
        
        const animateWaves = () => {
            waveOffset += 0.03;
            intensity = 1 + Math.sin(waveOffset * 0.5) * 0.5; // 波の強度を変動
            
            const wave1 = 200 + Math.sin(waveOffset) * 15 * intensity;
            const wave2 = 180 + Math.cos(waveOffset * 1.5) * 12 * intensity;
            const wave3 = 190 + Math.sin(waveOffset * 0.8) * 18 * intensity;
            const wave4 = 200 + Math.cos(waveOffset * 1.2) * 10 * intensity;
            const wave5 = 185 + Math.sin(waveOffset * 2) * 8 * intensity;
            
            // より複雑な波形パターン
            const pathData = `M0,${wave1} Q350,${wave2} 700,${wave3} T1400,${wave4} Q1050,${wave5} 700,${wave3 + 5} T0,${wave1 + 3} Z`;
            waterPath.setAttribute('d', pathData);
            
            // 反射部分も動的に変化
            if (waterReflection) {
                const refWave1 = wave1 - 10;
                const refWave2 = wave2 - 8;
                const refWave3 = wave3 - 12;
                const refWave4 = wave4 - 6;
                
                const reflectionData = `M0,${refWave1} Q350,${refWave2} 700,${refWave3} T1400,${refWave4} L1400,${refWave4 + 20} Q1050,${refWave3 + 15} 700,${refWave3 + 10} T0,${refWave1 + 12} Z`;
                waterReflection.setAttribute('d', reflectionData);
            }
            
            requestAnimationFrame(animateWaves);
        };
        
        animateWaves();
        
        // 水面にランダムな波紋効果を追加
        this.createRandomRipples();
    }

    createRandomRipples() {
        const heroContent = document.querySelector('.hero__content');
        
        setInterval(() => {
            if (Math.random() < 0.3) { // 30%の確率で波紋発生
                const ripple = document.createElement('div');
                ripple.style.cssText = `
                    position: absolute;
                    width: 10px;
                    height: 10px;
                    border: 2px solid rgba(6, 182, 212, 0.4);
                    border-radius: 50%;
                    left: ${20 + Math.random() * 60}%;
                    bottom: 20%;
                    z-index: 100;
                    pointer-events: none;
                `;
                
                heroContent.appendChild(ripple);
                
                ripple.animate([
                    { transform: 'scale(0)', opacity: 0.8 },
                    { transform: 'scale(3)', opacity: 0 }
                ], {
                    duration: 2000 + Math.random() * 1000,
                    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                }).onfinish = () => ripple.remove();
            }
        }, 1000);
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