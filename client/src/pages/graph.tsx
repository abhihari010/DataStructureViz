import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import PracticeSection from "@/components/practice-section";
import CodePanel from "@/components/code-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import React from "react";
import GraphVisualization from "@/components/visualizations/graph-visualization";

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
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="flex" style={{ height: 'calc(100vh - 4rem)' }}>
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="min-h-full flex flex-col">
            {/* Topic Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Graph Data Structure</h1>
                  <p className="text-gray-600 mt-1">
                    A collection of nodes (vertices) connected by edges. Used to represent networks, relationships, and more.
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                    <Star className="w-3 h-3 mr-1" />
                    Intermediate
                  </Badge>
                </div>
              </div>
            </div>

            {/* Split Panel Layout */}
            <div className="flex-1 flex overflow-auto">
              {/* Code Panel - Left side - Wider */}
              <div className="w-[44rem] border-r border-gray-200 overflow-auto flex-shrink-0">
                <div className="h-full p-4">
                  <CodePanel codeExamples={graphCodeExamples} />
                </div>
              </div>

              {/* Visualization Panel - Takes remaining width */}
              <div className="flex-1 overflow-auto p-4 ml-4">
                <div className="max-w-4xl mx-auto w-full h-full flex items-center justify-center">
                  <div className="w-full">
                    <GraphVisualization />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Panel */}
            <div className="bg-white border-t border-gray-200 p-6">
              <PracticeSection topicId="graph" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 