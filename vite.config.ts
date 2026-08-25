import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		viteCompression({ algorithm: 'brotliCompress', ext: '.br' }),
		viteCompression({ algorithm: 'gzip', ext: '.gz' })
	],
	server: {
		// Gunakan IP langsung agar tidak kena delay DNS Windows/Mac
		host: 'localhost',
		watch: {
			// Jangan pantau folder bot WA atau folder build
			ignored: ['**/node_modules/**', '**/dist/**', '**/tokens/**', '**/static/**']
		}
	},
	// Optimasi agar browser tidak "bengong" saat pertama dibuka
	optimizeDeps: {
		include: ['@lucide/svelte', 'clsx', 'tailwind-merge', 'libphonenumber-js']
	},
	build: {
		sourcemap: false,
		chunkSizeWarningLimit: 1000,
		rollupOptions: {
			external: ['canvas', 'bufferutil', 'utf-8-validate'],
			output: {
				manualChunks: (id) => {
					if (id.includes('node_modules')) {
						if (
							id.includes('carta-md') ||
							id.includes('@cartamd') ||
							id.includes('shiki') ||
							id.includes('vscode-oniguruma')
						) {
							return 'vendor-editor';
						}
						if (id.includes('libphonenumber-js') || id.includes('flag-icons')) {
							return 'vendor-phone';
						}
						if (id.includes('lucide-svelte') || id.includes('@tabler')) {
							return 'vendor-icons';
						}
						if (id.includes('socket.io-client')) {
							return 'vendor-socket';
						}
						if (id.includes('svelte')) {
							return 'vendor-svelte';
						}
						return 'vendor';
					}
				}
			}
		}
	}
});
