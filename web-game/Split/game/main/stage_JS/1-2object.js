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
    createObject({ x: gridSize(15), y: gridSize(0), width: gridSize(1), height: gridSize(1), col: 'black', id: "obj1", }),
    createObject({ x: gridSize(15), y: gridSize(2), width: gridSize(1), height: gridSize(1), col: 'black', id: "obj2", }),
    
    createObject({ x: gridSize(18), y: gridSize(0), width: gridSize(1), height: gridSize(5), col: 'black', id: "obj4", }),
    createObject({ x: gridSize(18), y: gridSize(1), width: gridSize(1), height: gridSize(1), col: 'white', id: "obj6", }),
    createObject({ x: gridSize(30), y: gridSize(0), width: gridSize(1), height: gridSize(3), col: 'white', id: "obj5", }),
    
    createObject({ x: gridSize(25), y: gridSize(0), width: gridSize(1), height: gridSize(1), col: 'black', id: "obj3", }),
    createObject({ x: gridSize(32), y: gridSize(1), width: gridSize(5), height: gridSize(7), col: 'white', id: "obj7", }),
    createObject({ x: gridSize(33), y: gridSize(0), width: gridSize(1), height: gridSize(3), col: 'black', id: "obj8", }),
    createObject({ x: gridSize(38), y: gridSize(0), width: gridSize(1), height: gridSize(3), col: 'black', id: "obj9", }),
]