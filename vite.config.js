import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(), {
    name: 'responsive-image-preload',
    transformIndexHtml: {
      order: 'post',
      handler(html, context) {
        // Vite rewrites href, but leaves imagesrcset URLs untouched.
        for (const asset of Object.values(context.bundle || {})) {
          if (asset.type === 'asset' && asset.name?.endsWith('.webp')) {
            html = html.replaceAll(`/src/assets/campaign/${asset.name}`, `/${asset.fileName}`);
          }
        }
        return html;
      },
    },
  }],
})
