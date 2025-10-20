/* ===================================
   プロジェクトデータ
   =================================== */
const PROJECTS_DATA = [
    // 2年次 - 最新作品
    {
        title: 'たかし、人生ベット中',
        description: '学内ゲームジャム3日間で開発した2Dシューティングゲーム。5人チームでのリーダー経験。株式会社インフィニットループ堀川賞受賞。',
        technologies: ['Unity', 'C#', 'シングルトン', 'ObjectPool'],
        // image: 'https://picsum.photos/400/250?random=1',
        playUrl: 'https://unityroom.com/games/i-want-hosurus',
        githubUrl: 'https://github.com/wine-5',
        year: '2年次',
        category: 'game',
        teamSize: '5人（プログラマー4人、デザイナー1人）',
        period: '3日間',
        award: '株式会社インフィニットループ堀川賞'
    },
    {
        title: '蝶々反乱',
        description: 'Sapporo Game Camp2025参加作品。全員初対面の7人チームで開発した2Dアクションゲーム。学外ゲームジャム初挑戦。',
        technologies: ['Unity', 'C#', '設計パターン', 'チーム開発'],
        // image: 'https://picsum.photos/400/250?random=2',
        playUrl: 'https://unityroom.com/users/wine-555',
        githubUrl: 'https://github.com/wine-5',
        year: '2年次',
        category: 'game',
        teamSize: '7人（現役プログラマー1人、学生プログラマー2人、現役デザイナー1人、学生デザイナー2人、学生プランナー1人）',
        period: '2日間（現在ブラッシュアップ中）',
        note: 'リファクタリング・ブラッシュアップ進行中'
    },
    {
        title: 'Git Command Helper',
        description: 'Git学習用のコマンド専用Webサイト。実用性を重視した学習ツール。',
        technologies: ['HTML', 'CSS', 'JavaScript', 'Web Design'],
        // image: 'https://picsum.photos/400/250?random=3',
        playUrl: 'https://git-command.com/',
        githubUrl: 'https://github.com/wine-5',
        year: '2年次',
        category: 'web',
        teamSize: '1人',
        period: '継続開発中'
    },
    // 1年次作品
    {
        title: 'UnderOver',
        description: 'Unity独自メソッドの学習を兼ねて開発した2Dアクションゲーム。Unity基礎固めの集大成。',
        technologies: ['Unity', 'C#', '2D Physics'],
        // image: 'https://picsum.photos/400/250?random=4',
        playUrl: 'https://github.com/wine-5', // UnityRoom公開後に更新予定
        githubUrl: 'https://github.com/wine-5',
        year: '1年次',
        category: 'game',
        teamSize: '1人',
        period: '2〜3ヶ月',
        note: 'UnityRoom公開予定'
    },
    {
        title: 'Split',
        description: '初めてのチーム開発で作った2Dアクションゲーム。企画からデバッグまで全工程を経験。Git初体験作品。',
        technologies: ['HTML', 'CSS', 'JavaScript', 'Git'],
        // image: 'https://picsum.photos/400/250?random=5',
        playUrl: '#', // 後日ゲームファイル追加予定
        webPath: '', // ゲームファイル追加時に設定
        githubUrl: '#', // リポジトリ状況確認後更新
        year: '1年次',
        category: 'web-game',
        teamSize: '3人（プログラマー3人）',
        period: '6ヶ月',
        note: '企画〜デバッグ全工程経験'
    },
    {
        title: 'ElementBattle',
        description: '記念すべき初作品のカードゲーム。関数・変数を学習しながら開発。プログラミングの基礎を身につけた思い出の作品。',
        technologies: ['HTML', 'CSS', 'JavaScript'],
        // image: 'https://picsum.photos/400/250?random=6',
        playUrl: '#', // 後日ゲームファイル追加予定
        localPath: 'web-game/ElementBattle/index.html', // ローカルゲームファイル
        webPath: 'web-game/ElementBattle/index.html', // ウェブ公開用パス
        githubUrl: 'https://github.com/wine-5',
        year: '1年次',
        category: 'web-game',
        teamSize: '1人',
        period: '約1ヶ月（2025年1月〜2月）',
        note: '記念すべき初作品'
    }
];

// プロジェクトデータのエクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PROJECTS_DATA;
}