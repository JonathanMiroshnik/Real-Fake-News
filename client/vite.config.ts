// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     host: '0.0.0.0', // Allow external connections
//     port: 5173, // Standard Vite port
//     hmr: {
//       host: 'real.sensorcensor.xyz',
//       port: 443, // Standard HTTPS port
//       protocol: 'wss'
//     },
//     allowedHosts: ["yonatan-h110m-s2v.local", 'www.sensorcensor.xyz', 'real.sensorcensor.xyz']
//   },
// })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
//import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
  plugins: [react(),
//mkcert()
],
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: {
      clientPort: 443, // Connect through Nginx's HTTPS
      protocol: 'wss'
    },
    allowedHosts: ["yonatan-h110m-s2v.local", 'www.sensorcensor.xyz', 
'real.sensorcensor.x', "real.sensorcensor.xyz"]
  }
})

