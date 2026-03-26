import axiosFetch from '@/libs/axiosConfig';
import { CRUDTYPE } from '@/types/enums/enums';
import { TAxiosReturn, TPatient, TPatientPartner, TPatientVisitRecord } from '@/types/hospital';
import { changeDateFormat } from '@/libs/utils';

class PatientsModel {
    async addNewPatient(patientData: TPatient, patientPartner: TPatientPartner, crudType: CRUDTYPE):Promise<TAxiosReturn<TPatient>> {
        const data = await axiosFetch<TPatient>('POST',
            `/api/patient`, { patientData, patientPartner, crudType });

        return {operatedData:data.data.operatedData,status:data.status,operationalStatus:data.data.status}
    }
    async getPatientsList() {
        const data = await axiosFetch<TPatient[]>('GET', `/api/patient`, {cache:'no-store'});

        return {operatedData:data.data.operatedData,status:data.status,operationalStatus:data.data.status}
    }
    static async getTodayPatients() {
        const todayDate= changeDateFormat(new Date());
        const data = await axiosFetch<TPatientVisitRecord[]>('GET', `/api/visits/today?status=Accounts&searchedDate=${todayDate}`, {cache:'no-store'});
        return {operatedData:data.data.operatedData,status:data.status,operationalStatus:data.data.status}
    }
    static async getBilledPatientsToday(visitDate:string) {
        const data = await axiosFetch<TPatientVisitRecord[]>('GET', `/api/visits/today?status=Completed&searchedDate=${visitDate}`, {cache:'no-store'});
        return {operatedData:data.data.operatedData,status:data.status,operationalStatus:data.data.status}
    }
}
export default PatientsModel;
