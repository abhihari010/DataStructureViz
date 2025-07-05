import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import BfsVisualization from "@/components/visualizations/bfs-visualization";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import React from "react";

const codeExamples = {
  cpp: `void bfs(int start, vector<vector<int>>& adj, vector<bool>& visited) {
    queue<int> q;
    q.push(start);
    visited[start] = true;
    while (!q.empty()) {
        int v = q.front(); q.pop();
        for (int u : adj[v]) {
            if (!visited[u]) {
                visited[u] = true;
                q.push(u);
            }
        }
    }
}`,
  python: `from collections import deque

def bfs(start, adj, visited):
    q = deque([start])
    visited[start] = True
    while q:
        v = q.popleft()
        for u in adj[v]:
            if not visited[u]:
                visited[u] = True
                q.append(u)`,
  java: `void bfs(int start, List<List<Integer>> adj, boolean[] visited) {
    Queue<Integer> q = new LinkedList<>();
    q.add(start);
    visited[start] = true;
    while (!q.isEmpty()) {
        int v = q.poll();
        for (int u : adj.get(v)) {
            if (!visited[u]) {
                visited[u] = true;
                q.add(u);
            }
        }
    }
}`,
  javascript: `function bfs(start, adj, visited) {
  const q = [start];
  visited[start] = true;
  while (q.length) {
    const v = q.shift();
    for (let u of adj[v]) {
      if (!visited[u]) {
        visited[u] = true;
        q.push(u);
      }
    }
  }
}`
};

export default function BfsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navigation />
        <main className="flex-1 p-6 flex flex-col gap-6">
          <h1 className="text-3xl font-bold mb-2">Breadth-First Search (BFS)</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BfsVisualization />
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>BFS Algorithm</CardTitle>
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
                <b>Breadth-First Search (BFS)</b> is a fundamental graph traversal algorithm that explores all neighbors at the present depth prior to moving on to nodes at the next depth level. It is commonly used for shortest path finding, level order traversal, and connectivity checks in graphs and trees.
              </p>
              <ul className="list-disc ml-6 mb-2">
                <li>Time Complexity: <Badge variant="outline">O(V + E)</Badge> (V = vertices, E = edges)</li>
                <li>Space Complexity: <Badge variant="outline">O(V)</Badge> (due to queue and visited set)</li>
                <li>Always finds the shortest path in unweighted graphs</li>
                <li>Useful for level order traversal, connected components, and more</li>
              </ul>
              <p>
                BFS is a key building block in many graph algorithms and is widely used in computer science.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
} 