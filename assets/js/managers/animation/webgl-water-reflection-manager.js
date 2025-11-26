/* ===================================
   WebGL水面反射システムマネージャー
   Three.jsを使用したリアルな水面演出
   =================================== */
class WebGLWaterReflectionManager {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.textMeshes = [];
        this.animationId = null;
        this.isInitialized = false;
        
        // 動的配置計算用
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;
        this.letterSpacing = 1.2; // 間隔を広げる
        this.totalLetters = 6;
    }

    async init() {
        try {
            // WebGLサポートチェック
            if (!this.isWebGLSupported()) {
                console.warn('WebGL is not supported on this device, falling back to CSS version');
                this.showCSSVersion();
                return;
            }
            
            // Three.jsがロードされているかチェック
            if (typeof THREE === 'undefined') {
                await this.loadThreeJS();
            }
            
            this.setupScene();
            this.createTextMeshes(); // 簡素化したテキスト
            this.startAnimation();
            
            this.isInitialized = true;
            
            // 成功した場合、CSS版を隠す
            this.hideCSSVersion();
            
            // トランプカード演出を開始
            setTimeout(() => {
                this.animateLettersIn();
            }, 1000); // 1秒後に開始
            
            // インタラクション機能を設定
            this.setupInteractions();
            
            // ウィンドウリサイズ対応
            this.setupWindowResize();
            
            // スクロール監視を設定
            this.setupScrollObserver();
            
        } catch (error) {
            console.warn('WebGL initialization failed, falling back to CSS version:', error);
            this.fallbackToCSS();
        }
    }

    isWebGLSupported() {
        try {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            if (!context) {
                console.log('WebGL context not available');
                return false;
            }
            
            // 基本的なWebGL機能をテスト
            const renderer = context.getParameter(context.RENDERER);
            const vendor = context.getParameter(context.VENDOR);
            
            console.log('WebGL Renderer:', renderer);
            console.log('WebGL Vendor:', vendor);
            
            // ソフトウェアレンダリング検出
            if (renderer && (renderer.toLowerCase().includes('software') || 
                           renderer.toLowerCase().includes('swiftshader') ||
                           renderer.toLowerCase().includes('microsoft basic'))) {
                console.warn('Software rendering detected, may have performance issues');
                return false; // ソフトウェアレンダリングでは重い処理を避ける
            }
            
            return true;
        } catch (error) {
            console.error('WebGL support check failed:', error);
            return false;
        }
    }

    isMobileDevice() {
        // より詳細なモバイルデバイス検出
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        
        // モバイルデバイスの検出
        const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
        
        // タッチスクリーンの検出
        const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        
        // 画面サイズによる判定
        const isSmallScreen = window.innerWidth <= 768;
        
        const result = isMobile || (isTouchDevice && isSmallScreen);
        console.log('Mobile device check - UserAgent:', isMobile, 'Touch:', isTouchDevice, 'SmallScreen:', isSmallScreen, 'Result:', result);
        
        return result;
    }

    showCSSVersion() {
        // CSS版を表示する
        const heroContent = document.querySelector('.hero__content');
        const titleContainer = document.querySelector('.hero__title-container');
        const titleLetters = document.querySelector('.hero__title-letters');
        const titleReflection = document.querySelector('.hero__title-reflection');
        
        if (heroContent) {
            heroContent.style.display = 'block';
            heroContent.style.opacity = '1';
        }
        
        if (titleContainer) {
            titleContainer.style.display = 'block';
            titleContainer.style.opacity = '1';
        }
        
        if (titleLetters) {
            titleLetters.style.display = 'flex';
            titleLetters.style.opacity = '1';
        }
        
        if (titleReflection) {
            titleReflection.style.display = 'flex';
            titleReflection.style.opacity = '0.8';
        }
        
        console.log('Showing CSS fallback version with all elements visible');
    }

    async loadThreeJS() {
        return new Promise((resolve, reject) => {
            // Three.js本体を最新の安定版CDNから読み込み（警告を回避）
            const threeScript = document.createElement('script');
            threeScript.src = 'https://unpkg.com/three@0.158.0/build/three.min.js';
            threeScript.crossOrigin = 'anonymous';
            
            threeScript.onload = () => {
                console.log('Three.js loaded successfully');
                // 簡単なテスト
                if (typeof THREE !== 'undefined') {
                    resolve();
                } else {
                    reject(new Error('Three.js object not found'));
                }
            };
            
            threeScript.onerror = (error) => {
                console.error('Failed to load Three.js:', error);
                reject(error);
            };
            
            document.head.appendChild(threeScript);
        });
    }

    // 文字配置テスト（まず一番左に配置）
    calculateCenterPosition(index) {
        // モバイル対応: 画面サイズに応じて位置を調整
        const screenWidth = window.innerWidth;
        const isMobile = this.isMobileDevice();
        
        // 画面サイズに応じて文字間隔を調整
        let positionScale = 1.0;
        
        if (screenWidth <= 360) {
            positionScale = 0.4;
        } else if (screenWidth <= 480) {
            positionScale = 0.55;
        } else if (screenWidth <= 768) {
            positionScale = 0.7;
        } else if (isMobile) {
            positionScale = 0.8;
        }
        
        // 基本位置を画面サイズに合わせてスケール
        const basePositions = [
            -4.5,  // W (0)
            -2.7,  // I (1)
            -0.9,  // N (2)
             0.9,  // E (3)
             2.7,  // - (4)
             4.5   // 5 (5)
        ];
        
        // インデックスの安全性チェック
        if (!Number.isInteger(index) || index < 0 || index >= basePositions.length) {
            console.warn(`Invalid index ${index}, returning center position`);
            return { x: 0, y: 0.5, z: 0 };
        }
        
        const x = basePositions[index] * positionScale;
        console.log(`Letter ${index}: RESPONSIVE position x=${x} (scale=${positionScale}, screen=${screenWidth}px)`);
        
        return {
            x: x,
            y: 0.5,
            z: 0
        };
    }
    
    // 左端からの開始位置を計算（演出用）
    calculateStartPosition() {
        // WebGLの座標系では、画面の幅に対応する適切な左端位置を計算
        // カメラのfov(75度)とz位置(6)から画面端の座標を計算
        const fov = 75 * Math.PI / 180; // ラジアンに変換
        const distance = 6; // カメラのz位置
        const height = 2 * Math.tan(fov / 2) * distance;
        const width = height * (this.windowWidth / this.windowHeight);
        
        const screenLeft = -width / 2;
        console.log(`Screen dimensions: width=${width}, height=${height}, left=${screenLeft}`);
        
        return screenLeft - 3; // 画面左端より3単位左に
    }

    setupScene() {
        // Canvas要素を作成
        const canvas = document.createElement('canvas');
        canvas.id = 'webgl-water-canvas';
        canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 1;
            background: transparent;
        `;
        
        // ヒーローセクションに追加
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            heroSection.appendChild(canvas);
        } else {
            // フォールバック: ヒーローセクションが見つからない場合はbodyに追加
            document.body.appendChild(canvas);
        }

        // 画面全体のサイズを使用
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        console.log(`Screen size: ${screenWidth} x ${screenHeight}`);

        // Three.js基本設定 - 画面全体のサイズを使用
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(90, screenWidth / screenHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            alpha: true,
            antialias: true 
        });
        
        this.renderer.setSize(screenWidth, screenHeight);
        
        // モバイル最適化
        if (this.isMobileDevice()) {
            // モバイルではピクセル比を制限してパフォーマンスを向上
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
            // シャドウマップを無効化
            this.renderer.shadowMap.enabled = false;
            console.log('Mobile optimizations applied');
        } else {
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }
        
        // カメラ位置
        this.camera.position.set(0, 0, 6);
        this.camera.lookAt(0, 0, 0); // 中央を見る
    }





    setupReflection() {
        // 反射用のレンダーターゲット
        this.reflectionRenderTarget = new THREE.WebGLRenderTarget(512, 512);
        
        // 反射用カメラ
        this.reflectionCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    }

    createTextMeshes() {
        const letters = ['w', 'i', 'n', 'e', '-', '5'];
        
        // 文字「i」のサイズに合わせたカードサイズ（大きくする）
        const cardWidth = 1.2;
        const cardHeight = 1.8;  // 「i」が最も縦長なので、これを基準に大きくする
        
        letters.forEach((letter, index) => {
            // グループを作成（文字とカードをまとめる）
            const letterGroup = new THREE.Group();
            
            // 1. 文字のメッシュ作成（文字に応じたサイズ調整）
            let textGeometry;
            
            // 文字ごとに異なる形状を作成
            switch(letter) {
                case 'w':
                    textGeometry = this.createLetterW();
                    console.log(`Created letter W with ${textGeometry.children.length} parts`);
                    break;
                case 'i':
                    textGeometry = this.createLetterI();
                    console.log(`Created letter I with ${textGeometry.children.length} parts`);
                    break;
                case 'n':
                    textGeometry = this.createLetterN();
                    console.log(`Created letter N with ${textGeometry.children.length} parts`);
                    break;
                case 'e':
                    textGeometry = this.createLetterE();
                    console.log(`Created letter E with ${textGeometry.children.length} parts`);
                    break;
                case '-':
                    textGeometry = this.createLetterDash();
                    console.log(`Created letter - with ${textGeometry.children.length} parts`);
                    break;
                case '5':
                    textGeometry = this.createLetter5();
                    console.log(`Created letter 5 with ${textGeometry.children.length} parts`);
                    break;
                default:
                    textGeometry = new THREE.BoxGeometry(0.3, 0.5, 0.1);
                    console.log(`Created default geometry for ${letter}`);
            }
            
            // textGeometryは既にGroupオブジェクトなので、直接追加
            textGeometry.castShadow = true;
            textGeometry.receiveShadow = true;
            letterGroup.add(textGeometry);
            
            // 3. グループの初期位置設定（動的中央配置）
            const centerPos = this.calculateCenterPosition(index);
            letterGroup.position.copy(centerPos);
            
            console.log(`Letter ${letter} (${index}) positioned at:`, centerPos);
            console.log(`Letter ${letter} group children count:`, letterGroup.children.length);
            console.log(`Letter ${letter} visible:`, letterGroup.visible);
            console.log(`Letter ${letter} scale:`, letterGroup.scale);
            
            // 4. 初期状態は非表示（各文字に個別の開始位置）
            letterGroup.visible = false;
            const baseStartX = this.calculateStartPosition();
            const startX = baseStartX - (index * 2); // 各文字をずらして配置
            letterGroup.position.x = startX;
            
            console.log(`Letter ${letter} (${index}) start position: x=${startX}`);
            
            // 5. アニメーション用のプロパティを追加
            letterGroup.userData = {
                letter: letter,
                index: index,
                targetPosition: centerPos, // 動的に計算された中央位置
                textMesh: textGeometry, // textGeometryはGroupオブジェクト
                animationState: 'waiting' // waiting, flying, completed
            };
            
            this.textMeshes.push(letterGroup);
            this.scene.add(letterGroup);
            console.log(`Added letter ${letter} to scene. Scene children count:`, this.scene.children.length);
        });
        
        console.log('Trump card text system created:', this.textMeshes.length);
    }

    // 各文字の形状作成メソッド
    createLetterW() {
        const group = new THREE.Group();
        
        // W字を4本の線で構成（大きくする）
        const lineGeometry = new THREE.BoxGeometry(0.08, 0.8, 0.15);
        const positions = [
            { x: -0.25, y: 0, rotation: 0.3 },  // 左の線
            { x: -0.08, y: 0, rotation: -0.3 }, // 左中の線
            { x: 0.08, y: 0, rotation: 0.3 },   // 右中の線
            { x: 0.25, y: 0, rotation: -0.3 }   // 右の線
        ];
        
        const lineMaterial = new THREE.MeshBasicMaterial({
            color: 0x6366f1,
            // emissive: 0x4f46e5,
            // emissiveIntensity: 0.3,
            // shininess: 100
        });
        
        positions.forEach(pos => {
            const line = new THREE.Mesh(lineGeometry.clone(), lineMaterial);
            line.position.set(pos.x, pos.y, 0);
            line.rotation.z = pos.rotation;
            line.castShadow = true;
            line.receiveShadow = true;
            group.add(line);
        });
        
        return group;
    }
    
    createLetterI() {
        const group = new THREE.Group();
        
        // I字を3つのパーツで構成（大きくする）
        const verticalGeometry = new THREE.BoxGeometry(0.08, 0.6, 0.15);
        const horizontalGeometry = new THREE.BoxGeometry(0.3, 0.08, 0.15);
        
        const material = new THREE.MeshBasicMaterial({
            color: 0x6366f1
        });
        
        // 真ん中の縦線
        const vertical = new THREE.Mesh(verticalGeometry, material);
        vertical.position.set(0, 0, 0);
        vertical.castShadow = true;
        vertical.receiveShadow = true;
        group.add(vertical);
        
        // 上の横線
        const top = new THREE.Mesh(horizontalGeometry, material);
        top.position.set(0, 0.26, 0);
        top.castShadow = true;
        top.receiveShadow = true;
        group.add(top);
        
        // 下の横線
        const bottom = new THREE.Mesh(horizontalGeometry, material);
        bottom.position.set(0, -0.26, 0);
        bottom.castShadow = true;
        bottom.receiveShadow = true;
        group.add(bottom);
        
        return group;
    }
    
    createLetterN() {
        const group = new THREE.Group();
        
        // N字を3本の線で構成（大きくする）
        const verticalGeometry = new THREE.BoxGeometry(0.08, 0.8, 0.15);
        const diagonalGeometry = new THREE.BoxGeometry(0.08, 0.9, 0.15);
        
        const material = new THREE.MeshBasicMaterial({
            color: 0x6366f1
        });
        
        // 左の縦線
        const left = new THREE.Mesh(verticalGeometry, material);
        left.position.set(-0.15, 0, 0);
        left.castShadow = true;
        left.receiveShadow = true;
        group.add(left);
        
        // 斜めの線
        const diagonal = new THREE.Mesh(diagonalGeometry, material);
        diagonal.position.set(0, 0, 0);
        diagonal.rotation.z = 0.5;
        diagonal.castShadow = true;
        diagonal.receiveShadow = true;
        group.add(diagonal);
        
        // 右の縦線
        const right = new THREE.Mesh(verticalGeometry, material);
        right.position.set(0.15, 0, 0);
        right.castShadow = true;
        right.receiveShadow = true;
        group.add(right);
        
        return group;
    }
    
    createLetterE() {
        const group = new THREE.Group();
        
        // E字を4本の線で構成（大きくする）
        const verticalGeometry = new THREE.BoxGeometry(0.08, 0.8, 0.15);
        const horizontalGeometry = new THREE.BoxGeometry(0.25, 0.08, 0.15);
        
        const material = new THREE.MeshBasicMaterial({
            color: 0x6366f1
        });
        
        // 左の縦線
        const vertical = new THREE.Mesh(verticalGeometry, material);
        vertical.position.set(-0.12, 0, 0);
        vertical.castShadow = true;
        vertical.receiveShadow = true;
        group.add(vertical);
        
        // 上の横線
        const top = new THREE.Mesh(horizontalGeometry, material);
        top.position.set(0, 0.36, 0);
        top.castShadow = true;
        top.receiveShadow = true;
        group.add(top);
        
        // 真ん中の横線
        const middle = new THREE.Mesh(horizontalGeometry.clone(), material);
        middle.scale.x = 0.8;
        middle.position.set(-0.025, 0, 0);
        middle.castShadow = true;
        middle.receiveShadow = true;
        group.add(middle);
        
        // 下の横線
        const bottom = new THREE.Mesh(horizontalGeometry, material);
        bottom.position.set(0, -0.36, 0);
        bottom.castShadow = true;
        bottom.receiveShadow = true;
        group.add(bottom);
        
        return group;
    }
    
    createLetterDash() {
        const group = new THREE.Group();
        const dashGeometry = new THREE.BoxGeometry(0.3, 0.08, 0.15);
        const material = new THREE.MeshBasicMaterial({
            color: 0x6366f1
        });
        const dash = new THREE.Mesh(dashGeometry, material);
        dash.castShadow = true;
        dash.receiveShadow = true;
        group.add(dash);
        return group;
    }
    
    createLetter5() {
        const group = new THREE.Group();
        
        // 5字を複数のパーツで構成（大きくする）
        const horizontalGeometry = new THREE.BoxGeometry(0.25, 0.08, 0.15);
        const verticalGeometry = new THREE.BoxGeometry(0.08, 0.3, 0.15);
        
        const material = new THREE.MeshBasicMaterial({
            color: 0x6366f1
        });
        
        // 上の横線
        const top = new THREE.Mesh(horizontalGeometry, material);
        top.position.set(0, 0.36, 0);
        top.castShadow = true;
        top.receiveShadow = true;
        group.add(top);
        
        // 左の上縦線
        const leftTop = new THREE.Mesh(verticalGeometry, material);
        leftTop.position.set(-0.12, 0.18, 0);
        leftTop.castShadow = true;
        leftTop.receiveShadow = true;
        group.add(leftTop);
        
        // 真ん中の横線
        const middle = new THREE.Mesh(horizontalGeometry, material);
        middle.position.set(0, 0, 0);
        middle.castShadow = true;
        middle.receiveShadow = true;
        group.add(middle);
        
        // 右の下縦線
        const rightBottom = new THREE.Mesh(verticalGeometry, material);
        rightBottom.position.set(0.12, -0.18, 0);
        rightBottom.castShadow = true;
        rightBottom.receiveShadow = true;
        group.add(rightBottom);
        
        // 下の横線
        const bottom = new THREE.Mesh(horizontalGeometry, material);
        bottom.position.set(0, -0.36, 0);
        bottom.castShadow = true;
        bottom.receiveShadow = true;
        group.add(bottom);
        
        return group;
    }



    startAnimation() {
        let lastTime = 0;
        const targetFPS = this.isMobileDevice() ? 30 : 60; // モバイルでは30FPS
        const frameInterval = 1000 / targetFPS;
        
        const animate = (currentTime) => {
            this.animationId = requestAnimationFrame(animate);
            
            // フレームレート制限
            if (currentTime - lastTime < frameInterval) {
                return;
            }
            lastTime = currentTime;
            
            const time = currentTime * 0.001;
            
            // テキストグループの微細な浮遊アニメーション（完了後のみ）
            this.textMeshes.forEach((letterGroup, index) => {
                if (letterGroup.visible && letterGroup.userData.animationState === 'completed') {
                    const baseY = 0.5; // 中央の高さに設定
                    letterGroup.position.y = baseY + Math.sin(time * 1.5 + index * 0.3) * 0.05;
                    letterGroup.userData.textMesh.rotation.y = Math.sin(time * 0.8 + index) * 0.05;
                }
            });
            
            this.render();
        };
        
        animate();
    }

    render() {
        if (!this.renderer || !this.scene || !this.camera) return;
        this.renderer.render(this.scene, this.camera);
    }

    // CSS版を隠すメソッド
    hideCSSVersion() {
        const cssWaterElement = document.querySelector('.water-reflection-title');
        if (cssWaterElement) {
            cssWaterElement.style.display = 'none';
            console.log('CSS water reflection hidden');
        }
    }

    // CSS版へのフォールバック
    fallbackToCSS() {
        console.log('Using CSS fallback for water reflection');
        // 既存のCSS版を有効化
        const cssManager = new WaterReflectionTitleManager();
        cssManager.init();
    }

    // トランプカード演出付きの文字アニメーション
    animateLettersIn() {
        console.log('Starting letter animations...');
        this.textMeshes.forEach((letterGroup, index) => {
            const delay = index * 300; // 300ms間隔で順番に開始
            console.log(`Letter ${letterGroup.userData.letter} will start in ${delay}ms`);
            setTimeout(() => {
                this.animateLetterWithCard(letterGroup);
            }, delay);
        });
    }

    animateLetterWithCard(letterGroup) {
        const userData = letterGroup.userData;
        const textMesh = userData.textMesh;
        
        // 1. 左からの飛び込みアニメーション
        letterGroup.visible = true;
        userData.animationState = 'flying';
        
        // 初期位置設定（左の遠く）
        letterGroup.position.set(-20, 0.5, -2);
        letterGroup.rotation.set(0, -Math.PI / 4, 0); // 少し回転した状態で飛び込む
        // モバイル対応: 初期スケールも画面サイズに応じて調整
        const screenWidth = window.innerWidth;
        const isMobile = this.isMobileDevice();
        
        let initialScale = 0.3;
        if (screenWidth <= 360) {
            initialScale = 0.15;
        } else if (screenWidth <= 480) {
            initialScale = 0.2;
        } else if (screenWidth <= 768) {
            initialScale = 0.25;
        } else if (isMobile) {
            initialScale = 0.28;
        }
        
        letterGroup.scale.set(initialScale, initialScale, initialScale);
        
        // 飛び込みアニメーション
        this.animateCardFlyIn(letterGroup);
    }

    animateCardFlyIn(letterGroup) {
        const userData = letterGroup.userData;
        const duration = 1000;
        const startTime = performance.now();
        
        const startPos = { x: letterGroup.position.x, y: letterGroup.position.y, z: letterGroup.position.z };
        const startRot = { y: letterGroup.rotation.y };
        const startScale = letterGroup.scale.x;
        
        const targetPos = userData.targetPosition; // 動的に計算された位置を使用
        const targetRot = { y: 0 };
        // モバイル対応: 最終スケールも調整
        const screenWidth = window.innerWidth;
        const isMobile = this.isMobileDevice();
        
        let targetScale = 1.0;
        if (screenWidth <= 360) {
            targetScale = 0.5;
        } else if (screenWidth <= 480) {
            targetScale = 0.65;
        } else if (screenWidth <= 768) {
            targetScale = 0.8;
        } else if (isMobile) {
            targetScale = 0.9;
        }
        
        const flyAnimate = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // イージング（弾むような効果）
            const eased = this.easeOutBounce(progress);
            
            // 位置のアニメーション
            letterGroup.position.x = startPos.x + (targetPos.x - startPos.x) * eased;
            letterGroup.position.y = startPos.y + (targetPos.y - startPos.y) * eased + Math.sin(progress * Math.PI * 2) * 0.3;
            letterGroup.position.z = startPos.z + (targetPos.z - startPos.z) * eased;
            
            // 回転のアニメーション
            letterGroup.rotation.y = startRot.y + (targetRot.y - startRot.y) * eased;
            
            // スケールのアニメーション
            letterGroup.scale.setScalar(startScale + (targetScale - startScale) * eased);
            
            if (progress < 1) {
                requestAnimationFrame(flyAnimate);
            } else {
                // 飛び込み完了
                userData.animationState = 'completed';
            }
        };
        
        flyAnimate();
    }























    // インタラクション設定
    setupInteractions() {
        const canvas = document.getElementById('webgl-water-canvas');
        if (!canvas) return;

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        // マウス移動イベント
        canvas.addEventListener('mousemove', (event) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, this.camera);
            const intersects = raycaster.intersectObjects(this.getInteractableObjects());

            // ホバー効果
            this.textMeshes.forEach(letterGroup => {
                if (letterGroup.userData.animationState === 'completed') {
                    const isHovered = intersects.some(intersect => 
                        letterGroup.children.includes(intersect.object) || 
                        intersect.object === letterGroup
                    );
                    
                    if (isHovered && !letterGroup.userData.isHovered) {
                        letterGroup.userData.isHovered = true;
                        this.animateHover(letterGroup, true);
                    } else if (!isHovered && letterGroup.userData.isHovered) {
                        letterGroup.userData.isHovered = false;
                        this.animateHover(letterGroup, false);
                    }
                }
            });
        });

        // クリックイベント
        canvas.addEventListener('click', (event) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, this.camera);
            const intersects = raycaster.intersectObjects(this.getInteractableObjects());

            if (intersects.length > 0) {
                // 再演出を開始
                this.resetAndReplay();
            }
        });
    }

    // インタラクション可能なオブジェクトを取得
    getInteractableObjects() {
        const objects = [];
        this.textMeshes.forEach(letterGroup => {
            if (letterGroup.userData.animationState === 'completed') {
                letterGroup.children.forEach(child => {
                    if (child !== letterGroup.userData.cardFrame) {
                        objects.push(child);
                    }
                });
            }
        });
        return objects;
    }

    // ホバーアニメーション
    animateHover(letterGroup, isHovering) {
        const targetScale = isHovering ? 1.2 : 1.0;
        const targetY = isHovering ? 0.7 : 0.5;
        
        const duration = 300;
        const startTime = performance.now();
        const startScale = letterGroup.scale.x;
        const startY = letterGroup.position.y;

        const animate = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);

            letterGroup.scale.setScalar(startScale + (targetScale - startScale) * eased);
            letterGroup.position.y = startY + (targetY - startY) * eased;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    // ウィンドウリサイズ対応
    setupWindowResize() {
        window.addEventListener('resize', () => {
            // 画面全体のサイズを取得
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            
            // ウィンドウサイズを更新
            this.windowWidth = screenWidth;
            this.windowHeight = screenHeight;
            
            // レンダラーサイズを更新
            this.renderer.setSize(screenWidth, screenHeight);
            
            // カメラのアスペクト比を更新
            this.camera.aspect = screenWidth / screenHeight;
            this.camera.updateProjectionMatrix();
            
            // 文字位置とスケールを再計算
            this.updateLetterPositionsAndScale();
        });
    }

    // 文字位置を再計算・更新
    updateLetterPositions() {
        this.textMeshes.forEach((letterGroup, index) => {
            if (letterGroup.userData.animationState === 'completed') {
                const newPos = this.calculateCenterPosition(index);
                letterGroup.userData.targetPosition = newPos;
                
                // スムーズに新しい位置に移動
                this.animateToNewPosition(letterGroup, newPos);
            }
        });
        
        // カメラの向きも更新 - 画面中央を見る
        this.camera.lookAt(0, 0.5, 0);
    }

    updateLetterPositionsAndScale() {
        const screenWidth = window.innerWidth;
        const isMobile = this.isMobileDevice();
        
        // スケール計算
        let targetScale = 1.0;
        if (screenWidth <= 360) {
            targetScale = 0.5;
        } else if (screenWidth <= 480) {
            targetScale = 0.65;
        } else if (screenWidth <= 768) {
            targetScale = 0.8;
        } else if (isMobile) {
            targetScale = 0.9;
        }
        
        console.log(`Updating letter scale for screen ${screenWidth}px: ${targetScale}`);
        
        this.textMeshes.forEach((letterGroup, index) => {
            // 位置を更新
            const newPos = this.calculateCenterPosition(index);
            
            if (letterGroup.userData.animationState === 'completed') {
                letterGroup.userData.targetPosition = newPos;
                this.animateToNewPosition(letterGroup, newPos);
                
                // スケールを更新
                letterGroup.scale.set(targetScale, targetScale, targetScale);
            }
        });
        
        // カメラの向きも更新
        this.camera.lookAt(0, 0.5, 0);
    }





    // 新しい位置へのアニメーション
    animateToNewPosition(letterGroup, targetPos) {
        const duration = 500;
        const startTime = performance.now();
        const startPos = letterGroup.position.clone();

        const animate = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);

            letterGroup.position.lerpVectors(startPos, targetPos, eased);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    // 再演出機能
    resetAndReplay() {
        // 文字を初期状態にリセット
        this.textMeshes.forEach((letterGroup, index) => {
            letterGroup.visible = false;
            letterGroup.position.x = this.calculateStartPosition(); // 動的開始位置
            letterGroup.scale.setScalar(1);
            letterGroup.userData.animationState = 'waiting';
            letterGroup.userData.isHovered = false;
            
            // 目標位置を再計算
            letterGroup.userData.targetPosition = this.calculateCenterPosition(index);
        });

        // 演出を再開始
        setTimeout(() => {
            this.animateLettersIn();
        }, 500);
    }

    // イージング関数
    easeOutBounce(t) {
        if (t < 1 / 2.75) {
            return 7.5625 * t * t;
        } else if (t < 2 / 2.75) {
            return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
        } else if (t < 2.5 / 2.75) {
            return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
        } else {
            return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
        }
    }







    // クリーンアップ
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        const canvas = document.getElementById('webgl-water-canvas');
        if (canvas) {
            canvas.remove();
        }
    }

    // スクロール監視を設定
    setupScrollObserver() {
        const heroSection = document.querySelector('.hero');
        if (!heroSection) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const canvas = document.getElementById('webgl-water-canvas');
                if (canvas) {
                    if (entry.isIntersecting) {
                        // ヒーローセクションが表示されている時はキャンバスを表示
                        canvas.style.display = 'block';
                    } else {
                        // ヒーローセクションが非表示の時はキャンバスを隠す
                        canvas.style.display = 'none';
                    }
                }
            });
        }, {
            // 少しでもセクションが見えたら表示、完全に隠れたら非表示
            threshold: 0.1
        });

        observer.observe(heroSection);
    }
}