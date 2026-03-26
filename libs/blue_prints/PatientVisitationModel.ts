import { TFollowupRecord, TPatientVisitRecord } from '@/types/hospital';
import { AppointmentType, CRUDTYPE } from '@/types/enums/enums';
import axiosFetch from '@/libs/axiosConfig';

class PatientVisitationModel {
    async addNewPatientVisit(patientVisit: TPatientVisitRecord, crudType: CRUDTYPE) {
        const data = await axiosFetch<TPatientVisitRecord>('POST', `/api/visits`, { patientVisit, crudType });
        return { operatedData: data.data.operatedData as TPatientVisitRecord, status: data.status, operationalStatus: data.data.status };
    }
    async getConsultationPatients<T>() {
        const data = await axiosFetch<TPatientVisitRecord[]>('GET', `/api/visits/consultation`, {cache:'no-store'});
        return {operatedData:data.data.operatedData,status:data.status,operationalStatus:data.data.status}
    }
    async getVisitsList<T>(visitDate:string,visitType:AppointmentType) {

        const data = await axiosFetch<TPatientVisitRecord[]>('GET', `/api/visits?query=${visitDate}&visitType=${visitType}`, {cache:'no-store'});

        return {operatedData:data.data.operatedData,status:data.status,operationalStatus:data.data.status}
    }
    async getFollowupVisitsList<T>(visitDate:string,visitType:AppointmentType) {
        const data = await axiosFetch<TFollowupRecord[]>('GET', `/api/visits?query=${visitDate}&visitType=${visitType}`, {cache:'no-store'});

        return {operatedData:data.data.operatedData,status:data.status,operationalStatus:data.data.status}
    }
    async deletePatientVisit(visitId: number) {
        const data = await axiosFetch<number>('DELETE', `/api/visits/${visitId}`, {});

        return { operatedData: data.data.operatedData, status: data.status, operationalStatus: data.data.status };
    }
    async getPatientPreviousVisits(patientId: number) {
        const data = await axiosFetch<(TPatientVisitRecord | TFollowupRecord)[]>('GET', `/api/visits/${patientId}`, {cache:'no-store'});

        return { operatedData: data.data.operatedData, status: data.status, operationalStatus: data.data.status };
    }
}

export default PatientVisitationModel;
