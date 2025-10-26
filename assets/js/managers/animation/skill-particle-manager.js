class SkillParticleManager {
    constructor() {
        this.particles = [];
        this.canvas = null;
        this.ctx = null;
        this.activeSkill = null;
        this.animationFrame = null;
    }

    init() {
        // 各スキルカードにパーティクルシステムを追加
        document.querySelectorAll('.skill').forEach(skill => {
            skill.addEventListener('mouseenter', (e) => this.handleSkillHover(e, skill));
            skill.addEventListener('mouseleave', () => this.stopParticles());
        });
    }

    handleSkillHover(e, skillElement) {
        const skillName = skillElement.querySelector('.skill__name').textContent.toLowerCase();
        const rect = skillElement.getBoundingClientRect();
        
        this.createParticleCanvas(skillElement, rect);
        this.startParticles(skillName, rect);
    }

    createParticleCanvas(parent, rect) {
        if (this.canvas) {
            this.canvas.remove();
        }

        this.canvas = document.createElement('canvas');
        this.canvas.className = 'skill-particle-canvas';
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            pointer-events: none;
            z-index: 100;
        `;
        parent.style.position = 'relative';
        parent.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
    }

    startParticles(skillType, rect) {
        this.activeSkill = skillType;
        this.particles = [];
        
        // スキル別パーティクル生成（5個に削減し、薄く表示）
        const particleConfig = this.getParticleConfig(skillType);
        
        for (let i = 0; i < 5; i++) {
            this.particles.push(this.createParticle(particleConfig, rect));
        }
        
        this.animate();
    }

    getParticleConfig(skillType) {
        const configs = {
            'unity': {
                shape: 'icon',
                icon: '⬛', // Unity立方体アイコン
                colors: ['#000000', '#FFFFFF'],
                size: { min: 16, max: 24 },
                speed: { min: 0.5, max: 1.5 }
            },
            'c#': {
                shape: 'icon',
                icon: 'C#', // C#テキスト
                colors: ['#68217A', '#9B4F96'],
                size: { min: 14, max: 20 },
                speed: { min: 0.4, max: 1.2 }
            },
            'c++': {
                shape: 'icon',
                icon: 'C++', // C++テキスト
                colors: ['#00599C', '#659AD2'],
                size: { min: 14, max: 20 },
                speed: { min: 0.4, max: 1.2 }
            },
            'git': {
                shape: 'icon',
                icon: '⎇', // Git分岐アイコン
                colors: ['#F05032', '#FF6B6B'],
                size: { min: 16, max: 22 },
                speed: { min: 0.5, max: 1.3 }
            },
            'html': {
                shape: 'icon',
                icon: '</>',
                colors: ['#E34F26', '#F06529'],
                size: { min: 14, max: 20 },
                speed: { min: 0.4, max: 1.2 }
            },
            'css': {
                shape: 'icon',
                icon: '#{ }',
                colors: ['#1572B6', '#33A9DC'],
                size: { min: 14, max: 20 },
                speed: { min: 0.4, max: 1.2 }
            },
            'js': {
                shape: 'icon',
                icon: 'JS',
                colors: ['#F7DF1E', '#F0DB4F'],
                size: { min: 14, max: 20 },
                speed: { min: 0.4, max: 1.2 }
            },
            'default': {
                shape: 'icon',
                icon: '●',
                colors: ['#6366f1', '#8b5cf6'],
                size: { min: 12, max: 18 },
                speed: { min: 0.5, max: 1.2 }
            }
        };

        // スキル名に対応する設定を検索
        for (const [key, config] of Object.entries(configs)) {
            if (skillType.includes(key)) {
                return config;
            }
        }
        
        return configs.default;
    }

    createParticle(config, rect) {
        return {
            x: Math.random() * rect.width,
            y: Math.random() * rect.height,
            vx: (Math.random() - 0.5) * config.speed.max,
            vy: (Math.random() - 0.5) * config.speed.max,
            size: config.size.min + Math.random() * (config.size.max - config.size.min),
            color: config.colors[Math.floor(Math.random() * config.colors.length)],
            alpha: Math.random() * 0.15 + 0.1, // 0.1〜0.25の薄さ
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.05,
            shape: config.shape,
            icon: config.icon
        };
    }

    animate() {
        if (!this.activeSkill || !this.ctx) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach((particle, index) => {
            // 位置更新
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.rotation += particle.rotationSpeed;
            particle.alpha -= 0.002; // よりゆっくり消える

            // 範囲外チェック
            if (particle.x < 0 || particle.x > this.canvas.width ||
                particle.y < 0 || particle.y > this.canvas.height ||
                particle.alpha <= 0) {
                // 新しいパーティクルで置き換え
                const config = this.getParticleConfig(this.activeSkill);
                this.particles[index] = this.createParticle(config, {
                    width: this.canvas.width,
                    height: this.canvas.height
                });
                return;
            }

            // 描画
            this.ctx.save();
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.translate(particle.x, particle.y);
            this.ctx.rotate(particle.rotation);

            this.drawParticle(particle);

            this.ctx.restore();
        });

        this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    drawParticle(particle) {
        this.ctx.fillStyle = particle.color;
        this.ctx.strokeStyle = particle.color;

        switch (particle.shape) {
            case 'icon':
                this.drawIcon(particle.icon, particle.size);
                break;
            case 'cube':
                this.drawCube(particle.size);
                break;
            case 'code':
                this.drawCode(particle.symbol, particle.size);
                break;
            case 'branch':
                this.drawBranch(particle.size);
                break;
            default:
                this.drawCircle(particle.size);
        }
    }

    drawIcon(icon, size) {
        this.ctx.font = `bold ${size}px Arial, sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // 文字の背景に薄いグローを追加
        this.ctx.shadowBlur = 5;
        this.ctx.shadowColor = this.ctx.fillStyle;
        
        this.ctx.fillText(icon, 0, 0);
        
        // シャドウをリセット
        this.ctx.shadowBlur = 0;
    }

    drawCube(size) {
        const half = size / 2;
        
        // 立方体の前面
        this.ctx.fillRect(-half, -half, size, size);
        
        // 3D効果のための側面
        this.ctx.globalAlpha *= 0.6;
        this.ctx.beginPath();
        this.ctx.moveTo(half, -half);
        this.ctx.lineTo(half + half * 0.5, -half - half * 0.5);
        this.ctx.lineTo(half + half * 0.5, half - half * 0.5);
        this.ctx.lineTo(half, half);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.globalAlpha *= 0.8;
        this.ctx.beginPath();
        this.ctx.moveTo(-half, -half);
        this.ctx.lineTo(half, -half);
        this.ctx.lineTo(half + half * 0.5, -half - half * 0.5);
        this.ctx.lineTo(-half + half * 0.5, -half - half * 0.5);
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawCode(symbol, size) {
        this.ctx.font = `bold ${size}px monospace`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(symbol, 0, 0);
    }

    drawBranch(size) {
        this.ctx.beginPath();
        this.ctx.moveTo(-size, 0);
        this.ctx.lineTo(size, 0);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(0, -size);
        this.ctx.lineTo(0, size);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawCircle(size) {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        this.ctx.fill();
    }

    stopParticles() {
        this.activeSkill = null;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        if (this.canvas) {
            this.canvas.remove();
            this.canvas = null;
            this.ctx = null;
        }
        this.particles = [];
    }
}
