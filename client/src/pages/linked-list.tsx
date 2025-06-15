import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import LinkedListVisualization from "@/components/visualizations/linked-list-visualization";
import CodePanel from "@/components/code-panel";
import PracticeSection from "@/components/practice-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, Star } from "lucide-react";
import React from "react";
import { ErrorBoundary } from "react-error-boundary";

export default function LinkedList() {

  const linkedListCodeExamples = {
    javascript: `// Node class
class Node {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

// LinkedList class
class LinkedList {
  constructor() {
    this.head = null;
    this.size = 0;
  }

  // Insert at beginning
  insertAtHead(value) {
    const newNode = new Node(value);
    newNode.next = this.head;
    this.head = newNode;
    this.size++;
  }

  // Insert at end
  insertAtTail(value) {
    const newNode = new Node(value);
    
    if (!this.head) {
      this.head = newNode;
    } else {
      let current = this.head;
      while (current.next) {
        current = current.next;
      }
      current.next = newNode;
    }
    
    this.size++;
  }

  // Delete from beginning
  deleteHead() {
    if (!this.head) return null;
    
    const deletedNode = this.head;
    this.head = this.head.next;
    this.size--;
    
    return deletedNode.value;
  }

  // Delete from end
  deleteTail() {
    if (!this.head) return null;
    
    if (!this.head.next) {
      const deletedNode = this.head;
      this.head = null;
      this.size--;
      return deletedNode.value;
    }
    
    let current = this.head;
    while (current.next.next) {
      current = current.next;
    }
    
    const deletedNode = current.next;
    current.next = null;
    this.size--;
    
    return deletedNode.value;
  }

  // Search for a value
  search(value) {
    let current = this.head;
    let position = 0;
    
    while (current) {
      if (current.value === value) {
        return position;
      }
      current = current.next;
      position++;
    }
    
    return -1;
  }
}

// Example usage
const list = new LinkedList();
list.insertAtHead(5);
list.insertAtTail(10);
list.insertAtTail(15);
console.log(list.search(10)); // 1`,
    python: `class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None
        self.size = 0
    
    def insert_at_head(self, value):
        new_node = Node(value)
        new_node.next = self.head
        self.head = new_node
        self.size += 1
    
    def insert_at_tail(self, value):
        new_node = Node(value)
        
        if not self.head:
            self.head = new_node
        else:
            current = self.head
            while current.next:
                current = current.next
            current.next = new_node
        
        self.size += 1
    
    def delete_head(self):
        if not self.head:
            return None
        
        deleted_node = self.head
        self.head = self.head.next
        self.size -= 1
        
        return deleted_node.value
    
    def delete_tail(self):
        if not self.head:
            return None
            
        if not self.head.next:
            deleted_node = self.head
            self.head = None
            self.size -= 1
            return deleted_node.value
        
        current = self.head
        while current.next.next:
            current = current.next
            
        deleted_node = current.next
        current.next = None
        self.size -= 1
        
        return deleted_node.value
    
    def search(self, value):
        current = self.head
        position = 0
        
        while current:
            if current.value == value:
                return position
            current = current.next
            position += 1
        
        return -1

# Example usage
linked_list = LinkedList()
linked_list.insert_at_head(5)
linked_list.insert_at_tail(10)
linked_list.insert_at_tail(15)
print(linked_list.search(10))  # 1`,

  java: `public class Node<T> {
    T value;
    Node<T> next;

    public Node(T value) {
        this.value = value;
        this.next = null;
    }
}

public class LinkedList<T> {
    private Node<T> head;
    private int size;

    public LinkedList() {
        this.head = null;
        this.size = 0;
    }

    // Insert at the beginning
    public void insertAtHead(T value) {
        Node<T> newNode = new Node<>(value);
        newNode.next = head;
        head = newNode;
        size++;
    }

    // Insert at the end
    public void insertAtTail(T value) {
        Node<T> newNode = new Node<>(value);
        
        if (head == null) {
            head = newNode;
        } else {
            Node<T> current = head;
            while (current.next != null) {
                current = current.next;
            }
            current.next = newNode;
        }
        size++;
    }

    // Delete from beginning
    public T deleteHead() {
        if (head == null) {
            return null;
        }
        T value = head.value;
        head = head.next;
        size--;
        return value;
    }

    // Delete from end
    public T deleteTail() {
        if (head == null) {
            return null;
        }
        
        if (head.next == null) {
            T value = head.value;
            head = null;
            size--;
            return value;
        }
        
        Node<T> current = head;
        while (current.next.next != null) {
            current = current.next;
        }
        
        T value = current.next.value;
        current.next = null;
        size--;
        return value;
    }

    // Search for a value
    public int search(T value) {
        Node<T> current = head;
        int position = 0;
        
        while (current != null) {
            if (current.value.equals(value)) {
                return position;
            }
            current = current.next;
            position++;
        }
        
        return -1;
    }

    // Get size
    public int size() {
        return size;
    }

    // Check if list is empty
    public boolean isEmpty() {
        return head == null;
    }

    @Override
    public String toString() {
        if (head == null) {
            return "[]";
        }
        
        StringBuilder sb = new StringBuilder("[");
        Node<T> current = head;
        
        while (current != null) {
            sb.append(current.value);
            if (current.next != null) {
                sb.append(", ");
            }
            current = current.next;
        }
        
        sb.append("]");
        return sb.toString();
    }
}`
  };

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
                  <h1 className="text-2xl font-bold text-gray-900">Linked List Data Structure</h1>
                  <p className="text-gray-600 mt-1">
                    A linear data structure where elements are stored in nodes with references to the next node
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                    <Star className="w-3 h-3 mr-1" />
                    Intermediate
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
                    codeExamples={linkedListCodeExamples}
                  />
                </div>
              </div>

              {/* Visualization Panel - Right side */}
              <div className="flex-1 overflow-auto p-4">
                <div className="max-w-6xl mx-auto w-full h-full">
                  <LinkedListVisualization />
                </div>
              </div>
            </div>

            {/* Bottom Panel */}
            <div className="bg-white border-t border-gray-200 p-6">
              <ErrorBoundary fallback={<div>Error rendering PracticeSection</div>}>
                <PracticeSection topicId="linked-list" />
              </ErrorBoundary>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
