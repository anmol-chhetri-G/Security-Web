import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for React development server
// This configures the development server with proxy for API calls
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'], // Exclude lucide-react from dependency optimization
  },
  server: {
    // Proxy API calls to backend server during development
    // This allows frontend to make requests to /api/* which get forwarded to backend
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Backend server URL
        changeOrigin: true, // Required for CORS handling
        secure: false, // Allow HTTP connections in development
      }
    }
  }
});
