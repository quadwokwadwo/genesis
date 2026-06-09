'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { getAccessToken, setAccessToken } from '@/libs/axiosConfig';

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
            try {
                const r = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
                const newToken = r.data?.data?.accessToken ?? r.data?.accessToken ?? null;
                if (cancelled) return;
                if (newToken) {
                    setAccessToken(newToken);
                } else {
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
            } catch {
                if (cancelled) return;
                try {
                    localStorage.removeItem('user');
                } catch {
                    /* ignore */
                }
                if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth/')) {
                    window.location.href = '/auth/login';
                    return;
                }
            } finally {
                if (!cancelled) setReady(true);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    return { ready };
}

export default useAuthBootstrap;
