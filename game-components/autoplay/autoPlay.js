import { setInputDirection } from './input.js'
import { getSnakeHead, getSnakeLen, onSnake } from '../snake.js'

import { visualizeHC, } from './hamCycleGridVisualization.js'

import { getFoodPosition } from "../food.js"
import { gridSideLen, totalNrOfCells } from '../grid.js'

const abs = Math.abs
const floor = Math.floor


const MOVE_UP = { deltaX: -1, deltaY: 0 }
const MOVE_DOWN = { deltaX: 1, deltaY: 0 }
const MOVE_LEFT = { deltaX: 0, deltaY: -1 }
const MOVE_RIGHT = { deltaX: 0, deltaY: 1 }


export class Node {
    constructor(v) {
        this.value = v
        this.x = floor(v / gridSideLen)
        this.y = v % gridSideLen
        this.xIsEven = this.x % 2 == 0
        this.yIsEven = this.y % 2 == 0
        // this.leadsToNodesValue = this.#genLeadsTo()
        // this.reachedToFromNodesValue = this.#genReachedToFrom()
    }

    #genLeadsTo() {
        let leadsToVertically
        let leadsToHorizontally
        if (this.xIsEven)
            //for ex  node 18 can reach to node 17         left
            //for ex  node 17 can reach to node 16         left
            leadsToVertically = (floor((this.value - 1) / gridSideLen) == this.x) ? (this.value - 1) : -1   // Important not all node and (node-1) are at the same row,, i.e. node 7 and 8 are not in the same row

        else
            //for ex  node 14 can reach to node 15         left
            //for ex  node  9 can reach to node 10         left
            leadsToVertically = (floor((this.value + 1) / gridSideLen) == this.x) ? (this.value + 1) : -1   // Important not all node and (node+1) are at the same row,, i.e. node 7 and 8 are not in the same row


        if (this.yIsEven)
            //for ex  node 18 can reach to node 26         up
            //for ex  node 14 can reach to node 22         up
            leadsToHorizontally = this.value + gridSideLen
        else
            //for ex  node 17 can reach to node 9         down 
            //for ex  node  9 can reach to node 1         down 
            leadsToHorizontally = this.value - gridSideLen
        return [leadsToVertically, leadsToHorizontally]
    }

    #genReachedToFrom() {
        let reachedToFromVertically
        let reachedToFromHorizontally

        if (this.xIsEven)
            //for ex root node 14 can reached from node 13      right
            //for ex root node  9 can reached from node 8       rigth
            reachedToFromVertically = (floor((this.value + 1) / gridSideLen) == this.x) ? (this.value + 1) : -1   // Important not all node and (node+1) are at the same row,, i.e. node 7 and 8 are not in the same row
        else
            //for ex root node 18 can reached from node 19      left
            //for ex root node 17 can reached from node 18      left
            reachedToFromVertically = (floor((this.value - 1) / gridSideLen) == this.x) ? (this.value - 1) : -1   // Important not all node and (node-1) are at the same row,, i.e. node 16 and 15 is not in the same row

        if (this.yIsEven)
            //for ex root node 18 can reached from node 10         down
            //for ex root node 14 can reached from node  6         down
            reachedToFromHorizontally = this.value - gridSideLen
        else
            //for ex root node 17 can reached from node 25         up 
            //for ex root node  9 can reached from node 17         up 
            reachedToFromHorizontally = this.value + gridSideLen

        return [reachedToFromVertically, reachedToFromHorizontally]

    }

    canLeadsTo(nodeValue) {
        this.leadsToNodesValue.indexOf(nodeValue) != -1
    }

    canBeReachedToFrom(nodeValue) {
        this.reachedToFromNodesValue.indexOf(nodeValue) != -1
    }

}

export class SubGraph {
    constructor(nodesValues, notConnectableRange = null) { // notConnectableRange ={ formIndex: -1, toIndex: -1 }
        this.path = this.#genPath(nodesValues)
        this.isCyclic = this.#isCyclic()

        if (notConnectableRange && this.#checkNotConnectableRangeValidity(notConnectableRange))
            this.notConnectableRange = notConnectableRange
    }

    #checkNotConnectableRangeValidity(newNotConnectableRange) {

        if (!newNotConnectableRange) {
            throw `Subgraph.#checkNotConnectableRangeValidity: notConnectableRange is null or undefined!`
        }

        let { formIndex: newForm_index, toIndex: newTo_index } = newNotConnectableRange

        if (isNaN(newForm_index + 1) || isNaN(newTo_index + 1)) {
            throw `Subgraph.#checkNotConnectableRangeValidity: Err formIndex or toIndex isNaN!`
        }

        if (newForm_index < 0 || newTo_index >= this.path.length) {
            throw `Subgraph.#checkNotConnectableRangeValidity: Out of bound , newForm_index: ${newForm_index} or newTo_index: ${newTo_index} are out of bound!`
        }
        if (newForm_index >= newTo_index) {
            throw `Subgraph.#checkNotConnectableRangeValidity: invalid notConnectableRange, newForm_index: ${newForm_index}, newTo_index: ${newTo_index}`
        }

        return true

    }

