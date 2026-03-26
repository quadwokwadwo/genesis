import {
    AppointmentType,
    ArtCycleOutcome,
    BillPrintingDisplayType,
    CRUDTYPE,
    DiagnosisType,
    FertilityInvestigationType,
    INVESTIGATION_STATUS,
    MenstrualCycleType,
    PackingType,
    SourceEgg,
    SourceSperm,
    SurgeryType,
    ThyroidSize,
    USER_ROLES,
    VISIT_STATUS,
    YesNo
} from '../enums/enums';
import { MenuItem } from 'primereact/menuitem';
import { Toast } from 'primereact/toast';
import { MutableRefObject } from 'react';
import PrescriptionCard from '@/app/(main)/hospital/billing/components/PrescriptionCard';

interface FilterSelectProps {
    selectableOptions: DropdownOption[];
    selectedOption?: DropdownOption;
    onSelectChange: (e: DropdownChangeEvent) => void;
    customClasses?: string;
    elementId: string;
    defaultValue: string;
    showClearIcon?: boolean;
    showLabel?: boolean;
    pageTabIndex?: number;
    disableState?: boolean;
    tooltip?: string;
}
type TFileData = {
    fileData: string;
    fName: string;
};
type PromptUserActionProps = {
    yesAction?: () => void;
    noAction?: () => void;
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>;
    displayText: string;
    yesActionDisplay?: string;
    noActionDisplay?: string;
    textSize?: number;
    widthClass?: string;
};
type TTableProps<T> = {
    tableData: T[];
    setupTableDataEdit: (e: T) => void;
    promptTableDataDelete: (e: T) => void;
    loading?: boolean;
};
type TStateContextProps<T> = {
    setStateValue: (e: Partial<T>) => void;
    state: T;
};
type TPatient = {
    patientId: number;
    firstName: string;
    lastName: string;
    dateOfBirth: Date | string | null;
    gender: 'Male' | 'Female' | 'Other' | '';
    maritalStatus?: string;
    nationality?: string;
    occupation?: string;
    religion?: string;
    address?: string;
    phone: string;
    email: string;
    nextOfKinName?: string;
    nextOfKinPhone?: string;
    recordNumber: string;
    partner?: TPatientPartner | string;
    lastVisit?: Date | string | null;
    age?: number;
    appointmentType?: string; // just for UI
    currentTreatment?: string;
};

type TPatientPartner = { partnerId: number } & Pick<TPatient, 'firstName' | 'lastName' | 'dateOfBirth' | 'gender' | 'occupation' | 'phone' | 'email'>;

type TPatientState = {
    patientForm: TPatient;
    partnerForm: TPatientPartner;
    genders: DropdownOption[];
    maritalStatuses: DropdownOption[];
    selectedGender: DropdownOption;
    crudType: CRUDTYPE;
    tabIndex: number;
    isLoading: boolean;
    patientsList: TPatient[];
    showDialog: boolean;
    selectedMaritalStatus: DropdownOption;
};

type DropdownOption = {
    name: string;
    code: string | number;
};

type DMProps = {
    toastComponent: React.RefObject<Toast>;
    header: string;
    message: string;
    infoType: 'success' | 'info' | 'error' | 'warn';
    life: number;
    stickyStatus?: boolean;
    allowClose?: boolean;
};
type TAxiosResponseTypes<T> = {
    data?: {
        status: number;
        operatedData?: T;
    };
    status: number;
    statusText?: string;
    headers: RawAxiosResponseHeaders | AxiosResponseHeaders;
    config: InternalAxiosRequestConfig<D>;
    request?: any;
};
type TAxiosReturn<T> = {
    operatedData: T | T[];
    status: number;
    operationalStatus: number;
};

type TChiefComplaint = {
    chiefComplaint: string;
    infertility: boolean;
    anc: boolean;
};

type MenstrualHistoryRecord = {
    lmp: Date | null;
    cycleRegular: MenstrualCycleType | null;
    cycleLength: number | null;
    dysmenorrhea: YesNo | null;
    dyspareunia: YesNo | null;
    pms: string;
};

type ContraceptiveHistoryRecord = {
    everUsed: YesNo | null;
    currentMethod: string;
    durationMonths: number | null;
    reasonDiscontinued: string;
};

type ObstetricHistoryRecord = {
    gravida: number | null;
    paraTerm: number | null;
    paraPreterm: number | null;
    paraAbortions: number | null;
    paraLiving: number | null;
    miscarriages: number | null;
    stillbirths: number | null;
    ectopicPregnancy: YesNo | null;
};

type FertilityInvestigationRecord = {
    type: FertilityInvestigationType | null;
    datePerformed: Date | null;
    result: string;
    reportFile: string;
};

type ArtCycleRecord = {
    cycleNumber: number | null;
    sourceEgg: SourceEgg | null;
    sourceSperm: SourceSperm | null;
    oocytesRetrieved: number | null;
    embryosFormed: number | null;
    embryosTransferred: number | null;
    outcome: ArtCycleOutcome | null;
};

type ChronicIllnessRecord = {
    illnessId?: number;
    illnessName: string;
    notes: string;
};

type SurgeryRecord = {
    type: SurgeryType | null;
    datePerformed: Date | null;
    notes: string;
};

type PhysicalExamRecord = {
    weightKg: number | null;
    heightCm: number | null;
    bmi: number | null;
    hirsutism: YesNo | null;
    thyroid: ThyroidSize | null;
    bpSystolic: number | null;
    bpDiastolic: number | null;
    pulse: number | null;
    breastFindings: string;
    abdomenFindings: string;
    uterineSize: string;
    ultraSound: string;
};

type DiagnosisRecord = {
    diagnosisId?: number;
    visitId: number;
    code: string;
    description: string;
    type: DiagnosisType;
};

