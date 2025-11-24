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
      host: '0.0.0.0',
      port: 1250,
      watch: {
        usePolling: true,
      },
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || "http://mit-clubs-server:1251",
          changeOrigin: true,
        },
      }
    }
  };
});
