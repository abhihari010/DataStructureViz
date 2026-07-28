import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, 
  Minus, 
  RotateCcw,
  Shuffle,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Trash2,
  List,
  ListPlus,
  ListMinus,
  Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "@/components/count-up";

interface LinkedListNode {
  id: number;
  value: number;
  color: string;
  next: LinkedListNode | null;
}

const colors = [
  'bg-blue-500',
  'bg-green-500', 
  'bg-purple-500',
  'bg-pink-500',
  'bg-yellow-500',
  'bg-indigo-500',
  'bg-red-500',
];

type InsertPosition = 'beginning' | 'end' | 'position';
type DeletePosition = 'beginning' | 'end' | 'value';

const toNodeArray = (head: LinkedListNode | null) => {
  const nodes: Omit<LinkedListNode, "next">[] = [];
  let current = head;
  while (current) {
    nodes.push({ id: current.id, value: current.value, color: current.color });
    current = current.next;
  }
  return nodes;
};

const toLinkedList = (nodes: Omit<LinkedListNode, "next">[]) =>
  nodes.reduceRight<LinkedListNode | null>(
    (next, node) => ({ ...node, next }),
    null,
  );

export default function LinkedListVisualization() {
  const [list, setList] = useState<{
    head: LinkedListNode | null;
    size: number;
  }>({ head: null, size: 0 });
  
  const [inputValue, setInputValue] = useState<string>("");
  const [position, setPosition] = useState<string>("");
  const [animationSpeed, setAnimationSpeed] = useState([5]);
  const [highlightedNode, setHighlightedNode] = useState<number | null>(null);
  const [operationType, setOperationType] = useState<'insert' | 'delete' | 'search' | null>(null);
  const [insertPosition, setInsertPosition] = useState<InsertPosition>('end');
  const [deletePosition, setDeletePosition] = useState<DeletePosition>('end');
  const [searchResult, setSearchResult] = useState<{ found: boolean; position: number } | null>(null);
  const [nextId, setNextId] = useState(1);

  const animationDuration = (11 - animationSpeed[0]) * 0.1;

  // Initialize with sample data
  useEffect(() => {
    const node3: LinkedListNode = {
      id: 3,
      value: 8,
      color: 'bg-purple-500',
      next: null,
    };
    
    const node2: LinkedListNode = {
      id: 2,
      value: 17,
      color: 'bg-green-500',
      next: node3,
    };
    
    const node1: LinkedListNode = {
      id: 1,
      value: 42,
      color: 'bg-blue-500',
      next: node2,
    };
    
    setList({ head: node1, size: 3 });
    setNextId(4);
  }, []);

  const createNode = (value: number): LinkedListNode => ({
    id: nextId,
    value,
    color: colors[Math.floor(Math.random() * colors.length)],
    next: null,
  });

  const insertNode = () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) return;
    const parsedPosition = parseInt(position);
    if (
      insertPosition === "position" &&
      (isNaN(parsedPosition) || parsedPosition < 0 || parsedPosition > list.size)
    ) {
      return;
    }

    setOperationType('insert');
    const newNode = createNode(value);
    setNextId(prev => prev + 1);
    setList((currentList) => {
      const nodes = toNodeArray(currentList.head);
      const insertionIndex =
        insertPosition === "beginning"
          ? 0
          : insertPosition === "end"
            ? nodes.length
            : parsedPosition;
      nodes.splice(insertionIndex, 0, {
        id: newNode.id,
        value: newNode.value,
        color: newNode.color,
      });
      return { head: toLinkedList(nodes), size: nodes.length };
    });

    setInputValue("");
    setPosition("");
  };

  const deleteNode = (target: DeletePosition = deletePosition) => {
    if (list.size === 0) return;
    setOperationType('delete');
    const value = parseInt(inputValue);
    if (target === "value" && isNaN(value)) return;

    setList((currentList) => {
      const nodes = toNodeArray(currentList.head);
      const removalIndex =
        target === "beginning"
          ? 0
          : target === "end"
            ? nodes.length - 1
            : nodes.findIndex((node) => node.value === value);
      if (removalIndex < 0) return currentList;
      nodes.splice(removalIndex, 1);
      return { head: toLinkedList(nodes), size: nodes.length };
    });

    setInputValue("");
  };

  const searchNode = async () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) return;

    setOperationType('search');
    setSearchResult(null);
    setHighlightedNode(null);
    
    let current = list.head;
    let position = 0;
    let found = false;
    
    // Function to process each node with delay
    const processNode = async (node: LinkedListNode): Promise<boolean> => {
      // Highlight the current node being checked
      setHighlightedNode(node.id);
      
      // Add a small delay to see the animation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (node.value === value) {
        // Found the node
        setSearchResult({ found: true, position: position + 1 });
        return true;
      }
      
      // Not this node, remove highlight
      setHighlightedNode(null);
      return false;
    };
    
    // Process each node one by one
    while (current) {
      found = await processNode(current);
      if (found) break;
      
      current = current.next;
      position++;
    }
    
    if (!found) {
      setSearchResult({ found: false, position: -1 });
      setTimeout(() => {
        setSearchResult(null);
        setHighlightedNode(null);
      }, 2000);
    } else {
      setTimeout(() => {
        setHighlightedNode(null);
      }, 2000);
    }
  };

  const reset = () => {
    const node3: LinkedListNode = {
      id: 3,
      value: 8,
      color: 'bg-purple-500',
      next: null,
    };
    
    const node2: LinkedListNode = {
      id: 2,
      value: 17,
      color: 'bg-green-500',
      next: node3,
    };
    
    const node1: LinkedListNode = {
      id: 1,
      value: 42,
      color: 'bg-blue-500',
      next: node2,
    };
    
    setList({ head: node1, size: 3 });
    setNextId(4);
    setHighlightedNode(null);
    setSearchResult(null);
    setOperationType(null);
    setInputValue("");
    setPosition("");
  };

  const randomize = () => {
    const size = Math.floor(Math.random() * 5) + 2;
    if (size === 0) {
      setList({ head: null, size: 0 });
      return;
    }

    let head: LinkedListNode | null = null;
    let current: LinkedListNode | null = null;

    for (let i = 0; i < size; i++) {
      const newNode: LinkedListNode = {
        id: nextId + i,
        value: Math.floor(Math.random() * 100) + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        next: null,
      };

      if (!head) {
        head = newNode;
        current = head;
      } else {
        current!.next = newNode;
        current = newNode;
      }
    }

    setList({ head, size });
    setNextId(prev => prev + size);
  };

  const renderMotionList = () => {
    const nodes = toNodeArray(list.head);
    const entryOffset =
      insertPosition === "beginning"
        ? -72
        : insertPosition === "end"
          ? 72
          : 0;

    return (
      <div className="app-list-track flex min-h-40 flex-wrap items-center gap-8 overflow-x-auto rounded-lg bg-gray-50 p-6">
        {nodes.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {nodes.map((node, nodeIndex) => {
              const isHighlighted = highlightedNode === node.id;
              const hasNext = nodeIndex < nodes.length - 1;
              return (
                <motion.div
                  layout="position"
                  key={node.id}
                  initial={{ opacity: 0, x: entryOffset, y: -34, scale: 0.72 }}
                  animate={{
                    opacity: 1,
                    x: isHighlighted ? [0, 8, -8, 0] : 0,
                    y: 0,
                    scale: isHighlighted ? [1, 1.08, 1] : 1,
                  }}
                  exit={{ opacity: 0, y: -38, scale: 0.68 }}
                  transition={{
                    duration: animationDuration,
                    layout: { type: "spring", stiffness: 310, damping: 25 },
                  }}
                  className="app-list-node-wrap flex items-center"
                >
                  <div className="relative">
                    <div
                      className={`app-list-node flex h-16 w-16 items-center justify-center rounded-lg ${node.color} text-lg font-bold text-white ${
                        isHighlighted ? "is-highlighted" : ""
                      }`}
                    >
                      {node.value}
                      <span className="absolute -top-6 text-xs text-gray-500">
                        {nodeIndex === 0 ? "Head" : `Node ${nodeIndex + 1}`}
                      </span>
                    </div>
                    {hasNext ? (
                      <motion.div
                        className="absolute -right-6 top-1/2 -translate-y-1/2"
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        transition={{ duration: 0.35, delay: 0.1 }}
                        style={{ transformOrigin: "left center" }}
                      >
                        <ArrowRight className="h-8 w-8 text-gray-400" />
                      </motion.div>
                    ) : (
                      <div className="absolute -right-6 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-gray-400">
                        ∅
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        ) : (
          <div className="w-full text-center text-gray-400">
            Linked list is empty. Add a node to begin.
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle>Linked List Visualization</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={reset}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
            <Button size="sm" onClick={randomize}>
              <Shuffle className="w-4 h-4 mr-1" />
              Randomize
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <div className="p-6">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={operationType === 'insert' && insertPosition === 'beginning' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setOperationType('insert');
                  setInsertPosition('beginning');
                }}
              >
                <ArrowUp className="w-4 h-4 mr-1" />
                Insert at Start
              </Button>
              <Button
                variant={operationType === 'insert' && insertPosition === 'end' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setOperationType('insert');
                  setInsertPosition('end');
                }}
              >
                <ArrowDown className="w-4 h-4 mr-1" />
                Insert at End
              </Button>
              <Button
                variant={operationType === 'insert' && insertPosition === 'position' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setOperationType('insert');
                  setInsertPosition('position');
                }}
              >
                <ListPlus className="w-4 h-4 mr-1" />
                Insert at Position
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={operationType === 'delete' && deletePosition === 'beginning' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setOperationType('delete');
                  setDeletePosition('beginning');
                  deleteNode('beginning');
                }}
              >
                <ListMinus className="w-4 h-4 mr-1" />
                Delete from Start
              </Button>
              <Button
                variant={operationType === 'delete' && deletePosition === 'end' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setOperationType('delete');
                  setDeletePosition('end');
                  deleteNode('end');
                }}
              >
                <ListMinus className="w-4 h-4 mr-1" />
                Delete from End
              </Button>
              <Button
                variant={operationType === 'delete' && deletePosition === 'value' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setOperationType('delete');
                  setDeletePosition('value');
                }}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete by Value
              </Button>
              <Button
                variant={operationType === 'search' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setOperationType('search');
                  searchNode();
                }}
              >
                <Search className="w-4 h-4 mr-1" />
                Search
              </Button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {operationType === 'search' 
                  ? 'Search Value' 
                  : operationType === 'delete' && deletePosition === 'value'
                    ? 'Delete Value'
                    : 'Node Value'}
              </label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Enter a number"
                  className="flex-1"
                />
                {operationType === 'insert' && insertPosition === 'position' && (
                  <Input
                    type="number"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="Position"
                    className="w-24"
                    min="0"
                    max={list.size}
                  />
                )}
                <Button 
                  onClick={() => {
                    if (operationType === 'insert') insertNode();
                    else if (operationType === 'delete' && deletePosition === 'value') deleteNode();
                    else if (operationType === 'search') searchNode();
                  }}
                  disabled={!inputValue || (operationType === 'insert' && insertPosition === 'position' && !position)}
                >
                  {operationType === 'insert' ? 'Insert' : operationType === 'search' ? 'Search' : 'Delete'}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Animation Speed
                </label>
                <span className="text-sm text-gray-500">
                  {animationSpeed[0]}/10
                </span>
              </div>
              <Slider
                value={animationSpeed}
                onValueChange={setAnimationSpeed}
                min={1}
                max={10}
                step={1}
                className="py-4"
              />
            </div>
          </div>

          {searchResult !== null && (
            <div className={`mt-4 p-3 rounded-md ${searchResult.found ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {searchResult.found 
                ? `✅ Found value at position ${searchResult.position}, index ${searchResult.position - 1}`
                : '❌ Value not found in the list'}
            </div>
          )}

          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium">Linked List</h3>
              <span className="text-sm text-gray-500" aria-live="polite">
                Size: <CountUp value={list.size} />
              </span>
            </div>
            {renderMotionList()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
