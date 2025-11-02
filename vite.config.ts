import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: '192.168.56.1',
    https: {
      key: fs.readFileSync('./192.168.56.1-key.pem'),
      cert: fs.readFileSync('./192.168.56.1.pem')
    }
  }
});




