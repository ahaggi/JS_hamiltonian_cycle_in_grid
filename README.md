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
an isolated-subgraph are also an isolated cyclic path, where the total nr of nodes in a subgraph has to be an even nr and greater than or equal to four or more nodes.

**Isolated-subgraph orientation**: an isolated-subgraph has to have an "orientation" in order to be concatenated into the new hamiltonian cycle.  
In this context the orientation means that the isolated-subgraph represent either:
- 2 connected and adjecent columns where the fst node (root of the isolated-subgraph) and last node (leaf of the isolated-subgraph) are on the same row, or  
- 2 connected and adjecent rows    where the fst node (root of the isolated-subgraph) and last node (leaf of the isolated-subgraph) are on the same column.  

| ![down-o][down-o] | ![down-o1][down-o1] | 
|:--:| :--:| 
| *isolated-subgraph with down orientation* |

| ![up-o][up-o] | ![up-o1][up-o1] | 
|:--:| :--:| 
| *isolated-subgraph with up orientation* |

| ![left-o][left-o] | ![left-o1][left-o1] | 
|:--:| :--:| 
| *isolated-subgraph with left orientation* |

| ![right-o][right-o] | ![right-o1][right-o1] | 
|:--:| :--:| 
| *isolated-subgraph with right orientation* |



[1]: http://oeis.org/A143246
[2]: https://mathworld.wolfram.com/GridGraph.html
[down-o]: ./resources/analysis/down-o.png
[down-o1]: ./resources/analysis/down-o1.png
[up-o]: ./resources/analysis/up-o.png
[up-o1]: ./resources/analysis/up-o1.png
[left-o]: ./resources/analysis/left-o.png
[left-o1]: ./resources/analysis/left-o1.png
[right-o]: ./resources/analysis/right-o.png
[right-o1]: ./resources/analysis/right-o1.png
