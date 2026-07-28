import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ArrowUpDown,
  Check,
  Layers,
  Link as LinkIcon,
  List,
  MapPin,
  Network,
  Route,
  Search,
  Shuffle,
  TreePine,
} from "lucide-react";
import { Link } from "wouter";
import AppShell from "@/components/app-shell";
import Reveal from "@/components/reveal";
import { progressApi } from "@/lib/api";
import type { UserProgress } from "@shared/schema";

const topics = [
  { id: "stack", name: "Stack", type: "Structure", difficulty: "Beginner", time: 20, path: "/topics/stack", icon: Layers, note: "Push, pop, and inspect the top value." },
  { id: "queue", name: "Queue", type: "Structure", difficulty: "Beginner", time: 20, path: "/topics/queue", icon: List, note: "Follow values from enqueue to dequeue." },
  { id: "linked-list", name: "Linked list", type: "Structure", difficulty: "Beginner", time: 30, path: "/topics/linked-list", icon: LinkIcon, note: "Move through references one node at a time." },
  { id: "binary-tree", name: "Binary tree", type: "Structure", difficulty: "Intermediate", time: 45, path: "/topics/binary-tree", icon: TreePine, note: "Build, search, and trace three traversal orders." },
  { id: "graph", name: "Graph", type: "Structure", difficulty: "Intermediate", time: 60, path: "/topics/graph", icon: Network, note: "Connect vertices and inspect adjacency." },
  { id: "bubble-sort", name: "Bubble sort", type: "Algorithm", difficulty: "Beginner", time: 25, path: "/bubble-sort", icon: ArrowUpDown, note: "Watch adjacent comparisons settle the array." },
  { id: "quick-sort", name: "Quick sort", type: "Algorithm", difficulty: "Intermediate", time: 35, path: "/quick-sort", icon: Shuffle, note: "Partition around a pivot and recurse." },
  { id: "bfs", name: "Breadth-first search", type: "Algorithm", difficulty: "Intermediate", time: 35, path: "/bfs", icon: Route, note: "Expand the frontier level by level." },
  { id: "dfs", name: "Depth-first search", type: "Algorithm", difficulty: "Intermediate", time: 35, path: "/dfs", icon: Route, note: "Follow a branch until it must backtrack." },
  { id: "dijkstra", name: "Dijkstra", type: "Algorithm", difficulty: "Advanced", time: 50, path: "/dijkstra", icon: MapPin, note: "Resolve shortest distances by priority." },
];

export default function TopicsPage() {
  const initialParams = new URLSearchParams(window.location.search);
  const initialFilter = initialParams.get("type");
  const [query, setQuery] = useState(initialParams.get("q") || "");
  const [filter, setFilter] = useState<"All" | "Structure" | "Algorithm">(
    initialFilter === "Structure" || initialFilter === "Algorithm" ? initialFilter : "All",
  );
  const { data: progress = [], isLoading } = useQuery<UserProgress[]>({
    queryKey: ["/api/progress"],
    queryFn: progressApi.getUserProgress,
  });
  const progressByTopic = new Map(progress.map((item) => [item.topicId, item]));
  const visibleTopics = useMemo(
    () =>
      topics.filter(
        (topic) =>
          (filter === "All" || topic.type === filter) &&
          `${topic.name} ${topic.note}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [filter, query],
  );

  useEffect(() => {
    const url = new URL(window.location.href);
    query ? url.searchParams.set("q", query) : url.searchParams.delete("q");
    filter === "All"
      ? url.searchParams.delete("type")
      : url.searchParams.set("type", filter);
    window.history.replaceState({}, "", `${url.pathname}${url.search}`);
  }, [filter, query]);

  return (
    <AppShell>
      <div className="app-index-page">
        <header className="app-index-header">
          <span className="app-kicker">Topic index</span>
          <h1>Open the structure.<br />Inspect the state.</h1>
          <p>
            Search every implemented visualization and continue from the exact
            operation you want to understand.
          </p>
        </header>

        <div className="app-index-tools">
          <label className="app-index-search">
            <Search aria-hidden="true" />
            <span className="sr-only">Search topics</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search the index…"
            />
          </label>
          <div className="app-segmented-control" aria-label="Filter topics">
            {(["All", "Structure", "Algorithm"] as const).map((value) => (
              <button
                type="button"
                className={filter === value ? "is-active" : ""}
                onClick={() => setFilter(value)}
                aria-pressed={filter === value}
                key={value}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="app-inline-state" role="status">Loading the topic index…</div>
        ) : visibleTopics.length > 0 ? (
          <ol className="app-topic-index">
            {visibleTopics.map((topic, index) => {
              const Icon = topic.icon;
              const topicProgress = progressByTopic.get(topic.id);
              return (
                <li key={topic.id}>
                  <Reveal delay={Math.min(index, 5) * 0.045}>
                  <Link href={topic.path}>
                    <span className="app-topic-index-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="app-topic-index-icon">
                      <Icon aria-hidden="true" />
                    </span>
                    <div className="app-topic-index-copy">
                      <strong>{topic.name}</strong>
                      <p>{topic.note}</p>
                    </div>
                    <div className="app-topic-index-meta">
                      <span>{topic.type}</span>
                      <span>{topic.difficulty}</span>
                      <span>{topic.time} min</span>
                    </div>
                    <span
                      className={`app-topic-index-status ${
                        topicProgress?.completed ? "is-complete" : ""
                      }`}
                    >
                      {topicProgress?.completed ? <Check aria-hidden="true" /> : null}
                      {topicProgress?.completed
                        ? "Resolved"
                        : topicProgress?.timeSpent
                          ? "Continue"
                          : "Open"}
                    </span>
                    <ArrowRight aria-hidden="true" />
                  </Link>
                  </Reveal>
                </li>
              );
            })}
          </ol>
        ) : (
          <div className="app-inline-state">
            No topics match “{query}”. Try a structure or algorithm name.
          </div>
        )}
      </div>
    </AppShell>
  );
}
