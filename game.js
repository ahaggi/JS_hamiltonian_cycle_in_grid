import { outsideGrid,  gridSideLen } from './game-components/grid.js'
import { gameBoard, clear as clearBoard } from './game-components/player/gameBoard.js'
import { init as initSnake, update as updateSnake, draw as drawSnake,  getSnakeHead, snakeIntersection, getSnakeLen } from './game-components/snake.js'
import { init as initFood, update as updateFood, draw as drawFood } from './game-components/food.js'
import { snakeSpeed } from './game-components/speedSlider.js'


let lastRenderTime = 0
let gameOver
let gameWon


const init = () => {
  gameOver = false
  gameWon = false

  initSnake()
  initFood()
  clearBoard()
}

const main = (currentTime) => {
  if (gameOver) {
    if (confirm('You lost. Press ok to restart.')) {
      // window.location = '/'
      init()
    } else {
      return
    }
  } else if (gameWon) {
    if (confirm('Congratulations!. Press ok to restart.')) {
      // window.location = '/'
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
  drawSnake(gameBoard)
  drawFood(gameBoard)
}

const checkGameStatus = () => {
  gameOver = outsideGrid(getSnakeHead()) || snakeIntersection()
  gameWon = getSnakeLen() >= (gridSideLen * gridSideLen) - 1
  // console.log(`  ${getSnakeLen()}    ${gameWon}`)
}


// ---------------------------------slider---------------------------------
init()


// Why is requestAnimationFrame better than setInterval or setTimeout?
// https://stackoverflow.com/a/38709924
// https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
window.requestAnimationFrame(main)
