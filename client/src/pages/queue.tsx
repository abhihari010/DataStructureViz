import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import QueueVisualization from "@/components/visualizations/queue-visualization";
import CodePanel from "@/components/code-panel";
import PracticeSection from "@/components/practice-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, Star } from "lucide-react";
import React from "react";
import { ErrorBoundary } from "react-error-boundary";



export default function Queue() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="flex" style={{ height: 'calc(100vh - 4rem)' }}>
        <Sidebar />
        
        <main className="flex-1 overflow-auto">
          <div className="min-h-full flex flex-col">
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
            <div className="flex-1 flex overflow-auto">
              {/* Visualization Panel - Takes 70% width */}
              <div className="flex-1 overflow-auto p-2">
                <div className="max-w-3xl mx-auto w-full h-full flex items-center justify-center">
                  <div className="w-full">
                <QueueVisualization />
              </div>
                </div>
              </div>

              {/* Code Panel - Fixed width */}
              <div className="w-140 border-l border-gray-200 overflow-auto">
                <div className="h-full p-4">
                <CodePanel />
                </div>
              </div>
            </div>

            {/* Bottom Panel */}
            <div className="bg-white border-t border-gray-200 p-6">
            <ErrorBoundary fallback={<div>Error rendering PracticeSection</div>}>
              <PracticeSection topicId="queue" />
            </ErrorBoundary>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
