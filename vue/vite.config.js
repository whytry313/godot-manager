import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from "path"
const config = {
	plugins: [ vue() ],
	entry: { app: path.resolve(__dirname, './src/main.js'), },
	resolve: { preserveSymlinks: true, },
	rollupOptions: { external: ['vue'] },
	publicDir: '../public',
	build: { outDir: '../dist/vue_dist' }
};
if (process.env.NODE_ENV !== "dev") {
	config.base = "";
}

// https://vitejs.dev/config/
export default defineConfig(config);