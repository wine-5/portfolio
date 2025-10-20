/*

push
押せるオブジェクト

*/

function pushObjGraphics(obj, ctx) {
    const offset = 2
    ctx.fillStyle = obj.col
    ctx.fillRect(obj.x, obj.ay, obj.width, obj.height)
    ctx.beginPath();
    ctx.moveTo(obj.x + (obj.width / 2), obj.ay + offset);
    ctx.lineTo(obj.x + obj.width - offset, obj.ay + (obj.height / 2));
    ctx.lineTo(obj.x + (obj.width / 2), obj.ay + obj.height - offset)
    ctx.lineTo(obj.x + offset, obj.ay + (obj.height / 2))
    ctx.lineTo(obj.x + (obj.width / 2), obj.ay + offset);
    if (obj.col === 'black') {
        ctx.fillStyle = 'white'
    } else {
        ctx.fillStyle = 'black'
    }
    ctx.fill();
}

function objPush(obj, player) {
    obj.dx = player.dx;
    obj.x += obj.dx

    if (obj.x < 0) {//左に衝突した場合
        obj.x = 0;
        player.dx = 0
        player.x = obj.x + player.width
    } else if (obj.x + obj.width > cnv1.width) {//右に衝突した場合
        obj.x = cnv1.width - obj.width;
        player.dx = 0
        player.x = obj.x - player.width
    }

    objects.forEach(obj2 => {
        if (obj !== obj2 && obj.col === obj2.col) {
            pushObjCollision(obj, obj2, player);
        }
    });

}

function pushObjCollision(obj, obj2, player) {

    let isobjAbove = obj.y + obj.height <= obj2.y;
    if (obj.x + obj.width > obj2.x && obj.x < obj2.x + obj2.width && obj.y + obj.height > obj2.y && obj.y < obj2.y + obj2.height) {
        if (!isobjAbove) {
            if (obj.x + obj.width > obj2.x && obj.dx > 0) {

                obj.dx = 0;
                obj.x = obj2.x - obj.width

                player.dx = 0
                player.x = obj.x - player.width;
                player.iscollisionright = true;
            }

            if (obj.x < obj2.x + obj2.width && obj.dx < 0) {

                obj.dx = 0;
                obj.x = obj2.x + obj2.width

                player.dx = 0
                player.x = obj.x + obj.width;
                player.iscollisionleft = true;
            }
        }
    }

}

/*

button

*/

function buttonObjGraphics(obj, ctx) {
    ctx.fillStyle = obj.col
    ctx.fillRect(obj.x, obj.ay + (obj.height - obj.height / 4), obj.width, obj.height / 4)
    if (obj.isonswich) {
        ctx.fillRect(obj.x + (obj.width / 4), obj.ay + (obj.height - obj.height / 3), obj.width / 2, obj.height / 3)
    } else {
        ctx.fillRect(obj.x + (obj.width / 4), obj.ay + (obj.height - obj.height / 2), obj.width / 2, obj.height / 3)
    }
}

function buttonPress(obj, player = null) {
    switch (obj.id) {
        case 'swi1':
            downObj1();
            break;
        case 'swi2':
            upObj2();
            break;
        case 'swi3':
            downObj3();
            break;
        case 'swi4':
            upObj3();
            break;
        case 'swi5':
            sizeDownPlayer1();
            break;
    }
}

function buttonRelease(obj, player = null) {
    switch (obj.id) {
        case 'swi5':
            sizeResetPlayer1();
            break;
        case 'swi1':
        case 'swi2':
        case 'swi3':
        case 'swi4':
            resetDirectY(obj);
            break;
    }
}





function resetDirectY(obj) {
    switch(obj.id){
        case 'swi1':
            obj = serchObjects('move1')
            break
        case 'swi2':
            obj = serchObjects('move2')
            break
        case 'swi3':
            obj = serchObjects('move3')
            break
        case 'swi4':
            obj = serchObjects('move4')
            break
    }
    
    if (obj && obj.dy != 0) {
        obj.dy = 0
    }

}
function moveObject(obj) {
    if (obj && obj.dy != 0) {
        obj.y += obj.dy
    }
}

function downObj(obj,player){
    speed = -0.5
    if(obj.x + obj.width > player.x && obj.x < player.x + player.width && obj.ay + obj.height > player.y && obj.ay < player.y + player.height){
        if(obj.ay + obj.height > player.y && obj.ay < player.y && player.dy <= 0 ){
            obj.dy = 0
        }
    }else{
        if (obj.y + obj.height >= gridSize(0)) {
            obj.dy = speed
        }else{
            obj.dy = 0
        }
    }
}

function upObj(obj){
    speed = 0.5
    if (obj.y <= cnv1.height) {
        obj.dy = speed
    }else{
        obj.dy = 0
    }

    const player = obj.col === 'black' ? player1 : player2;
    
    if(obj.x + obj.width > player.x && obj.x < player.x + player.width && obj.ay + obj.height > player.y && obj.ay < player.y + player.height){
        if(player.y + player.height > obj.ay && player.y <= 0){
            obj.dy = 0
        } 
    }
}

function downObj1() {

    obj = serchObjects('move1')
    player = player1
    downObj(obj,player)

    moveObject(obj);
}

function upObj2() {

    obj = serchObjects('move2')
    upObj(obj);
    obj.dy = 0.5

    moveObject(obj);
}

function downObj3() {
    obj = serchObjects('move3')
    player = player1
    downObj(obj,player)

    moveObject(obj);
}

function upObj3() {
    obj = serchObjects('move3')
    upObj(obj)

    moveObject(obj);
}

/* 

move 

*/

function moveObjectCol(obj, player) {
    let oleft = obj.x; //左
    let otop = obj.ay; //上
    let oright = obj.x + obj.width; //右
    let ounder = obj.ay + obj.height; //下


    let pleft = player.x; //左
    let ptop = player.y; //上
    let pright = player.x + player.width; //右
    let punder = player.y + player.height; //下

    let isPlayerAbove = Math.floor(punder) <= Math.floor(otop);
    let isPlayerBelow = Math.floor(ptop) >= Math.floor(ounder);

    if (!player.iscollisionleft && !player.iscollisionright) {
        if (punder > otop && ptop + (player.height - player.height / 3) < otop && player.dy >= 0 &&  !isPlayerAbove) {
            player.dy = 0;
            player.y = otop - player.height;
            isPlayerAbove = true;
            player.isonground = true;
            player.isonobject = true;
            player.isonplayer = false;

        }

        if (ptop < ounder && punder > ounder && player.dy < 0 ) {
            obj.dy = 0
            player.dy = 0;
            player.y = ounder;
            isPlayerBelow = true;
        }
        
    }

    if (!isPlayerAbove && !isPlayerBelow && !player.isonobject) {

        if (pright > oleft && player.dx > 0) {
            player.dx = 0
            player.x = oleft - player.width;
            player.iscollisionright = true;
        }

        if (pleft < oright && player.dx < 0) {
            player.dx = 0
            player.x = oright;
            player.iscollisionleft = true

        }
    }
}



