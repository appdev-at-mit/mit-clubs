import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'path';

export default defineConfig(({ mode }) => {
  // load env file from root directory
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';
  
  return {
    plugins: [
      react(), 
      svgr(),
      nodePolyfills()
    ],
    root: path.resolve(__dirname, 'client'),
    envDir: path.resolve(__dirname),
    build: {
      outDir: path.resolve(__dirname, 'client/dist'),
      assetsDir: 'assets',
      emptyOutDir: true,
      sourcemap: !isProduction,
      minify: isProduction,
      manifest: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            utils: ['axios', 'jwt-decode']
          }
        }
      }
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || "http://localhost:3001",
          changeOrigin: true,
        },
      }
    }
  };
});