    #genPath(nodesValues) {
        return nodesValues.map(nodeVal => orderedNodes[nodeVal])
    }

    #onChange(nrOfShifts = 0) {
        this.isCyclic = this.#isCyclic()
        this.#updateNotConnectableRange(nrOfShifts)
    }

    #isCyclic() {
        let root = this.path[0]
        let leaf = this.path[this.path.length - 1]

        let diff = root.value - leaf.value
        let adjecent = (abs(diff) == 1 || abs(diff) == gridSideLen)

        let sameRow = root.x == leaf.x
        let sameCol = root.y == leaf.y

        return this.path.length >= 4 && adjecent && (sameCol || sameRow)
    }

    #updateNotConnectableRange(nrOfShifts) {
        if (!this.notConnectableRange)
            return
        let pathLen = this.path.length
        let newForm_index = (this.notConnectableRange.formIndex + nrOfShifts + pathLen) % pathLen
        let newTo_index = (this.notConnectableRange.toIndex + nrOfShifts + pathLen) % pathLen

        if (this.#checkNotConnectableRangeValidity({ formIndex: newForm_index, toIndex: newTo_index })) {
            this.notConnectableRange.formIndex = newForm_index
            this.notConnectableRange.toIndex = newTo_index
        }

    }

    containsNode(nodeValue) {
        // let nrOfBits = totalNrOfCells
        return this.path.findIndex((node) => node.value == nodeValue) != -1
    }

    spliceIn(other, atIndex, otherNrOfShifts) {
        let duplicate = other.path.some(node => this.path.includes(node))

        if (duplicate)
            throw `Subgraph.spliceIn: Trying to add some nodes that'd been added before!`

        if (atIndex < 0 || atIndex > this.path.length)
            throw `Subgraph.spliceIn: Trying to add some nodes at invalid index!`

        if (this.notConnectableRange && (atIndex > this.notConnectableRange.formIndex && atIndex <= this.notConnectableRange.toIndex))
            throw `Subgraph.spliceIn: Trying to add some nodes in between notConnectableRange!`

        if (otherNrOfShifts > 0) {
            //this will set the otherRoot and otherLeaf at the required pos.
            other.rotateCycle(otherNrOfShifts)
        }

        this.path.splice(atIndex, 0, ...other.path)

        let nrOfShifts = 0

        // Since ONLY "this graph" or "other graph" contains the notConnectableRange
        if (other.notConnectableRange) {
            // init this.notConnectableRange and set it as other's, and let #onChange to update the indecies
            this.notConnectableRange = {
                formIndex: other.notConnectableRange.formIndex,
                toIndex: other.notConnectableRange.toIndex
            }
            // Important to set "nrOfShifts" value here
            nrOfShifts = atIndex

        } else if (this.notConnectableRange && atIndex <= this.notConnectableRange.formIndex) {
            nrOfShifts = other.path.length
        }
        this.#onChange(nrOfShifts)
    }

    spliceCyclicOtherOptions(other) {
        let options = []

        if (!other.isCyclic)
            throw 'connectivityOptionsIntoToOther: the other graph is not cyclic'

        for (let i = 0; i < other.path.length; i++) {
            if (other.notConnectableRange && i >= other.notConnectableRange.formIndex && i < other.notConnectableRange.toIndex)// note that the last node in (notConnectableRange) "toIndex" can be a valid leaf
                continue

            let otherNode1 = other.path[i]                              // Note how node1 index is "i+1"   But otherNode1 index is "j"
            let otherNode2 = other.path[(i + 1) % other.path.length]       // Note how node2 index is "i" But otherNode2 index is "j+1"

            // let node1canLeadsTo = node1.leadsToNodesValue
            // let node1canBeReachedFrom = node1.reachedToFromNodesValue

            // let node2canLeadsTo = node2.leadsToNodesValue
            // let node2canBeReachedFrom = node2.reachedToFromNodesValue
            for (let j = 0; j < this.path.length; j++) {
                if (this.notConnectableRange && j >= this.notConnectableRange.formIndex && j < this.notConnectableRange.toIndex)// note that the last node in (notConnectableRange) "toIndex" can be a valid leaf
                    continue



                let node1 = this.path[(j + 1) % this.path.length]   // Note how node1 index is "j+1"   But otherNode1 index is "j"
                let node2 = this.path[j]                          // Note how node2 index is "j" But otherNode2 index is "j+1"

                let sameRow = (node1.x == otherNode1.x) && (node2.x == otherNode2.x)
                let sameCol = (node1.y == otherNode1.y) && (node2.y == otherNode2.y)

                let connectToRightWall = (node1.y - otherNode1.y == -1) && (node2.y - otherNode2.y == -1)
                let connectToRightWall_mask = node1.xIsEven && !node2.xIsEven && (otherNode1.xIsEven && !otherNode2.xIsEven) // the (otherNode1.xIsEven && !otherNode2.xIsEven)  is redundant

                let connectToLeftWall = (node1.y - otherNode1.y == 1) && (node2.y - otherNode2.y == 1)
                let connectToLeftWall_mask = !node1.xIsEven && node2.xIsEven && (!otherNode1.xIsEven && otherNode2.xIsEven) // the (!otherNode1.xIsEven && otherNode2.xIsEven)  is redundant

                let connectToLowerWall = (node1.x - otherNode1.x == -1) && (node2.x - otherNode2.x == -1)
                let connectToLowerWall_mask = !node1.yIsEven && node2.yIsEven && (!otherNode1.yIsEven && otherNode2.yIsEven) // the (!otherNode1.yIsEven && otherNode2.yIsEven)  is redundant

                let connectToUpperWall = (node1.x - otherNode1.x == 1) && (node2.x - otherNode2.x == 1)
                let connectToUpperWall_mask = node1.yIsEven && !node2.yIsEven && (otherNode1.yIsEven && !otherNode2.yIsEven) // the (otherNode1.yIsEven && !otherNode2.yIsEven)  is redundant

                if (
                    (sameRow && ((connectToRightWall && connectToRightWall_mask) || (connectToLeftWall && connectToLeftWall_mask))) ||
                    (sameCol && ((connectToLowerWall && connectToLowerWall_mask) || (connectToUpperWall && connectToUpperWall_mask)))
                ) {
                    // console.log(`from root ${otherNode2.value} to leaf ${otherNode1.value} insertion after ${node2.value}  and befor  ${node1.value} `)
                    // console.log(`root index ${(j + 1) % this.path.length} , leaf index ${j}  insert into other at index ${(i + 1) % other.path.length}`)
                    let temp = {
                        insertOtherAtIndex: (j + 1) % this.path.length,
                        otherNrOfShifts: (i + 1) % other.path.length, // this will set the otherRoot and otherLeaf at the required pos.
                    }
                    options.push(temp)

                }
            }

        }
        return options

    }

    spliceNonCyclicOtherOptions(other) {

        // this function will attempt to find if it is possible to connect other.leaf to this.root or this.leaf to other.root
        // WITHOUT any rotations!
        let root = this.path[0]
        let leaf = this.path[this.path.length - 1]
        let otherRoot = other.path[0]
        let otherLeaf = other.path[other.path.length - 1]


        let otherLeaf2RootH = false
        let otherLeaf2RootV = false
        let leaf2OtherRootH = false
        let leaf2OtherRootV = false

        let options = []

        if (root.xIsEven)
            //for ex root  18 can be reached from otherLeaf  19      left
            //for ex root  17 can be reached from otherLeaf  18      left

            otherLeaf2RootH = (root.x == otherLeaf.x) && (root.y - otherLeaf.y == -1)
        else
            //for ex root  14 can be reached from otherLeaf  13      right
            //for ex root   9 can be reached from otherLeaf   8      rigth
            otherLeaf2RootH = (root.x == otherLeaf.x) && (root.y - otherLeaf.y == 1)

        if (root.yIsEven && !otherLeaf2RootH)
            //for ex root 18 can be reached from otherLeaf 10         down
            //for ex root 14 can be reached from otherLeaf  6         down

            otherLeaf2RootV = (root.y == otherLeaf.y) && (root.x - otherLeaf.x == 1)
        else
            //for ex root 17 can be reached from otherLeaf 25         up 
            //for ex root  9 can be reached from otherLeaf 17         up 

            otherLeaf2RootV = (root.y == otherLeaf.y) && (root.x - otherLeaf.x == -1)

        if (otherLeaf2RootH || otherLeaf2RootV) {
            let temp = {
                insertOtherAtIndex: 0,// insert other.path into this.path at pos 0
                otherNrOfShifts: 0, // No need to rotate the other
            }
            options.push(temp)
        }

        if (leaf.xIsEven)
            //for ex leaf 18 can reach to otherRoot 17         left
            //for ex leaf 17 can reach to otherRoot 16         left
            leaf2OtherRootH = (leaf.x == otherRoot.x) && (leaf.y - otherRoot.y == 1)

        else
            //for ex leaf 14 can reach to otherRoot 15         right
            //for ex leaf  9 can reach to otherRoot 10         right
            leaf2OtherRootH = (leaf.x == otherRoot.x) && (leaf.y - otherRoot.y == -1)


        if (leaf.yIsEven && !leaf2OtherRootH)
            //for ex leaf 18 can reach to otherRoot 26         up
            //for ex leaf 14 can reach to otherRoot 22         up
            leaf2OtherRootV = (leaf.y == otherRoot.y) && (leaf.x - otherRoot.x == -1)
        else
            //for ex leaf 17 can reach to otherRoot 9         down 
            //for ex leaf  9 can reach to otherRoot 1         down 
            leaf2OtherRootV = (leaf.y == otherRoot.y) && (leaf.x - otherRoot.x == 1)

        if (leaf2OtherRootH || leaf2OtherRootV) {
            let temp = {
                insertOtherAtIndex: this.path.length, // insert other.path into this.path at NEW  pos (this.path.length)
                otherNrOfShifts: 0, // No need to rotate the other
            }
            options.push(temp)
        }

        return options


    }


    rotateCycle(nr) {
        if (!this.isCyclic)
            throw 'rotateCycle: this graph is not cyclic'
        if (nr !== 0 && (!nr || isNaN(nr + 1) || nr < 0)) // "nr !== 0" since the truthy of the number 0 is false, but in this case a "rotation  0 times" is valid  
            throw 'rotateCycle: required nr of rotations is not valid value "!nr || isNaN(nr+1) ||nr < 0"'
        let pathLen = this.path.length

        let nrOfShifts = (nr + pathLen) % pathLen


        if (this.notConnectableRange && nrOfShifts > this.notConnectableRange.formIndex && nrOfShifts <= this.notConnectableRange.toIndex)
            throw 'rotateCycle: notConnectableRange cant be divided into 2 parts (one at the start of path and the other at the end of path)'
        // must be null after each rotation and adding

        let temp = [...this.path.slice(nrOfShifts), ...this.path.slice(0, nrOfShifts)]
        this.path.length = 0
        this.path.push(...temp)
        this.#onChange(-1 * (nrOfShifts))
    }

}

