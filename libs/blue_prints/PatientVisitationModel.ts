import axiosFetch from '@/libs/axiosConfig';
import { CRUDTYPE } from '@/types/enums/enums';

class PatientVisitationModel {
    async addNewPatientVisit<T>(patientVisit: T, crudType: CRUDTYPE) {
        const data = await axiosFetch<T>('POST', `/api/visits`, { patientVisit, crudType });
        return { operatedData: data.data.operatedData, status: data.status, operationalStatus: data.data.status };
    }

    async getConsultationPatients<T>() {
        const data = await axiosFetch<T[]>('GET', `/api/visits/consultation`, { cache: 'no-store' });
        return { operatedData: data.data.operatedData, status: data.status, operationalStatus: data.data.status };
    }

    async getVisitsList<T>(visitDate: string, visitType: string) {
        const data = await axiosFetch<T[]>('GET', `/api/visits?query=${visitDate}&visitType=${visitType}`, { cache: 'no-store' });
        return { operatedData: data.data.operatedData, status: data.status, operationalStatus: data.data.status };
    }

    async getFollowupVisitsList<T>(visitDate: string, visitType: string) {
        const data = await axiosFetch<T[]>('GET', `/api/visits?query=${visitDate}&visitType=${visitType}`, { cache: 'no-store' });
        return { operatedData: data.data.operatedData, status: data.status, operationalStatus: data.data.status };
    }

    async deletePatientVisit(visitId: number) {
        const data = await axiosFetch('DELETE', `/api/visits/${visitId}`, {});
        return { operatedData: data.data.operatedData, status: data.status, operationalStatus: data.data.status };
    }

    /**
     * Previous visits for a patient. Now points to the new clean route
     * `GET /api/patient/:id/visits` (response is an envelope; we unwrap `data`
     * and re-wrap as `{ operatedData }` to keep existing callers working).
     */
    async getPatientPreviousVisits<T = any>(patientId: number) {
        const data = await axiosFetch<T[]>('GET', `/api/patient/${patientId}/visits`, { cache: 'no-store' });
        const operatedData = (data.data?.data ?? data.data?.operatedData) as T[] | undefined;
        return { operatedData: operatedData ?? [], status: data.status, operationalStatus: data.data?.status };
    }
}
export default PatientVisitationModel;
