 var snakeSpeed


var slider = document.getElementById("speed-range");
var spanValue = document.getElementById("speed-range-value");

const changeSpeed = (value) => {
  /*
    Y = ((X - A) / (A - B) * (C - D)) * -1 + D

    A: min precentage value
    B: max precentage value

    C: max allowed snakeSpeed
    D: min allowed snakeSpeed

    X: currnet precentage value
*/

  slider.value = value
  spanValue.innerHTML = value
  let minPrecentageValue = value < 90 ? 1 : 90
  let maxPrecentageValue = value < 90 ? 90 : 100
  let maxAllowedSnakeSpeed = value < 90 ? 15 : 60
  let minAllowedSnakeSpeed = value < 90 ? 2 : 15
  let currentPrecentageValue = value
  snakeSpeed = ((((currentPrecentageValue - minPrecentageValue) / (minPrecentageValue - maxPrecentageValue) * (maxAllowedSnakeSpeed - minAllowedSnakeSpeed)) * -1) + minAllowedSnakeSpeed)

  // console.log(snakeSpeed)

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


changeSpeed(50)

export {
    snakeSpeed
}