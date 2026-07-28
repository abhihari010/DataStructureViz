import TopicWorkspace from "@/components/topic-workspace";
import DijkstraVisualization from "@/components/visualizations/dijkstra-visualization";

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
    <TopicWorkspace
      category="Shortest path"
      codeExamples={codeExamples}
      difficulty="Advanced"
      title="Dijkstra"
      summary="Settle the closest unresolved vertex, then relax every outgoing edge against the best distance so far."
      overview="A priority queue keeps the smallest tentative distance at the front. Once a vertex is settled, its shortest distance is final when all edge weights are non-negative."
      complexity={[
        { label: "Time", value: "O((V + E) log V)" },
        { label: "Space", value: "O(V)" },
        { label: "Frontier", value: "Priority queue" },
        { label: "Negative weights", value: "No" },
      ]}
    >
      <DijkstraVisualization />
    </TopicWorkspace>
  );
}
