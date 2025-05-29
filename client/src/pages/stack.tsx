import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import StackVisualization from "@/components/visualizations/stack-visualization";
import CodePanel from "@/components/code-panel";
import PracticeSection from "@/components/practice-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, Star } from "lucide-react";

export default function Stack() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="flex h-screen">
        <Sidebar />
        
        <main className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Topic Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Stack Data Structure</h1>
                  <p className="text-gray-600 mt-1">
                    Last In, First Out (LIFO) principle with push and pop operations
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                    <Star className="w-3 h-3 mr-1" />
                    Beginner
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Bookmark className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Split Panel Layout */}
            <div className="flex-1 flex overflow-hidden">
              {/* Visualization Panel */}
              <div className="flex-1 p-6">
                <StackVisualization />
              </div>

              {/* Code Panel */}
              <div className="w-96 p-6 border-l border-gray-200">
                <CodePanel />
              </div>
            </div>

            {/* Bottom Panel */}
            <div className="bg-white border-t border-gray-200 p-6">
              <PracticeSection topicId="stack" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
