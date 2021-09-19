

/**
 * All the functions in this file will ONLY be used by the function subgraph.spliceCyclicOtherOptions_Bitwise 
*/

import { gridSideLen } from "../grid"
import { BITS_PER_SECTION, SECTIONS_PER_ROW, msb, clear_bit, } from "./bitwise-help-functions"

const floor = Math.floor


/******************************************************************************************************************************** */
// The folowing functions will be excuted when its more effiecent to compare 2 graphs by rows,, i.e. (gridSideLen is gt or eq to BITS_PER_SECTION)
// This means that to represent 1 row we need multiple sections,, unless (gridSideLen is eq to BITS_PER_SECTION) then its 1:1

const get_left_shifted_filter_by_row = (this_path_mask, other_path_mask, section_index) => {
    let curr_section = this_path_mask[section_index - SECTIONS_PER_ROW]
    let other_curr_section = other_path_mask[section_index]

    let filter_mask = curr_section & other_curr_section
    return filter_mask

}

const get_right_shifted_filter_by_row = (this_path_mask, other_path_mask, section_index) => {
    let curr_section = this_path_mask[section_index + SECTIONS_PER_ROW]
    let other_curr_section = other_path_mask[section_index]

    let filter_mask = curr_section & other_curr_section
    return filter_mask

}



const calc_pivots_other_to_this_upper_wall_by_row = (row_index, _this, _other) => {


    //Left shifting the "this .path_mask[0]"
    // 15  14  13  12  11  10  09  08  07  06  05  04  03  02  01  00  **  **  **  **  **  **  **  ** <-- _this.subgraph been left-shifted added dummy first n bits in this subgraph   
    // 23  22  21  20  19  18  17  16  15  14  13  12  11  10  09  08  07  06  05  04  03  02  01  00 <-- OTHER IS CYCLIC

    let found = false
    let option = null
    let filters_upper_wall_arr = []

    for (let si = 0; si < SECTIONS_PER_ROW; si++) {
        let section_index = si + (row_index * SECTIONS_PER_ROW)
        let filter_upper_wall = get_left_shifted_filter_by_row(_this.path_mask, _other.path_mask, section_index)
        filters_upper_wall_arr.push(filter_upper_wall)
    }


    for (let si = filters_upper_wall_arr.length - 1; si >= 0 && !found; si--) {

        let filter_upper_wall = filters_upper_wall_arr[si];
        let section_index = si + (row_index * SECTIONS_PER_ROW)

        while (filter_upper_wall !== 0 && !found) {

            let msb_index = msb(filter_upper_wall)

            // add "(section_index * BITS_PER_SECTION )" to get the aqtual node value.
            let msb_node_value = msb_index + (section_index * BITS_PER_SECTION)

            let other_x = floor(msb_node_value / gridSideLen)
            let other_x_is_even = (other_x % 2) == 0

            let other_root = other_x_is_even ? (msb_node_value - 1) : msb_node_value
            let other_leaf = other_x_is_even ? msb_node_value : (msb_node_value - 1)

            // since root.y is always even when connecteing with upper wall
            let other_root_y_is_even = other_root % 2 == 0 // this is eq to (msb_node_value % gridSideLen) % 2 == 0
            let is_other_root_leaf_same_row = floor(other_leaf / gridSideLen) == floor(other_root / gridSideLen)

            if (is_other_root_leaf_same_row && other_root_y_is_even) {
                if (
                    ((msb_index > 0) && (filter_upper_wall & (1 << (msb_index - 1))) != 0) ||               // if msb_index is gt 0, check if the adjecent bit is_set 
                    ((msb_index == 0) && (filters_upper_wall_arr[si - 1] & (1 << (BITS_PER_SECTION - 1))) != 0) // if msb_index is eq 0, check if the (most_sig_bit in the next section) is_set,, this is to cover the case where the potential (root and leaf) are adjecent BUT mapped into diff sections
                ) {

                    let connect_before_this_node = other_leaf - gridSideLen
                    let insert_other_at_index = _this.getNodeLocalIndex(connect_before_this_node)
                    let other_new_root_index = _other.getNodeLocalIndex(other_root)

                    if (_this.isValidPivotIndex(insert_other_at_index) && _other.isValidPivotIndex(_other.getNodeLocalIndex(other_root))) { //
                        option = Object.assign({}, Option)
                        option.other_root = other_root
                        option.other_leaf = other_leaf
                        option.other_new_root_index = other_new_root_index
                        option.insert_other_at_index = insert_other_at_index
                        found = true
                        // console.log(`other_root ${other_root}  other_leaf ${other_leaf}  connect_before_this_node ${connect_before_this_node}  insert_other_at_index ${option.insert_other_at_index}`)
                    }
                }
                filter_upper_wall = clear_bit(filter_upper_wall, msb_index)
            } else {
                filter_upper_wall = clear_bit(filter_upper_wall, msb_index)
            }
        }


    }


    return option

}

