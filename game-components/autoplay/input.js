var inputDirection = { deltaX: 0, deltaY: 0 }
var lastInputDirection = { deltaX: 0, deltaY: 0 }

const getInputDirection = () => {
  lastInputDirection = inputDirection
  return inputDirection
}

// For testing/ simulating
const setInputDirection = (in_d) => {
  inputDirection = in_d
}

const resetInputDirection = () => {
  inputDirection = { deltaX: 0, deltaY: 0 }
  lastInputDirection = { deltaX: 0, deltaY: 0 }
}

const forLogOnly_inputDirection = () => {
  return inputDirection
}

export {
  getInputDirection,
  setInputDirection,
  resetInputDirection,
  forLogOnly_inputDirection
}