class CuttingSection {
    #cuttingNodes
    constructor(srcNodevalue, nrOfSteps, direction) {
        this.nrOfSteps = nrOfSteps
        this.direction = direction
        this.srcNodevalue = srcNodevalue
        this.#cuttingNodes = []
        this.#genCuttingNodes()
    }

    get nodes() {
        return this.#cuttingNodes
    }

    #genCuttingNodes() {
        let incValue = getEdgeCost(this.direction)

        for (let s = 1; s <= this.nrOfSteps; s++) {
            // start from 1 since 0 will yield the srcNodevalue's value, for ex snakeHead 
            let nodeValue = this.srcNodevalue + (incValue * s)
            let node = orderedNodes[nodeValue]

            let x = node.x
            let y = node.y

            let validNode = (x < gridSideLen) && (y < gridSideLen) && (x >= 0) && (y >= 0)

            if (!validNode)
                throw `genCuttingNodes method: this cuttingNode has invalid value of ${node}`

            this.#cuttingNodes.push(node)
        }
    }
}

const getEdgeCost = (direction) => {
    let incValue
    if (direction == Direction.LEFT) {
        incValue = -1
    } else if (direction == Direction.RIGHT) {
        incValue = 1
    } else if (direction == Direction.UP) {
        incValue = -(gridSideLen)
    } else if (direction == Direction.DOWN) {
        incValue = gridSideLen
    } else
        throw `getEdgeCost function: Invalid direction value : ${direction}`
    return incValue
}

const findCurrentHamCyclNodeIndex = () => {
    let snakeHead = getSnakeHead()
    let currentHamCyclNodeValue = snakeHead.x * gridSideLen + snakeHead.y
    currentHamCyclNodeIndex = HC.indexOf(currentHamCyclNodeValue)
}

const requestHamCycleChange = () => {
    // The Ham. cycle will be re-computed at the next cycle.
    HamCycleStatus = Status.CHECK_NEXT_CYCLE
}

