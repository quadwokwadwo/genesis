import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const EXPRESS_BASE_URL = process.env.EXPRESS_API_BASE_URL || 'http://localhost:5000';
const FILENAME_RE = /^[a-zA-Z0-9._-]+$/;

// Stream-proxy of authenticated IVF blastocyst image fetches.
// We can't reuse the JSON proxy helper because we must forward the binary body
// and pass through content-type/length headers verbatim.
export async function GET(req: NextRequest, { params }: { params: { filename: string } }) {
    const filename = params.filename;
    if (!FILENAME_RE.test(filename)) {
        return NextResponse.json({ status: 'error', code: 'INVALID_FILENAME', message: 'Invalid filename' }, { status: 400 });
    }

    const headers: Record<string, string> = {};
    const auth = req.headers.get('authorization');
    if (auth) headers['authorization'] = auth;
    const cookie = req.headers.get('cookie');
    if (cookie) headers['cookie'] = cookie;
    const reqId = req.headers.get('x-request-id');
    if (reqId) headers['x-request-id'] = reqId;

    try {
        // Forward the signed-URL query params (exp, sig) so Express can
        // authenticate <img> requests that carry no bearer token.
        const upstreamUrl = new URL(`${EXPRESS_BASE_URL}/api/ivf/files/${encodeURIComponent(filename)}`);
        req.nextUrl.searchParams.forEach((value, key) => upstreamUrl.searchParams.set(key, value));

        const upstream = await fetch(upstreamUrl.toString(), {
            method: 'GET',
            headers
        });

        const respHeaders = new Headers();
        const ct = upstream.headers.get('content-type');
        if (ct) respHeaders.set('content-type', ct);
        const cl = upstream.headers.get('content-length');
        if (cl) respHeaders.set('content-length', cl);
        respHeaders.set('cache-control', 'private, max-age=300');

        return new NextResponse(upstream.body, { status: upstream.status, headers: respHeaders });
    } catch (error: any) {
        console.error('[IVF file proxy]', error?.message);
        return NextResponse.json({ status: 'error', code: 'PROXY_UNAVAILABLE', message: 'Service unavailable' }, { status: 502 });
    }
}
