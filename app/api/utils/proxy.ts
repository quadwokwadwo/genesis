import { NextRequest, NextResponse } from 'next/server';

const EXPRESS_BASE_URL = process.env.EXPRESS_API_BASE_URL || 'https://schoolserver.vitalfacilitiesgroup.com';

/**
 * Proxy a Next.js API request to the Express backend.
 * Forwards method, query params, headers, and body transparently.
 */
export async function proxyToExpress(req: NextRequest, expressPath: string, options?: { method?: string }): Promise<NextResponse> {
    try {
        const method = options?.method || req.method;

        // Build Express URL with query params
        const url = new URL(expressPath, EXPRESS_BASE_URL);
        req.nextUrl.searchParams.forEach((value, key) => {
            url.searchParams.set(key, value);
        });

        // Build fetch options
        const fetchOptions: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        // Forward body for non-GET/DELETE requests
        if (method !== 'GET' && method !== 'HEAD') {
            try {
                const body = await req.json();
                fetchOptions.body = JSON.stringify(body);
            } catch {
                // No body or invalid JSON — proceed without body
            }
        }

        const response = await fetch(url.toString(), fetchOptions);
        const data = await response.json();

        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error(`[Proxy Error] ${expressPath}:`, error.message);
        return NextResponse.json({ error: 'Service unavailable' }, { status: 502 });
    }
}

/**
 * Proxy a DELETE request with a path parameter.
 */
export async function proxyDeleteToExpress(req: NextRequest, expressPath: string): Promise<NextResponse> {
    return proxyToExpress(req, expressPath, { method: 'DELETE' });
}
