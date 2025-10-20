/*
 *
 * background.js
 * 
 */

window.addEventListener("load", function() {
    generateCardsBackground();
});

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