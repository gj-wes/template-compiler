import { defineConfig } from 'vite';
import templateCompiler from './template-compiler'

export default defineConfig({
  plugins: [templateCompiler()],
  build: {
    outDir: 'output'
  }
});