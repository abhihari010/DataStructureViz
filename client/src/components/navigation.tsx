import { useAuthJWT } from "@/hooks/useAuthJWT";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChartGantt,
  Bell,
  Settings,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { Link } from "wouter";
import { User } from "@/lib/api";

interface NavigationUser extends User {
  profileImageUrl?: string;
}

export default function Navigation() {
  const { user, logout } = useAuthJWT();
  const typedUser = user as NavigationUser | null;

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "U";
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer">
              <ChartGantt className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold text-gray-900">
                DSA Visualizer
              </h1>
            </div>
          </Link>
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/">
              <a className="text-gray-700 hover:text-primary transition-colors">
                Dashboard
              </a>
            </Link>
            <Link href="/topics">
              <a className="text-gray-700 hover:text-primary transition-colors">
                Topics
              </a>
            </Link>
            <Link href="/practice">
              <a className="text-gray-700 hover:text-primary transition-colors">
                Practice
              </a>
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full p-0"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={typedUser?.profileImageUrl}
                    alt={`${typedUser?.firstName} ${typedUser?.lastName}`}
                  />
                  <AvatarFallback className="bg-primary text-white text-sm font-medium">
                    {getInitials(typedUser?.firstName, typedUser?.lastName) || (
                      <UserIcon className="h-5 w-5" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <Link href="/settings">
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
