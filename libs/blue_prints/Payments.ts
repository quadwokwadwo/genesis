import axiosFetch from '@/libs/axiosConfig';
import { IPayment } from '@/types/hospital';

export interface DailyReportRow {
    method?: string;
    cashierId?: number;
    cashierName?: string;
    hour?: number;
    total: number;
    count: number;
}

export interface DailyReportResponse {
    date: string;
    cashierId: number | null;
    totalsByMethod: DailyReportRow[];
    totalsByCashier: DailyReportRow[];
    totalsByHour: DailyReportRow[];
    receipts: IPayment[];
}

class Payments {
    static async addNewPayment(paymentDetails: Partial<IPayment>) {
        const data = await axiosFetch<IPayment>('POST', `/api/payments`, { paymentDetails });
        return { operatedData: data.data.operatedData, status: data.status, operationalStatus: data.data.status, message: (data.data as any)?.message };
    }
    static async getPatientRecentPayments(patientId: number) {
        const data = await axiosFetch<IPayment[]>('GET', `/api/payments?patientId=${patientId}`, { cache: 'no-store' });
        return { operatedData: data.data.operatedData, status: data.status, operationalStatus: data.data.status, message: (data.data as any)?.message };
    }
    static async getDailyReport(opts: { date?: string; cashierId?: number } = {}) {
        const params = new URLSearchParams();
        if (opts.date) params.set('date', opts.date);
        if (opts.cashierId) params.set('cashierId', String(opts.cashierId));
        const qs = params.toString() ? `?${params.toString()}` : '';
        const data = await axiosFetch<DailyReportResponse>('GET', `/api/payments/daily${qs}`, { cache: 'no-store' });
        return { operatedData: data.data.operatedData as unknown as DailyReportResponse, status: data.status, operationalStatus: data.data.status, message: (data.data as any)?.message };
    }
    static async refundPayment(paymentId: number, reason: string) {
        const data = await axiosFetch<{ refund: IPayment; originalPaymentId: number }>('POST', `/api/payments/${paymentId}/refund`, { reason });
        return { operatedData: data.data.operatedData, status: data.status, operationalStatus: data.data.status, message: (data.data as any)?.message };
    }
}
export default Payments;
