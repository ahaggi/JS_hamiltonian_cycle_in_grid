import { setInputDirection } from './input.js'
import { getSnakeHead, getSnakeLen, onSnake } from '../snake.js'

import { visualizeHC, } from './hamCycleGridVisualization.js'

import { getFoodPosition } from "../food.js"
import { gridSideLen, totalNrOfCells } from '../grid.js'
import { orderedNodes, SubGraph } from './subgraph.js'




const abs = Math.abs
const max = Math.max


const MOVE_UP = { deltaX: -1, deltaY: 0 }
const MOVE_DOWN = { deltaX: 1, deltaY: 0 }
const MOVE_LEFT = { deltaX: 0, deltaY: -1 }
const MOVE_RIGHT = { deltaX: 0, deltaY: 1 }



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


var HamCycleStatus

var newHC

var HC

let currentHamCyclNodeIndex



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

    if (currentHamCyclNodeIndex == null || currentHamCyclNodeIndex < 0 || currentHamCyclNodeIndex > gridSideLen) {
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


const changeHamCycle = () => {

    //contains nrOfSteps, nodes, and in which directions
    let cuttingPathSections = getCuttingPathSections()

    newHC = []


    if (cuttingPathSections.length !== 0 

         && isValidCuttingPathSections(cuttingPathSections, HC[currentHamCyclNodeIndex])

    ) {

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
    else if (deltaXisGtZero && srcYisEven) {
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
    else if (deltaXisLtZero && !srcYisEven) {
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

    // Now there is 2 scenarios for the unaffected area by the change in the HC
    // 1- If the path between target to head is continuous, the characteristics of this scenario is:
    //          * the targetNodeIndex is cuttingPathIndecies[cuttingPathLen - 1]
    //          * UnaffectedPathAfterTarget is empty list
    //    In this case we have ONLY 1 unaffected area, the whole path is CYCLE (head --> target --> head), and the rest of the other nodes is isolatedSubgraphs.
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
     * What is the optimal notConnectableRange size? is it:
     *      option1 - The whole snakeBody length + cuttingPath: this will make it difficult to reconnect the isolatedSubgraphs to the newHC
     *      option2 - Just the head + cuttingPath: this can result in the possibility where the an isolatedSubgraph been concatenated with a wall where the snakeBody is, and make an unreachable section until the snakeHead traverse the rest of the whole board, which is ok unless the snakeBody is too tall which in turn can cause a collision.
     *      option3 - notConnectable.to is the target, BUT notConnectable.from is whatever comes furthest away from the target (at the moment when snakeHead reaches the target) either the snakeTail pos OR fst node in the cuttingPath.
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

        // this will yields whatever comes furthest away from the target, which is either:
        // - the snakeTail pos when snakeHead reaches the target, OR
        // - the snakeHead initial pos before making any move.
        //   Note: we add 1 to the CuttingPath in the max(… , cuttingPath+1) ,, to include the (initial pos before making any move) to the notConnectableRange

        let rangFmIndex = _newhcNodes.length - max(getSnakeLen(), (cuttingPathNodes.length + 1))
        notConnectableRange.formIndex = rangFmIndex
        notConnectableRange.toIndex = _newhcNodes.length - 1 // this will yields the snakeHead pos when snakeHead reaches the target


        newHC = new SubGraph(_newhcNodes, notConnectableRange)

    } else { // If the path between target to head is cutted, we will have 2 isolated unaffected areas

        // path from (fst node after the last cut) to and including (the head), this will also contain the WHOLE snakeBody x
        let unaffectedPathBefore = circularSlice(HC, (cuttingPathIndecies[cuttingPathLen - 1] + 1) % HC.length, (currentHamCyclNodeIndex + 1) % HC.length)

        //  before + pathdown + after
        let _newhcNodes = [...unaffectedPathBefore, ...(cuttingPathNodes.map(node => node.value)), ...unaffectedPathAfterTarget]

        // this will yields whatever comes furthest away from the target, which is either:
        // - the snakeTail pos when snakeHead reaches the target, OR
        // - the snakeHead initial pos before making any move.
        //   Note: we add 1 to the CuttingPath in the max(… , cuttingPath+1) ,, to include the (initial pos before making any move) to the notConnectableRange
        let rangFmIndex = _newhcNodes.length - unaffectedPathAfterTarget.length - max(getSnakeLen(), (cuttingPathNodes.length + 1))
        notConnectableRange.formIndex = rangFmIndex
        notConnectableRange.toIndex = (_newhcNodes.length - 1) - unaffectedPathAfterTarget.length // this will yields the snakeHead pos when snakeHead reaches the target

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

    // Note: the isolatedSubgraphList wouldn't nor shouldn't concat inside the notConnectableRange


    /**
     * From here there is 2 diff ways to connect the isolated subgraphs:
     * 1- Connect subgraphs without rotating it: just see if an newHC's root or leaf can be concatenated with isolatedSubgraph's leaf or root.
     *    This does not require that any of the isolatedSubgraphs nor the newHC to be cyclic subgraph i.e. they're hamiltonian paths but NOT  cycle
     *    a- take the fst and last nodes in the newHC's path and call them root and leaf respectively.
     *    b- search for a node in any isolatedSubgraph, where that node is either the fst or the last in the isolatedSubgraph and can be connected to either newHC's root or leaf.
     *    c- if found, then splice the 2 subGraphs, and update the notConnectableRange if necessary.
     *    d- repeat until there is no such node available.
     * 
     * 
     * 2- Connect isolatedSubgraphs and newHC after some rotation
     *    This require that at least one of the newHC and/or isolatedSubgraphs is cyclic. But the resulting subgraph can be non cyclic if we splice a cyclic and non-cyclic graphs. 
     *    a- choose a cyclic subgraph either newHC or an isolatedSubgraph.
     *    b- search for 2 nodes candidates which can serve as root and leaf in the cyclic subgraph and also can be concatenated in the the other subgraph. 
     *    c- if found, then excute the necessary rotaions, and splice the 2 subGraphs and update the notConnectableRange if necessary.
     *    d- repeat until there isn't any cyclic subgraph.
     */

    // ¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤DEV visulize path¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤
    // isolatedSubgraphList.forEach(g => {
    //     let path = g.path.map(n => n.value)
    //     visualizeHC(path)
    // })
    // visualizeHC(newHC.path.map(n => n.value))

    // let food = getFoodPosition()
    // visualizeHC([(food.x * gridSideLen) + food.y])

    // let snakeLen = getSnakeLen()

    // let snakeTail = ((currentHamCyclNodeIndex - (snakeLen - 1)) + totalNrOfCells) % totalNrOfCells
    // let snake = circularSlice(HC, snakeTail, (currentHamCyclNodeIndex + 1) % totalNrOfCells)
    // visualizeHC(snake)
    // ¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤



    reconnectIsolatedSubgraphs_Rec(isolatedSubgraphList)


    let isConnected = isolatedSubgraphList.length == 0
    if (!isConnected) {
        reconnectIsolatedSubgraphsWithRotation_Rec(isolatedSubgraphList)
        isConnected = isolatedSubgraphList.length == 0
    }



    if (isConnected) {

        HC = newHC.path.map(node => node.value)
        newHC = []

        findCurrentHamCyclNodeIndex()
        visualizeHC(HC)
        HamCycleStatus = Status.CONNECTED_OK
    } else {

        // ¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤DEV visulize path¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤
        // isolatedSubgraphList.forEach(g => {
        //     let path = g.path.map(n => n.value)
        //     visualizeHC(path)
        // })
        // visualizeHC(newHC.path.map(n => n.value))

        // let food = getFoodPosition()
        // visualizeHC([(food.x * gridSideLen) + food.y])

        // let snakeLen = getSnakeLen()

        // let snakeTail = ((currentHamCyclNodeIndex - (snakeLen - 1)) + totalNrOfCells) % totalNrOfCells
        // let snake = circularSlice(HC, snakeTail, (currentHamCyclNodeIndex + 1) % totalNrOfCells)
        // visualizeHC(snake)
        // ¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤


        // ¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤DEV visulize path¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤
        // console.log("isConnected is false")
        visualizeHC(HC)
        // ¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤

    }

}

const assert_newHC_validity = (newHC) => {

    const debug = {
        prevHC: [],
        snakeHead: null,
        food: null
    }

    let headPos = getSnakeHead()
    let head = headPos.x * gridSideLen + headPos.y
    let foodPos = getFoodPosition()
    let target = (foodPos.x * gridSideLen) + foodPos.y

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
            debug.prevHC = HC
            debug.snakeHead = headPos
            debug.food = foodPos
            throw 'invalid path'
        }
    }


    let headIndexInNewHC = newHC.path.findIndex(node => node.value == head)

    let targetIndexInNewHC = newHC.path.findIndex(node => node.value == target)

    if (targetIndexInNewHC == -1 || headIndexInNewHC == -1) {
        throw `the head index in the newHC is ${headIndexInNewHC}, the target index in the newHC is ${targetIndexInNewHC},, Both of which must be not eq to -1`
    }

    // If the notConnectable range worked properly, then the nr of steps between head and target following the newHC MUST be lte ((2 * gridSideLen) + 1), which is the theoretical limit of the cuttingPath, accourding to the current implementation.
    let steps = ((targetIndexInNewHC - headIndexInNewHC) + totalNrOfCells) % totalNrOfCells

    if (steps >= (2 * gridSideLen) + 1) { // The theoretical limit for the nr of steps in cuttingPath is lte (2 * gridSideLen)
        debug.prevHC = HC
        debug.snakeHead = headPos
        debug.snakeLen = getSnakeLen()
        debug.food = foodPos
        debug.newHC = newHC

        throw `The path between the head and the target has ${steps} steps which is gt ((2 * gridSideLen) + 1) "the theoretical limit of the cuttingPath", accourding to the current implementation.! `
    }

}

const reconnectIsolatedSubgraphsWithRotation_Rec = (isolatedSubgraphList) => {
    // basecase
    if (isolatedSubgraphList.length == 0)
        return


    let found = false
    // iterate through isolatedSubgraphList
    for (let i = 0; i < isolatedSubgraphList.length && !found; i++) {

        let isg = isolatedSubgraphList[i]
        let option = null
        if (isg.isCyclic) {
            option = newHC.spliceCyclicOtherOptions_Bitwise(isg)

            if (option) {

                // let insert_other_at_index = option.insert_other_at_index
                // let other_new_root_index = option.other_new_root_index

                // if (insert_other_at_index == null || other_new_root_index == null) {  // (typeof(some_variable) === "undefined" && some_variable === null)     is eq to    (some_variable == null)
                //     throw `Node Local Index Err: this can be due to bug at getNodeLocalIndex or spliceCyclicOtherOptions_Bitwise, can't find option.insert_other_at_index ${option.insert_other_at_index} and/or option.other_root ${option.other_root}`
                // }

                found = true
                newHC.spliceIn(isg, option.insert_other_at_index, option.other_new_root_index)
            }

        } else if (newHC.isCyclic) {
            option = isg.spliceCyclicOtherOptions_Bitwise(newHC)
            if (option) {


                // let insert_other_at_index = option.insert_other_at_index
                // let other_new_root_index = option.other_new_root_index
                // if (insert_other_at_index == null || other_new_root_index == null) {  // (typeof(some_variable) === "undefined" && some_variable === null)     is eq to    (some_variable == null)
                //     throw `Node Local Index Err: this can be due to bug at getNodeLocalIndex or spliceCyclicOtherOptions_Bitwise, can't find option.insert_other_at_index ${option.insert_other_at_index} and/or option.other_root ${option.other_root}`
                // }


                found = true
                isg.spliceIn(newHC, option.insert_other_at_index, option.other_new_root_index)
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
        let option = newHC.spliceNonCyclicOtherOptions(isg)


        if (option) {
            found = true
            newHC.spliceIn(isg, option.insert_other_at_index, option.other_new_root_index)
            isolatedSubgraphList.splice(i, 1)

            reconnectIsolatedSubgraphs_Rec(isolatedSubgraphList)
        }

    }

}


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