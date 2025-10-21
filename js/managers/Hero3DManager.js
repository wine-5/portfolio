/* ===================================
   3Dヒーロータイトルアニメーションマネージャー
   =================================== */
class Hero3DManager {
    constructor() {
        this.heroTitle = null;
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.isAnimating = false;
    }

    init() {
        this.heroTitle = document.getElementById('hero-title');
        if (!this.heroTitle) return;

        this.setupMouseTracking();
        this.setupClickAnimation();
        this.startIdleAnimation();
    }

    setupMouseTracking() {
        const hero = document.querySelector('.hero');
        if (!hero) return;

        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            this.mouseX = (e.clientX - rect.left - rect.width / 2) / rect.width;
            this.mouseY = (e.clientY - rect.top - rect.height / 2) / rect.height;
            
            this.targetX = this.mouseX * 20; // 回転の強度を調整
            this.targetY = -this.mouseY * 15;
            
            if (!this.isAnimating) {
                this.smoothUpdate();
            }
        });

        hero.addEventListener('mouseleave', () => {
            this.targetX = 0;
            this.targetY = 0;
            this.smoothUpdate();
        });
    }

    smoothUpdate() {
        const lerp = (start, end, factor) => start + (end - start) * factor;
        
        const update = () => {
            this.currentX = lerp(this.currentX, this.targetX, 0.1);
            this.currentY = lerp(this.currentY, this.targetY, 0.1);
            
            if (!this.isAnimating) {
                this.heroTitle.style.transform = `
                    rotateX(${this.currentY}deg) 
                    rotateY(${this.currentX}deg) 
                    translateZ(10px)
                `;
            }
            
            if (Math.abs(this.currentX - this.targetX) > 0.1 || 
                Math.abs(this.currentY - this.targetY) > 0.1) {
                requestAnimationFrame(update);
            }
        };
        
        requestAnimationFrame(update);
    }

    setupClickAnimation() {
        this.heroTitle.addEventListener('click', () => {
            this.performClickAnimation();
        });
    }

    performClickAnimation() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        
        // 強烈な3D回転アニメーション
        this.heroTitle.style.transition = 'transform 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        this.heroTitle.style.transform = `
            rotateX(360deg) 
            rotateY(720deg) 
            translateZ(100px) 
            scale(1.2)
        `;
        
        // パーティクル爆発効果
        this.createParticleExplosion();
        
        setTimeout(() => {
            this.heroTitle.style.transform = `
                rotateX(0deg) 
                rotateY(0deg) 
                translateZ(0px) 
                scale(1)
            `;
            
            setTimeout(() => {
                this.heroTitle.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                this.isAnimating = false;
            }, 800);
        }, 800);
    }

    createParticleExplosion() {
        const heroContent = document.querySelector('.hero__content');
        const titleRect = this.heroTitle.getBoundingClientRect();
        const heroRect = heroContent.getBoundingClientRect();
        
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: 6px;
                height: 6px;
                background: linear-gradient(45deg, #6366f1, #8b5cf6);
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
                left: ${titleRect.left - heroRect.left + titleRect.width / 2}px;
                top: ${titleRect.top - heroRect.top + titleRect.height / 2}px;
            `;
            
            heroContent.appendChild(particle);
            
            const angle = (i / 20) * Math.PI * 2;
            const velocity = 100 + Math.random() * 100;
            const life = 1000 + Math.random() * 500;
            
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

    startIdleAnimation() {
        // アイドル状態での微細な動き
        setInterval(() => {
            if (!this.isAnimating && this.targetX === 0 && this.targetY === 0) {
                const time = Date.now() * 0.001;
                const x = Math.sin(time * 0.5) * 2;
                const y = Math.cos(time * 0.3) * 1;
                
                this.heroTitle.style.transform = `
                    rotateX(${y}deg) 
                    rotateY(${x}deg) 
                    translateZ(5px)
                `;
            }
        }, 50);
    }
}