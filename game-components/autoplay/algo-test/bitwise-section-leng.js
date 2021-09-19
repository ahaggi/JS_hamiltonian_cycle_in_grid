import { calc_section_T_index } from "../bitwise-help-functions"
import { gridSideLen } from "../gameBoard"

const what_most_usable_bits_for_given_sideleng = ()=>{
  for (let i = 32; i < 100; i += 2) {
    let found = false
    for (let j = 32; j > 0 && !found; j--) {
      if (i % j == 0) {
        found = true
        console.log(`gridSideLen ${i}  ,  BITS_PER_SECTION ${j} ,  NR_OF_SECTIONS ${i * i / j}`)
      }
    }
  }
  
  /**  prints the flwg res:
         gridSideLen 32  ,  BITS_PER_SECTION 32 ,  NR_OF_SECTIONS 32
          gridSideLen 34  ,  BITS_PER_SECTION 17 ,  NR_OF_SECTIONS 68
          gridSideLen 36  ,  BITS_PER_SECTION 18 ,  NR_OF_SECTIONS 72
          gridSideLen 38  ,  BITS_PER_SECTION 19 ,  NR_OF_SECTIONS 76
          gridSideLen 40  ,  BITS_PER_SECTION 20 ,  NR_OF_SECTIONS 80
          gridSideLen 42  ,  BITS_PER_SECTION 21 ,  NR_OF_SECTIONS 84
          gridSideLen 44  ,  BITS_PER_SECTION 22 ,  NR_OF_SECTIONS 88
          gridSideLen 46  ,  BITS_PER_SECTION 23 ,  NR_OF_SECTIONS 92
          gridSideLen 48  ,  BITS_PER_SECTION 24 ,  NR_OF_SECTIONS 96
          gridSideLen 50  ,  BITS_PER_SECTION 25 ,  NR_OF_SECTIONS 100
          gridSideLen 52  ,  BITS_PER_SECTION 26 ,  NR_OF_SECTIONS 104
          gridSideLen 54  ,  BITS_PER_SECTION 27 ,  NR_OF_SECTIONS 108
          gridSideLen 56  ,  BITS_PER_SECTION 28 ,  NR_OF_SECTIONS 112
          gridSideLen 58  ,  BITS_PER_SECTION 29 ,  NR_OF_SECTIONS 116
          gridSideLen 60  ,  BITS_PER_SECTION 30 ,  NR_OF_SECTIONS 120
          gridSideLen 62  ,  BITS_PER_SECTION 31 ,  NR_OF_SECTIONS 124
          gridSideLen 64  ,  BITS_PER_SECTION 32 ,  NR_OF_SECTIONS 128    <--- efficient ok until here
          gridSideLen 66  ,  BITS_PER_SECTION 22 ,  NR_OF_SECTIONS 198
          gridSideLen 68  ,  BITS_PER_SECTION 17 ,  NR_OF_SECTIONS 272
          gridSideLen 70  ,  BITS_PER_SECTION 14 ,  NR_OF_SECTIONS 350
          gridSideLen 72  ,  BITS_PER_SECTION 24 ,  NR_OF_SECTIONS 216
          gridSideLen 74  ,  BITS_PER_SECTION 2 ,  NR_OF_SECTIONS 2738    <--- Not so efficient here
          gridSideLen 76  ,  BITS_PER_SECTION 19 ,  NR_OF_SECTIONS 304
          gridSideLen 78  ,  BITS_PER_SECTION 26 ,  NR_OF_SECTIONS 234
          gridSideLen 80  ,  BITS_PER_SECTION 20 ,  NR_OF_SECTIONS 320
          gridSideLen 82  ,  BITS_PER_SECTION 2 ,  NR_OF_SECTIONS 3362
          gridSideLen 84  ,  BITS_PER_SECTION 28 ,  NR_OF_SECTIONS 252
          gridSideLen 86  ,  BITS_PER_SECTION 2 ,  NR_OF_SECTIONS 3698
          gridSideLen 88  ,  BITS_PER_SECTION 22 ,  NR_OF_SECTIONS 352
          gridSideLen 90  ,  BITS_PER_SECTION 30 ,  NR_OF_SECTIONS 270
          gridSideLen 92  ,  BITS_PER_SECTION 23 ,  NR_OF_SECTIONS 368
          gridSideLen 94  ,  BITS_PER_SECTION 2 ,  NR_OF_SECTIONS 4418
          gridSideLen 96  ,  BITS_PER_SECTION 32 ,  NR_OF_SECTIONS 288
          gridSideLen 98  ,  BITS_PER_SECTION 14 ,  NR_OF_SECTIONS 686
  
         gridSideLen 32  ,  BITS_PER_SECTION 32
          gridSideLen 34  ,  BITS_PER_SECTION 17
          gridSideLen 36  ,  BITS_PER_SECTION 18
          gridSideLen 38  ,  BITS_PER_SECTION 19
          gridSideLen 40  ,  BITS_PER_SECTION 20
          gridSideLen 42  ,  BITS_PER_SECTION 21
          gridSideLen 44  ,  BITS_PER_SECTION 22
          gridSideLen 46  ,  BITS_PER_SECTION 23
          gridSideLen 48  ,  BITS_PER_SECTION 24
          gridSideLen 50  ,  BITS_PER_SECTION 25
          gridSideLen 52  ,  BITS_PER_SECTION 26
          gridSideLen 54  ,  BITS_PER_SECTION 27
          gridSideLen 56  ,  BITS_PER_SECTION 28
          gridSideLen 58  ,  BITS_PER_SECTION 29
          gridSideLen 60  ,  BITS_PER_SECTION 30
          gridSideLen 62  ,  BITS_PER_SECTION 31
          gridSideLen 64  ,  BITS_PER_SECTION 32  <--- efficient ok until here
          gridSideLen 66  ,  BITS_PER_SECTION 22
          gridSideLen 68  ,  BITS_PER_SECTION 17
          gridSideLen 70  ,  BITS_PER_SECTION 14
          gridSideLen 72  ,  BITS_PER_SECTION 24
          gridSideLen 74  ,  BITS_PER_SECTION 2    <--- Not so efficient here
          gridSideLen 76  ,  BITS_PER_SECTION 19
          gridSideLen 78  ,  BITS_PER_SECTION 26
          gridSideLen 80  ,  BITS_PER_SECTION 20
          gridSideLen 82  ,  BITS_PER_SECTION 2
          gridSideLen 84  ,  BITS_PER_SECTION 28
          gridSideLen 86  ,  BITS_PER_SECTION 2
          gridSideLen 88  ,  BITS_PER_SECTION 22
          gridSideLen 90  ,  BITS_PER_SECTION 30
          gridSideLen 92  ,  BITS_PER_SECTION 23
          gridSideLen 94  ,  BITS_PER_SECTION 2
          gridSideLen 96  ,  BITS_PER_SECTION 32
          gridSideLen 98  ,  BITS_PER_SECTION 14
   */
  
}

const visualize_the_path_mask = () => {
  const arr = Array.from({ length: (gridSideLen) }, () => Array(gridSideLen).fill(0))
  const mask_sec_ind = Array.from({ length: (gridSideLen) }, () => Array(gridSideLen).fill(0))
  const mask_nr_of_sh = Array.from({ length: (gridSideLen) }, () => Array(gridSideLen).fill(0))


  for (let x = 0; x < gridSideLen; x++) {

    for (let y = 0; y < gridSideLen; y++) {
      let nodeValue = x * gridSideLen + y
      arr[x][y] = nodeValue

      let { section_indx, nr_of_shifts } = calc_section_index(nodeValue)
      // let { section_indx, nr_of_shifts } = calc_section_T_index(nodeValue)

      mask_sec_ind[x][y] = section_indx
      mask_nr_of_sh[x][y] = nr_of_shifts

    }
  }

  console.log(arr)
  console.log(mask_sec_ind)
  console.log(mask_nr_of_sh)

}


// what_most_usable_bits_for_given_sideleng()

// visualize_the_path_mask()