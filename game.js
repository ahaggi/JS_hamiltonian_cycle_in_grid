

import { init as initFood, update as updateFood, draw as drawFood } from './game-components/food.js'
import { snakeSpeed } from './game-components/speedSlider.js'
import { setGridSideLen, totalNrOfCells } from './game-components/grid.js'

import { playerGameBoard, playerSnake, playerMain, playerGameReset, getPlayerGameOverStatus } from './game-components/player/game.js'

import { autoGameBoard, autoSnake, autoMain, autoGameReset, getAutoGameOverStatus, Difficulty } from './game-components/autoplay/game.js'



const reset = () => {


  gameOverAuto = false
  gameWonAuto = false

  gameOverPlayer = false
  gameWonPlayer = false

  playerGameReset()
  autoGameReset(difficultyLevel)

  initFood(playerSnake, autoSnake)
}

const main = (currentTime) => {
  // Why is requestAnimationFrame better than setInterval or setTimeout?
  // https://stackoverflow.com/a/38709924
  animationReq = requestAnimationFrame(main)

  const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000
  if (secondsSinceLastRender < (1 / snakeSpeed)) return

  lastRenderTime = currentTime

  playerMain(currentTime)
  autoMain(currentTime)
  update()
  checkGameStatus()

  if (gameWonPlayer || gameOverPlayer || gameOverAuto || gameWonAuto)
    stopGame()
  else
    draw()
}

const update = () => {
  updateFood(playerSnake, autoSnake)
}

const draw = () => {
  drawFood(playerGameBoard, autoGameBoard)
}

const checkGameStatus = () => {
  // gameOver's value depends on updating the snakeHead's pos
  // gameWon's  value depends on the updating of the food which in turn can update the snake's length

  gameOverPlayer = getPlayerGameOverStatus()
  gameWonPlayer = playerSnake.getSnakeLen() >= (totalNrOfCells) 

  gameOverAuto = getAutoGameOverStatus()
  gameWonAuto = autoSnake.getSnakeLen() >= (totalNrOfCells) 
}

/******************************************************* EventListener ****************************************************** */
var overlay = document.getElementById("overlay")
var selectDifficulty = document.getElementById("selectDifficulty")
var selectSize = document.getElementById("selectSize")

selectDifficulty.addEventListener('change', (e) => {
  difficultyLevel = e.target.value
  reset()
  stopGame()
  selectDifficulty.blur()
})
selectSize.addEventListener('change', (e) => {
  let nr = +(e.target.value)
  setGridSideLen(nr)
  reset()
  stopGame()
  selectSize.blur()
})

window.addEventListener('keydown', e => {
  if (e.key === ' ') {
    if (gameRunning) {
      stopGame()
    } else {
      startGame()
    }
  }
})

const stopGame = () => {
  let overlayMsgElem  =document.getElementById("overlay-msg")
  let msg =''
  let cssClass = ''
  if (gameOverPlayer || gameWonAuto) {
    msg = 'You lost. Press space to restart.'
    cssClass = 'overlay-msg-gameover'

  } else if (gameWonPlayer || gameOverAuto) {
    msg = gameWonPlayer ? `Congratulations!\nYou won!.\nPress space to restart.` : `Congratulations!\nThe other snake lost!\n. Press space to restart. `
    cssClass = 'overlay-msg-won'
  } else {
    msg = `Press space to restart the game. `
    cssClass = 'overlay-msg'
  }
  overlayMsgElem.innerHTML = msg
  overlayMsgElem.className = cssClass

  overlay.style.display = 'flex'
  gameRunning = false
  // https://developer.mozilla.org/en-US/docs/Web/API/Window/cancelAnimationFrame
  cancelAnimationFrame(animationReq);
}

const startGame = () => {
  if (gameWonPlayer || gameOverPlayer || gameOverAuto || gameWonAuto) {
    reset()
  }
  overlay.style.display = 'none'
  gameRunning = true

  // Why is requestAnimationFrame better than setInterval or setTimeout?
  // https://stackoverflow.com/a/38709924
  // https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame

  animationReq = requestAnimationFrame(main)
}



/************************************************************************************************************************ */

const requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

const cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;


var difficultyLevel = Difficulty.MEDIUM
setGridSideLen(20)

var gameRunning = false
var animationReq;

var lastRenderTime = 0

var gameOverAuto
var gameWonAuto

var gameOverPlayer
var gameWonPlayer

reset()

