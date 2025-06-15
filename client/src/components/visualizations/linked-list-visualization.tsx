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

    setOperationType('insert');
    const newNode = createNode(value);
    setNextId(prev => prev + 1);

    if (insertPosition === 'beginning') {
      setList(prev => ({
        head: { ...newNode, next: prev.head },
        size: prev.size + 1,
      }));
    } else if (insertPosition === 'end') {
      if (!list.head) {
        setList({
          head: newNode,
          size: 1,
        });
      } else {
        let current = list.head;
        while (current.next) {
          current = current.next;
        }
        current.next = newNode;
        setList(prev => ({
          ...prev,
          size: prev.size + 1,
        }));
      }
    } else if (insertPosition === 'position') {
      const pos = parseInt(position);
      if (isNaN(pos) || pos < 0 || pos > list.size) return;

      if (pos === 0) {
        setList(prev => ({
          head: { ...newNode, next: prev.head },
          size: prev.size + 1,
        }));
      } else {
        let current = list.head;
        for (let i = 0; i < pos - 1 && current; i++) {
          current = current.next!;
        }
        if (current) {
          newNode.next = current.next;
          current.next = newNode;
          setList(prev => ({
            ...prev,
            size: prev.size + 1,
          }));
        }
      }
    }

    setInputValue("");
    setPosition("");
  };

  const deleteNode = () => {
    if (list.size === 0) return;
    setOperationType('delete');

    if (deletePosition === 'beginning') {
      if (list.head) {
        setList(prev => ({
          head: prev.head!.next,
          size: prev.size - 1,
        }));
      }
    } else if (deletePosition === 'end') {
      if (!list.head?.next) {
        setList({ head: null, size: 0 });
      } else {
        let current = list.head;
        while (current.next?.next) {
          current = current.next;
        }
        current.next = null;
        setList(prev => ({
          ...prev,
          size: prev.size - 1,
        }));
      }
    } else if (deletePosition === 'value') {
      const value = parseInt(inputValue);
      if (isNaN(value)) return;

      if (!list.head) return;

      if (list.head.value === value) {
        setList(prev => ({
          head: prev.head!.next,
          size: prev.size - 1,
        }));
        return;
      }

      let current = list.head;
      while (current.next && current.next.value !== value) {
        current = current.next;
      }

      if (current.next) {
        current.next = current.next.next;
        setList(prev => ({
          ...prev,
          size: prev.size - 1,
        }));
      }
    }

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

  const renderList = () => {
    const nodes = [];
    let current = list.head;
    let index = 0;

    while (current) {
      const isHighlighted = highlightedNode === current.id;
      nodes.push(
        <div key={current.id} className="flex flex-col items-center">
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                scale: isHighlighted ? [1, 1.1, 1] : 1,
                x: isHighlighted ? [0, 10, -10, 0] : 0
              }}
              transition={{ 
                duration: isHighlighted ? 0.5 : 0.3,
                times: isHighlighted ? [0, 0.2, 0.5, 1] : undefined
              }}
              className={`flex items-center justify-center w-16 h-16 rounded-lg ${current.color} text-white font-bold text-lg relative
                ${isHighlighted ? 'ring-4 ring-yellow-400' : ''}`}
            >
              {current.value}
              <div className="absolute -top-6 text-xs text-gray-500">
                {index === 0 ? 'Head' : `Node ${index + 1}`}
              </div>
            </motion.div>
            {current.next ? (
              <motion.div
                className="absolute -right-6 top-1/2 transform -translate-y-1/2"
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <ArrowRight className="w-8 h-8 text-gray-400" />
              </motion.div>
            ) : (
              <div className="absolute -right-6 top-1/2 transform -translate-y-1/2">
                <div className="w-8 h-8 flex items-center justify-center text-gray-400">
                  ∅
                </div>
              </div>
            )}
          </div>
        </div>
      );
      current = current.next;
      index++;
    }

    return (
      <div className="flex flex-wrap items-center gap-8 p-6 min-h-40 bg-gray-50 rounded-lg overflow-x-auto">
        {nodes.length > 0 ? (
          <AnimatePresence>
            {nodes.map((node, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: animationDuration }}
                className="flex items-center"
              >
                {node}
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="w-full text-center text-gray-400">
            Linked list is empty. Add some nodes!
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
                  deleteNode();
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
                  deleteNode();
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
              <span className="text-sm text-gray-500">Size: {list.size}</span>
            </div>
            {renderList()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}