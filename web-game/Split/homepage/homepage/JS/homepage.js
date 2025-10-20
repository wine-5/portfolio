/* ページが左右に移動せず、ゲームをできるように */
document.addEventListener('keydown', function (event) {
    /* 押されたキーを取得する */
    const key = event.key.toLowerCase();

    /* 移動する際のキーのデフォルトの挙動を無効化 */
    if (key === 'a' || key === 'd' || key === 'home' || key === 'end' || ' ') {
        event.preventDefault();

    }
})

/* 感想掲示板に行く */
document.getElementById("reviewsButton").addEventListener("click", function () {
    window.location.href = "../PHP/reviews.php"
})

/* 以下背景に出てくる四角形のコード */
/* コンテナ要素を取得する */

const container = document.querySelector('.container');
const squareCount = 30 /* 四角形の数を設定 */

/* 四角形を生成する関数 */
function createSquare(color) {
    const square = document.createElement('div'); /* div要素を新しく作成 */
    square.classList.add('square', color) /* squareクラスと指定した色のクラスを追加 */

    /* ランダムの初期位置を設定 */
    square.style.left = `${Math.random() * 100}vw`; /* 横位置をビューボート幅にランダムな割合で設定 */
    square.style.top = `${Math.random() * 100}vh`; /* 縦位置をビューボート幅にランダムな割合で設定 */

    container.appendChild(square); /* コンテナ内に新しい四角形を追加 */
    animateSquare(square); /* 追加したアニメーションを適用 */
}

/* 四角形をアニメーションさせる関数 */
function animateSquare(square) {
    let pos = 0 /* 初期位置を0に設定 */
    const speed = Math.random() * 0.5 /* ランダムな速度を生成(1~3の範囲) */
    const angle = Math.random() * 360; /* ランダムな角度を生成 */

    /* 四角形を動かすための内部関数 */
    function move() {
        pos += speed; /* 現在の位置に速度を加算 */
        const x = pos * Math.cos(angle * Math.PI / 180); /* x座標を計算 */
        const y = pos * Math.sin(angle * Math.PI / 180); /* y座標を計算 */

        square.style.transform = `translate(${x}px,${y}px)`; /* 四角形を新しい位置に移動 */

        /* 画面の外に出たらリセット */
        if (pos > window.innerWidth || pos > window.innerHeight) {/* 画面の幅または高さを超えたとき場合 */
            pos = 0; /* 位置をリセット */
            square.style.left = `${Math.random() * 100}vw`; /* 新しい横位置をランダムに設定 */
            square.style.top = `${Math.random() * 100}vh`; /* 新しい縦位置をランダムに設定 */
        }
        requestAnimationFrame(move); /* 次のフレームで move 関数を再呼び出ししてアニメーションを続ける */
    }
    move(); /* move関数を呼び出してアニメーションを開始 */
}

/* 指定された数の四角形を生成 */
for (let i = 0; i < squareCount; i++) { /* squareConutの数だけループ */
    createSquare('gray'); /* 薄い灰色の四角形を生成 */
    createSquare('black'); /* 薄い黒色の四角形を生成 */
}


// resizeされたとき、iframeとwindowのサイズを合わせる

window.addEventListener('resize', resizeIframe);

//サイズの調整する定数
const iframewidthsetup = -40
const iframeheighsetup = -40

function resizeIframe() {
    var iframe = document.getElementById('game');
    iframe.style.width = (window.innerWidth + iframewidthsetup) + 'px';
    iframe.style.height = (window.innerHeight + iframeheighsetup) + 'px';
}

// 初期サイズ設定
resizeIframe();