type TreatmentPlanRecord = {
    planText: string;
};
type Investigation = {
    investigationId: number;
    testName: string;
    source: string;
    price: number;
    selected?: boolean;
    category?: string;
};
type InvestigationRecord = Investigation & {
    reportFile?: string;
    selected?: boolean;
    status?: INVESTIGATION_STATUS;
};

type PrescriptionRecord = {
    medicationId: number;
    dosage: number;
    route: string;
    frequency: string;
    durationDays: number | null;
    medicationName?: string; // For display purposes
    quantity: number;
    price: number;
    totalPrice: number;
    instructions?: string;
    selectedItem?: TInventoryItem; //for UI. slashed when finally saving to db.
    drugCount?: number; //total number of drugs that will be given to patient, thus dosage*duration*frequency
    unitsPerBlister: number;
    available: boolean; // Whether drug is available at hospital
    selected?: boolean; // For external prescription selection
};

type ReviewRecord = {
    nextAppointment: Date | null;
    reviewType: string;
    reviewNotes: string;
    assistingDoctor: string;
};

type VisitState = {
    currentStep: number;
    // Core Visit Data

    menstrualHistory: MenstrualHistoryRecord;
    contraceptiveHistory: ContraceptiveHistoryRecord;
    obstetricHistory: ObstetricHistoryRecord;
    fertilityInvestigations: FertilityInvestigationRecord[];
    artCycles: ArtCycleRecord[];
    chronicIllnesses: ChronicIllnessRecord[];
    surgeries: SurgeryRecord[];
    physicalExam: PhysicalExamRecord;
    diagnoses: DiagnosisRecord[];
    treatmentPlan: TreatmentPlanRecord;
    investigations: InvestigationRecord[];
    partnerInvestigations?: InvestigationRecord[];
    prescriptions: PrescriptionRecord[];
    review: ReviewRecord;

    // UI State
    drugs: TInventoryItem[];
    filteredDrugs: TInventoryItem[];
    selectedDrug: TInventoryItem | null;
    appointments: TTodaysAppointments[];
    selectedAppointment: TTodaysAppointments | null;
    ICD11Codes: DropdownOption[];
    showVisitsToday: boolean;
    uploadingFor: string;
    chiefComplaintChecks: TChiefComplaint;
    crudType: CRUDTYPE;
    visitType: string;
    patientsVisits: TPatientVisitRecord[];
    visitSearchedDate: Date | string;
    visitId: number;
};
type TVisitRecord = {
    artCycles: ArtCycleRecord[];
    chiefComplaintChecks: TChiefComplaint;
    chronicIllnesses: ChronicIllnessRecord[];
    contraceptiveHistory: ContraceptiveHistoryRecord;
    diagnoses: DiagnosisRecord[];
    fertilityInvestigations: FertilityInvestigationRecord[];
    menstrualHistory: MenstrualHistoryRecord;
    obstetricHistory: ObstetricHistoryRecord;
    physicalExam: PhysicalExamRecord;
    prescriptions: PrescriptionRecord[];
    review: ReviewRecord;
    surgeries: SurgeryRecord[];
    treatmentPlan: TreatmentPlanRecord;
    investigations: InvestigationRecord[];
    partnerInvestigations?: InvestigationRecord[];
    visitType: string;
    accountsInfo: TAccountsInfo;
};
type TAccountsInfo = {
    chargeConsultation: number | boolean;
    chargeHospitalCard: number | boolean;
    consultationFee: number;
    hospitalCardFee: number;
    discountGiven: number;
};
type TPatientVisitRecord = {
    visitId?: number;
    doctorId: number;
    patientId: number;
    visitDate?: Date | string;
    visitRecordings: TVisitRecord | string;
    patientName?: string;
    doctorName?: string;
    patient?: TPatient | string;
    status?: string;
    visitType?: string;
    investigationStatus?: INVESTIGATION_STATUS;
};
type TPatientVisitContextProps<T> = TStateContextProps<T> & {
    addNewItem: <T extends keyof VisitState>(arrayKey: T, newItem: any) => void;
    removeItem: <T extends keyof VisitState>(arrayKey: T, index: number) => void;
    selectPatient: (patient: TPatient, appointmentType: string, crudType: CRUDTYPE, visitRecord: TFollowupRecord) => void;
    getPatientAge: (dateOfBirth: Date | string) => number;
};

type AppointmentSlot = {
    slotId: string;
    time: string;
    available: boolean;
    duration: number; // in minutes
};

type VitalSigns = {
    bloodPressure?: string;
    temperature?: number | null; // Celsius
    heartRate?: number | null; // bpm
    respiratoryRate?: number | null; // breaths per minute
    bloodPressureSystolic?: number | null; // mmHg
    bloodPressureDiastolic?: number | null; // mmHg
    oxygenSaturation?: number | null; // %
    painScale?: number | null; // 0-10
};

type Measurements = {
    height: number | null; // cm
    weight: number | null; // kg
    bmi: number | null; // auto-calculated
    headCircumference?: number | null; // cm (for pediatric)
    waistCircumference?: number | null; // cm
};

type PreVisitInfo = {
    chiefComplaint: string;
    symptoms: string[];
    medicationsCurrently: string;
    allergies: string;
    emergencyContact: string;
    emergencyPhone: string;
    insuranceInfo: string;
    specialInstructions: string;
};

