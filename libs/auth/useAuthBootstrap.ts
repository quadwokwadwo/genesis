'use client';

import { useEffect, useState } from 'react';
import { getAccessToken, refreshAccessToken } from '@/libs/axiosConfig';

/**
 * On hard reload the in-memory access token is gone, but the refresh token
 * still lives in the httpOnly cookie. Silently exchange it for a new access
 * token before letting the page issue any authenticated API call. If refresh
 * fails (cookie missing/expired/rotated), clear local user state and bounce
 * to /auth/login.
 *
 * Returns `ready=true` once the bootstrap attempt has resolved one way or
 * the other so callers can gate rendering.
 */
export function useAuthBootstrap(): { ready: boolean } {
    const [ready, setReady] = useState<boolean>(() => !!getAccessToken());

    useEffect(() => {
        if (getAccessToken()) {
            setReady(true);
            return;
        }
        let cancelled = false;
        (async () => {
            // Use the shared single-flight refresh so this bootstrap and any
            // interceptor-triggered refresh (or StrictMode's double-invoked
            // effect in dev) collapse into one rotation of the refresh cookie.
            const newToken = await refreshAccessToken();
            if (cancelled) return;
            if (!newToken) {
                try {
                    localStorage.removeItem('user');
                } catch {
                    /* ignore */
                }
                if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth/')) {
                    window.location.href = '/auth/login';
                    return;
                }
            }
            setReady(true);
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    return { ready };
}

export default useAuthBootstrap;
