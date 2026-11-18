import { defineConfig } from 'vite';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

// Every .html file in /pages becomes a route, alongside index.html.
const pages = Object.fromEntries(
  readdirSync(resolve(__dirname, 'pages'))
    .filter((f) => f.endsWith('.html'))
    .map((f) => [f.replace('.html', ''), resolve(__dirname, 'pages', f)])
);

export default defineConfig({
  build: {
    target: 'es2020',
    rollupOptions: { input: { index: resolve(__dirname, 'index.html'), ...pages } },
  },
});
