import { TAxiosResponseTypes } from '@/types/hospital';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

// In-memory access token. We deliberately do NOT keep this in localStorage so that an
// XSS payload cannot exfiltrate it via document scraping. Refresh tokens live in an
// httpOnly cookie (managed by the server) and survive page reloads.
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
    accessToken = token;
};
export const getAccessToken = () => accessToken;

const client = axios.create({
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
});

client.interceptors.request.use((cfg) => {
    const headers: any = cfg.headers ?? {};
    if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
    }
    if (typeof window !== 'undefined' && typeof window.crypto?.randomUUID === 'function') {
        headers['X-Request-Id'] = window.crypto.randomUUID();
    }
    cfg.headers = headers;
    return cfg;
});

// 401 → try a single silent refresh, retry once, otherwise bounce to /auth/login.
let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
    if (!refreshInFlight) {
        refreshInFlight = (async () => {
            try {
                const r = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
                const newToken = r.data?.data?.accessToken ?? r.data?.accessToken ?? null;
                if (newToken) setAccessToken(newToken);
                return newToken;
            } catch {
                setAccessToken(null);
                return null;
            } finally {
                refreshInFlight = null;
            }
        })();
    }
    return refreshInFlight;
}

client.interceptors.response.use(
    (r) => r,
    async (error: AxiosError) => {
        const original: any = error.config;
        const url = original?.url ?? '';
        const isAuthCall = url.includes('/api/auth/');
        if (error.response?.status === 401 && !original?._retried && !isAuthCall) {
            original._retried = true;
            const token = await refreshAccessToken();
            if (token) {
                original.headers = original.headers ?? {};
                original.headers.Authorization = `Bearer ${token}`;
                return client(original);
            }
            if (typeof window !== 'undefined') {
                window.location.href = '/auth/login';
            }
        }
        throw error;
    }
);

async function axiosFetch<T>(actionType: AxiosRequestConfig['method'], url: string, actionData: object): Promise<TAxiosResponseTypes<T>> {
    const config: AxiosRequestConfig = {
        method: actionType,
        url,
        data: actionData
    };
    try {
        const response: TAxiosResponseTypes<T> = (await client(config)) as unknown as TAxiosResponseTypes<T>;
        return response;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw error;
        }
        console.log('An error occurred:', error);
        throw new Error('An error occurred while making the request.');
    }
}

export default axiosFetch;
