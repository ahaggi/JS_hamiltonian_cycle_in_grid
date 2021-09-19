/* Java program for solution of Hamiltonian Cycle problem
using backtracking */
import {  gridSideLen, totalNrOfCells } from '../../grid.js'


// nrOfNodes
const V = totalNrOfCells
var path = []

/* A utility function to check if the vertex v can be
added at index 'pos'in the Hamiltonian Cycle
constructed so far (stored in 'path[]') 
	
OBS
path: The found HC so far
pos: the current empty index in "path"
v: the actual value of a node

*/
const isSafe = (v, graph, path, pos) => {

    // if (pos == 4){
    // 	printSolution(path)
    //     console.log( "v  is "  + v )
    //     console.log( "pos  is "  + pos )
    //     console.log( "path[pos - 1]  is "  + path[pos - 1] )
    //     console.log( "graph[path["+(pos - 1)+"]]["+v+"]  is "  + graph[path[pos - 1]][v] )
    // }
    /* Check if this vertex is an adjacent vertex of
    the previously added vertex. */
    if (graph[path[pos - 1]][v] == 0)
        return false

    /* Check if the vertex has already been included.
    This step can be optimized by creating an array
    of size V */
    for (var i = 0; i < pos; i++)
        if (path[i] == v)
            return false

    return true
}

/* A recursive utility function to solve hamiltonian
cycle problem 
path: The found HC so far
pos: the current empty index in "path"
v: the actual value of a node
*/
const hamCycleUtil = (graph, path, pos) => {
    /* base case: If all vertices are included in
    Hamiltonian Cycle */
    if (pos == V) {
        // And if there is an edge from the last included
        // vertex to the first vertex
        if (graph[path[pos - 1]][path[0]] == 1)
            return true
        else
            return false
    }

    // Try different vertices as a next candidate in
    // Hamiltonian Cycle. 
    for (var v = 0; v < V; v++) {
        /* Check if this vertex can be added to Hamiltonian
        Cycle, 
    	
        OBS: there is 2 conditions before adding (the current node value "v") to "path" :
        1- The node "v" has an edge with the last node added to "path".
        2- the node "v" has not been already added to "path"
        */

        if (isSafe(v, graph, path, pos)) {
            path[pos] = v

            /* recur to construct rest of the path */
            if (hamCycleUtil(graph, path, pos + 1) == true)
                return true

            /* If adding vertex v doesn't lead to a solution,
            then remove it */
            path[pos] = -1
        }
    }

    /* If no vertex can be added to Hamiltonian Cycle
    constructed so far, then return false */
    return false
}

/* This function solves the Hamiltonian Cycle problem using
Backtracking. It mainly uses hamCycleUtil() to solve the
problem. It returns false if there is no Hamiltonian Cycle
possible, otherwise return true and prints the path.
Please note that there may be more than one solutions,
this function prints one of the feasible solutions. */
const hamCycle = (graph) => {
    path = Array(V)
    for (var i = 0; i < V; i++)
        path[i] = -1

    /* Let us put vertex 0 as the first vertex in the path.
    If there is a Hamiltonian Cycle, then the path can be
    started from any point of the cycle as the graph is
    undirected */
    path[0] = 0

    if (hamCycleUtil(graph, path, 1) == false) {
        console.log("\nSolution does not exist")
        return 0
    }

    printSolution(path)
    return 1
}

/* A utility function to print solution */
const printSolution = (path) => {
    console.log("Solution Exists: Following" +
        " is one Hamiltonian Cycle")
    let tempOutput = ""
    for (var i = 0; i < V; i++)
        tempOutput += (" " + path[i] + " ")

    // Let us print the complete cycle
    console.log(tempOutput + " " + path[0])
}

export { hamCycle }
