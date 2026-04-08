
  import { defineConfig } from 'vitest/config';
  import react from '@vitejs/plugin-react';
  import tailwindcss from '@tailwindcss/vite';
  import path from 'path';
  import { mcpPlugin } from './mcp-plugin';

  export default defineConfig({
    plugins: [react(), tailwindcss(), mcpPlugin()],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        'vaul@1.1.2': 'vaul',
        'sonner@2.0.3': 'sonner',
        'recharts@2.15.2': 'recharts',
        'react-resizable-panels@2.1.7': 'react-resizable-panels',
        'react-hook-form@7.55.0': 'react-hook-form',
        'react-day-picker@8.10.1': 'react-day-picker',
        'openai@4.73.0': 'openai',
        'next-themes@0.4.6': 'next-themes',
        'input-otp@1.4.2': 'input-otp',
        'figma:asset/2db40784bd77d5bad84a04e4e645b0c1f3c7d8bf.png': path.resolve(__dirname, './src/assets/2db40784bd77d5bad84a04e4e645b0c1f3c7d8bf.png'),
        'figma:asset/0e0a121653cc931918711be760206409b22eeac2.png': path.resolve(__dirname, './src/assets/0e0a121653cc931918711be760206409b22eeac2.png'),
        'figma:asset/01ab4ddf9498ad72150c22c58a71c1af4fd5772b.png': path.resolve(__dirname, './src/assets/01ab4ddf9498ad72150c22c58a71c1af4fd5772b.png'),
        'figma:asset/9cffe000c5dffcabac269f49ac3d9d3bd3026163.png': path.resolve(__dirname, './src/assets/9cffe000c5dffcabac269f49ac3d9d3bd3026163.png'),
        'figma:asset/c9b7fbd7a0a9b7fe816298e590cdf7f50d449a06.png': path.resolve(__dirname, './src/assets/c9b7fbd7a0a9b7fe816298e590cdf7f50d449a06.png'),
        'embla-carousel-react@8.6.0': 'embla-carousel-react',
        'cmdk@1.1.1': 'cmdk',
        'class-variance-authority@0.7.1': 'class-variance-authority',
        '@radix-ui/react-tooltip@1.1.8': '@radix-ui/react-tooltip',
        '@radix-ui/react-toggle@1.1.2': '@radix-ui/react-toggle',
        '@radix-ui/react-toggle-group@1.1.2': '@radix-ui/react-toggle-group',
        '@radix-ui/react-tabs@1.1.3': '@radix-ui/react-tabs',
        '@radix-ui/react-switch@1.1.3': '@radix-ui/react-switch',
        '@radix-ui/react-slot@1.1.2': '@radix-ui/react-slot',
        '@radix-ui/react-slider@1.2.3': '@radix-ui/react-slider',
        '@radix-ui/react-separator@1.1.2': '@radix-ui/react-separator',
        '@radix-ui/react-select@2.1.6': '@radix-ui/react-select',
        '@radix-ui/react-scroll-area@1.2.3': '@radix-ui/react-scroll-area',
        '@radix-ui/react-radio-group@1.2.3': '@radix-ui/react-radio-group',
        '@radix-ui/react-progress@1.1.2': '@radix-ui/react-progress',
        '@radix-ui/react-popover@1.1.6': '@radix-ui/react-popover',
        '@radix-ui/react-navigation-menu@1.2.5': '@radix-ui/react-navigation-menu',
        '@radix-ui/react-menubar@1.1.6': '@radix-ui/react-menubar',
        '@radix-ui/react-label@2.1.2': '@radix-ui/react-label',
        '@radix-ui/react-hover-card@1.1.6': '@radix-ui/react-hover-card',
        '@radix-ui/react-dropdown-menu@2.1.6': '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-dialog@1.1.6': '@radix-ui/react-dialog',
        '@radix-ui/react-context-menu@2.2.6': '@radix-ui/react-context-menu',
        '@radix-ui/react-collapsible@1.1.3': '@radix-ui/react-collapsible',
        '@radix-ui/react-checkbox@1.1.4': '@radix-ui/react-checkbox',
        '@radix-ui/react-avatar@1.1.3': '@radix-ui/react-avatar',
        '@radix-ui/react-aspect-ratio@1.1.2': '@radix-ui/react-aspect-ratio',
        '@radix-ui/react-alert-dialog@1.1.6': '@radix-ui/react-alert-dialog',
        '@radix-ui/react-accordion@1.2.3': '@radix-ui/react-accordion',
        '@jsr/supabase__supabase-js@2.49.8': '@jsr/supabase__supabase-js',
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      target: 'esnext',
      outDir: 'build',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;
            if (id.includes('react-dom') || id.includes('react-router') || (id.includes('/react/') && !id.includes('recharts'))) {
              return 'vendor-react';
            }
            if (id.includes('@supabase') || id.includes('supabase__supabase-js')) {
              return 'vendor-supabase';
            }
            if (id.includes('recharts') || id.includes('/d3-') || id.includes('/d3/')) {
              return 'vendor-charts';
            }
            if (
              id.includes('@radix-ui') ||
              id.includes('lucide-react') ||
              id.includes('/cmdk/') ||
              id.includes('/vaul/') ||
              id.includes('/sonner/') ||
              id.includes('embla-carousel') ||
              id.includes('next-themes') ||
              id.includes('input-otp') ||
              id.includes('react-resizable-panels') ||
              id.includes('class-variance-authority') ||
              id.includes('react-hook-form') ||
              id.includes('react-day-picker')
            ) {
              return 'vendor-ui';
            }
            if (id.includes('/motion/') || id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            if (id.includes('/openai/')) {
              return 'vendor-openai';
            }
            if (
              id.includes('/docx/') ||
              id.includes('/jspdf/') ||
              id.includes('/pizzip/') ||
              id.includes('html-to-image') ||
              id.includes('docxtemplater')
            ) {
              return 'vendor-docs';
            }
          },
        },
      },
    },
    server: {
      port: 5000,
      host: '0.0.0.0',
      allowedHosts: true,
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/__tests__/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
    },
  });
