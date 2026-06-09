import { NextRequest } from 'next/server';
import { proxyMultipartToExpress } from '@/app/api/utils/proxy';

// Module 16: central multipart upload entrypoint. The client posts FormData
// with fields { purpose, file } here; we forward the raw multipart stream to
// the Express /api/uploads endpoint, which handles magic-byte sniffing,
// per-purpose size/mime enforcement, and DB registration.
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function POST(req: NextRequest) {
    return proxyMultipartToExpress(req, '/api/uploads');
}
