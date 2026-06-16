import { NextRequest } from 'next/server';
import { proxyToExpress } from '@/app/api/utils/proxy';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function PUT(req: NextRequest, { params }: { params: { provider: string } }) {
    return proxyToExpress(req, `/api/integrations/${encodeURIComponent(params.provider)}`);
}
