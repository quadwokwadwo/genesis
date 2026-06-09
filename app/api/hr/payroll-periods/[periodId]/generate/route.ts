import { NextRequest } from 'next/server';
import { proxyToExpress } from '@/app/api/utils/proxy';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function POST(req: NextRequest, { params }: { params: { periodId: string } }) {
    return proxyToExpress(req, `/api/hr/payroll-periods/${params.periodId}/generate`);
}
