
export const log = []
export const game = {
    moves: [],
    HCs: [],
    res: false
}
export const move = {
    HcId: null,
    moveDirection: null,
    foodPos: { x: null, y: null },
}

var currGame = null
var currMove = null

const createNewGameLog = () => {
    currGame = JSON.parse(JSON.stringify(game))
    log.push(currGame)
}

const updateCurrGameLog = (prop) => {
    for (const key in prop) {
        if (key == 'addNewHC') {
            currGame.HCs.push(prop[key])
        } else if (currGame.hasOwnProperty(key)) {
            currGame = Object.assign(currGame, { [key]: prop[key] })
        } else {
            throw `currGame does NOT contain some of this key: ${key}`
        }
    }
}

const createNewMoveLog = () => {
    let id = currGame.moves.length
    currMove = JSON.parse(JSON.stringify(move))
    currMove.id = id
    currGame.moves.push(currMove)
}

const updateCurrMoveLog = (prop) => {
    let keys = Object.keys(prop)
    let valid = keys.every(k => {
        return currMove.hasOwnProperty(k)
    })

    if (valid) {
        Object.assign(currMove, prop)
        currMove.HcId = currGame.HCs.length - 1
    } else {
        throw `currMove does NOT contain some of these keys ${keys}`
    }
}

const saveLog = () => {
    let sec = log.filter(g => g.res)
    let failed = log.filter(g => !(g.res))
    console.log(`\n\n`)
    console.log(`Nr of completed games with res is true ${sec.length} of total ${log.length} games`)
    let avgSteps = 0
    let avgNrOfHCchange = 0

    sec.forEach(g => {
        console.log(g)
        avgSteps += g.moves.length
        avgNrOfHCchange += g.HCs.length
    })
    avgSteps/= sec.length
    avgNrOfHCchange/= sec.length
    console.log(`Completed games with res true:   avgSteps ${avgSteps}, avgNrOfHCchange ${avgNrOfHCchange}`)

    console.log(`\n\n`)

    console.log(`\n\n`)
    console.log(`Nr of completed games with res is false ${failed.length} of total ${log.length} games`)
    failed.forEach(g => {
        console.log(g)
    })
    console.log(`\n\n`)

    // sessionStorage.setItem("log", log);

}


export {
    createNewGameLog,
    updateCurrGameLog,
    createNewMoveLog,
    updateCurrMoveLog,
    saveLog
}