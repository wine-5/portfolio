class EasterEggManager {
    constructor() {
        this.wineCode = ['w', 'i', 'n', 'e', '-', '5'];
        this.userInput = [];
        this.debugCode = ['d', 'e', 'b', 'u', 'g'];
        this.debugMode = false;
        this.wineMode = false;
        this.rainbowActive = false;
        this.glitchActive = false;
        this.virusActive = false;
    }

    init() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        console.log('%c🎮 イースターエッグのヒント:', 'color: #6366f1; font-size: 16px; font-weight: bold;');
        console.log('%c1. "wine-5" とタイプしてみよう！', 'color: #8b5cf6;');
        console.log('%c2. "debug" とタイプしてデバッグモードへ！', 'color: #ff6b6b;');
        
        // ヘッダー下の演出を常に表示
        this.createHeaderWebGLEffect();
    }

    handleKeyPress(e) {
        // ウイルスモード中はESCで回避
        if (this.virusActive && e.key === 'Escape') {
            this.deactivateVirusMode();
            return;
        }
        
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
            z-index: 10005;
            min-width: 300px;
            box-shadow: 0 0 20px rgba(255, 107, 107, 0.5);
            animation: debugUIFadeIn 0.3s ease-out;
            pointer-events: auto;
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
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ff6b6b;">
                    <button id="debug-secret-msg" style="
                        width: 100%;
                        padding: 10px;
                        background: linear-gradient(135deg, #ff6b6b, #ff4757);
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-weight: bold;
                        font-size: 13px;
                        transition: all 0.3s;
                    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 5px 15px rgba(255,107,107,0.4)'" onmouseout="this.style.transform=''; this.style.boxShadow=''">
                        💌 開発者メッセージ
                    </button>
                </div>
            `;
            
            // ボタンのイベントリスナーを再設定
            const msgBtn = document.getElementById('debug-secret-msg');
            if (msgBtn) {
                msgBtn.addEventListener('click', () => this.showSecretMessage());
            }
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
        console.log('%cWINE-5 Portfolio Master Unlocked!', 'color: #ffd700; font-size: 20px; font-weight: bold;');
        console.log('%cPress ESC to exit wine-5 mode', 'color: #ffa500;');
        
        // 画面全体にマトリックス風エフェクト
        this.createMatrixRain();
        
        // 通知表示
        this.showNotification('WINE-5 Portfolio Master Unlocked!', 'Press ESC to exit', '#ffd700');
        
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
        // WebGLキャンバスで豪華なエフェクトを作成
        this.createWineWebGLEffect();
        
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
            z-index: 10001;
            min-width: 280px;
            box-shadow: 0 10px 40px rgba(255, 215, 0, 0.4);
            animation: winePanelSlideIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        `;
        
        controlPanel.innerHTML = `
            <div style="text-align: center; margin-bottom: 15px;">
                <div style="font-size: 24px; font-weight: bold; color: #000; font-family: var(--font-primary);">
                    WINE-5 MASTER PANEL
                </div>
                <div style="font-size: 12px; color: #333; margin-top: 5px;">
                    管理者専用コントロール
                </div>
            </div>
            <div style="display: grid; gap: 10px;">
                <button class="wine-btn" data-action="timeFreeze" style="background: linear-gradient(135deg, #f093fb, #f5576c); color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 14px; transition: all 0.3s;">
                    TIME FREEZE
                </button>
                <button class="wine-btn" data-action="massLevelUp" style="background: linear-gradient(135deg, #4facfe, #00f2fe); color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 14px; transition: all 0.3s;">
                    MAX LEVEL
                </button>
                <button class="wine-btn" data-action="matrixRain" style="background: linear-gradient(135deg, #11998e, #38ef7d); color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 14px; transition: all 0.3s;">
                    MATRIX RAIN
                </button>
                <button class="wine-btn" data-action="rainbowMode" style="background: linear-gradient(135deg, #ee0979, #ff6a00); color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 14px; transition: all 0.3s;">
                    RAINBOW MODE
                </button>
                <button class="wine-btn" data-action="glitchEffect" style="background: linear-gradient(135deg, #8e2de2, #4a00e0); color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 14px; transition: all 0.3s;">
                    GLITCH EFFECT
                </button>
                <button class="wine-btn" data-action="virusMode" style="background: linear-gradient(135deg, #d31027, #ea384d); color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 14px; transition: all 0.3s;">
                    VIRUS MODE
                </button>
                <button class="wine-btn" data-action="secretMessage" style="background: linear-gradient(135deg, #43e97b, #38f9d7); color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 14px; transition: all 0.3s;">
                    SECRET MESSAGE
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
        
        // WebGLエフェクトを停止・削除
        this.stopWineWebGLEffect();
    }

    createWineWebGLEffect() {
        // WebGLキャンバス作成
        const canvas = document.createElement('canvas');
        canvas.className = 'wine-webgl-canvas';
        canvas.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            width: 500px;
            height: 500px;
            pointer-events: none;
            z-index: 9999;
        `;
        document.body.appendChild(canvas);

        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) {
            // WebGL非対応の場合はCanvas 2Dにフォールバック
            this.createWineCanvas2DEffect(canvas);
            return;
        }

        // WebGLシェーダープログラム
        const vertexShaderSource = `
            attribute vec2 a_position;
            attribute vec2 a_texCoord;
            varying vec2 v_texCoord;
            
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
                v_texCoord = a_texCoord;
            }
        `;

        const fragmentShaderSource = `
            precision mediump float;
            varying vec2 v_texCoord;
            uniform float u_time;
            uniform vec2 u_resolution;
            
            void main() {
                vec2 uv = v_texCoord;
                vec2 center = vec2(0.3, 0.3);
                float dist = distance(uv, center);
                
                // 回転するリング
                float ring1 = smoothstep(0.30, 0.31, dist) - smoothstep(0.32, 0.33, dist);
                float ring2 = smoothstep(0.35, 0.36, dist) - smoothstep(0.37, 0.38, dist);
                float ring3 = smoothstep(0.40, 0.41, dist) - smoothstep(0.42, 0.43, dist);
                
                // 色の変化
                float angle = atan(uv.y - center.y, uv.x - center.x);
                float hue1 = sin(angle * 3.0 + u_time * 2.0) * 0.5 + 0.5;
                float hue2 = sin(angle * 5.0 - u_time * 3.0) * 0.5 + 0.5;
                float hue3 = sin(angle * 7.0 + u_time * 4.0) * 0.5 + 0.5;
                
                vec3 color1 = vec3(1.0, 0.84, 0.0) * hue1; // ゴールド
                vec3 color2 = vec3(1.0, 0.65, 0.0) * hue2; // オレンジ
                vec3 color3 = vec3(0.85, 0.65, 0.13) * hue3; // ダークゴールド
                
                vec3 finalColor = color1 * ring1 + color2 * ring2 + color3 * ring3;
                
                // グロー効果
                float glow = exp(-dist * 3.0) * 0.3;
                finalColor += vec3(1.0, 0.84, 0.0) * glow;
                
                // パーティクル
                float particles = 0.0;
                for(float i = 0.0; i < 20.0; i++) {
                    float particleAngle = i * 0.314 + u_time * 0.5;
                    vec2 particlePos = center + vec2(cos(particleAngle), sin(particleAngle)) * (0.35 + sin(u_time + i) * 0.05);
                    float particleDist = distance(uv, particlePos);
                    particles += smoothstep(0.02, 0.0, particleDist);
                }
                finalColor += vec3(1.0, 1.0, 0.5) * particles * 0.8;
                
                gl_FragColor = vec4(finalColor, length(finalColor) * 0.8);
            }
        `;

        // シェーダーコンパイル
        function createShader(gl, type, source) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error('Shader compile error:', gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        }

        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program link error:', gl.getProgramInfoLog(program));
            return;
        }

        // 頂点バッファ設定
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positions = new Float32Array([
            -1, -1,  1, -1,  -1, 1,
            -1, 1,   1, -1,   1, 1
        ]);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        const texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        const texCoords = new Float32Array([
            0, 0,  1, 0,  0, 1,
            0, 1,  1, 0,  1, 1
        ]);
        gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

        // アニメーションループ
        let startTime = Date.now();
        this.wineAnimationFrame = null;

        const render = () => {
            const currentTime = (Date.now() - startTime) * 0.001;
            
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            
            gl.useProgram(program);
            
            // 属性とユニフォームの設定
            const positionLocation = gl.getAttribLocation(program, 'a_position');
            const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
            const timeLocation = gl.getUniformLocation(program, 'u_time');
            const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
            
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.enableVertexAttribArray(positionLocation);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
            
            gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
            gl.enableVertexAttribArray(texCoordLocation);
            gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
            
            gl.uniform1f(timeLocation, currentTime);
            gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
            
            // ブレンディング設定
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            
            this.wineAnimationFrame = requestAnimationFrame(render);
        };

        canvas.width = 500;
        canvas.height = 500;
        render();
        
        this.wineWebGLCanvas = canvas;
    }

    createWineCanvas2DEffect(canvas) {
        // WebGL非対応時のCanvas 2Dフォールバック
        const ctx = canvas.getContext('2d');
        canvas.width = 500;
        canvas.height = 500;
        
        const centerX = 150;
        const centerY = 350;
        let rotation = 0;
        
        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            rotation += 0.02;
            
            // 回転するリング3つ
            for (let i = 0; i < 3; i++) {
                const radius = 100 + i * 30;
                const lineWidth = 3;
                const rotationOffset = rotation * (i % 2 === 0 ? 1 : -1) * (1 + i * 0.5);
                
                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.rotate(rotationOffset);
                
                // グラデーション
                const gradient = ctx.createLinearGradient(-radius, 0, radius, 0);
                gradient.addColorStop(0, `hsla(${45 + i * 10}, 100%, 50%, 0.8)`);
                gradient.addColorStop(0.5, `hsla(${55 + i * 10}, 100%, 60%, 1)`);
                gradient.addColorStop(1, `hsla(${45 + i * 10}, 100%, 50%, 0.8)`);
                
                ctx.strokeStyle = gradient;
                ctx.lineWidth = lineWidth;
                ctx.shadowBlur = 20;
                ctx.shadowColor = '#ffd700';
                
                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
                ctx.stroke();
                
                ctx.restore();
            }
            
            // パーティクル
            for (let i = 0; i < 20; i++) {
                const angle = (i / 20) * Math.PI * 2 + rotation * 2;
                const radius = 120 + Math.sin(rotation * 3 + i) * 15;
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                
                ctx.fillStyle = `hsla(${45 + (i * 10)}, 100%, 70%, ${0.6 + Math.sin(rotation * 4 + i) * 0.4})`;
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#ffd700';
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fill();
            }
            
            this.wineAnimationFrame = requestAnimationFrame(render);
        };
        
        render();
        this.wineWebGLCanvas = canvas;
    }

    stopWineWebGLEffect() {
        if (this.wineAnimationFrame) {
            cancelAnimationFrame(this.wineAnimationFrame);
            this.wineAnimationFrame = null;
        }
        
        if (this.wineWebGLCanvas) {
            this.wineWebGLCanvas.style.opacity = '0';
            this.wineWebGLCanvas.style.transition = 'opacity 0.5s';
            setTimeout(() => {
                if (this.wineWebGLCanvas) {
                    this.wineWebGLCanvas.remove();
                    this.wineWebGLCanvas = null;
                }
            }, 500);
        }
    }

    createHeaderWebGLEffect() {
        // ヘッダー下にWebGLキャンバス作成（青系）
        const canvas = document.createElement('canvas');
        canvas.className = 'wine-header-webgl-canvas';
        canvas.style.cssText = `
            position: absolute;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            width: 100vw;
            height: 400px;
            pointer-events: none;
            z-index: 99;
        `;
        document.body.appendChild(canvas);

        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) {
            // WebGL非対応の場合はCanvas 2Dにフォールバック
            this.createHeaderCanvas2DEffect(canvas);
            return;
        }

        // WebGLシェーダープログラム（青系）
        const vertexShaderSource = `
            attribute vec2 a_position;
            attribute vec2 a_texCoord;
            varying vec2 v_texCoord;
            
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
                v_texCoord = a_texCoord;
            }
        `;

        const fragmentShaderSource = `
            precision mediump float;
            varying vec2 v_texCoord;
            uniform float u_time;
            uniform vec2 u_resolution;
            
            void main() {
                vec2 uv = v_texCoord;
                vec2 center = vec2(0.5, 0.3);
                float dist = distance(uv, center);
                
                // 回転するリング（3つ）
                float ring1 = smoothstep(0.25, 0.26, dist) - smoothstep(0.27, 0.28, dist);
                float ring2 = smoothstep(0.30, 0.31, dist) - smoothstep(0.32, 0.33, dist);
                float ring3 = smoothstep(0.35, 0.36, dist) - smoothstep(0.37, 0.38, dist);
                
                // 色の変化（青系）
                float angle = atan(uv.y - center.y, uv.x - center.x);
                float hue1 = sin(angle * 4.0 + u_time * 2.5) * 0.5 + 0.5;
                float hue2 = sin(angle * 6.0 - u_time * 3.5) * 0.5 + 0.5;
                float hue3 = sin(angle * 8.0 + u_time * 4.5) * 0.5 + 0.5;
                
                vec3 color1 = vec3(0.2, 0.4, 1.0) * hue1; // ブライトブルー
                vec3 color2 = vec3(0.4, 0.6, 1.0) * hue2; // ライトブルー
                vec3 color3 = vec3(0.1, 0.3, 0.9) * hue3; // ディープブルー
                
                vec3 finalColor = color1 * ring1 + color2 * ring2 + color3 * ring3;
                
                // グロー効果（青系）
                float glow = exp(-dist * 2.5) * 0.4;
                finalColor += vec3(0.3, 0.5, 1.0) * glow;
                
                // エネルギーパーティクル
                float particles = 0.0;
                for(float i = 0.0; i < 30.0; i++) {
                    float particleAngle = i * 0.209 + u_time * 0.7;
                    float orbitRadius = 0.28 + sin(u_time * 1.5 + i * 0.5) * 0.08;
                    vec2 particlePos = center + vec2(cos(particleAngle), sin(particleAngle)) * orbitRadius;
                    float particleDist = distance(uv, particlePos);
                    particles += smoothstep(0.015, 0.0, particleDist);
                }
                finalColor += vec3(0.6, 0.8, 1.0) * particles * 1.2;
                
                // 波紋エフェクト
                float wave = sin(dist * 20.0 - u_time * 3.0) * 0.5 + 0.5;
                wave = smoothstep(0.3, 0.5, wave) * 0.15;
                finalColor += vec3(0.2, 0.5, 1.0) * wave;
                
                // 上部へのグラデーションフェード
                float fade = smoothstep(0.0, 0.3, uv.y) * smoothstep(1.0, 0.7, uv.y);
                
                gl_FragColor = vec4(finalColor * fade, length(finalColor) * fade * 0.85);
            }
        `;

        // シェーダーコンパイル
        function createShader(gl, type, source) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error('Shader compile error:', gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        }

        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program link error:', gl.getProgramInfoLog(program));
            return;
        }

        // 頂点バッファ設定
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positions = new Float32Array([
            -1, -1,  1, -1,  -1, 1,
            -1, 1,   1, -1,   1, 1
        ]);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        const texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        const texCoords = new Float32Array([
            0, 0,  1, 0,  0, 1,
            0, 1,  1, 0,  1, 1
        ]);
        gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

        // アニメーションループ
        let startTime = Date.now();
        this.headerAnimationFrame = null;

        const render = () => {
            const currentTime = (Date.now() - startTime) * 0.001;
            
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            
            gl.useProgram(program);
            
            // 属性とユニフォームの設定
            const positionLocation = gl.getAttribLocation(program, 'a_position');
            const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
            const timeLocation = gl.getUniformLocation(program, 'u_time');
            const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
            
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.enableVertexAttribArray(positionLocation);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
            
            gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
            gl.enableVertexAttribArray(texCoordLocation);
            gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
            
            gl.uniform1f(timeLocation, currentTime);
            gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
            
            // ブレンディング設定
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            
            this.headerAnimationFrame = requestAnimationFrame(render);
        };

        canvas.width = window.innerWidth;
        canvas.height = 400;
        render();
        
        this.headerWebGLCanvas = canvas;
    }

    createHeaderCanvas2DEffect(canvas) {
        // WebGL非対応時のCanvas 2Dフォールバック（青系）
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = 400;
        
        const centerX = canvas.width / 2;
        const centerY = 120;
        let rotation = 0;
        
        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            rotation += 0.015;
            
            // 回転するリング3つ（青系）
            for (let i = 0; i < 3; i++) {
                const radius = 80 + i * 35;
                const lineWidth = 3;
                const rotationOffset = rotation * (i % 2 === 0 ? 1 : -1) * (1 + i * 0.3);
                
                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.rotate(rotationOffset);
                
                // グラデーション（青系）
                const gradient = ctx.createLinearGradient(-radius, 0, radius, 0);
                gradient.addColorStop(0, `hsla(${210 + i * 15}, 90%, 55%, 0.7)`);
                gradient.addColorStop(0.5, `hsla(${220 + i * 15}, 95%, 65%, 0.9)`);
                gradient.addColorStop(1, `hsla(${210 + i * 15}, 90%, 55%, 0.7)`);
                
                ctx.strokeStyle = gradient;
                ctx.lineWidth = lineWidth;
                ctx.shadowBlur = 25;
                ctx.shadowColor = '#4facfe';
                
                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
                ctx.stroke();
                
                ctx.restore();
            }
            
            // エネルギーパーティクル（青系）
            for (let i = 0; i < 30; i++) {
                const angle = (i / 30) * Math.PI * 2 + rotation * 2.5;
                const radius = 95 + Math.sin(rotation * 4 + i * 0.5) * 20;
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                
                const alpha = 0.5 + Math.sin(rotation * 5 + i) * 0.4;
                ctx.fillStyle = `hsla(${200 + (i * 5)}, 95%, 70%, ${alpha})`;
                ctx.shadowBlur = 20;
                ctx.shadowColor = '#00f2fe';
                ctx.beginPath();
                ctx.arc(x, y, 3 + Math.sin(rotation * 3 + i) * 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // 波紋エフェクト
            ctx.save();
            ctx.translate(centerX, centerY);
            for (let i = 0; i < 3; i++) {
                const waveRadius = (rotation * 50 + i * 40) % 200;
                const alpha = 1 - (waveRadius / 200);
                ctx.strokeStyle = `hsla(210, 90%, 60%, ${alpha * 0.4})`;
                ctx.lineWidth = 2;
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#4facfe';
                ctx.beginPath();
                ctx.arc(0, 0, waveRadius, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.restore();
            
            this.headerAnimationFrame = requestAnimationFrame(render);
        };
        
        render();
        this.headerWebGLCanvas = canvas;
    }

    stopHeaderWebGLEffect() {
        if (this.headerAnimationFrame) {
            cancelAnimationFrame(this.headerAnimationFrame);
            this.headerAnimationFrame = null;
        }
        
        if (this.headerWebGLCanvas) {
            this.headerWebGLCanvas.style.opacity = '0';
            this.headerWebGLCanvas.style.transition = 'opacity 0.5s';
            setTimeout(() => {
                if (this.headerWebGLCanvas) {
                    this.headerWebGLCanvas.remove();
                    this.headerWebGLCanvas = null;
                }
            }, 500);
        }
    }

    executeWineAction(action) {
        switch(action) {
            case 'timeFreeze':
                this.activateTimeFreeze();
                break;
            case 'massLevelUp':
                this.massLevelUp();
                break;
            case 'matrixRain':
                this.createMatrixRain();
                this.showMiniNotification('MATRIX RAIN ACTIVATED', '#11998e');
                break;
            case 'rainbowMode':
                this.toggleRainbowMode();
                break;
            case 'glitchEffect':
                this.toggleGlitchEffect();
                break;
            case 'virusMode':
                this.activateVirusMode();
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
                // 元のtransformを保存
                const originalTransform = card.style.transform || '';
                
                card.style.transition = 'transform 1s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                card.style.transform = 'rotateY(720deg) scale(1.1)';
                
                setTimeout(() => {
                    // 元のtransformに戻す
                    card.style.transform = originalTransform;
                }, 1000);
            }, index * 50);
        });
        
        this.showMiniNotification('SPIN ALL CARDS', '#667eea');
    }

    activateTimeFreeze() {
        // 時間停止エフェクト - すべての要素をグレースケール＋スローモーション
        const body = document.body;
        
        // 時間停止オーバーレイ
        const overlay = document.createElement('div');
        overlay.className = 'time-freeze-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: radial-gradient(circle, transparent 0%, rgba(0, 0, 0, 0.5) 100%);
            pointer-events: none;
            z-index: 9997;
            animation: timeFreezeIn 0.5s ease-out;
        `;
        
        // 時間停止リング
        const rings = [];
        for (let i = 0; i < 3; i++) {
            const ring = document.createElement('div');
            ring.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: ${200 + i * 150}px;
                height: ${200 + i * 150}px;
                border: 3px solid rgba(139, 92, 246, ${0.6 - i * 0.2});
                border-radius: 50%;
                pointer-events: none;
                z-index: 9998;
                animation: timeRingExpand 2s ease-out infinite;
                animation-delay: ${i * 0.3}s;
            `;
            rings.push(ring);
            document.body.appendChild(ring);
        }
        
        // スタイル追加
        const style = document.createElement('style');
        style.setAttribute('data-time-freeze', 'true');
        style.textContent = `
            @keyframes timeFreezeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes timeRingExpand {
                0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                50% { opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
            }
            .time-frozen * {
                filter: grayscale(0.7) !important;
                animation-play-state: paused !important;
                transition: all 3s ease !important;
            }
            .time-frozen .work-card,
            .time-frozen .skill {
                transform: scale(0.98) !important;
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(overlay);
        
        // 時間停止適用
        body.classList.add('time-frozen');
        
        // 中央テキスト
        const freezeText = document.createElement('div');
        freezeText.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-family: var(--font-primary);
            font-size: 48px;
            font-weight: bold;
            color: #8b5cf6;
            text-shadow: 0 0 20px #8b5cf6, 0 0 40px #8b5cf6;
            z-index: 9999;
            animation: freezeTextPulse 1s ease-in-out infinite;
            pointer-events: none;
        `;
        freezeText.textContent = 'TIME FREEZE';
        document.body.appendChild(freezeText);
        
        const pulseStyle = document.createElement('style');
        pulseStyle.textContent = `
            @keyframes freezeTextPulse {
                0%, 100% { opacity: 0.8; transform: translate(-50%, -50%) scale(1); }
                50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
            }
        `;
        document.head.appendChild(pulseStyle);
        
        // 5秒後に解除
        setTimeout(() => {
            body.classList.remove('time-frozen');
            overlay.remove();
            rings.forEach(ring => ring.remove());
            freezeText.remove();
            style.remove();
            pulseStyle.remove();
            this.showMiniNotification('TIME RESUMED', '#8b5cf6');
        }, 5000);
        
        this.showMiniNotification('TIME FREEZE ACTIVATED', '#f5576c');
    }

    /* パーティクル爆発機能（将来の実装用に保持）
    createParticleExplosion() {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        // 3波に分けて爆発（合計300個）
        const waves = [
            { count: 100, delay: 0, sizeRange: [20, 40], velocityMult: 1.5 },
            { count: 100, delay: 200, sizeRange: [15, 30], velocityMult: 1.2 },
            { count: 100, delay: 400, sizeRange: [10, 25], velocityMult: 1.0 }
        ];
        
        waves.forEach(wave => {
            setTimeout(() => {
                for (let i = 0; i < wave.count; i++) {
                    setTimeout(() => {
                        const particle = document.createElement('div');
                        const angle = (Math.PI * 2 * i) / wave.count + Math.random() * 0.3;
                        const velocity = (8 + Math.random() * 15) * wave.velocityMult;
                        const size = wave.sizeRange[0] + Math.random() * (wave.sizeRange[1] - wave.sizeRange[0]);
                        const hue = Math.random() * 360;
                        
                        particle.style.cssText = `
                            position: fixed;
                            left: ${centerX}px;
                            top: ${centerY}px;
                            width: ${size}px;
                            height: ${size}px;
                            background: radial-gradient(circle, hsl(${hue}, 100%, 60%), hsl(${hue}, 100%, 40%));
                            border-radius: 50%;
                            pointer-events: none;
                            z-index: 10001;
                            box-shadow: 
                                0 0 ${size}px hsl(${hue}, 100%, 50%),
                                0 0 ${size * 2}px hsl(${hue}, 100%, 50%),
                                inset 0 0 ${size/2}px rgba(255, 255, 255, 0.8);
                            filter: blur(1px);
                        `;
                        
                        document.body.appendChild(particle);
                        
                        let posX = centerX;
                        let posY = centerY;
                        let velocityX = Math.cos(angle) * velocity;
                        let velocityY = Math.sin(angle) * velocity;
                        let rotation = 0;
                        let rotationSpeed = (Math.random() - 0.5) * 20;
                        
                        const animate = () => {
                            posX += velocityX;
                            posY += velocityY;
                            velocityY += 0.8; // 重力強化
                            velocityX *= 0.99; // 空気抵抗
                            rotation += rotationSpeed;
                            
                            particle.style.left = posX + 'px';
                            particle.style.top = posY + 'px';
                            particle.style.transform = `rotate(${rotation}deg) scale(${1 + Math.sin(rotation * 0.1) * 0.2})`;
                            particle.style.opacity = parseFloat(particle.style.opacity || 1) - 0.015;
                            
                            if (parseFloat(particle.style.opacity) > 0 && posY < window.innerHeight + 100) {
                                requestAnimationFrame(animate);
                            } else {
                                particle.remove();
                            }
                        };
                        
                        requestAnimationFrame(animate);
                    }, i * 5);
                }
            }, wave.delay);
        });
        
        // 中央に衝撃波エフェクト
        this.createShockwave(centerX, centerY);
        
        this.showMiniNotification('💥 豪華パーティクル爆発！', '#f5576c');
    }

    createShockwave(x, y) {
        const shockwave = document.createElement('div');
        shockwave.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: 0;
            height: 0;
            border: 5px solid rgba(255, 255, 255, 0.8);
            border-radius: 50%;
            pointer-events: none;
            z-index: 10000;
            transform: translate(-50%, -50%);
            box-shadow: 
                0 0 20px rgba(255, 255, 255, 0.8),
                0 0 40px rgba(99, 102, 241, 0.6),
                0 0 60px rgba(139, 92, 246, 0.4);
        `;
        document.body.appendChild(shockwave);
        
        let size = 0;
        const maxSize = Math.max(window.innerWidth, window.innerHeight) * 1.5;
        
        const animate = () => {
            size += 30;
            const opacity = 1 - (size / maxSize);
            
            shockwave.style.width = size + 'px';
            shockwave.style.height = size + 'px';
            shockwave.style.opacity = opacity;
            shockwave.style.borderWidth = (10 * opacity) + 'px';
            
            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                shockwave.remove();
            }
        };
        
        requestAnimationFrame(animate);
    }
    */ // パーティクル爆発機能ここまで

    massLevelUp() {
        // スキルレベルを999に変更
        const levelBadges = document.querySelectorAll('.skill-level-badge');
        levelBadges.forEach((badge, index) => {
            setTimeout(() => {
                // レベルアップアニメーション
                badge.style.animation = 'levelUpPulse 0.5s ease-out';
                
                // レベル表示を999に変更
                const levelNumber = badge.querySelector('.level-number');
                if (levelNumber) {
                    levelNumber.textContent = 'Lv.999';
                }
                
                // EXPバーを100%に
                const expFill = badge.querySelector('.exp-fill');
                if (expFill) {
                    expFill.style.width = '100%';
                }
                
                // 経験値テキストも更新
                const expText = badge.querySelector('.exp-text');
                if (expText) {
                    expText.textContent = 'MAX!';
                }
                
                // レベルアップエフェクト
                const overlay = document.createElement('div');
                overlay.style.cssText = `
                    position: absolute;
                    top: -30px;
                    left: 50%;
                    transform: translateX(-50%);
                    color: #ffd700;
                    font-size: 28px;
                    font-weight: bold;
                    animation: levelUpFloat 1.5s ease-out forwards;
                    pointer-events: none;
                    z-index: 100;
                    text-shadow: 0 0 10px #ffd700, 0 0 20px #ffd700;
                `;
                overlay.textContent = 'LEVEL 999!';
                badge.style.position = 'relative';
                badge.appendChild(overlay);
                
                setTimeout(() => overlay.remove(), 1500);
            }, index * 100);
        });
        
        // AboutセクションのHP/MPを100%に
        setTimeout(() => {
            const hpFill = document.querySelector('.hp-fill');
            const mpFill = document.querySelector('.mp-fill');
            const hpValue = document.querySelector('.hp-bar .stat-value');
            const mpValue = document.querySelector('.mp-bar .stat-value');
            
            if (hpFill) {
                hpFill.style.transition = 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
                hpFill.style.width = '100%';
                hpFill.setAttribute('data-value', '100');
            }
            if (mpFill) {
                mpFill.style.transition = 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
                mpFill.style.width = '100%';
                mpFill.setAttribute('data-value', '100');
            }
            if (hpValue) {
                hpValue.textContent = '9999/9999';
            }
            if (mpValue) {
                mpValue.textContent = '9999/9999';
            }
            
            // 経験言語を全言語に拡張
            const expLanguages = document.querySelector('.exp-languages');
            if (expLanguages) {
                const allLanguages = [
                    'C', 'C++', 'C#', 'Java', 'Python', 'JavaScript', 'TypeScript',
                    'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'Scala',
                    'HTML', 'CSS', 'SQL', 'R', 'MATLAB', 'Perl', 'Lua',
                    'Haskell', 'Dart', 'Elixir', 'F#', 'Objective-C', 'Shell',
                    'Assembly', 'COBOL', 'Fortran', 'Lisp', 'Prolog', 'Julia'
                ];
                
                expLanguages.innerHTML = '';
                allLanguages.forEach((lang, index) => {
                    const langTag = document.createElement('span');
                    langTag.className = 'exp-lang';
                    langTag.textContent = lang;
                    langTag.style.animationDelay = `${index * 0.05}s`;
                    expLanguages.appendChild(langTag);
                });
            }
            
            // MAXエフェクト
            const gameStats = document.querySelector('.game-stats');
            if (gameStats) {
                const maxOverlay = document.createElement('div');
                maxOverlay.style.cssText = `
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0);
                    color: #ffd700;
                    font-size: 48px;
                    font-weight: bold;
                    text-shadow: 0 0 20px #ffd700, 0 0 40px #ffd700;
                    animation: maxBurst 1s ease-out forwards;
                    pointer-events: none;
                    z-index: 1000;
                `;
                maxOverlay.textContent = 'ALL MAX!';
                gameStats.style.position = 'relative';
                gameStats.appendChild(maxOverlay);
                
                setTimeout(() => maxOverlay.remove(), 1000);
            }
        }, 500);
        
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
            @keyframes maxBurst {
                0% { transform: translate(-50%, -50%) scale(0) rotate(-180deg); opacity: 0; }
                50% { transform: translate(-50%, -50%) scale(1.5) rotate(0deg); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        setTimeout(() => style.remove(), 3000);
        
        this.showMiniNotification('ALL STATS MAXED', '#00f2fe');
    }

    showSecretMessage() {
        const messages = [
            '隠しコマンドを見つけてくださりありがとうございます。',
            'ほかにも１つあるのでぜひ見つけてみてください！'
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

    toggleRainbowMode() {
        if (this.rainbowActive) {
            // レインボーモード解除
            const cards = document.querySelectorAll('.work-card, .skill');
            cards.forEach(card => card.style.animation = '');
            const rainbowStyle = document.querySelector('style[data-wine-rainbow]');
            if (rainbowStyle) rainbowStyle.remove();
            this.rainbowActive = false;
            this.showMiniNotification('RAINBOW MODE OFF', '#ee0979');
        } else {
            // レインボーモード有効化
            this.rainbowCards();
            this.rainbowActive = true;
            this.showMiniNotification('RAINBOW MODE ON', '#ee0979');
        }
    }

    toggleGlitchEffect() {
        if (this.glitchActive) {
            // グリッチエフェクト解除
            const elements = document.querySelectorAll('.section__title, .work-card__title, .skill__name');
            elements.forEach(el => el.style.animation = '');
            const style = document.querySelector('style[data-glitch]');
            if (style) style.remove();
            this.glitchActive = false;
            this.showMiniNotification('GLITCH EFFECT OFF', '#8e2de2');
        } else {
            // グリッチエフェクト有効化
            const elements = document.querySelectorAll('.section__title, .work-card__title, .skill__name');
            
            elements.forEach((el, index) => {
                setTimeout(() => {
                    el.style.animation = 'glitch 0.5s infinite';
                }, index * 50);
            });

            const style = document.createElement('style');
            style.setAttribute('data-glitch', 'true');
            style.textContent = `
                @keyframes glitch {
                    0%, 100% { 
                        transform: translate(0);
                        text-shadow: 0 0 10px currentColor;
                    }
                    20% { 
                        transform: translate(-5px, 5px);
                        text-shadow: -5px 0 10px #ff00de, 5px 0 10px #00ffff;
                    }
                    40% { 
                        transform: translate(5px, -5px);
                        text-shadow: 5px 0 10px #00ffff, -5px 0 10px #ff00de;
                    }
                    60% { 
                        transform: translate(-5px, -5px);
                        text-shadow: -5px 0 10px #ff00de, 5px 0 10px #00ffff;
                    }
                    80% { 
                        transform: translate(5px, 5px);
                        text-shadow: 5px 0 10px #00ffff, -5px 0 10px #ff00de;
                    }
                }
            `;
            document.head.appendChild(style);
            
            this.glitchActive = true;
            this.showMiniNotification('GLITCH EFFECT ON', '#8e2de2');
        }
    }

    activateVirusMode() {
        if (this.virusActive) return;
        
        this.virusActive = true;
        
        // ウイルス感染画面オーバーレイ
        const virusOverlay = document.createElement('div');
        virusOverlay.className = 'virus-overlay';
        virusOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(255, 0, 0, 0.3);
            z-index: 10010;
            pointer-events: none;
            animation: virusFlash 0.3s infinite;
        `;
        document.body.appendChild(virusOverlay);
        
        // ウイルス警告画面
        const virusAlert = document.createElement('div');
        virusAlert.className = 'virus-alert';
        virusAlert.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #d31027, #ea384d);
            color: white;
            padding: 50px;
            border-radius: 20px;
            z-index: 10011;
            text-align: center;
            box-shadow: 0 20px 60px rgba(211, 16, 39, 0.8);
            border: 5px solid #ff0000;
            animation: virusShake 0.5s infinite;
            max-width: 600px;
        `;
        virusAlert.innerHTML = `
            <div style="font-size: 80px; margin-bottom: 20px;">⚠️</div>
            <div style="font-size: 36px; font-weight: bold; margin-bottom: 20px;">VIRUS DETECTED!</div>
            <div style="font-size: 24px; margin-bottom: 30px;">システムが感染しました</div>
            <div style="font-size: 18px; color: #ffcccc; margin-bottom: 20px;">
                Press ESC to remove virus<br>
                または画面をクリックして回避
            </div>
            <div class="virus-progress" style="width: 100%; height: 30px; background: rgba(0,0,0,0.3); border-radius: 15px; overflow: hidden; margin-top: 20px;">
                <div class="virus-progress-bar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #ff0000, #ff6666); animation: virusProgress 10s linear forwards;"></div>
            </div>
            <div style="font-size: 14px; margin-top: 15px; color: #ffcccc;">
                Virus spreading... <span class="virus-percentage">0%</span>
            </div>
        `;
        document.body.appendChild(virusAlert);
        
        // クリックで回避
        virusAlert.style.pointerEvents = 'auto';
        virusAlert.style.cursor = 'pointer';
        virusAlert.addEventListener('click', () => this.deactivateVirusMode());
        
        // パーセンテージ更新
        let percentage = 0;
        const percentageInterval = setInterval(() => {
            percentage += 1;
            const percentageEl = document.querySelector('.virus-percentage');
            if (percentageEl) {
                percentageEl.textContent = `${percentage}%`;
            }
            if (percentage >= 100 || !this.virusActive) {
                clearInterval(percentageInterval);
                if (percentage >= 100) {
                    this.virusFullInfection();
                }
            }
        }, 100);
        
        // ウイルスパーティクル
        this.createVirusParticles();
        
        // スタイル追加
        const style = document.createElement('style');
        style.setAttribute('data-virus', 'true');
        style.textContent = `
            @keyframes virusFlash {
                0%, 100% { opacity: 0.3; }
                50% { opacity: 0.6; }
            }
            @keyframes virusShake {
                0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
                25% { transform: translate(-48%, -50%) rotate(-2deg); }
                50% { transform: translate(-50%, -48%) rotate(0deg); }
                75% { transform: translate(-52%, -50%) rotate(2deg); }
            }
            @keyframes virusProgress {
                0% { width: 0%; }
                100% { width: 100%; }
            }
            @keyframes virusParticleFall {
                0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
                100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        this.showMiniNotification('VIRUS MODE ACTIVATED', '#d31027');
        
        // コンソールログ
        console.log('%c⚠️ WARNING: VIRUS DETECTED', 'color: #ff0000; font-size: 24px; font-weight: bold; background: #000; padding: 10px;');
        console.log('%cPress ESC to remove virus', 'color: #ff6666; font-size: 16px;');
    }

    createVirusParticles() {
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'virus-particle';
                particle.style.cssText = `
                    position: fixed;
                    left: ${Math.random() * 100}vw;
                    top: -50px;
                    width: 30px;
                    height: 30px;
                    background: radial-gradient(circle, #ff0000, #d31027);
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 10009;
                    animation: virusParticleFall ${3 + Math.random() * 4}s linear infinite;
                    animation-delay: ${Math.random() * 2}s;
                    opacity: 0.8;
                    box-shadow: 0 0 20px #ff0000;
                `;
                particle.textContent = '☠️';
                particle.style.fontSize = '20px';
                particle.style.display = 'flex';
                particle.style.alignItems = 'center';
                particle.style.justifyContent = 'center';
                document.body.appendChild(particle);
            }, i * 100);
        }
    }

    virusFullInfection() {
        // 完全感染演出
        const fullScreen = document.createElement('div');
        fullScreen.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: linear-gradient(135deg, #d31027, #000000);
            z-index: 10012;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: white;
            animation: virusFlash 0.5s infinite;
        `;
        fullScreen.innerHTML = `
            <div style="font-size: 100px; margin-bottom: 30px;">💀</div>
            <div style="font-size: 48px; font-weight: bold; margin-bottom: 20px;">SYSTEM INFECTED</div>
            <div style="font-size: 24px;">Press ESC to restart...</div>
        `;
        document.body.appendChild(fullScreen);
    }

    deactivateVirusMode() {
        if (!this.virusActive) return;
        
        this.virusActive = false;
        
        // すべてのウイルス要素を削除
        document.querySelectorAll('.virus-overlay, .virus-alert, .virus-particle').forEach(el => {
            el.style.transition = 'all 0.5s';
            el.style.opacity = '0';
            setTimeout(() => el.remove(), 500);
        });
        
        const virusStyle = document.querySelector('style[data-virus]');
        if (virusStyle) virusStyle.remove();
        
        this.showMiniNotification('VIRUS REMOVED ✓', '#10b981');
        console.log('%c✓ Virus removed successfully', 'color: #10b981; font-size: 18px; font-weight: bold;');
    }
}
