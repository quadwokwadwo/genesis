import axiosFetch, { getAccessToken } from '@/libs/axiosConfig';
import { TIVFAssessmentData, TRecordArtOutcomePayload } from '@/types/ivf/ivf';
import { CRUDTYPE } from '@/types/enums/enums';

export type TUploadedFile = {
    fileId: string;
    purpose: string;
    mimeType: string;
    sizeBytes: number;
    originalName?: string | null;
    sha256?: string;
};

class IVFEmbryoService {
    async saveIVFEmbryo(embryoData: TIVFAssessmentData, crudType: CRUDTYPE) {
        return await axiosFetch<TIVFAssessmentData>('POST', '/api/ivf', { embryoData, crudType });
    }
    async getIVFEmbryoList() {
        return await axiosFetch<TIVFAssessmentData[]>('GET', '/api/ivf', {});
    }
    async deleteIVFEmbryo(ivfId: number) {
        return await axiosFetch<any>('DELETE', `/api/ivf/${ivfId}`, {});
    }
    async recordArtOutcome(ivfEmbryoAssessmentId: number, payload: TRecordArtOutcomePayload) {
        return await axiosFetch<any>('POST', `/api/ivf/${ivfEmbryoAssessmentId}/outcome`, payload);
    }

    // Module 16: post a single blastocyst image through the central multipart
    // pipeline. axiosFetch hard-codes Content-Type: application/json, so we use
    // fetch directly here — the browser sets multipart/form-data + boundary
    // for FormData payloads automatically.
    async uploadBlastocyst(file: File): Promise<TUploadedFile> {
        return uploadFileMultipart('ivf-blastocyst', file);
    }
}

export async function uploadFileMultipart(purpose: string, file: File): Promise<TUploadedFile> {
    const fd = new FormData();
    fd.append('purpose', purpose);
    fd.append('file', file);
    const token = getAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch('/api/uploads', { method: 'POST', body: fd, headers, credentials: 'include' });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
        const msg = json?.message || `Upload failed (${res.status})`;
        throw new Error(msg);
    }
    return (json?.data ?? json?.operatedData ?? json) as TUploadedFile;
}

const ivfEmbryoService = new IVFEmbryoService();
export default ivfEmbryoService;