type Appointment = {
    appointmentId?: number;
    appointmentDate: Date | null;
    appointmentTime: string;
    appointmentType: AppointmentType;
    status: 'Scheduled' | 'CheckedIn' | 'InProgress' | 'Completed' | 'Cancelled' | 'NoShow';
    vitalSigns: VitalSigns;
    measurements: Measurements;
    notes: string;
    estimatedDuration: number;
    priority: 'Routine' | 'Urgent' | 'Emergency';
    patientId: number | null;
    doctorId: number | null;
};
type TTodaysAppointments = { appointmentId: number; patient: TPatient | string; doctor: Doctor | string; patientId: number; doctorId: number; appointmentDate: Date | string; appointmentDetails: Appointment | string; lastVisit: Date | string };
type SchedulingState = {
    currentStep: number;
    selectedPatient: TPatient | null;
    searchQuery: string;
    patients: TPatient[];
    doctors: Doctor[];
    selectedDoctor: Doctor | null;
    selectedDate: Date | null;
    availableSlots: AppointmentSlot[];
    selectedSlot: AppointmentSlot | null;
    appointment: Appointment;
    showPatientDialog: boolean;
    showVitalSignsDialog: boolean;
    appointmentTypes: DropdownOption[];
    selectedAppointmentType: DropdownOption;
    symptoms: string[];
    todaysAppointments: TTodaysAppointments[];
    crudType: CRUDTYPE;
    showAppointmentsToday: boolean;
    isLoading: boolean;
    searchableAppointmentDate: Date | string;
    savedTodayAppointments: TTodaysAppointments[]; //save today appointments for current day only
};
type TPatientScheduleContextProps<T> = TStateContextProps<T> & {
    getPatientAge: (dateOfBirth: Date) => number;
    steps: MenuItem[];
    scheduleAppointment: () => void;
    removeAppointment: (appointmentId: number) => void;
    editAppointment: (appointment: TTodaysAppointments) => void;
    generateTimeSlots: (appointments: TTodaysAppointments[]) => AppointmentSlot[];
    onAppointmentDateChange: (e: any) => void;
    resetAppointment: () => void;
};

type ProcedureType = 'IVF' | 'IUI' | 'ICSI' | 'Egg Retrieval' | 'Embryo Transfer' | 'Hysteroscopy' | 'Laparoscopy' | 'HSG' | 'Ovarian Drilling' | 'Myomectomy' | 'Salpingectomy';

type ProcedureRisk = 'Low' | 'Moderate' | 'High';
type ConsentStatus = 'Pending' | 'Obtained' | 'Declined';
type AnesthesiaType = 'Local' | 'Conscious Sedation' | 'General' | 'Spinal';

type ProcedureDetails = {
    procedureId?: number;
    patientId: number;
    procedureType: ProcedureType | null;
    indication: string;
    scheduledDate: Date | null;
    estimatedDuration: number | null;
    surgeonId: number | null;
    surgeonName: string;
    anesthesiaType: AnesthesiaType;
    riskLevel: ProcedureRisk | null;
    specialInstructions: string;
};

type ConsultationVitalSigns = {
    bloodPressure: string;
    heartRate: number | null;
    temperature: number | null;
    weight: number | null;
    respiratoryRate: number | null;
};

type LabResults = {
    hemoglobin: number | null;
    platelets: number | null;
    bloodGroup: string;
    pregnancyTest: YesNo | null;
    hiv: YesNo | null;
    hepatitisB: YesNo | null;
    hepatitisC: YesNo | null;
    syphilis: YesNo | null;
};

type PreProcedureAssessment = {
    assessmentId?: number;
    procedureId: number;
    medicalHistory: string;
    currentMedications: string;
    allergies: string;
    previousSurgeries: string;
    lastMenstrualPeriod: Date | null;
    vitalSigns: ConsultationVitalSigns;
    labResults: LabResults;
};

type InformedConsent = {
    consentId?: number;
    procedureId: number;
    procedureExplained: YesNo;
    risksDiscussed: YesNo;
    alternativesDiscussed: YesNo;
    patientQuestions: string;
    consentStatus: ConsentStatus;
    consentDate: Date | null;
    witnessName: string;
    patientSignature: YesNo;
    doctorSignature: YesNo;
};

type PreProcedureInstructions = {
    instructionId?: number;
    procedureId: number;
    fastingRequired: YesNo;
    fastingHours: number | null;
    medicationAdjustments: string;
    arrivalTime: Date | null;
    companionRequired: YesNo;
    postProcedureCare: string;
    warningSignsToWatch: string;
    emergencyContact: string;
    additionalNotes: string;
};

type ProcedureConsultationState = {
    currentStep: number;
    patientId: number;
    procedureDetails: ProcedureDetails;
    preProcedureAssessment: PreProcedureAssessment;
    informedConsent: InformedConsent;
    preProcedureInstructions: PreProcedureInstructions;
    showFileUpload: boolean;
    uploadingFor: string;
};

type FollowUpType = 'Post-Procedure Review' | 'Complication Assessment' | 'Recovery Check' | 'Result Discussion' | 'Treatment Planning' | 'Routine Follow-up';

type RecoveryStatus = 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Concerning';
type ComplicationSeverity = 'None' | 'Mild' | 'Moderate' | 'Severe';
type OutcomeStatus = 'Successful' | 'Partially Successful' | 'Failed' | 'Pending';
type PainLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

type ProcedureReference = {
    procedureId: number;
    procedureType: ProcedureType;
    procedureDate: Date;
    surgeonName: string;
    procedureLocation: string;
};

type PostProcedureSymptoms = {
    pain: PainLevel | null;
    painLocation: string;
    bleeding: YesNo | null;
    bleedingAmount: 'None' | 'Minimal' | 'Light' | 'Moderate' | 'Heavy' | null;
    nausea: YesNo | null;
    vomiting: YesNo | null;
    fever: YesNo | null;
    dizziness: YesNo | null;
    swelling: YesNo | null;
    discharge: YesNo | null;
    dischargeType: string;
    otherSymptoms: string;
    symptomsOnset: Date | null;
    symptomsResolution: Date | null;
};

