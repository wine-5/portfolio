/**
 * スキル詳細情報
 * 各スキルの追加取得情報を管理
 */

const skillDetailsData = {
    'unity': {
        title: 'Unity',
        additionalSkills: [
            'Unity Editor拡張',
            'Shader Graph',
            'Particle System',
            'Physics & Collision',
            'UI Toolkit',
            'Timeline & Cinemachine',
            'Asset Bundle管理',
            'パフォーマンス最適化'
        ],
        projects: '10+ プロジェクト',
        proficiency: '85%'
    },
    'c#': {
        title: 'C#',
        additionalSkills: [
            'LINQ & Lambda式',
            'async/await非同期処理',
            'デリゲート & イベント',
            'ジェネリック型',
            'リフレクション',
            'Attribute活用',
            'デザインパターン実装',
            'Unity Scripting API'
        ],
        projects: '15+ プロジェクト',
        proficiency: '80%'
    },
    'c++': {
        title: 'C++',
        additionalSkills: [
            'STLコンテナ活用',
            'スマートポインタ',
            'テンプレートプログラミング',
            'マルチスレッド処理',
            'メモリ管理最適化',
            'OpenGL連携',
            'CMakeビルド設定',
            'デバッグ & プロファイリング'
        ],
        projects: '8+ プロジェクト',
        proficiency: '70%'
    },
    'git': {
        title: 'Git',
        additionalSkills: [
            'ブランチ戦略設計',
            'リベース & マージ',
            'コンフリクト解決',
            'GitHub Actions CI/CD',
            'Git Hooks活用',
            'Submodule管理',
            'チーム開発フロー',
            'コミット規約管理'
        ],
        projects: '全プロジェクトで使用',
        proficiency: '75%'
    },
    'html': {
        title: 'HTML',
        additionalSkills: [
            'セマンティックHTML',
            'アクセシビリティ対応',
            'SEO最適化',
            'Open Graph設定',
            'HTML5 API活用',
            'レスポンシブ画像',
            'フォーム検証',
            'Web Components'
        ],
        projects: '20+ Webサイト',
        proficiency: '90%'
    },
    'css': {
        title: 'CSS',
        additionalSkills: [
            'CSS Grid & Flexbox',
            'アニメーション設計',
            'CSS変数活用',
            'レスポンシブデザイン',
            'BEM命名規則',
            'パフォーマンス最適化',
            'クロスブラウザ対応',
            'カスタムプロパティ'
        ],
        projects: '20+ Webサイト',
        proficiency: '85%'
    },
    'javascript': {
        title: 'JavaScript',
        additionalSkills: [
            'ES6+ モダン構文',
            'Promise & async/await',
            'DOM操作 & イベント',
            'Fetch API & AJAX',
            'クロージャ活用',
            'プロトタイプチェーン',
            'デザインパターン',
            'パフォーマンス最適化'
        ],
        projects: '25+ アプリケーション',
        proficiency: '85%'
    },
    'js': {
        title: 'JavaScript',
        additionalSkills: [
            'ES6+ モダン構文',
            'Promise & async/await',
            'DOM操作 & イベント',
            'Fetch API & AJAX',
            'クロージャ活用',
            'プロトタイプチェーン',
            'デザインパターン',
            'パフォーマンス最適化'
        ],
        projects: '25+ アプリケーション',
        proficiency: '85%'
    }
};

/**
 * スキル名から詳細情報を取得
 * @param {string} skillName 
 * @returns {object|null}
 */
function getSkillDetails(skillName) {
    const normalizedName = skillName.toLowerCase().trim();
    
    for (const [key, details] of Object.entries(skillDetailsData)) {
        if (normalizedName.includes(key)) {
            return details;
        }
    }
    
    // デフォルト情報
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

// グローバルに公開
window.getSkillDetails = getSkillDetails;
