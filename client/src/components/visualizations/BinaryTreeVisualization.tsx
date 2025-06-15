import React, { useState, useCallback, useEffect, useRef } from 'react';
import Tree, { RawNodeDatum } from 'react-d3-tree';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCw, Plus, Minus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Types
interface TreeNode { id: number; value: number; left: TreeNode | null; right: TreeNode | null; color: string; }

type ColorClass = 'bg-blue-500' | 'bg-green-500' | 'bg-purple-500' | 'bg-yellow-500' | 'bg-pink-500' | 'bg-indigo-500';
const COLORS: ColorClass[] = ['bg-blue-500','bg-green-500','bg-purple-500','bg-yellow-500','bg-pink-500','bg-indigo-500'];

export default function BinaryTreeVisualization() {
  const [tree, setTree] = useState<{ root: TreeNode | null; size: number }>({ root: null, size: 0 });
  const [inputValue, setInputValue] = useState('');
  const [data, setData] = useState<RawNodeDatum | undefined>(undefined);
  const [highlighted, setHighlighted] = useState<Set<number>>(new Set());
  const [isTraversing, setIsTraversing] = useState(false);
  const [traversalType, setTraversalType] = useState<'inorder' | 'preorder' | 'postorder'>('inorder');
  const [speed, setSpeed] = useState(1);
  // Default static canvas size
  const [dimensions, setDimensions] = useState({ width: 800, height: 800 });
  const [translate, setTranslate] = useState({ x: 400, y: 80 });
  const ref = useRef<HTMLDivElement>(null);

  // Reset tree
  const resetTree = useCallback(() => {
    setTree({ root: null, size: 0 });
    setData(undefined);
    setHighlighted(new Set());
    setIsTraversing(false);
  }, []);

  // Responsive dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (!ref.current) return;
      const container = ref.current;
      const containerWidth = container.getBoundingClientRect().width;
      const viewportHeight = window.innerHeight;
      const headerHeight = 64; // Approximate height of the header
      const controlsHeight = 80; // Height of the controls section
      const padding = 40; // Total vertical padding
      
      // Calculate available height for the tree
      const availableHeight = Math.max(400, viewportHeight - headerHeight - controlsHeight - padding);
      
      // Set dimensions with minimums
      const width = Math.max(600, containerWidth - 40);
      const height = Math.max(400, availableHeight);
      
      setDimensions({ width, height });
      setTranslate({ x: width / 2, y: 60 });
    };
    
    // Initial update
    updateDimensions();
    
    // Set up event listeners
    const ro = new ResizeObserver(updateDimensions);
    window.addEventListener('resize', updateDimensions);
    
    if (ref.current) {
      ro.observe(ref.current);
    }
    
    // Cleanup
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Color mapping
  const fillMap: Record<ColorClass, string> = {
    'bg-blue-500': '#3b82f6','bg-green-500': '#10b981','bg-purple-500': '#8b5cf6',
    'bg-yellow-500': '#f59e0b','bg-pink-500': '#ec4899','bg-indigo-500': '#6366f1',
  };
  const randColor = useCallback(() => COLORS[Math.floor(Math.random() * COLORS.length)], []);

  // BST insert (duplicates to right)
  const insertNode = useCallback(() => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    const newNode: TreeNode = { id: Date.now(), value: val, left: null, right: null, color: randColor() };
    setTree(prev => {
      if (!prev.root) return { root: newNode, size: 1 };
      const recurse = (n: TreeNode) => {
        if (val < n.value) n.left ? recurse(n.left) : (n.left = newNode);
        else n.right ? recurse(n.right) : (n.right = newNode);
      };
      recurse(prev.root);
      return { root: prev.root, size: prev.size + 1 };
    });
    setInputValue('');
  }, [inputValue, randColor]);

  // Convert to D3 data with single placeholder children
  const convert = useCallback((n: TreeNode | null): RawNodeDatum | undefined => {
    if (!n) return undefined;
    const left = convert(n.left);
    const right = convert(n.right);
    const kids: RawNodeDatum[] = [];
    if (left && right) kids.push(left, right);
    else if (left) kids.push(left, { name: '__placeholder', attributes: { id: -1, value: 0, color: 'bg-blue-500' } });
    else if (right) kids.push({ name: '__placeholder', attributes: { id: -1, value: 0, color: 'bg-blue-500' } }, right);
    return { name: String(n.value), attributes: { id: n.id, value: n.value, color: n.color }, children: kids.length ? kids : undefined };
  }, []);

  useEffect(() => {
    setData(convert(tree.root));
  }, [tree, convert]);

  // Traversal animation with cleanup
  const traverse = useCallback((type: 'inorder' | 'preorder' | 'postorder') => {
    if (!tree.root || isTraversing) return;
    
    setIsTraversing(true);
    const order: TreeNode[] = [];
    const dfs = (n: TreeNode | null) => {
      if (!n) return;
      if (type === 'preorder') order.push(n);
      dfs(n.left);
      if (type === 'inorder') order.push(n);
      dfs(n.right);
      if (type === 'postorder') order.push(n);
    };
    
    dfs(tree.root);
    let i = 0;
    let timeoutId: NodeJS.Timeout;
    let isMounted = true;
    
    const processTraversal = () => {
      if (!isMounted) return;
      
      if (i >= order.length) {
        timeoutId = setTimeout(() => {
          if (isMounted) {
            setHighlighted(new Set());
            setIsTraversing(false);
          }
        }, 300);
        return;
      }
      
      setHighlighted(new Set([order[i].id]));
      i++;
      timeoutId = setTimeout(processTraversal, 1000 / speed);
    };
    
    processTraversal();
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      setHighlighted(new Set());
    };
  }, [tree.root, speed, isTraversing]);

  // Custom node renderer always returns an element
  const renderNode = (args: any) => {
    const { nodeDatum } = args;
    if (nodeDatum.name === '__placeholder') return <g />;
    const id = nodeDatum.attributes.id as number;
    const isHi = highlighted.has(id);
    // Cast to our color type and get fill
    const colorClass = nodeDatum.attributes.color as ColorClass;
    const fillColor = fillMap[colorClass];
    return (
      <g>
        <circle
          r={24}
          fill={fillColor}
          stroke="#fff"
          strokeWidth={2}
          style={{
            filter: isHi ? 'drop-shadow(0 0 8px rgba(255,255,0,0.8))' : undefined,
            transform: isHi ? 'scale(1.1)' : 'scale(1)',
            transition: 'all .2s ease',
          }}
        />
        <text
          x={0}
          y={0}
          dy=".35em"
          textAnchor="middle"
          style={{
            fill: '#000',
            stroke: '#fff',
            strokeWidth: 2,
            paintOrder: 'stroke',
            fontSize: '24px',
            fontWeight: 'bold',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          {nodeDatum.name}
        </text>
      </g>
    );
  };

  return (
    <div ref={ref} className="w-full overflow-visible" style={{ height: dimensions.height + 80 }}>
      <div className="flex items-center gap-2 p-4 bg-white border-b">
        <Input type="number" placeholder="Enter a number" className="w-24" value={inputValue} onChange={e => setInputValue(e.target.value)} />
        <Button onClick={insertNode} disabled={!inputValue}><Plus className="w-4 h-4 mr-1"/>Add</Button>
        <Button variant="outline" onClick={resetTree} disabled={!tree.root}><RotateCw className="w-4 h-4 mr-1"/>Reset</Button>
        <Select value={traversalType} onValueChange={v => setTraversalType(v as any)}>
          <SelectTrigger className="w-32"><SelectValue/></SelectTrigger>
          <SelectContent><SelectItem value="inorder">In-order</SelectItem><SelectItem value="preorder">Pre-order</SelectItem><SelectItem value="postorder">Post-order</SelectItem></SelectContent>
        </Select>
        <Button onClick={() => traverse(traversalType)} disabled={!tree.root || isTraversing} variant="outline">
          {isTraversing ? <Pause className="w-4 h-4 mr-1"/> : <Play className="w-4 h-4 mr-1"/>}{isTraversing ? 'Stop' : 'Traverse'}
        </Button>
        <Minus className="w-4 h-4"/>
        <Slider min={0.5} max={5} step={0.5} value={[speed]} onValueChange={([v]) => setSpeed(v)} className="w-32"/>
      </div>
      {data ? (
        <Tree data={data} dimensions={dimensions} translate={translate} orientation="vertical" pathFunc="straight"
          pathClassFunc={(link: any) => link.target?.data?.name === '__placeholder' ? 'stroke-transparent stroke-0' : 'stroke-gray-400 stroke-2'}
          collapsible={false} zoomable zoom={0.8} nodeSize={{x:120,y:80}} separation={{siblings:1.5,nonSiblings:2}}
          transitionDuration={300} renderCustomNodeElement={renderNode} scaleExtent={{min:0.3,max:2}}
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Add nodes to build your tree.</p>
        </div>
      )}
    </div>
  );
}
