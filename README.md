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

**cyclic path**: in order to cyclic (acourding to the above mentioned rules of the grid), a subgraph has to have an even nr of nodes and also the nr of nodes has to be greater than or equal to four nodes. In addition the isolated-subgraph has to represent either:
- 2 connected and adjecent columns where the fst node (root of the isolated-subgraph) and last node (leaf of the isolated-subgraph) are on the same row, or  
- 2 connected and adjecent rows    where the fst node (root of the isolated-subgraph) and last node (leaf of the isolated-subgraph) are on the same column.  


### How to calculate a new hamiltonian cycle  
1- Generate the "cutting path" and make it the core for the new Hamiltonian cycle.  
2- Make a list of all isolated-subgraphs.  
3- Recursively try to concatenate all acyclic "non-cyclic" isolated-subgraphs into the new hamiltonian cycle.  
4- Recursively try to concatenate all cyclic isolated-subgraphs into the new hamiltonian cycle.  
5- If the new hamiltonian cycle includes all the nodes in the graph (there isn't any isolated-subgraphs left), then follow the new hamiltonian cycle, otherwise follow the prev hamiltonian cycle.    




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