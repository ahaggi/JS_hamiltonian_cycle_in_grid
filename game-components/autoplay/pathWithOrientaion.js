import { gridSideLen } from "../grid.js"


const Orientation = {
    LEFT_OPEN_PATH: "LEFT_OPEN_PATH",
    RIGHT_OPEN_PATH: "RIGHT_OPEN_PATH",
    UP_OPEN_PATH: "UP_OPEN_PATH",
    DOWN_OPEN_PATH: "DOWN_OPEN_PATH",
}

class PathWithOrientaion {
    #originalOrientation
    #originalNodes
    #rotatedNodes
    constructor(_nodes, orientation) {
        this.#originalOrientation = orientation
        this.#originalNodes = _nodes

        this.orientation = orientation
        this.#rotatedNodes = _nodes
    }
    get nodes() {
        return this.#rotatedNodes
    }
    getRotatedNodes(newOrientation) {

        if (newOrientation == this.orientation)
            return

        if (newOrientation == this.#originalOrientation) {
            this.orientation = this.#originalOrientation
            this.#rotatedNodes = this.#originalNodes
            return
        }


        let temp = []
        if (newOrientation == Orientation.RIGHT_OPEN_PATH) {
            temp = makeItRightOpenPath(this.#originalNodes, this.#originalOrientation)
        } else if (newOrientation == Orientation.LEFT_OPEN_PATH) {
            temp = makeItLeftOpenPath(this.#originalNodes, this.#originalOrientation)
        } else if (newOrientation == Orientation.UP_OPEN_PATH) {
            temp = makeItUpOpenPath(this.#originalNodes, this.#originalOrientation)
        } else if (newOrientation == Orientation.DOWN_OPEN_PATH) {
            temp = makeItDownOpenPath(this.#originalNodes, this.#originalOrientation)
        }

        if (temp.length == 0) {
            console.log(`nodes are`)
            console.log(this.#originalNodes)
            throw `Err temp.length == 0, while newOrientation value is ${newOrientation} and this.orientation value is ${this.#originalOrientation}`
        }

        this.orientation = newOrientation
        this.#rotatedNodes = temp

    }
}


const circularShift = (nodes, nrOfElms) => {
    // nodes = [1, 2, 3, 4, 5, 6]
    // circularShift(nodes, 2) ==> [3, 4, 5, 6, 1, 2]
    let fstSection = nodes.slice(nrOfElms)
    let sndSection = nodes.slice(0, nrOfElms)
    nodes = [...fstSection, ...sndSection]
    return nodes

}

const makeItRightOpenPath = (nodes, fromOrientation) => {
    if (fromOrientation == Orientation.LEFT_OPEN_PATH) {
        // if isolatedSubgraph is 
        // [11, 12, 13, 14, 22, 21, 20, 19]
        // in order to concat these to the right wall we need to rotate the elements to be
        // [22, 21, 20, 19, 11, 12, 13, 14]
        let p = nodes.length / 2
        return circularShift(nodes, p)

    } else if (fromOrientation == Orientation.UP_OPEN_PATH || fromOrientation == Orientation.DOWN_OPEN_PATH) {

        // in order to concat these to the left wall we need to rotate the elements to be

        // If UP_OPEN_PATH     14	22	30	38	37	29	21	13   ,OR
        // If DOWN_OPEN_PATH   37	29	21	13  14	22	30	38

        // To be               30	38	37	29  21	13	14	22	


        // If UP_OPEN_PATH     12  20  28  36  37  29  21  13   ,OR
        // If DOWN_OPEN_PATH   37  29  21  13  12  20  28  36  

        // To be               21  13  12  20  28  36  37  29

        let p1 = nodes.length / 4
        let p2 = 0

        if (nodes[0] - nodes[nodes.length - 1] == -1) {
            p2 = nodes.length / 2
        }
        return circularShift(nodes, p1 + p2)

    }
    else {
        console.log(path)
        throw 'makeItRightOpenPath: Err path is niether left,up nor down oriented!'
    }
}

const makeItLeftOpenPath = (nodes, fromOrientation) => {
    if (fromOrientation == Orientation.RIGHT_OPEN_PATH) {
        // if isolatedSubgraph is 
        // [21	20	19	18	26	27	28	29]
        // in order to concat these to the left wall we need to rotate the elements to be
        // [26	27	28	29  21	20	19	18]

        let p = nodes.length / 2
        return circularShift(nodes, p)

    } else if (fromOrientation == Orientation.UP_OPEN_PATH || fromOrientation == Orientation.DOWN_OPEN_PATH) {

        // in order to concat these to the left wall we need to rotate the elements to be

        // If UP_OPEN_PATH     14	22	30	38	37	29	21	13   ,OR
        // If DOWN_OPEN_PATH   37	29	21	13  14	22	30	38

        // To be               21	13	14	22	30	38	37	29




        // If UP_OPEN_PATH     12  20  28  36  37  29  21  13   ,OR
        // If DOWN_OPEN_PATH   37  29  21  13  12  20  28  36  

        // To be               28  36  37  29  21  13  12  20


        let p1 = nodes.length / 4
        let p2 = 0

        if (nodes[0] - nodes[nodes.length - 1] == 1) {
            p2 = nodes.length / 2
        }
        return circularShift(nodes, p1 + p2)

    }

    else {
        console.log(path)
        throw 'makeItLeftOpenPath: Err path is niether right,up nor down oriented!'
    }
}

const makeItUpOpenPath = (nodes, fromOrientation) => {
    if (fromOrientation == Orientation.DOWN_OPEN_PATH) {
        // 53	45	37	29	21	13	14	22	30	38	46	54
        // in order to concat these to the down wall we need to rotate the elements to be
        // 14	22	30	38	46	54 53	45	37	29	21	13 

        let p = nodes.length / 2
        return circularShift(nodes, p)
    } else if (fromOrientation == Orientation.LEFT_OPEN_PATH || fromOrientation == Orientation.RIGHT_OPEN_PATH) {

        // in order to concat these to the left wall we need to rotate the elements to be

        // If LEFT_OPEN_PATH     11   12  13  14  22  21  20  19   ,OR
        // If RIGHT_OPEN_PATH    22  21  20  19   11  12  13  14

        // To be                 13  14  22  21  20  19   11   12


        // If LEFT_OPEN_PATH     27  28  29  30   22  21  20  19  ,OR
        // If RIGHT_OPEN_PATH    22  21  20  19   27  28  29  30

        // To be                 20  19   27  28  29  30  22  21


        let p1 = nodes.length / 4
        let p2 = 0

        if (nodes[0] - nodes[nodes.length - 1] == gridSideLen) {
            p2 = nodes.length / 2
        }
        return circularShift(nodes, p1 + p2)

    } else {
        console.log(nodes)
        throw 'makeItUpOpenPath: Err path is niether left,right nor down oriented!'
    }
}

const makeItDownOpenPath = (nodes, fromOrientation) => {
    if (fromOrientation == Orientation.UP_OPEN_PATH) {
        // 14	22	30	38	37	29	21	13
        // in order to concat these to the left wall we need to rotate the elements to be
        // 37	29	21	13  14	22	30	38
        let p = nodes.length / 2
        return circularShift(nodes, p)

    } else if (fromOrientation == Orientation.LEFT_OPEN_PATH || fromOrientation == Orientation.RIGHT_OPEN_PATH) {

        // in order to concat these to the left wall we need to rotate the elements to be

        // If LEFT_OPEN_PATH     11   12  13  14  22  21  20  19   ,OR
        // If RIGHT_OPEN_PATH    22   21  20  19  11  12  13  14

        // To be                 20   19  11  12  13  14  22  21  


        // If LEFT_OPEN_PATH     27  28  29  30   22  21  20  19  ,OR
        // If RIGHT_OPEN_PATH    22  21  20  19   27  28  29  30

        // To be                 29  30  22  21   20  19  27  28  


        let p1 = nodes.length / 4
        let p2 = 0

        if (nodes[0] - nodes[nodes.length - 1] == -gridSideLen) {
            p2 = nodes.length / 2
        }
        return circularShift(nodes, p1 + p2)

    } else {
        console.log(path)
        throw 'makeItDownOpenPath: Err path is niether left,right, nor up oriented!'
    }
}






export {
    Orientation,

    PathWithOrientaion
}