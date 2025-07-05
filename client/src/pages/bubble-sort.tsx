import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import BubbleSortVisualization from "@/components/visualizations/bubble-sort-visualization";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import React from "react";

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
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navigation />
        <main className="flex-1 p-6 flex flex-col gap-6">
          <h1 className="text-3xl font-bold mb-2">Bubble Sort</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BubbleSortVisualization />
            <Card>
              <CardHeader>
                <CardTitle>Bubble Sort Algorithm</CardTitle>
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
                <b>Bubble Sort</b> is a simple sorting algorithm that repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. This process is repeated until the list is sorted. The algorithm gets its name because smaller elements "bubble" to the top of the list with each pass.
              </p>
              <ul className="list-disc ml-6 mb-2">
                <li>Best Case Time Complexity: <Badge variant="outline">O(n)</Badge> (when the array is already sorted)</li>
                <li>Average and Worst Case Time Complexity: <Badge variant="outline">O(n²)</Badge></li>
                <li>Space Complexity: <Badge variant="outline">O(1)</Badge> (in-place)</li>
                <li>Stable: <Badge variant="outline">Yes</Badge></li>
              </ul>
              <p>
                Bubble sort is mainly used for educational purposes and is not suitable for large datasets due to its poor performance compared to more advanced algorithms like quicksort or mergesort.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
} 