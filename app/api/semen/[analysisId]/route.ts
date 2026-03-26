import { NextRequest } from 'next/server';
import { proxyDeleteToExpress } from '@/app/api/utils/proxy';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function DELETE(req: NextRequest, { params }) {
    const { analysisId } = params;
    return proxyDeleteToExpress(req, `/api/semen/${analysisId}`);
}
