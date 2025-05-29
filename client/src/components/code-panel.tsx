import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const codeExamples = {
  javascript: `class Stack {
  constructor() {
    this.items = [];
  }

  // Add element to top of stack
  push(element) {
    this.items.push(element);
    return this.items.length;
  }

  // Remove and return top element
  pop() {
    if (this.isEmpty()) {
      return null;
    }
    return this.items.pop();
  }

  // Peek at top element
  peek() {
    return this.items[this.items.length - 1];
  }

  // Check if stack is empty
  isEmpty() {
    return this.items.length === 0;
  }

  // Get stack size
  size() {
    return this.items.length;
  }
}`,
  java: `public class Stack<T> {
    private List<T> items;
    
    public Stack() {
        this.items = new ArrayList<>();
    }
    
    // Add element to top of stack
    public void push(T element) {
        items.add(element);
    }
    
    // Remove and return top element
    public T pop() {
        if (isEmpty()) {
            return null;
        }
        return items.remove(items.size() - 1);
    }
    
    // Peek at top element
    public T peek() {
        if (isEmpty()) {
            return null;
        }
        return items.get(items.size() - 1);
    }
    
    // Check if stack is empty
    public boolean isEmpty() {
        return items.isEmpty();
    }
    
    // Get stack size
    public int size() {
        return items.size();
    }
}`,
  python: `class Stack:
    def __init__(self):
        self.items = []
    
    # Add element to top of stack
    def push(self, element):
        self.items.append(element)
        return len(self.items)
    
    # Remove and return top element
    def pop(self):
        if self.is_empty():
            return None
        return self.items.pop()
    
    # Peek at top element
    def peek(self):
        if self.is_empty():
            return None
        return self.items[-1]
    
    # Check if stack is empty
    def is_empty(self):
        return len(self.items) == 0
    
    # Get stack size
    def size(self):
        return len(self.items)`
};

export default function CodePanel() {
  const [selectedLanguage, setSelectedLanguage] = useState<keyof typeof codeExamples>('javascript');

  const formatCode = (code: string) => {
    return code.split('\n').map((line, index) => (
      <div key={index} className="relative">
        <span className="text-gray-500 select-none mr-4 text-xs">
          {(index + 1).toString().padStart(2, '0')}
        </span>
        <span className="font-code text-sm">
          {line.replace(/^\s*/, (match) => '\u00A0'.repeat(match.length))}
        </span>
      </div>
    ));
  };

  return (
    <Card className="h-full flex flex-col">
      {/* Code Header */}
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle>Implementation</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant={selectedLanguage === 'javascript' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedLanguage('javascript')}
            >
              JavaScript
            </Button>
            <Button
              variant={selectedLanguage === 'java' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedLanguage('java')}
            >
              Java
            </Button>
            <Button
              variant={selectedLanguage === 'python' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedLanguage('python')}
            >
              Python
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Code Content */}
      <CardContent className="flex-1 p-0 overflow-auto">
        <div className="p-4 bg-slate-900 text-gray-100 h-full font-code text-sm leading-relaxed">
          <div className="space-y-1">
            {formatCode(codeExamples[selectedLanguage])}
          </div>
        </div>
      </CardContent>

      {/* Operation Info */}
      <div className="border-t border-gray-200 p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Time Complexity:</span>
            <Badge variant="outline" className="font-code">O(1)</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Space Complexity:</span>
            <Badge variant="outline" className="font-code">O(n)</Badge>
          </div>
          <div className="text-sm text-gray-600">
            <strong>Use Cases:</strong> Function calls, undo operations, expression evaluation, backtracking algorithms
          </div>
        </div>
      </div>
    </Card>
  );
}
