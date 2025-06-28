import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play,
  Code,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Zap,
  BookOpen,
  Lightbulb,
  PlusCircle,
  MinusCircle,
  Search,
  Binary,
  Bookmark,
  Star
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import CodePanel from "@/components/code-panel";
import BinaryTreeVisualization from "@/components/visualizations/BinaryTreeVisualization";
import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import PracticeSection from "@/components/practice-section";

// Code examples for different languages
const codeExamples = {
  javascript: `// Binary Search Tree Implementation in JavaScript
class Node {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

class BinarySearchTree {
  constructor() {
    this.root = null;
    this.size = 0;
  }

  // Insert a new node with the given value
  insert(value) {
    const newNode = new Node(value);
    this.size++;
    
    if (!this.root) {
      this.root = newNode;
      return this;
    }
    
    let current = this.root;
    
    while (true) {
      if (value === current.value) return undefined;
      
      if (value < current.value) {
        if (!current.left) {
          current.left = newNode;
          return this;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = newNode;
          return this;
        }
        current = current.right;
      }
    }
  }
  
  find(value) {
    if (!this.root) return false;
    
    let current = this.root;
    let found = false;
    
    while (current && !found) {
      if (value < current.value) {
        current = current.left;
      } else if (value > current.value) {
        current = current.right;
      } else {
        found = true;
      }
    }
    
    return found ? current : false;
  }
  
  remove(value) {
    this.root = this._removeNode(this.root, value);
  }
  
  _removeNode(node, value) {
    if (!node) return null;
    
    if (value < node.value) {
      node.left = this._removeNode(node.left, value);
      return node;
    } else if (value > node.value) {
      node.right = this._removeNode(node.right, value);
      return node;
    } else {
      // Node with only one child or no child
      if (!node.left) return node.right;
      if (!node.right) return node.left;
      
      // Node with two children: Get the inorder successor (smallest in the right subtree)
      const temp = this._findMinNode(node.right);
      node.value = temp.value;
      node.right = this._removeNode(node.right, temp.value);
      return node;
    }
  }
  
  _findMinNode(node) {
    while (node.left) node = node.left;
    return node;
  }
}

// Example usage:
const bst = new BinarySearchTree();
bst.insert(10).insert(5).insert(15).insert(3).insert(7);
console.log(bst.find(7)); // Node with value 7
console.log(bst.find(99)); // false`,
  python: `# Binary Search Tree Implementation in Python
class Node:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

class BinarySearchTree:
    def __init__(self):
        self.root = None
        self.size = 0
    
    def insert(self, value):
        """Insert a new node with the given value"""
        self.size += 1
        new_node = Node(value)
        
        if not self.root:
            self.root = new_node
            return self
        
        current = self.root
        
        while True:
            if value == current.value:
                return None
                
            if value < current.value:
                if not current.left:
                    current.left = new_node
                    return self
                current = current.left
            else:
                if not current.right:
                    current.right = new_node
                    return self
                current = current.right
    
    def find(self, value):
        if not self.root:
            return False
            
        current = self.root
        found = False
        
        while current and not found:
            if value < current.value:
                current = current.left
            elif value > current.value:
                current = current.right
            else:
                found = True
                
        return current if found else False
    
    def remove(self, value):
        self.root = self._remove_node(self.root, value)
    
    def _remove_node(self, node, value):
        if not node:
            return None
            
        if value < node.value:
            node.left = self._remove_node(node.left, value)
            return node
        elif value > node.value:
            node.right = self._remove_node(node.right, value)
            return node
        else:
            # Node with only one child or no child
            if not node.left:
                return node.right
            if not node.right:
                return node.left
                
            # Node with two children: Get the inorder successor
            temp = self._find_min_node(node.right)
            node.value = temp.value
            node.right = self._remove_node(node.right, temp.value)
            return node
    
    def _find_min_node(self, node):
        while node.left:
            node = node.left
        return node

# Example usage:
bst = BinarySearchTree()
bst.insert(10).insert(5).insert(15).insert(3).insert(7)
print(bst.find(7))  # Node with value 7
print(bst.find(99))  # False`,
  java: `// Binary Search Tree Implementation in Java
class Node {
    int value;
    Node left, right;

    
    public Node(int value) {
        this.value = value;
        this.height = 1;
        left = right = null;
    }
}

public class BinarySearchTree {
    private Node root;
    private int size;
    
    public BinarySearchTree() {
        root = null;
        size = 0;
    }
    
    public int size() {
        return size;
    }
    
    public void insert(int value) {
        root = insertRec(root, value);
    }
    
    private Node insertRec(Node root, int value) {
        if (root == null) {
            root = new Node(value);
            return root;
        }
        
        if (value < root.value) {
            root.left = insertRec(root.left, value);
        } else if (value > root.value) {
            root.right = insertRec(root.right, value);
        }
        
        return root;
    }
    
    public Node search(int value) {
        return searchRec(root, value);
    }
    
    private Node searchRec(Node root, int value) {
        if (root == null || root.value == value) {
            return root;
        }
        
        if (value < root.value) {
            return searchRec(root.left, value);
        }
        
        return searchRec(root.right, value);
    }
    
    public void delete(int value) {
        root = deleteRec(root, value);
    }
    
    private Node deleteRec(Node root, int value) {
        if (root == null) {
            return root;
        }
        
        if (value < root.value) {
            root.left = deleteRec(root.left, value);
        } else if (value > root.value) {
            root.right = deleteRec(root.right, value);
        } else {
            // Node with only one child or no child
            if (root.left == null) {
                return root.right;
            } else if (root.right == null) {
                return root.left;
            }
            
            // Node with two children: Get the inorder successor
            root.value = minValue(root.right);
            
            // Delete the inorder successor
            root.right = deleteRec(root.right, root.value);
        }
        
        return root;
    }
    
    private int minValue(Node root) {
        int minv = root.value;
        while (root.left != null) {
            minv = root.left.value;
            root = root.left;
        }
        return minv;
    }
    
    public static void main(String[] args) {
        BinarySearchTree bst = new BinarySearchTree();
        bst.insert(10);
        bst.insert(5);
        bst.insert(15);
        bst.insert(3);
        bst.insert(7);
        
        System.out.println(bst.search(7) != null ? "Found" : "Not found");
        System.out.println(bst.search(99) != null ? "Found" : "Not found");
    }
}`
};



