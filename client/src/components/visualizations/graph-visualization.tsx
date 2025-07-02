import React, { useState, useRef } from "react";

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

export default function GraphVisualization() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [draggedNode, setDraggedNode] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const nodeId = useRef(1);

  // Add a node at a random position
  const addNode = () => {
    const x = Math.random() * (SVG_WIDTH - 2 * NODE_RADIUS) + NODE_RADIUS;
    const y = Math.random() * (SVG_HEIGHT - 2 * NODE_RADIUS) + NODE_RADIUS;
    setNodes((prev) => [...prev, { id: nodeId.current++, x, y }]);
  };

  // Handle node click for edge creation
  const handleNodeClick = (id: number) => {
    if (selectedNode === null) {
      setSelectedNode(id);
    } else if (selectedNode !== id) {
      // Add edge if it doesn't exist
      if (!edges.some(e => (e.from === selectedNode && e.to === id) || (e.from === id && e.to === selectedNode))) {
        setEdges((prev) => [...prev, { from: selectedNode, to: id }]);
      }
      setSelectedNode(null);
    } else {
      setSelectedNode(null);
    }
  };

  // Drag logic
  const handleMouseDown = (id: number, e: React.MouseEvent) => {
    setDraggedNode(id);
    e.stopPropagation();
  };
  const handleMouseUp = () => setDraggedNode(null);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedNode !== null && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setNodes((prev) => prev.map(n => n.id === draggedNode ? { ...n, x, y } : n));
    }
  };

  // Reset graph
  const resetGraph = () => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    nodeId.current = 1;
  };

  return (
    <div>
      <div className="mb-2 flex gap-2">
        <button onClick={addNode} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Add Node</button>
        <button onClick={resetGraph} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Reset</button>
        <span className="text-sm text-gray-500">Click two nodes to add an edge. Drag nodes to move them.</span>
      </div>
      <svg
        ref={svgRef}
        width={SVG_WIDTH}
        height={SVG_HEIGHT}
        className="bg-white border rounded shadow"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Edges */}
        {edges.map((edge, i) => {
          const from = nodes.find(n => n.id === edge.from);
          const to = nodes.find(n => n.id === edge.to);
          if (!from || !to) return null;
          return (
            <line
              key={i}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="#888"
              strokeWidth={3}
            />
          );
        })}
        {/* Nodes */}
        {nodes.map((node) => (
          <g
            key={node.id}
            onMouseDown={e => handleMouseDown(node.id, e)}
            onClick={() => handleNodeClick(node.id)}
            style={{ cursor: 'pointer' }}
          >
            <circle
              cx={node.x}
              cy={node.y}
              r={NODE_RADIUS}
              fill={selectedNode === node.id ? '#2563eb' : '#60a5fa'}
              stroke="#1e40af"
              strokeWidth={selectedNode === node.id ? 4 : 2}
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
          </g>
        ))}
      </svg>
    </div>
  );
} 