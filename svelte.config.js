import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		csp: {
			mode: 'auto',
			directives: {
				'default-src': ['self'],
				'script-src': ['self', 'wasm-unsafe-eval'],
				'style-src': ['self', 'unsafe-inline', 'https://fonts.googleapis.com'],
				'font-src': ['self', 'https://fonts.gstatic.com'],
				'img-src': ['self', 'data:', 'https:', 'blob:'],
				'connect-src': [
					'self',
					'https://api.rosantibikemotorent.com',
					'wss://api.rosantibikemotorent.com',
					'http://localhost:3030',
					'ws://localhost:3030'
				],
				'object-src': ['none'],
				'frame-ancestors': ['none']
			}
		}
	}
};

export default config;