const calc_pivots_other_to_this_left_T_wall_by_row = (row_index, _this, _other) => {


    //Left shifting the "this .path_T_mask[0]"
    // 57  49  41  33  25  17  09  01  56  48  40  32  24  16  08  00  **  **  **  **  **  **  **  ** <-- _this.subgraph been left-shifted added dummy first n bits in this subgraph   
    // 58  50  42  34  26  18  10  02  57  49  41  33  25  17  09  01  56  48  40  32  24  16  08  00 <-- OTHER IS CYCLIC
    let found = false
    let option = null
    let filters_T_left_wall_arr = []

    for (let si = 0; si < SECTIONS_PER_ROW; si++) {
        let section_index = si + (row_index * SECTIONS_PER_ROW)
        let filter_T_left_wall = get_left_shifted_filter_by_row(_this.path_T_mask, _other.path_T_mask, section_index)
        filters_T_left_wall_arr.push(filter_T_left_wall)
    }

    for (let si = filters_T_left_wall_arr.length - 1; si >= 0 && !found; si--) {

        let filter_T_left_wall = filters_T_left_wall_arr[si];
        let section_index = si + (row_index * SECTIONS_PER_ROW)

        while (filter_T_left_wall !== 0 && !found) {

            /* if the node actaul value is 58, then msb_T_index is 23 */
            let msb_T_index = msb(filter_T_left_wall)

            // add "(section_index * BITS_PER_SECTION )" to get the T node value.
            /* if the node actaul value is 58, then msb_T_value is 23 = 23 + (0 * 24) */
            let msb_T_value = msb_T_index + (section_index * BITS_PER_SECTION)
            /* if the node actaul value is 58, then msb_T_x is 2   msb_T_x can has a range [0,2] iff the NR_OF_SECTIONS is 3*/
            let msb_T_x = floor(msb_T_value / gridSideLen)
            /* if the node actaul value is 58, then msb_T_y is 7   msb_T_y can has a range [0,7]*/
            let msb_T_y = (msb_T_value % gridSideLen)

            /* if the node actaul value is 58, then msb_node_value is 58 */
            let msb_node_value = msb_T_x + (msb_T_y * gridSideLen)

            // Note (other_T_x_is_even =>(23.x = 2)_is_even) is NOT eq to  (msb_T_value_is_even => (23)_is_even), and also NOT eq to actaul node value (58)_is_even
            let other_T_x_is_even = (msb_T_x % 2) == 0

            /* if the node actaul value is 58, then other_root is 58  other_leaf is 50*/
            let other_root = other_T_x_is_even ? msb_node_value : (msb_node_value - gridSideLen)
            let other_leaf = other_T_x_is_even ? (msb_node_value - gridSideLen) : msb_node_value

            // since other_root.x is always odd when connecteing with left wall
            // Note (other_root_x_is_even =>(58.x)_is_even) is NOT eq to actaul node value (58)_is_even
            let other_root_x_is_even = (floor(other_root / gridSideLen)) % 2 == 0
            let is_other_root_leaf_same_col = ((other_root) % gridSideLen) == ((other_leaf) % gridSideLen)

            if (is_other_root_leaf_same_col && !other_root_x_is_even) {

                if (

                    ((msb_T_index > 0) && (filter_T_left_wall & (1 << (msb_T_index - 1))) != 0) ||               // if msb_T_index is gt 0, check if the adjecent bit is_set 
                    ((msb_T_index == 0) && (filters_T_left_wall_arr[si - 1] & (1 << (BITS_PER_SECTION - 1))) != 0)   // if msb_T_index is eq 0, check if the (most_sig_bit in the next section) is_set,, this is to cover the case where the potential (root and leaf) are adjecent BUT mapped into diff sections
                ) {

                    let connect_before_this_node = other_leaf - 1
                    let other_new_root_index = _other.getNodeLocalIndex(other_root)

                    let insert_other_at_index = _this.getNodeLocalIndex(connect_before_this_node)


                    if (_this.isValidPivotIndex(insert_other_at_index) && _other.isValidPivotIndex(_other.getNodeLocalIndex(other_root))) { //
                        option = Object.assign({}, Option)
                        option.other_root = other_root
                        option.other_leaf = other_leaf
                        option.other_new_root_index = other_new_root_index

                        option.insert_other_at_index = insert_other_at_index
                        found = true
                    }
                }
                filter_T_left_wall = clear_bit(filter_T_left_wall, msb_T_index)
            } else {
                filter_T_left_wall = clear_bit(filter_T_left_wall, msb_T_index)
            }
        }


    }


    return option

}

