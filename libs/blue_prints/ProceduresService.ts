import axiosFetch from '@/libs/axiosConfig';
import { TProcedureConsultation, TProcedureFollowup } from '@/types/hospital';

export type TConsultationPayload = {
    patientId: number;
    visitId?: number | null;
    plannedProcedure: string;
    procedureDetails?: unknown;
    assessment?: unknown;
    consent?: unknown;
    instructions?: unknown;
    consentSignatureFileId?: string | null;
};

export type TProcedureFollowupPayload = {
    consultationId: number;
    patientId: number;
    symptoms?: unknown;
    recovery?: unknown;
    complications?: unknown;
    outcome?: string | null;
    notes?: string | null;
};

class ProceduresService {
    async createConsultation(payload: TConsultationPayload) {
        const res = await axiosFetch<TProcedureConsultation>('POST', `/api/procedures/consultation`, payload);
        return { operatedData: res.data.operatedData as TProcedureConsultation, status: res.status, operationalStatus: res.data.status };
    }

    async getConsultation(id: number) {
        const res = await axiosFetch<TProcedureConsultation>('GET', `/api/procedures/consultation/${id}`, {});
        return { operatedData: res.data.operatedData as TProcedureConsultation, status: res.status, operationalStatus: res.data.status };
    }

    async getPatientConsultations(patientId: number) {
        const res = await axiosFetch<TProcedureConsultation[]>('GET', `/api/patient/${patientId}/consultations`, {});
        return { operatedData: res.data.operatedData as TProcedureConsultation[], status: res.status, operationalStatus: res.data.status };
    }

    async createFollowup(payload: TProcedureFollowupPayload) {
        const res = await axiosFetch<TProcedureFollowup>('POST', `/api/procedures/followup`, payload);
        return { operatedData: res.data.operatedData as TProcedureFollowup, status: res.status, operationalStatus: res.data.status };
    }

    async getFollowup(id: number) {
        const res = await axiosFetch<TProcedureFollowup>('GET', `/api/procedures/followup/${id}`, {});
        return { operatedData: res.data.operatedData as TProcedureFollowup, status: res.status, operationalStatus: res.data.status };
    }

    async getConsultationFollowups(consultationId: number) {
        const res = await axiosFetch<TProcedureFollowup[]>('GET', `/api/procedures/consultation/${consultationId}/followups`, {});
        return { operatedData: res.data.operatedData as TProcedureFollowup[], status: res.status, operationalStatus: res.data.status };
    }
}

const proceduresService = new ProceduresService();
export default proceduresService;
export { ProceduresService };
