import { gridSideLen, totalNrOfCells } from "./gameBoard"
const floor = Math.floor
const ceil = Math.ceil

/*********************************************************** */
//       constants used just in the Bitwise operations


// let sl = 1
// while (((sl + 1) * gridSideLen) < 30)
//   sl += 1
// // BITS_PER_SECTION must be multiple of gridSideLen and less than or eq 30
// const BITS_PER_SECTION = sl * gridSideLen
// const NR_OF_SECTIONS = ceil((totalNrOfCells) / BITS_PER_SECTION)



const MAX_USABLE_BITS = 32
let nr_of_rows_per_section = floor(MAX_USABLE_BITS / gridSideLen)
const BITS_PER_SECTION = nr_of_rows_per_section * gridSideLen
const NR_OF_SECTIONS = ceil((totalNrOfCells) / BITS_PER_SECTION)


console.log(`gridSideLen ${gridSideLen}`)
console.log(`BITS_PER_SECTION ${BITS_PER_SECTION}`)
console.log(`NR_OF_SECTIONS ${NR_OF_SECTIONS}`)
/*********************************************************** */



const calc_section_index = (node_value) => {
  // of the 64 bits of js number, we can only use 32 bits due to js number implementation, and that int is signed (Binary signed 2's complement).
  // If total nr of nodes is 8X8 = 64 nodes we need array with 2 int which have 32X2=64bits,
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

const calc_section_T_index = (node_value) => {
  // of the 64 bits of js number, we can only use 32 bits due to js number implementation, and that int is signed (Binary signed 2's complement).
  // If total nr of nodes is 8X8 = 64 nodes we need array with 2 int which have 32X2=64bits,
  // this is how the TRANSPOSED mask look like if we have max_usable_bits = 24 and totalNrOfCells = 64:
  //   section_indx=0          section_indx=1
  // 56|..|40|32|24|16|08|00       57|...|25|17|09|01

  // to set bit (bit_to_set) = 5:
  //     * section_indx = floor( (5 % 8)* 8/32 ) = 1
  //     * nr_of_shifts =  (  (5 % 8) * 8 + floor(5 / 8)  ) % 24 = 16
  //     * a[section_indx] |= (1 << nr_of_shifts) ==> a[1] |= (1 << 16)

  // let section_indx = floor(((node_value % gridSideLen) * gridSideLen) / BITS_PER_SECTION) +( floor(node_value/32) * Math.min(floor(gridSideLen/BITS_PER_SECTION) , 1))
  // let section_indx = floor((node_value % gridSideLen)  / (BITS_PER_SECTION/gridSideLen)) 
  let offset = gridSideLen > BITS_PER_SECTION ? 1 : 0
  let section_indx = floor((node_value % gridSideLen) / (BITS_PER_SECTION / gridSideLen)) + (floor(node_value / (BITS_PER_SECTION * gridSideLen)) * offset)
  let x_T = (node_value % gridSideLen)
  let y_T = floor(node_value / gridSideLen)
  let nr_of_shifts = ((x_T * gridSideLen) + y_T) % BITS_PER_SECTION;
  return { section_indx, nr_of_shifts }
}

const msb_uint32 = (n) => {
  if (n <= 0) return NaN;

  // Remember that: this will return the mostSignificantBit positoin, where the indexing is Zero-based... i.e. msg(5) is 2
  const bval = [0, 1, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4]

  let base = 0;
  if (n & 0xFFFF0000) { base += 32 / 2; n >>= 32 / 2; }
  if (n & 0x0000FF00) { base += 32 / 4; n >>= 32 / 4; }
  if (n & 0x000000F0) { base += 32 / 8; n >>= 32 / 8; }
  return (base + bval[n]) - 1; // to make the return value Zero-based index
}

const msb = (n) => {
  let r = 0
  while (n >>>= 1) {
    r++;
  }
  return r
}


const clear_bit = (nr, bit_index) => {
  nr = nr & ~(1 << bit_index)
  return nr
}


const clear_multiple_bits = (nr, bits_to_clear_mask) => {
  // nr = 31 => 11111
  // to clear the bits with index 0 and 3 simultaneously to get the res : 11010
  // clear_bit( 31 , 5) becouse 5 in bin is 00101
  // set bool = true to set the bit with index bit_index, or false to clear it
  nr ^= (-false ^ nr) & bits_to_clear_mask // this will set the specified bits if we use   nr ^= (-true ^ nr) & bit_index
  return nr
}

const printBinString = (n, msg = "") => {
  // n must be between (-2^31) -2147483648 and ((2^31)-1) 2147483647
  for (var nFlag = 0, nShifted = n, sMask = ""; nFlag < 32;
    nFlag++, sMask += String(nShifted >>> 31), nShifted <<= 1);
  console.log(`${msg} ${sMask}`)
}






/*******************************count_ones functions with diff algorithms******************************* */


/*------------------ count_ones_lookup_table is the fastest ------------------ */
var BitsSetTable256 = []
BitsSetTable256[0] = 0
for (let i = 0; i < 256; i++) {
  BitsSetTable256[i] = (i & 1) + BitsSetTable256[floor(i / 2)]
}
const count_ones_lookup_table = (n) => {
  /*
    for TEST_SAMPLE with 1000 path, each has avg path length between [gridSideLen .. 4 x gridSideLen], and ITERATIONS_NR = 1000000
    my_find_index using count_ones_lookup_table took 8049 ms.
    array.findIndex took                             5536 ms.
  */
  let c = BitsSetTable256[n & 0xff]
  c += BitsSetTable256[(n >>> 8) & 0xff]
  c += BitsSetTable256[(n >>> 16) & 0xff]
  c += BitsSetTable256[n >>> 24];
  // console.log(c)
  return c
}
/*------------------------------------------------------------------------------ */


const count_ones_kernighan = (n) => {
  /*    
    for TEST_SAMPLE with 1000 path, each has avg path length between [gridSideLen .. 4 x gridSideLen], and ITERATIONS_NR = 1000000
    my_find_index using count_ones_kernighan took 8302 ms.
    path.findIndex took                           5320 ms.
  */

  let ones = 0;
  while (n > 0) {
    n = n & (n - 1);
    ones += 1;
  }
  return ones
}



const count_ones_hybrid_parallel = (n) => {
  /*
    for TEST_SAMPLE with 1000 path, each has avg path length between [gridSideLen .. 4 x gridSideLen], and ITERATIONS_NR = 1000000
    my_find_index using count_ones_hybrid_parallel took 11641 ms.
    array.findIndex took                                 5591 ms.
  */

  n = n - ((n >> 1) & 0x55555555);                    // reuse input as temporary
  n = (n & 0x33333333) + ((n >> 2) & 0x33333333);     // temp
  let c = ((n + (n >> 4) & 0xF0F0F0F) * 0x1010101) >> 24; // count
  // console.log(c)
  return c
}

const count_ones_parallel = (n) => {
  /*
    for TEST_SAMPLE with 1000 path, each has avg path length between [gridSideLen .. 4 x gridSideLen], and ITERATIONS_NR = 1000000
    my_find_index using count_ones_parallel took  12980 ms.
    array.findIndex took                           5500 ms.
  */

  const S = [1, 2, 4, 8, 16] // Magic Binary Numbers
  const B = [0x55555555, 0x33333333, 0x0F0F0F0F, 0x00FF00FF, 0x0000FFFF]

  let c = n - ((n >> 1) & B[0])
  c = ((c >> S[1]) & B[1]) + (c & B[1])
  c = ((c >> S[2]) + c) & B[2]
  c = ((c >> S[3]) + c) & B[3]
  c = ((c >> S[4]) + c) & B[4]
  // console.log(c)
  return c

}


const count_ones = count_ones_lookup_table
/************************************************************************************ */



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

    prev = node.value
  })

  return index_matrix_mask
}



const my_find_index = (nodeValue, index_matrix_mask) => {

  let { section_indx, nr_of_shifts } = calc_section_index(nodeValue)

  let index = -1
  let prev_masks_ones = 0


  index_matrix_mask.some((mask, vec_ind) => {

    let b = mask[section_indx] & (1 << nr_of_shifts)

    if (b) {
      index = prev_masks_ones

      index_matrix_mask[vec_ind].some((section, i) => {
        index += count_ones(section)
        return i == section_indx
      })

      // Since all the bits in this sections is counted and required "index" is supposed to be eq to how many set-bits are BEFORE this, then subtract the set-bits that are most significant until and including this bit  
      let temp = mask[section_indx] >>> nr_of_shifts
      index -= count_ones(temp)

    } else {
      mask.forEach((section) => prev_masks_ones += count_ones(section))
    }

    return b
  })

  return index
}








export {
  BITS_PER_SECTION,
  NR_OF_SECTIONS,
  calc_section_index,
  calc_section_T_index,
  msb,
  clear_bit,
  count_ones,
  gen_indexing_matrix_mask,
  my_find_index,
  printBinString
}