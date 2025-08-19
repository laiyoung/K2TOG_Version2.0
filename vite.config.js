import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react({
            // Enable Fast Refresh
            fastRefresh: true,
            // Enable React strict mode
            strict: true,
            // Enable React Router future flags
            jsxRuntime: 'automatic',
        })
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './client/src'),
        },
    },
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                secure: false,
            },
        },
        // Enable HMR
        hmr: {
            overlay: true,
        },
        // Disable caching in development
        force: true,
    },
    css: {
        // Enable CSS modules
        modules: {
            localsConvention: 'camelCase',
        },
        // Enable CSS source maps in development
        devSourcemap: true,
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        // Optimize chunk size
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor': ['react', 'react-dom', 'react-router-dom'],
                    'mui': ['@mui/material', '@mui/icons-material'],
                },
            },
        },
        // Optimize asset handling
        assetsInlineLimit: 4096,
    },
    // Optimize development experience
    optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom', '@mui/material', '@mui/icons-material'],
        // Force pre-bundling
        force: true,
    },
    // Public directory for static assets
    publicDir: 'client/public',
    root: 'client',
})
