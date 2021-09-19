import { outsideGrid, totalNrOfCells } from './game-components/grid.js'
import { gameBoard, clear as clearBoard } from './game-components/autoplay/gameBoard.js'
import { init as initSnake, update as updateSnake, draw as drawSnake, getSnakeHead, snakeIntersection, getSnakeLen } from './game-components/snake.js'
import { init as initFood, update as updateFood, draw as drawFood, getFoodPosition } from './game-components/food.js'
import { snakeSpeed } from './game-components/speedSlider.js'


import { init as initAutoplay, excuteMove, HC } from "./game-components/autoplay/autoPlay.js"
import { visualizeHC } from './game-components/autoplay/hamCycleGridVisualization.js'
import { createNewMoveLog, updateCurrGameLog, updateCurrMoveLog, createNewGameLog, saveLog } from "./game-components/autoplay/autoplaytest/log"
import { forLogOnly_inputDirection } from './game-components/autoplay/input.js'


let lastRenderTime = 0
let gameOver
let gameWon
// Only for logging purpose
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

const updatelog = () => {
  if (gameOver) {
    updateCurrGameLog({ res: false })
    saveLog()

  } else if (gameWon) {
    updateCurrGameLog({ res: true })
    saveLog()
  }
}

//#########################################


const init = () => {
  gameOver = false
  gameWon = false

  initSnake()
  initFood()
  clearBoard()

  initAutoplay()

  // ######## Just for log purposing ########
  logNewGame()
  // ########################################

}

const main = (currentTime) => {
  if (gameOver) {
    if (confirm('You lost. Press ok to restart.')) {
      // window.location = '/'
      // ######## Just for log purposing ########
      updatelog()
      // ########################################
      init()
    } else {
      return
    }
  } else if (gameWon) {
    if (confirm('Congratulations!. Press ok to restart.')) {
      // window.location = '/'
      // ######## Just for log purposing ########
      updatelog()
      // ########################################
      init()
    } else {
      return
    }
  }

  // Why is requestAnimationFrame better than setInterval or setTimeout?
  // https://stackoverflow.com/a/38709924
  window.requestAnimationFrame(main)
  const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000
  if (secondsSinceLastRender < (1 / snakeSpeed)) return

  lastRenderTime = currentTime


  excuteMove()

  // ######## Just for log purposing ########
  logNewMove()
  // ########################################


  update()
  if (!gameOver) {
    draw()
  }
}

const update = () => {
  updateSnake()
  updateFood()
  checkGameStatus()
}

const draw = () => {
  clearBoard()
  visualizeHC()
  drawSnake(gameBoard)
  drawFood(gameBoard)
}

const checkGameStatus = () => {
  gameOver = outsideGrid(getSnakeHead()) || snakeIntersection()
  gameWon = getSnakeLen() >= (totalNrOfCells) 
  // console.log(`  ${getSnakeLen()}    ${gameWon}`)
}


init()


// Why is requestAnimationFrame better than setInterval or setTimeout?
// https://stackoverflow.com/a/38709924
// https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
window.requestAnimationFrame(main)





