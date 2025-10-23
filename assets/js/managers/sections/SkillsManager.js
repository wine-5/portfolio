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
        console.log('SkillsManager init called');
        
        // skillDetailsDataがまだロードされていない場合はロードを待つ
        if (window.skillDetailsData && !window.skillDetailsData.isReady()) {
            console.log('Waiting for skill details data to load...');
            const lang = window.i18n ? window.i18n.getCurrentLanguage() : 'ja';
            await window.skillDetailsData.load(lang);
        }
        
        // スキルデータを取得
        this.skillsData = window.skillDetailsData ? window.skillDetailsData.getAllSkills() : null;
        
        console.log('SkillsData received:', this.skillsData);
        console.log('SkillsData type:', typeof this.skillsData);
        console.log('SkillsData is null?', this.skillsData === null);
        
        if (this.skillsData) {
            console.log('Calling renderSkills()...');
            this.renderSkills();
        } else {
            console.error('SkillsData is null or undefined!');
        }
        
        this.setupSkillAnimation();
        this.setupLanguageListener();
        console.log('SkillsManager initialization completed');
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
        
        console.log('Rendering skills for keys:', skillKeys);
        console.log('Available skill data:', Object.keys(this.skillsData));
        
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
        
        console.log('Generated skills HTML length:', skillsHTML.length);
        this.skillsGrid.innerHTML = skillsHTML;
        
        // 新しく生成された要素を取得
        this.skills = document.querySelectorAll('.skill');
        console.log('Skills rendered:', this.skills.length, 'items');
        
        // 即座に表示（IntersectionObserverを待たない）
        setTimeout(() => {
            this.skills.forEach((skill, index) => {
                setTimeout(() => {
                    skill.classList.add('skill-visible');
                }, index * 100);
            });
        }, 100);
    }

    /**
     * スキルの説明を取得
     */
    getSkillDescription(key, skill) {
        // 簡潔な説明を生成（additionalSkillsの最初の3つを使用）
        if (skill.additionalSkills && skill.additionalSkills.length > 0) {
            return skill.additionalSkills.slice(0, 3).join('、');
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
            console.log('SkillsManager: Language changed to', newLang);
            
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
        // 既存の要素を取得（動的に生成された場合も対応）
        this.skills = document.querySelectorAll('.skill');
        
        let animatedCount = 0; // アニメーション済みのスキル数
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const skill = entry.target;
                    
                    // 連鎖アニメーション（0.1秒ずつ遅延）
                    setTimeout(() => {
                        skill.classList.add('skill-visible');
                    }, animatedCount * 100);
                    
                    animatedCount++;
                    
                    // 一度アニメーションしたら監視を停止
                    observer.unobserve(skill);
                }
            });
        }, { 
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        });

        this.skills.forEach(skill => {
            observer.observe(skill);
        });
    }
}