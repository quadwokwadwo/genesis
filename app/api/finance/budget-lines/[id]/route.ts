import { NextRequest } from 'next/server';
import { proxyToExpress } from '@/app/api/utils/proxy';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
import { proxyDeleteToExpress } from '@/app/api/utils/proxy';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    return proxyDeleteToExpress(req, `/api/finance/budget-lines/${params.id}`);
}
