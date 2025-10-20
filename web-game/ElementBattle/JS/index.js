/*
 *
 * index.js
 * 
 */

/* HTMLページを起動した際に行う処理 */
window.addEventListener("load", function() {
    generateCardsBackground(); /* 背景をトランプ柄にする関数の呼び出し */
    gameTitle(); /* ゲームタイトルのアニメーション */
    goldParticle(); /* 金のパーティクル */
    blueParticle(); /* 青のパーティクル */
    // toggleCheckboxContainer(); /* カスタマイズの矢印を押したら向きが変わる　*/
});

/* ゲームタイトルのアニメーション */
function gameTitle() {
    const title = document.getElementById("game-title");
    const text = title.innerText;
    title.innerHTML = ''; /* 既存のテキストを消す */

    /* 文字をspanで囲む */
    for (let char of text) {
        const span = document.createElement('span');
        span.innerText = char;
        title.appendChild(span);
    }

    const spans = title.querySelectorAll('span');
    let currentIndex = 0;

    function animateText() {
        /* すべての文字を元のサイズに戻す */
        spans.forEach(span => {
            span.style.transform = 'scale(1)';
        });

        /* 現在の文字を拡大 */
        spans[currentIndex].style.transform = 'scale(1.5)';

        /* 次の文字に行く */
        currentIndex++;

        if (currentIndex >= spans.length) {
            currentIndex = 0; /* 最後に到達したら最初に戻る */
        }
    }

    /* 文字を1秒ごとにアニメーション */
    setInterval(animateText, 500);
}


/* 金色のパーティクル */
function goldParticle() {
    /* 特殊ルールのエフェクトの生成 */
    const particleContainer = document.getElementById("particleContainer");
    const twinSuit = document.getElementById("twinSuit");

    /* twinSuitの位置を取得 */
    const twinSuitRect = twinSuit.getBoundingClientRect();
    
    /* スクロール位置を考慮して、正しい位置を計算 */
    const scrollOffset = window.scrollY;
    const correctedTop = twinSuitRect.top + scrollOffset; /* スクロール位置を加算 */

    /* twinSuitの位置をログに出力 */
    // console.log("Twin Element位置:", twinSuitRect);
    // console.log("修正後の位置:", correctedTop);

    /* particleContainerの位置を調整 */
    particleContainer.style.position = "absolute";
    particleContainer.style.left = `${twinSuitRect.left + 150}px`;
    particleContainer.style.top = `${correctedTop + twinSuitRect.height + 50}px`; /* 少し下に配置 */

    /* パーティクルを生成する関数 */
    function createParticle() {
        const particle = document.createElement("div");
        particle.classList.add("particle");

        /* ランダムな位置を計算 */
        const randomX = Math.random() * 300 - 200; 
        const randomY = Math.random() * 80 - 50; 
        particle.style.transform = `translate(${randomX}px, ${randomY}px)`; /* ランダム位置を設定 */

        particleContainer.appendChild(particle);

        /* パーティクルを1秒後に削除 */
        setTimeout(() => {
            particleContainer.removeChild(particle);
        }, 1000);
    }

    /* 100msごとにパーティクルを生成 */
    setInterval(createParticle, 100);
}

/* 青色のパーティクル */
function blueParticle() {
    /* 特殊ルールのエフェクトの生成 */
    const blueParticleContainer = document.getElementById("blueParticleContainer");
    const twinRank = document.getElementById("twinRank");

    /* twinRankの位置を取得 */
    const twinRankRect = twinRank.getBoundingClientRect();
    
    /* スクロール位置を考慮して、正しい位置を計算 */
    const scrollOffset = window.scrollY;
    const correctedTop = twinRankRect.top + scrollOffset; /* スクロール位置を加算 */

    /* twinRankの位置をログに出力 */
    // console.log("Twin Element位置:", twinRankRect);
    // console.log("修正後の位置:", correctedTop);

    /* blueParticleContainerの位置を調整 */
    blueParticleContainer.style.position = "absolute";
    blueParticleContainer.style.left = `${twinRankRect.left + 150}px`;
    blueParticleContainer.style.top = `${correctedTop + twinRankRect.height + 50}px`; /* 少し下に配置 */

    /* パーティクルを生成する関数 */
    function createParticle() {
        const particle = document.createElement("div");
        particle.classList.add("blue-particle");

        /* ランダムな位置を計算 */
        const randomX = Math.random() * 300 - 200; 
        const randomY = Math.random() * 80 - 50; 
        particle.style.transform = `translate(${randomX}px, ${randomY}px)`; /* ランダム位置を設定 */

        blueParticleContainer.appendChild(particle);

        /* パーティクルを1秒後に削除 */
        setTimeout(() => {
            blueParticleContainer.removeChild(particle);
        }, 1000);
    }

    /* 100msごとにパーティクルを生成 */
    setInterval(createParticle, 100);
}

