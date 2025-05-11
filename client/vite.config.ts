import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
  //   // host: '0.0.0.0',
  //   // https: true,
  //   // port: 51730,
    allowedHosts: ["yonatan-h110m-s2v.local", 'www.sensorcensor.xyz', 'https://real.sensorcensor.xyz']
  },
})
