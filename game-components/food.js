
import { requestHamCycleChange } from './autoplay/autoPlay.js'
import { randomGridPosition, gridSideLen } from './grid.js'
import { onSnake, updateNewFoodPosition } from './snake.js'


var food
var isEaten
const init = () => {
  // food = { x: 1, y: 3}

  food = getRandomFoodPosition()

  updateNewFoodPosition(food)
  isEaten = false
}


const update = () => {

  if (isEaten) {
    food = getRandomFoodPosition()
    isEaten = false
    updateNewFoodPosition(food)
  }
}

const requireNewFood = () => {
  isEaten = true
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


// For testing/ simulating
const setFoodPosition = (f) => {
  food = f
}



// const getExpansionRate = () => {
//   /*
//     Y = ((X - A) / (A - B) * (C - D)) * -1 + D

//     A: min snake length
//     B: max snake length

//     C: min EXPANSION_RATE
//     D: max EXPANSION_RATE

//     X: currnet snake length
//   */

//   // let minSnakeLen = 1
//   // let maxSnakeLen = totalNrOfCells
//   // let minExpansionRate = 1
//   // let maxExpansionRate = 5
//   // let currentSnakeLen = getSnakeLen()
//   // return Math.floor((((currentSnakeLen - minSnakeLen) / (minSnakeLen - maxSnakeLen) * (minExpansionRate - maxExpansionRate)) * -1) + maxExpansionRate)
//   return 1
// }

export {
  init,
  update,
  requireNewFood,
  draw,
  getFoodPosition,
  setFoodPosition
}
