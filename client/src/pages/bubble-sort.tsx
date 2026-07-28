import TopicWorkspace from "@/components/topic-workspace";
import BubbleSortVisualization from "@/components/visualizations/bubble-sort-visualization";

const codeExamples = {
  cpp: `void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                std::swap(arr[j], arr[j + 1]);
            }
        }
    }
}`,
  python: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n-1):
        for j in range(n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]`,
  java: `public static void bubbleSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}`,
  javascript: `function bubbleSort(arr) {
  let n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
}`
};

export default function BubbleSortPage() {
  return (
    <TopicWorkspace
      category="Sorting algorithm"
      codeExamples={codeExamples}
      difficulty="Beginner"
      title="Bubble sort"
      summary="Compare adjacent values, swap a pair when its order is wrong, and watch each pass settle another boundary."
      overview="The sorted suffix grows from the right as neighboring values exchange positions. It is a useful way to see local comparisons create global order."
      complexity={[
        { label: "Best time", value: "O(n)" },
        { label: "Average time", value: "O(n?)" },
        { label: "Worst time", value: "O(n?)" },
        { label: "Space", value: "O(1)" },
      ]}
    >
      <BubbleSortVisualization />
    </TopicWorkspace>
  );
}
