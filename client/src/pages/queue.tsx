import QueueVisualization from "@/components/visualizations/queue-visualization";
import TopicWorkspace from "@/components/topic-workspace";

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
    <TopicWorkspace
      category="Data structure"
      codeExamples={queueCodeExamples}
      difficulty="Beginner"
      title="Queue"
      summary="First in, first out. Add at the rear, remove from the front, and keep the direction of travel visible."
      overview="A queue has two meaningful boundaries. Enqueue advances the rear; dequeue advances the front. The values between them retain arrival order."
      complexity={[
        { label: "Enqueue", value: timeComplexity.enqueue },
        { label: "Dequeue", value: timeComplexity.dequeue },
        { label: "Front", value: timeComplexity.front },
        { label: "Space", value: spaceComplexity },
      ]}
      topicId="queue"
    >
      <QueueVisualization />
    </TopicWorkspace>
  );
}
