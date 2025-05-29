import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, 
  Minus, 
  RotateCcw, 
  Shuffle,
  StepBack,
  Play,
  Pause,
  StepForward 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface StackElement {
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

export default function StackVisualization() {
  const [stack, setStack] = useState<StackElement[]>([
    { id: 1, value: 42, color: 'bg-blue-500' },
    { id: 2, value: 17, color: 'bg-green-500' },
    { id: 3, value: 8, color: 'bg-purple-500' },
  ]);
  const [inputValue, setInputValue] = useState<string>("");
  const [animationSpeed, setAnimationSpeed] = useState([5]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);
  const [nextId, setNextId] = useState(4);

  const animationDuration = (11 - animationSpeed[0]) * 0.1;

  const push = () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) return;

    setHighlightedLine(8);
    setTimeout(() => {
      const newElement: StackElement = {
        id: nextId,
        value,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
      setStack(prev => [...prev, newElement]);
      setNextId(prev => prev + 1);
      setInputValue("");
      setHighlightedLine(9);
      setTimeout(() => setHighlightedLine(null), 500);
    }, animationDuration * 1000);
  };

  const pop = () => {
    if (stack.length === 0) return;

    setHighlightedLine(14);
    setTimeout(() => {
      setStack(prev => prev.slice(0, -1));
      setHighlightedLine(17);
      setTimeout(() => setHighlightedLine(null), 500);
    }, animationDuration * 1000);
  };

  const reset = () => {
    setStack([
      { id: 1, value: 42, color: 'bg-blue-500' },
      { id: 2, value: 17, color: 'bg-green-500' },
      { id: 3, value: 8, color: 'bg-purple-500' },
    ]);
    setNextId(4);
    setHighlightedLine(null);
  };

  const randomize = () => {
    const newStack: StackElement[] = [];
    const count = Math.floor(Math.random() * 5) + 2;
    
    for (let i = 0; i < count; i++) {
      newStack.push({
        id: nextId + i,
        value: Math.floor(Math.random() * 100) + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    
    setStack(newStack);
    setNextId(prev => prev + count);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <Card className="h-full flex flex-col">
      {/* Visualization Header */}
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle>Interactive Visualization</CardTitle>
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

      {/* Stack Visualization Area */}
      <CardContent className="flex-1 p-6 flex items-center justify-center">
        <div className="relative">
          {/* Stack Container */}
          <div className="flex flex-col-reverse space-y-reverse space-y-2 min-h-64">
            {/* Stack Base */}
            <div className="w-32 h-4 bg-gray-800 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-medium">Stack Base</span>
            </div>
            
            {/* Stack Elements */}
            <AnimatePresence>
              {stack.map((element, index) => (
                <motion.div
                  key={element.id}
                  className={`w-32 h-12 ${element.color} rounded-lg flex items-center justify-center border-2 border-opacity-50 shadow-lg stack-element`}
                  initial={{ opacity: 0, y: -20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 0.8 }}
                  transition={{ 
                    duration: animationDuration,
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="text-white font-semibold">{element.value}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pointer Arrow */}
          {stack.length > 0 && (
            <motion.div 
              className="absolute -right-16 flex items-center"
              style={{ top: `${(stack.length - 1) * 56 + 32}px` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: animationDuration }}
            >
              <div className="text-2xl text-red-500">←</div>
              <span className="ml-2 text-sm font-medium text-gray-700">TOP</span>
            </motion.div>
          )}
        </div>
      </CardContent>

      {/* Controls */}
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
                onKeyPress={(e) => e.key === 'Enter' && push()}
              />
              <Button 
                onClick={push}
                disabled={!inputValue || isNaN(parseInt(inputValue))}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Push
              </Button>
              <Button 
                onClick={pop}
                disabled={stack.length === 0}
                className="bg-red-600 hover:bg-red-700"
              >
                <Minus className="w-4 h-4 mr-1" />
                Pop
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
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <StepBack className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={togglePlayPause}>
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="sm">
                <StepForward className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