const excuteMove = () => {
    // currentHamCyclNodeIndex!=0 since the truthy of the number 0 is false
    if (currentHamCyclNodeIndex != 0 && !currentHamCyclNodeIndex) {
        // currentHamCyclNodeIndex is undifined
        findCurrentHamCyclNodeIndex()
    }


    if (HamCycleStatus == Status.CHECK_NEXT_CYCLE && isChangingWorthwhile()) {
        // const t0 = performance.now();
        changeHamCycle()
        // const t1 = performance.now();
        // console.log(`Call to changeHamCycle took ${t1 - t0} ms.`);
    } else {
        HamCycleStatus = Status.CONNECTED_OK
    }

    let nextNdx = (currentHamCyclNodeIndex + 1) % HC.length
    let diff = HC[currentHamCyclNodeIndex] - HC[nextNdx]

    let nextMove = null

    if (diff === 1) {
        nextMove = MOVE_LEFT
    } else if (diff === -1) {
        nextMove = MOVE_RIGHT
    } else if (diff === gridSideLen) {
        nextMove = MOVE_UP
    } else if (diff === -(gridSideLen)) {
        nextMove = MOVE_DOWN
    } else {

        // If the move is between 2 nodes without and edge 
        console.log(`\n\n\n`)
        console.log(debug)
        console.log(`\n\n\n`)
        console.log("the move is between 2 nodes without and edge!")
        console.log(`The prev currentHamCyclNodeIndex ${currentHamCyclNodeIndex}`)
        console.log(`The prev currentHamCyclNode is  HC[${currentHamCyclNodeIndex}] ${HC[currentHamCyclNodeIndex]}`)
        console.log(`Intending to move to nextNdx ${nextNdx}`)
        console.log(`Intending to move to nextHamCyclNode is  HC[${nextNdx}] ${HC[nextNdx]}`)
        console.log(HC)
        throw 'the move is between 2 nodes without and edge!\n\n\n'

    }
    setInputDirection(nextMove)

    currentHamCyclNodeIndex = nextNdx
}
const isChangingWorthwhile = () => {

    // Trying to change the HC is worthwhile if:
    //      - The existing path between the snakehead and the food (targetNode) is "far away". Where "far away" is an arbitrary limit on the nr of steps, lets say farAwayLimit is (2 x gridSideLen) steps.
    //      - The cuttingPath (from snakeHead to the food "targetNode") does NOT prevent the isoSubgraphs from concating with the potential newHC
    const snakeHeadNode = orderedNodes[HC[currentHamCyclNodeIndex]]
    const srcX = snakeHeadNode.x
    const srcY = snakeHeadNode.y
    const { x: targetX, y: targetY } = getFoodPosition()
    const targetNode = orderedNodes[(targetX * gridSideLen) + targetY]

    // 1- Checking if the existing path between the snakehead and the food (targetNode) is "far away"
    let farAwayLimit = (gridSideLen)
    let nrOfSteps = 0
    while (nrOfSteps < farAwayLimit) {
        nrOfSteps++ // starts counting from fst node after the head,, nrOfSteps will be 1

        let index = (nrOfSteps + currentHamCyclNodeIndex) % HC.length
        if (targetNode.value == HC[index])
            break
    }

    //   if the current HC has a path from snakeHead to target with lt "farAwayLimit" steps, then considering to change the current HC is NOT worthwhile
    if (nrOfSteps < farAwayLimit) // Note if nrOfSteps == farAwayLimit, then considering to change the current HC is worthwhile
        return false


    // 2- TChecking if the cuttingPath (from snakeHead to the food "targetNode") does NOT prevent the isoSubgraphs from concating with the potential newHC

    const fstIndex = 0
    const lastIndex = gridSideLen - 1

    const lowerLimit = fstIndex + 1
    const upperLimit = lastIndex - 1

    // Check that the cuttingPath does NOT prevent the isoSubgraphs from concating with the potential newHC
    // In a board with gridSideLen = 8, the lowerLimit is 1 and upperLimit is 6
    // if head=(<1, *)   then    (*, 1) >= targetY <= (*, 6) && targetX < (6, *)  , the one exception is when the target and head are (0, *)
    // if head=(>6, *)   then    (*, 1) >= targetY <= (*, 6) && targetX > (1, *)  , the one exception is when the target and head are (7, *)
    // if head=(*, <1)   then    (1, *) >= targetX <= (6, *) && targetY < (*, 6)  , the one exception is when the target and head are (*, 0)
    // if head=(*, >6)   then    (1, *) >= targetX <= (6, *) && targetY > (*, 1)  , the one exception is when the target and head are (*, 7)

    let worthwhile = true

    if (srcX < lowerLimit && !(srcX == fstIndex && targetX == fstIndex)) {           // the one exception is when the head=(fstIndex, *) && target=(fstIndex, *)
        worthwhile = targetY >= lowerLimit && targetY <= upperLimit && targetX <= upperLimit

    } else if (srcX > upperLimit && !(srcX == lastIndex && targetX == lastIndex)) {  // the one exception is when the head=(lastIndex, *) && target=(lastIndex, *)
        worthwhile = targetY >= lowerLimit && targetY <= upperLimit && targetX >= lowerLimit

    } else if (srcY < lowerLimit && !(srcY == fstIndex && targetY == fstIndex)) {    // the one exception is when the head=(*, fstIndex) && target=(*, fstIndex)
        worthwhile = targetX >= lowerLimit && targetX <= upperLimit && targetY <= upperLimit

    } else if (srcY > upperLimit && !(srcY == lastIndex && targetY == lastIndex)) {  // the one exception is when the head=(lastIndex, *) && target=(lastIndex, *)
        worthwhile = targetX >= lowerLimit && targetX <= upperLimit && targetY >= lowerLimit
    }

    return worthwhile
}


const Status = {
    CHECK_NEXT_CYCLE: "CHECK_NEXT_CYCLE",
    CONNECTED_OK: "CONNECTED_OK",
}

const Direction = {
    DOWN: "DOWN",
    UP: "UP",
    RIGHT: "RIGHT",
    LEFT: "LEFT",
}


const changeHamCycle = () => {

    // we check that "currentHamCyclNodeIndex!=0" first and then the truthy of "!currentHamCyclNodeIndex", since the truthy of the number 0 is false
    if (currentHamCyclNodeIndex != 0 && !currentHamCyclNodeIndex) {
        // currentHamCyclNodeIndex is undifined
        findCurrentHamCyclNodeIndex()
    }

    //contains nrOfSteps, nodes, and in which directions
    let cuttingPathSections = getCuttingPathSections()



    newHC = []


    if (cuttingPathSections.length !== 0 && isValidCuttingPathSections(cuttingPathSections, HC[currentHamCyclNodeIndex])) {

        let { cuttingPathNodes, cuttingPathIndecies } = getCuttingPath(cuttingPathSections, currentHamCyclNodeIndex)

        if (cuttingPathIndecies.length > 0) {

            let { x: targetX, y: targetY } = getFoodPosition()
            let targetNode = (targetX * gridSideLen) + targetY
            let targetNodeIndex = HC.indexOf(targetNode)

            let isolatedSubgraphList = genNewHC(cuttingPathNodes, cuttingPathIndecies, targetNodeIndex)

            reconnectGraph(isolatedSubgraphList)
        }
    }
}

