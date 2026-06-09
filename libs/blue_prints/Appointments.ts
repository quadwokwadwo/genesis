import { Appointment, TAxiosReturn, TTodaysAppointments } from '@/types/hospital';
import { AppointmentStatus, CRUDTYPE } from '@/types/enums/enums';
import axiosFetch from '@/libs/axiosConfig';

type PatchPayload = {
    appointmentId: number;
    status?: AppointmentStatus | string;
    appointmentDate?: string;
    appointmentTime?: string;
    cancellationReason?: string;
};

type ListFilters = {
    date?: string;
    status?: string;
    doctorId?: number;
    patientId?: number;
    page?: number;
    pageSize?: number;
};

class Appointments {
    async addNewAppointment(appointmentData: Appointment, crudType: CRUDTYPE) {
        const data = await axiosFetch<TTodaysAppointments>('POST', `/api/appointment`, { appointmentData, crudType });
        return { operatedData: data.data.operatedData as TTodaysAppointments, status: data.status, operationalStatus: data.data.status };
    }

    /** Legacy single-date list used by the schedules page. Kept for backwards compat. */
    async getAppointmentsList(searchAppointmentDate: string) {
        const data = await axiosFetch<TTodaysAppointments[]>('GET', `/api/appointment?query=all&appointmentDate=${searchAppointmentDate}`, { cache: 'no-store' });
        return { operatedData: data.data.operatedData, status: data.status, operationalStatus: data.data.status };
    }

    /** Paginated/filtered list backed by the new GET /api/appointment contract. */
    async getAppointmentsListFiltered(filters: ListFilters) {
        const qs = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
        });
        const data = await axiosFetch<any>('GET', `/api/appointment?${qs.toString()}`, { cache: 'no-store' });
        return { operatedData: data.data.data ?? data.data.operatedData, status: data.status, operationalStatus: data.data.status };
    }

    async getPendingAppointments(searchAppointmentDate: string) {
        const data = await axiosFetch<TTodaysAppointments[]>('GET', `/api/appointment/pending?date=${searchAppointmentDate}`, { cache: 'no-store' });
        return { operatedData: data.data.operatedData ?? data.data.data, status: data.status, operationalStatus: data.data.status };
    }

    async getFollowupAppointments(searchAppointmentDate: string) {
        const data = await axiosFetch<TTodaysAppointments[]>('GET', `/api/appointment/followups?date=${searchAppointmentDate}`, { cache: 'no-store' });
        return { operatedData: data.data.operatedData ?? data.data.data, status: data.status, operationalStatus: data.data.status };
    }

    /** Returns the list of existing appointments overlapping the proposed slot. Empty = clear. */
    async checkConflicts(doctorId: number, date: string, time: string, durationMin = 60, excludeId?: number) {
        const qs = new URLSearchParams({ doctorId: String(doctorId), date, time, durationMin: String(durationMin) });
        if (excludeId) qs.set('excludeId', String(excludeId));
        const data = await axiosFetch<any[]>('GET', `/api/appointment/conflicts?${qs.toString()}`, { cache: 'no-store' });
        return { operatedData: (data.data.data ?? data.data.operatedData ?? []) as any[], status: data.status, operationalStatus: data.data.status };
    }

    async deleteAppointment(appointmentId: number) {
        const data = await axiosFetch<number>('DELETE', `/api/appointment/${appointmentId}`, {});
        return { operatedData: data.data.operatedData, status: data.status, operationalStatus: data.data.status };
    }

    /** Generic PATCH — drives status transitions, reschedule, cancel. */
    async updateAppointment(payload: PatchPayload) {
        const data = await axiosFetch<TTodaysAppointments>('PATCH', `/api/appointment`, payload);
        return { operatedData: data.data.data ?? data.data.operatedData, status: data.status, operationalStatus: data.data.status };
    }

    async cancelAppointment(appointmentId: number, reason: string) {
        return this.updateAppointment({ appointmentId, status: AppointmentStatus.Cancelled, cancellationReason: reason });
    }

    async rescheduleAppointment(appointmentId: number, newDate: string, newTime: string) {
        return this.updateAppointment({ appointmentId, appointmentDate: newDate, appointmentTime: newTime });
    }
}

export default Appointments;
