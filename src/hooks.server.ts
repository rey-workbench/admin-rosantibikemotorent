import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    // Route Protection
    const isLoginPage = event.url.pathname.startsWith('/login');
    const token = event.cookies.get('accessToken');

    if (!token && !isLoginPage) {
        throw redirect(302, '/login');
    }

    // Apply security headers
    const response = await resolve(event);
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' http://localhost:3030 ws://localhost:3030 https://* wss://*; object-src 'none';"
    );

    return response;
};