type RecoveryAssessment = {
    assessmentId?: number;
    followUpId: number;
    overallRecovery: RecoveryStatus | null;
    mobilityLevel: 'Normal' | 'Limited' | 'Restricted' | 'Bed Rest' | null;
    appetiteLevel: 'Normal' | 'Reduced' | 'Poor' | 'None' | null;
    sleepQuality: 'Good' | 'Fair' | 'Poor' | 'Very Poor' | null;
    energyLevel: 'High' | 'Normal' | 'Low' | 'Very Low' | null;
    returnToWork: YesNo | null;
    returnToWorkDate: Date | null;
    activityRestrictions: string;
    medicationCompliance: YesNo | null;
    medicationIssues: string;
    physicalTherapy: YesNo | null;
    physiotherapyNotes: string;
};

type ComplicationAssessment = {
    complicationId?: number;
    followUpId: number;
    hasComplications: YesNo | null;
    complicationSeverity: ComplicationSeverity | null;
    complicationDetails: string;
    treatmentRequired: YesNo | null;
    treatmentProvided: string;
    hospitalizationRequired: YesNo | null;
    additionalProceduresRequired: YesNo | null;
    additionalProcedureDetails: string;
    resolutionDate: Date | null;
    preventiveMeasures: string;
};

type ProcedureOutcome = {
    outcomeId?: number;
    followUpId: number;
    overallOutcome: OutcomeStatus | null;
    successCriteria: string;
    objectiveResults: string;
    patientSatisfaction: number | null;
    functionalImprovement: YesNo | null;
    functionalDetails: string;
    qualityOfLifeImprovement: YesNo | null;
    qualityOfLifeDetails: string;
    expectedVsActualResults: string;
    additionalInterventionsNeeded: YesNo | null;
    interventionDetails: string;
};

type FutureCarePlan = {
    carePlanId?: number;
    followUpId: number;
    nextAppointmentDate: Date | null;
    nextAppointmentType: FollowUpType | null;
    monitoringFrequency: string;
    expectedMilestones: string;
    warningSignsEducation: string;
    lifestyleRecommendations: string;
    medicationChanges: string;
    additionalTestsRequired: YesNo | null;
    testsDetails: string;
    referralsRequired: YesNo | null;
    referralDetails: string;
    patientEducationProvided: string;
    emergencyContactInstructions: string;
};

type FollowUpVisitState = {
    currentStep: number;
    patientId: number;
    procedureReference: ProcedureReference;
    followUpType: FollowUpType | null;
    visitDate: Date;
    chiefComplaint: string;
    postProcedureSymptoms: PostProcedureSymptoms;
    recoveryAssessment: RecoveryAssessment;
    complicationAssessment: ComplicationAssessment;
    procedureOutcome: ProcedureOutcome;
    futureCarePlan: FutureCarePlan;
    showFileUpload: boolean;
    uploadingFor: string;
    followUpChecks: {
        painManagement: boolean;
        woundCare: boolean;
        medicationReview: boolean;
        complicationScreen: boolean;
        resultDiscussion: boolean;
    };
};
type EmploymentStatus = 'active' | 'inactive' | 'retired' | 'on_leave';

type User = {
    userId?: number;
    firstName: string;
    lastName: string;
    gender: 'male' | 'female' | 'other' | '';
    dateOfBirth: Date | string | null;
    phoneNumber: string;
    email: string;
    specialization: string;
    hireDate: Date | string | null;
    employmentStatus: EmploymentStatus;
    username?: string;
    password?: string;
    role?: USER_ROLES;
    credentials?: Credential[];
};
type Doctor = User & {
    // for appointment selection. should be cleaned out after
    name?: string;
    // specialization: string;
    available?: boolean;
    consultationFee?: number;
    avatar?: string;
    rating?: number;
    experience?: number;
};

type Credential = {
    credentialId?: number;
    doctorId?: number;
    licenseNumber: string;
    licenseExpiry: Date | null;
    qualification: string;
    institution: string;
    certificationDate: Date | null;
};

type DoctorState = {
    doctorForm: Doctor;
    credentials: DoctorCredential[];
    genders: DropdownOption[];
    employmentStatuses: DropdownOption[];
    specializations: DropdownOption[];
    selectedGender: DropdownOption;
    selectedEmploymentStatus: DropdownOption;
    selectedSpecialization: DropdownOption;
    crudType: CRUDTYPE;
    tabIndex: number;
    isLoading: boolean;
    doctorsList: User[];
    showDialog: boolean;
    showCredentialDialog: boolean;
    editingCredentialIndex: number;
    rolesList: DropdownOption[];
    selectedRole: DropdownOption;
};
type DoctorContextProps<T> = TStateContextProps<T> & {
    addNewCredential: (credential: DoctorState['credentials'][0]) => void;
    updateCredential: (index: number, credential: DoctorState['credentials'][0]) => void;
    removeCredential: (index: number) => void;
};

// Enhanced types for visit with patient selection and scheduling data

type PreviousVisit = {
    visitId: number;
    visitDate: Date;
    visitType: string;
    doctor: string;
    chiefComplaint: string;
    diagnosis: string[];
    medications: string[];
    investigations: string[];
    status: string;
    nextAppointment?: Date;
    treatmentPlan?: string;
};
export interface ICD11Code {
    name: string;
}
export interface ScheduledAppointmentData {
    patient: TPatient;
    doctor: any; // revert to match doctors
    appointmentDate: Date;
    appointmentTime: string;
    appointmentType: string;
    status: string;
    vitalSigns: VitalSigns;
    measurements: Measurements;
    notes: string;
    estimatedDuration: number;
    priority: string;
}

