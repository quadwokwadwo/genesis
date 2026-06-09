import axiosFetch from '@/libs/axiosConfig';
import { HospitalExpenditure, TPaginatedResponse } from '@/types/hospital';
import { CRUDTYPE } from '@/types/enums/enums';

type ListParams = {
    dateFrom?: string;
    dateTo?: string;
    category?: string;
    status?: string;
    page?: number;
    pageSize?: number;
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

class Expenditure {
    static async createExpenses(expenditure: HospitalExpenditure, crudType: CRUDTYPE) {
        const data = await axiosFetch<HospitalExpenditure>('POST', `/api/expenditure`, { expenditure, crudType });

        return {
            operatedData: data.data.operatedData,
            status: data.status,
            operationalStatus: data.data.status
        };
    }

    static async getExpenses() {
        const data = await axiosFetch<HospitalExpenditure[]>('GET', `/api/expenditure`, { cache: 'no-store' });
        const payload = unwrap<TPaginatedResponse<HospitalExpenditure>>(data.data);
        const rows = payload?.rows ?? (Array.isArray(data.data?.operatedData) ? (data.data.operatedData as HospitalExpenditure[]) : []);
        return { operatedData: rows, status: data.status, operationalStatus: data.data.status };
    }

    static async listExpenditures(params: ListParams = {}) {
        const data = await axiosFetch<TPaginatedResponse<HospitalExpenditure>>('GET', `/api/expenditure${toQuery(params)}`, { cache: 'no-store' });
        const payload = unwrap<TPaginatedResponse<HospitalExpenditure>>(data.data) ?? ({ rows: [], total: 0, page: 1, pageSize: 25 } as TPaginatedResponse<HospitalExpenditure>);
        return { operatedData: payload, status: data.status };
    }

    static async approve(id: number) {
        const data = await axiosFetch<HospitalExpenditure>('POST', `/api/expenditure/${id}/approve`, {});
        return { operatedData: unwrap<HospitalExpenditure>(data.data), status: data.status, body: data.data };
    }

    static async reject(id: number, reason: string) {
        const data = await axiosFetch<HospitalExpenditure>('POST', `/api/expenditure/${id}/reject`, { reason });
        return { operatedData: unwrap<HospitalExpenditure>(data.data), status: data.status, body: data.data };
    }

    static async markPaid(id: number) {
        const data = await axiosFetch<HospitalExpenditure>('POST', `/api/expenditure/${id}/paid`, {});
        return { operatedData: unwrap<HospitalExpenditure>(data.data), status: data.status, body: data.data };
    }

    static async deleteExpenditure(expenditureId: number) {
        const data = await axiosFetch<HospitalExpenditure[]>('DELETE', `/api/expenditure/${expenditureId}`, { cache: 'no-store' });

        return { operatedData: data.data.operatedData, status: data.status, operationalStatus: data.data.status };
    }
}
export default Expenditure;
