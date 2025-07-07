import React, { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shuffle, Play, Pause, StepForward, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Node {
  id: number;
  x: number;
  y: number;
}

interface Edge {
  from: number;
  to: number;
  weight: number;
}

const NODE_RADIUS = 24;
const SVG_WIDTH = 700;
const SVG_HEIGHT = 400;
const INF = 1e9;

function generateRandomDirectedGraph(n = 7): { nodes: Node[]; edges: Edge[] } {
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
  for (let from = 1; from <= n; from++) {
    const numEdges = Math.floor(Math.random() * 2) + 1;
    const targets = new Set<number>();
    while (targets.size < numEdges) {
      const to = Math.floor(Math.random() * n) + 1;
      if (to !== from && !edges.some(e => e.from === from && e.to === to)) {
        targets.add(to);
      }
    }
    for (const to of targets) {
      edges.push({ from, to, weight: Math.floor(Math.random() * 9) + 1 });
    }
  }
  return { nodes, edges };
}

function buildAdjacencyList(nodes: Node[], edges: Edge[]): Record<number, { to: number; weight: number }[]> {
  const adj: Record<number, { to: number; weight: number }[]> = {};
  nodes.forEach(n => (adj[n.id] = []));
  edges.forEach(e => {
    adj[e.from].push({ to: e.to, weight: e.weight });
  });
  return adj;
}

export default function DijkstraVisualization() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [startNode, setStartNode] = useState<number | null>(null);
  const [dist, setDist] = useState<Record<number, number>>({});
  const [visited, setVisited] = useState<Set<number>>(new Set());
  const [heap, setHeap] = useState<[number, number][]>([]); // [distance, node]
  const [current, setCurrent] = useState<number | null>(null);
  const [relaxingEdge, setRelaxingEdge] = useState<{ from: number; to: number } | null>(null);
  const [stepQueue, setStepQueue] = useState<any[]>([]); // for step/play
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState([5]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [edgeQueue, setEdgeQueue] = useState<{from: number, to: number, weight: number}[]>([]);
  const [edgeRelaxIdx, setEdgeRelaxIdx] = useState(0);

  useEffect(() => {
    randomizeGraph();
    // eslint-disable-next-line
  }, []);

  const randomizeGraph = () => {
    const n = Math.floor(Math.random() * 3) + 6;
    const { nodes, edges } = generateRandomDirectedGraph(n);
    setNodes(nodes);
    setEdges(edges);
    setStartNode(null);
    setDist({});
    setVisited(new Set());
    setHeap([]);
    setCurrent(null);
    setRelaxingEdge(null);
    setStepQueue([]);
    setIsPlaying(false);
    setEdgeQueue([]);
    setEdgeRelaxIdx(0);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleNodeClick = (id: number) => {
    if (isPlaying) return;
    setStartNode(id);
    // Initialize Dijkstra state
    const d: Record<number, number> = {};
    nodes.forEach(n => (d[n.id] = INF));
    d[id] = 0;
    setDist(d);
    setVisited(new Set());
    setHeap([[0, id]]);
    setCurrent(null);
    setRelaxingEdge(null);
    setStepQueue([]);
    setEdgeQueue([]);
    setEdgeRelaxIdx(0);
  };

  // Modified step logic for sequential edge relaxation
  const step = () => {
    if (edgeQueue.length > 0) {
      // Relax the next edge in the queue
      const { from, to, weight } = edgeQueue[edgeRelaxIdx];
      setRelaxingEdge({ from, to });
      let didRelax = false;
      let newDist = { ...dist };
      let newHeapArr = [...heap];
      const [d] = heap[0]; // Current node's distance
      if (!Array.from(visited).includes(to) && d + weight < (dist[to] ?? INF)) {
        newDist[to] = d + weight;
        newHeapArr.push([d + weight, to]);
        didRelax = true;
      }
      setTimeout(() => {
        setDist(newDist);
        setHeap(newHeapArr.sort((a, b) => a[0] - b[0]));
        setRelaxingEdge(null);
        if (edgeRelaxIdx + 1 < edgeQueue.length) {
          setEdgeRelaxIdx(edgeRelaxIdx + 1);
        } else {
          // Finished all edges for this node
          setEdgeQueue([]);
          setEdgeRelaxIdx(0);
          // Mark node as visited and pop from heap
          setVisited(prev => {
            const arr: number[] = [];
            prev.forEach(v => arr.push(v));
            arr.push(current!);
            return new Set(arr);
          });
          setHeap(h => h.slice(1));
          setCurrent(null);
        }
      }, 400);
      return;
    }
    // If not currently relaxing edges, pop next node
    if (heap.length === 0) {
      setCurrent(null);
      setRelaxingEdge(null);
      setIsPlaying(false);
      return;
    }
    const [d, u] = heap[0];
    setCurrent(u);
    const adj = buildAdjacencyList(nodes, edges);
    setEdgeQueue(adj[u].map(e => ({ from: u, to: e.to, weight: e.weight })));
    setEdgeRelaxIdx(0);
    // If no outgoing edges, mark as visited and pop
    if (adj[u].length === 0) {
      setVisited(prev => {
        const arr: number[] = [];
        prev.forEach(v => arr.push(v));
        arr.push(u);
        return new Set(arr);
      });
      setHeap(h => h.slice(1));
      setCurrent(null);
    }
  };

  useEffect(() => {
    if (isPlaying && (heap.length > 0 || edgeQueue.length > 0)) {
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
  }, [isPlaying, heap, animationSpeed, edgeQueue, edgeRelaxIdx]);

  const play = () => {
    if (!isPlaying && heap.length > 0) setIsPlaying(true);
  };
  const pause = () => {
    setIsPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };
  const reset = () => {
    setStartNode(null);
    setDist({});
    setVisited(new Set());
    setHeap([]);
    setCurrent(null);
    setRelaxingEdge(null);
    setStepQueue([]);
    setIsPlaying(false);
    setEdgeQueue([]);
    setEdgeRelaxIdx(0);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  // Highlight logic
  const isNodeVisited = (id: number) => Array.from(visited).includes(id);
  const isNodeCurrent = (id: number) => current === id;
  const isEdgeRelaxing = (from: number, to: number) => relaxingEdge && relaxingEdge.from === from && relaxingEdge.to === to;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle>Dijkstra Visualization</CardTitle>
          <Button variant="outline" size="sm" onClick={randomizeGraph}>
            <Shuffle className="w-4 h-4 mr-1" />Randomize Graph
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 flex-1">
        <svg
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          className="bg-white border rounded shadow"
        >
          {/* Edges with arrows (no weight badges) */}
          {edges.map((edge, i) => {
            const from = nodes.find(n => n.id === edge.from);
            const to = nodes.find(n => n.id === edge.to);
            if (!from || !to) return null;
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const ux = dx / len;
            const uy = dy / len;
            const startX = from.x + ux * NODE_RADIUS;
            const startY = from.y + uy * NODE_RADIUS;
            const endX = to.x - ux * NODE_RADIUS;
            const endY = to.y - uy * NODE_RADIUS;
            const arrowSize = 10;
            const arrowAngle = Math.PI / 7;
            const angle = Math.atan2(dy, dx);
            const arrowX1 = endX - arrowSize * Math.cos(angle - arrowAngle);
            const arrowY1 = endY - arrowSize * Math.sin(angle - arrowAngle);
            const arrowX2 = endX - arrowSize * Math.cos(angle + arrowAngle);
            const arrowY2 = endY - arrowSize * Math.sin(angle + arrowAngle);
            const highlight = isEdgeRelaxing(edge.from, edge.to);
            return (
              <g key={i}>
                <line
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke={highlight ? "#fbbf24" : "#888"}
                  strokeWidth={highlight ? 6 : 3}
                  markerEnd={`url(#arrowhead${i})`}
                />
                <polygon
                  points={`${endX},${endY} ${arrowX1},${arrowY1} ${arrowX2},${arrowY2}`}
                  fill={highlight ? "#fbbf24" : "#888"}
                />
              </g>
            );
          })}
          {/* Nodes with distances */}
          {nodes.map((node) => {
            const visited = isNodeVisited(node.id);
            const current = isNodeCurrent(node.id);
            return (
              <g key={node.id} onClick={() => handleNodeClick(node.id)} style={{ cursor: isPlaying ? 'default' : 'pointer' }}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={NODE_RADIUS}
                  fill={current ? '#f59e42' : visited ? '#2563eb' : startNode === node.id ? '#f59e42' : '#60a5fa'}
                  stroke="#1e40af"
                  strokeWidth={current || startNode === node.id ? 4 : 2}
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
                {/* Distance label */}
                {startNode && (
                  <g>
                    <rect
                      x={node.x - 18}
                      y={node.y - 44}
                      width={36}
                      height={22}
                      rx={6}
                      fill="#fff"
                      stroke="#f59e42"
                      strokeWidth={2}
                    />
                    <text
                      x={node.x}
                      y={node.y - 29}
                      textAnchor="middle"
                      fontSize={14}
                      fill="#f59e42"
                      fontWeight="bold"
                    >
                      {dist[node.id] === undefined ? "∞" : dist[node.id] === INF ? "∞" : dist[node.id]}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
        {/* Min-Heap (Priority Queue) Visualization */}
        <div className="flex flex-col items-center mt-4">
          <span className="font-medium text-sm mb-1">Min-Heap (Priority Queue):</span>
          <div className="flex gap-2 min-h-[40px]">
            <AnimatePresence initial={false}>
              {heap.map(([d, id], idx) => (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.25 }}
                  className={`inline-block px-3 py-2 rounded bg-sky-400 text-white text-base font-bold border border-sky-600 shadow ${idx === 0 ? 'ring-2 ring-yellow-300' : ''}`}
                >
                  ({d === INF ? "∞" : d}, {id})
                  {idx === 0 && <span className="ml-1 text-xs">(min)</span>}
                </motion.div>
              ))}
            </AnimatePresence>
            {heap.length === 0 && <span className="text-xs text-gray-400 align-middle" style={{ lineHeight: '40px' }}>(empty)</span>}
          </div>
        </div>
        {/* Edge Weights Legend */}
        <div className="mt-4">
          <div className="font-medium text-sm mb-1">Edge Weights:</div>
          <div className="flex flex-wrap gap-4">
            {edges
              .slice()
              .sort((a, b) => a.from - b.from || a.to - b.to)
              .map((edge, i) => (
                <span key={i} className={`inline-block px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs font-mono border border-gray-300 ${isEdgeRelaxing(edge.from, edge.to) ? 'ring-2 ring-yellow-400 border-yellow-400' : ''}`}>
                  {edge.from} → {edge.to}: <b>{edge.weight}</b>
                </span>
              ))}
          </div>
        </div>
        {/* Controls */}
        <div className="border-t border-gray-200 px-6 py-4 mt-4">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-4">
              <Button onClick={step} disabled={isPlaying || heap.length === 0}> <StepForward className="w-4 h-4 mr-1" /> Step </Button>
              <Button onClick={play} disabled={isPlaying || heap.length === 0}> <Play className="w-4 h-4 mr-1" /> Play </Button>
              <Button onClick={pause} disabled={!isPlaying}> <Pause className="w-4 h-4 mr-1" /> Pause </Button>
            </div>
            <div className="flex items-center justify-between">
              <Button onClick={reset} variant="outline"> <RotateCcw className="w-4 h-4 mr-1" /> Reset </Button>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Speed:</span>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={animationSpeed[0]}
                  onChange={e => setAnimationSpeed([parseInt(e.target.value)])}
                  className="w-20"
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 