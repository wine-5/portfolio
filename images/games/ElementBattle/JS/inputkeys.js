/*
 *
 * inputkeys.js
 * 
 */

/* ホームに戻る処理 */
document.getElementById('home-button').addEventListener('click', () => {
    window.location='../index.html';
})

/* ヘルプボタンを押した際や、「H」キーが押された際の処理 */
document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('overlay');
    const helpButton = document.getElementById('help-button'); /* ボタンを取得 */

    function toggleOverlay() {
        if (overlay.classList.contains('show')) {
            overlay.classList.remove('show'); /* 画像を非表示にする */
        } else {
            overlay.style.opacity = 0; /* 初期透明度を設定 */
            overlay.classList.add('show'); /* 画像を表示する */
            setTimeout(() => {
                overlay.style.transition = 'opacity 0.5s'; 
                overlay.style.opacity = 1; 
            }, 100); // 0.1秒後にトランジションを適用
        }
    }

    /* Hキーで表示・非表示 */
    document.addEventListener('keydown', function(event) {
        if (event.key === 'H' || event.key === 'h') {
            toggleOverlay();
        } else if (event.key === 'Escape') {
            overlay.classList.remove('show'); /* 画像を非表示にする */
        }
    });

    /*  ボタンをクリックで表示・非表示 */
    helpButton.addEventListener('click', toggleOverlay);
});

/* 「R」キーでリスタート */
document.addEventListener('keydown', function(event) {
    if (event.key === 'R' || event.key === 'r') {
        restartPage(event);
    }
});
/* ボタンでリスタート */
document.getElementById('restart-button').addEventListener('click', (event) => {
    restartPage(event);
});

/* リスタートする関数 */
function restartPage(event) {
    event.preventDefault();
    window.location.reload();
}


/* 固定するウィンドウサイズ */
const fixedWidth = window.innerWidth * 0.75;  
const fixedHeight = window.innerHeight; 

/* Windowsサイズを固定 */
function lockWindowSize() {
    window.resizeTo(fixedWidth, fixedHeight);
}

window.onload = () => {
    lockWindowSize();
};

window.onresize = () => {
    lockWindowSize();
};

/* キーボードショートカットの無効化 */
document.addEventListener("keydown", function (event) {
    if (
        event.key === "F12" || /* デベロッパーツール */
        (event.ctrlKey && event.key === "+") || /* ズームイン */
        (event.ctrlKey && event.key === "-") || /* ズームアウト */
        (event.ctrlKey && event.key === "0") ||  /* ズームリセット */
        (event.ctrlKey && event.key === "u") || /*  ページソースの表示 (Ctrl + U) */
        (event.ctrlKey && event.shiftKey && event.key === "I") || /*  デベロッパーツール (Ctrl + Shift + I) */
        (event.ctrlKey && event.shiftKey && event.key === "J") /*  デベロッパーツール (Ctrl + Shift + J) */
    ) {
        event.preventDefault();
        event.stopPropagation();
        return false;
    }
});

/* マウス操作によるズームの無効化 */
document.addEventListener("wheel", function (event) {
    if (event.ctrlKey) {
        event.preventDefault(); /*  Ctrl + スクロールでのズームを防止 */
    }
}, { passive: false });

document.addEventListener("gesturestart", function (event) {
    event.preventDefault(); /*  ピンチズームの開始を防止 */
});

document.addEventListener("gesturechange", function (event) {
    event.preventDefault(); /*  ピンチズーム中の動作を防止 */
});

document.addEventListener("gestureend", function (event) {
    event.preventDefault(); /*  ピンチズームの終了を防止 */
});


/*  右クリックメニューの無効化 */
document.addEventListener("contextmenu", function (event) {
    event.preventDefault();
    return false;
});





// /* キー入力でカードを引く（出す）処理 */
// document.addEventListener('keydown', (cardEvent) => {
//     if (cardEvent.key === 'D' || cardEvent.key === 'd') {
//         drawCardFunction();
//     }
//     if (cardEvent.key === 'P' || cardEvent.key === 'p') {
//         playCardFunction();
//     }
// });
// どのカードをプレイヤーが出すのかを結局選択しなければならないためこれはやめた

