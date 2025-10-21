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
        this.letterSpacing = 1.2; // 間隔を広げる
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

    // 文字配置テスト（まず一番左に配置）
    calculateCenterPosition(index) {
        // 手動で中央配置 - 6文字を画面中央に配置
        const positions = [
            -3.0,  // W (0)
            -1.8,  // I (1)
            -0.6,  // N (2)
             0.6,  // E (3)
             1.8,  // - (4)
             3.0   // 5 (5)
        ];
        
        // インデックスの安全性チェック
        if (!Number.isInteger(index) || index < 0 || index >= positions.length) {
            console.warn(`Invalid index ${index}, returning center position`);
            return { x: 0, y: 0.5, z: 0 };
        }
        
        const x = positions[index];
        console.log(`Letter ${index}: MANUAL CENTER position x=${x}`);
        
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
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 2;
            background: transparent;
        `;
        
        const heroContent = document.querySelector('.hero__content');
        heroContent.appendChild(canvas);

        // hero__content要素のサイズを取得
        const contentRect = heroContent.getBoundingClientRect();
        const contentWidth = contentRect.width;
        const contentHeight = contentRect.height;
        
        console.log(`Hero content size: ${contentWidth} x ${contentHeight}`);

        // Three.js基本設定 - hero__contentのサイズを使用
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, contentWidth / contentHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            alpha: true,
            antialias: true 
        });
        
        this.renderer.setSize(contentWidth, contentHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // カメラ位置（動的に計算された中央位置にフォーカス）
        this.camera.position.set(0, 1, 6);
        this.camera.lookAt(0, 0.5, 0); // シンプルに中央を見る
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
            
            console.log(`Letter ${letter} (${index}) positioned at:`, centerPos);
            
            // 4. 初期状態は非表示（画面の左端から開始）
            letterGroup.visible = false;
            const startX = this.calculateStartPosition();
            letterGroup.position.x = startX;
            
            console.log(`Letter ${letter} start position: x=${startX}`);
            
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
            // hero__content要素のサイズを取得
            const heroContent = document.querySelector('.hero__content');
            const contentRect = heroContent.getBoundingClientRect();
            const contentWidth = contentRect.width;
            const contentHeight = contentRect.height;
            
            // ウィンドウサイズを更新
            this.windowWidth = contentWidth;
            this.windowHeight = contentHeight;
            
            // レンダラーサイズを更新
            this.renderer.setSize(contentWidth, contentHeight);
            
            // カメラのアスペクト比を更新
            this.camera.aspect = contentWidth / contentHeight;
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
        
        // カメラの向きも更新 - 画面中央を見る
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