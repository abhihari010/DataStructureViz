import TopicWorkspace from "@/components/topic-workspace";
import BfsVisualization from "@/components/visualizations/bfs-visualization";

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
    <TopicWorkspace
      category="Graph traversal"
      codeExamples={codeExamples}
      difficulty="Intermediate"
      title="Breadth-first search"
      summary="Move through a graph frontier level by level, visiting every immediate neighbor before advancing."
      overview="A queue preserves discovery order while a visited set prevents repeated work. In an unweighted graph, that layered expansion also reveals shortest paths."
      complexity={[
        { label: "Time", value: "O(V + E)" },
        { label: "Space", value: "O(V)" },
        { label: "Frontier", value: "Queue" },
        { label: "Unweighted shortest path", value: "Yes" },
      ]}
    >
      <BfsVisualization />
    </TopicWorkspace>
  );
}
