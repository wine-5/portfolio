
/*
*
* main
*
*/

//canvasを初期化
function clearCanvas() {
    ctx1.clearRect(0, 0, cnv1.width, cnv1.height);
    ctx2.clearRect(0, 0, cnv2.width, cnv2.height);
}

const UPDATE_LOAD_COEFF = 0.5;

let fps = 144;
let targetInterval = 1000 / fps;
let prevTime = performance.now() - targetInterval;

const windowWidth = 1300 // default:1500
const windowHeight = 600 // default 600

//ループ部分
function GameLoop() {

    if(window.innerWidth > windowWidth && window.innerHeight > windowHeight){
        let currentTime = performance.now();
        let updated = false;
        while (currentTime - prevTime > targetInterval * 0.5) {
            update();
            updated = true;
            prevTime += targetInterval;
            const now = performance.now();
            const updateTime = now - currentTime;
            if (updateTime > targetInterval * UPDATE_LOAD_COEFF) {
                // overloaded
                if (prevTime < now - targetInterval) {
                    // do not accumulate too much
                    prevTime = now - targetInterval;
                }
                break;
            }
        }
        if (updated) {
            Draw();
        }
    
        requestAnimationFrame(GameLoop); 
    }else{
       
        
        windowSizeLimitUI();

        requestAnimationFrame(GameLoop); 
    }
}

function Draw(){
    clearCanvas();
    drawPlayer(player1)
    drawPlayer(player2)
    drawUI();
}

function update(){
    new playerLoop(player1);
    new playerLoop(player2);
    playerStats();
    placeObject();
    playerCollision();
    if(keys.o){
        document.location.reload();
    }
    H_key();
}

GameLoop();