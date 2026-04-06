import { Investigation, TPatientVisitRecord } from '@/types/hospital';
import { CRUDTYPE, INVESTIGATION_STATUS } from '@/types/enums/enums';
import axiosFetch from '@/libs/axiosConfig';


class InvestigationsModel {

    async addNewInvestigation(investigation: Investigation, crudType: CRUDTYPE) {
        const data = await axiosFetch<Investigation>('POST', `/api/investigations`, { investigation, crudType });
        return { operatedData: data.data.operatedData as Investigation, status: data.status, operationalStatus: data.data.status };
    }

    async getInvestigationsList() {
        const data = await axiosFetch<Investigation[]>('GET', `/api/investigations`, {cache:'no-store'});

        return { operatedData: data.data.operatedData, status: data.status, operationalStatus: data.data.status };
    }
    static async getInvestigationPatients(investigationStatus:INVESTIGATION_STATUS) {
        const data = await axiosFetch<TPatientVisitRecord[]>('GET', `/api/investigations/patients?status=${investigationStatus}`, {cache:'no-store'});

        return { operatedData: data.data.operatedData, status: data.status, operationalStatus: data.data.status };
    }
    async deleteInvestigation(investigationId: number) {
        const data = await axiosFetch<number>('DELETE', `/api/investigations`, {});

        return { operatedData: data.data.operatedData, status: data.status, operationalStatus: data.data.status };
    }
}
export default InvestigationsModel;