const getCuttingPathSections = () => {

    let srcNode = orderedNodes[HC[currentHamCyclNodeIndex]]
    let { x: srcX, y: srcY } = { x: srcNode.x, y: srcNode.y }


    let { x: targetX, y: targetY } = getFoodPosition()
    let target = orderedNodes[targetX * gridSideLen + targetY]

    let deltaX = targetX - srcX
    let deltaY = targetY - srcY

    let absDeltaX = abs(deltaX)
    let absDeltaY = abs(deltaY)

    let srcXisEven = srcNode.xIsEven
    let srcYisEven = srcNode.yIsEven
    let targetXisEven = target.xIsEven
    let targetYisEven = target.yIsEven

    let deltaXisLtZero = deltaX < 0
    let deltaXisGtZero = deltaX > 0


    let deltaYisLtZero = deltaY < 0
    let deltaYisGtZero = deltaY > 0

    let cuttingPathSections = []
    let srcNodevalue = srcNode.value

    {
        /** Down movements analysis
            A: deltaY < 0
            NOT_A: deltaY > 0
    
            B: targetX isEven
            NOT_B: targetX isOdd
    
            C: targetY isEven
            NOT_C: targetY isOdd
    
            D: srcX isEven
            NOT_D: srcX isOdd
    
            case 1
                path = ( deltaX),
                Iff 
                DeltaY == 0 (target is straigt down)
    
            case 2
                path = ( deltaX ==> deltaY),
                iff
                (A B NOT_C) + (A B C) + (NOT_A NOT_B NOT_C) + (NOT_A NOT_B C) 
                which is
                (A B) + (NOT_A NOT_B)
    
            case 3
                path = ((deltaX-1) ==> deltaY ==> (1x)), 
                where is
                    x is one step in deltaX direction
                iff:
                (A NOT_B C) + (NOT_A B C) // DONT simplify this to avoid overlapping with the next "case 4"
    
            case 4
                path = ((deltaX-1) ==> (deltaY+1) ==> (1x) ==> (-1y)), 
                where is:
                    x is one step in deltaX direction,
                    y is one step in deltaY direction,
                iff:
                (A NOT_B NOT_C)
    
            case 5
                path = ((deltaX-1) ==> (deltaY-1) ==> (2x) ==> (1y) ==> (-1x)), 
                where is:
                    x is one step in deltaX direction,
                    y is one step in deltaY direction,
                iff:
                (NOT_A B NOT_C)
    
                */
    }

    // Only Horizontal movements and exclusively to the Left
    if (deltaYisLtZero && deltaX == 0 && srcXisEven) { // the target is in the same row and to the left of the snakeHead and srcXisEven

        // if next move in pathLeft is already the same as current HC
        if ((srcNodevalue - 1) == HC[(currentHamCyclNodeIndex + 1) % HC.length]) {
            cuttingPathSections = []
        } else {
            let s1 = new CuttingSection(srcNodevalue, absDeltaY, Direction.LEFT)
            cuttingPathSections = [s1]
        }

    }
    // Only Horizontal movements and exclusively to the Right
    else if (deltaYisGtZero && deltaX == 0 && !srcXisEven) { // the target is in the same row and to the left of the snakeHead "srcNode" and srcXisOdd
        // if next move in pathRight is already the same as current HC
        if ((srcNodevalue + 1) == HC[(currentHamCyclNodeIndex + 1) % HC.length]) {
            cuttingPathSections = []
        } else {
            let s1 = new CuttingSection(srcNodevalue, absDeltaY, Direction.RIGHT)
            cuttingPathSections = [s1]
        }

    }
    // Moving Down first and then Horizontally if necessary
    else if (deltaX > 0 && srcYisEven) {
        // case 1
        if (deltaY == 0) {//if srcNode and the target are at the same column
            // if next move in path down is already the same as current HC
            if ((srcNodevalue + gridSideLen) == HC[(currentHamCyclNodeIndex + 1) % HC.length]) {
                cuttingPathSections = []
            } else {
                let s1 = new CuttingSection(srcNodevalue, deltaX, Direction.DOWN)
                cuttingPathSections = [s1]
            }
        }
        //case2 (A B) + (NOT_A NOT_B)
        // path = ( deltaX ==> deltaY),
        else if ((deltaYisLtZero && targetXisEven) || (deltaYisGtZero && !targetXisEven)) {
            let s1 = new CuttingSection(srcNodevalue, absDeltaX, Direction.DOWN)

            srcNodevalue = srcNodevalue + (absDeltaX * getEdgeCost(Direction.DOWN))
            let horizontalDirection = deltaYisLtZero ? Direction.LEFT : Direction.RIGHT
            let s2 = new CuttingSection(srcNodevalue, absDeltaY, horizontalDirection)

            cuttingPathSections = [s1, s2]
        }
        //case3 (A NOT_B C) + (NOT_A B C) // DONT simplify this boolean expression this to avoid overlapping with the next "case 4"
        //path = ((deltaX-1) ==> deltaY ==> (1x))
        else if ((deltaYisLtZero && !targetXisEven && targetYisEven) || (deltaYisGtZero && targetXisEven && targetYisEven)) {
            let s1 = new CuttingSection(srcNodevalue, (absDeltaX - 1), Direction.DOWN)

            srcNodevalue = srcNodevalue + ((absDeltaX - 1) * getEdgeCost(Direction.DOWN))
            let horizontalDirection = deltaYisLtZero ? Direction.LEFT : Direction.RIGHT
            let s2 = new CuttingSection(srcNodevalue, absDeltaY, horizontalDirection)

            srcNodevalue = srcNodevalue + (absDeltaY * getEdgeCost(horizontalDirection))
            let s3 = new CuttingSection(srcNodevalue, 1, Direction.DOWN)

            cuttingPathSections = [s1, s2, s3]
        }
        //case4 (A NOT_B NOT_C)
        //path = ((deltaX-1) ==> (deltaY+1) ==> (1x) ==> (-1y))
        else if (deltaYisLtZero && !targetXisEven && !targetYisEven) {
            let s1 = new CuttingSection(srcNodevalue, (absDeltaX - 1), Direction.DOWN)

            srcNodevalue = srcNodevalue + ((absDeltaX - 1) * getEdgeCost(Direction.DOWN))
            let s2 = new CuttingSection(srcNodevalue, (absDeltaY + 1), Direction.LEFT)

            srcNodevalue = srcNodevalue + ((absDeltaY + 1) * getEdgeCost(Direction.LEFT))
            let s3 = new CuttingSection(srcNodevalue, 1, Direction.DOWN)

            srcNodevalue = srcNodevalue + (1 * getEdgeCost(Direction.DOWN))
            let s4 = new CuttingSection(srcNodevalue, 1, Direction.RIGHT)

            cuttingPathSections = [s1, s2, s3, s4]
        }
        // case5 (NOT_A B NOT_C)
        // path = ((deltaX-1) ==> (deltaY-1) ==> (2x) ==> (1y) ==> (-1x))
        else if (deltaYisGtZero && targetXisEven && !targetYisEven) {
            let s1 = new CuttingSection(srcNodevalue, (absDeltaX - 1), Direction.DOWN)

            srcNodevalue = srcNodevalue + ((absDeltaX - 1) * getEdgeCost(Direction.DOWN))
            let s2 = new CuttingSection(srcNodevalue, (absDeltaY - 1), Direction.RIGHT)

            srcNodevalue = srcNodevalue + ((absDeltaY - 1) * getEdgeCost(Direction.RIGHT))
            let s3 = new CuttingSection(srcNodevalue, 2, Direction.DOWN)

            srcNodevalue = srcNodevalue + (2 * getEdgeCost(Direction.DOWN))
            let s4 = new CuttingSection(srcNodevalue, 1, Direction.RIGHT)

            srcNodevalue = srcNodevalue + (1 * getEdgeCost(Direction.RIGHT))
            let s5 = new CuttingSection(srcNodevalue, 1, Direction.UP)

            cuttingPathSections = [s1, s2, s3, s4, s5]
        }
    }
    // Moving Up first and then Horizontally if necessary
    else if (deltaX < 0 && !srcYisEven) {
        // case 1
        if (deltaY == 0) {//if srcNode and the target are at the same column
            // if next move in path up is already the same as current HC
            if ((srcNodevalue - gridSideLen) == HC[(currentHamCyclNodeIndex + 1) % HC.length]) {
                cuttingPathSections = []
            } else {
                let s1 = new CuttingSection(srcNodevalue, deltaX, Direction.UP)
                cuttingPathSections = [s1]
            }
        }

        //case2 
        // path = ( deltaX ==> deltaY),
        else if ((deltaYisLtZero && targetXisEven) || (deltaYisGtZero && !targetXisEven)) {
            let s1 = new CuttingSection(srcNodevalue, absDeltaX, Direction.UP)

            srcNodevalue = srcNodevalue + (absDeltaX * getEdgeCost(Direction.UP))
            let horizontalDirection = deltaYisLtZero ? Direction.LEFT : Direction.RIGHT
            let s2 = new CuttingSection(srcNodevalue, absDeltaY, horizontalDirection)
            cuttingPathSections = [s1, s2]
        }
        //case3
        //path = ((deltaX-1) ==> deltaY ==> (1x))
        else if ((deltaYisLtZero && !targetXisEven && !targetYisEven) || (deltaYisGtZero && targetXisEven && !targetYisEven)) {
            let s1 = new CuttingSection(srcNodevalue, (absDeltaX - 1), Direction.UP)

            srcNodevalue = srcNodevalue + ((absDeltaX - 1) * getEdgeCost(Direction.UP))
            let horizontalDirection = deltaYisLtZero ? Direction.LEFT : Direction.RIGHT
            let s2 = new CuttingSection(srcNodevalue, absDeltaY, horizontalDirection)

            srcNodevalue = srcNodevalue + (absDeltaY * getEdgeCost(horizontalDirection))
            let s3 = new CuttingSection(srcNodevalue, 1, Direction.UP)

            cuttingPathSections = [s1, s2, s3]
        }
        //case4  
        //path = ((deltaX-1) ==> (deltaY+1) ==> (1x) ==> (-1y))
        else if (deltaYisGtZero && targetXisEven && targetYisEven) {
            let s1 = new CuttingSection(srcNodevalue, (absDeltaX - 1), Direction.UP)

            srcNodevalue = srcNodevalue + ((absDeltaX - 1) * getEdgeCost(Direction.UP))
            let s2 = new CuttingSection(srcNodevalue, (absDeltaY + 1), Direction.RIGHT)

            srcNodevalue = srcNodevalue + ((absDeltaY + 1) * getEdgeCost(Direction.RIGHT))
            let s3 = new CuttingSection(srcNodevalue, 1, Direction.UP)

            srcNodevalue = srcNodevalue + (1 * getEdgeCost(Direction.UP))
            let s4 = new CuttingSection(srcNodevalue, 1, Direction.LEFT)

            cuttingPathSections = [s1, s2, s3, s4]
        }
        // case5  
        // path = ((deltaX-1) ==> (deltaY-1) ==> (2x) ==> (1y) ==> (-1x))
        else if (deltaYisLtZero && !targetXisEven && targetYisEven) {
            let s1 = new CuttingSection(srcNodevalue, (absDeltaX - 1), Direction.UP)

            srcNodevalue = srcNodevalue + ((absDeltaX - 1) * getEdgeCost(Direction.UP))
            let s2 = new CuttingSection(srcNodevalue, (absDeltaY - 1), Direction.LEFT)

            srcNodevalue = srcNodevalue + ((absDeltaY - 1) * getEdgeCost(Direction.LEFT))
            let s3 = new CuttingSection(srcNodevalue, 2, Direction.UP)

            srcNodevalue = srcNodevalue + (2 * getEdgeCost(Direction.UP))
            let s4 = new CuttingSection(srcNodevalue, 1, Direction.LEFT)

            srcNodevalue = srcNodevalue + (1 * getEdgeCost(Direction.LEFT))
            let s5 = new CuttingSection(srcNodevalue, 1, Direction.DOWN)

            cuttingPathSections = [s1, s2, s3, s4, s5]
        }
    }

    return cuttingPathSections
}


