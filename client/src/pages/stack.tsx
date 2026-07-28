import StackVisualization from "@/components/visualizations/stack-visualization";
import TopicWorkspace from "@/components/topic-workspace";

const stackCodeExamples = {
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
  python: `class Stack:
    def __init__(self):
        self.items = []
    
    def push(self, item):
        self.items.append(item)
    
    def pop(self):
        if self.is_empty():
            return None
        return self.items.pop()
    
    def peek(self):
        if self.is_empty():
            return None
        return self.items[-1]
    
    def is_empty(self):
        return len(self.items) == 0
    
    def size(self):
        return len(self.items)`,

  java: `import java.util.ArrayList;
import java.util.EmptyStackException;

public class Stack<T> {
    private ArrayList<T> items;

    public Stack() {
        items = new ArrayList<>();
    }

    // Add element to the top of the stack
    public void push(T item) {
        items.add(item);
    }

    // Remove and return element from the top of the stack
    public T pop() {
        if (isEmpty()) {
            throw new EmptyStackException();
        }
        return items.remove(items.size() - 1);
    }

    // Peek at the top element without removing it
    public T peek() {
        if (isEmpty()) {
            throw new EmptyStackException();
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

    @Override
    public String toString() {
        return items.toString();
    }
}`
};

const timeComplexity = {
  push: "O(1)",
  pop: "O(1)",
  peek: "O(1)",
  search: "O(n)",
  access: "O(n)",
};

const spaceComplexity = "O(n)";

export default function Stack() {
  return (
    <TopicWorkspace
      category="Data structure"
      codeExamples={stackCodeExamples}
      difficulty="Beginner"
      title="Stack"
      summary="Last in, first out. Push values onto the top, then watch pop and peek resolve the same end of the structure."
      overview="The top pointer is the entire contract. Watch how every operation either moves that boundary or reads it without changing the stored order."
      complexity={[
        { label: "Push", value: timeComplexity.push },
        { label: "Pop", value: timeComplexity.pop },
        { label: "Peek", value: timeComplexity.peek },
        { label: "Space", value: spaceComplexity },
      ]}
      topicId="stack"
    >
      <StackVisualization />
    </TopicWorkspace>
  );
}
