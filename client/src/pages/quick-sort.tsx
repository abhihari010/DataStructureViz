import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import QuickSortVisualization from "@/components/visualizations/quick-sort-visualization";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import React from "react";

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
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navigation />
        <main className="flex-1 p-6 flex flex-col gap-6">
          <h1 className="text-3xl font-bold mb-2">Quick Sort</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <QuickSortVisualization />
            <Card>
              <CardHeader>
                <CardTitle>Quick Sort Algorithm</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="cpp" className="w-full">
                  <TabsList>
                    <TabsTrigger value="cpp">C++</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                    <TabsTrigger value="java">Java</TabsTrigger>
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  </TabsList>
                  <TabsContent value="cpp">
                    <pre className="bg-gray-900 text-white rounded p-4 overflow-x-auto text-sm">
                      <code>{codeExamples.cpp}</code>
                    </pre>
                  </TabsContent>
                  <TabsContent value="python">
                    <pre className="bg-gray-900 text-white rounded p-4 overflow-x-auto text-sm">
                      <code>{codeExamples.python}</code>
                    </pre>
                  </TabsContent>
                  <TabsContent value="java">
                    <pre className="bg-gray-900 text-white rounded p-4 overflow-x-auto text-sm">
                      <code>{codeExamples.java}</code>
                    </pre>
                  </TabsContent>
                  <TabsContent value="javascript">
                    <pre className="bg-gray-900 text-white rounded p-4 overflow-x-auto text-sm">
                      <code>{codeExamples.javascript}</code>
                    </pre>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2">
                <b>Quick Sort</b> is a highly efficient sorting algorithm that uses a divide-and-conquer approach. It selects a pivot element and partitions the array into two subarrays: elements less than the pivot and elements greater than or equal to the pivot. It then recursively sorts the subarrays.
              </p>
              <ul className="list-disc ml-6 mb-2">
                <li>Best and Average Case Time Complexity: <Badge variant="outline">O(n log n)</Badge></li>
                <li>Worst Case Time Complexity: <Badge variant="outline">O(n²)</Badge> (rare, when the pivot is always the smallest or largest element)</li>
                <li>Space Complexity: <Badge variant="outline">O(log n)</Badge> (due to recursion stack)</li>
                <li>Stable: <Badge variant="outline">No</Badge></li>
              </ul>
              <p>
                Quick sort is widely used in practice due to its average-case efficiency and in-place sorting, but care must be taken to avoid worst-case scenarios (e.g., by using randomized pivots).
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
} 