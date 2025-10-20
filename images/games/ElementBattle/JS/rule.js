/*
 *
 * rule.js
 * 
 */

/* プレイヤーと敵のエレメントポイントの変数 */
let playerElementPoints = 0;
let opponentElementPoints = 0;

/* Jokerが今選択されているかどうか */
let isSelectingJoker = false;

/* カードを出したときのエレメントポイントの計算 */
function applyCardEffect(card, isPlayer) {
    // console.log('現在のカード:', card); /* 出したカードのsuitとrankが出力される */

    twinSuit(card, isPlayer);
    twinRank(card, isPlayer);
    applySpecialCardRules(card, isPlayer);

    if (specialCard) {
        return; /* スートの計算を省くためにreturn */
    }
    
    else if (card.suit === '♥') {
        if (isPlayer) {
            playerElementPoints += 2;
            showScoreEffect(+2, isPlayer)
            // console.log('自分が♥で+2されてる');
        } else {
            opponentElementPoints += 2;
            showScoreEffect(+2, isPlayer)  // 相手の得点エフェクト
            // console.log('相手が♥で+2されてる');
        }
    } else if (card.suit === '♦') {
        if (isPlayer) {
            playerElementPoints += 1;
            showScoreEffect(+1, isPlayer);
            // console.log('自分が♦で+1されてる');
        } else {
            opponentElementPoints += 1;
            showScoreEffect(+1, isPlayer)  // 相手の得点エフェクト
            // console.log('相手が♦で+1されてる');
        }
    } else if (card.suit === '♣') {
        if (isPlayer) {
            opponentElementPoints = Math.max(0, opponentElementPoints - 1);
            showScoreEffect(-1, !isPlayer);  // 相手の得点エフェクト
            // console.log('相手が♣で-1されてる');
        } else {
            playerElementPoints = Math.max(0, playerElementPoints - 1);
            showScoreEffect(-1, !isPlayer);  // 自分の得点エフェクト
            // console.log('自分が♣で-1されてる');
        }
    } else if (card.suit === '♠') {
        if (isPlayer) {
            opponentElementPoints = Math.max(0, opponentElementPoints - 2);
            showScoreEffect(-2, !isPlayer);  // 相手の得点エフェクト
            // console.log('相手が♠で-2されてる');
        } else {
            playerElementPoints = Math.max(0, playerElementPoints - 2);
            showScoreEffect(-2, !isPlayer);  // 自分の得点エフェクト
            // console.log('自分♠で-1されてる');
        }
    } else if (card.suit === 'J' && card.rank === 'oker') { /* console.logで確認したらこのように区別されていた */
        if (isPlayer) {
            isSelectingJoker = true;
        showJokerOptions(isPlayer);
        } else {
            if (playerElementPoints >= 10) {
                playerElementPoints -= 5; /* これは絶対に負の数に行かないからこれでいい */
                showScoreEffect(-5, !isPlayer);  // 自分の得点エフェクト
            } else {
                opponentElementPoints += 5;
                showScoreEffect(+5, isPlayer);  // 自分の得点エフェクト
            }
        }
    }
   
    // console.log('自分：', playerElementPoints);
    // console.log('敵：', opponentElementPoints);
}

/* 得点を画面に表示してから1秒後に消すエフェクト */
function showScoreEffect(scoreChange, isPlayer) {
    const scoreElement = document.getElementById('scoreEffect');
    
    /* 得点変更メッセージの設定 */
    scoreElement.textContent = (scoreChange > 0 ? "+" : "") + scoreChange;
    scoreElement.style.color = scoreChange > 0 ? 'green' : 'red';  /* 増加は緑、減少は赤 */

    /* 画面上に表示 */
    scoreElement.style.display = 'block';

    /* 表示する位置を調整 */
    scoreElement.style.top = '100px';  

    if (isPlayer) {
        scoreElement.style.left = `${window.innerWidth * 0.5 - scoreElement.offsetWidth / 2}px`; /* プレイヤーは55%位置 */
    } else {
        scoreElement.style.left = `${window.innerWidth * 0.7 - scoreElement.offsetWidth / 2}px`;  /* 相手は80%位置 */
    }

    /* 1.0秒後にフェードアウトを開始 */
    setTimeout(() => {
        scoreElement.style.opacity = 0; 
    }, 1000);

    /* 2.0秒後に得点を非表示にして削除 */
    setTimeout(() => {
        scoreElement.style.display = 'none';
        scoreElement.style.opacity = 1; /* 次回表示のために元の不透明度に戻す */
    }, 2000);
}

