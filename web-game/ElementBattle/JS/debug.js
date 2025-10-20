/*
 *
 * debug.js
 * 
 */

/* カードのデバック */
function logDeck(cards) {
    // console.log(cards.map(card => card.toString())); /* デッキの内容を確認 */
}

/*
 map 関数は DOM 要素に適用できないので、
 これをカードオブジェクトに変換する必要がある
 */

function logPlayerCards(cards) {
    // console.log('自分の手札：', Array.from(cards).map(cardElement => cardElement.textContent));
}

function logOpponentCards(cards) {
    // console.log('相手の手札：', Array.from(cards).map(cardElement => cardElement.textContent));
}



