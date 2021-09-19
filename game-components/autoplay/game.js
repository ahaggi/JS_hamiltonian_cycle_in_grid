import { snakeSpeed } from '../speedSlider.js'
import { outsideGrid } from '../grid.js'
import { createNew as createNewAutoGameBoard , clear as autoClearBoard } from '../gameBoards.js'

import Snake from '../snake.js'
import { AutoInput } from './input.js'

import { visualizeHC } from './hamCycleGridVisualization.js'
import { init as initAutoplay, excuteMove, HamCycleChangeNecessity } from "./autoPlay.js"


let lastRenderTime = 0

let gameOver
let gameWon

let autoGameBoard

let autoSnake
let autoInput

let speedRatio = 1

const reset = (difficultyLevel ) => {
    gameOver = false
    gameWon = false

    // Creating a new gameBoard is only necessary in case of there is a change in the grid's dimenssion, 
    // i.e.  gridSideLen is changed. Otherwise clearing the gameBoard is totally sufficient.
    autoGameBoard= createNewAutoGameBoard('game-board-auto')

    autoInput = new AutoInput()
    autoSnake = new Snake(autoInput)

    let hcChangeNec

    if (difficultyLevel == Difficulty.EASY) {
        // (the playerSnake's speed is 3x faster than the autoSnake speed) + (hcChangeNecessity is IF_NECESSARY)
        hcChangeNec = HamCycleChangeNecessity.IF_NECESSARY
        speedRatio = 2
    } else if (difficultyLevel == Difficulty.MEDIUM) {
        // (the playerSnake's speed is 1,5x faster than the autoSnake speed) + (hcChangeNecessity is ALWAYS)
        hcChangeNec = HamCycleChangeNecessity.ALWAYS
        speedRatio = 1.5
    } else { // if difficultyLevel == Difficulty.HARD
        // (the playerSnake's speed is 1x faster than the autoSnake speed) + (hcChangeNecessity is ALWAYS)
        hcChangeNec = HamCycleChangeNecessity.ALWAYS
        speedRatio = 0.75
    }

    hcChangeNec = difficultyLevel == Difficulty.EASY ? HamCycleChangeNecessity.IF_NECESSARY : HamCycleChangeNecessity.ALWAYS

    initAutoplay(autoSnake, hcChangeNec)
}

const update = () => {
    autoSnake.update()
}

const draw = () => {
    autoClearBoard(autoGameBoard)
    visualizeHC()
    autoSnake.draw(autoGameBoard)
}

const main = (currentTime) => {
    if (gameOver)
        return
    else if (gameWon)
        return

    const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000
    if (secondsSinceLastRender > (speedRatio / snakeSpeed)) {
        lastRenderTime = currentTime
        excuteMove(autoInput)
        update()
    }


    checkGameOverStatus()
    if (!gameOver)
        draw()
}


const checkGameOverStatus = () => {
    // gameOver's value depends on updating the snakeHead's pos
    gameOver = outsideGrid(autoSnake.getSnakeHead()) || autoSnake.snakeIntersection()
}

const getGameOverStatus = () => {
    // gameOver's value depends on updating the snakeHead's pos
    return gameOver
}

export {
    autoSnake,
    autoGameBoard,
    main as autoMain,
    getGameOverStatus as getAutoGameOverStatus,
    reset as autoGameReset,
    Difficulty
}



const Difficulty = {
    EASY: "EASY",      // (the playerSnake's speed is 3 faster than the autoSnake speed) + (hcChangeNecessity is IF_NECESSARY)
    MEDIUM: "MEDIUM",  // (the playerSnake's speed is 2 faster than the autoSnake speed) + (hcChangeNecessity is ALWAYS)
    HARD: "HARD",      // (the playerSnake's speed is 1 faster than the autoSnake speed) + (hcChangeNecessity is ALWAYS)
}

