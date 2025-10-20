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
    createObject({ x: gridSize(5), y: gridSize(0), width: gridSize(1), height: gridSize(1), col: 'black', id: "psh2", gimmick: "push" }),
    createObject({ x: gridSize(5), y: gridSize(0), width: gridSize(1), height: gridSize(1), col: 'white', id: "psh1", gimmick: "push" }),
    createObject({ x: gridSize(12), y: gridSize(0), width: gridSize(1), height: gridSize(1), col: 'black', id: "swi2", gimmick:"button" }),
    createObject({ x: gridSize(19), y: gridSize(0), width: gridSize(1), height: gridSize(3), col: 'white', id: "obj7" }),
    createObject({ x: gridSize(28), y: gridSize(2), width: gridSize(1), height: gridSize(9.5), col: 'white', id: "obj5" }),
    createObject({ x: gridSize(20), y: gridSize(0), width: gridSize(1), height: gridSize(3), col: 'white', id: "move2", gimmick:"move" }),
    createObject({ x: gridSize(10), y: gridSize(0), width: gridSize(1), height: gridSize(4), col: 'black', id: "obj2" }),

    createObject({ x: gridSize(17), y: gridSize(0), width: gridSize(1), height: gridSize(1), col: 'black', id: "obj3" }),
    createObject({ x: gridSize(23), y: gridSize(0), width: gridSize(4), height: gridSize(4), col: 'white', id: "obj4" }),
    createObject({ x: gridSize(22), y: gridSize(0), width: gridSize(1), height: gridSize(8), col: 'white', id: "obj8" }),
    
    
    
    createObject({ x: gridSize(31), y: gridSize(0), width: gridSize(1), height: gridSize(3), col: 'white', id: "obj6" }),



    createObject({ x: gridSize(34), y: gridSize(0), width: gridSize(1), height: gridSize(1), col: 'white', id: "swi4", gimmick: "button" }),
    createObject({ x: gridSize(37), y: gridSize(0), width: gridSize(1), height: gridSize(1), col: 'white', id: "swi3", gimmick: "button" }),
    createObject({ x: gridSize(33), y: gridSize(0), width: gridSize(1), height: gridSize(1), col: 'white', id: "obj11" }),
    createObject({ x: gridSize(40), y: gridSize(0), width: gridSize(1), height: gridSize(1), col: 'white', id: "swi4", gimmick: "button" }),
    createObject({ x: gridSize(42), y: gridSize(0), width: gridSize(1), height: gridSize(1), col: 'white', id: "swi3", gimmick: "button" }),
    createObject({ x: gridSize(44), y: gridSize(0), width: gridSize(1), height: gridSize(1), col: 'white', id: "swi3", gimmick: "button" }),
    createObject({ x: gridSize(46), y: gridSize(0), width: gridSize(1), height: gridSize(1), col: 'white', id: "swi3", gimmick: "button" }),
    createObject({ x: gridSize(48), y: gridSize(0), width: gridSize(1), height: gridSize(1), col: 'white', id: "swi3", gimmick: "button" }),
    createObject({ x: gridSize(35), y: gridSize(0), width: gridSize(1), height: gridSize(1), col: 'black', id: "swi3", gimmick: "button" }),
    createObject({ x: gridSize(37), y: gridSize(0), width: gridSize(1), height: gridSize(1), col: 'black', id: "swi3", gimmick: "button" }),

    createObject({ x: gridSize(34), y: gridSize(0), width: gridSize(11), height: gridSize(50), col: 'black', id: "move3", gimmick: "move" }),
    createObject({ x: gridSize(44), y: gridSize(0), width: gridSize(1), height: gridSize(2), col: 'black', id: "obj9" }),
    createObject({ x: gridSize(38), y: gridSize(0), width: gridSize(1), height: gridSize(3), col: 'white', id: "obj10" }),
    
];