

import { snakeSpeed } from '../speedSlider.js'
import { outsideGrid } from '../grid.js'
import { createNew as createNewPlayerGameBoard, clear as playerClearBoard } from '../gameBoards.js'

import Snake from '../snake.js'
import PlayerInput from '../player/input.js'


let lastRenderTime = 0

let gameOver
let gameWon

let playerGameBoard

let playerSnake
let playerInput

var score = document.getElementById("score")

const reset = () => {
  gameOver = false
  gameWon = false

  // Creating a new gameBoard is only necessary in case of there is a change in the grid's dimenssion, 
  // i.e.  gridSideLen is changed. Otherwise clearing the gameBoard is totally sufficient.
  playerGameBoard = createNewPlayerGameBoard('game-board-player')

  playerInput = new PlayerInput()
  playerSnake = new Snake(playerInput)
}


const update = () => {
  playerSnake.update()
}

const draw = () => {
  score.innerHTML = `Your score is ${playerSnake.getSnakeLen()-1}`
  playerClearBoard(playerGameBoard)
  playerSnake.draw(playerGameBoard)
}


const main = (currentTime) => {
  if (gameOver)
    return
  else if (gameWon)
    return

  const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000
  if (secondsSinceLastRender > (1 / snakeSpeed)) {
    lastRenderTime = currentTime
    update()
  }

  checkGameOverStatus()
  if (!gameOver)
    draw()
}

const checkGameOverStatus = () => {
  // gameOver's value depends on updating the snakeHead's pos
  gameOver = outsideGrid(playerSnake.getSnakeHead()) || playerSnake.snakeIntersection()
}

const getGameOverStatus = () => {
  // gameOver's value depends on updating the snakeHead's pos
  return gameOver
}

export {
  playerSnake,
  playerGameBoard,
  main as playerMain,
  getGameOverStatus as getPlayerGameOverStatus,
  reset as playerGameReset
}
