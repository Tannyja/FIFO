import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/FIFO/',   // <<< ชื่อ repo ของมึง
})

