import GraphVisualization from "@/components/visualizations/graph-visualization";
import TopicWorkspace from "@/components/topic-workspace";

const graphCodeExamples = {
  javascript: `// Graph implementation using adjacency list
class Graph {
  constructor() {
    this.adjList = new Map();
  }

  addVertex(vertex) {
    if (!this.adjList.has(vertex)) {
      this.adjList.set(vertex, []);
    }
  }

  addEdge(v, w) {
    this.adjList.get(v).push(w);
    this.adjList.get(w).push(v); // For undirected graph
  }

  printGraph() {
    for (let [vertex, edges] of this.adjList) {
      console.log(vertex + ' -> ' + edges.join(', '));
    }
  }
}

// Example usage
const g = new Graph();
g.addVertex('A');
g.addVertex('B');
g.addEdge('A', 'B');
g.printGraph();`,
  python: `# Graph implementation using adjacency list
class Graph:
    def __init__(self):
        self.adj_list = {}

    def add_vertex(self, vertex):
        if vertex not in self.adj_list:
            self.adj_list[vertex] = []

    def add_edge(self, v, w):
        self.adj_list[v].append(w)
        self.adj_list[w].append(v)  # For undirected graph

    def print_graph(self):
        for vertex, edges in self.adj_list.items():
            print(f"{vertex} -> {', '.join(edges)}")

# Example usage
g = Graph()
g.add_vertex('A')
g.add_vertex('B')
g.add_edge('A', 'B')
g.print_graph()`,
  java: `// Graph implementation using adjacency list
import java.util.*;

public class Graph {
    private Map<String, List<String>> adjList = new HashMap<>();

    public void addVertex(String vertex) {
        adjList.putIfAbsent(vertex, new ArrayList<>());
    }

    public void addEdge(String v, String w) {
        adjList.get(v).add(w);
        adjList.get(w).add(v); // For undirected graph
    }

    public void printGraph() {
        for (String vertex : adjList.keySet()) {
            System.out.println(vertex + " -> " + adjList.get(vertex));
        }
    }

    public static void main(String[] args) {
        Graph g = new Graph();
        g.addVertex("A");
        g.addVertex("B");
        g.addEdge("A", "B");
        g.printGraph();
    }
}`
};

export default function GraphPage() {
  return (
    <TopicWorkspace
      category="Data structure"
      codeExamples={graphCodeExamples}
      difficulty="Intermediate"
      title="Graph"
      summary="Vertices define the things. Edges define the relationships. Change either side and inspect the adjacency that results."
      overview="Graphs are topology before they are traversal. Watch how every edge changes the neighborhood of two vertices and how that representation prepares BFS, DFS, and shortest-path algorithms."
      complexity={[
        { label: "Add vertex", value: "O(1)" },
        { label: "Add edge", value: "O(1)" },
        { label: "Storage", value: "O(V + E)" },
      ]}
      topicId="graph"
    >
      <GraphVisualization />
    </TopicWorkspace>
  );
}
