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
        this.particles = [];
        this.lightRings = [];
        this.reflectionCamera = null;
        this.reflectionRenderTarget = null;
        this.animationId = null;
        this.isInitialized = false;
        
        // 動的配置計算用
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;
        this.letterSpacing = 0.6;
        this.totalLetters = 6;
    }

    async init() {
        try {
            console.log('Initializing WebGL Water Reflection System...');
            
            // Three.jsがロードされているかチェック
            if (typeof THREE === 'undefined') {
                console.log('Loading Three.js...');
                await this.loadThreeJS();
            }
            
            console.log('Setting up WebGL scene...');
            this.setupScene();
            this.setupSimpleWater(); // 簡素化した水面
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
            
        } catch (error) {
            console.warn('WebGL initialization failed, falling back to CSS version:', error);
            this.fallbackToCSS();
        }
    }

    async loadThreeJS() {
        return new Promise((resolve, reject) => {
            // Three.js本体を安定版CDNから読み込み
            const threeScript = document.createElement('script');
            threeScript.src = 'https://unpkg.com/three@0.150.1/build/three.min.js';
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

    // 動的中央配置を計算
    calculateCenterPosition(index) {
        // ウィンドウサイズを更新
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;
        
        // 全体の文字幅を計算
        const totalWidth = (this.totalLetters - 1) * this.letterSpacing;
        
        // 中央を基準にした位置を計算
        const centerOffset = -totalWidth / 2;
        const letterX = centerOffset + (index * this.letterSpacing);
        
        return {
            x: letterX,
            y: 0.5,
            z: 0
        };
    }
    
    // 左端からの開始位置を計算（演出用）
    calculateStartPosition() {
        // 画面の左端より更に左に配置
        const worldLeft = -this.windowWidth * 0.01; // ワールド座標での左端
        return worldLeft - 5; // さらに5単位左に
    }

    setupScene() {
        // Canvas要素を作成
        const canvas = document.createElement('canvas');
        canvas.id = 'webgl-water-canvas';
        canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 2;
            background: transparent;
        `;
        
        const heroContent = document.querySelector('.hero__content');
        heroContent.appendChild(canvas);

        // Three.js基本設定
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            alpha: true,
            antialias: true 
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // カメラ位置（動的に計算された中央位置にフォーカス）
        this.camera.position.set(0, 1, 6);
        const centerPos = this.calculateCenterPosition(2.5); // 文字群の中央
        this.camera.lookAt(centerPos.x, centerPos.y, centerPos.z);
    }

    setupSimpleWater() {
        // 簡素化した水面（適切なサイズに調整）
        const waterGeometry = new THREE.PlaneGeometry(15, 6, 32, 16);
        
        // 簡単な水面マテリアル
        const waterMaterial = new THREE.MeshPhongMaterial({
            color: 0x006994,
            transparent: true,
            opacity: 0.6,
            reflectivity: 0.8,
            shininess: 100
        });

        this.water = new THREE.Mesh(waterGeometry, waterMaterial);
        this.water.rotation.x = -Math.PI / 2;
        this.water.position.y = -3;
        this.water.position.z = 2;
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
        
        // 文字「i」のサイズに合わせたカードサイズ（縦長を基準にする）
        const cardWidth = 0.8;
        const cardHeight = 1.2;  // 「i」が最も縦長なので、これを基準に
        
        letters.forEach((letter, index) => {
            // グループを作成（文字とカードをまとめる）
            const letterGroup = new THREE.Group();
            
            // 1. 文字のメッシュ作成（文字に応じたサイズ調整）
            let textGeometry;
            
            // 文字ごとに異なる形状を作成
            switch(letter) {
                case 'w':
                    textGeometry = this.createLetterW();
                    break;
                case 'i':
                    textGeometry = this.createLetterI();
                    break;
                case 'n':
                    textGeometry = this.createLetterN();
                    break;
                case 'e':
                    textGeometry = this.createLetterE();
                    break;
                case '-':
                    textGeometry = this.createLetterDash();
                    break;
                case '5':
                    textGeometry = this.createLetter5();
                    break;
                default:
                    textGeometry = new THREE.BoxGeometry(0.3, 0.5, 0.1);
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
            
            // 4. 初期状態は非表示（画面の左端から開始）
            letterGroup.visible = false;
            letterGroup.position.x = this.calculateStartPosition();
            
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
        });
        
        console.log('Trump card text system created:', this.textMeshes.length);
    }

    // 各文字の形状作成メソッド
    createLetterW() {
        const group = new THREE.Group();
        
        // W字を4本の線で構成
        const lineGeometry = new THREE.BoxGeometry(0.05, 0.5, 0.1);
        const positions = [
            { x: -0.15, y: 0, rotation: 0.3 },  // 左の線
            { x: -0.05, y: 0, rotation: -0.3 }, // 左中の線
            { x: 0.05, y: 0, rotation: 0.3 },   // 右中の線
            { x: 0.15, y: 0, rotation: -0.3 }   // 右の線
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
        
        // I字を3つのパーツで構成（上横線、縦線、下横線）
        const verticalGeometry = new THREE.BoxGeometry(0.05, 0.4, 0.1);
        const horizontalGeometry = new THREE.BoxGeometry(0.2, 0.05, 0.1);
        
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
        top.position.set(0, 0.175, 0);
        top.castShadow = true;
        top.receiveShadow = true;
        group.add(top);
        
        // 下の横線
        const bottom = new THREE.Mesh(horizontalGeometry, material);
        bottom.position.set(0, -0.175, 0);
        bottom.castShadow = true;
        bottom.receiveShadow = true;
        group.add(bottom);
        
        return group;
    }
    
    createLetterN() {
        const group = new THREE.Group();
        
        // N字を3本の線で構成
        const verticalGeometry = new THREE.BoxGeometry(0.05, 0.5, 0.1);
        const diagonalGeometry = new THREE.BoxGeometry(0.05, 0.6, 0.1);
        
        const material = new THREE.MeshPhongMaterial({
            color: 0x6366f1,
            emissive: 0x4f46e5,
            emissiveIntensity: 0.3,
            shininess: 100
        });
        
        // 左の縦線
        const left = new THREE.Mesh(verticalGeometry, material);
        left.position.set(-0.1, 0, 0);
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
        right.position.set(0.1, 0, 0);
        right.castShadow = true;
        right.receiveShadow = true;
        group.add(right);
        
        return group;
    }
    
    createLetterE() {
        const group = new THREE.Group();
        
        // E字を4本の線で構成
        const verticalGeometry = new THREE.BoxGeometry(0.05, 0.5, 0.1);
        const horizontalGeometry = new THREE.BoxGeometry(0.15, 0.05, 0.1);
        
        const material = new THREE.MeshPhongMaterial({
            color: 0x6366f1,
            emissive: 0x4f46e5,
            emissiveIntensity: 0.3,
            shininess: 100
        });
        
        // 左の縦線
        const vertical = new THREE.Mesh(verticalGeometry, material);
        vertical.position.set(-0.075, 0, 0);
        vertical.castShadow = true;
        vertical.receiveShadow = true;
        group.add(vertical);
        
        // 上の横線
        const top = new THREE.Mesh(horizontalGeometry, material);
        top.position.set(0, 0.225, 0);
        top.castShadow = true;
        top.receiveShadow = true;
        group.add(top);
        
        // 真ん中の横線
        const middle = new THREE.Mesh(horizontalGeometry.clone(), material);
        middle.scale.x = 0.8;
        middle.position.set(-0.015, 0, 0);
        middle.castShadow = true;
        middle.receiveShadow = true;
        group.add(middle);
        
        // 下の横線
        const bottom = new THREE.Mesh(horizontalGeometry, material);
        bottom.position.set(0, -0.225, 0);
        bottom.castShadow = true;
        bottom.receiveShadow = true;
        group.add(bottom);
        
        return group;
    }
    
    createLetterDash() {
        const group = new THREE.Group();
        const dashGeometry = new THREE.BoxGeometry(0.2, 0.05, 0.1);
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
        
        // 5字を複数のパーツで構成
        const horizontalGeometry = new THREE.BoxGeometry(0.15, 0.05, 0.1);
        const verticalGeometry = new THREE.BoxGeometry(0.05, 0.2, 0.1);
        
        const material = new THREE.MeshPhongMaterial({
            color: 0x6366f1,
            emissive: 0x4f46e5,
            emissiveIntensity: 0.3,
            shininess: 100
        });
        
        // 上の横線
        const top = new THREE.Mesh(horizontalGeometry, material);
        top.position.set(0, 0.225, 0);
        top.castShadow = true;
        top.receiveShadow = true;
        group.add(top);
        
        // 左の上縦線
        const leftTop = new THREE.Mesh(verticalGeometry, material);
        leftTop.position.set(-0.075, 0.125, 0);
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
        rightBottom.position.set(0.075, -0.125, 0);
        rightBottom.castShadow = true;
        rightBottom.receiveShadow = true;
        group.add(rightBottom);
        
        // 下の横線
        const bottom = new THREE.Mesh(horizontalGeometry, material);
        bottom.position.set(0, -0.225, 0);
        bottom.castShadow = true;
        bottom.receiveShadow = true;
        group.add(bottom);
        
        return group;
    }

    createCardFrame(width, height) {
        // カードの枠線を作成（EdgeGeometry を使用）
        const cardGeometry = new THREE.PlaneGeometry(width, height);
        const edges = new THREE.EdgesGeometry(cardGeometry);
        
        // 光沢のある銀色の細い線
        const cardMaterial = new THREE.LineBasicMaterial({
            color: 0xc0c0c0,  // 銀色
            linewidth: 1,     // 細い線
            transparent: true,
            opacity: 0.9
        });
        
        // より光沢感を出すために、MeshPhongMaterialも試す
        const shinyCardMaterial = new THREE.MeshPhongMaterial({
            color: 0xc0c0c0,
            emissive: 0x404040,
            emissiveIntensity: 0.1,
            shininess: 200,
            transparent: true,
            opacity: 0.8,
            wireframe: true  // 枠線のみ表示
        });
        
        const cardFrame = new THREE.Mesh(cardGeometry, shinyCardMaterial);
        return cardFrame;
    }

    startAnimation() {
        const animate = () => {
            this.animationId = requestAnimationFrame(animate);
            
            const time = performance.now() * 0.001;
            
            // 水面アニメーション
            if (this.water && this.water.material.uniforms) {
                this.water.material.uniforms.time.value = time;
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
        this.textMeshes.forEach((letterGroup, index) => {
            setTimeout(() => {
                this.animateLetterWithCard(letterGroup);
            }, index * 500); // カード演出があるので間隔を少し長めに
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
        letterGroup.scale.set(0.3, 0.3, 0.3);
        
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
        const targetScale = 1.0;
        
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
                
                // 光の輪効果を追加
                this.createLightRing(letterGroup.position);
                
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
            cardFrame.material.opacity = 0.8 * (1 - progress);
            
            if (progress < 1) {
                requestAnimationFrame(disappearAnimate);
            } else {
                // カード完全に消失
                cardFrame.visible = false;
                userData.animationState = 'completed';
                
                // パーティクル効果を作成
                this.createParticleEffect(letterGroup.position);
                
                console.log(`Card disappeared for letter: ${userData.letter}`);
            }
        };
        
        disappearAnimate();
    }

    // パーティクル効果を作成
    createParticleEffect(position) {
        const particleCount = 15;
        const particleGeometry = new THREE.SphereGeometry(0.02, 8, 8);
        const particleMaterial = new THREE.MeshPhongMaterial({
            color: 0xffd700, // 金色
            emissive: 0xffaa00,
            emissiveIntensity: 0.5,
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

    // 光の輪を作成
    createLightRing(position) {
        const ringGeometry = new THREE.RingGeometry(0.5, 0.7, 32);
        const ringMaterial = new THREE.MeshPhongMaterial({
            color: 0x6366f1,
            emissive: 0x4f46e5,
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });

        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.copy(position);
        ring.rotation.x = -Math.PI / 2; // 水平に配置
        
        ring.userData = {
            startTime: performance.now(),
            duration: 2000
        };
        
        this.lightRings.push(ring);
        this.scene.add(ring);
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

    // 光の輪の更新
    updateLightRings(time) {
        for (let i = this.lightRings.length - 1; i >= 0; i--) {
            const ring = this.lightRings[i];
            const userData = ring.userData;
            const elapsed = time * 1000 - userData.startTime;
            const progress = elapsed / userData.duration;
            
            if (progress >= 1) {
                // アニメーション完了、削除
                this.scene.remove(ring);
                this.lightRings.splice(i, 1);
            } else {
                // スケールと透明度をアニメーション
                const scale = 1 + progress * 2;
                ring.scale.setScalar(scale);
                ring.material.opacity = 0.6 * (1 - progress);
                ring.rotation.z += 0.02; // ゆっくり回転
            }
        }
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
            // ウィンドウサイズを更新
            this.windowWidth = window.innerWidth;
            this.windowHeight = window.innerHeight;
            
            // レンダラーサイズを更新
            this.renderer.setSize(this.windowWidth, this.windowHeight);
            
            // カメラのアスペクト比を更新
            this.camera.aspect = this.windowWidth / this.windowHeight;
            this.camera.updateProjectionMatrix();
            
            // 文字位置を再計算
            this.updateLetterPositions();
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
        
        // カメラの向きも更新
        const centerPos = this.calculateCenterPosition(2.5);
        this.camera.lookAt(centerPos.x, centerPos.y, centerPos.z);
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
            letterGroup.position.x = -20;
            letterGroup.scale.setScalar(1);
            letterGroup.userData.animationState = 'waiting';
            letterGroup.userData.isHovered = false;
            
            // カードを再表示
            if (letterGroup.userData.cardFrame) {
                letterGroup.userData.cardFrame.visible = true;
                letterGroup.userData.cardFrame.scale.setScalar(1);
                letterGroup.userData.cardFrame.position.y = 0;
                letterGroup.userData.cardFrame.material.opacity = 0.8;
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
}