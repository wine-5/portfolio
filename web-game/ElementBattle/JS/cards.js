/*
 *
 * cards.js
 * 
 */

/* デッキの定義 */

/* グローバル変数の定義 */
window.suits = ['♥', '♦', '♣', '♠']; /* スート（マーク）の定義 */
window.ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']; /* 数字の定義 */


// window.ranks = ['A', '7', 'K']; /* 数字の定義 */
// window.ranks = ['2']; /* 数字の定義 */


/* 別のJSファイルで呼び出すためグローバル変数にする */
window.Card = class {
    constructor(suit, rank) {
        this.suit = suit;
        this.rank = rank;
    }

    /* カードの情報を文字列として返すメソッドを追加 */
    toString() {
        if (this.suit === 'Joker') {
            return 'Joker';
        }
        return `${this.suit}${this.rank}`;
    }
};


window.Deck = class {
    constructor() {
        this.cards = [];
        this.initializeDeck();
    }

    /* デッキを初期化するメソッドの定義 */
    initializeDeck() {
        /* 52枚(13 * 4)のカード生成 */
        for (let suit of suits) {
            for (let rank of ranks) {
                this.cards.push(new Card(suit, rank)); /* cardsに格納する */
            }
        }

        /* Jokerを追加 */
        this.cards.push(new Card('Joker', ''));
        this.cards.push(new Card('Joker', ''));
    }

    /* カードを混ぜる処理 */
    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--){
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
        // logDeck(this.cards); // debug.jsの関数を呼び出す
    }

    /* カードを1枚引くメソッド */
    draw() {
        if (this.cards.length === 0) { /* カード54枚を使い切ったら */
            this.initializeDeck();
            this.shuffle();
        }
        return this.cards.pop(); /* pop:スタックの「後入れ先出し（LIFO: Last In, First Out）」*/
    }
}

/* カードをHTML要素として生成する関数*/
function createCardElement(card) {
    const cardElement = document.createElement('div');
    cardElement.className = 'card';
    cardElement.textContent = card.toString();

    /* カードに色をつけるためにclassを付与する */
    if ((card.suit === '♠' && card.rank === 'A')) {
        cardElement.classList.add('spade-A');
    } else if (card.suit === '♥' && card.rank === '7' ) {
        cardElement.classList.add('hart-7');
    } else if (card.suit === '♦' && card.rank === '7' ) {
        cardElement.classList.add('diamond-7');
    } else if ((card.suit === '♥' && card.rank === 'K') || ( card.suit === '♦' && card.rank === 'K')) {
        cardElement.classList.add('heart-diamond-K');
    } else if ((card.suit === '♣' && card.rank === 'K') || ( card.suit === '♠' && card.rank === 'K')) {
        cardElement.classList.add('spade-club-K');
    } else if (card.suit === '♥' || card.suit === '♦') {
        cardElement.classList.add('heart-diamond')
    } else if (card.suit === '♠' || card.suit === '♣') {
        cardElement.classList.add('spade-club');
    } else {
        cardElement.classList.add('joker');
    }
    return cardElement;
}

/* プレイヤー手札からカードを選択する関数 */
function selectCardFromPlayerHand(cardElement) {
    const selectedCard = document.querySelector('.selected-card');
    if (selectedCard) {
        selectedCard.classList.remove('selected-card');
    }
    cardElement.classList.add('selected-card');
}

/* プレイヤーに手札を追加する関数 */
function addCardToPlayerHand(card) {
    const playerHand = document.querySelector('#player-hand #cards'); /* #player-hand 内の #cardsを取得する */
    const cardElement = createCardElement(card);
    cardElement.addEventListener('click', () => selectCardFromPlayerHand(cardElement));
    playerHand.appendChild(cardElement);

    // logPlayerCards(playerHand.children); /* デバック */
}

/* 相手のに手札を追加する関数 */
function addCardToOpponentHand(card) {
    const opponentHand = document.querySelector('#opponent-hand #cards');
    const cardElement = createCardElement(card);
    opponentHand.appendChild(cardElement);

    logOpponentCards(opponentHand.children); /* デバック */
}



/* 各プレイヤーにカードを５枚ずつ最初に配る */
function dealInitialCards () {
    for (let i = 0; i < 5; i++) {
        addCardToPlayerHand(deck.draw());
        addCardToOpponentHand(deck.draw());
    }
}

/* プレイエリアにカードを出せるようにする関数 */
let zIndexCounter = 1;

function playCard() {
    if (!isPlayerTurn) return; // プレイヤーのターンでない場合は無視

    const selectedCard = document.querySelector('.selected-card');
    
    if (!selectedCard) {
        alert('カードを選択してください！');
        return;
    }

    // console.log('自分がカードを出したよ');


    const playArea = document.querySelector('#play-area #played-cards');
    
    /* カードをプレイエリアに移動させる */
    const initialRect = selectedCard.getBoundingClientRect();
    const playAreaRect = playArea.getBoundingClientRect();
    selectedCard.style.position = 'absolute';
    selectedCard.style.top = `${initialRect.top}px`;
    selectedCard.style.left = `${initialRect.left}px`;
    selectedCard.style.zIndex = zIndexCounter++; /* カードの重ね順を設定 */


    /* 少し経ったらプレイエリアにカードを移動させる */

    setTimeout(() => {
        selectedCard.style.top = `${playAreaRect.top}px`;
        selectedCard.style.left = `${playAreaRect.left - 70}px`;
        selectedCard.style.transition = 'top 1s ease-in-out, left 1s ease-in-out';
        selectedCard.style.pointerEvents = 'none'; /* カードの操作を無効にする */

        selectedCard.classList.remove('selected-card'); /* カードの選択状態を解除する => そうすることで連続してポイントを取得できなくなる */
    }, 0);
}

/* カスタマイズで実装できなかったコード */

/* カスタマイズしたカードを反映させる */
// function cardCustomization() {
//     const selectedRanks = [];

//     // ランクの選択を取得
//     document.querySelectorAll('input[name="card"]:checked').forEach(checkbox => {
//         selectedRanks.push(checkbox.value);
//     });

//     console.log(selectedRanks); // ここでチェックされた値を確認

//     // 何も選ばれなかった場合はデフォルト設定（すべてのランクを使用）
//     if (selectedRanks.length === 0) {
//         selectedRanks.push(...window.ranks); // すべてのランクを設定
//     }

//     // 選択したランクを設定
//     window.ranks = selectedRanks;

//     console.log("使用するカード:", window.ranks);
// }




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




