
export default class PlayerInput {
  static #_instance = null;
  inputDirection
  queue

  constructor() {
    if (PlayerInput.#_instance) {
      return PlayerInput.#_instance
    }
    PlayerInput.#_instance = this;
    this.queue = new InputDirectionQueue()
    this.#_addEventListener()
  }

  #_addEventListener() {

    window.addEventListener('keydown', e => {
      switch (e.key) {
        case 'ArrowUp':
          this.queue.setInputDirection({ deltaX: -1, deltaY: 0 })
          break
        case 'ArrowDown':
          this.queue.setInputDirection({ deltaX: 1, deltaY: 0 })
          break
        case 'ArrowLeft':
          this.queue.setInputDirection({ deltaX: 0, deltaY: -1 })
          break
        case 'ArrowRight':
          this.queue.setInputDirection({ deltaX: 0, deltaY: 1 })
          break
      }
    })
  }

  getInputDirection() {
    this.inputDirection = this.queue.getInputDirection()
    return this.inputDirection
  }

  ResetInputDirection() {
    // console.log("ResetInputDirection")
    this.inputDirection = { deltaX: 0, deltaY: 0 }
    this.queue = new InputDirectionQueue()
  }
}

const abs = Math.abs

class InputDirectionQueue {
  #data
  constructor() {
    this.#data = []
  }

  #add(input) {
    this.#data.push(input);
  }

  #remove() {
    this.#data = this.#data.slice(1);
    return this.#data[0]
  }

  #last() {
    return this.#data[this.#data.length -1];
  }

  getInputDirection() {
    let input
    if (this.#data.length == 0)
      input = { deltaX: 0, deltaY: 0 }
    else if (this.#data.length == 1)
      input = this.#last()
    else // if this.#data.length > 1
      input = this.#remove()

    // console.log(input)
    return input
  }

  setInputDirection(input) {
    if (this.#data.length == 0) {
      this.#add(input)
      return
    }
    let last = this.#last()

    let absLastX = abs(last.deltaX)
    //   let absLastY = abs(last.deltaY)
    let absNewX = abs(input.deltaX)
    //   let absNewY = abs(input.deltaY)

    // This check to prevent:
    // - adding to the queue the same direction as the last one added. 
    // - adding to the queue an opposite direction of the last added one. 
    // i.e. if the last-added is UP the new direction can't be UP nor DOWN.
    if (absLastX !== absNewX) { //  || absLastY !== absNewY 
      this.#add(input)
    }
  }
}

