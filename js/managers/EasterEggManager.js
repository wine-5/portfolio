class EasterEggManager {
    constructor() {
        this.wineCode = ['w', 'i', 'n', 'e', '-', '5'];
        this.userInput = [];
        this.gameDevCode = ['g', 'a', 'm', 'e', 'd', 'e', 'v'];
        this.unityCode = ['u', 'n', 'i', 't', 'y'];
        this.debugCode = ['d', 'e', 'b', 'u', 'g'];
        this.debugMode = false;
        // activated フラグを削除（複数回発動可能に）
    }

    init() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        console.log('%c🎮 イースターエッグのヒント:', 'color: #6366f1; font-size: 16px; font-weight: bold;');
        console.log('%c1. "wine-5" とタイプしてみよう！', 'color: #8b5cf6;');
        console.log('%c2. "gamedev" とタイプしてみよう！', 'color: #8b5cf6;');
        console.log('%c3. "unity" とタイプしてみよう！', 'color: #8b5cf6;');
        console.log('%c4. "debug" とタイプしてデバッグモードへ！', 'color: #ff6b6b;');
    }

    handleKeyPress(e) {
        // デバッグモード中はESCで解除
        if (this.debugMode && e.key === 'Escape') {
            this.deactivateDebugMode();
            return;
        }

        this.userInput.push(e.key);
        
        // 最新の入力のみ保持
        if (this.userInput.length > 10) {
            this.userInput.shift();
        }

        this.checkWineCode();
        this.checkGameDevCode();
        this.checkUnityCode();
        this.checkDebugCode();
    }

    checkWineCode() {
        const recentInput = this.userInput.slice(-this.wineCode.length).join('');
        const code = this.wineCode.join('');

        if (recentInput === code) {
            this.activateWineEffect();
            this.userInput = []; // 入力履歴をクリア
        }
    }

    checkGameDevCode() {
        const recentInput = this.userInput.slice(-this.gameDevCode.length).join('');
        const code = this.gameDevCode.join('');

        if (recentInput === code) {
            this.activateGameDevEffect();
            this.userInput = []; // 入力履歴をクリア
        }
    }

    checkUnityCode() {
        const recentInput = this.userInput.slice(-this.unityCode.length).join('');
        const code = this.unityCode.join('');

        if (recentInput === code) {
            this.activateUnityEffect();
            this.userInput = []; // 入力履歴をクリア
        }
    }

    checkDebugCode() {
        if (this.debugMode) return;
        
        const recentInput = this.userInput.slice(-this.debugCode.length).join('');
        const code = this.debugCode.join('');

        if (recentInput === code) {
            this.activateDebugMode();
            this.userInput = []; // 入力履歴をクリア
        }
    }

    activateDebugMode() {
        this.debugMode = true;
        console.log('%c🔧 DEBUG MODE ACTIVATED', 'color: #ff6b6b; font-size: 24px; font-weight: bold; background: #000; padding: 10px;');
        console.log('%cPress ESC to exit debug mode', 'color: #ffa500;');
        
        // デバッグモードUI
        this.createDebugModeUI();
        
        // 通知表示
        this.showNotification('🔧 DEBUG MODE', 'Press ESC to exit', '#ff6b6b');
        
        // デバッグ視覚エフェクト
        this.applyDebugVisuals();
    }

    deactivateDebugMode() {
        this.debugMode = false;
        console.log('%c✓ Debug mode deactivated', 'color: #10b981; font-size: 16px;');
        
        // デバッグUIを削除
        const debugUI = document.querySelector('.debug-mode-ui');
        if (debugUI) {
            debugUI.style.opacity = '0';
            setTimeout(() => debugUI.remove(), 300);
        }
        
        // 視覚エフェクトを削除
        this.removeDebugVisuals();
        
        // 通知表示
        this.showNotification('✓ Normal Mode', 'Debug mode disabled', '#10b981');
    }

    createDebugModeUI() {
        const debugUI = document.createElement('div');
        debugUI.className = 'debug-mode-ui';
        debugUI.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid #ff6b6b;
            border-radius: 10px;
            padding: 20px;
            color: #00ff00;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            z-index: 10000;
            min-width: 300px;
            box-shadow: 0 0 20px rgba(255, 107, 107, 0.5);
            animation: debugUIFadeIn 0.3s ease-out;
        `;
        
        const updateDebugInfo = () => {
            const now = new Date();
            const fps = this.calculateFPS();
            const memoryInfo = performance.memory ? 
                `${(performance.memory.usedJSHeapSize / 1048576).toFixed(2)} MB` : 
                'N/A';
            
            debugUI.innerHTML = `
                <div style="border-bottom: 1px solid #ff6b6b; margin-bottom: 10px; padding-bottom: 10px;">
                    <div style="color: #ff6b6b; font-weight: bold; font-size: 16px;">🔧 DEBUG MODE</div>
                    <div style="color: #ffa500; font-size: 12px;">Press ESC to exit</div>
                </div>
                <div style="line-height: 1.8;">
                    <div>⏰ Time: ${now.toLocaleTimeString()}</div>
                    <div>📊 FPS: ${fps}</div>
                    <div>💾 Memory: ${memoryInfo}</div>
                    <div>📐 Viewport: ${window.innerWidth}x${window.innerHeight}</div>
                    <div>🖱️ Mouse: (${this.mouseX || 0}, ${this.mouseY || 0})</div>
                    <div>📜 Scroll: ${Math.round(window.scrollY)}px</div>
                </div>
            `;
        };
        
        // マウス位置を追跡
        document.addEventListener('mousemove', (e) => {
            if (this.debugMode) {
                this.mouseX = e.clientX;
                this.mouseY = e.clientY;
            }
        });
        
        // 定期的に更新
        this.debugInterval = setInterval(updateDebugInfo, 100);
        
        // スタイル定義
        const style = document.createElement('style');
        style.textContent = `
            @keyframes debugUIFadeIn {
                from { opacity: 0; transform: translateX(20px); }
                to { opacity: 1; transform: translateX(0); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(debugUI);
        updateDebugInfo();
    }

    calculateFPS() {
        if (!this.lastFrameTime) {
            this.lastFrameTime = performance.now();
            this.frameCount = 0;
            return 60;
        }
        
        this.frameCount++;
        const currentTime = performance.now();
        const delta = currentTime - this.lastFrameTime;
        
        if (delta >= 1000) {
            const fps = Math.round((this.frameCount * 1000) / delta);
            this.frameCount = 0;
            this.lastFrameTime = currentTime;
            this.currentFPS = fps;
        }
        
        return this.currentFPS || 60;
    }

    applyDebugVisuals() {
        // グリッド表示
        const grid = document.createElement('div');
        grid.className = 'debug-grid';
        grid.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-image: 
                repeating-linear-gradient(0deg, rgba(255, 107, 107, 0.1) 0px, transparent 1px, transparent 50px, rgba(255, 107, 107, 0.1) 51px),
                repeating-linear-gradient(90deg, rgba(255, 107, 107, 0.1) 0px, transparent 1px, transparent 50px, rgba(255, 107, 107, 0.1) 51px);
            pointer-events: none;
            z-index: 9998;
        `;
        document.body.appendChild(grid);
        
        // すべての要素にアウトライン
        const style = document.createElement('style');
        style.id = 'debug-outline-style';
        style.textContent = `
            .debug-mode-active * {
                outline: 1px solid rgba(255, 107, 107, 0.3) !important;
            }
            .debug-mode-active *:hover {
                outline: 2px solid rgba(255, 107, 107, 0.8) !important;
                background: rgba(255, 107, 107, 0.1) !important;
            }
        `;
        document.head.appendChild(style);
        document.body.classList.add('debug-mode-active');
    }

    removeDebugVisuals() {
        // グリッドを削除
        const grid = document.querySelector('.debug-grid');
        if (grid) grid.remove();
        
        // アウトラインスタイルを削除
        const style = document.getElementById('debug-outline-style');
        if (style) style.remove();
        
        document.body.classList.remove('debug-mode-active');
        
        // インターバルをクリア
        if (this.debugInterval) {
            clearInterval(this.debugInterval);
            this.debugInterval = null;
        }
    }

    activateWineEffect() {
        console.log('%c🍷 WINE-5 Portfolio Master Unlocked!', 'color: #ffd700; font-size: 20px; font-weight: bold;');
        
        // 画面全体にマトリックス風エフェクト
        this.createMatrixRain();
        
        // 通知表示
        this.showNotification('🍷 Portfolio Master Unlocked!', 'WINE-5 Mode Activated!', '#ffd700');
        
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