export interface EnhancedVisitState extends VisitState {
    // Patient Selection
    isLoading: boolean;
    selectedPatient: TPatient | null;

    searchQuery: string;

    // Scheduling Data
    scheduledAppointmentData: ScheduledAppointmentData | null;
    showSchedulingDataDialog: boolean;

    // Previous Visits
    previousVisits: TPreviousVisit[];
    showPreviousVisitsDialog: boolean;
    selectedPreviousVisit: PreviousVisit | null;

    // Enhanced UI State
    patientAge: number | null;
    selectedAppointmentType: DropdownOption;
    queuedPatients: TPatient[];
    immutableQueuedPatients: TPatient[]; //store for using to search queued patients.
    accountsInfo: TAccountsInfo;
    determinedFees: IFeeSettings;
    generalSettings: IGeneralSettings;
    searchedVisitsDate: string | Date;
    users: User[];
}
type TStoreData = {
    selectedPatient: TPatient | null;
    crudType: CRUDTYPE;
    visitRecordings: TFollowupRecord;
};
type TLocalStore = {
    storageId: number;
    storage: TStoreData;
};

type CurrentSymptoms = {
    presenting: string;
    duration: string;
    severity: number; // 1-10 scale
    improvement: 'Much Better' | 'Better' | 'Same' | 'Worse' | 'Much Worse' | '';
    newSymptoms: string;
    sideEffects: string;
};

type TreatmentCompliance = {
    medicationCompliance: 'Excellent' | 'Good' | 'Fair' | 'Poor' | '';
    missedDoses: number;
    reasonForNonCompliance: string;
    procedureCompliance: 'Yes' | 'No' | 'Partial' | '';
    lifestyleChanges: string[];
};

type FollowUpLabResults = {
    testName: string;
    result: string;
    referenceRange: string;
    status: 'Normal' | 'Abnormal' | 'Critical';
    date: Date;
    reviewed: boolean;
};

type Assessment = {
    clinicalImprovement: 'Significant' | 'Moderate' | 'Minimal' | 'None' | 'Deterioration' | '';
    treatmentResponse: 'Excellent' | 'Good' | 'Fair' | 'Poor' | '';
    sideEffectsPresent: boolean;
    additionalConcerns: string;
    riskFactors: string[];
};

type TreatmentPlan = {
    continueCurrentTreatment: boolean;
    medicationChanges: string;
    newMedications: string[];
    dosageAdjustments: string;
    specialistReferral: string;
};

type FollowUpState = {
    currentStep: number;
    selectedPatient: TPatient | null;
    searchQuery: string;
    patients: TPatient[];
    previousVisits: TPreviousVisit[];
    currentSymptoms: CurrentSymptoms;
    treatmentCompliance: TreatmentCompliance;
    vitalSigns: VitalSigns & Measurements;
    labResults: FollowUpLabResults[];
    assessment: Assessment;
    treatmentPlan: TreatmentPlan;
    visitType: string;
    showPatientSearch: boolean;
    showLabResults: boolean;
    crudType: CRUDTYPE;
    visitId: number;
    isLoading: boolean;
    visitDate: Date | string;
    showFollowupsList: boolean;
    followupsVisitList: TFollowupRecord[];
    investigations: InvestigationRecord[];
    prescriptions: PrescriptionRecord[];
    drugs: TInventoryItem[];
    filteredDrugs: TInventoryItem[];
    selectedDrug: TInventoryItem | null;
    review: ReviewRecord;
    selectedAppointmentType: DropdownOption;
    accountsInfo: TAccountsInfo;
    determinedFees: IFeeSettings;
    generalSettings: IGeneralSettings;
    users: User[];
};
type TPatientFollowupVisit = {
    currentSymptoms: CurrentSymptoms;
    treatmentCompliance: TreatmentCompliance;
    vitalSigns: VitalSigns & Measurements;
    labResults: FollowUpLabResults[];
    assessment: Assessment;
    treatmentPlan: TreatmentPlan;
    visitType: string;
    investigations: InvestigationRecord[];
    review: ReviewRecord;
    prescriptions: PrescriptionRecord[];
    accountsInfo: TAccountsInfo;
};
type TPreviousVisit = {
    visitType: string;
    visitData: TFollowupRecord | TPatientVisitRecord;
};
type TFollowupRecord = Omit<TPatientVisitRecord, 'visitRecordings'> & {
    visitRecordings: TPatientFollowupVisit | string;
};
type FollowupContextProps<T> = TStateContextProps<T> & {
    selectPatient: (patient: TPatient) => void;
};
type TInventoryItem = {
    itemId: number;
    itemName: string;
    description: string;
    categoryId: number | null;
    brandId: number | null;
    unitPrice: number | null;
    quantityInStock: number;
    reorderLevel: number;
    packagingType: PackingType;
    unitsPerBlister: number;
    categoryName?: string;
    brandName?: string;
    createdAt?: Date;
    updatedAt?: Date;
};

type TCategory = {
    categoryId: number;
    categoryName: string;
    description?: string;
};

type TBrand = {
    brandId: number;
    brandName: string;
    description?: string;
};

type TNewCategory = {
    categoryName: string;
    description: string;
};

interface TNewBrand {
    brandName: string;
    description: string;
}
type TAdjustmentItem = {
    itemId: number;
    itemName?: string;
    quantityAdjusted: number;
    remarks?: string;
    previousQuantity?: number;
    newQuantity?: number;
};

type TStockAdjustment = {
    adjustmentId?: number;
    adjustmentType: 'IN' | 'OUT';
    reason: string;
    performedBy: string;
    adjustmentDate?: Date;
    adjustmentItems: AdjustmentItem[];
};

