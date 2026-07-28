import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import {
  ArrowUpDown,
  Check,
  Home,
  Layers,
  Link as LinkIcon,
  List,
  MapPin,
  Network,
  Route,
  Shuffle,
  TreePine,
  Waypoints,
  X,
  BookOpenCheck,
  Grid2X2,
} from "lucide-react";
import { progressApi } from "@/lib/api";
import type { UserProgress } from "@shared/schema";

const primaryRoutes = [
  { name: "Dashboard", icon: Home, path: "/" },
  { name: "Topic index", icon: Grid2X2, path: "/topics" },
  { name: "Practice", icon: BookOpenCheck, path: "/practice" },
];

const learningRoutes = [
  { id: "stack", name: "Stack", icon: Layers, path: "/topics/stack", group: "Structures" },
  { id: "queue", name: "Queue", icon: List, path: "/topics/queue", group: "Structures" },
  { id: "linked-list", name: "Linked list", icon: LinkIcon, path: "/topics/linked-list", group: "Structures" },
  { id: "binary-tree", name: "Binary tree", icon: TreePine, path: "/topics/binary-tree", group: "Structures" },
  { id: "graph", name: "Graph", icon: Network, path: "/topics/graph", group: "Structures" },
  { id: "bubble-sort", name: "Bubble sort", icon: ArrowUpDown, path: "/bubble-sort", group: "Algorithms" },
  { id: "quick-sort", name: "Quick sort", icon: Shuffle, path: "/quick-sort", group: "Algorithms" },
  { id: "dfs", name: "DFS", icon: Route, path: "/dfs", group: "Algorithms" },
  { id: "bfs", name: "BFS", icon: Route, path: "/bfs", group: "Algorithms" },
  { id: "dijkstra", name: "Dijkstra", icon: MapPin, path: "/dijkstra", group: "Algorithms" },
];

type SidebarProps = {
  onClose?: () => void;
  open?: boolean;
};

export default function Sidebar({ onClose, open = false }: SidebarProps) {
  const [location] = useLocation();
  const { data: progress = [] } = useQuery<UserProgress[]>({
    queryKey: ["/api/progress"],
    queryFn: progressApi.getUserProgress,
  });

  const completedIds = new Set(
    progress.filter((item) => item.completed).map((item) => item.topicId),
  );
  const completedCount = learningRoutes.filter((item) => completedIds.has(item.id)).length;

  return (
    <>
      <button
        type="button"
        className={`app-sidebar-scrim ${open ? "is-visible" : ""}`}
        onClick={onClose}
        aria-label="Close learning index"
      />
      <aside className={`app-sidebar ${open ? "is-open" : ""}`}>
        <div className="app-sidebar-brand-row">
          <Link href="/" className="app-sidebar-brand" onClick={onClose}>
            <span>
              <Waypoints aria-hidden="true" />
            </span>
            <strong>DSA Visualizer</strong>
          </Link>
          <button type="button" className="app-sidebar-close" onClick={onClose}>
            <X aria-hidden="true" />
            <span className="sr-only">Close learning index</span>
          </button>
        </div>

        <nav className="app-primary-nav" aria-label="Primary">
          {primaryRoutes.map((item) => {
            const Icon = item.icon;
            const active = location === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={active ? "is-active" : ""}
                onClick={onClose}
              >
                <Icon aria-hidden="true" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="app-learning-index">
          {["Structures", "Algorithms"].map((group) => (
            <section key={group}>
              <h2>{group}</h2>
              <ol>
                {learningRoutes
                  .filter((item) => item.group === group)
                  .map((item, index) => {
                    const Icon = item.icon;
                    const active = location === item.path;
                    const completed = completedIds.has(item.id);
                    return (
                      <li key={item.id}>
                        <Link
                          href={item.path}
                          className={active ? "is-active" : ""}
                          onClick={onClose}
                        >
                          <span className="app-route-index">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <Icon aria-hidden="true" />
                          <span>{item.name}</span>
                          {completed && <Check className="app-route-check" aria-label="Completed" />}
                        </Link>
                      </li>
                    );
                  })}
              </ol>
            </section>
          ))}
        </div>

        <div className="app-sidebar-progress">
          <div>
            <span>Path resolved</span>
            <strong>
              {completedCount}
              <small>/10</small>
            </strong>
          </div>
          <div
            className="app-progress-track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={10}
            aria-valuenow={completedCount}
            aria-label={`${completedCount} of 10 topics complete`}
          >
            <span style={{ transform: `scaleX(${completedCount / 10})` }} />
          </div>
        </div>
      </aside>
    </>
  );
}
