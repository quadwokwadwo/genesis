import { NextRequest } from 'next/server';
import { proxyToExpress } from '@/app/api/utils/proxy';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(req: NextRequest) {
    return proxyToExpress(req, '/api/finance/fiscal-years');
}

export async function POST(req: NextRequest) {
    return proxyToExpress(req, '/api/finance/fiscal-years');
}
