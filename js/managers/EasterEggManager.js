class EasterEggManager {
    constructor() {
        this.wineCode = ['w', 'i', 'n', 'e', '-', '5'];
        this.userInput = [];
        this.debugCode = ['d', 'e', 'b', 'u', 'g'];
        this.debugMode = false;
        this.wineMode = false;
    }

    init() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        console.log('%c🎮 イースターエッグのヒント:', 'color: #6366f1; font-size: 16px; font-weight: bold;');
        console.log('%c1. "wine-5" とタイプしてみよう！', 'color: #8b5cf6;');
        console.log('%c2. "debug" とタイプしてデバッグモードへ！', 'color: #ff6b6b;');
    }

    handleKeyPress(e) {
        // wine-5モード中はESCで解除
        if (this.wineMode && e.key === 'Escape') {
            this.deactivateWineMode();
            return;
        }
        
        // デバッグモード中はESCで解除
        if (this.debugMode && e.key === 'Escape') {
            this.deactivateDebugMode();
            return;
        }

        // 大文字小文字を区別せずに入力を記録
        this.userInput.push(e.key.toLowerCase());
        
        // 最新の入力のみ保持
        if (this.userInput.length > 10) {
            this.userInput.shift();
        }

        this.checkWineCode();
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
        this.wineMode = true;
        console.log('%c🍷 WINE-5 Portfolio Master Unlocked!', 'color: #ffd700; font-size: 20px; font-weight: bold;');
        console.log('%cPress ESC to exit wine-5 mode', 'color: #ffa500;');
        
        // 画面全体にマトリックス風エフェクト
        this.createMatrixRain();
        
        // 通知表示
        this.showNotification('🍷 Portfolio Master Unlocked!', 'Press ESC to exit', '#ffd700');
        
        // 全カードを虹色に
        this.rainbowCards();
        
        // wine-5専用の特別な機能を追加
        this.addWineSpecialFeatures();
    }

    deactivateWineMode() {
        this.wineMode = false;
        console.log('%c✓ Wine-5 mode deactivated', 'color: #10b981; font-size: 16px;');
        
        // 虹色エフェクトを削除
        const cards = document.querySelectorAll('.work-card, .skill');
        cards.forEach(card => {
            card.style.animation = '';
            card.style.filter = '';
        });
        
        // レインボースタイルを削除
        const rainbowStyle = document.querySelector('style[data-wine-rainbow]');
        if (rainbowStyle) rainbowStyle.remove();
        
        // wine-5専用機能を削除
        this.removeWineSpecialFeatures();
        
        // 通知表示
        this.showNotification('✓ Normal Mode', 'Wine-5 mode disabled', '#10b981');
    }

    addWineSpecialFeatures() {
        // 管理者専用の特別な操作パネルを作成
        const controlPanel = document.createElement('div');
        controlPanel.className = 'wine-control-panel';
        controlPanel.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: linear-gradient(135deg, rgba(255, 215, 0, 0.95), rgba(218, 165, 32, 0.95));
            border: 3px solid #ffd700;
            border-radius: 15px;
            padding: 20px;
            z-index: 10000;
            min-width: 280px;
            box-shadow: 0 10px 40px rgba(255, 215, 0, 0.4);
            animation: winePanelSlideIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        `;
        
        controlPanel.innerHTML = `
            <div style="text-align: center; margin-bottom: 15px;">
                <div style="font-size: 24px; font-weight: bold; color: #000; font-family: var(--font-primary);">
                    🍷 WINE-5 MASTER PANEL
                </div>
                <div style="font-size: 12px; color: #333; margin-top: 5px;">
                    管理者専用コントロール
                </div>
            </div>
            <div style="display: grid; gap: 10px;">
                <button class="wine-btn" data-action="spinAll" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 14px; transition: all 0.3s;">
                    🌀 全カード回転
                </button>
                <button class="wine-btn" data-action="particleExplosion" style="background: linear-gradient(135deg, #f093fb, #f5576c); color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 14px; transition: all 0.3s;">
                    💥 パーティクル爆発
                </button>
                <button class="wine-btn" data-action="massLevelUp" style="background: linear-gradient(135deg, #4facfe, #00f2fe); color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 14px; transition: all 0.3s;">
                    ⬆️ 全レベルアップ
                </button>
                <button class="wine-btn" data-action="secretMessage" style="background: linear-gradient(135deg, #43e97b, #38f9d7); color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 14px; transition: all 0.3s;">
                    💌 シークレットメッセージ
                </button>
            </div>
            <div style="text-align: center; margin-top: 15px; font-size: 12px; color: #333;">
                Press ESC to exit
            </div>
        `;
        
        // アニメーション定義
        const style = document.createElement('style');
        style.setAttribute('data-wine-panel', 'true');
        style.textContent = `
            @keyframes winePanelSlideIn {
                from { transform: translateX(-100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .wine-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            }
            .wine-btn:active {
                transform: translateY(0);
            }
        `;
        document.head.appendChild(style);
        
        // ボタンイベントを設定
        document.body.appendChild(controlPanel);
        
        controlPanel.querySelectorAll('.wine-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.executeWineAction(action);
            });
        });
    }

    removeWineSpecialFeatures() {
        const panel = document.querySelector('.wine-control-panel');
        if (panel) {
            panel.style.transform = 'translateX(-100%)';
            panel.style.opacity = '0';
            panel.style.transition = 'all 0.3s';
            setTimeout(() => panel.remove(), 300);
        }
        
        const style = document.querySelector('style[data-wine-panel]');
        if (style) style.remove();
    }

    executeWineAction(action) {
        switch(action) {
            case 'spinAll':
                this.spinAllCards();
                break;
            case 'particleExplosion':
                this.createParticleExplosion();
                break;
            case 'massLevelUp':
                this.massLevelUp();
                break;
            case 'secretMessage':
                this.showSecretMessage();
                break;
        }
    }

    spinAllCards() {
        const cards = document.querySelectorAll('.work-card, .skill');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.transition = 'transform 1s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                card.style.transform = 'rotateY(720deg) scale(1.1)';
                
                setTimeout(() => {
                    card.style.transform = '';
                }, 1000);
            }, index * 50);
        });
        
        this.showMiniNotification('🌀 全カード回転中！', '#667eea');
    }

    createParticleExplosion() {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                const angle = (Math.PI * 2 * i) / 50;
                const velocity = 5 + Math.random() * 10;
                
                particle.style.cssText = `
                    position: fixed;
                    left: ${centerX}px;
                    top: ${centerY}px;
                    width: 10px;
                    height: 10px;
                    background: hsl(${Math.random() * 360}, 100%, 50%);
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 10001;
                `;
                
                document.body.appendChild(particle);
                
                let posX = centerX;
                let posY = centerY;
                let velocityX = Math.cos(angle) * velocity;
                let velocityY = Math.sin(angle) * velocity;
                
                const animate = () => {
                    posX += velocityX;
                    posY += velocityY;
                    velocityY += 0.5; // 重力
                    
                    particle.style.left = posX + 'px';
                    particle.style.top = posY + 'px';
                    particle.style.opacity = parseFloat(particle.style.opacity || 1) - 0.02;
                    
                    if (parseFloat(particle.style.opacity) > 0) {
                        requestAnimationFrame(animate);
                    } else {
                        particle.remove();
                    }
                };
                
                requestAnimationFrame(animate);
            }, i * 20);
        }
        
        this.showMiniNotification('💥 パーティクル爆発！', '#f5576c');
    }

    massLevelUp() {
        const levelBadges = document.querySelectorAll('.skill-level-badge');
        levelBadges.forEach((badge, index) => {
            setTimeout(() => {
                // レベルアップアニメーション
                badge.style.animation = 'levelUpPulse 0.5s ease-out';
                
                // 数値を一時的に増加
                const currentLevel = parseInt(badge.textContent.match(/\d+/)[0]);
                const overlay = document.createElement('div');
                overlay.style.cssText = `
                    position: absolute;
                    top: -30px;
                    left: 50%;
                    transform: translateX(-50%);
                    color: #ffd700;
                    font-size: 24px;
                    font-weight: bold;
                    animation: levelUpFloat 1s ease-out forwards;
                    pointer-events: none;
                    z-index: 100;
                `;
                overlay.textContent = '+1 LEVEL UP!';
                badge.style.position = 'relative';
                badge.appendChild(overlay);
                
                setTimeout(() => overlay.remove(), 1000);
            }, index * 100);
        });
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes levelUpPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.3); box-shadow: 0 0 30px #ffd700; }
            }
            @keyframes levelUpFloat {
                0% { transform: translateX(-50%) translateY(0); opacity: 1; }
                100% { transform: translateX(-50%) translateY(-50px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        setTimeout(() => style.remove(), 2000);
        
        this.showMiniNotification('⬆️ 全レベルアップ！', '#00f2fe');
    }

    showSecretMessage() {
        const messages = [
            '🎮 本気でゲーム開発を楽しんでいます！',
            '💻 コードを書く時間が一番幸せです',
            '🌟 毎日が新しい学びの連続',
            '🚀 次のプロジェクトが待ち遠しい！',
            '✨ クリエイティブな挑戦を続けます'
        ];
        
        const message = messages[Math.floor(Math.random() * messages.length)];
        
        const messageBox = document.createElement('div');
        messageBox.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 40px 60px;
            border-radius: 20px;
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            z-index: 10002;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            animation: secretMessagePop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        `;
        messageBox.textContent = message;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes secretMessagePop {
                0% { transform: translate(-50%, -50%) scale(0) rotate(-180deg); opacity: 0; }
                100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(messageBox);
        
        setTimeout(() => {
            messageBox.style.transform = 'translate(-50%, -50%) scale(0) rotate(180deg)';
            messageBox.style.opacity = '0';
            messageBox.style.transition = 'all 0.5s';
            setTimeout(() => {
                messageBox.remove();
                style.remove();
            }, 500);
        }, 3000);
    }

    showMiniNotification(text, color) {
        const notif = document.createElement('div');
        notif.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(-100%);
            background: ${color};
            color: white;
            padding: 15px 30px;
            border-radius: 10px;
            font-weight: bold;
            z-index: 10003;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
            animation: miniNotifSlide 2s ease-out forwards;
        `;
        notif.textContent = text;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes miniNotifSlide {
                0% { transform: translateX(-50%) translateY(-100%); }
                10%, 90% { transform: translateX(-50%) translateY(0); }
                100% { transform: translateX(-50%) translateY(-100%); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notif);
        setTimeout(() => {
            notif.remove();
            style.remove();
        }, 2000);
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
        style.setAttribute('data-wine-rainbow', 'true');
        style.textContent = `
            @keyframes rainbow {
                0% { filter: hue-rotate(0deg); }
                100% { filter: hue-rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
}
