import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw, Shuffle, Play, Pause, StepForward } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const colors = [
  'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-red-500',
];

function getRandomArray(length = 6) {
  return Array.from({ length }, () => Math.floor(Math.random() * 99) + 1);
}

export default function BubbleSortVisualization() {
  const [array, setArray] = useState(getRandomArray());
  const [i, setI] = useState(0);
  const [j, setJ] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState([5]);
  const [sorted, setSorted] = useState(false);
  const timerRef = useRef(null as null | ReturnType<typeof setTimeout>);

  const animationDuration = (11 - animationSpeed[0]) * 100;

  function reset() {
    setArray(getRandomArray());
    setI(0);
    setJ(0);
    setSorted(false);
    setIsPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  function randomize() {
    setArray(getRandomArray(Math.floor(Math.random() * 4) + 5));
    setI(0);
    setJ(0);
    setSorted(false);
    setIsPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  function stepBubbleSort(arr: number[], i: number, j: number) {
    let n = arr.length;
    let newArr = [...arr];
    let newI = i, newJ = j, done = false;
    if (i >= n - 1) {
      done = true;
      return { newArr, newI, newJ, done };
    }
    if (j < n - i - 1) {
      if (newArr[j] > newArr[j + 1]) {
        [newArr[j], newArr[j + 1]] = [newArr[j + 1], newArr[j]];
      }
      newJ = j + 1;
    } else {
      newI = i + 1;
      newJ = 0;
    }
    if (newI >= n - 1) done = true;
    return { newArr, newI, newJ, done };
  }

  function step() {
    setArray((arr) => {
      let result = stepBubbleSort(arr, i, j);
      setI(result.newI);
      setJ(result.newJ);
      if (result.done) {
        setSorted(true);
        setIsPlaying(false);
      }
      return result.newArr;
    });
  }

  useEffect(() => {
    if (isPlaying && !sorted) {
      timerRef.current = setTimeout(() => {
        setArray((arr) => {
          let result = stepBubbleSort(arr, i, j);
          setI(result.newI);
          setJ(result.newJ);
          if (result.done) {
            setSorted(true);
            setIsPlaying(false);
          }
          return result.newArr;
        });
      }, animationDuration);
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
    // Clean up timer if paused or sorted
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line
  }, [isPlaying, i, j, sorted, animationSpeed]);

  function play() {
    if (!isPlaying && !sorted) setIsPlaying(true);
  }

  function pause() {
    setIsPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle>Bubble Sort Visualization</CardTitle>
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
                {array.map((value, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.2 }}
                    className={`w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0
                      ${(idx === j || idx === j + 1) ? 'bg-yellow-400 text-black ring-4 ring-yellow-300' : 'bg-blue-600'}
                      ${sorted ? 'ring-4 ring-green-400' : ''}`}
                  >
                    {value}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {/* Arrows under compared elements */}
            {!sorted && (
              <div className="flex items-center space-x-4 px-16 w-full justify-center mt-2" style={{ minHeight: 24 }}>
                {array.map((_, idx) => (
                  <div key={idx} className="w-16 flex items-center justify-center">
                    {(idx === j || idx === j + 1) ? (
                      <span style={{ fontSize: 24, color: '#facc15' }}>↑</span>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <div className="border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button onClick={step} disabled={sorted || isPlaying}>
              <StepForward className="w-4 h-4 mr-1" />
              Step
            </Button>
            <Button onClick={play} disabled={sorted || isPlaying}>
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