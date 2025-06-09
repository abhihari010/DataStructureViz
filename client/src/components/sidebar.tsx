import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link, useLocation } from "wouter";
import { progressApi } from "@/lib/api";
import { UserProgress } from "@shared/schema";
import { 
  Layers, 
  List, 
  Link as LinkIcon, 
  TreePine, 
  Network, 
  ArrowUpDown, 
  Shuffle,
  Route,
  MapPin,
  Check 
} from "lucide-react";

const dataStructures = [
  { id: "stack", name: "Stack", icon: Layers, path: "/stack" },
  { id: "queue", name: "Queue", icon: List, path: "/queue" },
  { id: "linked-list", name: "Linked List", icon: LinkIcon, path: "/linked-list" },
  { id: "binary-tree", name: "Binary Tree", icon: TreePine, path: "/binary-tree" },
  { id: "graph", name: "Graph", icon: Network, path: "/graph" },
];

const algorithms = [
  { id: "bubble-sort", name: "Bubble Sort", icon: ArrowUpDown, path: "/bubble-sort" },
  { id: "quick-sort", name: "Quick Sort", icon: Shuffle, path: "/quick-sort" },
  { id: "dfs-bfs", name: "DFS/BFS", icon: Route, path: "/dfs-bfs" },
  { id: "dijkstra", name: "Dijkstra's", icon: MapPin, path: "/dijkstra" },
];

export default function Sidebar() {
  const [location] = useLocation();
  
  const { data: progress } = useQuery<UserProgress[]>({
    queryKey: ["/api/progress"],
    queryFn: progressApi.getUserProgress,
  });

  const isTopicCompleted = (topicId: string) => {
    return progress?.some(p => p.topicId === topicId && p.completed) || false;
  };

  const isTopicActive = (path: string) => {
    return location === path;
  };

  const completedCount = progress?.filter(p => p.completed).length || 0;
  const totalTopics = dataStructures.length + algorithms.length;
  const completionPercentage = (completedCount / totalTopics) * 100;

  const NavItem = ({ item, isActive, isCompleted }: { 
    item: any, 
    isActive: boolean, 
    isCompleted: boolean 
  }) => {
    const Icon = item.icon;
    
    return (
      <Link
        href={item.path}
        className={`
          flex items-center justify-between p-2 rounded-lg transition-colors
          ${isActive 
            ? 'bg-primary text-white' 
            : 'text-gray-700 hover:bg-gray-100'
          }
        `}
      >
        <div className="flex items-center space-x-3">
          <Icon className="w-4 h-4" />
          <span className="text-sm font-medium">{item.name}</span>
        </div>
        {isActive && (
          <Badge variant="secondary" className="bg-white bg-opacity-20 text-white text-xs">
            Active
          </Badge>
        )}
        {isCompleted && !isActive && (
          <Check className="w-4 h-4 text-green-600" />
        )}
      </Link>
    );
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Topics</h2>
        
        {/* Data Structures Section */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Data Structures
          </h3>
          <ul className="space-y-2">
            {dataStructures.map((item) => (
              <li key={item.id}>
                <NavItem 
                  item={item} 
                  isActive={isTopicActive(item.path)}
                  isCompleted={isTopicCompleted(item.id)}
                />
              </li>
            ))}
          </ul>
        </div>

        {/* Algorithms Section */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Algorithms
          </h3>
          <ul className="space-y-2">
            {algorithms.map((item) => (
              <li key={item.id}>
                <NavItem 
                  item={item} 
                  isActive={isTopicActive(item.path)}
                  isCompleted={isTopicCompleted(item.id)}
                />
              </li>
            ))}
          </ul>
        </div>

        {/* Progress Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Progress</h4>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-600">Completed</span>
            <span className="text-xs font-medium text-gray-900">
              {completedCount}/{totalTopics}
            </span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>
      </div>
    </aside>
  );
}
