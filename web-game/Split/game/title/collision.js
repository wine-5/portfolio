//Player同士の物理判定する関数
function playerCollision() {


    //Player1の四辺を定義
    let p1left = player1.x; //左
    let p1top = player1.y; //上
    let p1right = player1.x + player1.width; //右
    let p1under = player1.y + player1.height; //下


    //Player2の四辺を定義
    let p2left = player2.x; //左
    let p2top = player2.y; //上
    let p2right = player2.x + player2.width; //右
    let p2under = player2.y + player2.height; //下

    let isPlayer1Above = Math.floor(p1under) <= Math.floor(p2top); // Player1がPlayer2の上にいるか
    let isPlayer2Above = Math.floor(p2under) <= Math.floor(p1top); // Player2がPlayer1の上にいるか
    let isPlayer1Below = p1top >= p2under; // Player1がPlayer2のにいるか
    let isPlayer2Below = p2top >= p1under;

    const isOverlap = (p1right > p2left && p1left < p2right && p1under > p2top && p1top < p2under);// Player1がPlayer2がX方向に重なっているか


    if (isOverlap) {

        if ((!player1.iscollisionleft && !player1.iscollisionright) || (!player2.iscollisionleft && !player2.iscollisionright)) {

            if (p1under > p2top && p1top + (player1.height - player1.height / 3) < p2top && player1.dy > 0 && player2.dy <= 0) {
                player1.dy = 0;
                player1.y = p2top - player1.height;
                player1.isonground = true;
                player1.isonobject = false;
                player1.isonplayer = true;
                isPlayer1Above = true;
            } else if (p2under > p1top && p2top + (player2.height - player2.height / 3) < p1top && player2.dy > 0 && player1.dy <= 0) {
                player2.dy = 0;
                player2.y = p1top - player2.height;
                player2.isonground = true;
                player2.isonobject = false;
                player2.isonplayer = true;
                isPlayer2Above = true;
            }



            if (p1top < p2under && p1under > p2under && player1.dy < 0 && player2.dy >= 0) {
                player1.y = p2under;
                player1.dy = 0;
                isPlayer1Below = true


            } else if (p2top < p1under && p2under > p1under && player2.dy < 0 && player1.dy >= 0) {
                player2.y = p1under;
                player2.dy = 0;
                isPlayer2Below = true
            }
        }

        if (!isPlayer1Above && !isPlayer2Above && !isPlayer1Below && !isPlayer2Below) {

            if (player1.dx > 0 && player2.dx < 0) {
                player1.x = player1.x - player1.dx;
                player2.x = player2.x - player2.dx;
                player1.dx = 0;
                player2.dx = 0;
            }
            if (player1.dx < 0 && player2.dx > 0) {
                player1.x = player1.x - player1.dx;
                player2.x = player2.x - player2.dx;
                player1.dx = 0;
                player2.dx = 0;
            }

            if (player1.dx > 0 && p1right > p2left && !player1.iscollisionright && !player1.isfarright && !player1.isonplayer && !player2.isonplayer) {
                player1.dx = 0
                player1.x = p2left - player1.width;
            } else if (player1.dx < 0 && p1left < p2right && !player1.iscollisionleft && !player1.isfarleft && !player1.isonplayer && !player2.isonplayer) {
                player1.x = p2left + player1.width;
            }

            if (player2.dx > 0 && p1right > p2left && !player2.iscollisionright && !player2.isfarright && !player2.isonplayer && !player1.isonplayer) {
                player2.dx = 0
                player2.x = p1left - player2.width;
            } else if (player2.dx < 0 && p1left < p2right && !player2.iscollisionleft && !player2.isfarleft && !player2.isonplayer && !player1.isonplayer) {
                player2.dx = 0
                player2.x = p1left + player2.width;
            }
        }

    } else {
        notPlayerCollision(player1,player2);
        notPlayerCollision(player2,player1);
    }

    function notPlayerCollision(player,player2) {
        player.isonground = false;
        if (!player.isonobject) {
            player.isonground = false;
        } else {
            player.isonground = true;
        }

        player.iscollisionright = false;
        player.iscollisionleft = false;
        player.isonobject = false;


        if (player.y + player.height === player2.y && p1right > p2left && p1left < p2right) {
            player.isonplayer = true;
        }else{
            player.isonplayer = false;
        }
        
    }
}

