import { gameBoardSideLen } from "../../grid"

const log = Math.log
const floor = Math.floor
const ceil = Math.ceil

let sl = 1
while (((sl + 1) * gameBoardSideLen) < 30)
    sl += 1
// BITS_PER_SECTION must be multiple of gameBoardSideLen and less than or eq 30
const BITS_PER_SECTION = sl * gameBoardSideLen
const NR_OF_SECTIONS = ceil((gameBoardSideLen * gameBoardSideLen) / BITS_PER_SECTION)


const setBit = (n, indexToSet) => {
    return n | (1 << indexToSet)
}

const clear_bit = (nr, bit_index) => {
    // set bool = true to set the bit with index bit_index, or false to clear it
    nr ^= (-false ^ nr) & bit_index // this will set the specified bit if we use   nr ^= (-true ^ nr) & bit_index
    return nr
}


const printBinString = (n, msg = "") => {
    // n must be between (-2^31) -2147483648 and ((2^31)-1) 2147483647
    for (var nFlag = 0, nShifted = n, sMask = ""; nFlag < 32;
        nFlag++, sMask += String(nShifted >>> 31), nShifted <<= 1);
    console.log(`${msg} ${sMask}`)
}



const msb_u32 = (n) => {
    if (n <= 0) return NaN;

    // Remember that: this will return the mostSignificantBit positoin, where the indexing is Zero-based... i.e. msg(5) is 2
    const bval = [0, 1, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4]

    let base = 0;
    if (n & 0xFFFF0000) { base += 32 / 2; n >>= 32 / 2; }
    if (n & 0x0000FF00) { base += 32 / 4; n >>= 32 / 4; }
    if (n & 0x000000F0) { base += 32 / 8; n >>= 32 / 8; }
    return (base + bval[n]) - 1; // to make the return value Zero-based index
}

const msb_u32_log = (n) => {
    // Remember that: this will return the mostSignificantBit positoin, where the indexing is Zero-based... i.e. msg(5) is 2
    if (n <= 0) return NaN;
    return floor(log(n) / log(2));
}

const msb_u32_loop = (n) => {
    // Remember that: this will return the mostSignificantBit positoin, where the indexing is Zero-based... i.e. msg(5) is 2
    if (n <= 0) return NaN
    let msb = 0
    while (n > 0) {
        n >>>= 1;
        msb++
    }
    return msb - 1
}

const largest_pow2_lte_u32_nr = (nr) => {
    // if nr is 1010, then this function will return 1000
    if (nr <= 0) return 0
    nr |= (nr >>> 1);
    nr |= (nr >>> 2);
    nr |= (nr >>> 4);
    nr |= (nr >>> 8);
    nr |= (nr >>> 16);
    nr++;
    nr >>>= 1;
    return nr
}



// let x = 5
// printBinString(~x)
// x = setBit(x, 4)
// printBinString(128)


const is_path_contains_node = (path, node_value) => {
    let { section_indx, nr_of_shifts } = calc_index(node_value);
    console.log(section_indx + " " + nr_of_shifts)
    return (path[section_indx] & (1 << nr_of_shifts)) != 0
}


// let arr = [0, 0, 0]
// let { section_indx, nr_of_shifts } = calc_index(80);

// arr[section_indx] |= (1 << nr_of_shifts)

// console.log(is_path_contains_node(arr, 80))

// arr.forEach(mask=> {
//     printBinString(mask)})



const reverse_bits_order = (num) => {
    //  reverse a given u32 
    // swap odd and even bits
    num = ((num >> 1) & 0x55555555) | ((num & 0x55555555) << 1);
    // swap consecutive pairs
    num = ((num >> 2) & 0x33333333) | ((num & 0x33333333) << 2);
    // swap nibbles ... 
    num = ((num >> 4) & 0x0F0F0F0F) | ((num & 0x0F0F0F0F) << 4);
    // swap bytes
    num = ((num >> 8) & 0x00FF00FF) | ((num & 0x00FF00FF) << 8);
    // swap 2-byte long pairs
    num = (num >> 16) | (num << 16);

    return num
}