const calc_pivots_other_to_this_lower_wall_by_row = (row_index, _this, _other) => {

    // Right shifting the "this .path_mask[0]"
    // 15  14  13  12  11  10  09  08  07  06  05  04  03  02  01  00 <-- OTHER IS CYCLIC
    // 23  22  21  20  19  18  17  16  15  14  13  12  11  10  09  08 <-- _this.subgraph been right-shifted ignoring first n bits in this subgraph   

    let found = false
    let option = null

    let filters_lower_wall_arr = []

    for (let si = 0; si < SECTIONS_PER_ROW; si++) {
        let section_index = si + (row_index * SECTIONS_PER_ROW)
        let filter_lower_wall = get_right_shifted_filter_by_row(_this.path_mask, _other.path_mask, section_index)
        filters_lower_wall_arr.push(filter_lower_wall)
    }


    for (let si = filters_lower_wall_arr.length - 1; si >= 0 && !found; si--) {

        let filter_lower_wall = filters_lower_wall_arr[si];
        let section_index = si + (row_index * SECTIONS_PER_ROW)

        while (filter_lower_wall !== 0 && !found) {

            let msb_index = msb(filter_lower_wall)

            // add "(section_index * BITS_PER_SECTION )" to get the aqtual node value.
            let msb_node_value = msb_index + (section_index * BITS_PER_SECTION)

            let other_x = floor(msb_node_value / gridSideLen)
            let other_x_is_even = (other_x % 2) == 0

            let other_root = other_x_is_even ? (msb_node_value - 1) : msb_node_value
            let other_leaf = other_x_is_even ? msb_node_value : (msb_node_value - 1)

            // since root.y is always odd when connecteing with lower wall
            let other_root_y_is_even = other_root % 2 == 0 // this is eq to (msb_node_value % gridSideLen) % 2 == 0
            let is_other_root_leaf_same_row = floor(other_leaf / gridSideLen) == floor(other_root / gridSideLen)

            if (is_other_root_leaf_same_row && !other_root_y_is_even) {
                if (
                    ((msb_index > 0) && (filter_lower_wall & (1 << (msb_index - 1))) != 0) ||               // if msb_index is gt 0, check if the adjecent bit is_set 
                    ((msb_index == 0) && (filters_lower_wall_arr[si - 1] & (1 << (BITS_PER_SECTION - 1))) != 0) // if msb_index is eq 0, check if the (most_sig_bit in the next section) is_set,, this is to cover the case where the potential (root and leaf) are adjecent BUT mapped into diff sections
                ) {

                    let connect_before_this_node = other_leaf + gridSideLen
                    let other_new_root_index = _other.getNodeLocalIndex(other_root)
                    let insert_other_at_index = _this.getNodeLocalIndex(connect_before_this_node)


                    if (_this.isValidPivotIndex(insert_other_at_index) && _other.isValidPivotIndex(_other.getNodeLocalIndex(other_root))) { //
                        option = Object.assign({}, Option)
                        option.other_root = other_root
                        option.other_leaf = other_leaf
                        option.other_new_root_index = other_new_root_index
                        option.insert_other_at_index = insert_other_at_index
                        found = true

                    }
                }
                filter_lower_wall = clear_bit(filter_lower_wall, msb_index)
            } else {
                filter_lower_wall = clear_bit(filter_lower_wall, msb_index)
            }
        }


    }


    return option

}

