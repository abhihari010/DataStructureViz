import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Minus, RotateCcw, Shuffle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QueueElement {
  id: number;
  value: number;
  color: string;
}

const colors = [
  'bg-blue-500',
  'bg-green-500', 
  'bg-purple-500',
  'bg-pink-500',
  'bg-yellow-500',
  'bg-indigo-500',
  'bg-red-500',
];

export default function QueueVisualization() {
  const [queue, setQueue] = useState<QueueElement[]>([
    { id: 1, value: 13, color: 'bg-blue-500' },
    { id: 2, value: 29, color: 'bg-green-500' },
    { id: 3, value: 7, color: 'bg-purple-500' },
  ]);
  const [inputValue, setInputValue] = useState<string>("");
  const [animationSpeed, setAnimationSpeed] = useState([5]);
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);
  const [nextId, setNextId] = useState(4);

  const animationDuration = (11 - animationSpeed[0]) * 0.1;

  const enqueue = () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) return;
    setHighlightedLine(8);
    setTimeout(() => {
      const newElement: QueueElement = {
        id: nextId,
        value,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
      setQueue(prev => [...prev, newElement]);
      setNextId(prev => prev + 1);
      setInputValue("");
      setHighlightedLine(9);
      setTimeout(() => setHighlightedLine(null), 500);
    }, animationDuration * 1000);
  };

  const dequeue = () => {
    if (queue.length === 0) return;
    setHighlightedLine(14);
    setTimeout(() => {
      setQueue(prev => prev.slice(1));
      setHighlightedLine(17);
      setTimeout(() => setHighlightedLine(null), 500);
    }, animationDuration * 1000);
  };

  const reset = () => {
    setQueue([
      { id: 1, value: 13, color: 'bg-blue-500' },
      { id: 2, value: 29, color: 'bg-green-500' },
      { id: 3, value: 7, color: 'bg-purple-500' },
    ]);
    setNextId(4);
    setHighlightedLine(null);
  };

  const randomize = () => {
    const newQueue: QueueElement[] = [];
    const count = Math.floor(Math.random() * 5) + 2;
    for (let i = 0; i < count; i++) {
      newQueue.push({
        id: nextId + i,
        value: Math.floor(Math.random() * 100) + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    setQueue(newQueue);
    setNextId(prev => prev + count);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle>Queue Visualization</CardTitle>
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
          {/* Front and Rear indicators removed as they're shown under elements */}
          
          <div className="flex items-center space-x-4 overflow-x-auto py-4 px-16 w-full justify-center">
            <AnimatePresence>
              {queue.length === 0 ? (
                <div className="text-gray-500 italic">Queue is empty</div>
              ) : (
                queue.map((item, index) => (
                  <div key={item.id} className="flex flex-col items-center">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: animationDuration }}
                      className={`${item.color} w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0`}
                    >
                      {item.value}
                    </motion.div>
                    {index === 0 && (
                      <div className="mt-1 text-xs text-blue-600 font-bold">FRONT</div>
                    )}
                    {index === queue.length - 1 && (
                      <div className="mt-1 text-xs text-green-600 font-bold">REAR</div>
                    )}
                  </div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </CardContent>
      <div className="border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                placeholder="Enter value"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-24"
                onKeyPress={(e) => e.key === 'Enter' && enqueue()}
              />
              <Button 
                onClick={enqueue}
                disabled={!inputValue || isNaN(parseInt(inputValue))}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Enqueue
              </Button>
              <Button 
                onClick={dequeue}
                disabled={queue.length === 0}
                className="bg-red-600 hover:bg-red-700"
              >
                <Minus className="w-4 h-4 mr-1" />
                Dequeue
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
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
      </div>
    </Card>
  );
}