/* Jokerを出した際に選択肢を画面上に出す */
function showJokerOptions(isPlayer) {
    const jokerMessage = document.getElementById('joker-message');
    const jokerSelectButtons = document.getElementById('joker-select-buttons');
    /* 背景を薄くする */
    const body = document.querySelector('body'); /* bodyタグを取得 */
    body.classList.add('transparent-background');

    jokerMessage.style.display = 'block';
    jokerSelectButtons.style.display = 'block';
    

    document.getElementById('increase-points').onclick = () => {
        if (isPlayer) {
            playerElementPoints += 5;
            showScoreEffect(+5, isPlayer);  // 自分の得点エフェクト
        }
        hideJokerOptions();
        updateElementPointsDisplay(); /* エレメントポイントを更新 */
        // console.log('ジョーカー出した後の点数');
        // console.log('自分：', playerElementPoints);
        // console.log('敵：', opponentElementPoints);
        checkForWin(); /* 勝利しているかをチェック */
    };

    document.getElementById('decrease-points').onclick = () => {
        if (isPlayer) {
            opponentElementPoints = Math.max(0, opponentElementPoints - 5);
            showScoreEffect(-5, !isPlayer);  // 自分の得点エフェクト
        }
        hideJokerOptions();
        updateElementPointsDisplay(); /* エレメントポイントを更新 */
        // console.log('ジョーカー出した後の点数');
        // console.log('自分：', playerElementPoints);
        // console.log('敵：', opponentElementPoints);
        checkForWin(); /* 勝利しているかをチェック */
    };
    isPlayerTurn = true;
}

/* 選択肢を非表示にする関数 */
function hideJokerOptions() {
    const jokerMessage = document.getElementById('joker-message');
    const jokerSelectButtons = document.getElementById('joker-select-buttons');
    jokerMessage.style.display = 'none';
    jokerSelectButtons.style.display = 'none';

    /* 背景を元に戻す */
    const body = document.querySelector('body'); /* bodyタグを取得 */
    body.classList.remove('transparent-background');

    isSelectingJoker = false; /* ここでJokerのフラグを解除する */
    opponentTurn(); /* 敵のターンを開始する */
}

/* エレメントポイントを表示する関数 */
function updateElementPointsDisplay() {
    document.getElementById('player-points').textContent = playerElementPoints;
    document.getElementById('opponent-points').textContent = opponentElementPoints;
}

/* 勝利かどうかを判定する関数 */
function checkForWin() {
    if (playerElementPoints >= 20) {
        /* ターンの進行を停止する */
        currentPlayer = null;
        setTimeout(() => {
            endGame();
            showVictoryMessage();
        }, 1500); // 1.5秒間待機

    } else if (opponentElementPoints >= 20) {
        /* ターンの進行を停止する */
        currentPlayer = null;
        setTimeout(() => {
            endGame();
            showLoseMessage(); 
        }, 1000); // 1秒間待機
    }
}

/* 勝利メッセージを表示する関数 */
function showVictoryMessage() {
    const victoryMessage = document.getElementById('victory-message');
    victoryMessage.style.display = 'block';
    showEndGameButtons();
}

function showLoseMessage() {
    const loseMessage = document.getElementById('lose-message');
    loseMessage.style.display = 'block';
    showEndGameButtons();
}

/* ゲーム終了時にボタンを２つ用意する */
function showEndGameButtons() {
    const endGameButtons = document.getElementById('end-game-buttons');
    endGameButtons.style.display = 'block';

    /* タイトルへ戻る */
    document.getElementById('return-title').onclick = () => {
        window.location.href = '../index.html';
    };

    /* もう一度プレイする */
    document.getElementById('replay-game').onclick = () => {
        window.location.reload(); /* リロードしてもう一度プレイできるようにする */
    };
}
