

var gridSideLen = 20  // If the game is in autoplay mode, then this number has to be an even number 
var totalNrOfCells =  gridSideLen * gridSideLen

const randomGridPosition = () => {
  return {
    x: Math.floor(Math.random() * gridSideLen),
    y: Math.floor(Math.random() * gridSideLen)
  }
}

const outsideGrid = (position) => {
  return (
    position.x < 0 || position.x >= gridSideLen ||
    position.y < 0 || position.y >= gridSideLen
  )
}

const setGridSideLen = (nr)=>{
  gridSideLen = nr
  totalNrOfCells =  gridSideLen * gridSideLen
}

export {
  gridSideLen ,
  totalNrOfCells,
  randomGridPosition,
  outsideGrid,
  setGridSideLen
}