import { NextRequest } from 'next/server';
import { proxyToExpress } from '@/app/api/utils/proxy';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    return proxyToExpress(req, `/api/visits/${params.id}`, { method: 'DELETE' });
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    return proxyToExpress(req, `/api/visits/${params.id}`);
}
