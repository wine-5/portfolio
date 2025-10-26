/* ===================================
   スキル管理クラス
   =================================== */
class SkillsManager {
    constructor() {
        this.skillsGrid = document.querySelector('.skills__grid');
        this.skillsData = null;
        this.skills = [];
    }

    async init() {
        // skillDetailsDataがまだロードされていない場合はロードを待つ
        if (window.skillDetailsData && !window.skillDetailsData.isReady()) {
            console.log('SkillsManager: Waiting for skill details data to load...');
            const lang = window.i18n ? window.i18n.getCurrentLanguage() : 'ja';
            await window.skillDetailsData.load(lang);
        }
        
        // スキルデータを取得
        this.skillsData = window.skillDetailsData ? window.skillDetailsData.getAllSkills() : null;
        
        if (this.skillsData) {
            console.log('SkillsManager: Rendering', this.skillsData.length, 'skills');
            this.renderSkills();
        } else {
            console.error('SkillsManager: SkillsData is null or undefined!');
        }
        
        this.setupSkillAnimation();
        this.setupLanguageListener();
    }

    /**
     * スキルカードをレンダリング
     */
    renderSkills() {
        if (!this.skillsGrid) {
            console.error('Skills grid element not found');
            return;
        }
        
        if (!this.skillsData) {
            console.warn('No skills data available');
            return;
        }

        // 表示するスキルのキー（HTMLに表示されている順序）
        const skillKeys = ['unity', 'c#', 'c++', 'git', 'html'];
        
        const skillsHTML = skillKeys.map(key => {
            const skill = this.skillsData[key] || this.skillsData[key.toLowerCase()];
            if (!skill) {
                console.warn(`Skill data not found for key: ${key}`);
                return '';
            }
            
            return `
                <div class="skill">
                    <div class="skill__header">
                        <span class="skill__name">${skill.title || key}</span>
                    </div>
                    <div class="skill__description">
                        ${this.getSkillDescription(key, skill)}
                    </div>
                </div>
            `;
        }).join('');
        
        this.skillsGrid.innerHTML = skillsHTML;
        
        // 新しく生成された要素を取得
        this.skills = document.querySelectorAll('.skill');
        
        const INITIAL_ANIMATION_DELAY = 100; // 初期アニメーション開始の遅延時間（ミリ秒）
        const SKILL_ANIMATION_STAGGER = 100; // スキルアニメーションの遅延時間（ミリ秒）
        
        // 即座に表示（IntersectionObserverを待たない）
        setTimeout(() => {
            this.skills.forEach((skill, index) => {
                setTimeout(() => {
                    skill.classList.add('skill-visible');
                }, index * SKILL_ANIMATION_STAGGER);
            });
        }, INITIAL_ANIMATION_DELAY);
    }

    /**
     * スキルの説明を取得
     */
    getSkillDescription(key, skill) {
        const MAX_DISPLAYED_SKILLS = 3; // 表示する追加スキルの最大数
        
        // 簡潔な説明を生成（additionalSkillsの最初の3つを使用）
        if (skill.additionalSkills && skill.additionalSkills.length > 0) {
            return skill.additionalSkills.slice(0, MAX_DISPLAYED_SKILLS).join('、');
        }
        
        // フォールバック: デフォルトの説明
        const defaultDescriptions = {
            'unity': '3D/2Dゲーム開発、アニメーション、物理演算',
            'c#': 'オブジェクト指向設計、SOLID原則、デザインパターン',
            'c++': 'ポインタ操作',
            'git': 'バージョン管理、ブランチ戦略、チーム開発',
            'html': 'Webページの作成、実際にWebページを公開'
        };
        
        return defaultDescriptions[key.toLowerCase()] || '';
    }

    /**
     * 言語変更リスナーを設定
     */
    setupLanguageListener() {
        window.addEventListener('languageChanged', async (e) => {
            const newLang = e.detail.language;
            
            // 新しい言語でデータを再読み込み
            if (window.skillDetailsData) {
                await window.skillDetailsData.load(newLang);
                this.skillsData = window.skillDetailsData.getAllSkills();
                this.renderSkills();
                this.setupSkillAnimation();
            }
        });
    }

    setupSkillAnimation() {
        const ANIMATION_STAGGER_DELAY = 100; // 連鎖アニメーションの遅延時間（ミリ秒）
        const INTERSECTION_THRESHOLD = 0.2; // 要素が表示されたと判定する割合（20%）
        const INTERSECTION_ROOT_MARGIN = '0px 0px -50px 0px'; // 交差判定の余白
        
        // 既存の要素を取得（動的に生成された場合も対応）
        this.skills = document.querySelectorAll('.skill');
        
        let animatedCount = 0; // アニメーション済みのスキル数
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const skill = entry.target;
                    
                    // 連鎖アニメーション
                    setTimeout(() => {
                        skill.classList.add('skill-visible');
                    }, animatedCount * ANIMATION_STAGGER_DELAY);
                    
                    animatedCount++;
                    
                    // 一度アニメーションしたら監視を停止
                    observer.unobserve(skill);
                }
            });
        }, { 
            threshold: INTERSECTION_THRESHOLD,
            rootMargin: INTERSECTION_ROOT_MARGIN
        });

        this.skills.forEach(skill => {
            observer.observe(skill);
        });
    }
}