type TAdjustmentHistory = {
    adjustmentId: number;
    adjustmentDate: Date;
    adjustmentType: 'IN' | 'OUT';
    reason: string;
    performedBy: string;
    itemCount: number;
    totalAdjustment: number;
    adjustmentItems: TStockAdjustment[] | string;
};
// types/hospital/hospital.d.ts
// Add these types to your existing hospital types file

type TInventorySale = {
    saleId?: number;
    patientId: number;
    patientName?: string;
    totalAmount: number;
    paymentMethod: 'Cash' | 'Card' | 'Insurance' | 'Mobile Money' | 'Other';
    saleDate?: Date;
    createdBy: string;
    remarks: string;
    amountTendered: number;
    changeAmount: number;
    items: TSalesItem[];
    updates?: ISaleUpdateMeta;
    crudType?: CRUDTYPE;
};

type TSalesItem = {
    saleItemId?: number;
    saleId?: number;
    itemId: number;
    itemName?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    discount: number;
    finalPrice: number;
    availableStock?: number;
};
type TSalesPageState = {
    saleData: TInventorySale;
    inventoryItems: TInventoryItem[];
    filteredItems: TInventoryItem[];
    selectedItem: TInventoryItem | null;
    searchPatient: string;
    patients: TPatient[];
    filteredPatients: TPatient[];
    selectedPatient: TPatient | null;
    isLoading: boolean;
    editingItemIndex: number | null;
    showReceiptDialog: boolean;
    lastCompletedSale: {
        saleData: TInventorySale;
        patient: TPatient;
        saleId: string;
        date: Date;
    } | null;
    itemQuantity: number;
    itemDiscount: number;
    salesList: TInventorySale[];
    showSalesDialog: boolean;
    paymentMethods: DropdownOption[];
    selectedPaymentMethod: DropdownOption;
    soldToday: number;
    crudType: CRUDTYPE;
};
type TInventorySalesContextProps<T> = TStateContextProps<T> & {
    completeSale: () => void;
    toast: MutableRefObject<Toast>;
    resetItemForm: () => void;
    deleteSale: (saleId: number) => void;
    loadSales: () => void;
    user: User;
};
type TItemsPageState = {
    item: TInventoryItem | null;
    categories: TCategory[];
    brands: TBrand[];
    inventoryItems: TInventoryItem[];
    loading: boolean;
    crudType: CRUDTYPE;
    showItemDialog: boolean;
    showCategoryDialog: boolean;
    showBrandDialog: boolean;
    showItemsUpload: boolean;
    newCategory: TNewCategory;
    newBrand: TNewBrand;
};
type TItemsContextProps<T> = TStateContextProps<T> & {
    toast: MutableRefObject<Toast>;
    saveItem: () => void;
    editItem: (item: TInventoryItem) => void;
    deleteItem: (item: TInventoryItem) => void;
    addNewCategory: () => void;
    addNewBrand: () => void;
};
type TAdjustmentPageState = {
    inventoryItems: TInventoryItem[];
    adjustmentHistory: TAdjustmentHistory[];
    loading: boolean;
    showAdjustmentDialog: boolean;
    showHistoryDialog: boolean;
    adjustment: TStockAdjustment;
    selectedHistoryDetails: any;
    selectedItem: TInventoryItem | null;
    filteredItems: TInventoryItem[];
    singleAdjustment: { quantity: number; remarks: string };
};
type TStockAdjustmentContextProps<T> = TStateContextProps<T> & {
    toast: MutableRefObject<Toast>;
};

type TStockReportItem = {
    itemId: number;
    itemName: string;
    description: string;
    categoryName: string;
    brandName: string;
    unitPrice: number;
    quantityInStock: number;
    reorderLevel: number;
    packagingType: string;
    unitsPerBlister: number;
    createdAt: Date;
    updatedAt: Date;
    // Calculated fields
    stockStatus: 'Low' | 'Out of Stock' | 'Normal' | 'Overstock';
    daysSinceLastSale?: number;
    totalSold?: number;
    lastSaleDate?: Date;
    totalAdjustments?: number;
    lastAdjustmentDate?: Date;
};

type TItemStockHistory = {
    itemId: number;
    itemName: string;
    history: Array<{
        date: Date;
        type: 'Sale' | 'Adjustment';
        quantity: number;
        previousStock: number;
        newStock: number;
        reference?: string;
        performedBy?: string;
        remarks?: string;
    }>;
};
type TStockSummary = {
    totalItems: number;
    outOfStock: number;
    lowStock: number;
    overstock: number;
    normalStock: number;
};
type TStockReportState = {
    items: TStockReportItem[];
    filteredItems: TStockReportItem[];
    selectedItem: TStockReportItem | null;
    showItemHistory: boolean;
    itemHistory: TItemStockHistory | null;
    loading: boolean;
    reportCriteria: {
        category: string;
        brand: string;
        stockStatus: string;
        dateFrom: Date | null;
        dateTo: Date | null;
    };
    categories: any[];
    brands: any[];
    summaryData: TStockSummary;
};
type TStockReportContextProps<T> = TStateContextProps<T> & {
    loadStockReport: () => void;
    printRef: MutableRefObject<HTMLDivElement>;
    toast: MutableRefObject<Toast>;
    viewItemHistory: (itemId: TStockReportItem) => void;
};
type TLoginResponse = {
    isUser: boolean;
    user: User;
};

interface HospitalSettingsState {
    selectableCountries: DropdownOption[];
    selectedCountry: DropdownOption;
    countries: TCountryData[];
    general: IGeneralSettings;
    fees: IFeeSettings;
    appointments: IAppointmentSettings;
    inventory: TInventorySettings;
    notifications: INotificationSettings;
    security: ISecuritySettings;
    reports: IReportSettings;
}