const calc_pivots_other_to_this_rigth_T_wall_by_row = (row_index, _this, _other) => {
    // right shifting the "this .path_T_mask[0]"
    // 57  49  41  33  25  17  09  01  56  48  40  32  24  16  08  00 <-- OTHER IS CYCLIC
    // 58  50  42  34  26  18  10  02  57  49  41  33  25  17  09  01 <-- _this.subgraph been right-shifted added dummy first n bits in this subgraph   

    let found = false
    let option = null

    let filters_T_right_wall_arr = []

    for (let si = 0; si < SECTIONS_PER_ROW; si++) {
        let section_index = si + (row_index * SECTIONS_PER_ROW)
        let filter_T_right_wall = get_right_shifted_filter_by_row(_this.path_T_mask, _other.path_T_mask, section_index)
        filters_T_right_wall_arr.push(filter_T_right_wall)
    }

    for (let si = filters_T_right_wall_arr.length - 1; si >= 0 && !found; si--) {

        let filter_T_right_wall = filters_T_right_wall_arr[si];
        let section_index = si + (row_index * SECTIONS_PER_ROW)

        while (filter_T_right_wall !== 0 && !found) {

            /* if the node actaul value is 58, then msb_T_index is 23 */
            let msb_T_index = msb(filter_T_right_wall)

            // add "(section_index * BITS_PER_SECTION )" to get the Transposed node value.
            /* if the node actaul value is 58, then msb_T_value is 23 = 23 + (0 * 24) */
            let msb_T_value = msb_T_index + (section_index * BITS_PER_SECTION)
            /* if the node actaul value is 58, then msb_T_x is 2   msb_T_x can has a range [0,2] iff the NR_OF_SECTIONS is 3*/
            let msb_T_x = floor(msb_T_value / gridSideLen)
            /* if the node actaul value is 58, then msb_T_y is 7   msb_T_y can has a range [0,7]*/
            let msb_T_y = (msb_T_value % gridSideLen)

            /* if the node actaul value is 58, then msb_node_value is 58 */
            let msb_node_value = msb_T_x + (msb_T_y * gridSideLen)

            // Note (other_T_x_is_even =>(23.x = 2)_is_even) is NOT eq to  (msb_T_value_is_even => (23)_is_even), and also NOT eq to actaul node value (58)_is_even
            let other_T_x_is_even = (msb_T_x % 2) == 0

            /* if the node actaul value is 58, then other_root is 58  other_leaf is 50*/
            let other_root = other_T_x_is_even ? msb_node_value : (msb_node_value - gridSideLen)
            let other_leaf = other_T_x_is_even ? (msb_node_value - gridSideLen) : msb_node_value

            // since other_root.x is always even when connecteing with right wall
            // Note (other_root_x_is_even =>(58.x)_is_even) is NOT eq to actaul node value (58)_is_even
            let other_root_x_is_even = (floor(other_root / gridSideLen)) % 2 == 0
            let is_other_root_leaf_same_col = ((other_root) % gridSideLen) == ((other_leaf) % gridSideLen)

            if (is_other_root_leaf_same_col && other_root_x_is_even) {

                if (
                    ((msb_T_index > 0) && (filter_T_right_wall & (1 << (msb_T_index - 1))) != 0) ||               // if msb_T_index is gt 0, check if the adjecent bit is_set 
                    ((msb_T_index == 0) && (filters_T_right_wall_arr[si - 1] & (1 << (BITS_PER_SECTION - 1))) != 0)   // if msb_T_index is eq 0, check if the (most_sig_bit in the next section) is_set,, this is to cover the case where the potential (root and leaf) are adjecent BUT mapped into diff sections
                ) {

                    let connect_before_this_node = other_leaf + 1
                    let other_new_root_index = _other.getNodeLocalIndex(other_root)
                    let insert_other_at_index = _this.getNodeLocalIndex(connect_before_this_node)


                    if (_this.isValidPivotIndex(insert_other_at_index) && _other.isValidPivotIndex(_other.getNodeLocalIndex(other_root))) { //
                        option = Object.assign({}, Option)
                        option.other_root = other_root
                        option.other_leaf = other_leaf
                        option.other_new_root_index = other_new_root_index
                        option.insert_other_at_index = insert_other_at_index
                        found = true
                    }
                }
                filter_T_right_wall = clear_bit(filter_T_right_wall, msb_T_index)
            } else {
                filter_T_right_wall = clear_bit(filter_T_right_wall, msb_T_index)
            }
        }


    }


    return option

}
/******************************************************************************************************************************** */












/******************************************************************************************************************************** */
// The folowing functions will be excuted when its more effiecent to compare 2 graphs by section,, i.e. (gridSideLen is lt BITS_PER_SECTION)
// This means that to ONLY one section can represent multiple rows

