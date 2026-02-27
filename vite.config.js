import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    
    // Use esbuild for minification (default, faster than terser)
    minify: 'esbuild',
    
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate React and related libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // Separate react-image-gallery if it's large
          'gallery-vendor': ['react-image-gallery'],
        },
        
        // Naming pattern for chunks
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'react-image-gallery']
  }
})