const isValidCuttingPathSections = (cuttingPathSections, srcNodeValue) => {

    // valid cuttingPath is path that:
    //      - continuous all the sections form a continuos path
    //      - does not intersect the snakeBody

    if (srcNodeValue >= (totalNrOfCells) || srcNodeValue < 0)
        throw ` invalid srcNodeValue : ${srcNodeValue}`

    let valid = true
    let continuous = true

    let nodeValue = srcNodeValue

    for (let j = 0; (j < cuttingPathSections.length) && valid; j++) {
        let cuttingSection = cuttingPathSections[j]
        let nrOfSteps = cuttingSection.nrOfSteps
        let direction = cuttingSection.direction
        let cuttingSectionNodes = cuttingSection.nodes
        let incValue = getEdgeCost(direction)

        for (let k = 0; (k < nrOfSteps) && valid; k++) {

            nodeValue = nodeValue + incValue
            continuous = orderedNodes[nodeValue] == cuttingSectionNodes[k]

            if (!continuous) {
                console.log(cuttingPathSections)
                throw `isValidCuttingPathfunction: The nodes inside those cuttingPathSections is not continuous at node ${cuttingSectionNodes[k]} \n this error can occur becuase of a bug at "CuttingSection class inside #genCuttingNodes() method"`
            }

            let x = orderedNodes[nodeValue].x
            let y = orderedNodes[nodeValue].y
            valid = continuous && !onSnake({ x, y })
        }
    }
    return valid
}



const getCuttingPath = (cuttingPathSections, srcNodeindex) => {
    // cuttingPathIndecies: this will include ONLY the cuttingPath indecies, EXCEPT (the snakehead)
    let cuttingPathIndecies = []


    let cuttingPathNodes = (cuttingPathSections.map(cs => cs.nodes)).flat()


    // Generate cuttingPathIndecies: we have to insure that cuttingPathIndecies has the same order as current HC
    for (let i = 1; i < HC.length; i++) {

        let index = (i + srcNodeindex) % HC.length
        let nodeValue = HC[index]

        if (cuttingPathNodes.findIndex(node => node.value == nodeValue) !== -1) {
            cuttingPathIndecies.push(index)
        }
    }

    if (cuttingPathNodes.length !== cuttingPathIndecies.length) throw `getCuttingPath function: there is inconsistency between the nr of (nodes inside cuttingPathSections) which is ${cuttingPathNodes.length} nodes, and the generated cuttingPathIndecies ${cuttingPathIndecies.length} nodes `

    return { cuttingPathNodes, cuttingPathIndecies }
}

