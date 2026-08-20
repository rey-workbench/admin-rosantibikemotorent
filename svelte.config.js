import adapter from "@sveltejs/adapter-auto";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    // adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
    // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
    // See https://svelte.dev/docs/kit/adapters for more information about adapters.
    adapter: adapter(),
    // CSP nonce auto: SvelteKit inject nonce ke inline scripts/styles,
    // tersedia via event.csp.nonce di hooks.server.ts.
    // Memungkinkan script-src tanpa 'unsafe-inline' (anti XSS).
    csp: {
      mode: "auto",
      directives: {
        "script-src": ["self"],
        "style-src": ["self", "unsafe-inline", "https://fonts.googleapis.com"],
        "font-src": ["self", "https://fonts.gstatic.com"],
        "img-src": ["self", "data:", "https:"],
        "object-src": ["none"],
        "frame-ancestors": ["none"],
      },
    },
  },
};

export default config;
