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
        this.createParticleSystem();
        this.setupScrollAnimations();
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
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.canvas) {
            this.canvas.remove();
        }
        
        this.particles = [];
    }
}