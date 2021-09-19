


const floor = Math.floor
const random = Math.random

const gridSideLen = 20
const totalNrOfCells = gridSideLen * gridSideLen
const arrOfObjs = Array.from({ length: (totalNrOfCells) }, (_, i) => { return {value: i} })

/*
For an array with lengh N, what is the best approach to find some random element index in the array?

1-Using Array.findIndex:
    Best case = 1
    worst case = N
    avg = (N+1)/2
    Which means if we need to find the indicies of K random elements the required time will be on avg = k * avg ~= K*(N/2)

2-Creating a map of the array where the keys are elm.ids and values are the elms indecies in the original array. Creating the map will take O(N), but the index lookup will take O(1)

To connect 2 subgraphs, it'll need to perform a rotation on one of them (if needed!) and find the splicing point on the other which means the worst case is K=2*(nr_of_subgraphs), where K is how many times we'll search for an index of some node in a path.

Comparisson between those approaches
If we randomly choose K elments and lookup for their indecies in an array with length N (for accuracy iterate x 1000000)

    N=100
        findIndex K=1:    219 ms
        using map K=1:   2016 ms <-- it will take roughly 2000 ms just to create the map

        findIndex K=2:    220 ms
        using map K=2:   2040 ms

        almost the same time when K=25
        findIndex K=25:  2400 ms 
        using map K=25:  2400 ms

        findIndex K=100: 9000 ms
        using map K=100: 3500 ms

    N=400
        findIndex K=1:     250 ms
        using map K=1:    6900 ms <-- it will take roughly 7000 ms just to create the map

        findIndex K=2:     650 ms
        using map K=2:    6930 ms

        almost the same time when K=25
        findIndex K=25:   6900 ms
        using map K=25:   7200 ms

        findIndex K=100: 25000 ms
        using map K=100:  8000 ms

    N=900
        findIndex K=1:     550 ms
        using map K=1:   15000 ms <-- it will take roughly 15000 ms just to create the map

        findIndex K=2:    1400 ms
        using map K=2:   15100 ms

        almost the same time when K=27
        findIndex K=25:  14000 ms
        using map K=25:  15400 ms

        findIndex K=100: 60000 ms
        using map K=100: 16000 ms

*/
 
const nrOfIterations = 1000000
const nrOfLookups = 100

const doSomethingUsingFindIndex = () => {
  let sum = 0
  for (let i = 0; i < nrOfIterations; i++) {
    for (let j = 0; j < nrOfLookups; j++) {
      let index = floor(random() * totalNrOfCells)

      const element = arrOfObjs.findIndex(node => node.value == index)

      sum += element
    }
  }
  console.log(sum)
}

const doSomethingUsingMap = () => {
  let sum = 0

  for (let i = 0; i < nrOfIterations; i++) {
    let nodesLocalIndecies = arrOfObjs.reduce((acc, node, i) => {
      acc[node.value] = i;
      return acc;
    }, {})

    for (let j = 0; j < nrOfLookups; j++) {
      let index = floor(random() * totalNrOfCells)
      const element = nodesLocalIndecies[index];
      sum += element
    }
  }
  console.log(sum)
}



console.log(`running!!!`);

const t0 = performance.now();
doSomethingUsingFindIndex();
const t1 = performance.now();
console.log(`Call to doSomethingUsingFindIndex took ${t1 - t0} milliseconds.`);


const t2 = performance.now();
doSomethingUsingMap();
const t3 = performance.now();
console.log(`Call to doSomethingUsingMap took ${t3 - t2} milliseconds.`);
