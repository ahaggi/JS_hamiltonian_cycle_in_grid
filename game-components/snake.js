
import { requestHamCycleChange } from './autoplay/autoPlay.js'
import { requireNewFood } from './food.js'
import { gridSideLen } from './grid.js'



export default class Snake {

  snakeBody = []
  inputDirection
  inputController

  food

  constructor(ic) {
    let headInitPos = { x: (gridSideLen / 2), y: (gridSideLen / 2) }

    // empty the snakeBody
    this.snakeBody.length = 0

    // Head init pos
    this.snakeBody.push(headInitPos)


    this.inputController = ic
    // reset InputDirection for a new game
    this.inputController.ResetInputDirection()
    this.inputDirection = this.inputController.getInputDirection()

  }



  update() {

    this.inputDirection = this.inputController.getInputDirection()
    for (let i = this.getSnakeLen() - 2; i >= 0; i--) {
      this.snakeBody[i + 1] = { ...this.snakeBody[i] }
    }

    this.snakeBody[0].x += this.inputDirection.deltaX
    this.snakeBody[0].y += this.inputDirection.deltaY

    if (this.equalPositions(this.snakeBody[0], this.food)) {
      this.expandSnake(1)
      requireNewFood()

    }
  }

  draw(gameBoard) {
    if (this.snakeBody[0].x >= 0 && this.snakeBody[0].y >= 0) {
      this.snakeBody.forEach((segment, ind) => {
        let elmIndx = (segment.x * gridSideLen) + segment.y
        const snakeElement = gameBoard.children[elmIndx]
        snakeElement.className = "cell"

        if (ind == 0) {
          if (this.inputDirection.deltaX == -1) {
            snakeElement.classList.add('snake-head', 'snake-head-up')

          } else if (this.inputDirection.deltaX == 1) {
            snakeElement.classList.add('snake-head', 'snake-head-down')

          } else if (this.inputDirection.deltaY == -1) {
            snakeElement.classList.add('snake-head', 'snake-head-left')

          } else if (this.inputDirection.deltaY == 1) {
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
      throw `snake.js draw function the snake head has an invalid row or column value. row: ${this.snakeBody[0].x}, col: ${this.snakeBody[0].y}`
    }
  }

  expandSnake(newSegments) {
    for (let i = 0; i < newSegments; i++) {
      this.snakeBody.push({ ...this.snakeBody[this.snakeBody.length - 1] })
    }
  }

  onSnake(position) {
    return this.snakeBody.some((segment) => this.equalPositions(segment, position))
  }

  getSnakeHead() {
    return this.snakeBody[0]
  }

  snakeIntersection() {
    let [head, _, __, ...rest] = this.snakeBody
    return rest.some((segment) => this.equalPositions(segment, head))
  }

  getSnakeLen() {
    return this.snakeBody.length
  }

  equalPositions(pos1, pos2) {
    return pos1.x === pos2.x && pos1.y === pos2.y
  }

  updateNewFoodPosition(f){
    this.food = f
    // Inorder to try to recompute the new Ham. cycle
    requestHamCycleChange()
  }


}