import PlayerInput from './player/input.js'

import { gridSideLen } from './grid.js'



const snakeBody = []
let newSegments = 0

var inputController
var inputDirection

const init = () => {
  let headInitPos = { x: (gridSideLen / 2), y: (gridSideLen / 2) }

  // empty the snakeBody
  snakeBody.length = 0
  // Head init pos
  snakeBody.push(headInitPos)
  // console.log(` head Init Pos x: ${headInitPos.x} , y: ${headInitPos.y}`)
  newSegments = 0
  inputController = new PlayerInput()
  // reset InputDirection for a new game
  inputController.ResetInputDirection()
}

const update = () => {
  addSegments()

  inputDirection = inputController.getInputDirection()
  for (let i = snakeBody.length - 2; i >= 0; i--) {
    snakeBody[i + 1] = { ...snakeBody[i] }
  }

  snakeBody[0].x += inputDirection.deltaX
  snakeBody[0].y += inputDirection.deltaY
}

const draw = (gameBoard) => {
  if (snakeBody[0].x >= 0 && snakeBody[0].y >= 0) {
    snakeBody.forEach((segment, ind) => {
      let elmIndx = (segment.x * gridSideLen) + segment.y
      const snakeElement = gameBoard.children[elmIndx]
      snakeElement.className = "cell"

      if (ind == 0) {
        if (inputDirection.deltaX == -1) {
          snakeElement.classList.add('snake-head', 'snake-head-up')

        } else if (inputDirection.deltaX == 1) {
          snakeElement.classList.add('snake-head', 'snake-head-down')

        } else if (inputDirection.deltaY == -1) {
          snakeElement.classList.add('snake-head', 'snake-head-left')

        } else if (inputDirection.deltaY == 1) {
          snakeElement.classList.add('snake-head', 'snake-head-right')
        } else {
          // snakeHead fallback style
          snakeElement.classList.add('snake-body')
        }
      } else {
        if (ind % gridSideLen == 0) {
          snakeElement.classList.add('snake-body-dotted')
        } else {
          snakeElement.classList.add('snake-body')
        }
      }

    })
  } else {
    throw `snake.js draw function the snake head has an invalid row or column value. row: ${snakeBody[0].x}, col: ${snakeBody[0].y}`
  }
}

const expandSnake = (amount) => {
  newSegments += amount
}

const onSnake = (position) => {
  return snakeBody.some((segment) => equalPositions(segment, position))
}

const getSnakeHead = () => {
  return snakeBody[0]
}

const snakeIntersection = () => {
  let [head, ...rest] = snakeBody
  return rest.some((segment) => equalPositions(segment, head))
}

const getSnakeLen = () => {
  return snakeBody.length
}

const equalPositions = (pos1, pos2) => {
  return pos1.x === pos2.x && pos1.y === pos2.y
}

const addSegments = () => {
  for (let i = 0; i < newSegments; i++) {
    snakeBody.push({ ...snakeBody[snakeBody.length - 1] })
  }

  newSegments = 0
}

export {
  init,
  update,
  draw,
  expandSnake,
  onSnake,
  getSnakeHead,
  snakeIntersection,
  getSnakeLen
}