import axiosFetch from '@/libs/axiosConfig';
import { IPayment, TPatientVisitRecord } from '@/types/hospital';

class Payments {
    static async addNewPayment(paymentDetails:Partial<IPayment>) {

        const data = await axiosFetch<IPayment>('POST',
            `/api/payments`, {paymentDetails});

        return { operatedData: data.data.operatedData, status: data.status, operationalStatus: data.data.status };
    }
    static async getPatientRecentPayments(patientId:number) {
        const data = await axiosFetch<IPayment[]>('GET', `/api/payments?patientId=${patientId}`, {cache:'no-store'});

        return {operatedData:data.data.operatedData,status:data.status,operationalStatus:data.data.status}
    }
}
export default Payments;
