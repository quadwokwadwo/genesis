import { NextRequest, NextResponse } from 'next/server';

const EXPRESS_BASE_URL = process.env.EXPRESS_API_BASE_URL || 'http://localhost:5001';

// Headers we explicitly forward from browser → Express. Everything else is dropped
// so the proxy doesn't leak Next.js-internal headers into our backend.
const PASSTHROUGH_REQUEST_HEADERS = ['authorization', 'cookie', 'x-request-id', 'x-forwarded-for', 'user-agent'];

// Headers we forward from Express → browser. Set-Cookie is the critical one (refresh token cookie).
const PASSTHROUGH_RESPONSE_HEADERS = ['set-cookie', 'x-request-id', 'cache-control'];

export async function proxyToExpress(req: NextRequest, expressPath: string, options?: { method?: string }): Promise<NextResponse> {
    try {
        const method = options?.method || req.method;

        const url = new URL(expressPath, EXPRESS_BASE_URL);
        req.nextUrl.searchParams.forEach((value, key) => {
            url.searchParams.set(key, value);
        });

        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        PASSTHROUGH_REQUEST_HEADERS.forEach((name) => {
            const v = req.headers.get(name);
            if (v) headers[name] = v;
        });

        const fetchOptions: RequestInit = { method, headers };

        if (method !== 'GET' && method !== 'HEAD') {
            try {
                const body = await req.json();
                fetchOptions.body = JSON.stringify(body);
            } catch {
                // No body or invalid JSON — proceed without body
            }
        }

        const response = await fetch(url.toString(), fetchOptions);
        const contentType = response.headers.get('content-type') ?? '';
        const isJson = contentType.includes('application/json');
        const payload = isJson ? await response.json() : await response.text();

        const next = isJson ? NextResponse.json(payload, { status: response.status }) : new NextResponse(payload as string, { status: response.status });

        // Propagate Set-Cookie + a few other headers back to the browser unchanged.
        PASSTHROUGH_RESPONSE_HEADERS.forEach((name) => {
            const v = response.headers.get(name);
            if (v) next.headers.set(name, v);
        });
        return next;
    } catch (error: any) {
        console.error(`[Proxy Error] ${expressPath}:`, error.message);
        return NextResponse.json({ status: 'error', code: 'PROXY_UNAVAILABLE', message: 'Service unavailable' }, { status: 502 });
    }
}

export async function proxyDeleteToExpress(req: NextRequest, expressPath: string): Promise<NextResponse> {
    return proxyToExpress(req, expressPath, { method: 'DELETE' });
}

// Module 16: multipart pass-through for POST /api/uploads. We can't pre-parse
// the body to JSON (multer needs to read the raw multipart stream), so we
// forward the original ReadableStream + Content-Type (with its boundary)
// straight to Express. `duplex: 'half'` is required by Node's undici fetch
// whenever the body is a stream.
export async function proxyMultipartToExpress(req: NextRequest, expressPath: string): Promise<NextResponse> {
    try {
        const url = new URL(expressPath, EXPRESS_BASE_URL);
        req.nextUrl.searchParams.forEach((value, key) => {
            url.searchParams.set(key, value);
        });

        const headers: Record<string, string> = {};
        PASSTHROUGH_REQUEST_HEADERS.forEach((name) => {
            const v = req.headers.get(name);
            if (v) headers[name] = v;
        });
        const ct = req.headers.get('content-type');
        if (ct) headers['content-type'] = ct;
        const cl = req.headers.get('content-length');
        if (cl) headers['content-length'] = cl;

        const response = await fetch(url.toString(), {
            method: req.method,
            headers,
            body: req.body as any,
            // @ts-ignore — duplex is required by undici when body is a stream
            duplex: 'half'
        });

        const respContentType = response.headers.get('content-type') ?? '';
        const isJson = respContentType.includes('application/json');
        const payload = isJson ? await response.json() : await response.text();
        const next = isJson ? NextResponse.json(payload, { status: response.status }) : new NextResponse(payload as string, { status: response.status });
        PASSTHROUGH_RESPONSE_HEADERS.forEach((name) => {
            const v = response.headers.get(name);
            if (v) next.headers.set(name, v);
        });
        return next;
    } catch (error: any) {
        console.error(`[Multipart Proxy Error] ${expressPath}:`, error?.message);
        return NextResponse.json({ status: 'error', code: 'PROXY_UNAVAILABLE', message: 'Service unavailable' }, { status: 502 });
    }
}

// Module 16: binary streaming pass-through for GET /api/files/:fileId. We
// forward Content-Type, Content-Length, Content-Disposition and Cache-Control
// so the browser renders inline images / downloads PDFs as expected.
export async function proxyStreamFromExpress(req: NextRequest, expressPath: string): Promise<Response> {
    try {
        const url = new URL(expressPath, EXPRESS_BASE_URL);
        req.nextUrl.searchParams.forEach((value, key) => {
            url.searchParams.set(key, value);
        });

        const headers: Record<string, string> = {};
        PASSTHROUGH_REQUEST_HEADERS.forEach((name) => {
            const v = req.headers.get(name);
            if (v) headers[name] = v;
        });

        const response = await fetch(url.toString(), { method: 'GET', headers });
        const passthrough = ['content-type', 'content-length', 'content-disposition', 'cache-control', 'x-request-id'];
        const respHeaders = new Headers();
        passthrough.forEach((name) => {
            const v = response.headers.get(name);
            if (v) respHeaders.set(name, v);
        });
        return new Response(response.body, { status: response.status, headers: respHeaders });
    } catch (error: any) {
        console.error(`[Stream Proxy Error] ${expressPath}:`, error?.message);
        return NextResponse.json({ status: 'error', code: 'PROXY_UNAVAILABLE', message: 'Service unavailable' }, { status: 502 });
    }
}
