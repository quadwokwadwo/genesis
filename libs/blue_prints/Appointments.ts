import { Appointment, TAxiosReturn, TTodaysAppointments } from '@/types/hospital';
import { CRUDTYPE } from '@/types/enums/enums';
import axiosFetch from '@/libs/axiosConfig';

class Appointments {
    async addNewAppointment(appointmentData: Appointment, crudType: CRUDTYPE) {
        const data = await axiosFetch<TTodaysAppointments>('POST', `/api/appointment`, { appointmentData, crudType });
        return { operatedData: data.data.operatedData as TTodaysAppointments, status: data.status, operationalStatus: data.data.status };
    }

    async getAppointmentsList(searchAppointmentDate:string) {
        const data = await axiosFetch<TTodaysAppointments[]>('GET', `/api/appointment?query=all&appointmentDate=${searchAppointmentDate}`, {cache:'no-store'});
        return { operatedData: data.data.operatedData, status: data.status, operationalStatus: data.data.status };
    }
    async getPendingAppointments(searchAppointmentDate:string) {
        const data = await axiosFetch<TTodaysAppointments[]>('GET', `/api/appointment?query=pending&appointmentDate=${searchAppointmentDate}`, {cache:'no-store'});
        return { operatedData: data.data.operatedData, status: data.status, operationalStatus: data.data.status };
    }
    async deleteAppointment(appointmentId: number) {
        const data = await axiosFetch<number>('DELETE', `/api/appointment/${appointmentId}`, {});

        return { operatedData: data.data.operatedData, status: data.status, operationalStatus: data.data.status };
    }

    async updateAppointment(appointmentDetails: Appointment) {
        const data = await axiosFetch<TTodaysAppointments>('PATCH', `/api/appointment`, {appointmentDetails});

        return { operatedData: data.data.operatedData, status: data.status, operationalStatus: data.data.status };
    }
}

export default Appointments;
