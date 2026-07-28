import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus, RotateCcw } from "lucide-react";
import { useRef, useState } from "react";

interface GraphNode {
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

export default function GraphVisualization() {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [draggedNode, setDraggedNode] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const nodeId = useRef(1);
  const reduceMotion = useReducedMotion();

  const addNode = () => {
    const x = Math.random() * (SVG_WIDTH - 2 * NODE_RADIUS) + NODE_RADIUS;
    const y = Math.random() * (SVG_HEIGHT - 2 * NODE_RADIUS) + NODE_RADIUS;
    setNodes((current) => [...current, { id: nodeId.current++, x, y }]);
  };

  const handleNodeClick = (id: number) => {
    if (selectedNode === null) {
      setSelectedNode(id);
      return;
    }

    if (selectedNode !== id) {
      const exists = edges.some(
        (edge) =>
          (edge.from === selectedNode && edge.to === id) ||
          (edge.from === id && edge.to === selectedNode),
      );
      if (!exists) {
        setEdges((current) => [...current, { from: selectedNode, to: id }]);
      }
    }
    setSelectedNode(null);
  };

  const moveDraggedNode = (event: React.PointerEvent<SVGSVGElement>) => {
    if (draggedNode === null || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * SVG_WIDTH;
    const y = ((event.clientY - rect.top) / rect.height) * SVG_HEIGHT;
    setNodes((current) =>
      current.map((node) =>
        node.id === draggedNode
          ? {
              ...node,
              x: Math.max(NODE_RADIUS, Math.min(SVG_WIDTH - NODE_RADIUS, x)),
              y: Math.max(NODE_RADIUS, Math.min(SVG_HEIGHT - NODE_RADIUS, y)),
            }
          : node,
      ),
    );
  };

  const resetGraph = () => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setDraggedNode(null);
    nodeId.current = 1;
  };

  return (
    <div className="app-graph-tool">
      <div className="app-graph-toolbar">
        <button type="button" onClick={addNode}>
          <Plus aria-hidden="true" />
          Add node
        </button>
        <button type="button" onClick={resetGraph}>
          <RotateCcw aria-hidden="true" />
          Reset
        </button>
        <span id="graph-instructions">
          Select two nodes to draw an edge. Drag a node to move it.
        </span>
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className="app-graph-canvas"
        aria-describedby="graph-instructions"
        aria-label="Interactive graph visualization"
        role="img"
        onPointerMove={moveDraggedNode}
        onPointerUp={() => setDraggedNode(null)}
        onPointerLeave={() => setDraggedNode(null)}
      >
        <AnimatePresence>
          {edges.map((edge) => {
            const from = nodes.find((node) => node.id === edge.from);
            const to = nodes.find((node) => node.id === edge.to);
            if (!from || !to) return null;
            return (
              <motion.line
                key={`${edge.from}-${edge.to}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="currentColor"
                strokeWidth={3}
                initial={reduceMotion ? false : { opacity: 0, pathLength: 0 }}
                animate={{ opacity: 1, pathLength: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              />
            );
          })}
        </AnimatePresence>
        <AnimatePresence>
          {nodes.map((node) => (
            <motion.g
              key={node.id}
              role="button"
              tabIndex={0}
              aria-label={`Node ${node.id}${selectedNode === node.id ? ", selected" : ""}`}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.55, y: -28 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ type: "spring", stiffness: 340, damping: 21 }}
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                setDraggedNode(node.id);
                event.stopPropagation();
              }}
              onClick={() => handleNodeClick(node.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleNodeClick(node.id);
                }
              }}
            >
              <circle
                cx={node.x}
                cy={node.y}
                r={NODE_RADIUS}
                className={selectedNode === node.id ? "is-selected" : ""}
              />
              <text x={node.x} y={node.y + 6} textAnchor="middle">
                {node.id}
              </text>
            </motion.g>
          ))}
        </AnimatePresence>
      </svg>
    </div>
  );
}
