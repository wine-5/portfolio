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
    createObject({ x: gridSize(5), y: gridSize(0), width: gridSize(1), height: gridSize(1), col: 'black', id: "obj1", gimmick:'push'}),
    createObject({ x: gridSize(10), y: gridSize(0), width: gridSize(1), height: gridSize(3), col: 'black', id: "obj2",}),

    createObject({ x: gridSize(16), y: gridSize(0), width: gridSize(1), height: gridSize(3), col: 'white', id: "obj3", gimmick:'push'}),
    createObject({ x: gridSize(25), y: gridSize(0), width: gridSize(1), height: gridSize(5), col: 'white', id: "obj4",}),
    createObject({ x: gridSize(13), y: gridSize(0), width: gridSize(1), height: gridSize(1), col: 'white', id: "obj5",}),
    
    createObject({ x: gridSize(30), y: gridSize(0), width: gridSize(1), height: gridSize(1), col: 'black', id: "obj6", gimmick:'push'}),
    createObject({ x: gridSize(30), y: gridSize(0), width: gridSize(1), height: gridSize(1), col: 'white', id: "obj7", gimmick:'push'}),

    createObject({ x: gridSize(40), y: gridSize(0), width: gridSize(1), height: gridSize(4), col: 'black', id: "obj8", }),
    createObject({ x: gridSize(40), y: gridSize(0), width: gridSize(1), height: gridSize(3), col: 'white', id: "obj9", }),
];  