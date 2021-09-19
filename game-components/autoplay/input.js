export const  AutoInput = class {
  constructor() {
    this.inputDirection = { deltaX: 0, deltaY: 0 }
    this.lastInputDirection = { deltaX: 0, deltaY: 0 }
  }

  getInputDirection() {
    this.lastInputDirection = this.inputDirection
    return this.inputDirection
  }

  // For testing/ simulating
  setInputDirection(in_d) {
    this.inputDirection = in_d
  }

  ResetInputDirection() {
    this.inputDirection = { deltaX: 0, deltaY: 0 }
    this.lastInputDirection = { deltaX: 0, deltaY: 0 }
  }

  forLogOnly_inputDirection() {
    return this.inputDirection
  }

}
