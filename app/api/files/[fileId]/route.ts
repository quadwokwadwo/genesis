import { NextRequest } from 'next/server';
import { proxyStreamFromExpress } from '@/app/api/utils/proxy';

// Module 16: auth-gated file stream. Browsers hit /api/files/<uuid> for any
// image / PDF stored via the central upload pipeline; the proxy forwards the
// request to Express which returns the bytes after verifying the row isn't
// deleted (HTTP 410) or missing on disk (also 410).
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(req: NextRequest, { params }: { params: { fileId: string } }) {
    return proxyStreamFromExpress(req, `/api/files/${params.fileId}`);
}
