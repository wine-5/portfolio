/**
 * canvas-cleanup.js
 * 不要なcanvas要素を削除する
 * DOMContentLoadedの前に実行されるべき初期化スクリプト
 */

(function() {
    // パーティクル・波関連のcanvas要素のみを削除
    document.querySelectorAll('canvas').forEach(canvas => {
        const id = canvas.id || '';
        const className = canvas.className || '';
        
        // wine-5テキスト表示用canvas以外を削除
        // （パーティクル、水面反射関連のcanvasを特定して削除）
        if (id.includes('particle') || id.includes('water') || 
            className.includes('particle') || className.includes('water')) {
            canvas.remove();
        }
    });
    
    // パーティクルコンテナ削除
    const particleContainers = document.querySelectorAll('[class*="particle"], [class*="water"], [id*="particle"], [id*="water"]');
    particleContainers.forEach(el => {
        if (el.tagName !== 'SCRIPT' && el.tagName !== 'CANVAS') {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
        }
    });
})();
