import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [tailwindcss(), sveltekit()],
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
        include: ['lucide-svelte', 'clsx', 'tailwind-merge'] // Tambahkan library UI rentalmu di sini
    }
});