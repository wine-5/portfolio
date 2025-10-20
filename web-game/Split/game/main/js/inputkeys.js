// 使うキーを宣言


const keys = {};
const togglekey = { "s": true, "h": true, };

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);


//もし特定のキーがkeyDownしたらtrue、keyUpしたらfalse

function keyDown(e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
    }

    if (togglekey[e.key]) {
        keys[e.key] = !keys[e.key];
        if(e.key === "h"){
            oparateImage = !oparateImage;
        }
        return
    }

    if (e.key === " ") {
        e.preventDefault();
        keys["space"] = true;
    } else {
        keys[e.key] = true;
    }
}

function keyUp(e) {

    if (togglekey[e.key]) {
        return
    }

    if (e.key === " ") {
        keys["space"] = false;
    } else {
        keys[e.key] = false;
    }
}


