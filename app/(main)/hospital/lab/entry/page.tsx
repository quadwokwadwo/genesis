'use client';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import { Panel } from 'primereact/panel';
import { RadioButton } from 'primereact/radiobutton';
import { Checkbox } from 'primereact/checkbox';
import { Badge } from 'primereact/badge';
import { Avatar } from 'primereact/avatar';
import { ProgressBar } from 'primereact/progressbar';
import { Toast } from 'primereact/toast';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { FileUpload } from 'primereact/fileupload';
import { useEffect, useRef, useState } from 'react';
import InvestigationsModel from '@/libs/blue_prints/InvestigationsModel';
import { INVESTIGATION_STATUS } from '@/types/enums/enums';
import { TPatientVisitRecord } from '@/types/hospital';

// Types for Lab Results Entry
type Patient = {
    patientId: number;
    firstName: string;
    lastName: string;
    age: number;
    recordNumber: string;
    dateOfBirth: Date;
    partnerName?: string;
    treatmentType: string;
    cycleDay?: number;
    lastMenstrualPeriod?: Date;
};

type TestTemplate = {
    testId: string;
    testName: string;
    category: 'Hormonal' | 'Hematology' | 'Biochemistry' | 'Serology' | 'Immunology' | 'Genetic' | 'Other';
    units: string;
    referenceRanges: {
        condition: string;
        range: string;
        description?: string;
    }[];
    methodology?: string;
    specimenType: string;
    fastingRequired: boolean;
    turnaroundTime: string; // in hours
    cost: number;
    criticalValues?: {
        low: number;
        high: number;
    };
};

type LabTestResult = {
    resultId?: string;
    patientId: number;
    visitId?: number;
    testId: string;
    testName: string;
    category: string;
    result: string;
    units: string;
    referenceRange: string;
    status: 'Normal' | 'Abnormal' | 'Borderline' | 'Critical' | 'Pending';
    dateCollected: Date;
    dateReceived?: Date;
    dateReported: Date;
    labSource: 'Internal' | 'External';
    labTechnician: string;
    verifiedBy: string;
    methodology?: string;
    specimenType: string;
    comments?: string;
    criticalValue?: boolean;
    flagged?: boolean;
    qcPassed: boolean;
    batchNumber?: string;
};

type ImagingResult = {
    resultId?: string;
    patientId: number;
    studyType: 'Pelvic Ultrasound' | 'TVS' | 'HSG' | 'Hysteroscopy' | 'Laparoscopy' | 'MRI Pelvis' | 'Other';
    datePerformed: Date;
    performedBy: string;
    findings: string;
    impression: string;
    keyMeasurements: { [key: string]: string };
    images?: File[];
    reportFile?: File;
    radiologist: string;
    verified: boolean;
    urgent: boolean;
};

type LabEntryState = {
    currentStep: number;
    selectedPatient: Patient | null;
    searchQuery: string;
    patients: Patient[];

    // Single Entry
    selectedTest: TestTemplate | null;
    labResult: LabTestResult;
    imagingResult: ImagingResult;

    // Batch Entry
    selectedTests: TestTemplate[];

    // Available Templates
    testTemplates: TestTemplate[];
    filteredTemplates: TestTemplate[];

    // UI State
    showTemplateDialog: boolean;
    showBatchDialog: boolean;
    showQualityControl: boolean;
    showCriticalValueAlert: boolean;

    // Quality Control
    qcComments: string;
    qcPassed: boolean;

    // Verification
    verificationRequired: boolean;
    verifiedBy: string;
    verificationComments: string;
    patientsList: TPatientVisitRecord[];
};