const get_left_shifted_filter_by_section = (this_path_mask, other_path_mask, section_index) => {
    /**
     * To connenct other_path to the this left wall , the comparing should start from (2nd col in the "other_T_" subgraph) and (fst col of "this_T_" subgraph), 
     * which means the fst n-th bits in the "other.path_T_mask" should be ignored.
     * 
     * This could either be accoumplished via shifting either:
     *      -  left  shifting "this .path_T_mask[i]" by n bits, and copying the last n-bits from "this. path_T_mask[i-1]", where i = [0, BITS_PER_SECTION> and n = gridSideLen. OR,
     *      -  right shifting "other.path_T_mask[i]" by n bits, and copying the fst  n-bits from "other.path_T_mask[i+1]", where i = [0, BITS_PER_SECTION> and n = gridSideLen.
     * 
     * Left shifting the "this .path_T_mask[0]"
        // 57  49  41  33  25  17  09  01  56  48  40  32  24  16  08  00  **  **  **  **  **  **  **  ** <-- this.subgraph been left-shifted added dummy first n bits in this subgraph   
        // 58  50  42  34  26  18  10  02  57  49  41  33  25  17  09  01  56  48  40  32  24  16  08  00 <-- OTHER IS CYCLIC
    */


    /**
     * To connenct other_path to the this upper wall , the comparing should start from (2nd row in the "other" subgraph) and (fst row of "this" subgraph), 
     * which means the fst n-th bits in the "other" subgraph should be ignored.
     * 
     * This could either be accoumplished via shifting either:
     *      -  left  shifting "this .path_mask[i]" by n bits, and copying the last n-bits from "this. path_mask[i-1]", where i = [0, BITS_PER_SECTION> and n = gridSideLen. OR,
     *      -  right shifting "other.path_mask[i]" by n bits, and copying the fst  n-bits from "other.path_mask[i+1]", where i = [0, BITS_PER_SECTION> and n = gridSideLen.
     * 
     * Left shifting the "this .path_mask[0]"
        // 15  14  13  12  11  10  09  08  07  06  05  04  03  02  01  00  **  **  **  **  **  **  **  ** <-- this.subgraph been left-shifted added dummy first n bits in this subgraph   
        // 23  22  21  20  19  18  17  16  15  14  13  12  11  10  09  08  07  06  05  04  03  02  01  00 <-- OTHER IS CYCLIC
    */


    // console.log(`\n\n\n\n *************section_index ${section_index}*********************`)
    let curr_section = this_path_mask[section_index]
    let prev_section = this_path_mask[section_index - 1]

    let prev_n_bits = prev_section ? (prev_section >>> (BITS_PER_SECTION - gridSideLen)) : 0
    // printBinString(curr_section, "curr_section")
    // printBinString(prev_n_bits, "prev_n_bits")

    let curr_section_shifted = (curr_section & ((1 << (BITS_PER_SECTION - gridSideLen)) - 1)) << gridSideLen
    curr_section_shifted |= prev_n_bits
    // printBinString(curr_section_shifted, "curr_section_shifted")

    let other_curr_section = other_path_mask[section_index]
    // printBinString(other_curr_section, "other_curr_section")

    let filter_mask = curr_section_shifted & other_curr_section
    // printBinString(filter_mask, "filter_mask")
    return filter_mask

}

const get_right_shifted_filter_by_section = (this_path_mask, other_path_mask, section_index) => {
    /**
     * To connenct other_path to the this lower wall, the comparing should start from (2nd row in the "this" subgraph) and (fst row of "other" subgraph), 
     * which means the fst n-th bits in the "this" subgraph should be ignored.
     * 
     * This could either be accoumplished via shifting either:
     *      -  left  shifting "other.path_mask[i]" by n bits, and copying the last n-bits from "other.path_mask[i-1]", where i = [0, BITS_PER_SECTION> and n = gridSideLen. OR,
     *      -  right shifting "this .path_mask[i]" by n bits, and copying the fst  n-bits from "this .path_mask[i+1]", where i = [0, BITS_PER_SECTION> and n = gridSideLen.
     * 
     * Right shifting the "this .path_mask[0]"
        15  14  13  12  11  10  09  08  07  06  05  04  03  02  01  00 <-- OTHER IS CYCLIC
        23  22  21  20  19  18  17  16  15  14  13  12  11  10  09  08 <-- this.subgraph been right-shifted ignoring first n bits in this subgraph   
     */

    /**
     * To connenct other_path to the this right wall, the comparing should start from (2nd col in the "other" subgraph) and (fst col of "this" subgraph), 
     * which means the fst n-th bits in the "other.path_T_mask" should be ignored.
     * 
     * This could either be accoumplished via shifting either:
     *      -  left  shifting "other.path_T_mask[i]" by n bits, and copying the last n-bits from "other.path_T_mask[i-1]", where i = [0, BITS_PER_SECTION> and n = gridSideLen. OR,
     *      -  right shifting "this. path_T_mask[i]" by n bits, and copying the fst  n-bits from "this. path_T_mask[i+1]", where i = [0, BITS_PER_SECTION> and n = gridSideLen.
     * 
     * right shifting the "this .path_T_mask[0]"
        57  49  41  33  25  17  09  01  56  48  40  32  24  16  08  00 <-- OTHER IS CYCLIC
        58  50  42  34  26  18  10  02  57  49  41  33  25  17  09  01 <-- this.subgraph been right-shifted added dummy first n bits in this subgraph   
    */

    // console.log(`\n\n\n\n *************section_index ${section_index}*********************`)

    let curr_section = this_path_mask[section_index]
    let next_section = this_path_mask[section_index + 1]

    let next_n_bits = next_section ? (next_section & ((1 << gridSideLen) - 1)) : 0
    // printBinString(curr_section, "curr_section")
    // printBinString(next_n_bits, "next_n_bits")

    let curr_section_shifted = curr_section >>> gridSideLen
    curr_section_shifted |= (next_n_bits << (BITS_PER_SECTION - gridSideLen))
    // printBinString(curr_section_shifted, "curr_section_shifted")

    let other_curr_section = other_path_mask[section_index]
    // printBinString(other_curr_section, "other_curr_section")

    let filter_mask = curr_section_shifted & other_curr_section
    // printBinString(filter_mask, "filter_mask")
    return filter_mask
}



