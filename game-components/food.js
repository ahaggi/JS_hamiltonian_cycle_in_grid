
import { requestHamCycleChange } from './autoplay/autoPlay.js'
import { randomGridPosition, gridSideLen, totalNrOfCells } from './grid.js'
import { onSnake, expandSnake, getSnakeLen } from './snake.js'


var food

const init = () => {
  food = getRandomFoodPosition()
}


const update = () => {
  let isEaten = onSnake(food)
  if (isEaten) {
    let expansionRate = getExpansionRate()
    // console.log(expansionRate)
    expandSnake(expansionRate)
    food = getRandomFoodPosition()
      // Inorder to try to recompute the new Ham. cycle
  requestHamCycleChange()

  }
}

const draw = (gameBoard) => {
  let elmIndx = (food.x * gridSideLen) + food.y
  const foodElement = gameBoard.children[elmIndx]
  foodElement.classList.add('food')
}

const getRandomFoodPosition = () => {
  let newFoodPosition
  while (newFoodPosition == null || onSnake(newFoodPosition)) {
    newFoodPosition = randomGridPosition()
  }

  return newFoodPosition
}

const getFoodPosition = () => {
  return food
}

const getExpansionRate = () => {
  /*
    Y = ((X - A) / (A - B) * (C - D)) * -1 + D

    A: min snake length
    B: max snake length

    C: min EXPANSION_RATE
    D: max EXPANSION_RATE

    X: currnet snake length
  */

  // let minSnakeLen = 1
  // let maxSnakeLen = totalNrOfCells
  // let minExpansionRate = 1
  // let maxExpansionRate = 5
  // let currentSnakeLen = getSnakeLen()
  // return Math.floor((((currentSnakeLen - minSnakeLen) / (minSnakeLen - maxSnakeLen) * (minExpansionRate - maxExpansionRate)) * -1) + maxExpansionRate)
  return 1
}

// For testing/ simulating
const setFoodPosition = (f) => {
  food = f
}



export {
  init,
  update,
  draw,
  getFoodPosition,
  setFoodPosition
}
