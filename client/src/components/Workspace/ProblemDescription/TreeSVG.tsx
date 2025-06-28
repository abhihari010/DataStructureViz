import React from 'react';

function renderTree(node: any, x: number, y: number, dx: number, level = 0): React.ReactNode {
  if (!node) return null;
  const children = [] as React.ReactNode[];
  if (node.left) {
    children.push(
      <line x1={x} y1={y} x2={x - dx} y2={y + 60} stroke="#ccc" />,
      renderTree(node.left, x - dx, y + 60, dx / 1.5, level + 1)
    );
  }
  if (node.right) {
    children.push(
      <line x1={x} y1={y} x2={x + dx} y2={y + 60} stroke="#ccc" />,
      renderTree(node.right, x + dx, y + 60, dx / 1.5, level + 1)
    );
  }
  return (
    <g>
      <circle cx={x} cy={y} r={18} fill="#222" stroke="#fff" />
      <text x={x} y={y} textAnchor="middle" dy="0.35em" fill="#fff">{node.val}</text>
      {children}
    </g>
  );
}

export default function TreeSVG({ tree }: { tree: any }) {
  return (
    <svg width={300} height={180} style={{ display: 'block', margin: '0 auto' }}>
      {renderTree(tree, 150, 30, 60)}
    </svg>
  );
} 