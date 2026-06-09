import { TBilling, TInventoryItem, TPaginatedResponse } from '@/types/hospital';

import axiosFetch from '@/libs/axiosConfig';

type ListParams = {
    patientId?: number;
    visitId?: number;
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
};

function toQuery(params: ListParams): string {
    const usp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') usp.set(k, String(v));
    });
    const s = usp.toString();
    return s ? `?${s}` : '';
}

function unwrap<T>(data: any): T | null {
    if (!data) return null;
    if (data.data !== undefined) return data.data as T;
    if (data.operatedData !== undefined) return data.operatedData as T;
    return null;
}

class BillService {
    static async createBill(billDetails: any) {
        const data = await axiosFetch<any>('POST', `/api/billings`, { billDetails });
        return { operatedData: data.data.operatedData ?? data.data.data, status: data.status, operationalStatus: data.data.status };
    }

    static async getBillsList(params: ListParams = {}) {
        const data = await axiosFetch<TPaginatedResponse<TBilling>>('GET', `/api/billings${toQuery(params)}`, { cache: 'no-store' });
        const payload = unwrap<TPaginatedResponse<TBilling>>(data.data) ?? ({ rows: [], total: 0, page: 1, pageSize: 50 } as TPaginatedResponse<TBilling>);
        return { operatedData: payload, status: data.status };
    }

    static async getBillById(id: number) {
        const data = await axiosFetch<TBilling>('GET', `/api/billings/${id}`, { cache: 'no-store' });
        return { operatedData: unwrap<TBilling>(data.data), status: data.status };
    }

    static async voidBill(id: number, reason: string) {
        const data = await axiosFetch<TBilling>('POST', `/api/billings/${id}/void`, { reason });
        return { operatedData: unwrap<TBilling>(data.data), status: data.status, body: data.data };
    }

    static async getPrescriptionItem(itemId: number) {
        const data = await axiosFetch<TInventoryItem>('GET', `/api/billings/prescription-items?itemId=${itemId}`, { cache: 'no-store' });
        return { operatedData: unwrap<TInventoryItem>(data.data) };
    }

    /** @deprecated use getPrescriptionItem */
    static async getPrescriptionFull(itemId: number) {
        return BillService.getPrescriptionItem(itemId);
    }
}
export default BillService;
