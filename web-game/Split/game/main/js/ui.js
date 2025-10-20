// 画面サイズ制限のときのUI
function windowSizeLimitUI() {
    clearCanvas();
    ctx1.fillStyle = "Black"
    ctx1.font = "24px serif"
    drawCenteredText(ctx1, "ウィンドウサイズを合わせてください", cnv1.width / 2, cnv1.height / 2)

    if(window.innerWidth > windowWidth){
        ctx2.fillStyle = "White"
    }else{
        ctx2.fillStyle = "Red"
    }
    ctx2.font = "36px serif"
    drawCenteredText(ctx2, "幅:" + window.innerWidth + "/" + windowWidth, cnv2.width / 2, cnv2.height / 2);

    if(window.innerHeight > windowHeight){
        ctx2.fillStyle = "White"
    }else{
        ctx2.fillStyle = "Red"
    }
    ctx2.font = "36px serif"
    drawCenteredText(ctx2, "高さ:" + window.innerHeight + "/" + windowHeight, cnv2.width / 2, cnv2.height / 2 - 40);
}

//　ゲーム中のUI
function inGameUI(){
    ctx1.fillStyle = "black"
    ctx1.font = "24px monospace"
}

function inGameUIUpdate(){

    H_key();

    if (keys.r) {
        document.location.reload();
    }
}

const image = document.getElementById('image');
let oparateImage = false

// 画像が表示/非表示を切り替える関数
function H_key() {
    // 画像が非表示の場合は表示する
    if (oparateImage) {
        image.style.display = 'block';
    } else {
        image.style.display = 'none';
    }
}

// タイトルに戻るボタンのクリックイベント
document.getElementById("returnButton").addEventListener("click", function () {
    window.location.replace("../../title/canvas.html");
});

document.getElementById("reloadButton").addEventListener("click", function () {
    document.location.reload();
});

document.getElementById("helpButton").addEventListener("click", function () {
    oparateImage = !oparateImage;
});