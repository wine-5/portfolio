/* ===================================
   WebGL水面反射システムマネージャー
   Three.jsを使用したリアルな水面演出
   =================================== */
class WebGLWaterReflectionManager {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.water = null;
        this.textMeshes = [];
        this.reflectionMeshes = []; // 独立した反射文字管理
        this.particles = [];
        this.lightRings = [];
        this.reflectionCamera = null;
        this.reflectionRenderTarget = null;
        this.animationId = null;
        this.isInitialized = false;
        
        // 動的配置計算用
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;
        this.letterSpacing = 1.2; // 間隔を広げる
        this.totalLetters = 6;
        
        // 定期波紋効果の管理
        this.ambientRipples = [];
        this.lastRippleTime = 0;
        this.rippleInterval = 3000; // 3秒ごとに波紋
        this.allAnimationsCompleted = false;
    }

    async init() {
        try {
            console.log('Initializing WebGL Water Reflection System...');
            
            // WebGLサポートチェック
            if (!this.isWebGLSupported()) {
                console.warn('WebGL is not supported on this device, falling back to CSS version');
                this.showCSSVersion();
                return;
            }
            
            // モバイルデバイスチェック
            if (this.isMobileDevice()) {
                console.log('Mobile device detected, using optimized settings');
            }
            
            // Three.jsがロードされているかチェック
            if (typeof THREE === 'undefined') {
                console.log('Loading Three.js...');
                await this.loadThreeJS();
            }
            
            console.log('Setting up WebGL scene...');
            this.setupScene();
            this.setupRealisticWater(); // リアルな水面
            this.setupLights();
            this.createTextMeshes(); // 簡素化したテキスト
            this.startAnimation();
            
            this.isInitialized = true;
            console.log('WebGL Water Reflection System initialized successfully!');
            
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
        
        // カメラ位置（水面も見えるように上に配置）
        this.camera.position.set(0, 2, 6);
        this.camera.lookAt(0, -1, 0); // 下方向を見る
    }

    setupRealisticWater() {
        // モバイル最適化: ジオメトリの複雑さを調整
        const isMobile = this.isMobileDevice();
        const segments = isMobile ? [64, 32] : [128, 64]; // モバイルでは解像度を下げる
        
        // 画面下部を確実にカバーする巨大な水面
        const waterGeometry = new THREE.PlaneGeometry(200, 100, segments[0], segments[1]);
        
        // リアルな水面マテリアル（モバイル最適化）
        const waterMaterial = new THREE.MeshPhongMaterial({
            color: 0x001e3c,
            transparent: true,
            opacity: 0.8,
            reflectivity: isMobile ? 0.5 : 1.0, // モバイルでは反射を抑制
            shininess: isMobile ? 100 : 200,     // モバイルでは光沢を抑制
            specular: 0x111111,
            // 法線マップ効果をシミュレート
            bumpScale: isMobile ? 0.02 : 0.05    // モバイルでは効果を抑制
        });

        this.water = new THREE.Mesh(waterGeometry, waterMaterial);
        this.water.rotation.x = -Math.PI / 2;
        this.water.position.y = -4.0;  // 適切な範囲で下に配置
        this.water.position.z = 0;
        this.water.receiveShadow = true;
        
        // 水面の動的アニメーション用プロパティ
        this.water.userData = {
            time: 0,
            waveSpeed: 0.5,
            waveHeight: 0.02
        };
        
        this.scene.add(this.water);
        
        console.log('Simple water surface created');
    }

    setupWater() {
        // 元の複雑なシェーダー版（フォールバック用）
        this.setupSimpleWater();
    }

    setupLights() {
        // 環境光
        const ambientLight = new THREE.AmbientLight(0x4a90e2, 0.4);
        this.scene.add(ambientLight);

        // 平行光源（影を投射）
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(-5, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -10;
        directionalLight.shadow.camera.right = 10;
        directionalLight.shadow.camera.top = 10;
        directionalLight.shadow.camera.bottom = -10;
        this.scene.add(directionalLight);

        // 文字からの光（ポイントライト）
        const textLight = new THREE.PointLight(0x6366f1, 0.8, 12);
        textLight.position.set(0, 3, 2);
        this.scene.add(textLight);
        
        console.log('Lights with shadows set up');
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
            
            // 2. トランプカードの枠線作成
            const cardFrame = this.createCardFrame(cardWidth, cardHeight);
            cardFrame.rotation.z = -Math.PI / 6; // 左に30度傾斜（-30度）
            letterGroup.add(cardFrame);
            
            // 3. グループの初期位置設定（動的中央配置）
            const centerPos = this.calculateCenterPosition(index);
            letterGroup.position.copy(centerPos);
            
            console.log(`Letter ${letter} (${index}) positioned at:`, centerPos);
            console.log(`Letter ${letter} group children count:`, letterGroup.children.length);
            console.log(`Letter ${letter} visible:`, letterGroup.visible);
            console.log(`Letter ${letter} scale:`, letterGroup.scale);
            
            // 4. 鏡面反射を独立して作成
            const reflectionGroup = this.createLetterReflection(textGeometry, cardFrame);
            reflectionGroup.position.copy(centerPos);
            reflectionGroup.position.y = -4.5; // 水面の下に配置
            reflectionGroup.scale.y = -1; // Y軸反転
            reflectionGroup.visible = false; // 初期状態は非表示
            
            // 反射文字にユーザーデータを追加
            reflectionGroup.userData = {
                letter: letter,
                index: index,
                parentLetter: letterGroup,
                targetPosition: { x: centerPos.x, y: -4.5, z: centerPos.z }
            };
            
            this.reflectionMeshes.push(reflectionGroup);
            this.scene.add(reflectionGroup);
            
            // 5. 初期状態は非表示（各文字に個別の開始位置）
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
                cardFrame: cardFrame,
                textMesh: textGeometry, // textGeometryはGroupオブジェクト
                animationState: 'waiting' // waiting, flying, rotating, cardDisappearing, completed
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
        
        const lineMaterial = new THREE.MeshPhongMaterial({
            color: 0x6366f1,
            emissive: 0x4f46e5,
            emissiveIntensity: 0.3,
            shininess: 100
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
        
        const material = new THREE.MeshPhongMaterial({
            color: 0x6366f1,
            emissive: 0x4f46e5,
            emissiveIntensity: 0.3,
            shininess: 100
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
        
        const material = new THREE.MeshPhongMaterial({
            color: 0x6366f1,
            emissive: 0x4f46e5,
            emissiveIntensity: 0.3,
            shininess: 100
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
        
        const material = new THREE.MeshPhongMaterial({
            color: 0x6366f1,
            emissive: 0x4f46e5,
            emissiveIntensity: 0.3,
            shininess: 100
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
        const material = new THREE.MeshPhongMaterial({
            color: 0x6366f1,
            emissive: 0x4f46e5,
            emissiveIntensity: 0.3,
            shininess: 100
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
        
        const material = new THREE.MeshPhongMaterial({
            color: 0x6366f1,
            emissive: 0x4f46e5,
            emissiveIntensity: 0.3,
            shininess: 100
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

    createCardFrame(width, height) {
        // カードの枠線を作成
        const cardGeometry = new THREE.PlaneGeometry(width, height);
        
        // 枠線のみの光沢のあるカードマテリアル
        const cardEdges = new THREE.EdgesGeometry(cardGeometry);
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0xc0c0c0,  // 銀色
            linewidth: 2,     // 少し太めの線
            transparent: true,
            opacity: 0.2      // 透明度を大幅に下げる（薄く見える）
        });
        
        const cardFrame = new THREE.LineSegments(cardEdges, lineMaterial);
        return cardFrame;
    }

    // 文字の鏡面反射を作成
    createLetterReflection(textGeometry, cardFrame) {
        const reflectionGroup = new THREE.Group();
        
        // 文字の反射をクローン
        const letterReflection = textGeometry.clone();
        
        // 反射用マテリアルを作成（水中効果を追加）
        letterReflection.traverse((child) => {
            if (child.isMesh) {
                const reflectionMaterial = child.material.clone();
                reflectionMaterial.opacity = 0.6; // より見やすく
                reflectionMaterial.transparent = true;
                reflectionMaterial.emissiveIntensity = 0.1;
                // 水中の青みがかった効果
                reflectionMaterial.color.setHex(0x87CEEB); // スカイブルー系
                reflectionMaterial.emissive.setHex(0x4682B4); // より濃い青
                child.material = reflectionMaterial;
            }
        });
        
        reflectionGroup.add(letterReflection);
        
        // カードフレームは反射しない（文字のみ反射）
        
        return reflectionGroup;
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
            
            // リアルな水面アニメーション
            if (this.water && this.water.userData) {
                this.water.userData.time += 0.016;
                
                // 水面の微細な波動効果
                const vertices = this.water.geometry.attributes.position.array;
                for (let i = 0; i < vertices.length; i += 3) {
                    const x = vertices[i];
                    const z = vertices[i + 2];
                    
                    // 複数の波を組み合わせた自然な水面
                    vertices[i + 1] = 
                        Math.sin(x * 0.5 + this.water.userData.time * 2) * 0.02 +
                        Math.cos(z * 0.3 + this.water.userData.time * 1.5) * 0.015 +
                        Math.sin((x + z) * 0.2 + this.water.userData.time) * 0.01;
                }
                this.water.geometry.attributes.position.needsUpdate = true;
                this.water.geometry.computeVertexNormals();
            }
            
            // テキストグループの微細な浮遊アニメーション（完了後のみ）
            this.textMeshes.forEach((letterGroup, index) => {
                if (letterGroup.visible && letterGroup.userData.animationState === 'completed') {
                    const baseY = 0.5; // 中央の高さに設定
                    letterGroup.position.y = baseY + Math.sin(time * 1.5 + index * 0.3) * 0.05;
                    letterGroup.userData.textMesh.rotation.y = Math.sin(time * 0.8 + index) * 0.05;
                }
            });
            
            // パーティクル効果のアニメーション
            this.updateParticles();
            
            // 光の輪のアニメーション
            this.updateLightRings(time);
            
            // 定期的な波紋効果（全アニメーション完了後）
            if (this.allAnimationsCompleted) {
                this.updateAmbientRipples(currentTime);
            }
            
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
        const cardFrame = userData.cardFrame;
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
                // 飛び込み完了、カード回転開始
                userData.animationState = 'rotating';
                setTimeout(() => {
                    this.animateCardRotation(letterGroup);
                }, 300); // 少し間を置いてから回転
            }
        };
        
        flyAnimate();
    }

    animateCardRotation(letterGroup) {
        const userData = letterGroup.userData;
        const cardFrame = userData.cardFrame;
        const duration = 800;
        const startTime = performance.now();
        
        const rotateAnimate = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Z軸で1回転
            cardFrame.rotation.z = -Math.PI / 6 + (Math.PI * 2 * progress);
            
            if (progress < 1) {
                requestAnimationFrame(rotateAnimate);
            } else {
                // 回転完了、カード消失開始
                userData.animationState = 'cardDisappearing';
                
                // 雨滴エフェクトを追加（光の輪が下に落ちる）
                this.createRaindropEffect(letterGroup.position);
                
                setTimeout(() => {
                    this.animateCardDisappear(letterGroup);
                }, 200);
            }
        };
        
        rotateAnimate();
    }

    animateCardDisappear(letterGroup) {
        const userData = letterGroup.userData;
        const cardFrame = userData.cardFrame;
        const duration = 600;
        const startTime = performance.now();
        
        // 最上角の座標を計算（カードが30度回転している状態で）
        const cardWidth = 0.8;
        const cardHeight = 1.2;
        
        const disappearAnimate = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 上角から消えるアニメーション
            cardFrame.scale.x = 1 - progress;
            cardFrame.scale.y = 1 - progress;
            cardFrame.position.y = progress * 0.3; // 少し上に移動しながら
            cardFrame.material.opacity = 0.2 * (1 - progress);
            
            if (progress < 1) {
                requestAnimationFrame(disappearAnimate);
            } else {
                // カード完全に消失
                cardFrame.visible = false;
                userData.animationState = 'completed';
                
                // パーティクル効果を作成
                this.createParticleEffect(letterGroup.position);
                
                console.log(`Card disappeared for letter: ${userData.letter}`);
                
                // 全てのアニメーションが完了したかチェック
                this.checkAllAnimationsCompleted();
            }
        };
        
        disappearAnimate();
    }

    // パーティクル効果を作成
    createParticleEffect(position) {
        const particleCount = 15;
        const particleGeometry = new THREE.SphereGeometry(0.02, 8, 8);
        const particleMaterial = new THREE.MeshPhongMaterial({
            color: 0xc0c0c0, // 銀色
            emissive: 0x808080,
            emissiveIntensity: 0.4,
            transparent: true,
            opacity: 0.8
        });

        for (let i = 0; i < particleCount; i++) {
            const particle = new THREE.Mesh(particleGeometry, particleMaterial.clone());
            
            // カード位置から開始
            particle.position.copy(position);
            particle.position.y += 0.3; // 少し上から
            
            // ランダムな方向に飛散
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 0.5 + Math.random() * 0.5;
            
            particle.userData = {
                velocity: {
                    x: Math.cos(angle) * speed,
                    y: Math.random() * 0.8 + 0.2,
                    z: Math.sin(angle) * speed
                },
                life: 1.0,
                maxLife: 1.0 + Math.random() * 0.5
            };
            
            this.particles.push(particle);
            this.scene.add(particle);
        }
    }

    // 雨滴エフェクトを作成（光の輪が落下する）
    createRaindropEffect(position) {
        // 小さな光の球を作成
        const dropGeometry = new THREE.SphereGeometry(0.05, 16, 16);
        const dropMaterial = new THREE.MeshPhongMaterial({
            color: 0x6366f1,
            emissive: 0x4f46e5,
            emissiveIntensity: 1.0,
            transparent: true,
            opacity: 0.8
        });

        const raindrop = new THREE.Mesh(dropGeometry, dropMaterial);
        raindrop.position.copy(position);
        raindrop.position.y += 0.5; // 少し上から開始
        
        raindrop.userData = {
            startTime: performance.now(),
            startY: raindrop.position.y,
            velocity: 0,
            phase: 'falling' // falling -> splashing -> rippling
        };
        
        this.lightRings.push(raindrop);
        this.scene.add(raindrop);
    }

    // 複数の波紋エフェクトを作成
    createMultipleRipples(position) {
        const rippleCount = 3;
        const delays = [0, 300, 600]; // 時差をつけて波紋を作成
        const sizes = [2.0, 3.5, 5.0]; // 異なるサイズ
        const durations = [1500, 2000, 2500]; // 異なる持続時間
        
        for (let i = 0; i < rippleCount; i++) {
            setTimeout(() => {
                this.createSingleRipple(position, sizes[i], durations[i]);
            }, delays[i]);
        }
    }

    // 単一の波紋エフェクトを作成
    createSingleRipple(position, maxRadius, duration) {
        const rippleGeometry = new THREE.RingGeometry(0.05, 0.1, 32);
        const rippleMaterial = new THREE.MeshPhongMaterial({
            color: 0x87CEEB,
            emissive: 0x4FB3D9,
            emissiveIntensity: 0.6,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });

        const ripple = new THREE.Mesh(rippleGeometry, rippleMaterial);
        ripple.position.copy(position);
        ripple.position.y = -2.8; // 水面の少し上
        ripple.rotation.x = -Math.PI / 2; // 水平に配置
        
        ripple.userData = {
            startTime: performance.now(),
            duration: duration,
            phase: 'rippling',
            maxRadius: maxRadius
        };
        
        this.lightRings.push(ripple);
        this.scene.add(ripple);
    }

    // パーティクルの更新
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            const userData = particle.userData;
            
            // 位置を更新
            particle.position.x += userData.velocity.x * 0.016;
            particle.position.y += userData.velocity.y * 0.016;
            particle.position.z += userData.velocity.z * 0.016;
            
            // 重力効果
            userData.velocity.y -= 0.02;
            
            // ライフを減らす
            userData.life -= 0.016 / userData.maxLife;
            
            // 透明度を更新
            particle.material.opacity = userData.life * 0.8;
            particle.scale.setScalar(userData.life);
            
            // ライフが尽きたら削除
            if (userData.life <= 0) {
                this.scene.remove(particle);
                this.particles.splice(i, 1);
            }
        }
    }

    // 雨滴と波紋の更新
    updateLightRings(time) {
        for (let i = this.lightRings.length - 1; i >= 0; i--) {
            const effect = this.lightRings[i];
            const userData = effect.userData;
            const elapsed = time * 1000 - userData.startTime;
            
            if (userData.phase === 'falling') {
                // 雨滴の落下アニメーション
                this.updateFallingDrop(effect, elapsed);
            } else if (userData.phase === 'rippling') {
                // 波紋の拡散アニメーション
                this.updateRipple(effect, elapsed);
            }
            
            // エフェクト完了チェック
            if (this.isEffectCompleted(effect, elapsed)) {
                this.scene.remove(effect);
                this.lightRings.splice(i, 1);
            }
        }
    }

    // 雨滴の落下更新
    updateFallingDrop(drop, elapsed) {
        const userData = drop.userData;
        const deltaTime = elapsed * 0.001; // 秒に変換
        
        // 重力による加速
        userData.velocity += 9.8 * deltaTime; // 重力加速度
        drop.position.y = userData.startY - userData.velocity * deltaTime;
        
        // 発光効果
        drop.material.emissiveIntensity = 1.0 + Math.sin(elapsed * 0.01) * 0.3;
        
        // 水面に到達したか確認
        if (drop.position.y <= -2.8) { // 水面の高さ
            // 複数の波紋エフェクトを作成（美しい同心円）
            this.createMultipleRipples(drop.position);
            
            // 雨滴を削除
            drop.userData.phase = 'completed';
        }
    }

    // 波紋の拡散更新
    updateRipple(ripple, elapsed) {
        const userData = ripple.userData;
        const progress = elapsed / userData.duration;
        
        if (progress <= 1) {
            // 波紋の拡大
            const currentRadius = 0.1 + (userData.maxRadius - 0.1) * progress;
            ripple.geometry.dispose();
            ripple.geometry = new THREE.RingGeometry(
                currentRadius * 0.8, 
                currentRadius, 
                32
            );
            
            // 水色から白へのフェードアウト効果
            const baseColor = new THREE.Color(0x87CEEB); // スカイブルー
            const whiteColor = new THREE.Color(0xFFFFFF); // 白
            const emissiveColor = new THREE.Color(0x4FB3D9); // エミッシブ用水色
            
            // 色を水色から白に線形補間
            const currentColor = baseColor.clone().lerp(whiteColor, progress);
            ripple.material.color.copy(currentColor);
            
            // エミッシブ効果も同様にフェード
            const currentEmissive = emissiveColor.clone().lerp(whiteColor, progress * 0.8);
            ripple.material.emissive.copy(currentEmissive);
            ripple.material.emissiveIntensity = 0.4 * (1 - progress);
            
            // α値を時間と共に下げる（より急激に）
            ripple.material.opacity = 0.9 * Math.pow(1 - progress, 2);
            
            // 上下の波動
            ripple.position.y = -2.8 + Math.sin(progress * Math.PI * 4) * 0.05;
        }
    }

    // エフェクト完了判定
    isEffectCompleted(effect, elapsed) {
        const userData = effect.userData;
        
        if (userData.phase === 'falling') {
            return userData.phase === 'completed';
        } else if (userData.phase === 'rippling') {
            return elapsed >= userData.duration;
        }
        
        return false;
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
                
                // 反射文字も更新
                const reflectionGroup = letterGroup.userData.reflectionGroup;
                if (reflectionGroup) {
                    reflectionGroup.position.copy(newPos);
                    reflectionGroup.position.y = -4.5;
                    reflectionGroup.scale.set(targetScale, -targetScale, targetScale);
                }
            }
        });
        
        // カメラの向きも更新
        this.camera.lookAt(0, 0.5, 0);
    }

    // 全アニメーション完了チェック
    checkAllAnimationsCompleted() {
        const allCompleted = this.textMeshes.every(letterGroup => 
            letterGroup.userData.animationState === 'completed'
        );
        
        if (allCompleted && !this.allAnimationsCompleted) {
            this.allAnimationsCompleted = true;
            console.log('All animations completed! Starting ambient ripple effects...');
            this.startAmbientRipples();
        }
    }

    // 定期的な波紋効果を開始
    startAmbientRipples() {
        this.lastRippleTime = performance.now();
        console.log('Ambient ripple effects started');
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
        // 既存のパーティクルと光の輪をクリア
        this.particles.forEach(particle => this.scene.remove(particle));
        this.lightRings.forEach(ring => this.scene.remove(ring));
        this.particles = [];
        this.lightRings = [];

        // 文字を初期状態にリセット
        this.textMeshes.forEach((letterGroup, index) => {
            letterGroup.visible = false;
            letterGroup.position.x = this.calculateStartPosition(); // 動的開始位置
            letterGroup.scale.setScalar(1);
            letterGroup.userData.animationState = 'waiting';
            letterGroup.userData.isHovered = false;
            
            // 目標位置を再計算
            letterGroup.userData.targetPosition = this.calculateCenterPosition(index);
            
            // カードを再表示
            if (letterGroup.userData.cardFrame) {
                letterGroup.userData.cardFrame.visible = true;
                letterGroup.userData.cardFrame.scale.setScalar(1);
                letterGroup.userData.cardFrame.position.y = 0;
                letterGroup.userData.cardFrame.material.opacity = 0.2;
                letterGroup.userData.cardFrame.rotation.z = -Math.PI / 6;
            }
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



    // 定期波紋効果の更新
    updateAmbientRipples(currentTime) {
        // 定期的に新しい波紋を作成
        if (currentTime - this.lastRippleTime > this.rippleInterval) {
            this.createAmbientRipple();
            this.lastRippleTime = currentTime;
            
            // 次の波紋までの間隔をランダムに調整（2-4秒）
            this.rippleInterval = 2000 + Math.random() * 2000;
        }
        
        // 既存の波紋をアニメーション
        this.ambientRipples = this.ambientRipples.filter(ripple => {
            const age = currentTime - ripple.startTime;
            const duration = ripple.duration;
            const progress = Math.min(age / duration, 1);
            
            if (progress >= 1) {
                // 波紋を削除
                this.scene.remove(ripple.mesh);
                return false;
            }
            
            // 波紋をアニメーション
            const scale = progress * ripple.maxRadius;
            const opacity = 1 - progress;
            
            ripple.mesh.scale.set(scale, scale, scale);
            ripple.mesh.material.opacity = opacity * 0.6;
            
            return true;
        });
    }

    // 環境波紋を作成
    createAmbientRipple() {
        // ランダムな文字の位置を選択
        const randomIndex = Math.floor(Math.random() * this.textMeshes.length);
        const letterGroup = this.textMeshes[randomIndex];
        
        if (!letterGroup || letterGroup.userData.animationState !== 'completed') {
            return;
        }
        
        const position = letterGroup.position.clone();
        
        // 位置に少しランダム性を加える
        position.x += (Math.random() - 0.5) * 2;
        position.z += (Math.random() - 0.5) * 2;
        
        // 波紋エフェクトを作成
        const rippleGeometry = new THREE.RingGeometry(0.1, 0.15, 32);
        const rippleMaterial = new THREE.MeshBasicMaterial({
            color: 0x87CEEB,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        
        const rippleMesh = new THREE.Mesh(rippleGeometry, rippleMaterial);
        rippleMesh.position.copy(position);
        rippleMesh.position.y = -4.3; // 水面レベル
        rippleMesh.rotation.x = -Math.PI / 2; // 水平に配置
        
        this.scene.add(rippleMesh);
        
        // 波紋データを記録
        const rippleData = {
            mesh: rippleMesh,
            startTime: performance.now(),
            duration: 2000 + Math.random() * 1000, // 2-3秒
            maxRadius: 3 + Math.random() * 2 // 3-5の範囲
        };
        
        this.ambientRipples.push(rippleData);
        
        console.log(`Created ambient ripple at position: ${position.x.toFixed(2)}, ${position.z.toFixed(2)}`);
    }

    // クリーンアップ
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // 波紋効果もクリーンアップ
        this.ambientRipples.forEach(ripple => {
            this.scene.remove(ripple.mesh);
        });
        this.ambientRipples = [];
        
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