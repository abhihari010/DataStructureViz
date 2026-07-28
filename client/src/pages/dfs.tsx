import TopicWorkspace from "@/components/topic-workspace";
import DfsVisualization from "@/components/visualizations/dfs-visualization";

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
    <TopicWorkspace
      category="Graph traversal"
      codeExamples={codeExamples}
      difficulty="Intermediate"
      title="Depth-first search"
      summary="Follow one branch as far as it goes, then backtrack to the nearest unresolved decision."
      overview="A stack, explicit or recursive, preserves the active path. DFS exposes graph structure that supports cycle detection, components, and topological ordering."
      complexity={[
        { label: "Time", value: "O(V + E)" },
        { label: "Space", value: "O(V)" },
        { label: "Frontier", value: "Stack" },
        { label: "Backtracks", value: "Yes" },
      ]}
    >
      <DfsVisualization />
    </TopicWorkspace>
  );
}