const genNewHC = (cuttingPathNodes, cuttingPathIndecies, targetNodeIndex) => {
    // isolatedSubgraphList is list of lists
    let isolatedSubgraphList = []
    let unaffectedPathAfterTarget = []
    let cuttingPathLen = cuttingPathIndecies.length

    // let startNdx = (cuttingPathIndecies[i - 1] + 1) % HC.length
    let startNdx = (currentHamCyclNodeIndex + 1) % HC.length

    for (let i = 0; i < cuttingPathLen; i++) {

        let endNdx = cuttingPathIndecies[i]

        if (startNdx == endNdx) {
            // no path has been disconnected,, i.e. coincidently it's the same path in the old HC
            startNdx = (endNdx + 1) % HC.length
            continue
        }

        let temp = circularSlice(HC, startNdx, endNdx)


        // if path from (target to head) is cutted ,, NOT continuous
        if (startNdx == (targetNodeIndex + 1) % HC.length) {
            // path after the targetNode until first cutted point (this is the base of the newHC)
            unaffectedPathAfterTarget.push(...temp)

        } else {

            isolatedSubgraphList.push(new SubGraph(temp))
        }
        startNdx = (endNdx + 1) % HC.length
    }

    // Now there is 2 scenario for the unaffected area by the change in the HC
    // 1- If the path between target to head is continuous, the characteristics of this scenario is:
    //          * the targetNodeIndex is cuttingPathIndecies[cuttingPathLen - 1]
    //          * UnaffectedPathAfterTarget is empty list
    //    In this case we have ONLY 1 unaffected area, the whole path is CYCLE (head --> target --> head), 
    //    and the rest of the other nodes is isolatedSubgraphs.
    //
    // 2- If the path from target to head is cutted, we will have 2 isolated unaffected areas:
    //    a- path after the target until first cutted point (this is the base of the newHC) = UnaffectedPathAfterTarget
    //    b- path after the last cut and before the head (this will also contain the WHOLE snakeBody)



    // Instead of creating a list with all notConnectableNodes, try to keep a range of indecies
    //      pros: easy to check if a node is connectable, by just checking if its index is NOT inside the range
    //      cons: the range HAS to be updated after each concat with any isolatedSubgraph 
    // The isolatedSubgraphList wouldn't nor shouldn't concat to this section [ formIndex , toIndex ] ,
    // toIndex is INCLUDED in this section
    //     formIndex: the index of the snakeHead 
    //     toIndex: the index of "the target" 

    /**
     * What is the optimal notConnectableRange size is it:
     *      option1 - The whole snakeBody length + cuttingPath: this will make it difficult to reconnect the isolatedSubgraphs to the newHC
     *      option2 - Just the head + cuttingPath: this can result in the possibility where the an isolatedSubgraph been concatenated with a wall where the snakeBody is, and make an unreachable section until the snakeHead traverse the rest of the whole board, which is ok unless the snakeBody is too tall which in turn can cause a collision.
     *      option3 - TODO Find the optimal length between  (1 to snakeBodyLength) where the reconnecting an isolatedSubgraph is easy and the collision propability is small.
    */

    let notConnectableRange = {
        formIndex: null, toIndex: null,
    }


    // If the path between target to head is continuous 
    if (unaffectedPathAfterTarget.length == 0) { // if (targetNodeIndex == cuttingPathIndecies[cuttingPathLen - 1])

        // path from (fst node after target) to (fst node in cuttingPath), this will also contain the WHOLE snakeBody
        let nodesvalues = circularSlice(HC, (cuttingPathIndecies[cuttingPathLen - 1] + 1) % HC.length, (currentHamCyclNodeIndex + 1) % HC.length)

        //  before + pathdown 
        let _newhcNodes = [...nodesvalues, ...(cuttingPathNodes.map(node => node.value))]


        notConnectableRange.formIndex = _newhcNodes.length - (cuttingPathLen + getSnakeLen()) // (cuttingPathLen + snakeBodyLength) to include halv of the sankeBody in notConnectableRange
        notConnectableRange.toIndex = _newhcNodes.length - 1

        newHC = new SubGraph(_newhcNodes, notConnectableRange)

    } else { // If the path between target to head is cutted, we will have 2 isolated unaffected areas

        // path from (fst node after the last cut) to and including (the head), this will also contain the WHOLE snakeBody x
        let unaffectedPathBefore = circularSlice(HC, (cuttingPathIndecies[cuttingPathLen - 1] + 1) % HC.length, (currentHamCyclNodeIndex + 1) % HC.length)

        //  before + pathdown + after
        let _newhcNodes = [...unaffectedPathBefore, ...(cuttingPathNodes.map(node => node.value)), ...unaffectedPathAfterTarget]

        notConnectableRange.formIndex = (_newhcNodes.length - (cuttingPathLen + getSnakeLen())) - unaffectedPathAfterTarget.length // (cuttingPathLen +  snakeBodyLength) to include halv of the sankeBody in notConnectableRange
        notConnectableRange.toIndex = (_newhcNodes.length - 1) - unaffectedPathAfterTarget.length

        newHC = new SubGraph(_newhcNodes, notConnectableRange)
    }


    return isolatedSubgraphList
}

const circularSlice = (arr, startNdx, endNdx) => {
    let temp
    if (startNdx >= endNdx) {
        let temp1 = arr.slice(startNdx)
        let temp2 = arr.slice(0, endNdx)
        temp = [...temp1, ...temp2]
    } else
        temp = arr.slice(startNdx, endNdx)
    return temp
}



