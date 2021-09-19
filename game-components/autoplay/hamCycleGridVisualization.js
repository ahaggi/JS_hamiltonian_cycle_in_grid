// This file only task is to visualize the currnet hamiltonian cycle.

import { gridSideLen } from '../grid.js'
import { HC } from './autoPlay.js'
import { gameBoard, totalNrOfCells } from './gameBoard.js'




const cssClassHZline = "path-hz-line"
const cssClassVLline = "path-vl-line"
const cssClassleftUpline = "path-left-up-line"
const cssClassleftDownline = "path-left-down-line"
const cssClassrightUpline = "path-right-up-line"
const cssClassrightDownline = "path-right-down-line"
const cssClassPathErr = 'path-err'






// const cells  = gameBoard.children
// for (let index = 0; index < cells.length; index++) {
//     const p = document.createElement('p')
//     cells[index].appendChild(p)
// }






const visualizeHC = (path = HC) => {
    const nrOfCells = path.length // = totalNrOfCells
    let { r, g, b } = randBackgroundColr()

    let bgc = nrOfCells != (totalNrOfCells) ? "rgb(" + r + "," + b + "," + g + ")" : null

    for (let i = 0; i < nrOfCells; i++) {
        let prev = (nrOfCells + i - 1) % nrOfCells
        let curr = i
        let next = (i + 1) % nrOfCells
        let from = path[prev] - path[curr]
        let to = path[curr] - path[next]

        let cssPath = ''
        if ((from == 1 && to == 1) || (from == -1 && to == -1))
            cssPath = cssClassHZline
        else if ((from == -(gridSideLen) && to == -(gridSideLen)) || (from == gridSideLen && to == gridSideLen))
            cssPath = cssClassVLline
        else if ((from == gridSideLen && to == 1) || (from == -1 && to == -(gridSideLen)))
            cssPath = cssClassleftDownline
        else if ((from == -1 && to == gridSideLen) || (from == -(gridSideLen) && to == 1))
            cssPath = cssClassleftUpline
        else if ((from == 1 && to == -(gridSideLen)) || (from == gridSideLen && to == -1))
            cssPath = cssClassrightDownline
        else if ((from == -(gridSideLen) && to == -1) || (from == 1 && to == gridSideLen))
            cssPath = cssClassrightUpline
        else {
            cssPath = cssClassPathErr
            // throw `Err in the func "visualizeHC" the current node is ${path[i - 1]} BUT the next is ${path[i]}!`;
        }
        setCellPath(path[i], cssPath)
        // setCellText(path[i])

        setCellColors(path[i], bgc)
    }
}

const setCellColors = (childIndex, bgColor) => {
    let pathCellElement = gameBoard.children[childIndex]
    pathCellElement.style.backgroundColor = bgColor

    // let { _r, _b, _g } = inverseColor(r, b, g)
    // let pElement = pathCellElement.children[0]
    // pElement.innerText = childIndex
    // pElement.style.color = "rbg(" + _r + "," + _b + "," + _g + ")"

}

const setCellText = (childIndex) => {
    let pathCellElement = gameBoard.children[childIndex]
    pathCellElement.children[0].innerText = childIndex
}

const randBackgroundColr = () => {
    var r = Math.floor(Math.random() * 256);
    var b = Math.floor(Math.random() * 256);
    var g = Math.floor(Math.random() * 256);
    return { r, g, b }
}

const setCellPath = (childIndex, cssPath) => {
    let pathCellElement = gameBoard.children[childIndex]
    pathCellElement.classList.add(cssPath)
}



// const inverseColor = (r, g, b) => {
//     r = 255 - r
//     b = 255 - b
//     g = 255 - g
//     return { r, g, b }
// }



export {
    visualizeHC,

}