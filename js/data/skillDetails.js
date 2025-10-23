/**
 * スキル詳細データ管理クラス
 * JSONファイルからスキル情報を読み込み、取得するためのインターフェースを提供
 */

class SkillDetailsData {
    constructor() {
        this.skillsData = null;
        this.isLoaded = false;
    }

    /**
     * スキルデータをJSONファイルから読み込む
     * @returns {Promise<void>}
     */
    async load(lang = 'ja') {
        if (this.isLoaded) return;

        try {
            const response = await fetch(`json/locales/${lang}/skillDetails.json`);
            if (!response.ok) {
                throw new Error(`Failed to load skill details: ${response.status}`);
            }
            this.skillDetailsData = await response.json();
            this.isLoaded = true;
        } catch (error) {
            console.error('Error loading skill details:', error);
            this.skillDetailsData = {};
            this.isLoaded = true;
        }
    }

    /**
     * スキル名から詳細情報を取得
     * @param {string} skillName スキル名
     * @returns {object|null} スキル詳細情報
     */
    getDetails(skillName) {
        if (!this.isLoaded || !this.skillsData) {
            console.warn('Skill data not loaded yet');
            return this.getDefaultDetails(skillName);
        }

        const normalizedName = skillName.toLowerCase().trim();
        
        // データから該当するスキルを検索
        for (const [key, details] of Object.entries(this.skillsData)) {
            if (normalizedName.includes(key)) {
                return details;
            }
        }
        
        // 見つからない場合はデフォルト情報を返す
        return this.getDefaultDetails(skillName);
    }

    /**
     * デフォルトのスキル情報を生成
     * @param {string} skillName スキル名
     * @returns {object} デフォルトのスキル詳細情報
     */
    getDefaultDetails(skillName) {
        return {
            title: skillName,
            additionalSkills: [
                '基本的な使用経験',
                'プロジェクトでの実装',
                '継続的な学習中'
            ],
            projects: '複数のプロジェクト',
            proficiency: '60%'
        };
    }

    /**
     * 全スキルデータを取得
     * @returns {object|null} 全スキルデータ
     */
    getAllSkills() {
        return this.skillsData;
    }

    /**
     * データが読み込まれているかチェック
     * @returns {boolean}
     */
    isReady() {
        return this.isLoaded;
    }
}

// グローバルインスタンスを作成
const skillDetailsData = new SkillDetailsData();

/**
 * 後方互換性のための関数
 * @param {string} skillName 
 * @returns {object|null}
 */
function getSkillDetails(skillName) {
    return skillDetailsData.getDetails(skillName);
}

// グローバルに公開
window.skillDetailsData = skillDetailsData;
window.getSkillDetails = getSkillDetails;