/* 背景をトランプにする */
function generateCardsBackground() {
    const suits = ['♠', '♥', '♦', '♣']; 
    const body = document.body;
    
    const backgroundDiv = document.createElement('div');
    backgroundDiv.id = 'background';
    body.appendChild(backgroundDiv);

    /* 柄を生成する数 */
    const totalCards = Math.floor((window.innerWidth * window.innerHeight) / 10000); 

    let xPos = 0; 
    let yPos = 0; 
    const cardSize = 100; 

    
    for (let i = 0; i < totalCards; i++) {
        
        const card = document.createElement('div');
        const suit = suits[i % suits.length]; 
        card.innerHTML = suit;

        /* レイアウトの調整 */
        card.style.position = 'absolute';
        card.style.fontSize = `${cardSize}px`;
        card.style.color = 'rgba(128, 128, 128, 0.5)'; 
        card.style.opacity = '0.15'; 

        card.style.left = `${xPos}px`;
        card.style.top = `${yPos}px`;
        
        backgroundDiv.appendChild(card);

        xPos += cardSize; 
        if (xPos + cardSize > window.innerWidth) {
            xPos = 0; 
            yPos += cardSize; 
        }
    }

    /* 背景がスクロールに影響されないように、固定配置 */
    backgroundDiv.style.position = 'fixed';
    backgroundDiv.style.top = '0';
    backgroundDiv.style.left = '0';
    backgroundDiv.style.width = '100%';
    backgroundDiv.style.height = '100%';
    backgroundDiv.style.zIndex = '-1'; 
}

/* 「H」キーを押したときに画像を表示 */
document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('overlay');
    
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

});

/* 各種キーや動作の無効化 */
/* キーボードショートカットの無効化 */
document.addEventListener("keydown", function (event) {
    if (
        event.key === "F12" || /* デベロッパーツール */
        (event.ctrlKey && event.key === "+") || /* ズームイン */
        (event.ctrlKey && event.key === "-") || /*  ズームアウト */
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

// /* カスタマイズの矢印を押したら向きが変わる　*/
// function toggleCheckboxContainer() {
//     document.getElementById("toggle-container").addEventListener("click", function() {
//         const checkboxContainer = document.getElementById("checkbox-container");
//         const arrow = document.getElementById("toggle-arrow");
        
//         if (checkboxContainer.classList.contains("hidden")) {
//             checkboxContainer.classList.remove("hidden");
//             arrow.textContent = "▼"; // 矢印を下向きに変更
//         } else {
//             checkboxContainer.classList.add("hidden");
//             arrow.textContent = "▶"; // 矢印を右向きに変更
//         }
//     });
// }

// // この関数はチェックボックスの状態が変わったときに呼び出されるように設定します
// document.querySelectorAll('.checkbox').forEach(function(checkbox) {
//     checkbox.addEventListener('change', updateRanks);
// });

// // チェックボックスの状態に基づいてranksを更新する関数
// function updateRanks() {
//     var checkboxes = document.querySelectorAll('.checkbox'); // すべてのcheckboxを取得

//     // すべてのチェックボックスに対して処理
//     checkboxes.forEach(function(checkbox) {
//         var value = checkbox.value;  // チェックボックスの値（A, 2, 3 など）
        
//         if (checkbox.checked) {
//             // チェックされていればranksに追加
//             if (!window.ranks.includes(value)) {
//                 window.ranks.push(value);
//             }
//         } else {
//             // チェックされていなければranksから削除
//             var index = window.ranks.indexOf(value);
//             if (index > -1) {
//                 window.ranks.splice(index, 1);
//             }
//         }
//     });

//     // 変更後のranksを表示
//     console.log(window.ranks);
// }


/* タイトル画面からゲーム画面の移動 */
document.getElementById('gama-page-button').addEventListener('click', function () {
    window.location.href = 'HTML/game.html';
});
