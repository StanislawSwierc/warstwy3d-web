import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import MarkdownIt from 'markdown-it'
import texmath from 'markdown-it-texmath'
import katex from 'katex'

const md = new MarkdownIt()
md.use(texmath, { engine: katex, delimiters: 'dollars' })

function markdownPlugin(): Plugin {
  return {
    name: 'vite-plugin-md',
    transform(src, id) {
      if (!id.endsWith('.md')) return;
      const html = md.render(src);
      return {
        code: `export default ${JSON.stringify(html)};`,
        map: null,
      };
    },
  };
}

export default defineConfig({
  plugins: [markdownPlugin(), react()],
  base: './',
})