const spliceCyclicOtherOptions_bitwise_v1 = () => {

    let g1 = [
        ['11111111'],
        ['11111111'],
        ['11111111'],
        ['11111111'],
        ['11111111'],
        ['11111111'],
        ['11111111'],
        ['11111111'],
    ]


    let other = [
        ['11111111'],
        ['11111111'],
        ['11111111'],
        ['11111111'],
        ['11111111'],
        ['11111111'],
        ['11111111'],
        ['11111111'],
    ]

    const walls = {
        UPPER: 'UPPER',
        LOWER: 'LOWER',
        LEFT: 'LEFT',
        RIGHT: 'RIGHT',
    }
    const option = {
        other_root: null,
        other_leaf: null,
        connect_before_this_node: null,
    }
    let res_options = {
        [walls.UPPER]: [],
        [walls.LOWER]: [],
        [walls.LEFT]: [],
        [walls.RIGHT]: [],
    }

    const upper_wall_calc = (other_row_index, other_x_is_even, found) => {

        let filter_upper_wall = parseInt(g1[other_row_index - 1], 2) & parseInt(other[other_row_index], 2)

        while (filter_upper_wall > 0 && !found) {
            let msb_index = msb_u32(filter_upper_wall)
            // console.log(`msb_index ${msb_index}`)

            let other_root_index = other_x_is_even ? (msb_index - 1) : msb_index
            let other_leaf_index = other_x_is_even ? msb_index : (msb_index - 1)

            // since root.y is always even when connecteing with upper wall
            let other_root_y_is_even = other_root_index % 2 == 0 // this is eq to (other_root_index % gameBoardSideLen) % 2 == 0
            if (other_root_y_is_even) {
                if ((msb_index - 1) >= 0 && (filter_upper_wall & (1 << (msb_index - 1))) != 0) { // important: (msb_index - 1) >= 0, since 1<<(-1) is the same as 1<<7 if the mask leng is 8
                    // console.log(`other_root_index ${other_root_index}`)
                    // console.log(`other_leaf_index ${other_leaf_index}`)
                    let temp = Object.assign({}, option)
                    temp.other_root = other_root_index + (other_row_index * gameBoardSideLen)
                    temp.other_leaf = other_leaf_index + (other_row_index * gameBoardSideLen)
                    temp.connect_before_this_node = (temp.other_leaf - gameBoardSideLen),

                        // temp.other_root_y = other_root_index
                        // temp.other_leaf_y = other_leaf_index
                        res_options[walls.UPPER].push(temp)
                    // console.log(`root ${temp.other_root}`)
                    // console.log(`leaf ${temp.other_leaf}`)
                }
                filter_upper_wall = clear_bit(filter_upper_wall, 1 << other_root_index, false)
                filter_upper_wall = clear_bit(filter_upper_wall, 1 << other_leaf_index, false)

            } else {
                filter_upper_wall = clear_bit(filter_upper_wall, 1 << msb_index, false)
                // printBinString(filter_upper_wall)
            }
        }

    }

    const left_wall_calc = (other_T_row_index, other_T_x_is_even, found) => {

        let filter_T_left_wall = parseInt(g1[other_T_row_index - 1], 2) & parseInt(other[other_T_row_index], 2)

        while (filter_T_left_wall > 0 && !found) {
            let msb_index = msb_u32(filter_T_left_wall)
            // console.log(`msb_index ${msb_index}`)

            let other_T_root_index = other_T_x_is_even ? msb_index : (msb_index - 1)
            let other_T_leaf_index = other_T_x_is_even ? (msb_index - 1) : msb_index

            let other_T_root_y_is_even = other_T_root_index % 2 == 0 // this is eq to (floor( nodeValue / gameBoardSideLen )) % 2 == 0
            // since other_T_root_y is always odd when connecteing with left wall
            if (!other_T_root_y_is_even) {
                if ((msb_index - 1) >= 0 && (filter_T_left_wall & (1 << (msb_index - 1))) != 0) { // important: (msb_index - 1) >= 0, since 1<<(-1) is the same as 1<<7 if the mask leng is 8
                    // console.log(`other_T_root_index ${other_T_root_index}`)
                    // console.log(`other_T_leaf_index ${other_T_leaf_index}`)
                    let temp = Object.assign({}, option)
                    temp.other_root = other_T_row_index + (other_T_root_index * gameBoardSideLen)
                    temp.other_leaf = other_T_row_index + (other_T_leaf_index * gameBoardSideLen)
                    temp.connect_before_this_node = (temp.other_leaf - 1),

                        // temp.other_root_y = other_T_root_index
                        // temp.other_leaf_y = other_T_leaf_index
                        res_options[walls.LEFT].push(temp)
                    // console.log(`root ${temp.other_root}`)
                    // console.log(`leaf ${temp.other_leaf}`)
                }
                filter_T_left_wall = clear_bit(filter_T_left_wall, 1 << other_T_root_index, false)
                filter_T_left_wall = clear_bit(filter_T_left_wall, 1 << other_T_leaf_index, false)

            } else {
                filter_T_left_wall = clear_bit(filter_T_left_wall, 1 << msb_index, false)
                // printBinString(filter_T_left_wall)
            }
        }

    }

    const lower_wall_calc = (other_row_index, other_x_is_even, found) => {

        let filter_lower_wall = parseInt(g1[other_row_index + 1], 2) & parseInt(other[other_row_index], 2)

        while (filter_lower_wall > 0 && !found) {
            let msb_index = msb_u32(filter_lower_wall)
            // console.log(`msb_index ${msb_index}`)

            let other_root_index = other_x_is_even ? (msb_index - 1) : msb_index
            let other_leaf_index = other_x_is_even ? msb_index : (msb_index - 1)

            let other_root_y_is_even = other_root_index % 2 == 0 // this is eq to (other_root_index % gameBoardSideLen) % 2 == 0
            // since root.y is always odd when connecteing with lower wall
            if (!other_root_y_is_even) {
                if ((msb_index - 1) >= 0 && (filter_lower_wall & (1 << (msb_index - 1))) != 0) { // important: (msb_index - 1) >= 0, since 1<<(-1) is the same as 1<<7 if the mask leng is 8
                    // console.log(`other_root_index ${other_root_index}`)
                    // console.log(`other_leaf_index ${other_leaf_index}`)
                    let temp = Object.assign({}, option)
                    temp.other_root = other_root_index + (other_row_index * gameBoardSideLen)
                    temp.other_leaf = other_leaf_index + (other_row_index * gameBoardSideLen)
                    temp.connect_before_this_node = (temp.other_leaf + gameBoardSideLen),
                        // temp.other_root_y = other_root_index
                        // temp.other_leaf_y = other_leaf_index
                        res_options[walls.LOWER].push(temp)
                    // console.log(`root ${temp.other_root}`)
                    // console.log(`leaf ${temp.other_leaf}`)
                }
                filter_lower_wall = clear_bit(filter_lower_wall, 1 << other_root_index, false)
                filter_lower_wall = clear_bit(filter_lower_wall, 1 << other_leaf_index, false)

            } else {
                filter_lower_wall = clear_bit(filter_lower_wall, 1 << msb_index, false)
                // printBinString(filter_lower_wall)
            }
        }
        return found

    }

    const rigth_wall_calc = (other_T_row_index, other_T_x_is_even, found) => {

        let filter_T_rigth_wall = parseInt(g1[other_T_row_index + 1], 2) & parseInt(other[other_T_row_index], 2)

        while (filter_T_rigth_wall > 0 && !found) {
            let msb_index = msb_u32(filter_T_rigth_wall)
            // console.log(`msb_index ${msb_index}`)

            let other_T_root_index = other_T_x_is_even ? msb_index : (msb_index - 1)
            let other_T_leaf_index = other_T_x_is_even ? (msb_index - 1) : msb_index

            let other_T_root_y_is_even = other_T_root_index % 2 == 0 // this is eq to (floor( nodeValue / gameBoardSideLen )) % 2 == 0
            // since other_T_root_y is always even when connecteing with right wall
            if (other_T_root_y_is_even) {
                if ((msb_index - 1) >= 0 && (filter_T_rigth_wall & (1 << (msb_index - 1))) != 0) { // important: (msb_index - 1) >= 0, since 1<<(-1) is the same as 1<<7 if the mask leng is 8
                    // console.log(`other_T_root_index ${other_T_root_index}`)
                    // console.log(`other_T_leaf_index ${other_T_leaf_index}`)
                    let temp = Object.assign({}, option)
                    temp.other_root = other_T_row_index + (other_T_root_index * gameBoardSideLen)
                    temp.other_leaf = other_T_row_index + (other_T_leaf_index * gameBoardSideLen)
                    temp.connect_before_this_node = (temp.other_leaf - 1),

                        // temp.other_root_y = other_T_root_index
                        // temp.other_leaf_y = other_T_leaf_index
                        res_options[walls.RIGHT].push(temp)
                    // console.log(`root ${temp.other_root}`)
                    // console.log(`leaf ${temp.other_leaf}`)
                }
                filter_T_rigth_wall = clear_bit(filter_T_rigth_wall, 1 << other_T_root_index, false)
                filter_T_rigth_wall = clear_bit(filter_T_rigth_wall, 1 << other_T_leaf_index, false)

            } else {
                filter_T_rigth_wall = clear_bit(filter_T_rigth_wall, 1 << msb_index, false)
                // printBinString(filter_T_rigth_wall)
            }
        }

    }


    let found = false
    for (let i = 1; i < (other.length - 1); i++) { //  && !found

        let other_x_is_even = (i) % 2 == 0

        found = upper_wall_calc(i, other_x_is_even, found)
        found = left_wall_calc(i, other_x_is_even, found)

        found = lower_wall_calc(i, other_x_is_even, found)
        found = rigth_wall_calc(i, other_x_is_even, found)

    }
    console.log('walls.UPPER')
    res_options[walls.UPPER].forEach(op => console.log(op))
    console.log(`\n`)
    console.log('walls.LOWER')
    res_options[walls.LOWER].forEach(op => console.log(op))
    console.log(`\n`)
    console.log('walls.LEFT')
    res_options[walls.LEFT].forEach(op => console.log(op))
    console.log(`\n`)
    console.log('walls.RIGHT')
    res_options[walls.RIGHT].forEach(op => console.log(op))

}



