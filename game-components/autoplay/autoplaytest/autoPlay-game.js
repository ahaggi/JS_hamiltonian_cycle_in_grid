import { outsideGrid, totalNrOfCells } from '../../grid.js'


import { init as initSnake, update as updateSnake, getSnakeHead, snakeIntersection, getSnakeLen } from '../../snake.js'
import { init as initFood, update as updateFood, getFoodPosition } from '../../food.js'
import { init as initAutoplay, excuteMove, HC } from "../autoPlay.js"

import { createNewGameLog, saveLog, updateCurrGameLog, createNewMoveLog, updateCurrMoveLog } from './log.js'
import { forLogOnly_inputDirection } from '../input.js'




let gameOver
let gameWon
let logHC

// ######## Just for log purposing ########

const logNewMove = () => {
    if (
        logHC.some((v, i) => v != HC[i])
    ) {
        logHC = HC
        updateCurrGameLog({
            addNewHC: HC
        })
    }

    createNewMoveLog()
    updateCurrMoveLog({
        moveDirection: forLogOnly_inputDirection(),
        foodPos: getFoodPosition()
    })
}
const logNewGame = () => {
    logHC = HC
    createNewGameLog()
    updateCurrGameLog({ addNewHC: HC })
}
//#########################################



const init = () => {
    gameOver = false
    gameWon = false

    initSnake()
    initFood()

    initAutoplay()

    logNewGame()
}

const main = () => {

    console.log("started")

    for (let index = 0; index < 2000; index++) {

        console.log("running..")

        init()
        gameOver = false
        gameWon = false

        while (!gameOver && !gameWon) {

            excuteMove()


            // ######## Just for log purposing ########
            logNewMove()
            //#########################################

            update()
            if (gameOver) {
                updateCurrGameLog({ res: false })
            } else if (gameWon) {
                updateCurrGameLog({ res: true })
            }
        }


    }

    saveLog()
    console.log("finished")
}



const update = () => {
    updateSnake()
    updateFood()
    checkGameStatus()
}



const checkGameStatus = () => {
    gameOver = outsideGrid(getSnakeHead()) || snakeIntersection()
    gameWon = getSnakeLen() >= (totalNrOfCells) - 1
}

main()


