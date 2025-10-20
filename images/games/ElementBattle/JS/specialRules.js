/*
 *
 * specialRules.js
 * 
 */

/*
 * 特殊ルールを適用する関数
 * card: プレイされたカード
 * isPlayer: trueならプレイヤー、falseなら相手
 */

/* プレイヤーと相手の連続したスートの履歴を管理する */
let playerPreviousSuit = null; /* 前回出したスート（プレイヤー）*/
let opponentPreviousSuit = null; /* 前回出したスート（相手）*/

let playerPreviousRank = null; /* 前回出した数字（プレイヤー）*/
let opponentPreviousRank = null; /* 前回出した数字（相手）*/

/* 同じスートを2回連続で出したかを確認する関数 */
function twinSuit(card, isPlayer) {
    let previousSuit;
    if (isPlayer) {
        previousSuit = playerPreviousSuit;
    } else {
        previousSuit = opponentPreviousSuit;
    }

    /* Jokerの場合はリセット */
    if (card.suit === 'J' && card.rank === 'oker') {
        if (isPlayer) {
            // console.log('Jokerリセットできてる');
            playerPreviousSuit = null;
        } else {
            opponentPreviousSuit = null;
        }
        return;
    }

    /* 同じスートが２回連続で出た場合の処理 */
    if (card.suit === previousSuit) {
        showParticleEffect(isPlayer);
        setTimeout(() => {
            let newCard = deck.draw();
            if (isPlayer) {
                addCardToPlayerHand(newCard);
                // console.log('プレイヤーがもう１枚引く');
            } else {
                addCardToOpponentHand(newCard);
                // console.log('相手がもう１枚引く');
            }

            if (isPlayer) {
                playerPreviousSuit = null;
                // console.log('自分のスートカウントをリセット');
            } else {
                opponentPreviousSuit = null;
                // console.log('相手のスートカウントをリセット');
            }

        }, 500)
    } else {
        if (isPlayer) {
            playerPreviousSuit = card.suit;
        } else {
            opponentPreviousSuit = card.suit;
        }
    }
}

function showParticleEffect(isPlayer) {
    let targetArea = document.getElementById('played-cards');
    let particleContainer = document.createElement("div");
    particleContainer.classList.add("particle-container");

    for (let i = 0; i < 10; i++) {
        let particle = document.createElement("div");
        particle.classList.add("particle");
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particleContainer.appendChild(particle);
    }

    targetArea.appendChild(particleContainer);

    setTimeout(() => {
        particleContainer.remove();
    }, 1000);
}

/* 同じ数字を2回連続出したかどうかを判別する処理 */
function twinRank(card, isPlayer) {
    let previousRank;
    if (isPlayer) {
        previousRank = playerPreviousRank;
    } else {
        previousRank = opponentPreviousRank;
        document.getElementById('draw-card').disabled = false; /* 次にカードを引けないようにする */
        document.getElementById('play-card').disabled = true; /* そしてカードを出せるようにする */        
    }

    /* Jokerの場合はリセット */
    if (card.suit === 'J' && card.rank === 'oker') {
        if (isPlayer) {
            playerPreviousRank = null;
        } else {
            opponentPreviousRank = null;
        }
        return;
    }

    /* 同じ数字が２回連続で出た場合の処理 */
    if (card.rank === previousRank) {
        isPlayerTurn = true;
        showBlueParticleEffectRank(isPlayer);
        setTimeout(() => {
            if (isPlayer) {
                for (let i = 0; i < 2; i++) { /* 2回ループしてカードを引く */
                    let newCard = deck.draw();
                    addCardToPlayerHand(newCard);
                }
                // console.log('プレイヤーが２枚引く');
            } else {
                for (let i = 0; i < 2; i++) {
                    let newCard = deck.draw();
                    addCardToOpponentHand(newCard);
                }
                // console.log('相手が２枚引く');
            }

            if (isPlayer) {
                playerPreviousRank = null;
                // console.log('自分の数字カウントをリセット');
            } else {
                opponentPreviousRank = null;
                // console.log('相手の数字カウントをリセット');
            }

        }, 500)
    } else {
        if (isPlayer) {
            playerPreviousRank = card.rank;
        } else {
            opponentPreviousRank = card.rank;
        }
    }
}

function showBlueParticleEffectRank(isPlayer) {
    let targetArea = document.getElementById('played-cards');
    let blueParticleContainer = document.createElement("div");
    blueParticleContainer.classList.add("blue-particle-container");

    for (let i = 0; i < 10; i++) {
        let blueParticle = document.createElement("div");
        blueParticle.classList.add("blue-particle");
        blueParticle.style.left = `${Math.random() * 100}%`;
        blueParticle.style.top = `${Math.random() * 100}%`;
        blueParticleContainer.appendChild(blueParticle);
    }

    targetArea.appendChild(blueParticleContainer);

    setTimeout(() => {
        blueParticleContainer.remove();
    }, 1000);
}