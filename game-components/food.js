
import { randomGridPosition, gridSideLen } from './grid.js'





var food
var isEaten

const init = (playerSnake, autoSnake) => {
  food = getRandomFoodPosition(playerSnake, autoSnake)
  playerSnake.updateNewFoodPosition(food)
  autoSnake.updateNewFoodPosition(food)
  isEaten = false
}


const update = (playerSnake, autoSnake) => {
  if (isEaten) {
    food = getRandomFoodPosition(playerSnake, autoSnake)
    isEaten = false
    playerSnake.updateNewFoodPosition(food)
    autoSnake.updateNewFoodPosition(food)
  }
}

const requireNewFood = () => {
  isEaten = true
}

const draw = (playerGameBoard, autoGameBoard) => {
  let elmIndx = (food.x * gridSideLen) + food.y
  const playerFoodElement = playerGameBoard.children[elmIndx]
  // clear all other classes, i.e "path-vl-line"
  playerFoodElement.className = "cell"
  playerFoodElement.classList.add('food')

  const autoFoodElement = autoGameBoard.children[elmIndx]
  // clear all other classes, i.e "path-vl-line"
  autoFoodElement.className = "cell"
  autoFoodElement.classList.add('food')
}

const getRandomFoodPosition = (playerSnake, autoSnake) => {
  let newFoodPosition
  while (newFoodPosition == null || playerSnake.onSnake(newFoodPosition) || autoSnake.onSnake(newFoodPosition)) {
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