const calc_pivots_other_to_this_upper_wall_by_section = (section_index, _this, _other) => {


    //Left shifting the "this .path_mask[0]"
    // 15  14  13  12  11  10  09  08  07  06  05  04  03  02  01  00  **  **  **  **  **  **  **  ** <-- _this.subgraph been left-shifted added dummy first n bits in this subgraph   
    // 23  22  21  20  19  18  17  16  15  14  13  12  11  10  09  08  07  06  05  04  03  02  01  00 <-- OTHER IS CYCLIC

    let found = false
    let option = null

    let filter_upper_wall = get_left_shifted_filter_by_section(_this.path_mask, _other.path_mask, section_index)
    while (filter_upper_wall !== 0 && !found) {

        let msb_index = msb(filter_upper_wall)

        // add "(section_index * BITS_PER_SECTION )" to get the aqtual node value.
        let msb_node_value = msb_index + (section_index * BITS_PER_SECTION)

        let other_x = floor(msb_node_value / gridSideLen)
        let other_x_is_even = (other_x % 2) == 0

        let other_root = other_x_is_even ? (msb_node_value - 1) : msb_node_value
        let other_leaf = other_x_is_even ? msb_node_value : (msb_node_value - 1)

        // since root.y is always even when connecteing with upper wall
        let other_root_y_is_even = other_root % 2 == 0 // this is eq to (msb_node_value % gridSideLen) % 2 == 0
        let is_other_root_leaf_same_row = floor(other_leaf / gridSideLen) == floor(other_root / gridSideLen)

        if (is_other_root_leaf_same_row && other_root_y_is_even) {
            if ((msb_index - 1) >= 0 && (filter_upper_wall & (1 << (msb_index - 1))) != 0) { // important: (msb_index - 1) >= 0, since 1<<(-1) is the same as 1<<7 if the mask leng is 8

                let connect_before_this_node = other_leaf - gridSideLen
                let insert_other_at_index = _this.getNodeLocalIndex(connect_before_this_node)
                let other_new_root_index = _other.getNodeLocalIndex(other_root)

                if (_this.isValidPivotIndex(insert_other_at_index) && _other.isValidPivotIndex(_other.getNodeLocalIndex(other_root))) { //
                    option = Object.assign({}, Option)
                    option.other_root = other_root
                    option.other_leaf = other_leaf
                    option.other_new_root_index = other_new_root_index
                    option.insert_other_at_index = insert_other_at_index
                    found = true
                    // console.log(`other_root ${other_root}  other_leaf ${other_leaf}  connect_before_this_node ${connect_before_this_node}  insert_other_at_index ${option.insert_other_at_index}`)
                }
            }
            filter_upper_wall = clear_bit(filter_upper_wall, msb_index)
            filter_upper_wall = clear_bit(filter_upper_wall, (msb_index - 1))
        } else {
            filter_upper_wall = clear_bit(filter_upper_wall, msb_index)
        }
    }

    return option

}

