import TopicWorkspace from "@/components/topic-workspace";
import QuickSortVisualization from "@/components/visualizations/quick-sort-visualization";

const codeExamples = {
  cpp: `void quickSort(int arr[], int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}

int partition(int arr[], int low, int high) {
    int pivot = arr[high];
    int i = (low - 1);
    for (int j = low; j <= high - 1; j++) {
        if (arr[j] < pivot) {
            i++;
            std::swap(arr[i], arr[j]);
        }
    }
    std::swap(arr[i + 1], arr[high]);
    return (i + 1);
}`,
  python: `def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[-1]
    left = [x for x in arr[:-1] if x < pivot]
    right = [x for x in arr[:-1] if x >= pivot]
    return quick_sort(left) + [pivot] + quick_sort(right)`,
  java: `public static void quickSort(int[] arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}

static int partition(int[] arr, int low, int high) {
    int pivot = arr[high];
    int i = (low - 1);
    for (int j = low; j <= high - 1; j++) {
        if (arr[j] < pivot) {
            i++;
            int temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
    }
    int temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;
    return (i + 1);
}`,
  javascript: `function quickSort(arr) {
  if (arr.length <= 1) return arr;
  const pivot = arr[arr.length - 1];
  const left = arr.slice(0, -1).filter(x => x < pivot);
  const right = arr.slice(0, -1).filter(x => x >= pivot);
  return [...quickSort(left), pivot, ...quickSort(right)];
}`
};

export default function QuickSortPage() {
  return (
    <TopicWorkspace
      category="Sorting algorithm"
      codeExamples={codeExamples}
      difficulty="Intermediate"
      title="Quick sort"
      summary="Choose a pivot, partition values around it, and recursively resolve the smaller ranges."
      overview="Every partition puts one pivot in its final position. The visualization makes the active range, comparisons, and recursive decomposition visible."
      complexity={[
        { label: "Best time", value: "O(n log n)" },
        { label: "Average time", value: "O(n log n)" },
        { label: "Worst time", value: "O(n?)" },
        { label: "Space", value: "O(log n)" },
      ]}
    >
      <QuickSortVisualization />
    </TopicWorkspace>
  );
}
