import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartGantt, Code2, Users, Zap, BookOpen, Trophy } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ChartGantt className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900">DSA Visualizer</h1>
            </div>
            <Button asChild>
              <a href="/api/login">Get Started</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Master Data Structures & Algorithms
            <span className="text-primary block">Through Interactive Visualization</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Learn DSA concepts with real-time visualizations, synchronized code examples, 
            and hands-on practice problems. Perfect for students and interview preparation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-4" asChild>
              <a href="/api/login">Start Learning Free</a>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4">
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Master DSA
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform combines visual learning with practical coding to give you 
              the complete understanding you need.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary/20 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <ChartGantt className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Interactive Visualizations</CardTitle>
                <CardDescription>
                  Watch data structures come alive with smooth animations and step-by-step operations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/20 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Code2 className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>Synchronized Code</CardTitle>
                <CardDescription>
                  See the actual implementation with highlighted code lines as animations progress.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/20 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Practice Problems</CardTitle>
                <CardDescription>
                  Solve real coding challenges with instant feedback and detailed explanations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/20 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Trophy className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Progress Tracking</CardTitle>
                <CardDescription>
                  Track your learning journey with detailed progress analytics and achievements.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/20 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Multiple Languages</CardTitle>
                <CardDescription>
                  View implementations in JavaScript, Java, Python, and more programming languages.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/20 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Interview Ready</CardTitle>
                <CardDescription>
                  Structured learning path designed specifically for technical interview preparation.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Topics Preview */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comprehensive DSA Coverage
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From basic data structures to advanced algorithms, we cover everything 
              you need for academic success and interview preparation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Data Structures</CardTitle>
                <CardDescription>
                  Master the fundamental building blocks of computer science.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">Arrays & Lists</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">Stack & Queue</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">Linked Lists</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">Trees & Graphs</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">Hash Tables</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">Heaps</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Algorithms</CardTitle>
                <CardDescription>
                  Learn efficient problem-solving techniques and algorithms.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    <span className="text-sm">Sorting</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    <span className="text-sm">Searching</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    <span className="text-sm">Graph Traversal</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    <span className="text-sm">Dynamic Programming</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    <span className="text-sm">Greedy Algorithms</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    <span className="text-sm">Divide & Conquer</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Master Data Structures & Algorithms?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students and professionals who have improved their 
            coding skills with our interactive platform.
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8 py-4" asChild>
            <a href="/api/login">Start Learning Today</a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <ChartGantt className="h-8 w-8 text-primary" />
            <h3 className="text-2xl font-bold">DSA Visualizer</h3>
          </div>
          <p className="text-gray-400 mb-6">
            Making data structures and algorithms accessible through interactive visualization.
          </p>
          <p className="text-gray-500 text-sm">
            © 2024 DSA Visualizer. Built for educational purposes.
          </p>
        </div>
      </footer>
    </div>
  );
}
