import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import DfsVisualization from "@/components/visualizations/dfs-visualization";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import React from "react";

const codeExamples = {
  cpp: `void dfs(int v, vector<vector<int>>& adj, vector<bool>& visited) {
    visited[v] = true;
    for (int u : adj[v]) {
        if (!visited[u]) dfs(u, adj, visited);
    }
}`,
  python: `def dfs(v, adj, visited):
    visited[v] = True
    for u in adj[v]:
        if not visited[u]:
            dfs(u, adj, visited)`,
  java: `void dfs(int v, List<List<Integer>> adj, boolean[] visited) {
    visited[v] = true;
    for (int u : adj.get(v)) {
        if (!visited[u]) dfs(u, adj, visited);
    }
}`,
  javascript: `function dfs(v, adj, visited) {
  visited[v] = true;
  for (let u of adj[v]) {
    if (!visited[u]) dfs(u, adj, visited);
  }
}`
};

export default function DfsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navigation />
        <main className="flex-1 p-6 flex flex-col gap-6">
          <h1 className="text-3xl font-bold mb-2">Depth-First Search (DFS)</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DfsVisualization />
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>DFS Algorithm</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <Tabs defaultValue="cpp" className="w-full flex-1 flex flex-col">
                  <TabsList>
                    <TabsTrigger value="cpp">C++</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                    <TabsTrigger value="java">Java</TabsTrigger>
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  </TabsList>
                  <TabsContent value="cpp">
                    <pre className="bg-gray-900 text-white rounded p-4 overflow-x-auto text-sm min-h-[180px] flex-1">
                      <code>{codeExamples.cpp}</code>
                    </pre>
                  </TabsContent>
                  <TabsContent value="python">
                    <pre className="bg-gray-900 text-white rounded p-4 overflow-x-auto text-sm min-h-[180px] flex-1">
                      <code>{codeExamples.python}</code>
                    </pre>
                  </TabsContent>
                  <TabsContent value="java">
                    <pre className="bg-gray-900 text-white rounded p-4 overflow-x-auto text-sm min-h-[180px] flex-1">
                      <code>{codeExamples.java}</code>
                    </pre>
                  </TabsContent>
                  <TabsContent value="javascript">
                    <pre className="bg-gray-900 text-white rounded p-4 overflow-x-auto text-sm min-h-[180px] flex-1">
                      <code>{codeExamples.javascript}</code>
                    </pre>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2">
                <b>Depth-First Search (DFS)</b> is a fundamental graph traversal algorithm that explores as far as possible along each branch before backtracking. It is commonly used for searching, pathfinding, and topological sorting in graphs and trees.
              </p>
              <ul className="list-disc ml-6 mb-2">
                <li>Time Complexity: <Badge variant="outline">O(V + E)</Badge> (V = vertices, E = edges)</li>
                <li>Space Complexity: <Badge variant="outline">O(V)</Badge> (due to recursion stack or explicit stack)</li>
                <li>Can be implemented recursively or iteratively</li>
                <li>Useful for cycle detection, connected components, and more</li>
              </ul>
              <p>
                DFS is a key building block in many graph algorithms and is widely used in computer science.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
} 