const spliceCyclicOtherOptions_bitwise_v2 = () => {
    const calc_index = (node_value) => {
        // of the 64 bits of js number, we can only use 32 bits due to js number implementation, and that int is signed (Binary signed 2's complement).
        // If total nr of nodes is 8X8 = 64 nodes we need array with 2 int which have 32X2=64 bits,,
        // this is how the mask look like if we have max_usable_bits = 24 and totalNrOfCells = 64:
        //   section_indx=0          section_indx=1
        // 23|..|05|04|03|02|01|00       46|...|27|26|25|24

        // to set bit (bit_to_set) = 50:
        //     * section_indx = 50 / 24 = 2
        //     * nr_of_shifts = 50 % 24 = 2
        //     * a[section_indx] |= (1 << nr_of_shifts) ==> a[2] |= (1 << 2)

        let section_indx = floor(node_value / BITS_PER_SECTION);
        let nr_of_shifts = node_value % BITS_PER_SECTION;
        return { section_indx, nr_of_shifts }
    }

    const calc_T_index = (node_value) => {
        // of the 64 bits of js number, we can only use 32 bits due to js number implementation, and that int is signed (Binary signed 2's complement).
        // If total nr of nodes is 8X8 = 64 nodes we need array with 2 int which have 32X2=64 bits,,
        // this is how the TRANSPOSED mask look like if we have max_usable_bits = 24 and totalNrOfCells = 64:
        //   section_indx=0          section_indx=1
        // 56|..|40|32|24|16|08|00       57|...|25|17|09|01

        // to set bit (bit_to_set) = 5:
        //     * section_indx = floor( (5 % 8)/3 ) = 1
        //     * nr_of_shifts =  (  (5 % 8) * 8 + floor(5 / 8)  ) % 24 = 16
        //     * a[section_indx] |= (1 << nr_of_shifts) ==> a[1] |= (1 << 16)

        let section_indx = floor(((node_value % gameBoardSideLen) * gameBoardSideLen) / BITS_PER_SECTION)
        let x_T = (node_value % gameBoardSideLen)
        let y_T = floor(node_value / gameBoardSideLen)
        let nr_of_shifts = ((x_T * gameBoardSideLen) + y_T) % BITS_PER_SECTION;
        return { section_indx, nr_of_shifts }
    }

    // remember to set gameBoardSideLen = 12
    let other_path144 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143,]

    // remember to set gameBoardSideLen = 10
    let other_path100 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99,]

    // remember to set gameBoardSideLen = 8
    let other_path64 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63,]

    // remember to set gameBoardSideLen = 6
    let other_path36 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35,]

    let other_path = other_path36


    let other_mask = Array(NR_OF_SECTIONS).fill(0)
    other_path.forEach(node => {
        let { section_indx, nr_of_shifts } = calc_index(node);
        other_mask[section_indx] |= (1 << nr_of_shifts)
    })
    let other_T_mask = Array(NR_OF_SECTIONS).fill(0)
    other_path.forEach(node => {
        let { section_indx, nr_of_shifts } = calc_T_index(node);
        other_T_mask[section_indx] |= (1 << nr_of_shifts)
    })


    // remember to set gameBoardSideLen = 12
    let path144 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143,]

    // remember to set gameBoardSideLen = 10
    let path100 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99,]

    // remember to set gameBoardSideLen = 8
    let path64 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63,]

    // remember to set gameBoardSideLen = 6
    let path36 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35,]

    let path = path36
    let this_mask = Array(NR_OF_SECTIONS).fill(0)
    path.forEach(node => {
        let { section_indx, nr_of_shifts } = calc_index(node);
        this_mask[section_indx] |= (1 << nr_of_shifts)
    })

    let this_T_mask = Array(NR_OF_SECTIONS).fill(0)
    path.forEach(node => {
        let { section_indx, nr_of_shifts } = calc_T_index(node);
        this_T_mask[section_indx] |= (1 << nr_of_shifts)
    })

    const walls = {
        UPPER: 'UPPER',
        LOWER: 'LOWER',
        LEFT: 'LEFT',
        RIGHT: 'RIGHT',
    }
    const option = {
        other_root: null,
        other_leaf: null,
        connect_before_this_node: null,
    }
    let res_options = {
        [walls.UPPER]: [],
        [walls.LOWER]: [],
        [walls.LEFT]: [],
        [walls.RIGHT]: [],
    }

    const upper_wall_calc = (section_index, found) => {
        let this_section = this_mask[section_index]
        let this_next_section = this_mask[section_index + 1]

        let other_section = other_mask[section_index]
        // printBinString(this_section , "this_section")
        // printBinString(other_section , "other_section")

        // To connenct to the upper wall, the comparing starts between (2nd row in the "this" graph) and (fst row of "other" graph), which means the fst n-th bits in the "this" graph will be ignored
        // i.e. the fst n-th bits in this "section" the "this" graph will be ignored, where n is eq "gameBoardSideLen"

        let this_mask_shifted = this_section >>> gameBoardSideLen
        // the n-th fst bits in the next section will be also ignored at the next excution, the same as the fst n-th bits in this section has been ignored
        // that's why we have to copy these fst n-th bits in the next section to be as the last n-th bits at this section.
        let next_n_bits = this_next_section ? (this_next_section & ((1 << gameBoardSideLen) - 1)) : 0
        // copy the fst n bits in the next section to the last n bits in this section, where n is eq "gameBoardSideLen"
        this_mask_shifted |= (next_n_bits << (BITS_PER_SECTION - gameBoardSideLen))
        let filter_upper_wall = other_section & this_mask_shifted
        // printBinString(filter_upper_wall)

        while (filter_upper_wall > 0 && !found) {

            let msb_index = msb_u32(filter_upper_wall)

            // add "(section_index * BITS_PER_SECTION )" to get the aqtual node value.
            let msb_node_value = msb_index + (section_index * BITS_PER_SECTION)

            let other_x = floor(msb_node_value / gameBoardSideLen)
            let other_x_is_even = (other_x % 2) == 0

            let other_root = other_x_is_even ? (msb_node_value - 1) : msb_node_value
            let other_leaf = other_x_is_even ? msb_node_value : (msb_node_value - 1)

            // since root.y is always even when connecteing with upper wall
            let other_root_y_is_even = other_root % 2 == 0 // this is eq to (msb_node_value % gameBoardSideLen) % 2 == 0
            let is_other_root_leaf_same_row = floor(other_leaf / gameBoardSideLen) == floor(other_root / gameBoardSideLen)
            // console.log(`msb_node_value ${msb_node_value}`)

            if (is_other_root_leaf_same_row && other_root_y_is_even && (other_x >= 1 && other_x <= (gameBoardSideLen - 1))) {
                if ((msb_index - 1) >= 0 && (filter_upper_wall & (1 << (msb_index - 1))) != 0) { // important: (msb_index - 1) >= 0, since 1<<(-1) is the same as 1<<7 if the mask leng is 8
                    // console.log(`other_root ${other_root}`)
                    // console.log(`other_leaf ${other_leaf}`)

                    let temp = Object.assign({}, option)
                    temp.other_root = other_root
                    temp.other_leaf = other_leaf
                    temp.connect_before_this_node = (temp.other_leaf - gameBoardSideLen)

                    res_options[walls.UPPER].push(temp)
                }
                filter_upper_wall = clear_bit(filter_upper_wall, 1 << msb_index)
                filter_upper_wall = clear_bit(filter_upper_wall, 1 << (msb_index - 1))
                // printBinString(filter_upper_wall)

            } else {
                filter_upper_wall = clear_bit(filter_upper_wall, 1 << msb_index)
                // printBinString(filter_upper_wall)
            }
        }

    }

    const left_Transposed_wall_calc = (section_index, found) => {

        let this_T_section = this_T_mask[section_index]
        let this_T_next_section = this_T_mask[section_index + 1]

        let other_T_section = other_T_mask[section_index]

        // READ the comments inside "upper_wall_calc" since this is almost the same idea, but mask is transposed.
        let this_T_mask_shifted = this_T_section >>> gameBoardSideLen
        let next_T_n_bits = this_T_next_section ? (this_T_next_section & ((1 << gameBoardSideLen) - 1)) : 0
        this_T_mask_shifted |= (next_T_n_bits << (BITS_PER_SECTION - gameBoardSideLen))
        let filter_T_left_wall = other_T_section & this_T_mask_shifted

        while (filter_T_left_wall > 0 && !found) {

            /* if the node actaul value is 58, then msb_T_index is 23 */
            let msb_T_index = msb_u32(filter_T_left_wall)

            // add "(section_index * BITS_PER_SECTION )" to get the T node value.
            /* if the node actaul value is 58, then msb_T_value is 23 = 23 + (0 * 24) */
            let msb_T_value = msb_T_index + (section_index * BITS_PER_SECTION)
            /* if the node actaul value is 58, then msb_T_x is 2   msb_T_x can has a range [0,2] iff the NR_OF_SECTIONS is 3*/
            let msb_T_x = floor(msb_T_value / gameBoardSideLen)
            /* if the node actaul value is 58, then msb_T_y is 7   msb_T_y can has a range [0,7]*/
            let msb_T_y = (msb_T_value % gameBoardSideLen)

            /* if the node actaul value is 58, then msb_node_value is 58 */
            let msb_node_value = msb_T_x + (msb_T_y * gameBoardSideLen)

            // Note (other_T_x_is_even =>(23.x = 2)_is_even) is NOT eq to  (msb_T_value_is_even => (23)_is_even), and also NOT eq to actaul node value (58)_is_even
            let other_T_x_is_even = (msb_T_x % 2) == 0

            /* if the node actaul value is 58, then other_root is 58  other_root is 50*/
            let other_root = other_T_x_is_even ? msb_node_value : (msb_node_value - gameBoardSideLen)
            let other_leaf = other_T_x_is_even ? (msb_node_value - gameBoardSideLen) : msb_node_value

            // since other_root.x is always odd when connecteing with left wall
            // Note (other_root_x_is_even =>(58.x)_is_even) is NOT eq to actaul node value (58)_is_even
            let other_root_x_is_even = (floor(other_root / gameBoardSideLen)) % 2 == 0
            let is_other_root_leaf_same_col = ((other_root) % gameBoardSideLen) == ((other_leaf) % gameBoardSideLen)

            if (is_other_root_leaf_same_col && !other_root_x_is_even && (msb_T_x >= 1 && msb_T_x <= (gameBoardSideLen - 1))) {
                if ((msb_T_index - 1) >= 0 && (filter_T_left_wall & (1 << (msb_T_index - 1))) != 0) { // important: (msb_T_index - 1) >= 0, since 1<<(-1) is the same as 1<<7 if the mask leng is 8
                    // console.log(`other_root ${other_root}`)
                    // console.log(`other_leaf ${other_leaf}`)

                    let temp = Object.assign({}, option)
                    temp.other_root = other_root
                    temp.other_leaf = other_leaf
                    temp.connect_before_this_node = (temp.other_leaf - 1)

                    res_options[walls.LEFT].push(temp)
                }
                filter_T_left_wall = clear_bit(filter_T_left_wall, 1 << msb_T_index)
                filter_T_left_wall = clear_bit(filter_T_left_wall, 1 << (msb_T_index - 1))
                // printBinString(filter_T_left_wall)

            } else {
                filter_T_left_wall = clear_bit(filter_T_left_wall, 1 << msb_T_index)
                // printBinString(filter_T_left_wall)
            }
        }

        return found
    }


    const lower_wall_calc = (section_index, found) => {
        let this_section = this_mask[section_index]
        let this_next_section = this_mask[section_index + 1]
        let other_section = other_mask[section_index]


        // printBinString(other_mask[section_index], "other_mask["+section_index+"]")
        // printBinString(other_mask[section_index + 1], "other_mask["+(section_index+1)+"]")

        // To connenct to the lower wall, the comparing starts between (2nd row in the "this" graph) and (fst row of "other" graph), which means the fst n-th bits in the "this" graph will be ignored
        // i.e. the fst n-th bits in this "section" the "this" graph will be ignored, where n is eq "gameBoardSideLen"

        let this_mask_shifted = this_section >>> gameBoardSideLen
        // the n-th fst bits in the next section will be also ignored at the next excution, the same as the fst n-th bits in this section has been ignored
        // that's why we have to copy these fst n-th bits in the next section to be as the last n-th bits at this section.
        let next_n_bits = this_next_section ? (this_next_section & ((1 << gameBoardSideLen) - 1)) : 0
        // copy the fst n bits in the next section to the last n bits in this section, where n is eq "gameBoardSideLen"
        this_mask_shifted |= (next_n_bits << (BITS_PER_SECTION - gameBoardSideLen))
        let filter_lower_wall = other_section & this_mask_shifted
        // printBinString(filter_lower_wall)

        while (filter_lower_wall > 0 && !found) {

            let msb_index = msb_u32(filter_lower_wall)

            // add "(section_index * BITS_PER_SECTION )" to get the aqtual node value.
            let msb_node_value = msb_index + (section_index * BITS_PER_SECTION)

            let other_x = floor(msb_node_value / gameBoardSideLen)
            let other_x_is_even = (other_x % 2) == 0

            let other_root = other_x_is_even ? (msb_node_value - 1) : msb_node_value
            let other_leaf = other_x_is_even ? msb_node_value : (msb_node_value - 1)

            // since root.y is always odd when connecteing with lower wall
            let other_root_y_is_even = other_root % 2 == 0 // this is eq to (msb_node_value % gameBoardSideLen) % 2 == 0
            let is_other_root_leaf_same_row = floor(other_leaf / gameBoardSideLen) == floor(other_root / gameBoardSideLen)
            // console.log(`msb_node_value ${msb_node_value}`)

            if (is_other_root_leaf_same_row && !other_root_y_is_even && (other_x >= 1 && other_x <= (gameBoardSideLen - 1))) {
                if ((msb_index - 1) >= 0 && (filter_lower_wall & (1 << (msb_index - 1))) != 0) { // important: (msb_index - 1) >= 0, since 1<<(-1) is the same as 1<<7 if the mask leng is 8
                    // console.log(`other_root ${other_root}`)
                    // console.log(`other_leaf ${other_leaf}`)

                    let temp = Object.assign({}, option)
                    temp.other_root = other_root
                    temp.other_leaf = other_leaf
                    temp.connect_before_this_node = (temp.other_leaf + gameBoardSideLen),

                        res_options[walls.LOWER].push(temp)
                }
                filter_lower_wall = clear_bit(filter_lower_wall, 1 << msb_index)
                filter_lower_wall = clear_bit(filter_lower_wall, 1 << (msb_index - 1))
                // printBinString(filter_lower_wall)

            } else {
                filter_lower_wall = clear_bit(filter_lower_wall, 1 << msb_index)
                // printBinString(filter_lower_wall)
            }
        }



        return found

    }

    const rigth_Transposed_wall_calc = (section_index, found) => {
        // READ the comments inside "left_Transposed_wall_calc" since this is almost the same idea 


        let this_T_section = this_T_mask[section_index]
        let this_T_next_section = this_T_mask[section_index + 1]

        let other_T_section = other_T_mask[section_index]

        let this_T_mask_shifted = this_T_section >>> gameBoardSideLen
        let next_T_n_bits = this_T_next_section ? (this_T_next_section & ((1 << gameBoardSideLen) - 1)) : 0
        this_T_mask_shifted |= (next_T_n_bits << (BITS_PER_SECTION - gameBoardSideLen))
        let filter_T_right_wall = other_T_section & this_T_mask_shifted

        while (filter_T_right_wall > 0 && !found) {

            /* if the node actaul value is 58, then msb_T_index is 23 */
            let msb_T_index = msb_u32(filter_T_right_wall)

            // add "(section_index * BITS_PER_SECTION )" to get the Transposed node value.
            /* if the node actaul value is 58, then msb_T_value is 23 = 23 + (0 * 24) */
            let msb_T_value = msb_T_index + (section_index * BITS_PER_SECTION)
            /* if the node actaul value is 58, then msb_T_x is 2   msb_T_x can has a range [0,2] iff the NR_OF_SECTIONS is 3*/
            let msb_T_x = floor(msb_T_value / gameBoardSideLen)
            /* if the node actaul value is 58, then msb_T_y is 7   msb_T_y can has a range [0,7]*/
            let msb_T_y = (msb_T_value % gameBoardSideLen)

            /* if the node actaul value is 58, then msb_node_value is 58 */
            let msb_node_value = msb_T_x + (msb_T_y * gameBoardSideLen)

            // Note (other_T_x_is_even =>(23.x = 2)_is_even) is NOT eq to  (msb_T_value_is_even => (23)_is_even), and also NOT eq to actaul node value (58)_is_even
            let other_T_x_is_even = (msb_T_x % 2) == 0

            /* if the node actaul value is 58, then other_root is 58  other_root is 50*/
            let other_root = other_T_x_is_even ? msb_node_value : (msb_node_value - gameBoardSideLen)
            let other_leaf = other_T_x_is_even ? (msb_node_value - gameBoardSideLen) : msb_node_value

            // since other_root.x is always even when connecteing with right wall
            // Note (other_root_x_is_even =>(58.x)_is_even) is NOT eq to actaul node value (58)_is_even
            let other_root_x_is_even = (floor(other_root / gameBoardSideLen)) % 2 == 0
            let is_other_root_leaf_same_col = ((other_root) % gameBoardSideLen) == ((other_leaf) % gameBoardSideLen)

            if (is_other_root_leaf_same_col && other_root_x_is_even && (msb_T_x >= 1 && msb_T_x <= (gameBoardSideLen - 1))) {
                if ((msb_T_index - 1) >= 0 && (filter_T_right_wall & (1 << (msb_T_index - 1))) != 0) { // important: (msb_T_index - 1) >= 0, since 1<<(-1) is the same as 1<<7 if the mask leng is 8
                    // console.log(`other_root ${other_root}`)
                    // console.log(`other_leaf ${other_leaf}`)

                    let temp = Object.assign({}, option)
                    temp.other_root = other_root
                    temp.other_leaf = other_leaf
                    temp.connect_before_this_node = (temp.other_leaf - 1)

                    res_options[walls.RIGHT].push(temp)
                }
                filter_T_right_wall = clear_bit(filter_T_right_wall, 1 << msb_T_index)
                filter_T_right_wall = clear_bit(filter_T_right_wall, 1 << (msb_T_index - 1))
                // printBinString(filter_T_right_wall)

            } else {
                filter_T_right_wall = clear_bit(filter_T_right_wall, 1 << msb_T_index)
                // printBinString(filter_T_right_wall)
            }
        }

        return found

    }


    let found = false

    for (let i = 0; i < (other_mask.length); i++) { //  && !found

        found = upper_wall_calc(i, found)
        found = left_Transposed_wall_calc(i, found)
        found = lower_wall_calc(i, found)
        found = rigth_Transposed_wall_calc(i, found)
    }


    console.log('walls.UPPER')
    console.log(res_options[walls.UPPER].length)
    res_options[walls.UPPER].forEach(op => console.log(op))
    console.log(`\n`)
    console.log('walls.LOWER')
    console.log(res_options[walls.LOWER].length)
    res_options[walls.LOWER].forEach(op => console.log(op))
    console.log(`\n`)
    console.log(res_options[walls.LEFT].length)
    console.log('walls.LEFT')
    res_options[walls.LEFT].forEach(op => console.log(op))
    console.log(`\n`)
    console.log('walls.RIGHT')
    console.log(res_options[walls.RIGHT].length)
    res_options[walls.RIGHT].forEach(op => console.log(op))

}


spliceCyclicOtherOptions_bitwise_v2()

