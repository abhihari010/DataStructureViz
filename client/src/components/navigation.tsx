import { useEffect } from "react";
import { useAuthJWT } from "@/hooks/useAuthJWT";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Menu, Settings, User as UserIcon } from "lucide-react";
import { Link, useLocation } from "wouter";
import type { User } from "@/lib/api";

interface NavigationUser extends User {
  profileImageUrl?: string;
}

type NavigationProps = {
  onMenuToggle?: () => void;
};

const routeLabels: Record<string, string> = {
  "/": "Dashboard",
  "/topics": "Topic index",
  "/practice": "Practice ledger",
  "/settings": "Account settings",
  "/topics/stack": "Stack",
  "/topics/queue": "Queue",
  "/topics/linked-list": "Linked list",
  "/topics/binary-tree": "Binary tree",
  "/topics/graph": "Graph",
  "/bubble-sort": "Bubble sort",
  "/quick-sort": "Quick sort",
  "/dfs": "Depth-first search",
  "/bfs": "Breadth-first search",
  "/dijkstra": "Dijkstra",
};

export default function Navigation({ onMenuToggle }: NavigationProps) {
  const { user, logout } = useAuthJWT();
  const [location] = useLocation();
  const typedUser = user as NavigationUser | null;
  const initials =
    `${typedUser?.firstName?.charAt(0) || ""}${typedUser?.lastName?.charAt(0) || ""}`.toUpperCase() ||
    "U";
  const currentLabel =
    routeLabels[location] || (location.startsWith("/problems/") ? "Problem workspace" : "Workspace");

  useEffect(() => {
    document.title = `${currentLabel} | DSA Visualizer`;
  }, [currentLabel]);

  return (
    <header className="app-topbar">
      <div className="app-topbar-context">
        <button
          type="button"
          className="app-menu-button"
          onClick={onMenuToggle}
          aria-label="Open learning index"
        >
          <Menu aria-hidden="true" />
        </button>
        <span>Workspace</span>
        <strong>{currentLabel}</strong>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="app-user-trigger"
            aria-label={`Open ${
              [typedUser?.firstName, typedUser?.lastName].filter(Boolean).join(" ") ||
              "account"
            } menu`}
          >
            <Avatar className="app-user-avatar">
              <AvatarImage
                src={typedUser?.profileImageUrl || typedUser?.avatar}
                alt={`${typedUser?.firstName || ""} ${typedUser?.lastName || ""}`.trim()}
              />
              <AvatarFallback>{initials || <UserIcon aria-hidden="true" />}</AvatarFallback>
            </Avatar>
            <span className="app-user-name">
              {typedUser?.firstName || "Account"}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="app-user-menu" align="end" forceMount>
          <div className="app-user-menu-heading">
            <strong>
              {[typedUser?.firstName, typedUser?.lastName].filter(Boolean).join(" ") ||
                "DSA learner"}
            </strong>
            <span>{typedUser?.email}</span>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings" className="cursor-pointer">
              <Settings aria-hidden="true" />
              Account settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={logout}>
            <LogOut aria-hidden="true" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
