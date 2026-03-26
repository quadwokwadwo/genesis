export type TPhysicalExamination = {
    volume: string;
    color: 'Greyish White' | 'clear' | 'Yellow' | 'brown' | 'red';
    liquefaction: 'Complete' | 'Incomplete' | 'Absent';
    ph: string;
    viscosity: 'Normal' | 'Increase' | 'Decrease';
    odor: 'Characteristic' | 'Foul' | 'Absent';
};

export type TMicroscopicExamination = {
    concentration: string;
    progressiveMotility: string;
    normalMorPhology: string;
    totalMotility: string;
    vitality: string;
    aggregation: 'Absent' | 'Present';

    //calculated parameters
    totalSpermCount: number;
    totalMotileSperm: number;
    progressiveMotileSperm: number;
};
export type TMotilityCategories = {
    categoryA: number;
    categoryB: number;
    categoryC: number;
    categoryD: number;
};
export type TAdditionalCells = {
    peroxidasePositiveLeukocytes: string;
    immatureCell: string;
    epithelialCell: 'Absent' | 'Few' | 'Moderate' | 'Many';
    erythrocyte: 'Absent' | 'Few' | 'Moderate' | 'Many';
};
export type TClinicalFindings = {
    interpretation: string;
    recommendation: string;
    technicalComments: string;
};
export type TSemenAnalysis = {
    semenAnalysisId: number;
    patientId: number;
    labId: string;
    collectionMethod: string;
    location: string;
    abstinence: number;
    sampleCompleted: boolean | number;
    collectionDate: Date | string;
    analysisDate: Date | string;
    reportDate: Date | string;
    physicalExamination: TPhysicalExamination;
    microscopicExamination: TMicroscopicExamination;
    motilityCategories: TMotilityCategories;
    additionalCells: TAdditionalCells;
    clinicalFindings: TClinicalFindings;
    status: 'Completed' | 'In-Progress';
};
interface TSpermPreservation {
    semenPreservationTankId?: number;
    canister: string;
    goblet: string;
    strawNumber: number | null;
    gobletColorCode: string;
    strawColorCode: string;
    patientId: number | null;
    patientName?: string;
    notes: string;
    preservationDate?: Date;
    status: 'Active' | 'InActive';
    userId: number;
}
