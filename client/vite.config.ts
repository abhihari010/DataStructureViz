import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiBaseUrl = env.VITE_API_BASE_URL || "/api";
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || "http://localhost:8080";
  const apiProxyPath = apiBaseUrl.startsWith("/")
    ? apiBaseUrl.replace(/\/$/, "")
    : "/api";

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        "@assets": path.resolve(__dirname, "../attached_assets"),
      },
    },
    build: {
      outDir: path.resolve(__dirname, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      proxy: apiBaseUrl.startsWith("/")
        ? {
            [apiProxyPath]: {
              target: apiProxyTarget,
              changeOrigin: true,
            },
          }
        : undefined,
    },
  };
});
