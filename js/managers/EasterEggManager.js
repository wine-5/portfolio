class EasterEggManager {
    constructor() {
        this.wineCode = ['w', 'i', 'n', 'e', '-', '5'];
        this.userInput = [];
        this.gameDevCode = ['g', 'a', 'm', 'e', 'd', 'e', 'v'];
        this.unityCode = ['u', 'n', 'i', 't', 'y'];
        this.activated = {
            wine: false,
            gameDev: false,
            unity: false
        };
    }

    init() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        console.log('%c🎮 イースターエッグのヒント:', 'color: #6366f1; font-size: 16px; font-weight: bold;');
        console.log('%c1. "wine-5" とタイプしてみよう！', 'color: #8b5cf6;');
        console.log('%c2. "gamedev" とタイプしてみよう！', 'color: #8b5cf6;');
        console.log('%c3. "unity" とタイプしてみよう！', 'color: #8b5cf6;');
    }

    handleKeyPress(e) {
        this.userInput.push(e.key);
        
        // 最新の入力のみ保持
        if (this.userInput.length > 10) {
            this.userInput.shift();
        }

        this.checkWineCode();
        this.checkGameDevCode();
        this.checkUnityCode();
    }

    checkWineCode() {
        if (this.activated.wine) return;
        
        const recentInput = this.userInput.slice(-this.wineCode.length).join('');
        const code = this.wineCode.join('');

        if (recentInput === code) {
            this.activated.wine = true;
            this.activateWineEffect();
        }
    }

    checkGameDevCode() {
        if (this.activated.gameDev) return;
        
        const recentInput = this.userInput.slice(-this.gameDevCode.length).join('');
        const code = this.gameDevCode.join('');

        if (recentInput === code) {
            this.activated.gameDev = true;
            this.activateGameDevEffect();
        }
    }

    checkUnityCode() {
        if (this.activated.unity) return;
        
        const recentInput = this.userInput.slice(-this.unityCode.length).join('');
        const code = this.unityCode.join('');

        if (recentInput === code) {
            this.activated.unity = true;
            this.activateUnityEffect();
        }
    }

    activateWineEffect() {
        console.log('%c� wine-5コマンド発動！', 'color: #ffd700; font-size: 20px; font-weight: bold;');
        
        // 画面全体にマトリックス風エフェクト
        this.createMatrixRain();
        
        // 通知表示
        this.showNotification('� wine-5 コマンド発動！', 'Portfolio Master Unlocked!', '#ffd700');
        
        // 全カードを虹色に
        this.rainbowCards();
    }

    activateGameDevEffect() {
        console.log('%c🎮 ゲームデベロッパーモード発動！', 'color: #6366f1; font-size: 20px; font-weight: bold;');
        
        // レベルアップエフェクト連発
        this.massLevelUp();
        
        // 通知表示
        this.showNotification('🎮 Game Developer Mode', 'All Skills MAX Level!', '#6366f1');
        
        // パーティクル爆発
        this.particleExplosion();
    }

    activateUnityEffect() {
        console.log('%c⚡ Unity Power発動！', 'color: #000000; font-size: 20px; font-weight: bold;');
        
        // 3D回転エフェクト
        this.unity3DRotation();
        
        // 通知表示
        this.showNotification('⚡ Unity Power!', 'Everything is a GameObject!', '#000000');
        
        // 立方体パーティクル大量発生
        this.cubeExplosion();
    }

    createMatrixRain() {
        const canvas = document.createElement('canvas');
        canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 9999;
        `;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
        const fontSize = 16;
        const columns = canvas.width / fontSize;
        const drops = Array(Math.floor(columns)).fill(1);

        let frame = 0;
        const maxFrames = 300;

        function draw() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#0F0';
            ctx.font = fontSize + 'px monospace';

            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }

            frame++;
            if (frame < maxFrames) {
                requestAnimationFrame(draw);
            } else {
                canvas.style.opacity = '0';
                canvas.style.transition = 'opacity 1s';
                setTimeout(() => canvas.remove(), 1000);
            }
        }

        draw();
    }

    showNotification(title, message, color) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            background: linear-gradient(135deg, ${color}, ${color}dd);
            color: white;
            padding: 3rem 4rem;
            border-radius: 20px;
            z-index: 10000;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            animation: notificationPop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        `;
        notification.innerHTML = `
            <h2 style="font-size: 3rem; margin: 0 0 1rem 0; font-family: var(--font-primary);">${title}</h2>
            <p style="font-size: 1.8rem; margin: 0;">${message}</p>
        `;

        // アニメーション定義
        const style = document.createElement('style');
        style.textContent = `
            @keyframes notificationPop {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                50% { transform: translate(-50%, -50%) scale(1.1); }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translate(-50%, -50%) scale(0)';
            notification.style.opacity = '0';
            notification.style.transition = 'all 0.5s';
            setTimeout(() => {
                notification.remove();
                style.remove();
            }, 500);
        }, 3000);
    }

    rainbowCards() {
        const cards = document.querySelectorAll('.work-card, .skill');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.animation = 'rainbow 3s linear infinite';
            }, index * 100);
        });

        const style = document.createElement('style');
        style.textContent = `
            @keyframes rainbow {
                0% { filter: hue-rotate(0deg); }
                100% { filter: hue-rotate(360deg); }
            }
        `;
        document.head.appendChild(style);

        setTimeout(() => {
            cards.forEach(card => card.style.animation = '');
            style.remove();
        }, 10000);
    }

    massLevelUp() {
        const skills = document.querySelectorAll('.skill');
        skills.forEach((skill, index) => {
            setTimeout(() => {
                const event = new Event('mouseenter');
                skill.dispatchEvent(event);
            }, index * 500);
        });
    }

    particleExplosion() {
        const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 9999;
        `;
        document.body.appendChild(container);

        for (let i = 0; i < 100; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.style.cssText = `
                    position: absolute;
                    width: 10px;
                    height: 10px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    border-radius: 50%;
                    top: 50%;
                    left: 50%;
                    animation: explode ${1 + Math.random()}s ease-out forwards;
                `;
                container.appendChild(particle);
            }, i * 20);
        }

        const style = document.createElement('style');
        style.textContent = `
            @keyframes explode {
                to {
                    transform: translate(
                        ${Math.random() * 200 - 100}vw,
                        ${Math.random() * 200 - 100}vh
                    ) scale(0);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);

        setTimeout(() => {
            container.remove();
            style.remove();
        }, 3000);
    }

    unity3DRotation() {
        const sections = document.querySelectorAll('section');
        sections.forEach((section, index) => {
            setTimeout(() => {
                section.style.transform = 'rotateY(360deg)';
                section.style.transition = 'transform 2s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                setTimeout(() => {
                    section.style.transform = '';
                }, 2000);
            }, index * 200);
        });
    }

    cubeExplosion() {
        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 9999;
        `;
        document.body.appendChild(container);

        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const cube = document.createElement('div');
                cube.style.cssText = `
                    position: absolute;
                    width: 20px;
                    height: 20px;
                    background: linear-gradient(135deg, #000, #fff);
                    top: 50%;
                    left: 50%;
                    animation: cubeExplode ${1 + Math.random()}s ease-out forwards;
                    transform-style: preserve-3d;
                `;
                container.appendChild(cube);
            }, i * 30);
        }

        const style = document.createElement('style');
        style.textContent = `
            @keyframes cubeExplode {
                to {
                    transform: translate(
                        ${Math.random() * 150 - 75}vw,
                        ${Math.random() * 150 - 75}vh
                    ) rotateX(${Math.random() * 720}deg) rotateY(${Math.random() * 720}deg) scale(0);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);

        setTimeout(() => {
            container.remove();
            style.remove();
        }, 3000);
    }
}
