import { NextRequest } from 'next/server';
import { proxyToExpress, proxyDeleteToExpress } from '@/app/api/utils/proxy';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    return proxyToExpress(req, `/api/patient/${params.id}`);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    return proxyDeleteToExpress(req, `/api/patient/${params.id}`);
}
