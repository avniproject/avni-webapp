import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // Expose VITE_ prefixed environment variables as process.env
  const processEnv = Object.keys(env)
    .filter((key) => key.startsWith("VITE_"))
    .reduce((acc, key) => {
      acc[`process.env.${key}`] = JSON.stringify(env[key]);
      return acc;
    }, {});

  // Also expose MODE (Vite's built-in variable)
  processEnv["process.env.MODE"] = JSON.stringify(mode);

  return {
    plugins: [
      react(),
      tsconfigPaths({
        projects: ["./tsconfig.json"],
      }),
    ],
    define: {
      global: "window",
      ...processEnv,
    },
    resolve: {
      extensions: [".js", ".jsx", ".ts", ".tsx"],
    },
    server: {
      port: 6010,
      proxy: {
        "^/etl": {
          target: "http://localhost:8022",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/etl/, ""),
        },
        "/chat": {
          target: "http://localhost:8023",
          changeOrigin: true,
          secure: false,
        },
        "^/(me|api|ai-assistant|web|search|config|idp-details|login|logout|auth|addressLevelType|locations|catchment|user|import|organisation|organisationConfig|subjectType|export|translation|account|forms|group|groups|concept|extension|viewsInDb|createReportingViews|groupPrivilege|implementation)":
          {
            target: process.env.BACKEND_URL,
            changeOrigin: true,
            secure: false,
          },
      },
    },
    build: {
      outDir: "build",
      sourcemap: true,
    },
    esbuild: {
      target: "es2020",
    },
    ssr: {
      noExternal: ["posthog-js", "posthog-js/react"],
    },
  };
});
