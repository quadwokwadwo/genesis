import { NextRequest, NextResponse } from 'next/server';
import { runQuery } from '@/libs/utils/DBConnector';

/**
 * Generic request handler for Next.js
 * - Executes a query with request body as parameter
 * - Returns execution status and operated data
 */
export function gRequestHandler<T>(queryString: string) {
    return async (req: NextRequest): Promise<NextResponse> => {
        try {
            // Extract body (in Next.js, request.json() is async)
            const body = await req.json();
            const requestData: string = JSON.stringify(body.requestBody);

            console.log('Request Data:', requestData);

            const results: QueryResponseImproved<T> = await runQuery(queryString, [requestData]);

            return NextResponse.json({
                status: results[1]?.[0]?.executionStatus || 'unknown',
                operatedData: results[2]?.[0] || null
            });
        } catch (error: any) {
            console.error('Handler Error:', error);
            return NextResponse.json({ error: error.message || 'Unexpected error' }, { status: 400 });
        }
    };
}
