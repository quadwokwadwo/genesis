// libs/blue_prints/StockReportService.ts

import { TStockReportItem, TItemStockHistory, TCategory, TBrand } from '@/types/hospital/hospital';
import axiosFetch from '../axiosConfig';

class StockReportService {
    async getStockReport(filters?: {
        category?: string;
        brand?: string;
        stockStatus?: string;
        dateFrom?: string;
        dateTo?: string;
    }) {
        const queryParams = new URLSearchParams();
        if (filters?.category) queryParams.append('category', filters.category);
        if (filters?.brand) queryParams.append('brand', filters.brand);
        if (filters?.stockStatus) queryParams.append('stockStatus', filters.stockStatus);
        if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
        if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo);

        const data = await axiosFetch<TStockReportItem[]>(
            'GET',
            `/api/stock-report?${queryParams.toString()}`,
            {cache:'no-store'}
        );
        return {
            operatedData: data.data.operatedData,
            status: data.status,
            operationalStatus: data.data.status
        };
    }

    async getItemStockHistory(itemId: number) {
        const data = await axiosFetch<TItemStockHistory>(
            'GET',
            `/api/stock-report/item-history/${itemId}`,
            {cache:'no-store'}
        );
        return {
            operatedData: data.data.operatedData,
            status: data.status,
            operationalStatus: data.data.status
        };
    }

    async getExpiringItems(withinDays: number = 30) {
        const data = await axiosFetch<{ rows: any[] }>(
            'GET',
            `/api/items/expiring?withinDays=${withinDays}`,
            { cache: 'no-store' }
        );
        return {
            operatedData: data.data.operatedData?.rows ?? data.data.data?.rows ?? [],
            status: data.status,
            operationalStatus: data.data.status
        };
    }
}

export default StockReportService;
