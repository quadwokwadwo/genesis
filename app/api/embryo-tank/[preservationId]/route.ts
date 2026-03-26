import { NextRequest } from 'next/server';
import { proxyDeleteToExpress } from '@/app/api/utils/proxy';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function DELETE(req: NextRequest, { params }) {
    const { preservationId } = params;
    return proxyDeleteToExpress(req, `/api/embryo-tank/${preservationId}`);
}
