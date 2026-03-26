import axiosFetch from '@/libs/axiosConfig';
import { HospitalExpenditure } from '@/types/hospital';
import { CRUDTYPE } from '@/types/enums/enums';

class Expenditure {
    static async createExpenses(expenditure: HospitalExpenditure,crudType:CRUDTYPE) {
        const data = await axiosFetch<HospitalExpenditure>('POST', `/api/expenditure`, { expenditure,crudType });

        return {
            operatedData: data.data.operatedData,
            status: data.status,
            operationalStatus: data.data.status
        };
    }
   static async getExpenses() {
        const data = await axiosFetch<HospitalExpenditure[]>('GET', `/api/expenditure`, {cache:'no-store'});

        return { operatedData: data.data.operatedData, status: data.status, operationalStatus: data.data.status };
    }
    static async deleteExpenditure(expenditureId: number) {
        const data = await axiosFetch<HospitalExpenditure[]>('DELETE', `/api/expenditure/${expenditureId}`, {cache:'no-store'});

        return { operatedData: data.data.operatedData, status: data.status, operationalStatus: data.data.status };
    }
}
export default Expenditure;
