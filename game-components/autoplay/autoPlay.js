import { setInputDirection } from './input.js'
import { getSnakeHead, onSnake } from '../snake.js'
import { gridSideLen } from '../grid.js'
import { visualizeHC, } from './hamCycleGridVisualization.js'
import { PathWithOrientaion, Orientation } from "./pathWithOrientaion.js"
import { getFoodPosition } from "../food.js"
import { totalNrOfCells } from './gameBoard.js'

const abs = Math.abs
const floor = Math.floor

const MOVE_UP = { deltaX: -1, deltaY: 0 }
const MOVE_DOWN = { deltaX: 1, deltaY: 0 }
const MOVE_LEFT = { deltaX: 0, deltaY: -1 }
const MOVE_RIGHT = { deltaX: 0, deltaY: 1 }


const findCurrentHamCyclNodeIndex = () => {
    let snakeHead = getSnakeHead()
    let currentHamCyclNode = snakeHead.x * gridSideLen + snakeHead.y
    currentHamCyclNodeIndex = HC.indexOf(currentHamCyclNode)
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

    const lastColumn = gridSideLen - 1

    // currentHamCyclNodeIndex!=0 since the truthy of the number 0 is false
    if (currentHamCyclNodeIndex != 0 && !currentHamCyclNodeIndex) {
        // currentHamCyclNodeIndex is undifined
        findCurrentHamCyclNodeIndex()
    }

    //contains nrOfSteps, nodes, and in which directions
    let cuttingPathSections = getCuttingPathSections()



    newHC = []


    if (cuttingPathSections.length !== 0 && isValidCuttingPath(cuttingPathSections, HC[currentHamCyclNodeIndex])) {

        let { cuttingPathNodes, cuttingPathIndecies } = getCuttingPath(cuttingPathSections, currentHamCyclNodeIndex)

        if (cuttingPathIndecies.length > 0) {

            let { x: targetX, y: targetY } = getFoodPosition()
            let targetNode = (targetX * gridSideLen) + targetY
            let targetNodeIndex = HC.indexOf(targetNode)

            let { isolatedSubgraphList, notConnectableRange } = findqqqqqqqqqq(cuttingPathNodes, cuttingPathIndecies, targetNodeIndex)

            // ¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤ DEV visulize path ¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤
            isolatedSubgraphList.forEach(path => {
                visualizeHC(path)
            })
            visualizeHC(newHC)
            // ¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤

            reconnectGraph(isolatedSubgraphList, notConnectableRange)
        }
    }
}

