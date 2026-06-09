import { NextRequest } from 'next/server';
import { proxyToExpress } from '@/app/api/utils/proxy';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function POST(req: NextRequest) {
    // Forward to the new auth surface so refresh cookies, rate-limits, and audit logging apply.
    return proxyToExpress(req, '/api/auth/login');
}
