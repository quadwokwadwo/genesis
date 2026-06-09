import { Investigation, TPatientVisitRecord, TInvestigationResult } from '@/types/hospital';
import { CRUDTYPE, INVESTIGATION_STATUS, InvestigationResultStatus } from '@/types/enums/enums';
import axiosFetch from '@/libs/axiosConfig';

type ResultsQuery = {
    visitId?: number;
    patientId?: number;
    status?: InvestigationResultStatus | string;
    page?: number;
    pageSize?: number;
};

class InvestigationsModel {

    async addNewInvestigation(investigation: Investigation, crudType: CRUDTYPE) {
        const data = await axiosFetch<Investigation>('POST', `/api/investigations`, { investigation, crudType });
        return { operatedData: data.data.operatedData as Investigation, status: data.status, operationalStatus: data.data.status };
    }

    async getInvestigationsList() {
        const data = await axiosFetch<Investigation[]>('GET', `/api/investigations`, { cache: 'no-store' });
        return { operatedData: data.data.operatedData, status: data.status, operationalStatus: data.data.status };
    }

    // Replaces the deprecated /api/investigations/patients endpoint.
    async getVisitsWithInvestigations(investigationStatus: INVESTIGATION_STATUS | string = 'Pending') {
        const data = await axiosFetch<TPatientVisitRecord[]>('GET', `/api/investigations/visits?status=${encodeURIComponent(investigationStatus as string)}`, { cache: 'no-store' });
        return { operatedData: data.data.operatedData, status: data.status, operationalStatus: data.data.status };
    }

    // Kept for legacy callers. Routes through /api/investigations/visits.
    static async getInvestigationPatients(investigationStatus: INVESTIGATION_STATUS) {
        const data = await axiosFetch<TPatientVisitRecord[]>('GET', `/api/investigations/visits?status=${encodeURIComponent(investigationStatus as string)}`, { cache: 'no-store' });
        return { operatedData: data.data.operatedData, status: data.status, operationalStatus: data.data.status };
    }

    async deleteInvestigation(investigationId: number) {
        const data = await axiosFetch<{ investigationId: number }>('DELETE', `/api/investigations/${investigationId}`, {});
        return { operatedData: data.data.operatedData, status: data.status, operationalStatus: data.data.status };
    }

    async getResults(query: ResultsQuery = {}) {
        const params = new URLSearchParams();
        if (query.visitId != null) params.set('visitId', String(query.visitId));
        if (query.patientId != null) params.set('patientId', String(query.patientId));
        if (query.status) params.set('status', String(query.status));
        if (query.page != null) params.set('page', String(query.page));
        if (query.pageSize != null) params.set('pageSize', String(query.pageSize));
        const qs = params.toString();
        const url = qs ? `/api/investigations/results?${qs}` : `/api/investigations/results`;
        const data = await axiosFetch<TInvestigationResult[]>('GET', url, { cache: 'no-store' });
        return { operatedData: data.data.operatedData, status: data.status, operationalStatus: data.data.status, pagination: (data.data as any).pagination };
    }

    async recordResult(
        visitInvestigationId: number,
        payload: { investigationId: number; resultValue?: string; resultNumeric?: number | null; comments?: string; attachmentFileId?: string },
    ) {
        const data = await axiosFetch<TInvestigationResult>('POST', `/api/investigations/${visitInvestigationId}/results`, payload);
        return { operatedData: data.data.operatedData, status: data.status, operationalStatus: data.data.status };
    }

    async verifyResult(resultId: number) {
        const data = await axiosFetch<{ resultId: number; status: string }>('POST', `/api/investigations/results/${resultId}/verify`, {});
        return { operatedData: data.data.operatedData, status: data.status, operationalStatus: data.data.status };
    }

    async rejectResult(resultId: number, reason: string) {
        const data = await axiosFetch<{ resultId: number; status: string }>('POST', `/api/investigations/results/${resultId}/reject`, { reason });
        return { operatedData: data.data.operatedData, status: data.status, operationalStatus: data.data.status };
    }
}
export default InvestigationsModel;
