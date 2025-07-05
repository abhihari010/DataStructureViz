import React, { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, StepForward, RotateCcw, Shuffle } from "lucide-react";
import { motion } from "framer-motion";

interface Node {
  id: number;
  x: number;
  y: number;
}

interface Edge {
  from: number;
  to: number;
}

const NODE_RADIUS = 24;
const SVG_WIDTH = 700;
const SVG_HEIGHT = 400;

function buildAdjacencyList(nodes: Node[], edges: Edge[]): Record<number, number[]> {
  const adj: Record<number, number[]> = {};
  nodes.forEach(n => (adj[n.id] = []));
  edges.forEach(e => {
    adj[e.from].push(e.to);
    adj[e.to].push(e.from); // undirected
  });
  return adj;
}

// Generate a random connected sparse graph with n nodes and 1-2 extra edges
function generateRandomGraph(n = 7): { nodes: Node[]; edges: Edge[] } {
  // Place nodes in a circle for clarity
  const centerX = SVG_WIDTH / 2;
  const centerY = SVG_HEIGHT / 2;
  const radius = Math.min(SVG_WIDTH, SVG_HEIGHT) / 2 - 60;
  const nodes: Node[] = Array.from({ length: n }, (_, i) => {
    const angle = (2 * Math.PI * i) / n;
    return {
      id: i + 1,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });
  // Ensure connectivity with a random spanning tree
  const edges: Edge[] = [];
  const available = nodes.map(n => n.id);
  const connected = [available.shift()!];
  while (available.length) {
    const from = connected[Math.floor(Math.random() * connected.length)];
    const toIdx = Math.floor(Math.random() * available.length);
    const to = available.splice(toIdx, 1)[0];
    edges.push({ from, to });
    connected.push(to);
  }
  // Add only 1–2 extra random edges
  const extraEdges = Math.floor(Math.random() * 2) + 1; // 1 or 2
  let attempts = 0;
  while (edges.length < n - 1 + extraEdges && attempts < 20) {
    const a = nodes[Math.floor(Math.random() * n)].id;
    const b = nodes[Math.floor(Math.random() * n)].id;
    if (
      a !== b &&
      !edges.some(e => (e.from === a && e.to === b) || (e.from === b && e.to === a))
    ) {
      edges.push({ from: a, to: b });
    }
    attempts++;
  }
  return { nodes, edges };
}

export default function DfsVisualization() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [startNode, setStartNode] = useState<number | null>(null);
  const [dfsOrder, setDfsOrder] = useState<number[]>([]);
  const [visited, setVisited] = useState<Set<number>>(new Set());
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState([5]);
  const [traversalEdges, setTraversalEdges] = useState<Edge[]>([]);
  const [backtracking, setBacktracking] = useState(false);
  const [parentMap, setParentMap] = useState<Record<number, number | null>>({});
  const [backtrackPath, setBacktrackPath] = useState<number[]>([]); // nodes to animate during backtrack
  const [isAnimatingBacktrack, setIsAnimatingBacktrack] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // On mount and on randomize, generate a new graph
  useEffect(() => {
    randomizeGraph();
    // eslint-disable-next-line
  }, []);

  const randomizeGraph = () => {
    const n = Math.floor(Math.random() * 3) + 6; // 6-8 nodes
    // Only pass n, not m, to the new generator
    const { nodes, edges } = generateRandomGraph(n);
    setNodes(nodes);
    setEdges(edges);
    setStartNode(null);
    setDfsOrder([]);
    setVisited(new Set());
    setCurrentStep(0);
    setTraversalEdges([]);
    setIsPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  // Handle node click for start node selection
  const handleNodeClick = (id: number) => {
    if (isPlaying) return;
    setStartNode(id);
  };

  // Reset traversal only
  const resetTraversal = () => {
    setDfsOrder([]);
    setVisited(new Set());
    setCurrentStep(0);
    setTraversalEdges([]);
    setIsPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  // Prepare DFS order, traversal edges, and parent map
  const prepareDfs = () => {
    if (startNode === null) return;
    const adj = buildAdjacencyList(nodes, edges);
    const order: number[] = [];
    const edgeOrder: Edge[] = [];
    const seen = new Set<number>();
    const parent: Record<number, number | null> = {};
    function dfs(u: number, parentNode: number | null) {
      seen.add(u);
      order.push(u);
      parent[u] = parentNode;
      if (parentNode !== null) edgeOrder.push({ from: parentNode, to: u });
      for (const v of adj[u] || []) {
        if (!seen.has(v)) dfs(v, u);
      }
    }
    dfs(startNode, null);
    setDfsOrder(order);
    setTraversalEdges(edgeOrder);
    setParentMap(parent);
    setVisited(new Set());
    setCurrentStep(0);
  };

  // Helper to animate a path of nodes (for backtracking)
  const animateBacktrackPath = (path: number[], callback: () => void) => {
    setIsAnimatingBacktrack(true);
    setBacktrackPath(path);
    let idx = 0;
    const animateStep = () => {
      if (idx < path.length) {
        setBacktrackPath(path.slice(0, idx + 1));
        idx++;
        setTimeout(animateStep, 350);
      } else {
        setBacktrackPath([]);
        setIsAnimatingBacktrack(false);
        callback();
      }
    };
    animateStep();
  };

  // Step through DFS (with animated backtrack if needed)
  const step = () => {
    if (currentStep < dfsOrder.length) {
      const prevNode = currentStep === 0 ? null : dfsOrder[currentStep - 1];
      const nextNode = dfsOrder[currentStep];
      // If prevNode is not parent of nextNode, animate backtrack
      let path: number[] = [];
      let cur = prevNode;
      while (cur !== null && cur !== parentMap[nextNode]) {
        path.push(cur);
        cur = parentMap[cur]!;
      }
      if (path.length > 0) {
        // Animate backtrack path, then step
        animateBacktrackPath(path.reverse(), () => {
          setVisited(prev => new Set([...prev, nextNode]));
          setCurrentStep(prev => prev + 1);
        });
      } else {
        setVisited(prev => new Set([...prev, nextNode]));
        setCurrentStep(prev => prev + 1);
      }
    } else {
      setIsPlaying(false);
    }
  };

  // Step back through DFS (with animated backtrack if needed)
  const stepBack = () => {
    if (currentStep > 0) {
      const prevNode = dfsOrder[currentStep - 1];
      const nextNode = currentStep > 1 ? dfsOrder[currentStep - 2] : null;
      // If prevNode is not parent of nextNode, animate backtrack
      let path: number[] = [];
      let cur = prevNode;
      while (cur !== null && nextNode !== null && cur !== parentMap[nextNode]) {
        path.push(cur);
        cur = parentMap[cur]!;
      }
      if (path.length > 0) {
        animateBacktrackPath(path, () => {
          setVisited(prev => {
            const arr = Array.from(prev);
            arr.pop();
            return new Set(arr);
          });
          setCurrentStep(prev => prev - 1);
        });
      } else {
        setVisited(prev => {
          const arr = Array.from(prev);
          arr.pop();
          return new Set(arr);
        });
        setCurrentStep(prev => prev - 1);
      }
    }
  };

  // Play animation
  useEffect(() => {
    if (isPlaying && currentStep < dfsOrder.length) {
      timerRef.current = setTimeout(() => {
        step();
      }, (11 - animationSpeed[0]) * 100);
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line
  }, [isPlaying, currentStep, dfsOrder, animationSpeed]);

  // Start DFS
  const startDfs = () => {
    prepareDfs();
    setIsPlaying(false);
  };

  // Play, pause controls
  const play = () => {
    if (!isPlaying && currentStep < dfsOrder.length) setIsPlaying(true);
  };
  const pause = () => {
    setIsPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  // Highlight logic
  const isNodeVisited = (id: number) => visited.has(id);
  const isNodeCurrent = (id: number) => dfsOrder[currentStep - 1] === id;
  const isEdgeTraversed = (from: number, to: number) => {
    return traversalEdges.slice(0, currentStep - 1).some(e => (e.from === from && e.to === to) || (e.from === to && e.to === from));
  };

  // Helper to get edges in the current backtrack path
  const getBacktrackEdges = () => {
    const edges: [number, number][] = [];
    for (let i = 0; i < backtrackPath.length - 1; i++) {
      edges.push([backtrackPath[i], backtrackPath[i + 1]]);
    }
    return edges;
  };
  const backtrackEdges = getBacktrackEdges();

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle>DFS Visualization</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={randomizeGraph}><Shuffle className="w-4 h-4 mr-1" />Randomize Graph</Button>
            <Button variant="outline" size="sm" onClick={resetTraversal}><RotateCcw className="w-4 h-4 mr-1" />Reset Traversal</Button>
            <Button size="sm" onClick={startDfs} disabled={startNode === null}>Start DFS</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 flex-1">
        <div className="mb-2 text-sm text-gray-500">
          Click a node to select the start node (highlighted in orange).<br />
          The graph is randomly generated and always connected.
        </div>
        <svg
          ref={svgRef}
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          className="bg-white border rounded shadow"
        >
          {/* Edges */}
          {edges.map((edge, i) => {
            const from = nodes.find(n => n.id === edge.from);
            const to = nodes.find(n => n.id === edge.to);
            if (!from || !to) return null;
            const traversed = isEdgeTraversed(edge.from, edge.to);
            // Highlight edge if it's in the current backtrack path
            const isBacktrackEdge = backtrackEdges.some(([a, b]) =>
              (a === edge.from && b === edge.to) || (a === edge.to && b === edge.from)
            );
            return (
              <motion.line
                key={i}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={isBacktrackEdge ? "#fbbf24" : traversed ? "#f59e42" : "#888"}
                strokeWidth={isBacktrackEdge ? 6 : traversed ? 5 : 3}
                initial={{ stroke: "#888" }}
                animate={{ stroke: isBacktrackEdge ? "#fbbf24" : traversed ? "#f59e42" : "#888", strokeWidth: isBacktrackEdge ? 6 : traversed ? 5 : 3 }}
                transition={{ duration: 0.3 }}
              />
            );
          })}
          {/* Nodes */}
          {nodes.map((node) => {
            const visited = isNodeVisited(node.id);
            const current = isNodeCurrent(node.id);
            const isStart = startNode === node.id;
            // Animate backtrack path nodes
            const isBacktrackNode = backtrackPath.includes(node.id);
            return (
              <motion.g
                key={node.id}
                onClick={() => handleNodeClick(node.id)}
                style={{ cursor: 'pointer' }}
                initial={false}
                animate={{
                  scale: isBacktrackNode || current ? 1.2 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r={NODE_RADIUS}
                  fill={isBacktrackNode ? '#fbbf24' : current ? '#f59e42' : visited ? '#2563eb' : isStart ? '#f59e42' : '#60a5fa'}
                  stroke="#1e40af"
                  strokeWidth={current || isStart ? 4 : 2}
                  initial={false}
                  animate={{
                    fill: isBacktrackNode ? '#fbbf24' : current ? '#f59e42' : visited ? '#2563eb' : isStart ? '#f59e42' : '#60a5fa',
                    strokeWidth: current || isStart ? 4 : 2,
                  }}
                  transition={{ duration: 0.2 }}
                />
                <text
                  x={node.x}
                  y={node.y + 5}
                  textAnchor="middle"
                  fontSize={18}
                  fill="#fff"
                  fontWeight="bold"
                >
                  {node.id}
                </text>
              </motion.g>
            );
          })}
        </svg>
      </CardContent>
      <div className="border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button onClick={stepBack} disabled={isPlaying || currentStep === 0 || isAnimatingBacktrack}>Step Back</Button>
            <Button onClick={step} disabled={isPlaying || currentStep >= dfsOrder.length || isAnimatingBacktrack}> <StepForward className="w-4 h-4 mr-1" /> Step </Button>
            <Button onClick={play} disabled={isPlaying || currentStep >= dfsOrder.length || isAnimatingBacktrack}> <Play className="w-4 h-4 mr-1" /> Play </Button>
            <Button onClick={pause} disabled={!isPlaying}> <Pause className="w-4 h-4 mr-1" /> Pause </Button>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Speed:</span>
            <Slider
              value={animationSpeed}
              onValueChange={setAnimationSpeed}
              max={10}
              min={1}
              step={1}
              className="w-20"
            />
          </div>
        </div>
      </div>
    </Card>
  );
} 