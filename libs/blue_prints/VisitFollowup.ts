import { Appointment, TFollowupRecord, TTodaysAppointments } from '@/types/hospital';
import { CRUDTYPE } from '@/types/enums/enums';
import axiosFetch from '@/libs/axiosConfig';

class VisitFollowup{
    async addVisitFollowup(visitFollowupData: TFollowupRecord, crudType: CRUDTYPE) {
        const data = await axiosFetch<TFollowupRecord>('POST', `/api/visits/followup`, { visitFollowupData, crudType });
        return { operatedData: data.data.operatedData as TFollowupRecord, status: data.status, operationalStatus: data.data.status };
    }
    async getFollowupAppointmentsOnly(searchAppointmentDate:string) {
        const data = await axiosFetch<TTodaysAppointments[]>('GET', `/api/appointment?query=visitFollowup&appointmentDate=${searchAppointmentDate}`, {cache:'no-store'});

        return { operatedData: data.data.operatedData as TTodaysAppointments[], status: data.status, operationalStatus: data.data.status };
    }
    async getFollowupList(searchAppointmentDate:string) {
        const data = await axiosFetch<TFollowupRecord[]>('GET', `/api/appointment?query=all&appointmentDate=${searchAppointmentDate}`, {});

        return { operatedData: data.data.operatedData, status: data.status, operationalStatus: data.data.status };
    }
}
export default VisitFollowup;