interface IGeneralSettings {
    hospitalName: string;
    hospitalLogo: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    registrationNumber: string;
    taxId: string;
    country: TCountryData;
    timeZone: string;
    dateFormat: string;
    workingDays: string[];
    openingTime: string;
    closingTime: string;
    emergencyContact: string;
}

interface IFeeSettings {
    consultationFee: number;
    hospitalCardFee: number;
    hospitalCardRenewalFee: number;
    followUpConsultationFee: number;
    taxRate: number;
    enableAutoInvoicing: boolean;
    paymentMethods: string[];
    defaultPaymentMethod: string;
    lateFeePercentage: number;
    gracePeriodDays: number;
    billPrintType?: BillPrintingDisplayType;
}

interface IAppointmentSettings {
    defaultDuration: number;
    bufferTime: number;
    maxAdvanceBookingDays: number;
    enableOnlineBooking: boolean;
    requireDeposit: boolean;
    depositAmount: number;
    cancellationPeriod: number;
    maxAppointmentsPerDay: number;
    enableWaitlist: boolean;
    autoConfirmAppointments: boolean;
    reminderDays: number;
    doubleBookingAllowed: boolean;
}

interface TInventorySettings {
    lowStockAlertPercentage: number;
    autoReorderEnabled: boolean;
    defaultReorderQuantity: number;
    expiryAlertDays: number;
    enableBatchTracking: boolean;
    allowNegativeStock: boolean;
    defaultMarkup: number;
    discountLimit: number;
}

interface INotificationSettings {
    emailNotifications: boolean;
    smsNotifications: boolean;
    appointmentReminders: boolean;
    inventoryAlerts: boolean;
    paymentReminders: boolean;
    criticalAlerts: boolean;
    dailyReports: boolean;
    weeklyReports: boolean;
    notificationEmail: string;
    notificationPhone: string;
}

interface ISecuritySettings {
    sessionTimeout: number;
    passwordExpiry: number;
    minPasswordLength: number;
    requireTwoFactor: boolean;
    maxLoginAttempts: number;
    auditLogRetention: number;
    enableBackup: boolean;
    backupFrequency: string;
    dataRetentionDays: number;
}

interface IReportSettings {
    defaultReportFormat: string;
    includeHeader: boolean;
    includeLogo: boolean;
    autoGenerateReports: boolean;
    reportGenerationTime: string;
    reportRecipients: string[];
    monthlyReports: boolean;
    quarterlyReports: boolean;
    yearlyReports: boolean;
}
type THospitalSettingsContextProps<T> = TStateContextProps<T> & {
    toast: MutableRefObject<Toast>;
    saveSettings: () => void;
    updateSetting: (category: keyof HospitalSettingsState, field: string, value: any) => void;
    setHasUnsavedChanges: React.Dispatch<React.SetStateAction<boolean>>;
    // resetSettings:()=>void,
    // loadSettings:()=>void,
    // printRef:MutableRefObject<HTMLDivElement>,
};
// Expenditure Types
type ExpenseCategory =
    | 'Medical Equipment'
    | 'Pharmaceuticals'
    | 'Medical Supplies'
    | 'Utilities'
    | 'Staff Salaries'
    | 'Building Maintenance'
    | 'Insurance'
    | 'Professional Services'
    | 'Technology'
    | 'Training & Education'
    | 'Administrative'
    | 'Marketing'
    | 'Other';

type ExpenseStatus = 'Pending' | 'Approved' | 'Paid' | 'Rejected' | 'Cancelled';

type PaymentMethod = 'Cash' | 'Bank Transfer' | 'Cheque' | 'Credit Card' | 'Mobile Money' | 'Other';

type ExpensePriority = 'Low' | 'Medium' | 'High' | 'Critical';

interface ExpenseItem {
    itemId?: number;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    category: string;
    notes?: string;
}
interface Vendor {
    vendor: string;
    contactPerson?: string;
    contactPhone?: string;
    contactEmail?: string;
}
interface HospitalExpenditure {
    expenditureId?: number;
    expenseDate: Date | null | string;
    category: string;
    subCategory: string;
    description: string;
    vendor: Vendor;
    totalAmount: number;
    paymentMethod: PaymentMethod | null;
    paymentDate?: Date | null | string;
    status: ExpenseStatus;
    priority: ExpensePriority;
    departmentId?: number;
    department: string;
    userId: number;
    receiptNumber?: string;
    invoiceNumber?: string;
    taxAmount?: number;
    discountAmount?: number;
    items: ExpenseItem[];
    createdAt?: Date;
    updatedAt?: Date;
}

interface ExpenditureState {
    expenditure: HospitalExpenditure;
    expendituresList: HospitalExpenditure[];
    categories: DropdownOption[];
    selectedCategory: DropdownOption;
    subCategories: DropdownOption[];
    selectedSubCategory: DropdownOption;
    departments: DropdownOption[];
    selectedDepartment: DropdownOption;
    paymentMethods: DropdownOption[];
    selectedPaymentMethod: DropdownOption;
    statusOptions: DropdownOption[];
    priorityOptions: DropdownOption[];
    currencies: DropdownOption[];
    showExpenditureDialog: boolean;
    showItemDialog: boolean;
    showAttachmentDialog: boolean;
    crudType: CRUDTYPE;
    loading: boolean;
    selectedExpenditure: HospitalExpenditure | null;
    editingItemIndex: number | null;
    newItem: ExpenseItem;
    filterCriteria: {
        category: string;
        status: string;
        department: string;
        dateFrom: Date | null;
        dateTo: Date | null;
        amountFrom: number | null;
        amountTo: number | null;
    };
}
type ExpenditureContextProps<T> = TStateContextProps<T> & {
    state: ExpenditureState;
    setStateValue: (updates: Partial<ExpenditureState>) => void;
    saveExpenditure: () => void;
    editExpenditure: (expenditure: HospitalExpenditure) => void;
    deleteExpenditure: (expenditureId: number) => void;
    addExpenseItem: () => void;
    editExpenseItem: (index: number) => void;
    removeExpenseItem: (index: number) => void;
    calculateTotals: () => void;
    rejectExpenditure: (expenditureId: number, reason: string) => void;
    toast: MutableRefObject<Toast>;
    INITIAL_EXPENDITURE: HospitalExpenditure;
    INITIAL_ITEM: ExpenseItem;
};
interface IPayment {
    paymentId: number;
    patientId: number;
    amountPaid: number;
    createdBy: number;
    dateCreated: string;
    dateModified: string;
    paymentMethod?: string;
    description?: string;
    receiptNumber?: string;
    username?: string;
    paymentDate?: string | Date;
}
interface IModifiableItems {
    itemId: number;
    differenceInQuantity: number;
}
interface ISaleUpdateMeta {
    increasedItems: IModifiableItems[];
    decreasedItems: IModifiableItems[];
    deletedItems: TSalesItem[];
    addedItems: TSalesItem[];
}