const isChangingWorthwhile = () => {

    // Trying to change the HC is worthwhile if:
    //      - The existing path between the snakehead and the food (targetNode) is "far away". Where "far away" is an arbitrary limit on the nr of steps, lets say farAwayLimit is (2 x gridSideLen) steps.
    //      - The cuttingPath (from snakeHead to the food "targetNode") does NOT prevent the isoSubgraphs from concating with the potential newHC

    const snakeHead = HC[currentHamCyclNodeIndex]
    const srcX = floor(snakeHead / gridSideLen)
    const srcY = snakeHead % gridSideLen
    const { x: targetX, y: targetY } = getFoodPosition()
    const targetNode = (targetX * gridSideLen) + targetY

    // 1- Checking if the existing path between the snakehead and the food (targetNode) is "far away"
    let farAwayLimit = (2 * gridSideLen)
    let nrOfSteps = 0
    while (nrOfSteps < farAwayLimit) {
        nrOfSteps++ // starts counting from fst node after the head,, nrOfSteps will be 1

        let index = (nrOfSteps + currentHamCyclNodeIndex) % HC.length
        if (targetNode == HC[index])
            break
    }

    //   if the current HC has a path from snakeHead to target with lt "farAwayLimit" steps, then considering to change the current HC is NOT worthwhile
    if (nrOfSteps < farAwayLimit) // Note if nrOfSteps == farAwayLimit, then considering to change the current HC is worthwhile
        return false


    // 2- TChecking if the cuttingPath (from snakeHead to the food "targetNode") does NOT prevent the isoSubgraphs from concating with the potential newHC

    const fstIndex = 0
    const lastIndex = gridSideLen - 1

    const lowerLimit = fstIndex + 2
    const upperLimit = lastIndex - 2

    // Check that the cuttingPath does NOT prevent the isoSubgraphs from concating with the potential newHC
    // In a board with gridSideLen = 8, the lowerLimit is 2 and upperLimit is 5
    // if head=(<2, *)   then    (*, 2) >= targetY <= (*, 5) && targetX < (5, *)  , the one exception is when the target and head are (0, *)
    // if head=(>5, *)   then    (*, 2) >= targetY <= (*, 5) && targetX > (2, *)  , the one exception is when the target and head are (7, *)
    // if head=(*, <2)   then    (2, *) >= targetX <= (5, *) && targetY < (*, 5)  , the one exception is when the target and head are (*, 0)
    // if head=(*, >5)   then    (2, *) >= targetX <= (5, *) && targetY > (*, 2)  , the one exception is when the target and head are (*, 7)

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


class CuttingSection {
    #cuttingNodes
    constructor(fmSrcNode, nrOfSteps, direction) {
        this.nrOfSteps = nrOfSteps
        this.direction = direction
        this.fmSrcNode = fmSrcNode
        this.#cuttingNodes = []
        this.#genCuttingNodes()
    }

    get nodes() {
        return this.#cuttingNodes
    }

    #genCuttingNodes() {
        let incValue = getEdgeCost(this.direction)

        for (let s = 1; s <= this.nrOfSteps; s++) {
            // start from 1 since 0 will yield the fmSrcNode's value, for ex snakeHead 
            let node = this.fmSrcNode + (incValue * s)

            let x = floor(node / gridSideLen)
            let y = node % gridSideLen

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

const getCuttingPathSections = () => {
    // let head = getSnakeHead()
    let { x: headX, y: headY } = { x: floor(HC[currentHamCyclNodeIndex] / gridSideLen), y: (HC[currentHamCyclNodeIndex] % gridSideLen) }
    // let head = { x: floor(10 / gridSideLen), y: (10 % gridSideLen) }

    let { x: targetX, y: targetY } = getFoodPosition()

    let deltaX = targetX - headX
    let deltaY = targetY - headY

    let absDeltaX = abs(deltaX)
    let absDeltaY = abs(deltaY)

    let headXisEven = headX % 2 === 0
    let headYisEven = headY % 2 === 0
    let deltaXisLtZero = deltaX < 0
    let deltaXisGtZero = deltaX > 0


    let targetXisEven = targetX % 2 === 0
    let targetYisEven = targetY % 2 === 0
    let deltaYisLtZero = deltaY < 0
    let deltaYisGtZero = deltaY > 0

    let cuttingPathSections = []
    let fmSrcNode = HC[currentHamCyclNodeIndex]

    {
        /** 
            A: deltaY < 0
            NOT_A: deltaY > 0
    
            B: targetX isEven
            NOT_B: targetX isOdd
    
            C: targetY isEven
            NOT_C: targetY isOdd
    
            D: headX isEven
            NOT_D: headX isOdd
    
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

    //-----Vertical first approach-----
    if (deltaX > 0 && headYisEven) {


        // case 1
        if (deltaY == 0) {//if head and the target are at the same column
            // if next move in path down is already the same as current HC
            if ((HC[currentHamCyclNodeIndex] + gridSideLen) == HC[(currentHamCyclNodeIndex + 1) % HC.length]) {
                cuttingPathSections = []
            } else {
                let s1 = new CuttingSection(fmSrcNode, deltaX, Direction.DOWN)
                cuttingPathSections = [s1]
            }
        }
        //case2 (A B) + (NOT_A NOT_B)
        // path = ( deltaX ==> deltaY),
        else if ((deltaYisLtZero && targetXisEven) || (deltaYisGtZero && !targetXisEven)) {
            let s1 = new CuttingSection(fmSrcNode, absDeltaX, Direction.DOWN)

            fmSrcNode = fmSrcNode + (absDeltaX * getEdgeCost(Direction.DOWN))
            let horizontalDirection = deltaYisLtZero ? Direction.LEFT : Direction.RIGHT
            let s2 = new CuttingSection(fmSrcNode, absDeltaY, horizontalDirection)

            cuttingPathSections = [s1, s2]
        }
        //case3 (A NOT_B C) + (NOT_A B C) // DONT simplify this boolean expression this to avoid overlapping with the next "case 4"
        //path = ((deltaX-1) ==> deltaY ==> (1x))
        else if ((deltaYisLtZero && !targetXisEven && targetYisEven) || (deltaYisGtZero && targetXisEven && targetYisEven)) {
            let s1 = new CuttingSection(fmSrcNode, (absDeltaX - 1), Direction.DOWN)

            fmSrcNode = fmSrcNode + ((absDeltaX - 1) * getEdgeCost(Direction.DOWN))
            let horizontalDirection = deltaYisLtZero ? Direction.LEFT : Direction.RIGHT
            let s2 = new CuttingSection(fmSrcNode, absDeltaY, horizontalDirection)

            fmSrcNode = fmSrcNode + (absDeltaY * getEdgeCost(horizontalDirection))
            let s3 = new CuttingSection(fmSrcNode, 1, Direction.DOWN)

            cuttingPathSections = [s1, s2, s3]
        }
        //case4 (A NOT_B NOT_C)
        //path = ((deltaX-1) ==> (deltaY+1) ==> (1x) ==> (-1y))
        else if (deltaYisLtZero && !targetXisEven && !targetYisEven) {
            let s1 = new CuttingSection(fmSrcNode, (absDeltaX - 1), Direction.DOWN)

            fmSrcNode = fmSrcNode + ((absDeltaX - 1) * getEdgeCost(Direction.DOWN))
            let s2 = new CuttingSection(fmSrcNode, (absDeltaY + 1), Direction.LEFT)

            fmSrcNode = fmSrcNode + ((absDeltaY + 1) * getEdgeCost(Direction.LEFT))
            let s3 = new CuttingSection(fmSrcNode, 1, Direction.DOWN)

            fmSrcNode = fmSrcNode + (1 * getEdgeCost(Direction.DOWN))
            let s4 = new CuttingSection(fmSrcNode, 1, Direction.RIGHT)

            cuttingPathSections = [s1, s2, s3, s4]
        }
        // case5 (NOT_A B NOT_C)
        // path = ((deltaX-1) ==> (deltaY-1) ==> (2x) ==> (1y) ==> (-1x))
        else if (deltaYisGtZero && targetXisEven && !targetYisEven) {
            let s1 = new CuttingSection(fmSrcNode, (absDeltaX - 1), Direction.DOWN)

            fmSrcNode = fmSrcNode + ((absDeltaX - 1) * getEdgeCost(Direction.DOWN))
            let s2 = new CuttingSection(fmSrcNode, (absDeltaY - 1), Direction.RIGHT)

            fmSrcNode = fmSrcNode + ((absDeltaY - 1) * getEdgeCost(Direction.RIGHT))
            let s3 = new CuttingSection(fmSrcNode, 2, Direction.DOWN)

            fmSrcNode = fmSrcNode + (2 * getEdgeCost(Direction.DOWN))
            let s4 = new CuttingSection(fmSrcNode, 1, Direction.RIGHT)

            fmSrcNode = fmSrcNode + (1 * getEdgeCost(Direction.RIGHT))
            let s5 = new CuttingSection(fmSrcNode, 1, Direction.UP)

            cuttingPathSections = [s1, s2, s3, s4, s5]
        }
    } else if (deltaYisLtZero && deltaX == 0 && headXisEven) { // the target is in the same row and to the left of the snakeHead and headXisEven

        // if next move in pathLeft is already the same as current HC
        if ((HC[currentHamCyclNodeIndex] - 1) == HC[(currentHamCyclNodeIndex + 1) % HC.length]) {
            cuttingPathSections = []
        } else {
            let s1 = new CuttingSection(fmSrcNode, absDeltaY, Direction.LEFT)
            cuttingPathSections = [s1]
        }

    } else if (deltaYisGtZero && deltaX == 0 && !headXisEven) { // the target is in the same row and to the left of the snakeHead and headXisOdd
        // if next move in pathRight is already the same as current HC
        if ((HC[currentHamCyclNodeIndex] + 1) == HC[(currentHamCyclNodeIndex + 1) % HC.length]) {
            cuttingPathSections = []
        } else {
            let s1 = new CuttingSection(fmSrcNode, absDeltaY, Direction.RIGHT)
            cuttingPathSections = [s1]
        }

    }
    return cuttingPathSections
}

const getCuttingPath = (cuttingPathSections, srcNodeindex) => {
    // cuttingPathIndecies: this will include ONLY the cuttingPath indecies, EXCEPT (the snakehead)
    let cuttingPathIndecies = []


    let cuttingPathNodes = (cuttingPathSections.map(cs => cs.nodes)).flat()


    // Generate cuttingPathIndecies: we have to insure that cuttingPathIndecies has the same order as current HC
    for (let i = 1; i < HC.length; i++) {

        let index = (i + srcNodeindex) % HC.length
        let node = HC[index]

        if (cuttingPathNodes.indexOf(node) !== -1) {
            cuttingPathIndecies.push(index)
        }
    }

    if (cuttingPathNodes.length !== cuttingPathIndecies.length) throw `getCuttingPath function: there is inconsistency between the nr of (nodes inside cuttingPathSections) which is ${cuttingPathNodes.length} nodes, and the generated cuttingPathIndecies ${cuttingPathIndecies.length} nodes `

    return { cuttingPathNodes, cuttingPathIndecies }
}

const findqqqqqqqqqq = (cuttingPathNodes, cuttingPathIndecies, targetNodeIndex) => {
    // isolatedSubgraphList is list of lists
    let isolatedSubgraphList = []
    let UnaffectedPathAfterTarget = []
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
            UnaffectedPathAfterTarget.push(...temp)

        } else {
            isolatedSubgraphList.push(temp)
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
    // The isolatedSubgraphList wouldn't nor shouldn't concat to this section [ form_newHC_index , to_newHC_index ] ,
    // to_newHC_index is INCLUDED in this section
    //     form_newHC_index: the index of the snakeHead 
    //     to_newHC_index: the index of "the target" 
    let notConnectableRange = {
        form_newHC_index: null,
        to_newHC_index: null,
    }


    // If the path between target to head is continuous 
    if (UnaffectedPathAfterTarget.length == 0) { // if (targetNodeIndex == cuttingPathIndecies[cuttingPathLen - 1])

        // path from (fst node after target) to (fst node in cuttingPath), this will also contain the WHOLE snakeBody
        let temp = circularSlice(HC, (cuttingPathIndecies[cuttingPathLen - 1] + 1) % HC.length, (currentHamCyclNodeIndex + 1) % HC.length)

        //  before + pathdown 
        newHC.push(...temp, ...cuttingPathNodes)

        /**
         * Its ok to concat a isolatedSubgraph to the any nodes inside the newHC (except the cuttingPathNodes nodes)
         * therefore the flwg commented code will not be used! 
                // if the (snakeBody + maxExpansionRate) is not long enough to fill the newHC, then include JUST the snakeHead to "notConnectableRange", otherwise include the whole snakeBody to "notConnectableRange" 
                let nrOfNotconnectableSnakeBody = (getSnakeLen() + ### ) < (temp.length + cuttingPathNodes.length) ? 0 : (getSnakeLen() - 1)
                let nrOfNotconnectable = nrOfNotconnectableSnakeBody + cuttingPathLen
                notConnectableRange.form_newHC_index = newHC.length - nrOfNotconnectable
         */

        notConnectableRange.form_newHC_index = newHC.length - (cuttingPathLen + 1) // (cuttingPathLen + 1) to include the head in notConnectableRange
        notConnectableRange.to_newHC_index = newHC.length - 1

    } else { // If the path between target to head is cutted, we will have 2 isolated unaffected areas

        // path from (fst node after the last cut) to and including (the head), this will also contain the WHOLE snakeBody
        let UnaffectedPathBefore = circularSlice(HC, (cuttingPathIndecies[cuttingPathLen - 1] + 1) % HC.length, (currentHamCyclNodeIndex + 1) % HC.length)

        //  before + pathdown + after
        newHC.push(...UnaffectedPathBefore, ...cuttingPathNodes, ...UnaffectedPathAfterTarget)

        /**
         * Its ok to concat a isolatedSubgraph to the any nodes inside the newHC (except the cuttingPathNodes)
         */
        notConnectableRange.form_newHC_index = (newHC.length - (cuttingPathLen + 1)) - UnaffectedPathAfterTarget.length // (cuttingPathLen + 1) to include the head in notConnectableRange
        notConnectableRange.to_newHC_index = (newHC.length - 1) - UnaffectedPathAfterTarget.length
    }


    return {
        isolatedSubgraphList,
        notConnectableRange
    }
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


const isValidCuttingPath = (cuttingPathSections, srcNode) => {

    // valid cuttingPath is path that:
    //      - continuous all the sections form a continuos path
    //      - does not intersect the snakeBody

    if (srcNode >= (totalNrOfCells) || srcNode < 0)
        throw ` invalid srcNode value: ${srcNode}`


    let valid = true
    let continuous = true

    let node = srcNode

    for (let j = 0; (j < cuttingPathSections.length) && valid; j++) {
        let cuttingSection = cuttingPathSections[j]
        let nrOfSteps = cuttingSection.nrOfSteps
        let direction = cuttingSection.direction
        let cuttingSectionNodes = cuttingSection.nodes
        let incValue = getEdgeCost(direction)

        for (let k = 0; (k < nrOfSteps) && valid; k++) {

            node = node + incValue
            continuous = node == cuttingSectionNodes[k]

            if (!continuous) {
                console.log(cuttingPathSections)
                throw `isValidCuttingPathfunction: The nodes inside those cuttingPathSections is not continuous at node ${cuttingSectionNodes[k]} \n this error can occur becuase of a bug at "CuttingSection class inside #genCuttingNodes() method"`
            }

            let x = floor(node / gridSideLen)
            let y = node % gridSideLen
            valid = continuous && !onSnake({ x, y })
        }
    }
    return valid
}

const reconnectGraph = (isolatedSubgraphList, notConnectableRange) => {

    // Note: the isolatedSubgraphList wouldn't nor shouldn't concat to notConnectableRange


    // * 1- Connect subgraphs without orientaiton: this depends on that the newHC does NOT form closed loop of its added nodes up to this point:

    /**
     * From here there is 2 diff ways to connect the isolated subgrah:
     * 1- Connect subgraphs without orientaiton: this depends on that the newHC does NOT form closed loop of its added nodes up to this point:
     *  a-start from the last node inside "newHC" call it "leaf" (note that there is NO edge between "leaf" and the fst node inside newHC) i.e. newHC is hamiltonian path but NOT  cycle.
     *  b-find any isolatedSubgraph that can connenct to "leaf", and set leaf = last node inside this isolatedSubgraph
     *  c-repeat.
     * 
     * 2- Connect subgraphs with orientaiton
     *  a- reorder all nodes inside isolatedSubgraph into new Subgraph. If secceed, continue, Otherwise terminate and try again on next move.
     *  b- Foreach reorderedSubgraph, create "pathWithOrientaion object". If secceed, continue, Otherwise terminate and try again on next move.
     *  c- 
     *  b- iterate{ (worst case scenario  (n * (n + 1)) / 2) , where n is nr of items inside pathWithOrientaionList
     *       try diff rotation on an PathWithOrientaion, to find out if it is possible to connect it to a "wall" inside "newHC"
     *  }
     * 
     * Finally, if there is no more items inside PathWithOrientaion set newHC as the HC
     *  
     */


    // 1- try to reconnect the paths without orientation
    let isConnected = reconnectIsolatedSubgraphs_Rec(isolatedSubgraphList, notConnectableRange)


    if (!isConnected) {
        // 2- Now we can try to reconnect the paths that have an orientation
        let orientedSubgraphList = reorderIsolatedSubgraph(isolatedSubgraphList)

        // if not all the nodes is included, then "reorderIsolatedSubgraph" will return empty list
        let reorderingSuccess = orientedSubgraphList.length != 0

        if (reorderingSuccess) {

            // pathWithOrientaionList is list of pathWithOrientaion object
            let pathWithOrientaionList = []




            let canBeConcatenated = orientedSubgraphList.every(osg => {
                // For each orientedSubgraph path set orientation and return true if succeeded
                let validPath = hasOrientaion(osg)
                if (validPath) {
                    let o = findOrientaion(osg)
                    let p = new PathWithOrientaion(osg, o)
                    pathWithOrientaionList.push(p)
                }
                return validPath
            })

            if (canBeConcatenated) {
                isConnected = concatPathWithOrientaionList(pathWithOrientaionList, notConnectableRange)
            }
            // ¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤DEV visulize path¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤
            pathWithOrientaionList.forEach(path => {
                visualizeHC(path.nodes)
            })
            visualizeHC(newHC)
            // ¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤

        }
    }

    if (isConnected) {
        HC = newHC
        newHC = []

        findCurrentHamCyclNodeIndex()
        visualizeHC(HC)
        HamCycleStatus = Status.CONNECTED_OK
    }
    else {

        console.log("isConnected is false")

    }

}


const reconnectIsolatedSubgraphs_Rec_toRoot = (isolatedSubgraphList, notConnectableRange) => {
    // basecase
    if (isolatedSubgraphList.length == 0)
        return

    const root = newHC[0]

    const rootX = floor(root / gridSideLen)
    const rootY = root % gridSideLen

    const rootXisEven = rootX % 2 == 0
    const rootYisEven = rootY % 2 == 0

    // The actual values of adjCellSameRow and adjCellSameColumn can be neg. if the root is a node that lies at the edge of the grid!
    // But a neg value will NOT be equal to any node in the graph.
    let adjCellSameRow = -1
    let adjCellSameColumn = -1

    if (rootXisEven)
        //for ex root node 14 can reached from node 13      right
        //for ex root node  9 can reached from node 8       rigth
        adjCellSameRow = (floor((root + 1) / gridSideLen) == rootX) ? (root + 1) : -1   // Important not all node and (node+1) are at the same row,, i.e. node 7 and 8 are not in the same row
    else
        //for ex root node 18 can reached from node 19      left
        //for ex root node 17 can reached from node 18      left
        adjCellSameRow = (floor((root - 1) / gridSideLen) == rootX) ? (root - 1) : -1   // Important not all node and (node-1) are at the same row,, i.e. node 16 and 15 is not in the same row



    if (rootYisEven)
        //for ex root node 18 can reached from node 10         down
        //for ex root node 14 can reached from node  6         down

        adjCellSameColumn = root - gridSideLen
    else
        //for ex root node 17 can reached from node 25         up 
        //for ex root node  9 can reached from node 17         up 

        adjCellSameColumn = root + gridSideLen


    let found = false
    // iterate through isolatedSubgraphList
    for (let i = 0; i < isolatedSubgraphList.length && !found; i++) {

        let isg = isolatedSubgraphList[i]

        if (isCycle(isg)) {
            // iterate through and check each node in a isolatedSubgraph
            let j = isg.length
            while (j > 0 && !found) {
                j--
                let hd = isg[j]
                found = (hd === adjCellSameRow) || (hd === adjCellSameColumn)
            }
            // rotate the elms inside isg to make sure that the found node is the last elm 
            let temp = [...isg.slice(j + 1), ...isg.slice(0, j + 1)]
            isg.length = 0
            isg.push(...temp)
        } else {
            // JUST check the last node in a isolatedSubgraph
            let hd = isg[isg.length - 1]
            found = (hd === adjCellSameRow) || (hd === adjCellSameColumn)
        }


        if (found) {
            isolatedSubgraphList.splice(i, 1)
            let temp = [...isg, ...newHC]
            newHC.length = 0
            newHC.push(...temp)

            // Important to remember to update the notConnectableRange since we added to the begning of the newHC
            updateNotConnectableRange(notConnectableRange, isg.length)

            reconnectIsolatedSubgraphs_Rec_toRoot(isolatedSubgraphList, notConnectableRange)
        }
    }

}
const reconnectIsolatedSubgraphs_Rec_toLeaf = (isolatedSubgraphList, notConnectableRange) => {
    // basecase
    if (isolatedSubgraphList.length == 0)
        return

    let leaf = newHC[newHC.length - 1]

    let leafX = floor(leaf / gridSideLen)
    let leafY = leaf % gridSideLen

    let leafXisEven = leafX % 2 == 0
    let leafYisEven = leafY % 2 == 0

    // The actual values of adjCellSameRow and adjCellSameColumn can be neg. if the leaf is a node that lies at the edge of the grid!
    // But a neg value will NOT be equal to any node in the graph.
    let adjCellSameRow = -1
    let adjCellSameColumn = -1

    if (leafXisEven)
        //for ex leaf node 18 can reach to node 17         left
        //for ex leaf node 17 can reach to node 16         left
        adjCellSameRow = (floor((leaf - 1) / gridSideLen) == leafX) ? (leaf - 1) : -1   // Important not all node and (node-1) are at the same row,, i.e. node 7 and 8 are not in the same row

    else
        //for ex leaf node 14 can reach to node 15         left
        //for ex leaf node  9 can reach to node 10         left
        adjCellSameRow = (floor((leaf + 1) / gridSideLen) == leafX) ? (leaf + 1) : -1   // Important not all node and (node+1) are at the same row,, i.e. node 7 and 8 are not in the same row


    if (leafYisEven)
        //for ex leaf node 18 can reach to node 26         up
        //for ex leaf node 14 can reach to node 22         up
        adjCellSameColumn = leaf + gridSideLen
    else
        //for ex leaf node 17 can reach to node 9         down 
        //for ex leaf node  9 can reach to node 1         down 
        adjCellSameColumn = leaf - gridSideLen


    let found = false
    // iterate through isolatedSubgraphList
    for (let i = 0; i < isolatedSubgraphList.length && !found; i++) {

        let isg = isolatedSubgraphList[i]

        if (isCycle(isg)) {
            // iterate through and check each node in a isolatedSubgraph
            let j = isg.length
            while (j > 0 && !found) {
                j--
                let hd = isg[j]
                found = (hd === adjCellSameRow) || (hd === adjCellSameColumn)
            }
            // rotate the elms inside isg to make sure that the found node is the first elm 
            let temp = [...isg.slice(j), ...isg.slice(0, j)]
            isg.length = 0
            isg.push(...temp)
        } else {
            // JUST check the first node in a isolatedSubgraph
            let hd = isg[0]
            found = (hd === adjCellSameRow) || (hd === adjCellSameColumn)
        }


        if (found) {
            isolatedSubgraphList.splice(i, 1)
            newHC.push(...isg)
            reconnectIsolatedSubgraphs_Rec_toLeaf(isolatedSubgraphList, notConnectableRange)
        }
    }
}

const isCycle = (path) => {
    let root = path[0]
    let leaf = path[path.length - 1]

    let diff = root - leaf
    let adjecent = (abs(diff) == 1 || abs(diff) == gridSideLen)

    let sameCol = root % gridSideLen == leaf % gridSideLen
    let sameRow = floor(root / gridSideLen) == floor(leaf / gridSideLen)

    return path.length >= 4 && adjecent && (sameCol || sameRow)
}

/// Connect subgraphs without orientaiton: this will work  of its added nodes up to this point
const reconnectIsolatedSubgraphs_Rec = (isolatedSubgraphList, notConnectableRange) => {

        // note: reconnectIsolatedSubgraphs_Rec_toLeaf is halv recurrsion to avoid stackoverflow!
        reconnectIsolatedSubgraphs_Rec_toLeaf(isolatedSubgraphList, notConnectableRange)

        // note: reconnectIsolatedSubgraphs_Rec_toRoot is halv recurrsion to avoid stackoverflow!
        reconnectIsolatedSubgraphs_Rec_toRoot(isolatedSubgraphList, notConnectableRange)

        // ¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤DEV visulize path¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤
        isolatedSubgraphList.forEach(path => {
            visualizeHC(path)
        })
        visualizeHC(newHC)
        // ¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤


    return isolatedSubgraphList.length == 0
}



const updateNotConnectableRange = (notConnectableRange, shift) => {
    let newForm_newHC_index = notConnectableRange.form_newHC_index + shift
    let newTo_newHC_index = notConnectableRange.to_newHC_index + shift

    if ((newForm_newHC_index > newTo_newHC_index) || newForm_newHC_index < 0 || newTo_newHC_index >= newHC.length) {
        throw `updateNotConnectableRange : invalid change in the notConnectableRange newForm_newHC_index: ${newForm_newHC_index}, newTo_newHC_index: ${newTo_newHC_index}`
    }

    notConnectableRange.form_newHC_index = newForm_newHC_index
    notConnectableRange.to_newHC_index = newTo_newHC_index
}















const reorderIsolatedSubgraph = (isolatedSubgraph) => {
    const orderNodes = (p, q, matrix, line1, line2, res, orderByRow) => {

        let nodeRow1 = matrix[p][q];

        let nodeRow2 = matrix[p + 1][q]

        if (nodeRow1 == -1 || nodeRow2 == -1) return

        let nextRow1 = matrix[p][q + 1]
        let nextRow2 = matrix[p + 1][q + 1]
        if (q < (gridSideLen - 1) && (nextRow1 != -1) && (nextRow2 != -1)) {
            line1.push(nodeRow1)
            line2.push(nodeRow2)
            matrix[p][q] = -1 // nodeRow1
            matrix[p + 1][q] = -1 // nodeRow2

        } else if (line1.length != 0) { // line1.length is always eq to line2.length
            line1.push(nodeRow1)
            line2.push(nodeRow2)
            matrix[p][q] = -1 // nodeRow1
            matrix[p + 1][q] = -1 // nodeRow2

            if (
                (orderByRow && p % 2 == 0) ||
                (!orderByRow && p % 2 != 0)
            )
                line1.reverse()
            else
                line2.reverse()
            let temp = [...line1, ...line2]
            res.push(temp)
            line1.length = 0 // don't empty line1 by reassign a new array line1=[], since this will assgin a new array to the ref and not the original line1
            line2.length = 0
        }
    }


    let allNodes = isolatedSubgraph.flat()



    var rowFstMatrix = [];
    for (let p = 0; p < gridSideLen; p++) {
        let temp = new Array(gridSideLen).fill(-1)
        rowFstMatrix.push(temp)
    }

    var colFstMatrix = [];
    for (let p = 0; p < gridSideLen; p++) {
        let temp = new Array(gridSideLen).fill(-1)
        colFstMatrix.push(temp)
    }


    for (let i = 0; i < allNodes.length; i++) {
        let node = allNodes[i];
        let a = Math.floor(node / gridSideLen)
        let b = node % gridSideLen
        rowFstMatrix[a][b] = node
        colFstMatrix[b][a] = node
    }


    var row1 = []
    var row2 = []
    var rowRes = []
    var col1 = []
    var col2 = []
    var colRes = []
    for (let x = 0; x < (gridSideLen - 1); x++) {
        for (let y = 0; y < gridSideLen; y++) {
            orderNodes(x, y, rowFstMatrix, row1, row2, rowRes, true)
            orderNodes(x, y, colFstMatrix, col1, col2, colRes, false)
        }
    }

    let rowFstMatrixSuccess = rowFstMatrix.every(list => list.every(node => node == -1))
    let colFstMatrixSuccess = colFstMatrix.every(list => list.every(node => node == -1))


    if (rowFstMatrixSuccess && colFstMatrixSuccess) {
        return rowRes.length < colRes.length ? rowRes : colRes
    } else if (rowFstMatrixSuccess) {
        return rowRes
    } else if (colFstMatrixSuccess) {
        return colRes
    } else return []

}

const concatPathWithOrientaionList = (pathWithOrientaionList, notConnectableRange) => {
    let it = 0
    // worst case scenario  (n * (n + 1)) / 2
    let it_end = (pathWithOrientaionList.length * (pathWithOrientaionList.length + 1)) / 2

    while (pathWithOrientaionList.length > 0 && (it < it_end)) {
        let q = pathWithOrientaionList.length - 1 - (it % pathWithOrientaionList.length)
        let dp = pathWithOrientaionList[q]

        let dpBeenConcatenated = false

        let arr = Object.entries(Orientation)
        for (let index = 0; index < arr.length && !dpBeenConcatenated; index++) {
            const [key, value] = arr[index]

            dp.getRotatedNodes(value)
            dpBeenConcatenated = concatToWall(dp, notConnectableRange)
        }

        it++

        if (dpBeenConcatenated)
            pathWithOrientaionList.splice(q, 1)
    }

    return pathWithOrientaionList.length == 0

}

const hasOrientaion = (path) => {

    if (path.length < 4)
        return false

    let midNdx = path.length / 2
    let lastNdx = path.length - 1

    let diff1 = path[0] - path[1]
    let diff2 = path[0] - path[lastNdx]
    // hasOrientaion is 2 adjecent and connected rows or cols, with total length greater than or eq to 4 nodes
    let hasOrientaion = (abs(diff1) == 1 && abs(diff2) == gridSideLen) || (abs(diff2) == 1 && abs(diff1) == gridSideLen)

    for (let i = 1; i < midNdx - 1 && hasOrientaion; i++) {
        let temp1 = path[i] - path[i + 1]
        let temp2 = path[i] - path[lastNdx - i]
        hasOrientaion = (diff1 == temp1) && (diff2 == temp2)
    }


    return hasOrientaion
}

const findOrientaion = (validPath) => {

    // path has to be a list of 2 CONNECTED straight rows/cols, with total length greater than or eq to 4 nodes.

    let lastNdx = validPath.length - 1

    let diff1 = validPath[0] - validPath[1]
    let diff2 = validPath[0] - validPath[lastNdx]


    if (diff1 == -1 && abs(diff2) == gridSideLen) {
        return Orientation.LEFT_OPEN_PATH
    } if (diff1 == 1 && abs(diff2) == gridSideLen) {
        return Orientation.RIGHT_OPEN_PATH
    } if (diff1 == -(gridSideLen) && abs(diff2) == 1) {
        return Orientation.UP_OPEN_PATH
    } if (diff1 == gridSideLen && abs(diff2) == 1) {
        return Orientation.DOWN_OPEN_PATH
    } else {
        console.log(validPath)
        throw 'it seems the "validPath" consist of 2 DISCONNECTED straight lines!'
    }
}


const concatToWall = (pathWithOrientaion, notConnectableRange) => {
    switch (pathWithOrientaion.orientation) {
        case Orientation.LEFT_OPEN_PATH:
            return concatToLefttWall(pathWithOrientaion, notConnectableRange)

        case Orientation.RIGHT_OPEN_PATH:
            return concatToRightWall(pathWithOrientaion, notConnectableRange)

        case Orientation.UP_OPEN_PATH:
            return concatToUpWall(pathWithOrientaion, notConnectableRange)

        case Orientation.DOWN_OPEN_PATH:
            return concatToDownWall(pathWithOrientaion, notConnectableRange)

        default:
            return false;
    }
}


const concatToLefttWall = (pathWithOrientaion, notConnectableRange) => {

    let nodes = pathWithOrientaion.nodes

    let isSubgraphLeftestCol = (nodes[0] % gridSideLen == 0) // testing 1 of them is sufficient || (lastNode % gridSideLen == 0)
    if (isSubgraphLeftestCol) {
        return false
    }


    let maxNrOfOptions = 0
    let found = false
    let leftMostColNr = nodes[0] % gridSideLen
    for (let z = 0; z < (nodes.length / 2) && !found; z++) {
        if (nodes[z] % gridSideLen == leftMostColNr)
            maxNrOfOptions++
        else
            found = true
    }

    // 	21	13  14	22  30	38	37	29 ==> nr maxNrOfOptions is 2
    // option1: 13  14	22  30	38	37	29  21
    // option2: 29	21	13  14	22  30  38	37	

    //  13  5   6   14  22  30  29  21 ==> nr maxNrOfOptions is 2
    // option1: 13  5   6   14  22  30  29  21 (Only one valid option)


    let options = []
    for (let w = 0; w < maxNrOfOptions; w++) {
        // test 2 entryPoints at the time, since we're intrested in the nodes at the beginning and the end.
        {
            let i = w
            let isOddNodeX = floor(nodes[i] / gridSideLen) % 2 == 1
            let exitNodeIndex = (i - 1 + nodes.length) % nodes.length

            let validEntryPoint = isOddNodeX && (nodes[exitNodeIndex] % gridSideLen == leftMostColNr)

            if (validEntryPoint) {
                let temp = [...nodes.slice(i), ...nodes.slice(0, i)]
                options.push(temp)
            }
        }

        {
            let i = nodes.length - 1 - w
            let isOddNodeX = floor(nodes[i] / gridSideLen) % 2 == 1
            let exitNodeIndex = (i - 1 + nodes.length) % nodes.length

            let validEntryPoint = isOddNodeX && (nodes[exitNodeIndex] % gridSideLen == leftMostColNr)

            if (validEntryPoint) {
                let temp = [...nodes.slice(i), ...nodes.slice(0, i)]
                options.push(temp)
            }
        }

    }

    let res = options.some(path => {
        let fstNode = path[0]
        let lastNode = path[path.length - 1]

        // if the wall is connected to newHC
        let a = newHC.indexOf((fstNode - 1) % HC.length)
        let b = newHC.indexOf((lastNode - 1) % HC.length)
        let wallIsConnected = a != -1 && b != -1

        let areSameRows =
            (floor(newHC[a] / gridSideLen) == floor(fstNode / gridSideLen)) &&
            (floor(newHC[b] / gridSideLen) == floor(lastNode / gridSideLen))

        let isConnectable =
            (a < notConnectableRange.form_newHC_index && b < notConnectableRange.form_newHC_index) ||
            (a > notConnectableRange.to_newHC_index && b > notConnectableRange.to_newHC_index)

        if (!wallIsConnected || !areSameRows || !isConnectable) {
            return false
        }

        if ((newHC[a] !== fstNode - 1) || (newHC[b] !== lastNode - 1)) {
            console.log(`nodes is ${nodes}`)
            throw `Err the insertionNdx in newHC is ${b} between the nodes ${newHC[a]} and ${newHC[b]}`
        }

        newHC.splice(b, 0, ...path)
        updateNotConnectableRange(notConnectableRange, path.length)

        return true
    })

    return res
}

const concatToRightWall = (pathWithOrientaion, notConnectableRange) => {

    let nodes = pathWithOrientaion.nodes

    let isSubgraphRightmostCol = (nodes[0] % gridSideLen == (gridSideLen - 1)) // testing 1 of thems is sufficient || (lastNode % gridSideLen == gridSideLen - 1)
    if (isSubgraphRightmostCol) {
        return false
    }


    let maxNrOfOptions = 0
    let found = false
    let rightMostColNr = nodes[0] % gridSideLen
    for (let z = 0; z < (nodes.length / 2) && !found; z++) {
        if (nodes[z] % gridSideLen == rightMostColNr)
            maxNrOfOptions++
        else
            found = true
    }

    // 	30	38	37	29	21	13  14	22 ==> nr maxNrOfOptions is 2
    // option1: 38	37	29	21	13  14	22  30
    // option2: 22  30  38	37	29	21	13  14	

    //  22  30  29  21  13  5   6   14  ==> nr maxNrOfOptions is 2
    // option1: 22  30  29  21  13  5   6   14 (Only one valid option)

    let options = []
    for (let w = 0; w < maxNrOfOptions; w++) {
        // test 2 entryPoints at the time, since we're intrested in the nodes at the beginning and the end.
        {
            let i = w
            let isEvenNodeX = floor(nodes[i] / gridSideLen) % 2 == 0
            let exitNodeIndex = (i - 1 + nodes.length) % nodes.length

            let validEntryPoint = isEvenNodeX && (nodes[exitNodeIndex] % gridSideLen == rightMostColNr)

            if (validEntryPoint) {
                let temp = [...nodes.slice(i), ...nodes.slice(0, i)]
                options.push(temp)
            }
        }


        {
            let i = nodes.length - 1 - w
            let isEvenNodeX = floor(nodes[i] / gridSideLen) % 2 == 0
            let exitNodeIndex = (i - 1 + nodes.length) % nodes.length

            let validEntryPoint = isEvenNodeX && (nodes[exitNodeIndex] % gridSideLen == rightMostColNr)

            if (validEntryPoint) {
                let temp = [...nodes.slice(i), ...nodes.slice(0, i)]
                options.push(temp)
            }
        }

    }

    let res = options.some(path => {
        let fstNode = path[0]
        let lastNode = path[path.length - 1]


        // if the wall is connected to newHC
        let a = newHC.indexOf((fstNode + 1) % HC.length)
        let b = newHC.indexOf((lastNode + 1) % HC.length)

        let wallIsConnected = a != -1 && b != -1
        let areSameRows = (floor(newHC[a] / gridSideLen) == floor(fstNode / gridSideLen)) &&
            (floor(newHC[b] / gridSideLen) == floor(lastNode / gridSideLen))

        let isConnectable =
            (a < notConnectableRange.form_newHC_index && b < notConnectableRange.form_newHC_index) ||
            (a > notConnectableRange.to_newHC_index && b > notConnectableRange.to_newHC_index)

        if (!wallIsConnected || !areSameRows || !isConnectable) {
            return false
        }

        if ((newHC[a] !== fstNode + 1) || (newHC[b] !== lastNode + 1)) {
            console.log(`nodes is ${nodes}`)
            throw `Err the insertionNdx in newHC is ${b} between the nodes ${newHC[a]} and ${newHC[b]}`
        }

        newHC.splice(b, 0, ...path)
        updateNotConnectableRange(notConnectableRange, path.length)
        return true
    })

    return res
}

const concatToUpWall = (pathWithOrientaion, notConnectableRange) => {

    let nodes = pathWithOrientaion.nodes

    let isSubgraphUppermostRow = (floor(nodes[0] / gridSideLen) == 0) // testing 1 of them is sufficient || (floor(lastNode / gridSideLen) == 0)
    if (isSubgraphUppermostRow) {
        return false
    }

    let maxNrOfOptions = 0
    let found = false
    let upperMostRowNr = floor(nodes[0] / gridSideLen)
    for (let z = 0; z < (nodes.length / 2) && !found; z++) {
        if (floor(nodes[z] / gridSideLen) == upperMostRowNr)
            maxNrOfOptions++
        else
            found = true
    }

    //  11  12  20  19  18  17  9   10  ==> nr maxNrOfOptions is 2
    // option1: 12  20  19  18  17  9   10  11
    // option2: 10  11  12  20  19  18  17  9	

    //  12  13  21  20  19  18  10  11  ==> nr maxNrOfOptions is 2
    // option1: 22  30  29  21  13  5   6   14 (Only one valid option)

    let options = []
    for (let w = 0; w < maxNrOfOptions; w++) {
        // test 2 entryPoints at the time, since we're intrested in the nodes at the beginning and the end.
        {
            let i = w
            let isEvenNodeY = (nodes[i] % gridSideLen) % 2 == 0
            let exitNodeIndex = (i - 1 + nodes.length) % nodes.length

            let validEntryPoint = isEvenNodeY && (floor(nodes[exitNodeIndex] / gridSideLen) == upperMostRowNr)

            if (validEntryPoint) {
                let temp = [...nodes.slice(i), ...nodes.slice(0, i)]
                options.push(temp)
            }
        }

        {
            let i = nodes.length - 1 - w
            let isEvenNodeY = (nodes[i] % gridSideLen) % 2 == 0
            let exitNodeIndex = (i - 1 + nodes.length) % nodes.length

            let validEntryPoint = isEvenNodeY && (floor(nodes[exitNodeIndex] / gridSideLen) == upperMostRowNr)

            if (validEntryPoint) {
                let temp = [...nodes.slice(i), ...nodes.slice(0, i)]
                options.push(temp)
            }
        }
    }


    let res = options.some(path => {
        let fstNode = path[0]
        let lastNode = path[path.length - 1]


        // if the wall is connected to newHC
        let a = newHC.indexOf(fstNode - gridSideLen)
        let b = newHC.indexOf(lastNode - gridSideLen)

        let wallIsConnected = a != -1 && b != -1
        let areSameCols = (newHC[a] % gridSideLen == fstNode % gridSideLen) &&
            (newHC[b] % gridSideLen == lastNode % gridSideLen)

        let isConnectable =
            (a < notConnectableRange.form_newHC_index && b < notConnectableRange.form_newHC_index) ||
            (a > notConnectableRange.to_newHC_index && b > notConnectableRange.to_newHC_index)

        if (!wallIsConnected || !areSameCols || !isConnectable) {
            return false
        }

        if ((newHC[a] !== fstNode - gridSideLen) || (newHC[b] !== (lastNode - gridSideLen))) {
            console.log(`nodes is ${path}`)
            throw `Err the insertionNdx in newHC is ${b} between the nodes ${newHC[a]} and ${newHC[b]}`
        }

        newHC.splice(b, 0, ...path)
        updateNotConnectableRange(notConnectableRange, path.length)
        return true
    })

    return res
}

const concatToDownWall = (pathWithOrientaion, notConnectableRange) => {

    let nodes = pathWithOrientaion.nodes



    let isSubgraphLowestRow = (floor(nodes[0] / gridSideLen) == (gridSideLen - 1)) // testing 1 of them is sufficient || (floor(lastNode / gridSideLen) == (gridSideLen - 1))
    if (isSubgraphLowestRow) {
        return false
    }

    let maxNrOfOptions = 0
    let found = false
    let lowestRowNr = floor(nodes[0] / gridSideLen)
    for (let z = 0; z < (nodes.length / 2) && !found; z++) {
        if (floor(nodes[z] / gridSideLen) == lowestRowNr)
            maxNrOfOptions++
        else
            found = true
    }


    //  18  17  9   10  11  12  20  19  ==> nr maxNrOfOptions is 2
    // option1: 17  9   10  11  12  20  19  18
    // option2: 19  18  17  9   10  11  12  20

    //  19  18  10  11  12  13  21  20  ==> nr maxNrOfOptions is 2
    // option1: 19  18  10  11  12  13  21  20 (Only one valid option)


    let options = []
    for (let w = 0; w < maxNrOfOptions; w++) {
        // test 2 entryPoints at the time, since we're intrested in the nodes at the beginning and the end.
        {
            let i = w
            let isOddNodeY = (nodes[i] % gridSideLen) % 2 == 1
            let exitNodeIndex = (i - 1 + nodes.length) % nodes.length

            let validEntryPoint = isOddNodeY && (floor(nodes[exitNodeIndex] / gridSideLen) == lowestRowNr)

            if (validEntryPoint) {
                let temp = [...nodes.slice(i), ...nodes.slice(0, i)]
                options.push(temp)
            }
        }
        {
            let i = nodes.length - 1 - w
            let isOddNodeY = (nodes[i] % gridSideLen) % 2 == 1
            let exitNodeIndex = (i - 1 + nodes.length) % nodes.length

            let validEntryPoint = isOddNodeY && (floor(nodes[exitNodeIndex] / gridSideLen) == lowestRowNr)

            if (validEntryPoint) {
                let temp = [...nodes.slice(i), ...nodes.slice(0, i)]
                options.push(temp)
            }
        }
    }



    let res = options.some(path => {

        let fstNode = path[0]
        let lastNode = path[path.length - 1]

        // if the wall is connected to newHC
        let a = newHC.indexOf(fstNode + gridSideLen)
        let b = newHC.indexOf(lastNode + gridSideLen)

        let wallIsConnected = a != -1 && b != -1
        let areSameCols = (newHC[a] % gridSideLen == fstNode % gridSideLen) &&
            (newHC[b] % gridSideLen == lastNode % gridSideLen)

        let isConnectable =
            (a < notConnectableRange.form_newHC_index && b < notConnectableRange.form_newHC_index) ||
            (a > notConnectableRange.to_newHC_index && b > notConnectableRange.to_newHC_index)

        if (!wallIsConnected || !areSameCols || !isConnectable) {
            return false
        }


        if ((newHC[a] !== fstNode + gridSideLen) || (newHC[b] !== (lastNode + gridSideLen))) {
            console.log(`nodes is ${nodes}`)
            throw `Err the insertionNdx in newHC is ${b} between the nodes ${newHC[a]} and ${newHC[b]}`
        }

        newHC.splice(b, 0, ...path)
        updateNotConnectableRange(notConnectableRange, path.length)
        return true
    })

    return res

}



var HamCycleStatus

var newHC

var HC

var target

var target

var currentHamCyclNodeIndex


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
    excuteMove,
    changeHamCycle,
    requestHamCycleChange,
    HC,
    currentHamCyclNodeIndex,
}