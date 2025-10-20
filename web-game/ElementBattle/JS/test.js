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