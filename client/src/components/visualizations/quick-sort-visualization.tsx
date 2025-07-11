import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw, Shuffle, Play, Pause, StepForward } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const baseColor = 'bg-blue-600';
const compareColor = 'bg-yellow-400 text-black ring-4 ring-yellow-300';
const pivotColor = 'bg-red-500 text-white ring-4 ring-red-300';
const sortedRing = 'ring-4 ring-green-400';

function getRandomArray(length = 7) {
  return Array.from({ length }, () => Math.floor(Math.random() * 99) + 1);
}

function clone(arr: any[]) {
  return arr.map((x: any) => x);
}

// Helper to generate quick sort steps
function getQuickSortSteps(array: any[]) {
  const steps: any[] = [];
  const arr = clone(array);
  const n = arr.length;
  const sorted = Array(n).fill(false);

  function quickSort(l: number, r: number) {
    if (l >= r) {
      if (l === r) sorted[l] = true;
      return;
    }
    let pivot = r;
    let i = l;
    for (let j = l; j < r; j++) {
      steps.push({ arr: clone(arr), l, r, pivot, i, j, sorted: [...sorted] });
      if (arr[j] < arr[pivot]) {
        [arr[i], arr[j]] = [arr[j], arr[i]];
        i++;
      }
    }
    [arr[i], arr[pivot]] = [arr[pivot], arr[i]];
    steps.push({ arr: clone(arr), l, r, pivot, i, j: r, sorted: [...sorted] });
    sorted[i] = true;
    quickSort(l, i - 1);
    quickSort(i + 1, r);
  }
  quickSort(0, n - 1);
  // Mark all as sorted at the end
  steps.push({ arr: clone(arr), l: 0, r: n - 1, pivot: -1, i: -1, j: -1, sorted: Array(n).fill(true) });
  return steps;
}

export default function QuickSortVisualization() {
  const [array, setArray] = useState(getRandomArray());
  const [steps, setSteps] = useState(() => getQuickSortSteps(array));
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState([5]);
  const timerRef = useRef(null as null | ReturnType<typeof setTimeout>);

  useEffect(() => {
    setSteps(getQuickSortSteps(array));
    setStepIdx(0);
    setIsPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, [array]);

  const current = steps[stepIdx] || steps[steps.length - 1];
  const n = array.length;
  const sorted = current.sorted || Array(n).fill(false);

  function reset() {
    setArray(getRandomArray());
  }

  function randomize() {
    setArray(getRandomArray(Math.floor(Math.random() * 4) + 5));
  }

  function step() {
    setStepIdx(idx => Math.min(idx + 1, steps.length - 1));
  }

  useEffect(() => {
    if (isPlaying && stepIdx < steps.length - 1) {
      timerRef.current = setTimeout(() => {
        setStepIdx(idx => Math.min(idx + 1, steps.length - 1));
      }, (11 - animationSpeed[0]) * 100);
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, stepIdx, animationSpeed, steps.length]);

  function play() {
    if (!isPlaying && stepIdx < steps.length - 1) setIsPlaying(true);
  }

  function pause() {
    setIsPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle>Quick Sort Visualization</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={reset}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
            <Button size="sm" onClick={randomize}>
              <Shuffle className="w-4 h-4 mr-1" />
              Random
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 flex-1">
        <div className="relative h-48 border-2 border-gray-300 rounded-lg p-4 flex items-center justify-center">
          <div className="flex flex-col w-full items-center">
            <div className="flex items-center space-x-4 overflow-x-auto py-4 px-16 w-full justify-center">
              <AnimatePresence>
                {current.arr.map((value: any, idx: number) => {
                  let highlight = baseColor;
                  if (idx === current.pivot) highlight = pivotColor;
                  else if (idx === current.j || idx === current.i) highlight = compareColor;
                  if (sorted[idx]) highlight += ` ${sortedRing}`;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.2 }}
                      className={`w-16 h-16 rounded-lg flex items-center justify-center font-bold text-lg shadow-md flex-shrink-0 ${highlight}`}
                    >
                      {value}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            {/* Arrows under compared elements */}
            {current.pivot !== -1 && (
              <div className="flex items-center space-x-4 px-16 w-full justify-center mt-2" style={{ minHeight: 24 }}>
                {current.arr.map((_: any, idx: number) => (
                  <div key={idx} className="w-16 flex items-center justify-center">
                    {idx === current.pivot ? (
                      <span style={{ fontSize: 24, color: '#ef4444' }}>↑</span>
                    ) : (idx === current.j || idx === current.i) ? (
                      <span style={{ fontSize: 24, color: '#facc15' }}>↑</span>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Legend */}
        <div className="flex flex-row items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-1">
            <span className="w-5 h-5 rounded bg-red-500 ring-4 ring-red-300 inline-block"></span>
            <span className="text-sm ml-1">Pivot</span>
            <span style={{ fontSize: 18, color: '#ef4444', marginLeft: 4 }}>↑</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-5 h-5 rounded bg-yellow-400 ring-4 ring-yellow-300 inline-block border border-yellow-400"></span>
            <span className="text-sm ml-1">Comparing</span>
            <span style={{ fontSize: 18, color: '#facc15', marginLeft: 4 }}>↑</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-5 h-5 rounded bg-blue-600 ring-4 ring-green-400 inline-block"></span>
            <span className="text-sm ml-1">Sorted</span>
          </div>
        </div>
      </CardContent>
      <div className="border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button onClick={step} disabled={stepIdx >= steps.length - 1 || isPlaying}>
              <StepForward className="w-4 h-4 mr-1" />
              Step
            </Button>
            <Button onClick={play} disabled={stepIdx >= steps.length - 1 || isPlaying}>
              <Play className="w-4 h-4 mr-1" />
              Play
            </Button>
            <Button onClick={pause} disabled={!isPlaying}>
              <Pause className="w-4 h-4 mr-1" />
              Pause
            </Button>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Speed:</span>
            <Slider
              value={animationSpeed}
              onValueChange={setAnimationSpeed}
              max={10}
              min={1}
              step={1}
              className="w-20"
            />
          </div>
        </div>
      </div>
    </Card>
  );
} 