 var snakeSpeed


var slider = document.getElementById("speed-range");
const changeSpeed = (sliderValue) => {
  /*
    Y = ((X - A) / (A - B) * (C - D)) * -1 + D

    A: min precentage value
    B: max precentage value

    C: min allowed snakeSpeed
    D: max allowed snakeSpeed

    X: currnet precentage value
*/

  slider.value = sliderValue

  let minPrecentageValue = 1
  let maxPrecentageValue = 100
  let minAllowedSnakeSpeed = 60
  let maxAllowedSnakeSpeed = 2
  let currentPrecentageValue = sliderValue
  snakeSpeed = ((((currentPrecentageValue - minPrecentageValue) / (minPrecentageValue - maxPrecentageValue) * (minAllowedSnakeSpeed - maxAllowedSnakeSpeed)) * -1) + maxAllowedSnakeSpeed)
  console.log(snakeSpeed)
  console.log(currentPrecentageValue)
}

slider.addEventListener("input", (e) => changeSpeed(e.target.value));
slider.addEventListener("keydown", (e) => {
  if (e.key !== 'F5') {
    e.preventDefault();
    return false;
  }
});
window.addEventListener('keydown', e => {
  if ((e.key === 'a' || e.key === 'A') && slider.value > 1) {
    changeSpeed((+slider.value) - 1)
  } else if ((e.key === 'd' || e.key === 'D') && slider.value < 100) {
    changeSpeed((+slider.value) + 1)
  }
})


changeSpeed(12)

export {
    snakeSpeed
}