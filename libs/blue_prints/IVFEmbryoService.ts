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
        return await axiosFetch<TIVFAssessmentData>('POST', '/api/ivf', { embryoData: stripSignedImageUrls(embryoData), crudType });
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

// `signedUrl` is a display-only, server-issued short-lived URL. Strip it from
// blastocyst images before saving so the persisted record keeps only its
// canonical `imageUrl` reference (and never an expiring signed URL).
function stripSignedImageUrls(embryoData: TIVFAssessmentData): TIVFAssessmentData {
    const images = (embryoData as any)?.blastoCystAssessment?.images;
    if (!Array.isArray(images)) return embryoData;
    return {
        ...embryoData,
        blastoCystAssessment: {
            ...(embryoData as any).blastoCystAssessment,
            images: images.map((img: any) => {
                if (!img || typeof img !== 'object' || !('signedUrl' in img)) return img;
                const { signedUrl, ...rest } = img;
                return rest;
            })
        }
    } as TIVFAssessmentData;
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
