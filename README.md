# How to calculate a path for a snake in the classic snake game?

## The grid   
A two-dimensional grid graph, also known as a rectangular grid graph or two-dimensional lattice graph, is an lattice graph that is the graph Cartesian product of path graphs on and vertices.   

## Hamiltonian cycle in nXn grid  
The numbers of directed Hamiltonian cycles on the nXn grid graph for n=1, 2, ... are 0, 2, 0, 12, 0, 2144, 0, 9277152, ..(OEIS [A096969][1]). (e.g., if n = 8, then there exsist )  

### Rules used in this project:  
Instead of undirected grid-graph (two-dimensional lattice graph), we will consider this grid a directed graph, with the flwg rules:  
1- any vertex ∈ the graph, has only 2 edges instead of 4 (one edge for the vertical direction and 1 for the horizontal direction).   
2- any edge ∈ the graph, is directed edge where its position in the graph determines its direction.  

    Vertical direction:
        1- edges in even-index  col allows ONLY up-movements.
        2- edges in odd-index   col allows ONLY down-movements.
    Horizontal direction:
        1- edges in even-index row allows ONLY left-movements.  
        2- edges in odd-index  row allows ONLY right-movements.  

    Example:
        ALLOWED     movements between node1 and node8 [1-0-8] OR [8-9-1]
        NOT ALLOWED movements between node1 and node8 [1-9-8] OR [8-0-1]

[more resources][2]


## The approach used in this version

**Cutting-path**: is new direct path from snake head to the target (this new path will not follow the path determined by the calculated hamiltonian cycle), and will produce isolated-subgraphs that has to be concatenated into a new hamiltonian cycle.  

**Isolated-subgraph**: an array of connected nodes which are a subset of the graph, but not included in the Ham. cycle yet!  
an isolated-subgraph can be a cyclic path or acyclic "non-cyclic" path.

**cyclic path**: in order to cyclic (acourding to the above mentioned rules of the grid), a subgraph has to have an even nr of nodes and also the nr of nodes has to be greater than or equal to four nodes. Unlike the prev solutions, in this version the isolated-subgraph does NOT have to represent 2 connected and adjecent columns/rows i.e. as long as the fst node (root of the isolated-subgraph) and last node (leaf of the isolated-subgraph) are adjecent, the subgraph is considered cyclic regardless of its shape.


**pivot_points**: are nodes that reside in 2 diff subgraphs and can be used to concatenate these two subgraphs. 

### How to calculate a new hamiltonian cycle  
1- Generate the "cutting path" and make it the core for the new Hamiltonian cycle.  
2- Make a list of all isolated-subgraphs.  
3- Recursively try to concatenate all acyclic "non-cyclic" isolated-subgraphs into the new hamiltonian cycle.  
4- Recursively try to concatenate all cyclic isolated-subgraphs into the new hamiltonian cycle.  
5- If the new hamiltonian cycle includes all the nodes in the graph (there isn't any isolated-subgraphs left), then follow the new hamiltonian cycle, otherwise follow the prev hamiltonian cycle.    


### Using bit mask to compute the *pivot_points* to concatenate 2 subgraph   

Previously, to calculate if subgraph_a (which has N nodes) and subgraph_b (which has M nodes) are connectable, we had to iterate "worst case" (N*M) comparisons. Note: its most likely to find a (pivot_point/connection point) much earlier than "worst case" due to the redundancy of such points in the subgraphs.  
But a better approach is using bit masking.   

Note: of the 64 bits of js number, we can only use 32 bits due to js number implementation, and that int is signed (Binary signed 2's complement).  
If total nr of nodes is 8X8 = 64 nodes we need array with 2 int which have 32X2=64 bits, this is how the mask look like:  

**Example**:
Its also possible to use a less nr of bits, let's say 24 usable bits out of 32 bits, and the total nr of nodes is 64

|  section_indx=0  |  section_indx=1  |
|:--:|:--:|
|23 ! .. ! 05 ! 04 ! 03 ! 02 ! 01 ! 00 |   46 ! ... ! 27 ! 26 ! 25 ! 24 |


**How to map a node value to the mask?**
to set bit (bit_to_set) = 50:  
section_indx = 50 / 24 = 2  
nr_of_shifts = 50 % 24 = 2  
mask\[section_indx\] |= (1 << nr_of_shifts), results in the flwg expression:   mask\[2\] |= (1 << 2)  

This will give the possibility of only 3 comparisons or less and to map all the nodes in both subgraphs will take only (N+M) where N is the nr of nodes in one subgraph and M is for the other one. But due to the current implementaion, this will require extra iteration to find the local_index of a node inside a subgraph. 

Nevertheless, theoretically this is more efficient than (N\*M) comparisons which is used in the prev versions, but due to the redundancy of the connection-points in the subgraphs, the prev implementation will most likely to find a connection-point  much earlier than "worst case" (N\*M).





To connenct other_path to the this_path (upper wall) , the comparing should start from (2nd row in the "other" subgraph) and (fst row of "this" subgraph), which means the fst n-th bits in the "other" subgraph should be ignored.  
  
This could either be accoumplished via shifting either:  
-  left  shifting "this .path_mask[i]" by n bits, and copying the last n-bits from "this. path_mask[i-1]", where i = [0, BITS_PER_SECTION> and n = gridSideLen. OR,  
-  right shifting "other.path_mask[i]" by n bits, and copying the fst  n-bits from "other.path_mask[i+1]", where i = [0, BITS_PER_SECTION> and n = gridSideLen.  
  
Left shifting the "this .path_mask[0]"  
15  14  13  12  11  10  09  08  07  06  05  04  03  02  01  00  **  **  **  **  **  **  **  ** <-- this.subgraph been left-shifted added dummy first n bits in this subgraph     
23  22  21  20  19  18  17  16  15  14  13  12  11  10  09  08  07  06  05  04  03  02  01  00 <-- OTHER IS CYCLIC  



***Efficiency of this implementation using bit masking in regard to the size of the graph***
The more usable bits the better is the efficiency,, again this is limited to max 32 usable bits due to js number implementation, and that int is signed (Binary signed 2's complement).

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
gridSideLen 64  ,  BITS_PER_SECTION 32  <--- Efficiency is ok until here  
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


### subgraphs examples:  
| ![usecase0.png][usecase0.png] |
|:--:|
| *example for 2 non-cyclic subgraphs that are NOT-CONNECTABLE* |

| ![usecase1.png][usecase1.png] | 
|:--:| 
| *example for 2 non-cyclic subgraphs that are CONNECTABLE* |

| ![usecase2.png][usecase2.png] | ![usecase3.png][usecase3.png] |  
|:--:|:--:| 
|       *example for 2 subgraphs (one cyclic and the other acyclic) that are CONNECTABLE subgraphs*       |  


  
| ![usecase4.png][usecase4.png] | 
|:--:| 
| *example for 2 cyclic subgraphs that are CONNECTABLE* |


[1]: http://oeis.org/A143246
[2]: https://mathworld.wolfram.com/GridGraph.html
[usecase0.png]: ./resources/analysis/usecase0.png
[usecase1.png]: ./resources/analysis/usecase1.png
[usecase2.png]: ./resources/analysis/usecase2.png
[usecase3.png]: ./resources/analysis/usecase3.png
[usecase4.png]: ./resources/analysis/usecase4.png