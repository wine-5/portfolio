/**
 * constants.js
 * アプリケーション全体で使用される定数
 */

// ゲームカルーセル設定
const CAROUSEL_CONFIG = {
    // 3D配置設定
    radiusX: 350,           // 楕円の横方向半径（ピクセル）
    radiusZ: 200,           // 楕円の奥行き半径（ピクセル）
    itemSize: 165,          // アイコンサイズ（ピクセル）
    perspective: 2000,      // 3D視点距離（ピクセル）
    
    // アニメーション設定
    animationDuration: 600, // アニメーション時間（ミリ秒）
    autoRotationDelay: 5000,// 自動回転開始遅延（ミリ秒）
    autoRotationSpeed: 0.8, // 自動回転速度（度/100ms）
    
    // インタラクション設定
    swipeThreshold: 50,     // スワイプ判定閾値（ピクセル）
    angleRange: 85,         // 表示角度範囲（度）
    initialRotation: 45,    // 初期回転角度（度）
    
    // 外観設定
    minOpacity: 0.7,        // 最小透明度
    iconBorderRadius: 16,   // アイコン角丸（ピクセル）
    iconBorderWidth: 3      // アイコンボーダー幅（ピクセル）
};

// スクロールアニメーション設定
const SCROLL_CONFIG = {
    debounceDelay: 300,     // デバウンス遅延（ミリ秒）
    revealDuration: 800,    // 表示アニメーション時間（ミリ秒）
    revealDistance: 100     // トリガー距離（ピクセル）
};

// ローディング画面設定
const LOADING_CONFIG = {
    hideDuration: 500,      // 非表示アニメーション時間（ミリ秒）
    hideDelay: 500          // 非表示遅延（ミリ秒）
};

// W5テキストメッセージ設定
const W5_MESSAGE_CONFIG = {
    duration: 2000,         // メッセージ表示時間（ミリ秒）
    animationDelay: 100     // クリック後アニメーション遅延（ミリ秒）
};

// 日付定義
const SKILL_START_DATE = new Date('2024-04-01'); // スキル開始日（入学日）

// エクスポート（必要に応じて）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CAROUSEL_CONFIG,
        SCROLL_CONFIG,
        LOADING_CONFIG,
        W5_MESSAGE_CONFIG,
        SKILL_START_DATE
    };
}
