import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';
import path from 'path';

export default defineConfig(({ mode }) => {
  // load env file from root directory
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react(), svgr()],
    root: path.resolve(__dirname, 'client'),
    envDir: path.resolve(__dirname),
    build: {
      outDir: path.resolve(__dirname, 'client/dist'),
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || "http://localhost:3000",
          changeOrigin: true,
        },
        '/socket.io': {
          target: env.VITE_API_BASE_URL || "http://localhost:3000",
          ws: true,
          changeOrigin: true,
        },
      }
    }
  };
});