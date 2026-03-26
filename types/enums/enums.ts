export const enum GENDERS {
    male = 'Male',
    female = 'Female'
}

export const enum CRUDTYPE {
    save = 'save',
    update = 'update',
    delete = 'delete'
}
export const enum LMPPattern {
    regular = 'regular',
    irregular = 'irregular'
}
export const enum YesNo {
    yes = 'Yes',
    no = 'No'
}
export const enum MenstrualCycleType {
    regular = 'Regular',
    irregular = 'Irregular'
}
export const enum FertilityInvestigationType {
    hsg = 'HSG',
    laparoscopy = 'Laparoscopy',
    ultrasound = 'Ultrasound'
}
export const enum SourceEgg {
    self = 'Self',
    donor = 'Donor'
}
export const enum SourceSperm {
    husband = 'Husband',
    donor = 'Donor'
}
export const enum ArtCycleOutcome {
    positive = 'Positive',
    negative = 'Negative',
    biochemical = 'Biochemical',
    clinicalPregnancy = 'Clinical Pregnancy',
    miscarriage = 'Miscarriage',
    liveBirth = 'Live Birth'
}
export const enum SurgeryType {
    myomectomy = 'Myomectomy',
    salpingectomy = 'Salpingectomy',
    salpingostomy = 'Salpingostomy',
    cesareanSection = 'Cesarean Section',
    ovarianCystectomy = 'Ovarian Cystectomy',
    hysteroscopy = 'Hysteroscopy',
    other = 'Other'
}
export const enum ThyroidSize {
    normal = 'Normal',
    enlarged = 'Enlarged',
    nodular = 'Nodular'
}
export const enum DiagnosisType {
    primary = 'Primary',
    secondary = 'Secondary',
    differential = 'Differential'
}
export const enum InvestigationSource {
    internal = 'Internal',
    external = 'External'
}
export const enum AppointmentType {
    initialConsultation = 'Initial Consultation',
    followupVisit = 'Follow-up Visit',
    testResultsReview = 'Test Results Review',
    procedureConsultation = 'Procedure Consultation',
    postProcedureCheck = 'Post-Procedure Check'
}
export const enum PackingType {
    blister = 'Blister',
    bottle = 'Bottle',
    sachet = 'Sachet',
    box = 'Box',
    other = 'Other'
}
export const enum USER_ROLES {
    admin = 'admin',
    doctor = 'doctor',
    nurse = 'nurse',
    LabTech = 'lab_tech'
}
export const enum VISIT_STATUS {
    Consultation = 'Consultation',
    Accounts = 'Accounts',
    Completed = 'Completed'
}
export const enum INVESTIGATION_STATUS {
    pending = 'Pending',
    completed = 'Completed',
    failed = 'Failed'
}
export const enum BillPrintingDisplayType {
    summary = 'summary',
    detailed = 'detailed'
}
