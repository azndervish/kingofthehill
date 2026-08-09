import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'
import fs from 'fs'

let commitHash = 'dev'
try { commitHash = execSync('git rev-parse --short HEAD').toString().trim() } catch {}
let pkgVersion = '0.0.0'
try { pkgVersion = JSON.parse(fs.readFileSync('./package.json', 'utf8')).version } catch {}

export default defineConfig({
  plugins: [react()],
  base: '/kingofthehill/',
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  test: { environment: 'jsdom', globals: true, setupFiles: ['./src/test-setup.js'], include: ['src/**/*.test.jsx', 'src/**/*.test.js'] },
  define: {
    __APP_VERSION__: JSON.stringify(pkgVersion),
    __COMMIT_HASH__: JSON.stringify(commitHash),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  }
})