interface DateRange {
    startDate: Date | null;
    endDate: Date | null;
}

interface FinancialSummary {
    totalRevenue: number;
    totalExpenditure: number;
    netProfit: number;
    profitMargin: number;
    totalBillings: number;
    averageBillValue: number;
    outstandingBalance: number;
    collectionRate: number;
    totalFromSales: number; //sales where customer walked in to buy
    patientsPayments: number; // from payments made independently by patients.
}

interface BillingCategorySummary {
    category: string;
    count: number;
    totalAmount: number;
    percentage: number;
}

interface ExpenditureSummary {
    category: string;
    amount: number;
    count: number;
    percentage: number;
}

interface InventoryItem {
    itemId: number;
    itemName: string;
    category: string;
    quantitySold: number;
    revenue: number;
    currentStock: number;
    stockStatus: string;
    turnoverRate: number;
}

interface DailyRevenue {
    weekStart: string;
    weekEnd: string;
    date: string;
    revenue: number;
    expenditure: number;
    profit: number;
}

interface PaymentMethodSummary {
    method: string;
    amount: number;
    count: number;
    percentage: number;
}
type TCountryData = {
    locale: string;
    currency: string;
    countryName: string;
};
interface CountryApiResponse {
    cca2: string;
    languages: Record<string, string>;
    currencies: Record<string, { name: string; symbol: string }>;
    name: { common: string; official: string };
}
interface TodayPatient extends TPatient {
    doctorId: number;
    visitId: number;
    phone: string;
    visitDate: string;
    doctorName: string;
    visitType: AppointmentType;
    status: string;
    visitDetails: TVisitRecord;
}

interface TBillPatient extends TPatient {
    hasHospitalCard: boolean;
    cardExpiryDate?: string;
}

interface Visit {
    visitId: number;
    patientId: number;
    visitDate: string;
    doctorId: number;
    doctorName: string;
    visitType: AppointmentType;
    status: VISIT_STATUS;
    investigationStatus?: INVESTIGATION_STATUS;
    diagnosis?: string;
    prescriptions?: PrescriptionRecord[];
    accountInfo: TAccountsInfo;
}

// Add prescription record type

interface BillingItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    category: string;
    removable?: boolean;
    items?: any[]; // For detailed breakdown
}

interface BillingSummary {
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    amountPaid: number;
    balance: number;
    paymentMethod: string;
    selectedPaymentMethod: DropdownOption;
}
type TBillPageState = {
    isLoading: boolean;
    todayPatients: TodayPatient[];
    selectedTodayPatient: TodayPatient | null;
    selectedPatient: TBillPatient | null;
    selectedVisit: Visit | null;
    showCustomChargeDialog: boolean;
    activeIndex: number;
    printFormat: 'a4' | 'thermal';
    billingItems: BillingItem[];
    customCharge: { description: string; amount: number };
    billingSummary: BillingSummary;
    generalSettings: IGeneralSettings | null;
    determinedFees: IFeeSettings | null;
    internalInvestigations: Investigation[];
    externalInvestigations: Investigation[];
    selectedInvestigations: Investigation[];
    partnerInternalInvestigations: Investigation[];
    partnerExternalInvestigations: Investigation[];
    partnerSelectedInvestigations: Investigation[];
    showAddInvestigationDialog: boolean;
    newInvestigation: { testName: string; source: 'Internal' | 'External'; price: number };
    availableDrugs: PrescriptionRecord[];
    externalPrescriptions: PrescriptionRecord[];
    selectedExternalPrescriptions: PrescriptionRecord[];
    paymentMethods: DropdownOption[];
    paymentMethod: string;
    selectedPaymentMethod: DropdownOption;
    user: User | null;
    selectedPrescription: TInventoryItem | null;
    showFullPrescriptionDialog: boolean;
    showCompletedBills: boolean;
    searchedBillDate: Date | string;
    completedPatients: TodayPatient[];
    printType: BillPrintingDisplayType;
};
type TBillContextProps<T> = TStateContextProps<T> & {
    state: T;
    setStateValue: (updates: Partial<ExpenditureState>) => void;
    toast: MutableRefObject<Toast>;
    componentRef: React.MutableRefObject<HTMLDivElement>;
    externalPrescriptionRef: React.MutableRefObject<HTMLDivElement>;
    investigationPrintRef: React.MutableRefObject<HTMLDivElement>;
    calculateBillingSummary: (items: BillingItem[]) => void;
    addCustomCharge: () => void;
    addNewInvestigation: () => void;
    viewPrescriptionItem: (record: PrescriptionRecord) => void;
};