const FERTILITY_TEST_TEMPLATES: TestTemplate[] = [
    // Hormonal Tests
    {
        testId: 'FSH',
        testName: 'Follicle Stimulating Hormone',
        category: 'Hormonal',
        units: 'mIU/mL',
        referenceRanges: [
            { condition: 'Follicular Phase', range: '3.5-12.5', description: 'Days 1-14' },
            { condition: 'Ovulation', range: '4.7-21.5', description: 'Mid-cycle' },
            { condition: 'Luteal Phase', range: '1.7-7.7', description: 'Days 15-28' },
            { condition: 'Postmenopausal', range: '25.8-134.8', description: 'After menopause' },
            { condition: 'Male', range: '1.5-12.4', description: 'Adult male' }
        ],
        methodology: 'ECLIA',
        specimenType: 'Serum',
        fastingRequired: false,
        turnaroundTime: '4',
        cost: 45.0,
        criticalValues: { low: 0.1, high: 200 }
    },
    {
        testId: 'LH',
        testName: 'Luteinizing Hormone',
        category: 'Hormonal',
        units: 'mIU/mL',
        referenceRanges: [
            { condition: 'Follicular Phase', range: '2.4-12.6', description: 'Days 1-14' },
            { condition: 'Ovulation', range: '14.0-95.6', description: 'Mid-cycle surge' },
            { condition: 'Luteal Phase', range: '1.0-11.4', description: 'Days 15-28' },
            { condition: 'Postmenopausal', range: '7.7-58.5', description: 'After menopause' },
            { condition: 'Male', range: '1.7-8.6', description: 'Adult male' }
        ],
        methodology: 'ECLIA',
        specimenType: 'Serum',
        fastingRequired: false,
        turnaroundTime: '4',
        cost: 45.0
    },
    {
        testId: 'AMH',
        testName: 'Anti-Müllerian Hormone',
        category: 'Hormonal',
        units: 'ng/mL',
        referenceRanges: [
            { condition: 'High Reserve', range: '3.0-6.8', description: 'Excellent ovarian reserve' },
            { condition: 'Normal Reserve', range: '1.0-3.0', description: 'Normal ovarian reserve' },
            { condition: 'Low Reserve', range: '0.3-1.0', description: 'Decreased ovarian reserve' },
            { condition: 'Very Low Reserve', range: '<0.3', description: 'Poor ovarian reserve' }
        ],
        methodology: 'ELISA',
        specimenType: 'Serum',
        fastingRequired: false,
        turnaroundTime: '24',
        cost: 120.0,
        criticalValues: { low: 0.1, high: 15 }
    },
    {
        testId: 'E2',
        testName: 'Estradiol',
        category: 'Hormonal',
        units: 'pg/mL',
        referenceRanges: [
            { condition: 'Follicular Phase', range: '15-150', description: 'Days 1-14' },
            { condition: 'Ovulation', range: '200-600', description: 'Mid-cycle peak' },
            { condition: 'Luteal Phase', range: '60-200', description: 'Days 15-28' },
            { condition: 'Postmenopausal', range: '<30', description: 'After menopause' },
            { condition: 'Male', range: '10-50', description: 'Adult male' }
        ],
        methodology: 'ECLIA',
        specimenType: 'Serum',
        fastingRequired: false,
        turnaroundTime: '4',
        cost: 55.0
    },
    {
        testId: 'PROG',
        testName: 'Progesterone',
        category: 'Hormonal',
        units: 'ng/mL',
        referenceRanges: [
            { condition: 'Follicular Phase', range: '0.2-1.5', description: 'Days 1-14' },
            { condition: 'Luteal Phase', range: '1.7-27.0', description: 'Days 15-28' },
            { condition: 'Ovulation Confirmation', range: '>3.0', description: '7 days post-ovulation' },
            { condition: 'First Trimester', range: '11.2-90.0', description: 'Pregnancy weeks 1-12' }
        ],
        methodology: 'ECLIA',
        specimenType: 'Serum',
        fastingRequired: false,
        turnaroundTime: '4',
        cost: 50.0
    },
    {
        testId: 'PROL',
        testName: 'Prolactin',
        category: 'Hormonal',
        units: 'ng/mL',
        referenceRanges: [
            { condition: 'Non-pregnant Female', range: '4.8-23.3', description: 'Normal female' },
            { condition: 'Male', range: '4.0-15.2', description: 'Adult male' },
            { condition: 'Pregnant', range: '34.0-386.0', description: 'Pregnancy range' }
        ],
        methodology: 'ECLIA',
        specimenType: 'Serum',
        fastingRequired: false,
        turnaroundTime: '4',
        cost: 40.0,
        criticalValues: { low: 1, high: 200 }
    },
    {
        testId: 'TSH',
        testName: 'Thyroid Stimulating Hormone',
        category: 'Hormonal',
        units: 'mIU/L',
        referenceRanges: [
            { condition: 'Normal', range: '0.27-4.2', description: 'General population' },
            { condition: 'Pregnancy', range: '0.1-2.5', description: 'Pregnant women' },
            { condition: 'Fertility Treatment', range: '0.5-2.5', description: 'Pre-conception/IVF' }
        ],
        methodology: 'ECLIA',
        specimenType: 'Serum',
        fastingRequired: false,
        turnaroundTime: '4',
        cost: 35.0
    },
    {
        testId: 'TESTO',
        testName: 'Testosterone',
        category: 'Hormonal',
        units: 'ng/dL',
        referenceRanges: [
            { condition: 'Adult Male', range: '264-916', description: 'Normal male range' },
            { condition: 'Adult Female', range: '8-60', description: 'Normal female range' },
            { condition: 'PCOS Female', range: '>60', description: 'Often elevated in PCOS' }
        ],
        methodology: 'ECLIA',
        specimenType: 'Serum',
        fastingRequired: false,
        turnaroundTime: '4',
        cost: 60.0
    },

    // Biochemistry Tests
    {
        testId: 'HBA1C',
        testName: 'Glycated Hemoglobin A1c',
        category: 'Biochemistry',
        units: '%',
        referenceRanges: [
            { condition: 'Normal', range: '<5.7', description: 'Non-diabetic' },
            { condition: 'Prediabetes', range: '5.7-6.4', description: 'Increased risk' },
            { condition: 'Diabetes', range: '≥6.5', description: 'Diabetic range' }
        ],
        methodology: 'HPLC',
        specimenType: 'Whole Blood',
        fastingRequired: false,
        turnaroundTime: '2',
        cost: 30.0
    },
    {
        testId: 'INSULIN',
        testName: 'Fasting Insulin',
        category: 'Biochemistry',
        units: 'µIU/mL',
        referenceRanges: [
            { condition: 'Normal', range: '2.6-24.9', description: 'Fasting state' },
            { condition: 'Insulin Resistance', range: '>25', description: 'Suggests IR' }
        ],
        methodology: 'ECLIA',
        specimenType: 'Serum',
        fastingRequired: true,
        turnaroundTime: '4',
        cost: 45.0
    }
];

