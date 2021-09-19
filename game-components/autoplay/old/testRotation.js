
/**
 
left  [11, 12, 13, 14, 22, 21, 20, 19]
r[22, 21, 20, 19, 11, 12, 13, 14]
u[13, 14, 22, 21, 20, 19, 11, 12]
d[20, 19, 11, 12, 13, 14, 22, 21]

right[21, 20, 19, 18, 26, 27, 28, 29]
l[26, 27, 28, 29, 21, 20, 19, 18]
u[19, 18, 26, 27, 28, 29, 21, 20]
d[28, 29, 21, 20, 19, 18, 26, 27]


up[14, 22, 30, 38, 37, 29, 21, 13]
r[30, 38, 37, 29, 21, 13, 14, 22]
l[21, 13, 14, 22, 30, 38, 37, 29]
d[37, 29, 21, 13, 14, 22, 30, 38]

Down[53, 45, 37, 29, 21, 13, 14, 22, 30, 38, 46, 54]
u[14, 22, 30, 38, 46, 54, 53, 45, 37, 29, 21, 13]
l[29, 21, 13, 14, 22, 30, 38, 46, 54, 53, 45, 37]
r[38, 46, 54, 53, 45, 37, 29, 21, 13, 14, 22, 30]

array1.length === array2.length && array1.every((value, index) => value === array2[index])

 */

import { PathWithOrientaion } from "./pathWithOrientaion"




let array = [
    [11, 12, 13, 14, 22, 21, 20, 19],// LEFT_OPEN_PATH
    [21, 20, 19, 18, 26, 27, 28, 29],//RIGHT_OPEN_PATH
    [14, 22, 30, 38, 37, 29, 21, 13], //UP_OPEN_PATH
    [53, 45, 37, 29, 21, 13, 14, 22, 30, 38, 46, 54] //DOWN_OPEN_PATH
]

let or = [
    PathOrientation.LEFT_OPEN_PATH,
    PathOrientation.RIGHT_OPEN_PATH,
    PathOrientation.UP_OPEN_PATH,
    PathOrientation.DOWN_OPEN_PATH,
]

let resArr = {
    [PathOrientation.LEFT_OPEN_PATH]: {
        [PathOrientation.RIGHT_OPEN_PATH]: [22, 21, 20, 19, 11, 12, 13, 14],
        [PathOrientation.UP_OPEN_PATH]: [13, 14, 22, 21, 20, 19, 11, 12],
        [PathOrientation.DOWN_OPEN_PATH]: [20, 19, 11, 12, 13, 14, 22, 21],
    },
    [PathOrientation.RIGHT_OPEN_PATH]: {
        [PathOrientation.LEFT_OPEN_PATH]: [26, 27, 28, 29, 21, 20, 19, 18],
        [PathOrientation.UP_OPEN_PATH]: [19, 18, 26, 27, 28, 29, 21, 20],
        [PathOrientation.DOWN_OPEN_PATH]: [28, 29, 21, 20, 19, 18, 26, 27],

    },
    [PathOrientation.UP_OPEN_PATH]: {
        [PathOrientation.RIGHT_OPEN_PATH]: [30, 38, 37, 29, 21, 13, 14, 22],
        [PathOrientation.LEFT_OPEN_PATH]: [21, 13, 14, 22, 30, 38, 37, 29],
        [PathOrientation.DOWN_OPEN_PATH]: [37, 29, 21, 13, 14, 22, 30, 38],

    },
    [PathOrientation.DOWN_OPEN_PATH]: {
        [PathOrientation.UP_OPEN_PATH]: [14, 22, 30, 38, 46, 54, 53, 45, 37, 29, 21, 13],
        [PathOrientation.LEFT_OPEN_PATH]: [29, 21, 13, 14, 22, 30, 38, 46, 54, 53, 45, 37],
        [PathOrientation.RIGHT_OPEN_PATH]: [38, 46, 54, 53, 45, 37, 29, 21, 13, 14, 22, 30],
    },
}


for (let i = 0; i < array.length; i++) {
    let path = array[i]
    let originalRotation = or[i]

    let q = new PathWithOrientaion(path, originalRotation)

    let arr = Object.entries(PathOrientation)
    for (let index = 0; index < arr.length; index++) {
        const [key, newOrientation] = arr[index]
        if (newOrientation == originalRotation) continue
        q.getRotatedNodes(newOrientation)

        let nodes = q.nodes
        let resNodes = resArr[originalRotation][newOrientation]
        let bool = nodes.length === resNodes.length && nodes.every((value, index) => value === resNodes[index])
        if (!bool) {
            console.log("\n\n\n****************************************")
            console.log(`originalRotation ${originalRotation}`)
            console.log(`newOrientation ${newOrientation}`)
            console.log(nodes)
            console.log(resNodes)
            console.log("****************************************\n\n\n")
            throw 'qqqqqqqq'
        }
    }

}
