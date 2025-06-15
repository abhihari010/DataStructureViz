import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import QueueVisualization from "@/components/visualizations/queue-visualization";
import CodePanel from "@/components/code-panel";
import PracticeSection from "@/components/practice-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, Star } from "lucide-react";
import React from "react";
import { ErrorBoundary } from "react-error-boundary";

const queueCodeExamples = {
  javascript: `class Queue {
  constructor() {
    this.items = [];
  }

  // Add element to the end of the queue
  enqueue(element) {
    this.items.push(element);
    return this.items.length;
  }


  // Remove and return element from the front of the queue
  dequeue() {
    if (this.isEmpty()) {
      return null;
    }
    return this.items.shift();
  }

  // Peek at the front element
  front() {
    if (this.isEmpty()) {
      return null;
    }
    return this.items[0];
  }
  // Check if queue is empty
  isEmpty() {
    return this.items.length === 0;
  }
  // Get queue size
  size() {
    return this.items.length;
  }
}`,
  python: `class Queue:
    def __init__(self):
        self.items = []
    
    def enqueue(self, item):
        self.items.append(item)
    
    def dequeue(self):
        if self.is_empty():
            return None
        return self.items.pop(0)
    
    def front(self):
        if self.is_empty():
            return None
        return self.items[0]
    
    def is_empty(self):
        return len(self.items) == 0
    
    def size(self):
        return len(self.items)`,
  
  java: `import java.util.LinkedList;

public class Queue<T> {
    private LinkedList<T> list;

    public Queue() {
        list = new LinkedList<>();
    }

    // Add element to the end of the queue
    public void enqueue(T item) {
        list.addLast(item);
    }

    // Remove and return element from the front of the queue
    public T dequeue() {
        if (isEmpty()) {
            return null;
        }
        return list.removeFirst();
    }

    // Peek at the front element
    public T front() {
        if (isEmpty()) {
            return null;
        }
        return list.getFirst();
    }

    // Check if queue is empty
    public boolean isEmpty() {
        return list.isEmpty();
    }

    // Get queue size
    public int size() {
        return list.size();
    }

    @Override
    public String toString() {
        return list.toString();
    }
}`
};

const timeComplexity = {
  enqueue: "O(1)",
  dequeue: "O(n)",
  front: "O(1)",
  search: "O(n)",
  access: "O(n)",
};

const spaceComplexity = "O(n)";

export default function Queue() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="flex" style={{ height: 'calc(100vh - 4rem)' }}>
        <Sidebar />
        
        <main className="flex-1 overflow-auto">
          <div className="min-h-full flex flex-col">
            {/* Topic Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Stack Data Structure</h1>
                  <p className="text-gray-600 mt-1">
                    Last In, First Out (LIFO) principle with push and pop operations
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                    <Star className="w-3 h-3 mr-1" />
                    Beginner
                  </Badge>
                </div>
              </div>
            </div>

            {/* Split Panel Layout */}
            <div className="flex-1 flex overflow-auto">
              {/* Code Panel - Left side - Wider */}
              <div className="w-[36rem] border-r border-gray-200 overflow-auto flex-shrink-0">
                <div className="h-full p-4">
                  <CodePanel 
                    codeExamples={queueCodeExamples}
                  />
                </div>
              </div>

              {/* Visualization Panel - Takes remaining width */}
              <div className="flex-1 overflow-auto p-4 ml-4">
                <div className="max-w-4xl mx-auto w-full h-full flex items-center justify-center">
                  <div className="w-full">
                    <QueueVisualization />
                  </div>
                </div>
              </div>
              
              {/* Toggle Code Panel Button */}
              <button 
                onClick={() => {
                  const codePanel = document.querySelector('.code-panel');
                  codePanel?.classList.toggle('hidden');
                  const toggleBtn = document.querySelector('.toggle-code-btn');
                  toggleBtn?.classList.toggle('left-0');
                }}
                className="toggle-code-btn fixed right-0 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-l-md shadow-md transition-all duration-300 z-10"
                aria-label="Toggle code panel"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
            </div>

            {/* Bottom Panel */}
            <div className="bg-white border-t border-gray-200 p-6">
            <ErrorBoundary fallback={<div>Error rendering PracticeSection</div>}>
              <PracticeSection topicId="queue" />
            </ErrorBoundary>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
