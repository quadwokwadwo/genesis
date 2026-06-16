// Types
export type TProNuclei = '0PN' | '1PN' | '2PN (Normal)' | '3PN' | '>3PN';
export type TPolarBodies = 'None' | '1 Polar Body' | '2 Polar Bodies' | 'Fragmented';

export interface TZygoteInfo {
    zygoteId: number;
    time: string;
    pronuclei: ProNuclei | null;
    polarBodies: PolarBodies | null;
    zygoteNumber: string;
}

export interface TFertilizationAssessment {
    zygoteInfo: ZygoteInfo[];
    embryologistNotes: string;
}

export interface TBlastocyst {
    embryoId: number;
    day: string;
    time: string;
    gardnerGrade: string;
    blastocystNumber: string;
}
interface IBlastocystImage {
    imageUrl: string;
    gardnerGrade: string;
    // Display-only: short-lived signed URL returned by the server so <img> tags
    // can load the protected image without a bearer token. Never persisted —
    // the client always sends `imageUrl` back on save.
    signedUrl?: string;
    // Module 16: when present, the image was uploaded via the central
    // multipart pipeline and `imageUrl` is a UI-only preview URL. The server
    // persists `file:<fileId>` in the DB and the client resolves that back to
    // /api/files/<fileId> at render time.
    fileId?: string;
}
export interface TBlastocystAssessment {
    blastocysts: TBlastocyst[];
    embryologistNotes: string;
    images: IBlastocystImage[];
}

export interface TEmbryoTransfer {
    transferDate: string | null;
    dateOfTransfer: string;
    dayToured: string;
    numberTransferred: number;
    notes: string;
}

export interface TCryoPreservation {
    cryoDate: string | null;
    dayOfCryo: string;
    embryoIds: string;
    method: string;
    numberPreserved: number;
    storageLocation: string;
}

export interface TIVFAssessmentData {
    ivfEmbryoAssessmentId?: number;
    patientId?: number;
    dateOfCycle: string | null;
    typeOfIVFCycle: string[];
    numberOfOocytesRetrieved: number | null;
    fertilizationAssessment: TFertilizationAssessment;
    blastoCystAssessment: TBlastocystAssessment;
    embryoTransfer: TEmbryoTransfer;
    cryoPreservation: TCryoPreservation;
    userId: number;
    artCycleOutcome?: string | null;
    outcomeNotes?: string | null;
    outcomeRecordedDate?: string | null;
    outcomeRecordedBy?: number | null;
    outcomeRecordedAt?: string | null;
}

export interface TRecordArtOutcomePayload {
    outcome: string;
    notes?: string | null;
    recordedDate?: string | null;
}
export interface TEmbryoCryoPreservation {
    embryoCryoPreservationId?: number;
    canister: string;
    goblet: string;
    strawNumber: number | null;
    gobletColorCode: string;
    strawColorCode: string;
    patientId: number | null;
    patientName?: string;
    embryoType: 'Oocyte' | 'Blastocyte' | null;
    embryoQuantity: number | null;
    embryoQuality: string;
    oocyteQuantity: number | null;
    oocyteQuality: number | null;
    freezeDate: Date | null | string;
    notes: string;
    status: 'Active' | 'InActive' | 'InTank' | 'Thawed' | 'Discarded';
    userId: number;
    tankNumber?: string | null;
    cane?: string | null;
    position?: string | null;
    thawedAt?: string | null;
    thawedBy?: number | null;
    thawReason?: string | null;
    discardedAt?: string | null;
    discardedBy?: number | null;
    discardReason?: string | null;
}
