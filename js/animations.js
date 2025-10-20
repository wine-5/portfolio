/* ===================================
   アニメーション管理クラス
   =================================== */
class AnimationManager {
    constructor() {
        this.particles = [];
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
    }

    init() {
        this.createParticleSystem();
        this.setupScrollAnimations();
        this.setupHoverEffects();
        this.setupTypewriter();
    }

    /* ===================================
       パーティクルシステム
       =================================== */
    createParticleSystem() {
        const particlesContainer = document.getElementById('particles');
        if (!particlesContainer) return;

        // キャンバス作成
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        particlesContainer.appendChild(this.canvas);

        // キャンバスサイズ設定
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // パーティクル初期化
        this.initParticles();
        this.animateParticles();
    }

    resizeCanvas() {
        if (!this.canvas) return;
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
    }

    initParticles() {
        this.particles = [];
        const particleCount = Math.min(50, window.innerWidth / 20);

        for (let i = 0; i < particleCount; i++) {
            this.particles.push(this.createParticle());
        }
    }

    createParticle() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            radius: Math.random() * 2 + 1,
            opacity: Math.random() * 0.5 + 0.2,
            color: this.getRandomColor()
        };
    }

    getRandomColor() {
        const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    animateParticles() {
        if (!this.ctx || !this.canvas) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(particle => {
            // パーティクル更新
            particle.x += particle.vx;
            particle.y += particle.vy;

            // 境界チェック
            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;

            // パーティクル描画
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color + Math.floor(particle.opacity * 255).toString(16).padStart(2, '0');
            this.ctx.fill();

            // グロー効果
            this.ctx.shadowColor = particle.color;
            this.ctx.shadowBlur = particle.radius * 2;
        });

        // 接続線を描画
        this.drawConnections();

        this.animationId = requestAnimationFrame(() => this.animateParticles());
    }

    drawConnections() {
        const maxDistance = 100;
        
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxDistance) {
                    const opacity = (1 - distance / maxDistance) * 0.1;
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                }
            }
        }
    }

    /* ===================================
       スクロールアニメーション
       =================================== */
    setupScrollAnimations() {
        // パララックス効果
        this.setupParallax();
        
        // カウンターアニメーション
        this.setupCounterAnimation();
    }

    setupParallax() {
        const parallaxElements = document.querySelectorAll('.hero__background');
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            parallaxElements.forEach(element => {
                element.style.transform = `translateY(${rate}px)`;
            });
        });
    }

    setupCounterAnimation() {
        const counters = document.querySelectorAll('[data-count]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.7 });

        counters.forEach(counter => observer.observe(counter));
    }

    animateCounter(element) {
        const target = parseInt(element.getAttribute('data-count'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    }

    /* ===================================
       ホバーエフェクト
       =================================== */
    setupHoverEffects() {
        this.setupCardTiltEffect();
        this.setupButtonRippleEffect();
        this.setupImageParallax();
    }

    setupCardTiltEffect() {
        const cards = document.querySelectorAll('.work-card, .skill');

        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transformStyle = 'preserve-3d';
            });

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;
                
                card.style.transform = `
                    perspective(1000px) 
                    rotateX(${rotateX}deg) 
                    rotateY(${rotateY}deg) 
                    translateZ(10px)
                `;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    setupButtonRippleEffect() {
        const buttons = document.querySelectorAll('.btn');

        buttons.forEach(button => {
            button.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = button.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                ripple.style.cssText = `
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.6);
                    transform: scale(0);
                    animation: ripple 0.6s linear;
                    left: ${x}px;
                    top: ${y}px;
                    width: ${size}px;
                    height: ${size}px;
                `;

                button.style.position = 'relative';
                button.style.overflow = 'hidden';
                button.appendChild(ripple);

                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });

        // リップルアニメーションのCSS
        if (!document.querySelector('#ripple-style')) {
            const style = document.createElement('style');
            style.id = 'ripple-style';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    setupImageParallax() {
        const images = document.querySelectorAll('.work-card__image img');

        images.forEach(img => {
            const card = img.closest('.work-card');
            
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const moveX = (x - rect.width / 2) / 20;
                const moveY = (y - rect.height / 2) / 20;
                
                img.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.1)`;
            });

            card.addEventListener('mouseleave', () => {
                img.style.transform = '';
            });
        });
    }

    /* ===================================
       タイプライター効果
       =================================== */
    setupTypewriter() {
        const typewriterElements = document.querySelectorAll('.typewriter');
        
        typewriterElements.forEach(element => {
            const text = element.textContent;
            element.textContent = '';
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.typeWriter(element, text, 50);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.7 });

            observer.observe(element);
        });
    }

    typeWriter(element, text, speed) {
        let i = 0;
        
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        
        type();
    }

    /* ===================================
       テーマ切り替えアニメーション
       =================================== */
    createThemeTransition() {
        const transition = document.createElement('div');
        transition.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, transparent 0%, var(--bg-primary) 100%);
            z-index: 9999;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(transition);
        
        requestAnimationFrame(() => {
            transition.style.opacity = '1';
            setTimeout(() => {
                transition.style.opacity = '0';
                setTimeout(() => {
                    transition.remove();
                }, 300);
            }, 150);
        });
    }

    /* ===================================
       クリーンアップ
       =================================== */
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.canvas) {
            this.canvas.remove();
        }
        
        this.particles = [];
    }
}

/* ===================================
   ページ遷移アニメーション
   =================================== */
class PageTransition {
    constructor() {
        this.isAnimating = false;
    }

    fadeOut(callback) {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        const overlay = this.createOverlay();
        
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            setTimeout(() => {
                if (callback) callback();
                this.isAnimating = false;
            }, 300);
        });
    }

    fadeIn() {
        const overlay = document.querySelector('.page-transition-overlay');
        if (!overlay) return;
        
        setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.remove();
            }, 300);
        }, 100);
    }

    createOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'page-transition-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--bg-primary);
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
        `;
        
        document.body.appendChild(overlay);
        return overlay;
    }
}

/* ===================================
   パフォーマンス最適化
   =================================== */
class PerformanceOptimizer {
    constructor() {
        this.isLowPerformance = false;
        this.init();
    }

    init() {
        this.detectPerformance();
        this.optimizeBasedOnPerformance();
    }

    detectPerformance() {
        // フレームレート測定
        let frames = 0;
        let lastTime = performance.now();
        
        const measureFPS = () => {
            frames++;
            const currentTime = performance.now();
            
            if (currentTime >= lastTime + 1000) {
                const fps = Math.round((frames * 1000) / (currentTime - lastTime));
                
                if (fps < 30) {
                    this.isLowPerformance = true;
                    this.optimizeForLowPerformance();
                }
                
                frames = 0;
                lastTime = currentTime;
            }
            
            if (frames < 60) {
                requestAnimationFrame(measureFPS);
            }
        };
        
        requestAnimationFrame(measureFPS);
    }

    optimizeBasedOnPerformance() {
        // デバイスの性能に基づく最適化
        if (window.innerWidth < 768) {
            this.optimizeForMobile();
        }
        
        if (!window.requestAnimationFrame) {
            this.isLowPerformance = true;
            this.optimizeForLowPerformance();
        }
    }

    optimizeForMobile() {
        // モバイル向け最適化
        document.body.classList.add('mobile-optimized');
        
        // パーティクル数を減らす
        const style = document.createElement('style');
        style.textContent = `
            .mobile-optimized .hero__particles {
                opacity: 0.5;
            }
            .mobile-optimized .work-card:hover {
                transform: none;
            }
        `;
        document.head.appendChild(style);
    }

    optimizeForLowPerformance() {
        // 低性能デバイス向け最適化
        document.body.classList.add('low-performance');
        
        const style = document.createElement('style');
        style.textContent = `
            .low-performance * {
                animation-duration: 0.1s !important;
                transition-duration: 0.1s !important;
            }
            .low-performance .hero__particles {
                display: none;
            }
            .low-performance .work-card:hover {
                transform: none;
            }
        `;
        document.head.appendChild(style);
    }
}

/* ===================================
   エクスポート（モジュール使用時）
   =================================== */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AnimationManager,
        PageTransition,
        PerformanceOptimizer
    };
}