
import { gridSideLen, totalNrOfCells } from '../grid.js'
import {

    calc_pivots_other_to_this_upper_wall_by_row,
    calc_pivots_other_to_this_left_T_wall_by_row,
    calc_pivots_other_to_this_lower_wall_by_row,
    calc_pivots_other_to_this_rigth_T_wall_by_row,

    calc_pivots_other_to_this_upper_wall_by_section,
    calc_pivots_other_to_this_left_T_wall_by_section,
    calc_pivots_other_to_this_lower_wall_by_section,
    calc_pivots_other_to_this_rigth_T_wall_by_section,

} from './bitwise-filter-gen.js'
import { NR_OF_SECTIONS, calc_section_index, calc_section_T_index, SECTIONS_PER_ROW, gen_indexing_matrix_mask, my_find_index } from './bitwise-help-functions.js'


const floor = Math.floor



class Node {
    constructor(v) {
        this.value = v
        this.x = floor(v / gridSideLen)
        this.y = v % gridSideLen
        this.xIsEven = this.x % 2 == 0
        this.yIsEven = this.y % 2 == 0
    }
}


class SubGraph {
    /**
    The most time consuming operations in this class are the flwg operations:
    - splicing (insertion a new nodes / other path) into this subgraph's path.
    - rotaions (changing the root node of this subgraph)
    
    Since a subgraph's nodes reside in an array which represent a path in the subgraph, we have to lookup/find the index of some node inside the path, to perform either of these 2 operations:
    
    let us call that index "pivot_index"
    
    
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
    constructor(nodesValues, notConnectableRange = null) { // notConnectableRange ={ formIndex: -1, toIndex: -1 }
        this.path = this.#genPath(nodesValues)
        this.isCyclic = this.#isCyclic()

        if (notConnectableRange && this.#assertNotConnectableRangeValidity(notConnectableRange))
            this.notConnectableRange = notConnectableRange

        // ---------- these will be lazily generated when need it ----------
        // ----------    They're ONLY used for cyclic graphs      ----------
        this.path_mask = null
        this.path_T_mask = null
        this.indexing_matrix_mask = null
        // -----------------------------------------------------------------
    }

    gen_bit_mask() {











        this.path_T_mask = Array(NR_OF_SECTIONS).fill(0)
        this.path_mask = Array(NR_OF_SECTIONS).fill(0)
























        this.path.forEach((node, ind) => {

            if (this.notConnectableRange &&
                (ind > this.notConnectableRange.formIndex && ind < this.notConnectableRange.toIndex)
            )
                // Do NOT map the notConnectableRange nodes (except "notConnectableRange.formIndex" AND "notConnectableRange.toIndex")
                return

            // init the normal bitmask
            let { section_indx, nr_of_shifts } = calc_section_index(node.value);
            this.path_mask[section_indx] |= (1 << nr_of_shifts)

            // init the transposed bitmask, where the rows becomes cols and vice versa
            let { section_indx: section_T_indx, nr_of_shifts: nr_T_of_shifts } = calc_section_T_index(node.value);
            this.path_T_mask[section_T_indx] |= (1 << nr_T_of_shifts)
        }, this)
    }

    #assertNotConnectableRangeValidity(newNotConnectableRange) {
        // check the truthy of newNotConnectableRange, but for (formIndex and toIndex) only check that they're not null/undefined since they can have the value 0 which is eq to truthy of false.
        if (!newNotConnectableRange || newNotConnectableRange.formIndex == null || newNotConnectableRange.toIndex == null) {
            throw `Subgraph.#assertNotConnectableRangeValidity: notConnectableRange, formIndex or toIndex is null or undefined!`
        }

        let { formIndex: newForm_index, toIndex: newTo_index } = newNotConnectableRange

        if (!(newForm_index >= 0 && newTo_index < this.path.length)) {
            throw `Subgraph.#assertNotConnectableRangeValidity: Out of bound , newForm_index: ${newForm_index} or newTo_index: ${newTo_index} are out of bound!`
        }
        if (newForm_index > newTo_index) {
            throw `Subgraph.#assertNotConnectableRangeValidity: invalid notConnectableRange, newForm_index: ${newForm_index}  is gt  newTo_index: ${newTo_index}`
        }

        return true

    }

    #genPath(nodesValues) {
        return nodesValues.map(nodeVal => orderedNodes[nodeVal])
    }

    #onChange(pivotPoint) {
        // ---------- these will be lazily generated when need it ----------
        // ----------    They're ONLY used for cyclic graphs      ----------
        this.path_mask = null
        this.path_T_mask = null
        this.indexing_matrix_mask = null
        // -----------------------------------------------------------------

        this.isCyclic = this.#isCyclic()
        this.#updateNotConnectableRange(pivotPoint)
    }

    #isCyclic() {
        let root = this.path[0]
        let leaf = this.path[this.path.length - 1]

        let _isCyclic = false
        let sameRow = root.x == leaf.x
        let sameCol = root.y == leaf.y
        let validLength = this.path.length >= 4

        if (validLength) {
            if (sameRow) {
                if (root.xIsEven)
                    //for ex root  18 can be reached from leaf  19      left
                    //for ex root  17 can be reached from leaf  18      left
                    _isCyclic = root.y - leaf.y == -1
                else
                    //for ex root  14 can be reached from leaf  13      right
                    //for ex root   9 can be reached from leaf   8      rigth
                    _isCyclic = root.y - leaf.y == 1

            } else if (sameCol) {
                if (root.yIsEven)
                    //for ex root 18 can be reached from leaf 10         down
                    //for ex root 14 can be reached from leaf  6         down
                    _isCyclic = root.x - leaf.x == 1
                else
                    //for ex root 17 can be reached from leaf 25         up 
                    //for ex root  9 can be reached from leaf 17         up 
                    _isCyclic = root.x - leaf.x == -1
            }
        }

        return _isCyclic
    }

    isValidPivotIndex(pivotIndex) {

        /** The pivotIndex is the potential pivotPoint for an operation that will performed on this subgraph:
                1- Rotation: which means the node with index eq to pivotIndex will be the new "root".
                   i.e if path=[10,9,8,7,6] => rotate at pivotIndex=2 => results in path=[8,7,6,10,9] and pivotPoint= -2

                2- Splice: where the "other subgraph" will be spliced into this subgraph.
                   i.e if path=[10,9,8,7,6] => splice at pivotIndex=2 => results in path=[10,9,(...other_path),8,7,6] and pivotPoint=(2 || other_path.length),,see spliceIn implementation.
                   By other words, in the resulting subgraph after splicing, the other.leaf will come directly before the node indexed as "pivotIndex"
        */
        // return  ! (this.notConnectableRange && pivotIndex > this.notConnectableRange.formIndex && pivotIndex <= this.notConnectableRange.toIndex)
        let valid = !this.notConnectableRange ||
            (pivotIndex >= 0 && pivotIndex <= this.notConnectableRange.formIndex) ||
            (pivotIndex > this.notConnectableRange.toIndex && pivotIndex < this.path.length)
        return valid
    }

    #updateNotConnectableRange(pivotPoint) {
        /* pivotPoint represents nr of "shift" operation performed on this.path and can be either:
            1- Always negative when performing rotation operation    
               i.e if path=[10,9,8,7,6] => rotate at pivotIndex=2 => results in path=[8,7,6,10,9] and pivotPoint= -2

            2- Always positive when splicing "other subgraph" into this subgraph
               i.e if path=[10,9,8,7,6] => splice at pivotIndex=2 => results in path=[10,9,(...other_path),8,7,6] and pivotPoint=(2 || other_path.length),, see spliceIn implementation.
        */

        if (!this.notConnectableRange)
            return
        let pathLen = this.path.length
        let newForm_index = (this.notConnectableRange.formIndex + pivotPoint + pathLen) % pathLen
        let newTo_index = (this.notConnectableRange.toIndex + pivotPoint + pathLen) % pathLen

        // throws err!
        this.#assertNotConnectableRangeValidity({ formIndex: newForm_index, toIndex: newTo_index })

        this.notConnectableRange.formIndex = newForm_index
        this.notConnectableRange.toIndex = newTo_index
    }

    getNodeLocalIndex(nodeValue) {
        if (!this.indexing_matrix_mask) {
            this.indexing_matrix_mask = gen_indexing_matrix_mask(this.path)
        }

        // The index of a node inside this.path
        let localIndex = my_find_index(nodeValue, this.indexing_matrix_mask)
        // let localIndex = this.path.findIndex(node => node.value === nodeValue)

        if (localIndex == -1) {
            console.log('\n\nThe path is:')
            console.log(this.path.map(node => node.value))
            console.log('\n\n indexing_matrix_mask is:')
            // this.indexing_matrix_mask.forEach(mask => mask.forEach(section => printBinString(section)))
            throw `Subgraph.getNodeLocalIndex: Node Local Index Err, can't find the index of nodeValue ${nodeValue} in the above path`
        }
        return localIndex
    }


    spliceIn(other, atIndex, other_new_root_index) {
        let duplicate = other.path.some(node => this.path.includes(node))










        if (duplicate)
            throw `Subgraph.spliceIn: Trying to add some nodes that'd been added before!`













        if (other_new_root_index > 0) {
            //this will set the otherRoot and otherLeaf at the required pos.
            other.rotateCycle(other_new_root_index)
        }

        this.path.splice(atIndex, 0, ...other.path)

        let pivotPoint = 0

        // Since ONLY "this subgraph" or "other subgraph" contains the notConnectableRange
        if (other.notConnectableRange) {
            // init this.notConnectableRange and set it as other's, and let #onChange to update the indecies
            this.notConnectableRange = {
                formIndex: other.notConnectableRange.formIndex,
                toIndex: other.notConnectableRange.toIndex
            }
            // Important to set "pivotPoint" value here
            pivotPoint = atIndex

        } else if (this.notConnectableRange && atIndex <= this.notConnectableRange.formIndex) {
            pivotPoint = other.path.length
        }
        this.#onChange(pivotPoint)
    }

    spliceCyclicOtherOptions_Bitwise(other) {
        const Option = {
            other_root: null,
            other_leaf: null,
            insert_other_at_index: null,
        }

        // lazily gen the path masks
        if (!this.path_mask || !this.path_T_mask) {
            this.gen_bit_mask()
        }

        if (!other.path_mask || !other.path_T_mask) {
            other.gen_bit_mask()
        }

        /** 
 * 
 * How to validate the pivot points both (insert_other_at_index: splicing into this subgraph) and (other subgraph rotation)?
 * 
 * Important:
 * If the notConnectableRange is not represented in the mask, we can skip the notConnectableRange validity tests.
 * 
 * Better yet, if there is a need to 
 *      - splice into "this subgraph" at notConnectableRange.from or at  notConnectableRange.(to + 1) , OR
 *      - rotate "other subgraph"  and make its new_root the node with index  other.notConnectableRange.from   or with index notConnectableRange.(to + 1),
 *      So it is sufficient to only map the (notConnectableRange.from) and (notConnectableRange.to) while ignoring the rest of notConnectableRange. 
 * This will work fine as long as (notConnectableRange LENGTH is NOT 2 indecies)!
 *      
 * 
 * This will work becuase 
 * 1- we always need 4 adjecent nodes (2 from this to splice into this graph AND 2 from other to rotate other graph), "adjecent according to our HAM. CYCL RULES".
 * 2- each pare of these 4 nodes are candidates for (new_leaf and new_root in case we operating on the other graph) or (rotation index in case of this graph).
 * 3- each pare of these 4 nodes are rep as consecutive bits in the mask BUT with ascending order and NOT "according to our HAM. CYCL RULES".
 * 4- In case of operating on the other graph: and according to our "HAM. CYCL precedence RULES" the fst node in other is always new_leaf and snd new_root of other.
 * 5- In case of operating on the this graph: and according to our "HAM. CYCL precedence RULES" the "snd node index" is the rotation index for this graph.
 * Finally, when not rep the notConnectableRange in the mask (except fromIndex and toIndex), this will prevent of making the node with "toIndex" of been either a candidate for (new root/rotation index) or a candidate for ("splicing other into toIndex") which would devide the notConnectable "big no no!".
 * 
 * The ONLY EXCEPTION is when (notConnectableRange LENGTH is 2 indecies), where this could happen:
 *           potential_leaf = notConnectableRange.from   AND    potential_root = notConnectableRange.to

 * 
 *
 * If validating is needed:
 * When operating on this graph (splicing) the insert_other_at_index is valid iff (this.notConnectableRange!=null) and (insert_other_at_index != -1) and one of the flwg:
 *          the other_leaf can be spliced directly before this.notConnectableRange, OR
 *          the other_root can be spliced directly after this.notConnectableRange, OR
 *          the other_path can be spliced at any place outside this.notConnectableRange.
 * 
 * When operating on other graph (rotation) the rotation index is valid iff (other is cyclic) and (other.notConnectableRange!=null) and (rotation index != -1) and one of the flwg:
 *          the new_root index of other graph is outside other.notConnectableRange.to, OR
 *          the new_root index of other graph is not eq to other.notConnectableRange.to
 * */




        let calc_pivots_other_to_this_upper_wall
        let calc_pivots_other_to_this_left_T_wall
        let calc_pivots_other_to_this_lower_wall
        let calc_pivots_other_to_this_rigth_T_wall
        let TREVERSE_BY


        if (SECTIONS_PER_ROW > 0) { // gridSideLen >= BITS_PER_SECTION
            // This means that to represent 1 row we need  multiple sections 
            TREVERSE_BY = NR_OF_SECTIONS
            calc_pivots_other_to_this_upper_wall = calc_pivots_other_to_this_upper_wall_by_row
            calc_pivots_other_to_this_left_T_wall = calc_pivots_other_to_this_left_T_wall_by_row
            calc_pivots_other_to_this_lower_wall = calc_pivots_other_to_this_lower_wall_by_row
            calc_pivots_other_to_this_rigth_T_wall = calc_pivots_other_to_this_rigth_T_wall_by_row
        } else {
            TREVERSE_BY = gridSideLen

            calc_pivots_other_to_this_upper_wall = calc_pivots_other_to_this_upper_wall_by_section
            calc_pivots_other_to_this_left_T_wall = calc_pivots_other_to_this_left_T_wall_by_section
            calc_pivots_other_to_this_lower_wall = calc_pivots_other_to_this_lower_wall_by_section
            calc_pivots_other_to_this_rigth_T_wall = calc_pivots_other_to_this_rigth_T_wall_by_section
        }

        let option = null

        for (let i = 0; (i < TREVERSE_BY) && (!option); i++) { //  && !found
            option = (!option) ? calc_pivots_other_to_this_upper_wall(i, this, other) : option
            option = (!option) ? calc_pivots_other_to_this_left_T_wall(i, this, other) : option
            option = (!option) ? calc_pivots_other_to_this_lower_wall(i, this, other) : option
            option = (!option) ? calc_pivots_other_to_this_rigth_T_wall(i, this, other) : option
        }

        return option
    }

    spliceNonCyclicOtherOptions(other) {

        // this function will attempt to find if it is possible to connect other.leaf to this.root or this.leaf to other.root
        // WITHOUT any rotations!
        let root = this.path[0]
        let leaf = this.path[this.path.length - 1]
        let otherRoot = other.path[0]
        let otherLeaf = other.path[other.path.length - 1]


        let otherLeaf2RootH = false
        let otherLeaf2RootV = false
        let leaf2OtherRootH = false
        let leaf2OtherRootV = false

        let option = null

        // first try connecting otherLeaf to thisRoot

        if (root.xIsEven)
            //for ex root  18 can be reached from otherLeaf  19      left
            //for ex root  17 can be reached from otherLeaf  18      left

            otherLeaf2RootH = (root.x == otherLeaf.x) && (root.y - otherLeaf.y == -1)
        else
            //for ex root  14 can be reached from otherLeaf  13      right
            //for ex root   9 can be reached from otherLeaf   8      rigth
            otherLeaf2RootH = (root.x == otherLeaf.x) && (root.y - otherLeaf.y == 1)

        if (root.yIsEven && !otherLeaf2RootH)
            //for ex root 18 can be reached from otherLeaf 10         down
            //for ex root 14 can be reached from otherLeaf  6         down

            otherLeaf2RootV = (root.y == otherLeaf.y) && (root.x - otherLeaf.x == 1)
        else
            //for ex root 17 can be reached from otherLeaf 25         up 
            //for ex root  9 can be reached from otherLeaf 17         up 

            otherLeaf2RootV = (root.y == otherLeaf.y) && (root.x - otherLeaf.x == -1)

        if (otherLeaf2RootH || otherLeaf2RootV) {
            let temp = {
                insert_other_at_index: 0,// insert other.path into this.path at pos 0
                other_new_root_index: 0, // No need to rotate the other
            }
            option = temp
        }


        // if connecting otherLeaf to thisRoot fails, try connecting thisLeaf  to OtherRoot
        if (!option) {
            if (leaf.xIsEven)
                //for ex leaf 18 can reach to otherRoot 17         left
                //for ex leaf 17 can reach to otherRoot 16         left
                leaf2OtherRootH = (leaf.x == otherRoot.x) && (leaf.y - otherRoot.y == 1)

            else
                //for ex leaf 14 can reach to otherRoot 15         right
                //for ex leaf  9 can reach to otherRoot 10         right
                leaf2OtherRootH = (leaf.x == otherRoot.x) && (leaf.y - otherRoot.y == -1)


            if (leaf.yIsEven && !leaf2OtherRootH)
                //for ex leaf 18 can reach to otherRoot 26         up
                //for ex leaf 14 can reach to otherRoot 22         up
                leaf2OtherRootV = (leaf.y == otherRoot.y) && (leaf.x - otherRoot.x == -1)
            else
                //for ex leaf 17 can reach to otherRoot 9         down 
                //for ex leaf  9 can reach to otherRoot 1         down 
                leaf2OtherRootV = (leaf.y == otherRoot.y) && (leaf.x - otherRoot.x == 1)

            if (leaf2OtherRootH || leaf2OtherRootV) {
                let temp = {
                    insert_other_at_index: this.path.length, // insert other.path into this.path at NEW  pos (this.path.length)
                    other_new_root_index: 0, // No need to rotate the other
                }
                option = temp
            }
        }

        return option
    }

    rotateCycle(newRootIndex) {
        /// IMPORTANT: the arg "newRootIndex" of this function must've already been validated as a valid index in this path 

        if (!this.isCyclic)
            throw 'rotateCycle: this subgraph is not cyclic'

        let temp = [...this.path.slice(newRootIndex), ...this.path.slice(0, newRootIndex)]
        this.path.length = 0
        this.path.push(...temp)

        let pivotPoint = -1 * (newRootIndex)
        this.#onChange(pivotPoint)
    }

}

const orderedNodes = Array.from({ length: (totalNrOfCells) }, (_, i) => new Node(i))


export {
    Node,
    SubGraph,
    orderedNodes
}


