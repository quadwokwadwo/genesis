import axiosFetch from '@/libs/axiosConfig';
import { CRUDTYPE } from '@/types/enums/enums';
import { TAxiosReturn, TPaginatedResponse, TPatient, TPatientPartner, TPatientVisitRecord } from '@/types/hospital';
import { changeDateFormat } from '@/libs/utils';

export type PatientListQuery = {
    page?: number;
    pageSize?: number;
    search?: string;
    sortBy?: 'patientId' | 'firstName' | 'lastName' | 'recordNumber' | 'createdAt' | 'lastVisit';
    sortDir?: 'asc' | 'desc';
    includeInactive?: boolean;
};

class PatientsModel {
    async addNewPatient(patientData: TPatient, patientPartner: TPatientPartner, crudType: CRUDTYPE): Promise<TAxiosReturn<TPatient>> {
        const data = await axiosFetch<TPatient>('POST', `/api/patient`, { patientData, patientPartner, crudType });
        return { operatedData: data.data.operatedData, status: data.status, operationalStatus: data.data.status };
    }

    /**
     * Paginated patient list. Server returns `{ status:'ok', data:{ rows, total, page, pageSize } }`.
     * We unwrap `data` here so the caller always receives the paginated shape.
     */
    async getPatientsList(opts: PatientListQuery = {}): Promise<TPaginatedResponse<TPatient>> {
        const params = new URLSearchParams();
        params.set('page', String(opts.page ?? 1));
        params.set('pageSize', String(opts.pageSize ?? 20));
        if (opts.search) params.set('search', opts.search);
        if (opts.sortBy) params.set('sortBy', opts.sortBy);
        if (opts.sortDir) params.set('sortDir', opts.sortDir);
        if (opts.includeInactive) params.set('includeInactive', 'true');

        const response = await axiosFetch<TPaginatedResponse<TPatient>>('GET', `/api/patient?${params.toString()}`, { cache: 'no-store' });
        const payload = (response.data?.data ?? response.data?.operatedData) as unknown as TPaginatedResponse<TPatient> | undefined;
        return payload ?? { rows: [], total: 0, page: opts.page ?? 1, pageSize: opts.pageSize ?? 20 };
    }

    /** Single patient with partner + aggregate counts. */
    async getPatientById(id: number): Promise<TPatient | null> {
        const response = await axiosFetch<TPatient>('GET', `/api/patient/${id}`, { cache: 'no-store' });
        return ((response.data?.data ?? response.data?.operatedData) as TPatient | undefined) ?? null;
    }

    /** Visits for the given patient (new clean path). */
    async getPatientVisits(patientId: number): Promise<TPatientVisitRecord[]> {
        const response = await axiosFetch<TPatientVisitRecord[]>('GET', `/api/patient/${patientId}/visits`, { cache: 'no-store' });
        const data = (response.data?.data ?? response.data?.operatedData) as TPatientVisitRecord[] | undefined;
        return data ?? [];
    }

    /** Admin-only soft-delete. */
    async deletePatient(id: number) {
        const response = await axiosFetch<{ patientId: number; isActive: 0 }>('DELETE', `/api/patient/${id}`, {});
        return { operatedData: response.data?.data ?? response.data?.operatedData, status: response.status, operationalStatus: response.data?.status };
    }

    static async getTodayPatients() {
        const todayDate = changeDateFormat(new Date());
        const data = await axiosFetch<TPatientVisitRecord[]>('GET', `/api/visits/today?status=Accounts&searchedDate=${todayDate}`, { cache: 'no-store' });
        return { operatedData: data.data.operatedData, status: data.status, operationalStatus: data.data.status };
    }
    static async getBilledPatientsToday(visitDate: string) {
        const data = await axiosFetch<TPatientVisitRecord[]>('GET', `/api/visits/today?status=Completed&searchedDate=${visitDate}`, { cache: 'no-store' });
        return { operatedData: data.data.operatedData, status: data.status, operationalStatus: data.data.status };
    }
}
export default PatientsModel;
