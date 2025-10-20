let redirecteded = false;

function drawUI() {
    // ステージ1ボタンのクリックイベント
    if(!redirecteded){
        document.getElementById("stage1Button").addEventListener("click", function () {
            // ステージ1のページへ遷移
            window.location.replace("../main/stage_HTML/stage1.html");
        });
    
        document.getElementById("stage2Button").addEventListener("click", function () {
            // ステージ2のページへ遷移
            window.location.replace("../main/stage_HTML/stage2.html");
        });
    
        document.getElementById("stage3Button").addEventListener("click", function () {
            // ステージ3のページへ遷移
            window.location.replace('../main/stage_HTML/stage3.html');
        });
        
        redirecteded = true;
    }


    displaySwitch("stage1Button",true)
    displaySwitch("stage2Button",true)
    displaySwitch("stage3Button",true)
    displaySwitch("game_title",true)
    displaySwitch("helpButton",true)
    
}

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

    displaySwitch("stage1Button",false)
    displaySwitch("stage2Button",false)
    displaySwitch("stage3Button",false)
    displaySwitch("game_title",false)
    displaySwitch("helpButton",false)

}

let oparateImage = false

// 画像が表示/非表示を切り替える関数
function H_key() {
    // 画像が非表示の場合は表示する
    if (oparateImage) {
        displaySwitch("image",true)
    } else {
        displaySwitch("image",false)
    }
}

document.getElementById("helpButton").addEventListener("click", function () {
    oparateImage = !oparateImage;
});


