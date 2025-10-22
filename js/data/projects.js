/* ===================================
   プロジェクトデータ
   =================================== */
const PROJECTS_DATA = [
    // 2年次 - 最新作品
    {
        title: 'たかし、人生ベット中',
        description: '学内ゲームジャム3日間で開発した2Dシューティングゲーム。5人チームでのリーダー経験。株式会社インフィニットループ堀川賞受賞。',
        detailedFeatures: `学内で3日間開催されたゲームジャムのゲームです。初めてのゲームジャムでプロジェクトのリーダーだったので指揮を取るのが大変でした。
デザイナーへの絵を任せるときにどのような絵が欲しいか、形式はどうするかなどとてもいい経験になりました。プログラマーがたくさんいるので、基底クラスを作って、クリティカルパスを短くするのが大変でした。
そして設計方法を学び始めたころなので、シングルトンやObjectPoolなどを使って効率化を考えて頑張りました。`,
        myResponsibilities: `プロジェクトリーダー、基底クラス設計、シングルトンパターン実装、ObjectPoolシステム実装`,
        technologies: ['Unity', 'C#', 'シングルトン', 'ObjectPool'],
        supportedPlatforms: ['PC', 'Mac', 'モバイル'], // 対応端末を追加
        images: [
            'images/game/takasi/takasi-home.png',
            'images/game/takasi/takasi-in-game.png'
        ],
        playUrl: 'https://unityroom.com/games/i-want-hosurus',
        githubUrl: 'https://github.com/wine-5/TechC_GameJam',
        year: '2年次',
        category: 'game',
        teamSize: '5人（プログラマー4人、デザイナー1人）',
        period: '3日間',
        award: '株式会社インフィニットループ堀川賞'
    },
    {
        title: '蝶々反乱',
        description: 'Sapporo Game Camp2025参加作品。全員初対面の7人チームで開発した2Dアクションゲーム。学外ゲームジャム初挑戦、リポジトリ公開済み。',
        detailedFeatures: `Sapporo Game Camp2025で作成したゲームです。全員が初対面で、学外のゲームジャムに参加するのは初めてでした。
前回の学内ゲームジャムの反省を活かして、開催前にUnityのプロジェクトを作って基底クラスをあらかじめ準備したり、リポジトリとプロジェクトを連携するなど行いました。
ゲーム自体は無事に完成しましたが、本来予定していたステージ数は用意できなかったりデザイナーさんが作ってくださった絵を全て使い切れなかったのも後悔しています。`,
        myResponsibilities: `基底クラス設計、プレイヤーの弾の実装、敵の挙動や攻撃パターンの実装`,
        technologies: ['Unity', 'C#'],
        supportedPlatforms: ['PC', 'Mac', 'モバイル'], // UnityRoom対応
        images: [
            'images/game/chocho/chocho-title.png'
        ],
        playUrl: '', // UnityRoom公開予定
        githubUrl: 'https://github.com/wine-5/SGC2025',
        year: '2年次',
        category: 'game',
        teamSize: '7人（現役プログラマー1人、学生プログラマー2人、現役デザイナー1人、学生デザイナー2人、学生プランナー1人）',
        period: '2日間（現在ブラッシュアップ中）',
        note: 'SGC2025参加作品・UnityRoom公開予定',
        locked: true,
        lockReason: 'UnityRoom公開準備中'
    },
    {
        title: 'Git Command Helper',
        description: 'Git学習用のコマンド専用Webサイト。実用性を重視した学習ツール。',
        detailedFeatures: `自分がコマンドの勉強をしていて、楽をするためのツールです。Gitのコマンドを効率的に学習・参照できるWebサイトとして開発しました。`,
        technologies: ['HTML', 'CSS', 'JavaScript', 'Web Design'],
        supportedPlatforms: ['全機種対応'], // Webサイトなので全機種対応
        images: [
            'images/game/git-command/git-home1.png',
            'images/game/git-command/git-home2.png'
        ],
        playUrl: 'https://git-command.com/',
        githubUrl: 'https://github.com/wine-5/Git-Command-Helper',
        year: '2年次',
        category: 'web',
        teamSize: '1人',
        period: '継続開発中'
    },
    // 1年次作品
    {
        title: 'UnderOver',
        description: 'Unity独自メソッドの学習を兼ねて開発した2Dアクションゲーム。Unity基礎固めの集大成。',
        detailedFeatures: `Unity独自のメソッドを復習しながら作ったゲームです。Unityの基本的な機能を理解し、2Dアクションゲームの開発を通してUnityでのゲーム制作の基礎を固めました。`,
        technologies: ['Unity', 'C#', '2D Physics'],
        supportedPlatforms: ['PC', 'Mac', 'モバイル'], // UnityRoom対応予定
        images: [
            'images/game/under-over/UnderOver-title.png',
            'images/game/under-over/UnderOver-in-game.png'
        ],
        playUrl: 'https://github.com/wine-5/UnderOver', // UnityRoom公開後に更新予定
        githubUrl: 'https://github.com/wine-5/UnderOver',
        year: '1年次',
        category: 'game',
        teamSize: '1人',
        period: '2〜3ヶ月',
        note: 'UnityRoom公開予定',
        locked: true,
        lockReason: 'UnityRoom公開準備中'
    },
    {
        title: 'SPLIT',
        description: '初めてのチーム開発で作った2Dアクションゲーム。企画からデバッグまで全工程を経験。Git初体験作品。',
        detailedFeatures: `企画から開発、デバッグのすべてを初めて行いました。初めてGitに出会って、わちゃわちゃしていたのを思い出します。チーム開発の基礎を学び、バージョン管理の重要性を実感した貴重な経験でした。`,
        myResponsibilities: `ステージの何度調整、デバッグ作業`,
        technologies: ['HTML', 'CSS', 'JavaScript', 'Git'],
        supportedPlatforms: ['PCのみ'], // ローカルゲームファイル
        images: [
            'images/game/split/split-title.png',
            'images/game/split/split-in-game.png'
        ],
        playUrl: 'web-game/Split/homepage/homepage/HTML/homepage.html', // ゲームに直接アクセス
        localPath: 'web-game/Split/homepage/homepage/HTML/homepage.html', // ローカルゲームファイル
        webPath: 'web-game/Split/homepage/homepage/HTML/homepage.html', // ウェブ公開用パス
        githubUrl: 'https://github.com/wine-5/SPLIT',
        year: '1年次',
        category: 'web-game',
        teamSize: '3人（プログラマー3人）',
        period: '6ヶ月',
        note: '企画〜デバッグ全工程経験'
    },
    {
        title: 'ElementBattle',
        description: '記念すべき初作品のカードゲーム。関数・変数を学習しながら開発。プログラミングの基礎を身につけた思い出の作品。',
        detailedFeatures: `自分が初めて作ったゲームです。関数、変数などを学習しながら作ったものです。プログラミングの基礎概念を実際のゲーム制作を通して学ぶことができた、非常に思い出深い作品です。`,
        technologies: ['HTML', 'CSS', 'JavaScript'],
        supportedPlatforms: ['PCのみ'], // ローカルゲームファイル
        images: [
            'images/game/element-battle/element-home.png',
            'images/game/element-battle/element-in-game.png'
        ],
        playUrl: 'web-game/ElementBattle/index.html', // ゲームに直接アクセス
        localPath: 'web-game/ElementBattle/index.html', // ローカルゲームファイル
        webPath: 'web-game/ElementBattle/index.html', // ウェブ公開用パス
        githubUrl: 'https://github.com/wine-5/Element_Battle',
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