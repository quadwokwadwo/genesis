import { NextRequest } from 'next/server';
import { proxyToExpress } from '@/app/api/utils/proxy';

export async function POST(req: NextRequest) {
    return proxyToExpress(req, '/api/login');
}
