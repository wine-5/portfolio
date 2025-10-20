//canvas要素とCanvasRenderingContext2Dを取得する
const cnv1 = document.getElementById("canvas1");
const ctx1 = cnv1.getContext('2d');

const cnv2 = document.getElementById("canvas2");
const ctx2 = cnv2.getContext('2d');

cnv1.width = window.innerWidth;
cnv1.height = window.innerHeight;
cnv2.width = window.innerWidth;
cnv2.height = window.innerHeight;

//それぞれのcanvasの幅をウィンドウサイズに、高さをウィンドウサイズ/2にする
window.onload = function () {

    function resizeCanvas() {
        cnv1.width = window.innerWidth;
        cnv1.height = window.innerHeight / 2;
        cnv2.width = window.innerWidth;
        cnv2.height = window.innerHeight / 2;
    }

    resizeCanvas();

    window.addEventListener('resize', resizeCanvas);
};



/*
*
* 汎用関数
*
*/


//　1ブロックのサイズ
const blockSize = 30;

//　blockSizeのグリッドの値を返す
function gridSize(posi) {
    grid = blockSize * posi;

    return grid;
}

function serchObjects(id) {
    let result = null;
    objects.forEach(obj => {
        if (obj.id === id) {
            result = obj;
        }
    });
    return result;
}

//filltextの指定された位置に中央揃えにする
function drawCenteredText(ctx, text, x, y) {
    var textMetrics = ctx.measureText(text);
    var textWidth = textMetrics.width;
    ctx.fillText(text, x - textWidth / 2, y);
}

//  idの表示/非表示をする
function displaySwitch(id,bool){
    if(bool == false){
        document.getElementById(id).style.visibility = 'hidden';
    }else if (bool == true){
        document.getElementById(id).style.visibility = 'visible';
    }
}