const reconnectGraph = (isolatedSubgraphList) => {

    // Note: the isolatedSubgraphList wouldn't nor shouldn't concat to notConnectableRange


    /**
     * From here there is 2 diff ways to connect the isolated subgrah:
     * 1- Connect subgraphs without rotating it: just see if an newHC's root or leaf can be concatenated with isolatedSubgraph's leaf or root.
     *    This does not require that any of the isolatedSubgraphs nor the newHC to be cyclic graph i.e. they're hamiltonian paths but NOT  cycle
     *    a- take the fst and last nodes in the newHC's path and call them root and leaf respectively.
     *    b- search for a node in any isolatedSubgraph, where that node is either the fst or the last in the isolatedSubgraph and can be connected to either newHC's root or leaf.
     *    c- if found, then splice the 2 subGraphs, and update the notConnectableRange if necessary.
     *    d- repeat until there is no such node available.
     * 
     * 
     * 2- Connect isolatedSubgraphs and newHC after some rotation
     *    This require that at least one of the newHC and/or isolatedSubgraphs is cyclic. But the resulting subgraph can be non cyclic if we splice a cyclic and non-cyclic graphs. 
     *    a- choose a cyclic graph either newHC or an isolatedSubgraph.
     *    b- search for 2 nodes candidates which can serve as root and leaf in this cyclic graph and also can be concatenated in the the other graph. 
     *    c- if found, then excute the necessary rotaions, and splice the 2 subGraphs and update the notConnectableRange if necessary.
     *    d- repeat until there isn't any cyclic subgraph.
     */




    reconnectIsolatedSubgraphs_Rec(isolatedSubgraphList)


    let isConnected = isolatedSubgraphList.length == 0
    if (!isConnected) {
        reconnectIsolatedSubgraphsWithRotation_Rec(isolatedSubgraphList)
        isConnected = isolatedSubgraphList.length == 0
    }


    if (isConnected) {
        debug.prevHC = HC
        let { x, y } = orderedNodes[HC[currentHamCyclNodeIndex]]
        debug.snakeHead = { x, y }
        debug.food = getFoodPosition()
        tempValidPath(newHC)


        HC = newHC.path.map(node => node.value)
        newHC = []

        findCurrentHamCyclNodeIndex()
        visualizeHC(HC)
        HamCycleStatus = Status.CONNECTED_OK
    }
    else {

        // ¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤DEV visulize path¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤
        isolatedSubgraphList.forEach(g => {
            let path = g.path.map(n => n.value)
            visualizeHC(path)
        })
        visualizeHC(newHC.path.map(n => n.value))

        let food = getFoodPosition()
        visualizeHC([(food.x * gridSideLen) + food.y])

        let snakeLen = getSnakeLen()

        let snakeTail = ((currentHamCyclNodeIndex - (getSnakeLen() - 1)) + totalNrOfCells) % totalNrOfCells
        let snake = circularSlice(HC, snakeTail, (currentHamCyclNodeIndex + 1) % totalNrOfCells)
        visualizeHC(snake)
        // ¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤




        // ¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤DEV visulize path¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤
        // console.log("isConnected is false")
        visualizeHC(HC)
        // ¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤

    }

}

const tempValidPath = (newHC) => {

    for (let i = 0; i < newHC.path.length - 1; i++) {
        let nextNodeH = false
        let nextNodeV = false

        let currNode = newHC.path[i]
        let nextNode = newHC.path[(i + 1) % newHC.path.length]

        if (currNode.xIsEven)
            nextNodeH = (currNode.x == nextNode.x) && (currNode.y - nextNode.y == 1)
        else
            nextNodeH = (currNode.x == nextNode.x) && (currNode.y - nextNode.y == -1)

        if (currNode.yIsEven && !nextNodeH)
            nextNodeV = (currNode.y == nextNode.y) && (currNode.x - nextNode.x == -1)
        else
            nextNodeV = (currNode.y == nextNode.y) && (currNode.x - nextNode.x == 1)

        if (!nextNodeH && !nextNodeV) {
            throw 'invalid path'
        }

    }
}
const debug = {
    prevHC: [],
    snakeHead: null,
    food: null
}
const reconnectIsolatedSubgraphsWithRotation_Rec = (isolatedSubgraphList) => {
    // basecase
    if (isolatedSubgraphList.length == 0)
        return


    let found = false
    // iterate through isolatedSubgraphList
    for (let i = 0; i < isolatedSubgraphList.length && !found; i++) {

        let isg = isolatedSubgraphList[i]
        let options = []
        if (isg.isCyclic) {
            options = newHC.spliceCyclicOtherOptions(isg)

            if (options.length > 0) {
                found = true
                let op = options[0]
                newHC.spliceIn(isg, op.insertOtherAtIndex, op.otherNrOfShifts)
            }

        } else if (newHC.isCyclic) {
            options = isg.spliceCyclicOtherOptions(newHC)
            if (options.length > 0) {
                found = true
                let op = options[0]
                isg.spliceIn(newHC, op.insertOtherAtIndex, op.otherNrOfShifts)
                newHC = isg
            }

        } else
            continue

        if (found) {
            isolatedSubgraphList.splice(i, 1)

            
            if (!newHC.isCyclic) {
                // if the lately updated newHC is NOT cyclic, the first try to  reconnect the rest of isolatedSubgraphList without a rotation.
                reconnectIsolatedSubgraphs_Rec(isolatedSubgraphList)
            }

            reconnectIsolatedSubgraphsWithRotation_Rec(isolatedSubgraphList)
        }
    }
}





const reconnectIsolatedSubgraphs_Rec = (isolatedSubgraphList) => {

    // basecase
    if (isolatedSubgraphList.length == 0)
        return


    let found = false
    // iterate through isolatedSubgraphList
    for (let i = 0; i < isolatedSubgraphList.length && !found; i++) {

        let isg = isolatedSubgraphList[i]
        let options = newHC.spliceNonCyclicOtherOptions(isg)

        found = options.length > 0

        if (found) {
            let op = options[0]
            newHC.spliceIn(isg, op.insertOtherAtIndex, op.otherNrOfShifts)

            isolatedSubgraphList.splice(i, 1)

            reconnectIsolatedSubgraphs_Rec(isolatedSubgraphList)
        }

    }

}


const orderedNodes = Array.from({ length: (totalNrOfCells) }, (_, i) => new Node(i))

var HamCycleStatus

var newHC

var HC

let currentHamCyclNodeIndex

const init = () => {
    HamCycleStatus = Status.CHECK_NEXT_CYCLE
    newHC = []
    HC = []
    let delta = 1
    let v = -1
    for (let i = 0; i < gridSideLen; i++) {

        delta = delta * (-1)
        v += gridSideLen
        v += delta

        for (let j = 0; j < (gridSideLen - 1); j++) {
            HC[(i * (gridSideLen - 1)) + j] = v
            v += delta
        }

    }
    let NN = totalNrOfCells
    for (let index = 0; index < gridSideLen; index++) {
        HC[NN - gridSideLen + index] = v
        v -= gridSideLen
    }
    visualizeHC(HC)
    currentHamCyclNodeIndex = null
    findCurrentHamCyclNodeIndex()
}



export {
    init,
    HC,
    excuteMove,
    changeHamCycle,
    requestHamCycleChange

}