const calc_pivots_other_to_this_left_T_wall_by_section = (section_index, _this, _other) => {

    //Left shifting the "this .path_T_mask[0]"
    // 57  49  41  33  25  17  09  01  56  48  40  32  24  16  08  00  **  **  **  **  **  **  **  ** <-- this.subgraph been left-shifted added dummy first n bits in this subgraph   
    // 58  50  42  34  26  18  10  02  57  49  41  33  25  17  09  01  56  48  40  32  24  16  08  00 <-- OTHER IS CYCLIC
    let found = false
    let option = null
    let filter_T_left_wall = get_left_shifted_filter_by_section(_this.path_T_mask, _other.path_T_mask, section_index)


    while (filter_T_left_wall !== 0 && !found) {

        /* if the node actaul value is 58, then msb_T_index is 23 */
        let msb_T_index = msb(filter_T_left_wall)

        // add "(section_index * BITS_PER_SECTION )" to get the T node value.
        /* if the node actaul value is 58, then msb_T_value is 23 = 23 + (0 * 24) */
        let msb_T_value = msb_T_index + (section_index * BITS_PER_SECTION)
        /* if the node actaul value is 58, then msb_T_x is 2   msb_T_x can has a range [0,2] iff the NR_OF_SECTIONS is 3*/
        let msb_T_x = floor(msb_T_value / gridSideLen)
        /* if the node actaul value is 58, then msb_T_y is 7   msb_T_y can has a range [0,7]*/
        let msb_T_y = (msb_T_value % gridSideLen)

        /* if the node actaul value is 58, then msb_node_value is 58 */
        let msb_node_value = msb_T_x + (msb_T_y * gridSideLen)

        // Note (other_T_x_is_even =>(23.x = 2)_is_even) is NOT eq to  (msb_T_value_is_even => (23)_is_even), and also NOT eq to actaul node value (58)_is_even
        let other_T_x_is_even = (msb_T_x % 2) == 0

        /* if the node actaul value is 58, then other_root is 58  other_leaf is 50*/
        let other_root = other_T_x_is_even ? msb_node_value : (msb_node_value - gridSideLen)
        let other_leaf = other_T_x_is_even ? (msb_node_value - gridSideLen) : msb_node_value

        // since other_root.x is always odd when connecteing with left wall
        // Note (other_root_x_is_even =>(58.x)_is_even) is NOT eq to actaul node value (58)_is_even
        let other_root_x_is_even = (floor(other_root / gridSideLen)) % 2 == 0
        let is_other_root_leaf_same_col = ((other_root) % gridSideLen) == ((other_leaf) % gridSideLen)

        if (is_other_root_leaf_same_col && !other_root_x_is_even) {
            if ((msb_T_index - 1) >= 0 && (filter_T_left_wall & (1 << (msb_T_index - 1))) != 0) { // important: (msb_T_index - 1) >= 0, since 1<<(-1) is the same as 1<<7 if the mask leng is 8

                let connect_before_this_node = other_leaf - 1
                let other_new_root_index = _other.getNodeLocalIndex(other_root)

                let insert_other_at_index = _this.getNodeLocalIndex(connect_before_this_node)


                if (_this.isValidPivotIndex(insert_other_at_index) && _other.isValidPivotIndex(_other.getNodeLocalIndex(other_root))) { //
                    option = Object.assign({}, Option)
                    option.other_root = other_root
                    option.other_leaf = other_leaf
                    option.other_new_root_index = other_new_root_index

                    option.insert_other_at_index = insert_other_at_index
                    found = true
                }

            }
            filter_T_left_wall = clear_bit(filter_T_left_wall, msb_T_index)
            filter_T_left_wall = clear_bit(filter_T_left_wall, (msb_T_index - 1))

        } else {
            filter_T_left_wall = clear_bit(filter_T_left_wall, msb_T_index)
            // printBinString(filter_T_left_wall)
        }
    }
    return option
}

const calc_pivots_other_to_this_lower_wall_by_section = (section_index, _this, _other) => {
    // Right shifting the "this .path_mask[0]"
    // 15  14  13  12  11  10  09  08  07  06  05  04  03  02  01  00 <-- OTHER IS CYCLIC
    // 23  22  21  20  19  18  17  16  15  14  13  12  11  10  09  08 <-- this.subgraph been right-shifted ignoring first n bits in this subgraph   

    let found = false
    let option = null

    let filter_lower_wall = get_right_shifted_filter_by_section(_this.path_mask, _other.path_mask, section_index)

    while (filter_lower_wall !== 0 && !found) {

        let msb_index = msb(filter_lower_wall)

        // add "(section_index * BITS_PER_SECTION )" to get the aqtual node value.
        let msb_node_value = msb_index + (section_index * BITS_PER_SECTION)

        let other_x = floor(msb_node_value / gridSideLen)
        let other_x_is_even = (other_x % 2) == 0

        let other_root = other_x_is_even ? (msb_node_value - 1) : msb_node_value
        let other_leaf = other_x_is_even ? msb_node_value : (msb_node_value - 1)

        // since root.y is always odd when connecteing with lower wall
        let other_root_y_is_even = other_root % 2 == 0 // this is eq to (msb_node_value % gridSideLen) % 2 == 0
        let is_other_root_leaf_same_row = floor(other_leaf / gridSideLen) == floor(other_root / gridSideLen)

        if (is_other_root_leaf_same_row && !other_root_y_is_even) {
            if ((msb_index - 1) >= 0 && (filter_lower_wall & (1 << (msb_index - 1))) != 0) { // important: (msb_index - 1) >= 0, since 1<<(-1) is the same as 1<<7 if the mask leng is 8


                let connect_before_this_node = other_leaf + gridSideLen
                let other_new_root_index = _other.getNodeLocalIndex(other_root)
                let insert_other_at_index = _this.getNodeLocalIndex(connect_before_this_node)


                if (_this.isValidPivotIndex(insert_other_at_index) && _other.isValidPivotIndex(_other.getNodeLocalIndex(other_root))) { //
                    option = Object.assign({}, Option)
                    option.other_root = other_root
                    option.other_leaf = other_leaf
                    option.other_new_root_index = other_new_root_index
                    option.insert_other_at_index = insert_other_at_index
                    found = true

                }

            }
            filter_lower_wall = clear_bit(filter_lower_wall, msb_index)
            filter_lower_wall = clear_bit(filter_lower_wall, (msb_index - 1))
        } else {
            filter_lower_wall = clear_bit(filter_lower_wall, msb_index)
        }
    }

    return option
}

