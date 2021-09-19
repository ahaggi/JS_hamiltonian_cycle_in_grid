
import { gridSideLen, totalNrOfCells } from '../grid.js'

const gameBoard = document.getElementById('game-board')
gameBoard.style.gridTemplateRows = `repeat(${gridSideLen}, 1fr)`
gameBoard.style.gridTemplateColumns = `repeat(${gridSideLen}, 1fr)`


// create the gameBoard's cells
for (let i = 0; i < totalNrOfCells; i++) {
  const cellElement = document.createElement('div')
  cellElement.classList.add('cell')
  gameBoard.appendChild(cellElement)
}

const clear = ()=>{
  for (let i = 0; i < totalNrOfCells; i++) {
    // clear the board from snake and food
    // gameBoard.children[i].classList.remove('snake', 'food')
    gameBoard.children[i].className = "cell"
  }
}

export {
  gameBoard,
  gridSideLen,
  totalNrOfCells,
  clear,
}