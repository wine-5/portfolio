function createObject({
    x,
    y,
    width,
    height,
    col, 
    id,
    gimmick = null,
    dx = 0,
    dy = 0,
    g = 0.5,
}) {
    return { x, y, width, height, col, id, gimmick, dx, dy, g };
}
/*
    通常オブジェクト作成
    createObject({ x: gridSize(0), y: gridSize(0), width: gridSize(1), height: gridSize(1), col: 'black', id: "obj", }),
*/

const objects = [
    // createObject({ x: gridSize(5), y: gridSize(0), width: gridSize(1), height: gridSize(1), col: 'white', id: "swi2", gimmick: "button" }),
    // createObject({ x: gridSize(10), y: gridSize(0), width: gridSize(1), height: gridSize(10), col: 'black', id: "move2", gimmick: "move" }),

    // createObject({ x: gridSize(20), y: gridSize(0), width: gridSize(1), height: gridSize(1), col: 'black', id: "swi1", gimmick: "button" }),
    // createObject({ x: gridSize(25), y: gridSize(0), width: gridSize(1), height: gridSize(5), col: 'white', id: "move1", gimmick: "move" }),

    createObject({ x: gridSize(30), y: gridSize(0), width: gridSize(1), height: gridSize(1), col: 'white', id: "swi4", gimmick: "button" }),
    createObject({ x: gridSize(34), y: gridSize(0), width: gridSize(1), height: gridSize(1), col: 'white', id: "swi3", gimmick: "button" }),
    createObject({ x: gridSize(39), y: gridSize(0), width: gridSize(1), height: gridSize(10), col: 'black', id: "move3", gimmick: "move" }),
    createObject({ x: gridSize(41), y: gridSize(0), width: gridSize(1), height: gridSize(10), col: 'black', id: "obj1" }),
];