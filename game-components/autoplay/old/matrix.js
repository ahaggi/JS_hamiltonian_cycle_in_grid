import { gridSideLen } from '../../grid'
import { totalNrOfCells } from '../gameBoard'

// How can you make an adjacency matrix which would emulate a 2d grid
// https://stackoverflow.com/a/16342639   



// remember: adj. matrix for 3X3 grid is a 9X9 matrix
const matrixRows = totalNrOfCells
const matrixCols = totalNrOfCells

// The adj. Matrix
const M = Array.from(Array(matrixRows), () => Array(matrixCols).fill(0))

/// Create an adjecent matrix for a grid-graph, where we can traverse between the nodes only 
/// in vertical and horizontal manners, but not diagonally 
const createAdjMatrix = () => {
    console.log(M)

    for (let r = 0; r < gridSideLen; r++) {
        for (let c = 0; c < gridSideLen; c++) {
            let i = (r * gridSideLen) + c
            // Two inner diagonals
            if (c > 0) {
                M[(i - 1)][i] = 1
                M[i][i - 1] = 1
            }
            if (r > 0) {
                M[i - gridSideLen][i] = 1
                M[i][i - gridSideLen] = 1
            }
        }
    }
    return M
}

export {

    createAdjMatrix
}