export default function BinaryTreePage() {
  const { theme } = useTheme();
  const [isCodeExpanded, setIsCodeExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState('implementation');
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="flex" style={{ height: 'calc(100vh - 4rem)' }}>
        <Sidebar />
        
        <main className="flex-1 overflow-auto">
          <div className="min-h-full flex flex-col">
            {/* Topic Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Binary Tree</h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    A tree data structure where each node has at most two children, referred to as the left and right child.
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    <Star className="w-3 h-3 mr-1" />
                    Intermediate
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="flex-1 p-6 space-y-6">
              {/* Key Concepts Section */}
              
              {/* Main Content Area */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left Column - Code Panel */}
                <div className="lg:col-span-2">
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden flex flex-col h-full">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          Implementation
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsCodeExpanded(!isCodeExpanded)}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            {isCodeExpanded ? (
                              <ChevronUp className="h-4 w-4 mr-1" />
                            ) : (
                              <ChevronDown className="h-4 w-4 mr-1" />
                            )}
                            {isCodeExpanded ? 'Collapse' : 'Expand'}
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Tabs 
                          value={activeTab} 
                          onValueChange={setActiveTab}
                          className="w-full"
                        >
                          <TabsList className="w-full">
                            <TabsTrigger value="implementation">Implementation</TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                    </div>
                    <div className={cn("flex-1 overflow-auto transition-all", isCodeExpanded ? 'max-h-[800px]' : 'h-[500px]')}>
                      <CodePanel codeExamples={codeExamples} />
                    </div>
                  </div>
                </div>
                
                {/* Right Column - Visualization and Traversals */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Main Visualization */}
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-visible flex flex-col">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Interactive Visualization
                      </h3>
                    </div>
                    <div className="p-4 flex items-center justify-center">
                      <BinaryTreeVisualization />
                    </div>
                  </div>
                </div>
              </div>

              {/* Practice Section */}
              <div className="mt-6">
                <PracticeSection topicId="binary-tree" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
