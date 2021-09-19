import { Node } from "../autoPlay"
import { calc_section_index, count_ones } from "../bitwise-help-functions"
import { gridSideLen, totalNrOfCells } from "../gameBoard"

const floor = Math.floor
const random = Math.random
const min = Math.min



// what if the nr of set bits in each section is stored in the last 5 bits in that section??
// using the flwg inside "gen_indexing_matrix_mask" for ex:
//       let nr_of_set_bit = current_mask[section_indx] >>> 27
//       nr_of_set_bit++
//       nr_of_set_bit <<= 27
//       let nr_of_set_bit_mask = nr_of_set_bit | ((1 << 28) - 1)
//       current_mask[section_indx] |= nr_of_set_bit_mask
//       printBinString(current_mask[section_indx])



const gen_indexing_matrix_mask = (path) => {

    /*

    The idea is for each arr where the largest value is N, create a index_matrix_mask which will contain K masks each mask with length of N+1,
    the only unknown variable is "K" that is how many masks in the matrix.

    Note: since js number contains 32 usable bits for an int, if there a need to represent the values [0...1000] then the "MASK" will be (32 int number)
    where each number is a "SECTION"

    For simplicity sake, in the next explaination the fact of using 32 bits is ignored, and the section length is eq to ("the biggest value" + 1)
    consider the array [5,6,2,0,1,3], then a mask with 7 bits is sufficient to represent any value in the array, since the biggest value is 6.

    the process to create the matrix is:
        index_matrix_mask = []
        current_mask = []
        set prev_elm = null
            forEach elm:
                if prev_elm is null or "elm" is less than prev_elm
                    create new mask and added to the matrix
                set the n-th bit, where n is the value of the elm
                set prev_elm as the current element
        
        The result will be: 
            // The bit indexing goes from rigth-to-left
            [
                1100000, // the last bit represents the value 6
                0000100,  
                0000111,
            ]

                
    To find the index of the value 1:
            forEach mask:
                is bit set?
                    if no then set "prev_masks_ones" = count the set bits in the curr mask
                    if yes then count the "lest significant set bits" before this and add to it the "prev_masks_ones"
    The index for value 1 will be:
     read the fst mask the index is not set => prev_masks_ones = 2
     read the snd mask the index is not set => prev_masks_ones = 3
     read the 3rd mask the index is set  =>  index = (lest sig. bits before 1) 1 + (prev_masks_ones) 3 = 4
    The index for the value 1 is 4
    
    */

    let index_matrix_mask = []
    let prev = null
    let current_mask = []
    path.forEach((node) => {


        if (prev == null || node.value < prev) {
            current_mask = []
            index_matrix_mask.push(current_mask)
        }

        let { section_indx, nr_of_shifts } = calc_section_index(node.value);
        current_mask[section_indx] |= (1 << nr_of_shifts)


        // printBinString(current_mask[section_indx])
        prev = node.value
    })

    // index_matrix_mask.forEach(mask => mask.forEach((section, i) => printBinString(section, i + "")))

    // index_matrix_mask.forEach(mask => console.log(mask))

    return index_matrix_mask
}

