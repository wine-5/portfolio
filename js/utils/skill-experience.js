/**
 * スキル経験値計算ユーティリティ
 * 開始日から現在までの経験年月を自動計算
 */

class SkillExperienceCalculator {
    constructor() {
        // 各スキルの開始日（年-月-日）
        // 入学: 2024年4月
        this.startDates = {
            'unity': '2024-10-01',      // 1年前（2024年10月開始）
            'c#': '2024-10-01',         // 1年前（2024年10月開始）
            'git': '2024-10-01',        // 1年前（2024年10月開始）
            'c++': '2024-04-01',        // 1年6ヶ月前（入学時）
            'html': '2024-04-01',       // 1年6ヶ月前（入学時）
            'css': '2024-04-01',        // 1年6ヶ月前（入学時）
            'js': '2024-04-01',         // 1年6ヶ月前（入学時）
            'javascript': '2024-04-01'  // 1年6ヶ月前（入学時）
        };
    }

    /**
     * 開始日から現在までの年月を計算
     * @param {string} startDate - 開始日（YYYY-MM-DD形式）
     * @returns {object} { years, months, totalMonths }
     */
    calculateExperience(startDate) {
        const start = new Date(startDate);
        const now = new Date();
        
        let years = now.getFullYear() - start.getFullYear();
        let months = now.getMonth() - start.getMonth();
        
        if (months < 0) {
            years--;
            months += 12;
        }
        
        const totalMonths = years * 12 + months;
        
        return {
            years,
            months,
            totalMonths,
            text: this.formatExperience(years, months)
        };
    }

    /**
     * 年月を見やすいテキストに整形
     * @param {number} years 
     * @param {number} months 
     * @returns {string}
     */
    formatExperience(years, months) {
        if (years === 0) {
            return `${months}ヶ月`;
        } else if (months === 0) {
            return `${years}年`;
        } else {
            return `${years}年${months}ヶ月`;
        }
    }

    /**
     * スキル名から経験値を取得
     * @param {string} skillName 
     * @returns {object}
     */
    getSkillExperience(skillName) {
        const normalizedName = skillName.toLowerCase().trim();
        
        // スキル名に対応する開始日を検索
        for (const [key, startDate] of Object.entries(this.startDates)) {
            if (normalizedName.includes(key)) {
                return this.calculateExperience(startDate);
            }
        }
        
        // デフォルト（見つからない場合）
        return {
            years: 0,
            months: 0,
            totalMonths: 0,
            text: '0ヶ月'
        };
    }

    /**
     * 経験値をパーセンテージに変換（最大4年=100%）
     * @param {number} totalMonths 
     * @returns {number}
     */
    getExperiencePercentage(totalMonths) {
        const maxMonths = 48; // 4年（学生時代の期間）
        return Math.min(100, Math.round((totalMonths / maxMonths) * 100));
    }
}

// グローバルインスタンス
window.skillExpCalculator = new SkillExperienceCalculator();
