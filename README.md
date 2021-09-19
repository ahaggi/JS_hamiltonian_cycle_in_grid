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

[1]: http://oeis.org/A143246
[2]: https://mathworld.wolfram.com/GridGraph.html