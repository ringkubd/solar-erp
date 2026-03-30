import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Pusher: typeof Pusher;
        Echo: Echo<any>;
    }
}

let echoInstance: Echo<any> | null = null;

if (typeof window !== 'undefined') {
    window.Pusher = Pusher;

    const host = process.env.NEXT_PUBLIC_PUSHER_HOST || '127.0.0.1';
    const cleanHost = host.replace(/^https?:\/\//, '');

    echoInstance = new Echo({
        broadcaster: 'pusher',
        key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY || 'solar-erp-key',
        wsHost: cleanHost,
        wsPort: Number(process.env.NEXT_PUBLIC_PUSHER_PORT) || 443,
        forceTLS: (process.env.NEXT_PUBLIC_PUSHER_PORT === '443'),
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1',
        disableStats: true,
        enabledTransports: ['ws', 'wss'],
    });

    window.Echo = echoInstance;
}

export default echoInstance;