const INITIAL_LAB_RESULT: LabTestResult = {
    patientId: 0,
    testId: '',
    testName: '',
    category: 'Hormonal',
    result: '',
    units: '',
    referenceRange: '',
    status: 'Pending',
    dateCollected: new Date(),
    dateReported: new Date(),
    labSource: 'Internal',
    labTechnician: '',
    verifiedBy: '',
    specimenType: '',
    qcPassed: true
};

const INITIAL_STATE: LabEntryState = {
    currentStep: 0,
    selectedPatient: null,
    searchQuery: '',
    patients: [
        {
            patientId: 1,
            firstName: 'Sarah',
            lastName: 'Johnson',
            age: 32,
            recordNumber: 'P001',
            dateOfBirth: new Date('1991-03-15'),
            partnerName: 'Michael Johnson',
            treatmentType: 'IVF Cycle 1',
            cycleDay: 3,
            lastMenstrualPeriod: new Date('2024-02-20')
        },
        {
            patientId: 2,
            firstName: 'Emily',
            lastName: 'Davis',
            age: 28,
            recordNumber: 'P003',
            dateOfBirth: new Date('1995-11-30'),
            treatmentType: 'Natural Conception',
            cycleDay: 21,
            lastMenstrualPeriod: new Date('2024-02-15')
        }
    ],
    selectedTest: null,
    labResult: { ...INITIAL_LAB_RESULT },
    imagingResult: {
        patientId: 0,
        studyType: 'Pelvic Ultrasound',
        datePerformed: new Date(),
        performedBy: '',
        findings: '',
        impression: '',
        keyMeasurements: {},
        radiologist: '',
        verified: false,
        urgent: false
    },
    selectedTests: [],
    testTemplates: FERTILITY_TEST_TEMPLATES,
    filteredTemplates: FERTILITY_TEST_TEMPLATES,
    showTemplateDialog: false,
    showBatchDialog: false,
    showQualityControl: false,
    showCriticalValueAlert: false,
    qcComments: '',
    qcPassed: true,
    verificationRequired: true,
    verifiedBy: '',
    verificationComments: '',
    patientsList: []
};

