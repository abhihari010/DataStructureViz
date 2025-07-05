import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import DijkstraVisualization from "@/components/visualizations/dijkstra-visualization";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import React from "react";

const codeExamples = {
  cpp: `void dijkstra(int start, vector<vector<pair<int, int>>>& adj, vector<int>& dist) {
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;
    dist[start] = 0;
    pq.push({0, start});
    while (!pq.empty()) {
        int d = pq.top().first, u = pq.top().second; pq.pop();
        if (d > dist[u]) continue;
        for (auto& edge : adj[u]) {
            int v = edge.first, w = edge.second;
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }
}`,
  python: `import heapq

def dijkstra(start, adj, dist):
    dist[start] = 0
    pq = [(0, start)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]: continue
        for v, w in adj[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                heapq.heappush(pq, (dist[v], v))`,
  java: `void dijkstra(int start, List<List<int[]>> adj, int[] dist) {
    PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[0]));
    dist[start] = 0;
    pq.add(new int[]{0, start});
    while (!pq.isEmpty()) {
        int[] top = pq.poll();
        int d = top[0], u = top[1];
        if (d > dist[u]) continue;
        for (int[] edge : adj.get(u)) {
            int v = edge[0], w = edge[1];
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.add(new int[]{dist[v], v});
            }
        }
    }
}`,
  javascript: `function dijkstra(start, adj, dist) {
  const pq = [[0, start]];
  dist[start] = 0;
  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, u] = pq.shift();
    if (d > dist[u]) continue;
    for (const [v, w] of adj[u]) {
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        pq.push([dist[v], v]);
      }
    }
  }
}`
};

export default function DijkstraPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navigation />
        <main className="flex-1 p-6 flex flex-col gap-6">
          <h1 className="text-3xl font-bold mb-2">Dijkstra's Algorithm</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DijkstraVisualization />
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>Dijkstra's Algorithm</CardTitle>
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
                <b>Dijkstra's Algorithm</b> is a classic algorithm for finding the shortest paths from a source node to all other nodes in a weighted graph with non-negative edge weights. It uses a priority queue to always expand the node with the smallest known distance.
              </p>
              <ul className="list-disc ml-6 mb-2">
                <li>Time Complexity: <Badge variant="outline">O((V + E) log V)</Badge> (using a priority queue)</li>
                <li>Space Complexity: <Badge variant="outline">O(V)</Badge> (for distance and queue storage)</li>
                <li>Finds the shortest path from the source to all nodes</li>
                <li>Does not work with negative edge weights</li>
              </ul>
              <p>
                Dijkstra's algorithm is widely used in routing and navigation systems, and is a fundamental building block in many graph algorithms.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
} 