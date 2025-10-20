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
    createObject({ x: gridSize(15), y: gridSize(0), width: gridSize(1), height: gridSize(1), col: 'black', id: "obj1" }),
    createObject({ x: gridSize(20), y: gridSize(0), width: gridSize(1), height: gridSize(3), col: 'black', id: "obj2" }),

    createObject({ x: gridSize(35), y: gridSize(0), width: gridSize(1), height: gridSize(1), col: 'white', id: "obj3" }),
    createObject({ x: gridSize(40), y: gridSize(0), width: gridSize(1), height: gridSize(3), col: 'white', id: "obj4" }),
];