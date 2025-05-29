import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChartGantt, Bell, Settings, LogOut } from "lucide-react";
import { Link } from "wouter";

export default function Navigation() {
  const { user } = useAuth();

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer">
              <ChartGantt className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold text-gray-900">DSA Visualizer</h1>
            </div>
          </Link>
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/">
              <a className="text-gray-700 hover:text-primary transition-colors">Dashboard</a>
            </Link>
            <a href="#" className="text-gray-700 hover:text-primary transition-colors">Practice</a>
            <a href="#" className="text-gray-700 hover:text-primary transition-colors">Progress</a>
            <a href="#" className="text-gray-700 hover:text-primary transition-colors">Interview Prep</a>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            <Bell className="h-4 w-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profileImageUrl || ''} alt="Profile" />
                  <AvatarFallback className="bg-primary text-white text-sm font-medium">
                    {getInitials(user?.firstName, user?.lastName)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/api/logout">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
