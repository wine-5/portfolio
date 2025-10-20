const player1 = createPlayer({
    x: cnv1.width / 2 - gridSize(4),      // 初期位置x
    y: cnv1.height, // 初期位置y
    col: 'black',        // 色
    linecol: 'white',    // 外枠の色
});

const player2 = createPlayer({
    x: cnv2.width / 2 + gridSize(4),      // 初期位置x
    y: cnv2.height, // 初期位置y
    col: 'white',        // 色
    linecol: 'black',    // 外枠の色
});

let availableJamp // ジャンプできる状態
let isClear = false // クリアしたか

/*
*
*
*
*/

// Playerのデフォルトの数値を設定してoverrideを上書きする関数
function createPlayer(overrides = {}) {
    const defaults = {
        x: gridSize(1),         // 初期位置x
        y: cnv1.height - 50,    // 初期位置y
        width: blockSize,
        height: blockSize,
        col: 'black',           // 色
        linecol: 'white',       // 外枠の色
        speed: 1.25,               // 速さ(default:2)
        jumpspeed: -5.5,         // ジャンプの高さ(default:-5.5)
        dx: 0,                  //　xの変化量
        dy: 0,                  //　yの変化量
        g: 0.2,                 //　重力(default:0.2)
        isonground: false,      //　地面にいるか
        isfarright: false,      //　右端にいるか(クリア判定)
        isfarleft: false,       //　左端にいるか
        iscollisionleft: false, //　右に衝突しているか
        iscollisionright: false,//　左に衝突しているか
        isonobject: false,      //　オブジェクトに乗っているか
        isonplayer: false,
    };

    return { ...defaults, ...overrides };
}

// PlayerをCanvasに描画
function drawPlayer(player) {
    if (player.col == 'black') { //色で描画するCanvasを分ける
        ctx1.fillStyle = player.col
        ctx1.fillRect(player.x, player.y, player.width, player.height);

        ctx2.fillStyle = player.linecol
        ctx2.fillRect(player.x, player.y, player.width, player.height);
        ctx2.fillStyle = player.col
        ctx2.fillRect(player.x + 2.5, player.y + 2.5, player.width - 5, player.height - 5);
    }else if(player.col == 'white'){
        ctx2.fillStyle = player.col
        ctx2.fillRect(player.x, player.y, player.width, player.height);

        ctx1.fillStyle = player.linecol
        ctx1.fillRect(player.x, player.y, player.width, player.height);
        ctx1.fillStyle = player.col
        ctx1.fillRect(player.x + 2.5, player.y + 2.5, player.width - 5, player.height - 5);
    }
}



//Playerの毎フレーム判定するところ
function updatePlayer(player) {
    playerMove(player);

    player.x += player.dx;
    player.y += player.dy;

    // playerが画面外に出ないように範囲を設定
    if (player.y < 0) { // 天井に衝突した場合
        player.y = 0;
        player.dy = 0;
    } else if (player.y + player.height > cnv1.height) { // 地面に衝突した場合
        player.y = cnv1.height - player.height;
        player.dy = 0;
        player.isonground = true;
    }
    if (player.x < 0) {//左に衝突した場合
        player.x = 0;
        player.iscollisionleft = true;
        player.isfarleft = true;
    } else if (player.x + player.width > cnv1.width) {//右に衝突した場合
        player.x = cnv1.width - player.width;
        player.isfarright = true;
        player.iscollisionright = true;
    } else {
        player.isfarleft = false
    }
}

// keyDownを検知して、dx,dyにspped,jumpspeedを与える
function playerMove(player) {
    //X方向
    if (player.col == 'black') { //色で操作キーを変える
        if (keys.d && keys.a) { // 同時押しの場合
            player.dx = 0;
        } else if (keys.a) {
            player.dx = -player.speed;
        } else if (keys.d) {
            player.dx = player.speed;
        } else {
            player.dx = 0;
        }
        //Y方向
        if (!player.isonground) {
            player.dy += player.g;
        }
    
        if (keys.space && availableJamp) {
            player.dy = player.jumpspeed;
            player.isonground = false
        }
    }else if(player.col == 'white'){
        if(keys.ArrowRight && keys.ArrowLeft){
            player.dx = 0;
        }else if(keys.ArrowLeft){
            player.dx = -player.speed;
        }else if(keys.ArrowRight){
            player.dx = player.speed;
        }else{
            player.dx = 0;
        }

        if(!player.isonground){
            player.dy += player.g
        }
    
        if(keys.space && availableJamp){
            player.dy = player.jumpspeed;
            player.isonground = false
        }
    }
    
}

//Playerのループさせたい部分
function playerLoop(player) {
    //右端に行った場合、クリア判定にする
    updatePlayer(player);
}

//Playerの状態を常に監視する
function playerStats() {
    if (player1.isfarright && !player2.isfarright) {
        availableJamp = (player2.isonground)
    } else if (!player1.isfarright && player2.isfarright) {
        availableJamp = (player1.isonground)
    } else {
        availableJamp = (player1.isonground && player2.isonground)
    }
}
