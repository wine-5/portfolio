/**
 * legal-init.js
 * 法律ページ（プライバシーポリシー等）の初期化処理
 */

document.addEventListener('DOMContentLoaded', async () => {
    // テーママネージャーの初期化
    if (window.themeManager) {
        window.themeManager.init();
    }
    
    // 多言語マネージャーの初期化
    if (window.i18n) {
        const currentLang = window.i18n.getCurrentLanguage();
        await window.i18n.loadTranslations(currentLang);
        window.i18n.applyTranslations();
    }
});
