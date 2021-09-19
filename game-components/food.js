
import { randomGridPosition, gridSideLen } from './grid.js'
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

  let minSnakeLen = 1
  let maxSnakeLen = gridSideLen * gridSideLen
  let minExpansionRate = 1
  let maxExpansionRate = 5
  let currentSnakeLen = getSnakeLen()
  return Math.floor((((currentSnakeLen - minSnakeLen) / (minSnakeLen - maxSnakeLen) * (minExpansionRate - maxExpansionRate)) * -1) + maxExpansionRate)
}



export {
  init,
  update,
  draw,
  getFoodPosition
}
