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
    createObject({ x: gridSize(6), y: gridSize(0), width: gridSize(1), height: gridSize(1), col: 'black', id: "obj7", gimmick: "push" }),
    createObject({ x: gridSize(10), y: gridSize(0), width: gridSize(1), height: gridSize(3), col: 'black', id: "obj6"}),

    createObject({ x: gridSize(16), y: gridSize(0), width: gridSize(1), height: gridSize(1), col: 'black', id: "obj1", gimmick: "push" }),
    createObject({ x: gridSize(25), y: gridSize(0), width: gridSize(1), height: gridSize(1), col: 'white', id: "obj2", gimmick: "push" }),
    createObject({ x: gridSize(25), y: gridSize(0), width: gridSize(1), height: gridSize(1), col: 'black', id: "obj5", gimmick: "push" }),
    createObject({ x: gridSize(20), y: gridSize(0), width: gridSize(1), height: gridSize(4), col: 'black', id: "obj3" }),
    createObject({ x: gridSize(32), y: gridSize(0), width: gridSize(1), height: gridSize(4), col: 'white', id: "obj4" }),
];