const my_find_index = (nodeValue, index_matrix_mask) => { // before reaching here 200

    let { section_indx, nr_of_shifts } = calc_section_index(nodeValue); // 300

    let index = -1

    let prev_masks_ones = 0

    index_matrix_mask.some((mask, vec_ind) => { // 300


        let b = mask[section_indx] & (1 << nr_of_shifts)

        //''''''''''''''''''' before reaching here 800
        if (b) {
            // index was eq to -1 until this point
            index = prev_masks_ones


            // '''''''''''''''  This index_matrix_mask[vec_ind] + some takes 2000 
            let t = 0
            index_matrix_mask[vec_ind].some((section, i) => {
                t = count_ones(section)
                index += t
                return i  == section_indx
            })
            index -= t


            // // '''''''''''''''  This forEach takes 3000  
            // mask.forEach((section, i) => {
            //   index += (i < section_indx) ? count_ones(section) : 0
            // });

            // // // '''''''''''''''  This forEach takes 2500  
            // index_matrix_mask[vec_ind].forEach((section, i) => {
            //   index += (i < section_indx) ? count_ones(section) : 0
            // })


            // '''''''''''''''  This slice + forEach takes 4500  
            // mask.slice(0,section_indx).forEach((section) => index += count_ones(section))

            // '''''''''''''''  This for loop takes more than 6000 ???
            // for (let j = 0; j < section_indx; j++) {
            //   let section = mask[j]
            //   index += count_ones(section)
            // }
            // '''''''''''''''  



            // The nr of set bits to the right of "nr_of_shifts" in this section
            let temp = mask[section_indx] & ((1 << nr_of_shifts) - 1)
            index += count_ones(temp)

        } else {
            mask.forEach((section) => prev_masks_ones += count_ones(section))
        }

        return b
    })

    return index
}



const orderedNodes = Array.from({ length: (totalNrOfCells) }, (_, i) => new Node(i))

const run = () => {
    console.log('started')

    const TEST_SAMPLE_LEN = 1000
    const ITERATIONS_NR = 1000000
    let test_sample = []

    for (let i = 0; i < TEST_SAMPLE_LEN; i++) {

        let start_index = floor(random() * (totalNrOfCells - gridSideLen)) // 0 => totalNrOfCells - gridSideLen -1

        // if gridSideLen = 10:   if start_index = 0 , then nr_of_elms is between [10..40] OR if start_index = 89 , then nr_of_elms is between [10..11] 
        let nr_of_elms = floor(random() * (min((totalNrOfCells - start_index + 1), 4 * gridSideLen) - gridSideLen) + gridSideLen)

        if (start_index + nr_of_elms > totalNrOfCells) {
            throw 'start_index + nr_of_elms > totalNrOfCells'
        }

        let path = orderedNodes.slice(start_index, start_index + nr_of_elms)
        let req_indecies_list = Array.from({ length: (path.length) }, (_, i) => floor(random() * path.length))

        let index_matrix_mask = gen_indexing_matrix_mask(path)

        test_sample.push({ path, req_indecies_list, index_matrix_mask })
    }




    const t0 = performance.now();
    for (let i = 0; i < ITERATIONS_NR; i++) {

        let j = i % test_sample.length
        let path = test_sample[j].path
        let req_indecies_list = test_sample[j].req_indecies_list
        let index_matrix_mask = test_sample[j].index_matrix_mask

        var sum = 0

        req_indecies_list.forEach(rand_ind => { // 200
            let nodeValue = path[rand_ind].value
            let index = my_find_index(nodeValue, index_matrix_mask)
            // let index2 = path.findIndex(n => n.value == nodeValue)

            if (index == -1) {
                throw 'my_find_index : index == -1'
            }

            sum += index
        })

    }
    const t1 = performance.now();
    console.log(`my_find_index took ${t1 - t0} ms.`);

    sum = 0

    const t2 = performance.now();

    for (let i = 0; i < ITERATIONS_NR; i++) {

        let j = i % test_sample.length
        let path = test_sample[j].path
        let req_indecies_list = test_sample[j].req_indecies_list

        sum = 0

        req_indecies_list.forEach(rand_ind => {
            let nodeValue = path[rand_ind].value
            let index = path.findIndex(n => n.value == nodeValue)
            if (index == -1) {
                throw 'path.findIndex : index == -1'
            }

            sum += index
        })

    }

    const t3 = performance.now();
    console.log(`path.findIndex took ${t3 - t2} ms.`);




    // let avg = 0
    // for (let l = 0; l < test_sample.length; l++) {
    //   avg += test_sample[l].path.length

    // }

    // avg /= test_sample.length

    // console.log(`avg path leng ${avg}`)
    console.log('finished')

}


run()


