
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


let isInitialized = false; /* ループされてしまうから1度だけ実行するようにする */

function stageClear() {
    if (isClear) {
        // console.log("stageClear called, isClear:", isClear);
        ctx1.fillStyle = "Red"
        ctx1.font = "48px serif"
        drawCenteredText(ctx1,"CLEAR", window.innerWidth / 2, window.innerHeight / 3);

        /* ゲームクリア後の選択画面 */
        if (!isInitialized) {
            /* タイトルへ戻る */
            const titleButton = document.createElement("button");
            titleButton.id = "titleButton";
            titleButton.innerText = "←";
            document.getElementById("clear-UI").appendChild(titleButton);

            /* 次のステージへ行く */
            const nextStageButton = document.createElement("button");
            nextStageButton.id = "nextStageButton";
            nextStageButton.innerText = "→";
            document.getElementById("clear-UI").appendChild(nextStageButton);

            /* プレイヤーがクリアしたステージを判別する */
            const scripts = document.getElementsByTagName('script');
            for (let i = 0; i < scripts.length; i++) {
                if (scripts[i].src.includes('1-1object.js')) {
                    document.getElementById("nextStageButton").addEventListener("click", function () {
                        /* ステージ1-2へ移動 */
                        window.location.replace("../stage_HTML/stage1-2.html");
                    });
                } else if (scripts[i].src.includes('1-2object.js')) {
                    document.getElementById("nextStageButton").addEventListener("click", function () {
                        /* ステージ2へ移動 */
                        window.location.replace("../stage_HTML/stage2.html");
                    }); 
                } else if (scripts[i].src.includes('2-1object.js')) {
                    document.getElementById("nextStageButton").addEventListener("click", function () {
                        /* ステージ2-2へ移動 */
                        window.location.replace("../stage_HTML/stage2-2.html");
                    }); 
                }  
                else if (scripts[i].src.includes('2-2object.js')) {
                    document.getElementById("nextStageButton").addEventListener("click", function () {
                        /* ステージ3へ移動 */
                        window.location.replace("../stage_HTML/stage3.html");
                    }); 
                }
                else if (scripts[i].src.includes('3-1object.js')) {
                    document.getElementById("nextStageButton").addEventListener("click", function () {
                        /* ステージ3-2へ移動 */
                        window.location.replace("../stage_HTML/stage3-2.html");
                    }); 
                }  
                else if (scripts[i].src.includes('3-2object.js')) {
                    nextStageButton.remove(); /* 最後のステージのため、次のステージに行くボタンを削除する */
                }
            }

            /* タイトルへ遷移 */
            document.getElementById("titleButton").addEventListener("click", function () {
                window.location.replace("../../title/canvas.html");
            });

            isInitialized = true;
        }
    }
}

const UPDATE_LOAD_COEFF = 0.5;

let fps = 144;
let targetInterval = 1000 / fps;
let prevTime = performance.now() - targetInterval;

const windowWidth = 1300 // default:1500
const windowHeight = 600 // default 600

//ループ部分
function GameLoop() {

    if (window.innerWidth > windowWidth && window.innerHeight > windowHeight) {
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
    } else {

        windowSizeLimitUI();

        requestAnimationFrame(GameLoop);
    }
}



function Draw() {
    clearCanvas();
    drawObject();
    inGameUI();

    if (!player1.isfarright) {
        drawPlayer(player1)
    }
    if (!player2.isfarright) {
        drawPlayer(player2)
    }

    stageClear();
}

function update() {
    debug()
    new playerLoop(player1);
    new playerLoop(player2);
    playerStats();
    placeObject();
    playerCollision();
    inGameUIUpdate();
}

GameLoop();