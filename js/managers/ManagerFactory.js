/* ===================================
   マネージャーファクトリー
   各マネージャーの生成と初期化を一元管理
   =================================== */
class ManagerFactory {
    constructor() {
        this.managers = {};
    }

    /**
     * 全マネージャーを作成
     */
    createAll() {
        // コアマネージャー
        this.managers.scroll = new ScrollManager();
        this.managers.animation = new AnimationManager();
        this.managers.sectionAnimation = new SectionAnimationManager();
        
        // コンテンツマネージャー
        this.managers.games = new GamesManager();
        this.managers.skills = new SkillsManager();
        this.managers.updates = new UpdatesManager();
        this.managers.contact = new ContactForm();
        this.managers.footerAnimation = new FooterAnimationManager();
        
        // WebGL水面反射システム（フォールバック付き）
        this.managers.webglWater = new WebGLWaterReflectionManager();
        this.managers.waterReflectionTitle = new WaterReflectionTitleManager();
        
        return this.managers;
    }

    /**
     * 全マネージャーを初期化（WebGL以外）
     */
    initAll() {
        // コアマネージャーの初期化
        this.managers.scroll.init();
        this.managers.animation.init();
        this.managers.sectionAnimation.init();
        
        // コンテンツマネージャーの初期化
        this.managers.games.init();
        this.managers.skills.init();
        this.managers.contact.init();
        this.managers.footerAnimation.init();
        
        // UpdatesManagerは遅延初期化
        setTimeout(() => {
            this.managers.updates.init();
        }, 100);
    }

    /**
     * WebGL水面反射システムの初期化
     */
    async initWaterReflection() {
        try {
            console.log('Checking WebGL support...');
            
            await this.managers.webglWater.init();
            
            if (this.managers.webglWater.isInitialized) {
                console.log('WebGL initialized successfully');
                setTimeout(() => {
                    this.managers.webglWater.animateLettersIn();
                }, 1000);
            } else {
                throw new Error('WebGL initialization failed');
            }
        } catch (error) {
            console.log('Falling back to CSS water system:', error.message);
            this.showCSSElements();
            this.managers.waterReflectionTitle.init();
        }
    }

    /**
     * CSS版の要素を表示（WebGLフォールバック用）
     */
    showCSSElements() {
        const selectors = [
            '.hero__content',
            '.hero__title-container', 
            '.hero__title-letters',
            '.hero__title-reflection'
        ];
        
        selectors.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                const isFlex = selector.includes('letters') || selector.includes('reflection');
                element.style.display = isFlex ? 'flex' : 'block';
                element.style.opacity = '1';
                element.style.visibility = 'visible';
            }
        });
    }

    /**
     * 特定のマネージャーを取得
     */
    get(name) {
        return this.managers[name];
    }

    /**
     * 全マネージャーをクリーンアップ
     */
    destroyAll() {
        Object.values(this.managers).forEach(manager => {
            if (manager && typeof manager.destroy === 'function') {
                manager.destroy();
            }
        });
    }
}
