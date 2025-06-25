import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import glslify from 'rollup-plugin-glslify'

// https://vite.dev/config/
export default defineConfig({
  base: '',
  root: '',
  plugins: [react(), tailwindcss(), glslify()],
})