const LabResultsEntry = () => {
    const [state, setState] = useState<LabEntryState>(INITIAL_STATE);
    const toast = useRef<Toast>(null);
    const fileUploadRef = useRef<FileUpload>(null);

    const steps = [
        { label: 'Patient', icon: 'pi pi-user', description: 'Select patient' },
        { label: 'Test Selection', icon: 'pi pi-list', description: 'Choose tests' },
        { label: 'Result Entry', icon: 'pi pi-pencil', description: 'Enter results' },
        { label: 'Quality Control', icon: 'pi pi-check', description: 'QC review' },
        { label: 'Verification', icon: 'pi pi-verified', description: 'Final approval' }
    ];

    useEffect(() => {
        const initEntry = async () => {
            const response = await InvestigationsModel.getInvestigationPatients(INVESTIGATION_STATUS.pending);
            console.log(response);
            setStateValue({
                patientsList: response.operatedData.map((visit) => ({
                    ...visit,
                    patient: typeof visit.patient === 'string' ? JSON.parse(visit.patient) : visit.patient,
                    visitRecordings: typeof visit.visitRecordings === 'string' ? JSON.parse(visit.visitRecordings) : visit.visitRecordings
                }))
            });
        };
        initEntry();
    }, []);
    useEffect(() => {
        document.title = 'Lab Results Entry';
        // Auto-calculate derived values
        if (state.selectedTest) {
            calculateAutoValues();
        }
    }, [state.labResult.result]);

    const setStateValue = (updates: Partial<LabEntryState>) => {
        setState((prev) => ({ ...prev, ...updates }));
    };

    const selectPatient = (patient: Patient) => {
        setStateValue({
            selectedPatient: patient,
            labResult: { ...state.labResult, patientId: patient.patientId },
            imagingResult: { ...state.imagingResult, patientId: patient.patientId },
            currentStep: 1
        });
    };

    const selectTest = (test: TestTemplate) => {
        const referenceRange = getReferenceRangeForPatient(test, state.selectedPatient);
        setStateValue({
            selectedTest: test,
            labResult: {
                ...state.labResult,
                testId: test.testId,
                testName: test.testName,
                category: test.category,
                units: test.units,
                referenceRange: referenceRange,
                specimenType: test.specimenType,
                methodology: test.methodology
            },
            currentStep: 2
        });
    };

    const getReferenceRangeForPatient = (test: TestTemplate, patient: Patient | null): string => {
        if (!patient || !test.referenceRanges || test.referenceRanges.length === 0) {
            return '';
        }

        // Simple logic - could be enhanced based on patient details
        const defaultRange = test.referenceRanges.find((r) => r.condition === 'Normal') || test.referenceRanges[0];

        return defaultRange.range;
    };

    const calculateAutoValues = () => {
        // Check for critical values
        if (state.selectedTest?.criticalValues && state.labResult.result) {
            const value = parseFloat(state.labResult.result);
            const critical = state.selectedTest.criticalValues;
            if (value < critical.low || value > critical.high) {
                setStateValue({
                    labResult: { ...state.labResult, criticalValue: true, status: 'Critical' },
                    showCriticalValueAlert: true
                });
            }
        }
    };

    const determineResultStatus = (result: string, referenceRange: string): 'Normal' | 'Abnormal' | 'Borderline' | 'Critical' | 'Pending' => {
        // Simple range checking - would be more sophisticated in real implementation
        if (!result || !referenceRange) return 'Pending';

        const numResult = parseFloat(result);
        if (isNaN(numResult)) return 'Pending';

        // Parse reference range (e.g., "3.5-12.5" or "<5.7" or ">25")
        if (referenceRange.includes('-')) {
            const [min, max] = referenceRange.split('-').map(parseFloat);
            if (numResult >= min && numResult <= max) return 'Normal';
            if ((numResult < min && numResult >= min * 0.9) || (numResult > max && numResult <= max * 1.1)) {
                return 'Borderline';
            }
            return 'Abnormal';
        } else if (referenceRange.startsWith('<')) {
            const threshold = parseFloat(referenceRange.substring(1));
            return numResult < threshold ? 'Normal' : 'Abnormal';
        } else if (referenceRange.startsWith('>')) {
            const threshold = parseFloat(referenceRange.substring(1));
            return numResult > threshold ? 'Normal' : 'Abnormal';
        }

        return 'Pending';
    };

    const validateResult = (): boolean => {
        if (!state.selectedPatient || !state.selectedTest) return false;
        if (!state.labResult.result || !state.labResult.labTechnician) return false;
        return true;
    };

    const saveResult = () => {
        if (!validateResult()) {
            toast.current?.show({
                severity: 'error',
                summary: 'Validation Error',
                detail: 'Please complete all required fields',
                life: 3000
            });
            return;
        }

        // Determine final status
        const status = determineResultStatus(state.labResult.result, state.labResult.referenceRange);

        const finalResult = {
            ...state.labResult,
            status,
            resultId: `${state.labResult.patientId}_${state.labResult.testId}_${Date.now()}`
        };

        toast.current?.show({
            severity: 'success',
            summary: 'Result Saved',
            detail: `Lab result saved for ${state.selectedPatient?.firstName} ${state.selectedPatient?.lastName}`,
            life: 5000
        });

        console.log('Saved Result:', finalResult);
    };

    const searchTemplates = (query: string) => {
        const filtered = state.testTemplates.filter(
            (template) => template.testName.toLowerCase().includes(query.toLowerCase()) || template.testId.toLowerCase().includes(query.toLowerCase()) || template.category.toLowerCase().includes(query.toLowerCase())
        );
        setStateValue({ filteredTemplates: filtered });
    };

    const nextStep = () => {
        if (state.currentStep < steps.length - 1) {
            setStateValue({ currentStep: state.currentStep + 1 });
        }
    };

    const prevStep = () => {
        if (state.currentStep > 0) {
            setStateValue({ currentStep: state.currentStep - 1 });
        }
    };

    const filteredPatients = state.patientsList.filter((patient) => `${patient.patientName}`.toLowerCase().includes(state.searchQuery.toLowerCase()));

    const renderStepContent = () => {
        switch (state.currentStep) {
            case 0: // Patient Selection
                return (
                    <Card className="shadow-2">
                        <div className="flex align-items-center justify-content-between mb-4">
                            <div className="flex align-items-center">
                                <i className="pi pi-user text-primary text-2xl mr-3" />
                                <div>
                                    <h4 className="m-0 text-primary">Select Patient</h4>
                                    <p className="text-600 m-0">Choose patient for lab result entry</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mb-4">
                            <div className="flex">
                                <span className="p-input-icon-left">
                                    <i className="pi pi-search" />
                                    <InputText placeholder="Search by name or record number..." value={state.searchQuery} onChange={(e) => setStateValue({ searchQuery: e.target.value })} className="w-full" />
                                </span>
                            </div>
                        </div>

                        <DataTable value={filteredPatients} selectionMode="single" onSelectionChange={(e) => selectPatient(e.value)} dataKey="patientId" paginator rows={8} emptyMessage="No patients found" className="p-datatable-sm">
                            <Column
                                header="Patient"
                                body={(patient: TPatientVisitRecord) => (
                                    <div className="flex align-items-center gap-3">
                                        <Avatar label={`${patient.patientName.charAt(0)}`} shape="circle" className="bg-primary" />
                                        <div>
                                            <div className="font-bold">{patient.patientName}</div>
                                        </div>
                                    </div>
                                )}
                            />
                            <Column
                                header="Treatment"
                                body={(patient: Patient) => (
                                    <div>
                                        <Tag value={patient.treatmentType} severity="info" />
                                        {patient.cycleDay && <div className="text-sm text-600 mt-1">Day: {patient.cycleDay}</div>}
                                    </div>
                                )}
                            />
                            <Column header="LMP" body={(patient: Patient) => (patient.lastMenstrualPeriod ? <div className="text-sm">{patient.lastMenstrualPeriod.toLocaleDateString()}</div> : <span className="text-500">-</span>)} />
                            <Column header="Action" body={(patient: Patient) => <Button label="Select" icon="pi pi-check" onClick={() => selectPatient(patient)} className="p-button-sm" />} />
                        </DataTable>
                    </Card>
                );

            case 1: // Test Selection
                return (
                    <Card className="shadow-2">
                        <div className="flex align-items-center justify-content-between mb-4">
                            <div className="flex align-items-center">
                                <i className="pi pi-list text-primary text-2xl mr-3" />
                                <div>
                                    <h4 className="m-0 text-primary">Select Test</h4>
                                    <p className="text-600 m-0">Choose lab test for result entry</p>
                                </div>
                            </div>
                            <Button label="Add Custom Test" icon="pi pi-plus" className="p-button-outlined" onClick={() => setStateValue({ showTemplateDialog: true })} />
                        </div>

                        <div className="flex gap-3 mb-4">
                            <div className="flex-1">
                                <span className="p-input-icon-left w-full">
                                    <i className="pi pi-search" />
                                    <InputText placeholder="Search tests..." onChange={(e) => searchTemplates(e.target.value)} className="w-full" />
                                </span>
                            </div>
                            <Dropdown
                                value=""
                                onChange={(e) => {
                                    const filtered = e.value === 'All' ? state.testTemplates : state.testTemplates.filter((t) => t.category === e.value);
                                    setStateValue({ filteredTemplates: filtered });
                                }}
                                options={[
                                    { label: 'All Categories', value: 'All' },
                                    { label: 'Hormonal', value: 'Hormonal' },
                                    { label: 'Biochemistry', value: 'Biochemistry' },
                                    { label: 'Hematology', value: 'Hematology' },
                                    { label: 'Serology', value: 'Serology' }
                                ]}
                                placeholder="Filter by category"
                            />
                        </div>

                        <DataTable value={state.filteredTemplates} selectionMode="single" onSelectionChange={(e) => selectTest(e.value)} dataKey="testId" paginator rows={10} className="p-datatable-sm">
                            <Column
                                field="testName"
                                header="Test Name"
                                body={(test: TestTemplate) => (
                                    <div>
                                        <div className="font-semibold">{test.testName}</div>
                                        <div className="text-sm text-600">{test.testId}</div>
                                    </div>
                                )}
                            />
                            <Column field="category" header="Category" body={(test: TestTemplate) => <Tag value={test.category} severity="info" />} />
                            <Column
                                header="Reference Range"
                                body={(test: TestTemplate) => (
                                    <div>
                                        <div className="text-sm">
                                            {getReferenceRangeForPatient(test, state.selectedPatient)} {test.units}
                                        </div>
                                        <small className="text-500">{test.specimenType}</small>
                                    </div>
                                )}
                            />
                            <Column
                                header="Details"
                                body={(test: TestTemplate) => (
                                    <div className="text-sm">
                                        <div>TAT: {test.turnaroundTime}h</div>
                                        <div>Cost: ${test.cost}</div>
                                        {test.fastingRequired && <Tag value="Fasting" severity="warning" className="mt-1" />}
                                    </div>
                                )}
                            />
                            <Column header="Action" body={(test: TestTemplate) => <Button label="Select" icon="pi pi-check" onClick={() => selectTest(test)} className="p-button-sm" />} />
                        </DataTable>
                    </Card>
                );

            case 2: // Result Entry
                return (
                    <Card className="shadow-2">
                        <div className="flex align-items-center mb-4">
                            <i className="pi pi-pencil text-primary text-2xl mr-3" />
                            <div>
                                <h4 className="m-0 text-primary">Enter Test Result</h4>
                                <p className="text-600 m-0">Input laboratory result data</p>
                            </div>
                        </div>

                        <div className="grid">
                            <div className="col-12 md:col-8">
                                <Panel header="Test Information" className="mb-4">
                                    <div className="grid">
                                        <div className="col-12 md:col-6">
                                            <div className="mb-3">
                                                <strong>Test:</strong> {state.selectedTest?.testName}
                                            </div>
                                            <div className="mb-3">
                                                <strong>Units:</strong> {state.selectedTest?.units}
                                            </div>
                                            <div className="mb-3">
                                                <strong>Reference Range:</strong> {state.labResult.referenceRange}
                                            </div>
                                            <div className="mb-3">
                                                <strong>Specimen:</strong> {state.selectedTest?.specimenType}
                                            </div>
                                        </div>
                                        <div className="col-12 md:col-6">
                                            {state.selectedTest?.fastingRequired && (
                                                <div className="mb-2">
                                                    <Tag value="Fasting Required" severity="warning" />
                                                </div>
                                            )}
                                            <div className="mb-2">
                                                <strong>Methodology:</strong> {state.selectedTest?.methodology}
                                            </div>
                                            <div className="mb-2">
                                                <strong>TAT:</strong> {state.selectedTest?.turnaroundTime} hours
                                            </div>
                                            <div className="mb-2">
                                                <strong>Cost:</strong> ${state.selectedTest?.cost}
                                            </div>
                                        </div>
                                    </div>
                                </Panel>

                                <Panel header="Result Entry" className="mb-4">
                                    <div className="formgrid grid">
                                        <div className="field col-12 md:col-4">
                                            <label className="font-semibold mb-2 block">Result *</label>
                                            <div className="p-inputgroup">
                                                <InputText
                                                    value={state.labResult.result}
                                                    onChange={(e) =>
                                                        setStateValue({
                                                            labResult: { ...state.labResult, result: e.target.value }
                                                        })
                                                    }
                                                    placeholder="Enter result"
                                                />
                                                <span className="p-inputgroup-addon">{state.selectedTest?.units}</span>
                                            </div>
                                        </div>

                                        <div className="field col-12 md:col-4">
                                            <label className="font-semibold mb-2 block">Date Collected</label>
                                            <Calendar
                                                value={state.labResult.dateCollected}
                                                onChange={(e) =>
                                                    setStateValue({
                                                        labResult: { ...state.labResult, dateCollected: e.value as Date }
                                                    })
                                                }
                                                showIcon
                                                dateFormat="dd M yy"
                                                maxDate={new Date()}
                                            />
                                        </div>

                                        <div className="field col-12 md:col-4">
                                            <label className="font-semibold mb-2 block">Date Received</label>
                                            <Calendar
                                                value={state.labResult.dateReceived}
                                                onChange={(e) =>
                                                    setStateValue({
                                                        labResult: { ...state.labResult, dateReceived: e.value as Date }
                                                    })
                                                }
                                                showIcon
                                                dateFormat="dd M yy"
                                                maxDate={new Date()}
                                            />
                                        </div>

                                        <div className="field col-12 md:col-6">
                                            <label className="font-semibold mb-2 block">Lab Technician *</label>
                                            <InputText
                                                value={state.labResult.labTechnician}
                                                onChange={(e) =>
                                                    setStateValue({
                                                        labResult: { ...state.labResult, labTechnician: e.target.value }
                                                    })
                                                }
                                                placeholder="Enter technician name"
                                            />
                                        </div>

                                        <div className="field col-12 md:col-6">
                                            <label className="font-semibold mb-2 block">Lab Source</label>
                                            <Dropdown
                                                value={state.labResult.labSource}
                                                onChange={(e) =>
                                                    setStateValue({
                                                        labResult: { ...state.labResult, labSource: e.value }
                                                    })
                                                }
                                                options={[
                                                    { label: 'Internal Lab', value: 'Internal' },
                                                    { label: 'External Lab', value: 'External' }
                                                ]}
                                            />
                                        </div>

                                        <div className="field col-12">
                                            <label className="font-semibold mb-2 block">Comments</label>
                                            <InputTextarea
                                                value={state.labResult.comments}
                                                onChange={(e) =>
                                                    setStateValue({
                                                        labResult: { ...state.labResult, comments: e.target.value }
                                                    })
                                                }
                                                rows={2}
                                                placeholder="Additional comments or observations..."
                                            />
                                        </div>
                                    </div>
                                </Panel>
                            </div>

                            <div className="col-12 md:col-4">
                                <Panel header="Status & Validation">
                                    {state.labResult.result && (
                                        <div className="mb-3">
                                            <strong>Calculated Status:</strong>
                                            <Tag
                                                value={determineResultStatus(state.labResult.result, state.labResult.referenceRange)}
                                                severity={
                                                    determineResultStatus(state.labResult.result, state.labResult.referenceRange) === 'Normal'
                                                        ? 'success'
                                                        : determineResultStatus(state.labResult.result, state.labResult.referenceRange) === 'Critical'
                                                        ? 'danger'
                                                        : determineResultStatus(state.labResult.result, state.labResult.referenceRange) === 'Abnormal'
                                                        ? 'danger'
                                                        : 'warning'
                                                }
                                                className="ml-2"
                                            />
                                        </div>
                                    )}

                                    {state.selectedTest?.referenceRanges && state.selectedTest.referenceRanges.length > 1 && (
                                        <div className="mb-3">
                                            <strong>Reference Ranges:</strong>
                                            <div className="mt-2">
                                                {state.selectedTest.referenceRanges.map((range, index) => (
                                                    <div key={index} className="text-sm mb-1">
                                                        <strong>{range.condition}:</strong> {range.range}
                                                        {range.description && <div className="text-xs text-500">{range.description}</div>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {state.selectedTest?.criticalValues && (
                                        <div className="mb-3">
                                            <strong>Critical Values:</strong>
                                            <div className="text-sm mt-1">
                                                <div>Low: &lt;{state.selectedTest.criticalValues.low}</div>
                                                <div>High: &gt;{state.selectedTest.criticalValues.high}</div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex align-items-center gap-2 mt-4">
                                        <Checkbox
                                            inputId="qcPassed"
                                            checked={state.labResult.qcPassed}
                                            onChange={(e) =>
                                                setStateValue({
                                                    labResult: { ...state.labResult, qcPassed: e.checked || false }
                                                })
                                            }
                                        />
                                        <label htmlFor="qcPassed">QC Passed</label>
                                    </div>
                                </Panel>
                            </div>
                        </div>
                    </Card>
                );

            case 3: // Quality Control
                return (
                    <Card className="shadow-2">
                        <div className="flex align-items-center mb-4">
                            <i className="pi pi-check text-primary text-2xl mr-3" />
                            <div>
                                <h4 className="m-0 text-primary">Quality Control Review</h4>
                                <p className="text-600 m-0">Review and validate test result quality</p>
                            </div>
                        </div>

                        <div className="grid">
                            <div className="col-12 md:col-8">
                                <Panel header="QC Checklist" className="mb-4">
                                    <div className="grid">
                                        {[
                                            'Sample collection procedure followed',
                                            'Sample handling and storage appropriate',
                                            'Equipment calibration up to date',
                                            'Control samples within acceptable range',
                                            'Result within expected clinical range',
                                            'No analytical interference detected',
                                            'Documentation complete and accurate'
                                        ].map((item, index) => (
                                            <div key={index} className="col-12 md:col-6">
                                                <div className="flex align-items-center gap-2">
                                                    <Checkbox inputId={`qc-${index}`} checked={false} />
                                                    <label htmlFor={`qc-${index}`} className="text-sm">
                                                        {item}
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Panel>

                                <Panel header="QC Comments">
                                    <InputTextarea value={state.qcComments} onChange={(e) => setStateValue({ qcComments: e.target.value })} rows={4} placeholder="Quality control observations, issues, or notes..." className="w-full" />
                                </Panel>
                            </div>

                            <div className="col-12 md:col-4">
                                <Panel header="QC Status">
                                    <div className="text-center">
                                        <div className="mb-3">
                                            <div className="flex justify-content-center mb-3">
                                                <div className="flex flex-column align-items-center">
                                                    <div className="flex align-items-center gap-2 mb-2">
                                                        <RadioButton inputId="qcPass" name="qcStatus" value="pass" onChange={() => setStateValue({ qcPassed: true })} checked={state.qcPassed} />
                                                        <label htmlFor="qcPass">Pass</label>
                                                    </div>
                                                    <div className="flex align-items-center gap-2">
                                                        <RadioButton inputId="qcFail" name="qcStatus" value="fail" onChange={() => setStateValue({ qcPassed: false })} checked={!state.qcPassed} />
                                                        <label htmlFor="qcFail">Fail - Repeat</label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <Tag value={state.qcPassed ? 'QC PASSED' : 'QC FAILED'} severity={state.qcPassed ? 'success' : 'danger'} className="text-lg p-3" />
                                    </div>
                                </Panel>
                            </div>
                        </div>
                    </Card>
                );

            case 4: // Verification
                return (
                    <Card className="shadow-2">
                        <div className="flex align-items-center mb-4">
                            <i className="pi pi-verified text-primary text-2xl mr-3" />
                            <div>
                                <h4 className="m-0 text-primary">Result Verification</h4>
                                <p className="text-600 m-0">Final review and approval of results</p>
                            </div>
                        </div>

                        <div className="grid">
                            <div className="col-12 md:col-8">
                                <Panel header="Result Summary" className="mb-4">
                                    <div className="grid">
                                        <div className="col-12 md:col-6">
                                            <div className="mb-2">
                                                <strong>Patient:</strong> {state.selectedPatient?.firstName} {state.selectedPatient?.lastName}
                                            </div>
                                            <div className="mb-2">
                                                <strong>Test:</strong> {state.selectedTest?.testName}
                                            </div>
                                            <div className="mb-2">
                                                <strong>Result:</strong> {state.labResult.result} {state.selectedTest?.units}
                                            </div>
                                            <div className="mb-2">
                                                <strong>Reference Range:</strong> {state.labResult.referenceRange}
                                            </div>
                                        </div>
                                        <div className="col-12 md:col-6">
                                            <div className="mb-2">
                                                <strong>Status:</strong>
                                                <Tag
                                                    value={determineResultStatus(state.labResult.result, state.labResult.referenceRange)}
                                                    severity={
                                                        determineResultStatus(state.labResult.result, state.labResult.referenceRange) === 'Normal'
                                                            ? 'success'
                                                            : determineResultStatus(state.labResult.result, state.labResult.referenceRange) === 'Critical'
                                                            ? 'danger'
                                                            : 'warning'
                                                    }
                                                    className="ml-2"
                                                />
                                            </div>
                                            <div className="mb-2">
                                                <strong>Lab Technician:</strong> {state.labResult.labTechnician}
                                            </div>
                                            <div className="mb-2">
                                                <strong>QC Status:</strong>
                                                <Tag value={state.qcPassed ? 'Passed' : 'Failed'} severity={state.qcPassed ? 'success' : 'danger'} className="ml-2" />
                                            </div>
                                        </div>
                                    </div>
                                </Panel>

                                <Panel header="Verification">
                                    <div className="formgrid grid">
                                        <div className="field col-12 md:col-6">
                                            <label className="font-semibold mb-2 block">Verified By *</label>
                                            <InputText value={state.verifiedBy} onChange={(e) => setStateValue({ verifiedBy: e.target.value })} placeholder="Verifying pathologist/supervisor" />
                                        </div>

                                        <div className="field col-12">
                                            <label className="font-semibold mb-2 block">Verification Comments</label>
                                            <InputTextarea value={state.verificationComments} onChange={(e) => setStateValue({ verificationComments: e.target.value })} rows={3} placeholder="Any additional clinical comments or recommendations..." />
                                        </div>

                                        <div className="field col-12">
                                            <div className="flex align-items-center gap-2">
                                                <Checkbox inputId="clinicalReview" checked={state.verificationRequired} onChange={(e) => setStateValue({ verificationRequired: e.checked || false })} />
                                                <label htmlFor="clinicalReview">Require clinical review before release</label>
                                            </div>
                                        </div>
                                    </div>
                                </Panel>
                            </div>

                            <div className="col-12 md:col-4">
                                <Panel header="Actions">
                                    <div className="flex flex-column gap-2">
                                        <Button label="Verify & Release" icon="pi pi-check-circle" className="p-button-success" disabled={!state.verifiedBy || !state.qcPassed} />
                                        <Button label="Hold for Review" icon="pi pi-pause" className="p-button-warning" />
                                        <Button label="Reject Result" icon="pi pi-times" className="p-button-danger p-button-outlined" />
                                        <Divider />
                                        <Button label="Print Report" icon="pi pi-print" className="p-button-outlined" />
                                        <Button label="Send to EMR" icon="pi pi-send" className="p-button-outlined" />
                                    </div>
                                </Panel>

                                {state.labResult.criticalValue && (
                                    <Panel header="Critical Value Alert" className="mt-3">
                                        <div className="text-center">
                                            <i className="pi pi-exclamation-triangle text-red-500 text-2xl mb-2" />
                                            <div className="text-red-600 font-bold mb-2">CRITICAL VALUE</div>
                                            <div className="text-sm text-600">Immediate physician notification required</div>
                                            <Button label="Notify Physician" icon="pi pi-phone" className="p-button-danger mt-3" size="small" />
                                        </div>
                                    </Panel>
                                )}
                            </div>
                        </div>
                    </Card>
                );

            default:
                return null;
        }
    };

    return (
        <div className="grid p-fluid">
            <Toast ref={toast} />

            {/* Progress Header */}
            <div className="col-12">
                <Card className="shadow-3">
                    <div className="flex align-items-center justify-content-between mb-4">
                        <div>
                            <h3 className="m-0 text-primary">Lab Results Entry</h3>
                            <p className="text-600 m-0">Enter and validate laboratory test results</p>
                        </div>
                        <Badge value={`${state.currentStep + 1}/${steps.length}`} size="large" />
                    </div>

                    <div className="grid">
                        {steps.map((step, index) => (
                            <div key={index} className="col">
                                <div
                                    className={`text-center p-3 border-round-md transition-colors transition-duration-300 ${
                                        index === state.currentStep ? 'bg-primary text-white shadow-3' : index < state.currentStep ? 'bg-green-100 text-green-800 border-1 border-green-300' : 'bg-gray-50 text-600 border-1 border-gray-300'
                                    }`}
                                >
                                    <div className="flex flex-column align-items-center gap-2">
                                        <i className={`${step.icon} text-xl`} />
                                        <div>
                                            <div className="font-bold text-sm">{step.label}</div>
                                            <small className="opacity-80">{step.description}</small>
                                        </div>
                                        {index < state.currentStep && <i className="pi pi-check-circle" />}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <ProgressBar value={((state.currentStep + 1) / steps.length) * 100} className="mt-4" style={{ height: '6px' }} />
                </Card>
            </div>

            {/* Patient Summary */}
            {state.selectedPatient && state.currentStep > 0 && (
                <div className="col-12">
                    <Card className="mb-3">
                        <div className="flex align-items-center gap-3">
                            <Avatar label={`${state.selectedPatient.firstName.charAt(0)}${state.selectedPatient.lastName.charAt(0)}`} shape="circle" size="large" className="bg-primary" />
                            <div className="flex-1">
                                <h6 className="m-0">
                                    {state.selectedPatient.firstName} {state.selectedPatient.lastName}
                                </h6>
                                <div className="flex gap-4 text-sm text-600">
                                    <span>Age: {state.selectedPatient.age}</span>
                                    <span>{state.selectedPatient.recordNumber}</span>
                                    <span>Treatment: {state.selectedPatient.treatmentType}</span>
                                    {state.selectedPatient.cycleDay && <span>Cycle Day: {state.selectedPatient.cycleDay}</span>}
                                </div>
                            </div>
                            {state.selectedTest && <Tag value={state.selectedTest.testName} severity="info" />}
                        </div>
                    </Card>
                </div>
            )}

            {/* Main Content */}
            <div className="col-12">
                {renderStepContent()}

                <Divider />

                {/* Navigation */}
                <div className="flex justify-content-between align-items-center">
                    <Button label="Previous" icon="pi pi-chevron-left" onClick={prevStep} disabled={state.currentStep === 0} className="p-button-outlined w-fit" size="large" />

                    <div className="flex gap-3">
                        <Button label="Save Draft" icon="pi pi-save" className="p-button-outlined w-fit" size="large" />

                        {state.currentStep === steps.length - 1 ? (
                            <Button label="Submit Results" icon="pi pi-check" onClick={saveResult} className="p-button-success w-fit" size="large" />
                        ) : (
                            <Button
                                label="Next"
                                icon="pi pi-chevron-right"
                                iconPos="right"
                                onClick={nextStep}
                                size="large"
                                className="w-fit"
                                disabled={(state.currentStep === 0 && !state.selectedPatient) || (state.currentStep === 1 && !state.selectedTest)}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Custom Test Template Dialog */}
            <Dialog header="Add Custom Test" visible={state.showTemplateDialog} onHide={() => setStateValue({ showTemplateDialog: false })} style={{ width: '60vw' }} modal>
                <div className="formgrid grid">
                    <div className="field col-6">
                        <label>Test Name</label>
                        <InputText placeholder="Enter test name" className="w-full" />
                    </div>
                    <div className="field col-6">
                        <label>Test ID</label>
                        <InputText placeholder="Enter test ID" className="w-full" />
                    </div>
                    <div className="field col-6">
                        <label>Category</label>
                        <Dropdown
                            options={[
                                { label: 'Hormonal', value: 'Hormonal' },
                                { label: 'Biochemistry', value: 'Biochemistry' },
                                { label: 'Hematology', value: 'Hematology' },
                                { label: 'Other', value: 'Other' }
                            ]}
                            placeholder="Select category"
                            className="w-full"
                        />
                    </div>
                    <div className="field col-6">
                        <label>Units</label>
                        <InputText placeholder="e.g., mg/dL, mIU/mL" className="w-full" />
                    </div>
                </div>
                <div className="flex justify-content-end gap-2">
                    <Button label="Cancel" className="p-button-outlined" onClick={() => setStateValue({ showTemplateDialog: false })} />
                    <Button label="Add Test" />
                </div>
            </Dialog>

            <ConfirmDialog />
        </div>
    );
};

export default LabResultsEntry;
