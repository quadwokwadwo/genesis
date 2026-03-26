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
    status: 'Active' | 'InActive';
    userId: number;
}
