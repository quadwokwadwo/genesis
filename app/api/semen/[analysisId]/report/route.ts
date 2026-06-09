import { NextRequest } from 'next/server';
import { proxyToExpress } from '@/app/api/utils/proxy';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(req: NextRequest, { params }: { params: { analysisId: string } }) {
    return proxyToExpress(req, `/api/semen/${params.analysisId}/report`);
}
