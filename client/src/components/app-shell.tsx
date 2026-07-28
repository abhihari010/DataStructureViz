import { useState, type ReactNode } from "react";
import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import "@fontsource-variable/anybody";
import "@fontsource-variable/public-sans";
import "@/styles/app-theme.css";

type AppShellProps = {
  children: ReactNode;
  immersive?: boolean;
};

export default function AppShell({ children, immersive = false }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`app-shell ${immersive ? "app-shell--immersive" : ""}`}>
      <a className="app-skip-link" href="#app-content">
        Skip to content
      </a>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-shell-frame">
        <Navigation onMenuToggle={() => setSidebarOpen((open) => !open)} />
        <main className="app-shell-content" id="app-content" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
