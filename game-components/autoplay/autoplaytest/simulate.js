
import { setInputDirection } from '../input.js'
import { gameBoard, clear as clearBoard } from '../gameBoard.js'
import { init as initSnake, update as updateSnake, draw as drawSnake, } from '../../snake.js'
import { init as initFood, update as updateFood, draw as drawFood, setFoodPosition } from '../../food.js'
import { visualizeHC } from '../hamCycleGridVisualization.js'
import * as data from './log.json'
import { snakeSpeed } from '../../speedSlider.js'

 


var i
let lastRenderTime = 0


const init = () => {
    i = 0
    initSnake()
    initFood()
    clearBoard()
}


const main = (currentTime) => {
      // Why is requestAnimationFrame better than setInterval or setTimeout?
  // https://stackoverflow.com/a/38709924
  window.requestAnimationFrame(main)
  const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000
  if (secondsSinceLastRender < (1 / snakeSpeed)) return

  lastRenderTime = currentTime

    var HC = null
    let moves = data.moves

    if (i < data.moves.length) {

        let HCid = moves[i].HcId
        HC = data.HCs[HCid]

        if (i==225) {
            let t = 0
        }
        // console.log(moves[i])

        // given the snakeHead init pos is fixed [0,0]
        // set food position
        setFoodPosition(moves[i].foodPos)

        setInputDirection(moves[i].moveDirection)

        updateSnake()
        updateFood()
        clearBoard()

        visualizeHC(HC)
        drawSnake(gameBoard)
        drawFood(gameBoard)


        window.requestAnimationFrame(main)

        i++
    }

}

init()
window.requestAnimationFrame(main)
