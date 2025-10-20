let frame = 0
let tester = 0
function debug() { //Debug用、最終消す
    if (keys.s) {

        if (keys.e && availableJamp) {
            player1.dy = player1.jumpspeed;
            player1.isonground = false
        }

        if (keys.ArrowUp && availableJamp) {
            player2.dy = player1.jumpspeed;
            player2.isonground = false
        }

    }

    if (keys.r) { // リサイズする
        cnv1.width = window.innerWidth;
        cnv1.height = window.innerHeight / 2;
        cnv2.width = window.innerWidth;
        cnv2.height = window.innerHeight / 2;
    }

    frame++;
}

function debugDraw() {
    if (keys.s) {
        ctx1.fillStyle = "Black"
        ctx1.font = "48px serif"
        ctx1.fillText(player1.x + "," + player1.y, 0, 40);

        ctx2.fillStyle = "White"
        ctx2.font = "48px serif"
        ctx2.fillText(player2.x + "," + player2.y, 0, 40);

        ctx1.fillStyle = "Black"
        ctx1.font = "48px serif"
        ctx1.fillText(frame, cnv1.width -100, 40);

        ctx2.fillStyle = "white"
        ctx2.font = "24px serif"
        ctx2.fillText("E Player1のみジャンプ", cnv2.width - 250, 20);
        ctx2.fillText("↑ Player2のみジャンプ", cnv2.width - 255, 40);
    } else {
        ctx2.fillStyle = "white"
        ctx2.font = "24px serif"
        ctx2.fillText("S デバックモード", cnv2.width - 200, 20);
    }
}