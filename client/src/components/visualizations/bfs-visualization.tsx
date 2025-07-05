import React, { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, StepForward, RotateCcw, Shuffle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

function generateRandomGraph(n = 7): { nodes: Node[]; edges: Edge[] } {
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
  const extraEdges = Math.floor(Math.random() * 2) + 1;
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

export default function BfsVisualization() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [startNode, setStartNode] = useState<number | null>(null);
  const [bfsOrder, setBfsOrder] = useState<number[]>([]);
  const [visited, setVisited] = useState<Set<number>>(new Set());
  const [queue, setQueue] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState([5]);
  const [traversalEdges, setTraversalEdges] = useState<Edge[]>([]);
  const [parentMap, setParentMap] = useState<Record<number, number | null>>({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [lastPopped, setLastPopped] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    randomizeGraph();
    // eslint-disable-next-line
  }, []);

  const randomizeGraph = () => {
    const n = Math.floor(Math.random() * 3) + 6;
    const { nodes, edges } = generateRandomGraph(n);
    setNodes(nodes);
    setEdges(edges);
    setStartNode(null);
    setBfsOrder([]);
    setVisited(new Set());
    setQueue([]);
    setCurrentStep(0);
    setTraversalEdges([]);
    setParentMap({});
    setIsPlaying(false);
    setLastPopped(null);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleNodeClick = (id: number) => {
    if (isPlaying) return;
    setStartNode(id);
  };

  const resetTraversal = () => {
    setBfsOrder([]);
    setVisited(new Set());
    setQueue([]);
    setCurrentStep(0);
    setTraversalEdges([]);
    setParentMap({});
    setIsPlaying(false);
    setLastPopped(null);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  // Prepare BFS order, traversal edges, and parent map
  const prepareBfs = () => {
    if (startNode === null) return;
    const adj = buildAdjacencyList(nodes, edges);
    const order: number[] = [];
    const edgeOrder: Edge[] = [];
    const parent: Record<number, number | null> = {};
    const seen = new Set<number>();
    const q: number[] = [startNode];
    seen.add(startNode);
    parent[startNode] = null;
    while (q.length) {
      const u = q.shift()!;
      order.push(u);
      for (const v of adj[u]) {
        if (!seen.has(v)) {
          seen.add(v);
          parent[v] = u;
          edgeOrder.push({ from: u, to: v });
          q.push(v);
        }
      }
    }
    setBfsOrder(order);
    setTraversalEdges(edgeOrder);
    setParentMap(parent);
    setVisited(new Set());
    setQueue([startNode]);
    setCurrentStep(0);
  };

  // Step through BFS with discovery animation
  const step = () => {
    if (currentStep < bfsOrder.length) {
      const node = bfsOrder[currentStep];
      setLastPopped(node);
      setVisited(prev => new Set([...prev, node]));
      // Find all unvisited neighbors to be queued
      const adj = buildAdjacencyList(nodes, edges);
      const newQueued: number[] = [];
      for (const v of adj[node]) {
        if (!visited.has(v) && !queue.includes(v) && !newQueued.includes(v)) {
          newQueued.push(v);
        }
      }
      if (newQueued.length > 0) {
        setQueue(prev => [...prev.slice(1), ...newQueued]);
        setTimeout(() => {
          setQueue(prev => prev.slice(1));
          setCurrentStep(prev => prev + 1);
        }, 400);
      } else {
        setQueue(prev => prev.slice(1));
        setCurrentStep(prev => prev + 1);
      }
    } else {
      setIsPlaying(false);
    }
  };

  // Step back through BFS
  const stepBack = () => {
    if (currentStep > 0) {
      setVisited(prev => {
        const arr = Array.from(prev);
        arr.pop();
        return new Set(arr);
      });
      setLastPopped(null);
      // Recompute queue for previous step
      const prevQueue = [];
      for (let i = 0; i < currentStep - 1; i++) {
        const node = bfsOrder[i];
        for (const edge of traversalEdges) {
          if (edge.from === node && !bfsOrder.slice(0, i + 1).includes(edge.to)) {
            prevQueue.push(edge.to);
          }
        }
      }
      setQueue(prevQueue.length ? prevQueue : [bfsOrder[0]]);
      setCurrentStep(prev => prev - 1);
    }
  };

  useEffect(() => {
    if (isPlaying && currentStep < bfsOrder.length) {
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
  }, [isPlaying, currentStep, bfsOrder, animationSpeed]);

  const startBfs = () => {
    prepareBfs();
    setIsPlaying(false);
  };

  const play = () => {
    if (!isPlaying && currentStep < bfsOrder.length) setIsPlaying(true);
  };
  const pause = () => {
    setIsPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const isNodeVisited = (id: number) => visited.has(id);
  const isNodeCurrent = (id: number) => bfsOrder[currentStep] === id;
  const isNodeQueued = (id: number) => queue.includes(id) && !isNodeCurrent(id) && !isNodeVisited(id);
  const isEdgeTraversed = (from: number, to: number) => {
    return traversalEdges.slice(0, currentStep).some(e => (e.from === from && e.to === to) || (e.from === to && e.to === from));
  };

  // Compute neighbors to be queued for the current node
  const getNeighborsToBeQueued = () => {
    if (currentStep >= bfsOrder.length) return [];
    const node = bfsOrder[currentStep];
    const adj = buildAdjacencyList(nodes, edges);
    return (adj[node] || []).filter(
      v => !visited.has(v) && !queue.includes(v)
    );
  };
  const neighborsToBeQueued = getNeighborsToBeQueued();

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle>BFS Visualization</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={randomizeGraph}><Shuffle className="w-4 h-4 mr-1" />Randomize Graph</Button>
            <Button variant="outline" size="sm" onClick={resetTraversal}><RotateCcw className="w-4 h-4 mr-1" />Reset Traversal</Button>
            <Button size="sm" onClick={startBfs} disabled={startNode === null}>Start BFS</Button>
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
            return (
              <motion.line
                key={i}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={traversed ? "#f59e42" : "#888"}
                strokeWidth={traversed ? 5 : 3}
                initial={{ stroke: "#888" }}
                animate={{ stroke: traversed ? "#f59e42" : "#888", strokeWidth: traversed ? 5 : 3 }}
                transition={{ duration: 0.3 }}
              />
            );
          })}
          {/* Nodes */}
          {nodes.map((node) => {
            const visited = isNodeVisited(node.id);
            const current = isNodeCurrent(node.id);
            const isStart = startNode === node.id;
            const queued = isNodeQueued(node.id);
            const toBeQueued = neighborsToBeQueued.includes(node.id);
            return (
              <motion.g
                key={node.id}
                onClick={() => handleNodeClick(node.id)}
                style={{ cursor: 'pointer' }}
                initial={false}
                animate={{
                  scale: current ? 1.2 : queued ? 1.1 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r={NODE_RADIUS}
                  fill={current ? '#f59e42' : visited ? '#2563eb' : queued ? '#38bdf8' : isStart ? '#f59e42' : '#60a5fa'}
                  stroke={toBeQueued ? '#fbbf24' : '#1e40af'}
                  strokeWidth={toBeQueued ? 6 : current || isStart ? 4 : 2}
                  initial={false}
                  animate={{
                    fill: current ? '#f59e42' : visited ? '#2563eb' : queued ? '#38bdf8' : isStart ? '#f59e42' : '#60a5fa',
                    stroke: toBeQueued ? '#fbbf24' : '#1e40af',
                    strokeWidth: toBeQueued ? 6 : current || isStart ? 4 : 2,
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
        {/* Animated Queue List */}
        <div className="flex items-center mt-4 gap-4 justify-center min-h-[40px]">
          <span className="font-medium text-sm">Queue:</span>
          <div className="flex gap-2 items-center">
            <AnimatePresence initial={false}>
              {queue.map((id, idx) => (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.25 }}
                  className={`inline-block px-3 py-2 rounded bg-sky-400 text-white text-base font-bold border border-sky-600 shadow ${idx === 0 ? 'ring-2 ring-yellow-300' : ''}`}
                >
                  {id}
                  {idx === 0 && <span className="ml-1 text-xs">(front)</span>}
                </motion.div>
              ))}
            </AnimatePresence>
            {queue.length === 0 && <span className="text-xs text-gray-400 align-middle" style={{ lineHeight: '40px' }}>(empty)</span>}
          </div>
          {/* Popped element */}
          <div className="flex items-center gap-2 ml-6">
            <span className="font-medium text-sm">Popped:</span>
            <AnimatePresence>
              {lastPopped !== null && (
                <motion.div
                  key={lastPopped}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.25 }}
                  className="inline-block px-3 py-2 rounded bg-yellow-400 text-black text-base font-bold border border-yellow-600 shadow"
                >
                  {lastPopped}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        {/* Legend for Visited and Neighbors to be queued */}
        <div className="flex flex-wrap gap-6 mt-4 items-center justify-center">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">Visited:</span>
            {[...visited].map(id => (
              <span key={id} className="inline-block px-2 py-1 rounded bg-blue-700 text-white text-xs font-bold border border-blue-900">
                {id}
              </span>
            ))}
            {[...visited].length === 0 && <span className="text-xs text-gray-400">(none)</span>}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">Neighbors to be queued:</span>
            {neighborsToBeQueued.map(id => (
              <span key={id} className="inline-block px-2 py-1 rounded bg-yellow-400 text-black text-xs font-bold border border-yellow-600">
                {id}
              </span>
            ))}
            {neighborsToBeQueued.length === 0 && <span className="text-xs text-gray-400">(none)</span>}
          </div>
        </div>
      </CardContent>
      <div className="border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button onClick={stepBack} disabled={isPlaying || currentStep === 0}>Step Back</Button>
            <Button onClick={step} disabled={isPlaying || currentStep >= bfsOrder.length}> <StepForward className="w-4 h-4 mr-1" /> Step </Button>
            <Button onClick={play} disabled={isPlaying || currentStep >= bfsOrder.length}> <Play className="w-4 h-4 mr-1" /> Play </Button>
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