const calc_pivots_other_to_this_rigth_T_wall_by_section = (section_index, _this, _other) => {
    // right shifting the "this .path_T_mask[0]"
    // 57  49  41  33  25  17  09  01  56  48  40  32  24  16  08  00 <-- OTHER IS CYCLIC
    // 58  50  42  34  26  18  10  02  57  49  41  33  25  17  09  01 <-- _this.subgraph been right-shifted added dummy first n bits in this subgraph   

    let found = false
    let option = null
    let filter_T_right_wall = get_right_shifted_filter_by_section(_this.path_T_mask, _other.path_T_mask, section_index)

    while (filter_T_right_wall !== 0 && !found) {

        /* if the node actaul value is 58, then msb_T_index is 23 */
        let msb_T_index = msb(filter_T_right_wall)

        // add "(section_index * BITS_PER_SECTION )" to get the Transposed node value.
        /* if the node actaul value is 58, then msb_T_value is 23 = 23 + (0 * 24) */
        let msb_T_value = msb_T_index + (section_index * BITS_PER_SECTION)
        /* if the node actaul value is 58, then msb_T_x is 2   msb_T_x can has a range [0,2] iff the NR_OF_SECTIONS is 3*/
        let msb_T_x = floor(msb_T_value / gridSideLen)
        /* if the node actaul value is 58, then msb_T_y is 7   msb_T_y can has a range [0,7]*/
        let msb_T_y = (msb_T_value % gridSideLen)

        /* if the node actaul value is 58, then msb_node_value is 58 */
        let msb_node_value = msb_T_x + (msb_T_y * gridSideLen)

        // Note (other_T_x_is_even =>(23.x = 2)_is_even) is NOT eq to  (msb_T_value_is_even => (23)_is_even), and also NOT eq to actaul node value (58)_is_even
        let other_T_x_is_even = (msb_T_x % 2) == 0

        /* if the node actaul value is 58, then other_root is 58  other_leaf is 50*/
        let other_root = other_T_x_is_even ? msb_node_value : (msb_node_value - gridSideLen)
        let other_leaf = other_T_x_is_even ? (msb_node_value - gridSideLen) : msb_node_value

        // since other_root.x is always even when connecteing with right wall
        // Note (other_root_x_is_even =>(58.x)_is_even) is NOT eq to actaul node value (58)_is_even
        let other_root_x_is_even = (floor(other_root / gridSideLen)) % 2 == 0
        let is_other_root_leaf_same_col = ((other_root) % gridSideLen) == ((other_leaf) % gridSideLen)

        if (is_other_root_leaf_same_col && other_root_x_is_even) {
            if ((msb_T_index - 1) >= 0 && (filter_T_right_wall & (1 << (msb_T_index - 1))) != 0) { // important: (msb_T_index - 1) >= 0, since 1<<(-1) is the same as 1<<7 if the mask leng is 8

                let connect_before_this_node = other_leaf + 1
                let other_new_root_index = _other.getNodeLocalIndex(other_root)
                let insert_other_at_index = _this.getNodeLocalIndex(connect_before_this_node)


                if (_this.isValidPivotIndex(insert_other_at_index) && _other.isValidPivotIndex(_other.getNodeLocalIndex(other_root))) { //
                    option = Object.assign({}, Option)
                    option.other_root = other_root
                    option.other_leaf = other_leaf
                    option.other_new_root_index = other_new_root_index
                    option.insert_other_at_index = insert_other_at_index
                    found = true
                }

            }
            filter_T_right_wall = clear_bit(filter_T_right_wall, msb_T_index)
            filter_T_right_wall = clear_bit(filter_T_right_wall, (msb_T_index - 1))
        } else {
            filter_T_right_wall = clear_bit(filter_T_right_wall, msb_T_index)
        }
    }
    return option
}
/******************************************************************************************************************************** */



export {
    get_left_shifted_filter_by_row,
    get_right_shifted_filter_by_row,

    calc_pivots_other_to_this_upper_wall_by_row,
    calc_pivots_other_to_this_left_T_wall_by_row,
    calc_pivots_other_to_this_lower_wall_by_row,
    calc_pivots_other_to_this_rigth_T_wall_by_row,


    get_left_shifted_filter_by_section,
    get_right_shifted_filter_by_section,

    calc_pivots_other_to_this_upper_wall_by_section,
    calc_pivots_other_to_this_left_T_wall_by_section,
    calc_pivots_other_to_this_lower_wall_by_section,
    calc_pivots_other_to_this_rigth_T_wall_by_section,
}