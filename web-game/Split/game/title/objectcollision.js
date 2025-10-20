/*
*
*   objctの描画
*
*/

function objectGraphics(obj, ctx) {
    obj.ay = cnv1.height - obj.height - obj.y
    switch (obj.gimmick) {
        case 'push':
            pushObjGraphics(obj, ctx);
            break;
        case 'button':
            buttonObjGraphics(obj, ctx);
            break;
        default:
            ctx.fillStyle = obj.col
            ctx.fillRect(obj.x, obj.ay, obj.width, obj.height)
            break;
    }
}

/*
*
*   objctの物理判定
*
*/

player1.collidedObjectId = null;
player2.collidedObjectId = null;

function objectCollision(obj, player) {

    let oleft = obj.x; //左
    let otop = obj.ay; //上
    let oright = obj.x + obj.width; //右
    let ounder = obj.ay + obj.height; //下


    let pleft = player.x; //左
    let ptop = player.y; //上
    let pright = player.x + player.width; //右
    let punder = player.y + player.height; //下

    let isPlayerAbove = punder <= otop;
    let isPlayerBelow = ptop >= ounder;

    if (pright > oleft && pleft < oright && punder > otop && ptop < ounder) {
        switch (obj.gimmick) {
            case 'button': 
                obj.isonswich = true;
                buttonPress(obj, player);
                break;
            default:
                player.collidedObjectId = obj.id;
                if (!player.iscollisionleft && !player.iscollisionright) {
                    if (punder > otop && ptop + (player.height - player.height / 3) < otop && player.dy > 0 && !isPlayerAbove) {
                        player.dy = 0;
                        player.y = otop - player.height;
                        isPlayerAbove = true;
                        player.isonground = true;
                        player.isonobject = true;
                        player.isonplayer = false;
                    }

                    if (ptop < ounder && punder > ounder && player.dy < 0) {
                        player.dy = 0;
                        player.y = ounder;
                        isPlayerBelow = true;
                    }
                }

                if (!isPlayerAbove && !isPlayerBelow && !player.isonobject) {

                    if (pright > oleft && player.dx > 0) {
                        switch (obj.gimmick) {
                            case 'push':
                                objPush(obj, player);
                                break;
                            default:
                                player.dx = 0
                                player.x = oleft - player.width;
                                player.iscollisionright = true;
                                break;
                        }
                    }

                    if (pleft < oright && player.dx < 0) {
                        switch (obj.gimmick) {
                            case 'push':
                                objPush(obj, player);
                                break;
                            default:
                                player.dx = 0
                                player.x = oright;
                                player.iscollisionleft = true
                                break;
                        }
                    }
                }
                break;
        }
    } else {
        switch (obj.gimmick) {
            case 'button': 
                obj.isonswich = false;
                buttonRelease(obj,player)
                break;
            default:
                if (player.collidedObjectId == obj.id) {
                    player.iscollisionright = false
                    player.iscollisionleft = false
                    player.isonground = false
                    if (player.y + player.height === otop && pright > oleft && pleft < oright) {
                        player.isonobject = true
                        player.isonground = true
                    } else {
                        player.isonobject = false
                    }
                    //console.log(`${player.col} ${obj.id}`)
                }
                break;
        }
    }
}

/*
*
*   objctsを関数に渡す関数
*
*/


function setObjectCollision(obj) {
    const player = obj.col === 'black' ? player1 : player2;
    new objectCollision(obj, player);
}

function setObjectDraw(obj) {
    const ctx = obj.col === 'black' ? ctx1 : ctx2;
    objectGraphics(obj, ctx);
}

function placeObject() {
    objects.forEach(obj => setObjectCollision(obj));
}

function drawObject() {
    objects.forEach(obj => setObjectDraw(obj));
}