import {defineConfig, loadEnv} from 'vite';

// NOTE: building for prod will not work with a linked package
// You should install directly from the repo in order to make the build work
// if you need to get the package to use a modified version, one solution
// is to manually copy the build result into the node_modules here

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [],
    server: {
      proxy: {
        '/colyseus': {
          target: env.VITE_SERVER_URL || 'http://localhost:2567',
          changeOrigin: true,
          secure: false,
          ws: true,
          rewrite: (path) => path.replace(/^\/colyseus/, ''),
        },
      },
      allowedHosts: [
        '.trycloudflare.com',
        '.ngrok-free.dev',
        '.ngrok-free.app',
      ],
    },
    // Ensure environment variables are available in the build
    define: {
      __VITE_SERVER_URL__: JSON.stringify(env.VITE_SERVER_URL),
      __VITE_SERVER_WS_URL__: JSON.stringify(env.VITE_SERVER_WS_URL),
    }
  };
});
