'use client';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import { Panel } from 'primereact/panel';
import { TabPanel, TabView } from 'primereact/tabview';
import { Checkbox } from 'primereact/checkbox';
import { Badge } from 'primereact/badge';
import { Avatar } from 'primereact/avatar';
import { ProgressBar } from 'primereact/progressbar';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Toast } from 'primereact/toast';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Chart } from 'primereact/chart';
import { useRef, useState, useEffect } from 'react';
import LocalDatabase from '@/libs/blue_prints/LocalDatabase';

// Types for Lab Results Review
type Patient = {
    patientId: number;
    firstName: string;
    lastName: string;
    age: number;
    recordNumber: string;
    dateOfBirth: Date;
    address?: string;
    partnerName?: string;
    treatmentType: 'Natural Conception' | 'IUI' | 'IVF' | 'ICSI' | 'Other';
    cycleDay?: number;
    lastMenstrualPeriod?: Date;
};

type LabTest = {
    testId: string;
    testName: string;
    category: 'Hormonal' | 'Hematology' | 'Biochemistry' | 'Serology' | 'Immunology' | 'Genetic' | 'Imaging' | 'Semen Analysis' | 'Other';
    result: string;
    units: string;
    referenceRange: string;
    status: 'Normal' | 'Abnormal' | 'Borderline' | 'Critical' | 'Pending';
    dateCollected: Date;
    dateReported: Date;
    labSource: 'Internal' | 'External';
    methodology?: string;
    comments?: string;
    criticalValue?: boolean;
    flagged?: boolean;
    previousResults?: { value: string; date: Date }[];
};

type ImagingStudy = {
    studyId: string;
    studyType: 'Pelvic Ultrasound' | 'TVS' | 'HSG' | 'Hysteroscopy' | 'Laparoscopy' | 'MRI Pelvis' | 'Other';
    datePerformed: Date;
    findings: string;
    impression: string;
    images?: string[];
    reportFile?: string;
    radiologist?: string;
    keyMeasurements?: { [key: string]: string };
};

type SemenAnalysisResult = {
    analysisId: string;
    dateCollected: Date;
    dateAnalyzed: Date;
    volume: number;
    concentration: number;
    totalCount: number;
    motility: number;
    progressiveMotility: number;
    normalMorphology: number;
    vitality: number;
    pH: number;
    viscosity: string;
    liquefactionTime: number;
    whiteBloodCells: number;
    aggregation: boolean;
    comments: string;
    grade: 'Normal' | 'Mild Oligoasthenoteratozoospermia' | 'Moderate OAT' | 'Severe OAT' | 'Azoospermia';
};

type ResultInterpretation = {
    testId: string;
    interpretation: 'Normal' | 'Abnormal' | 'Inconclusive';
    significance: 'High' | 'Moderate' | 'Low';
    clinicalRelevance: string;
    recommendations: string[];
    followUpRequired: boolean;
    followUpTimeframe?: string;
    discussedWithPatient: boolean;
    patientUnderstanding: 'Good' | 'Fair' | 'Poor';
};

type TreatmentRecommendations = {
    immediateActions: string[];
    medicationChanges: string[];
    lifestyleModifications: string[];
    additionalTests: string[];
    specialistReferrals: string[];
    treatmentPlanAdjustments: string;
    prognosisUpdate: string;
    timelineAdjustments: string;
};

type LabReviewState = {
    currentStep: number;
    selectedPatient: Patient | null;
    searchQuery: string;
    patients: Patient[];
    labTests: LabTest[];
    imagingStudies: ImagingStudy[];
    semenAnalysis: SemenAnalysisResult | null;
    interpretations: { [testId: string]: ResultInterpretation };
    treatmentRecommendations: TreatmentRecommendations;
    reviewNotes: string;
    nextAppointmentDate: Date | null;
    nextAppointmentType: string;
    showImageViewer: boolean;
    selectedImage: string;
    showTrendChart: boolean;
    selectedTestForTrend: string;
    patientEducationMaterial: string[];
    discussionPoints: string[];
    doctorNotes: string;
    reportGenerated: boolean;
};

const FERTILITY_TESTS = {
    hormonal: [
        { name: 'FSH', fullName: 'Follicle Stimulating Hormone', units: 'mIU/mL', normalRange: '3.5-12.5' },
        { name: 'LH', fullName: 'Luteinizing Hormone', units: 'mIU/mL', normalRange: '2.4-12.6' },
        { name: 'Estradiol (E2)', fullName: 'Estradiol', units: 'pg/mL', normalRange: '15-350' },
        { name: 'Progesterone', fullName: 'Progesterone', units: 'ng/mL', normalRange: '0.2-25' },
        { name: 'AMH', fullName: 'Anti-Müllerian Hormone', units: 'ng/mL', normalRange: '1.0-4.0' },
        { name: 'Prolactin', fullName: 'Prolactin', units: 'ng/mL', normalRange: '4.8-23.3' },
        { name: 'TSH', fullName: 'Thyroid Stimulating Hormone', units: 'mIU/L', normalRange: '0.27-4.2' },
        { name: 'Free T4', fullName: 'Free Thyroxine', units: 'ng/dL', normalRange: '0.93-1.7' },
        { name: 'Free T3', fullName: 'Free Triiodothyronine', units: 'pg/mL', normalRange: '2.0-4.4' },
        { name: 'Testosterone', fullName: 'Testosterone', units: 'ng/dL', normalRange: '264-916' },
        { name: 'DHEA-S', fullName: 'Dehydroepiandrosterone Sulfate', units: 'µg/dL', normalRange: '35-430' }
    ],
    biochemistry: [
        { name: 'Glucose', fullName: 'Fasting Glucose', units: 'mg/dL', normalRange: '70-100' },
        { name: 'HbA1c', fullName: 'Glycated Hemoglobin', units: '%', normalRange: '<5.7' },
        { name: 'Insulin', fullName: 'Fasting Insulin', units: 'µIU/mL', normalRange: '2.6-24.9' },
        { name: 'Total Cholesterol', fullName: 'Total Cholesterol', units: 'mg/dL', normalRange: '<200' },
        { name: 'HDL', fullName: 'High-Density Lipoprotein', units: 'mg/dL', normalRange: '>40' },
        { name: 'LDL', fullName: 'Low-Density Lipoprotein', units: 'mg/dL', normalRange: '<100' }
    ]
};

const INITIAL_STATE: LabReviewState = {
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
            treatmentType: 'IVF',
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
    labTests: [],
    imagingStudies: [],
    semenAnalysis: null,
    interpretations: {},
    treatmentRecommendations: {
        immediateActions: [],
        medicationChanges: [],
        lifestyleModifications: [],
        additionalTests: [],
        specialistReferrals: [],
        treatmentPlanAdjustments: '',
        prognosisUpdate: '',
        timelineAdjustments: ''
    },
    reviewNotes: '',
    nextAppointmentDate: null,
    nextAppointmentType: '',
    showImageViewer: false,
    selectedImage: '',
    showTrendChart: false,
    selectedTestForTrend: '',
    patientEducationMaterial: [],
    discussionPoints: [],
    doctorNotes: '',
    reportGenerated: false
};

const localService = new LocalDatabase();
const LabResultsReview = () => {
    const [state, setState] = useState<LabReviewState>(INITIAL_STATE);
    const toast = useRef<Toast>(null);

    const steps = [
        { label: 'PatientExtra', icon: 'pi pi-user', description: 'Select patient' },
        { label: 'Lab Results', icon: 'pi pi-file', description: 'Review tests' },
        { label: 'Interpretation', icon: 'pi pi-search', description: 'Clinical analysis' },
        { label: 'Recommendations', icon: 'pi pi-lightbulb', description: 'Treatment plan' },
        { label: 'PatientExtra Discussion', icon: 'pi pi-comments', description: 'Communication' }
    ];

    useEffect(() => {
        document.title = 'Lab Results Review';
        if (state.selectedPatient) {
            loadLabResults(state.selectedPatient.patientId);
        }
    }, [state.selectedPatient]);

    useEffect(() => {
        localService.getSelectedPatient().then((patient) => {
            if (patient) selectPatient(patient as unknown as Patient);
        });
    }, []);
    const setStateValue = (updates: Partial<LabReviewState>) => {
        setState((prev) => ({ ...prev, ...updates }));
    };

    const loadLabResults = (patientId: number) => {
        // Simulate loading lab results for fertility patient
        const mockLabTests: LabTest[] = [
            {
                testId: 'FSH001',
                testName: 'FSH',
                category: 'Hormonal',
                result: '8.2',
                units: 'mIU/mL',
                referenceRange: '3.5-12.5',
                status: 'Normal',
                dateCollected: new Date('2024-03-01'),
                dateReported: new Date('2024-03-02'),
                labSource: 'Internal',
                previousResults: [
                    { value: '7.8', date: new Date('2024-01-15') },
                    { value: '8.5', date: new Date('2023-12-10') }
                ]
            },
            {
                testId: 'LH001',
                testName: 'LH',
                category: 'Hormonal',
                result: '15.8',
                units: 'mIU/mL',
                referenceRange: '2.4-12.6',
                status: 'Abnormal',
                dateCollected: new Date('2024-03-01'),
                dateReported: new Date('2024-03-02'),
                labSource: 'Internal',
                flagged: true,
                previousResults: [
                    { value: '14.2', date: new Date('2024-01-15') },
                    { value: '16.1', date: new Date('2023-12-10') }
                ]
            },
            {
                testId: 'AMH001',
                testName: 'AMH',
                category: 'Hormonal',
                result: '1.8',
                units: 'ng/mL',
                referenceRange: '1.0-4.0',
                status: 'Borderline',
                dateCollected: new Date('2024-03-01'),
                dateReported: new Date('2024-03-02'),
                labSource: 'External',
                comments: 'Borderline low ovarian reserve'
            },
            {
                testId: 'E2001',
                testName: 'Estradiol (E2)',
                category: 'Hormonal',
                result: '45',
                units: 'pg/mL',
                referenceRange: '15-350',
                status: 'Normal',
                dateCollected: new Date('2024-03-01'),
                dateReported: new Date('2024-03-02'),
                labSource: 'Internal'
            },
            {
                testId: 'TSH001',
                testName: 'TSH',
                category: 'Hormonal',
                result: '2.8',
                units: 'mIU/L',
                referenceRange: '0.27-4.2',
                status: 'Normal',
                dateCollected: new Date('2024-03-01'),
                dateReported: new Date('2024-03-02'),
                labSource: 'Internal'
            }
        ];

        const mockImagingStudies: ImagingStudy[] = [
            {
                studyId: 'US001',
                studyType: 'Pelvic Ultrasound',
                datePerformed: new Date('2024-03-05'),
                findings: 'Bilateral ovaries visualized. Right ovary measures 3.2 x 2.8 x 2.1 cm with 8 antral follicles. Left ovary measures 3.0 x 2.5 x 2.0 cm with 6 antral follicles. Endometrial thickness 8mm.',
                impression: 'Normal ovarian morphology with adequate antral follicle count. Normal endometrial thickness for cycle day.',
                radiologist: 'Dr. Sarah Williams',
                keyMeasurements: {
                    'Right Ovary Volume': '9.8 cm³',
                    'Left Ovary Volume': '7.5 cm³',
                    'Total AFC': '14',
                    'Endometrial Thickness': '8 mm'
                }
            }
        ];

        const mockSemenAnalysis: SemenAnalysisResult = {
            analysisId: 'SA001',
            dateCollected: new Date('2024-03-03'),
            dateAnalyzed: new Date('2024-03-03'),
            volume: 3.2,
            concentration: 18.5,
            totalCount: 59.2,
            motility: 45,
            progressiveMotility: 32,
            normalMorphology: 8,
            vitality: 62,
            pH: 7.8,
            viscosity: 'Normal',
            liquefactionTime: 25,
            whiteBloodCells: 0.8,
            aggregation: false,
            comments: 'Mild oligoasthenoteratozoospermia',
            grade: 'Mild Oligoasthenoteratozoospermia'
        };

        setStateValue({
            labTests: mockLabTests,
            imagingStudies: mockImagingStudies,
            semenAnalysis: mockSemenAnalysis
        });
    };

    const selectPatient = (patient: Patient) => {
        setStateValue({
            selectedPatient: patient,
            currentStep: 1
        });
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

    const getStatusSeverity = (status: string) => {
        switch (status) {
            case 'Normal':
                return 'success';
            case 'Abnormal':
                return 'danger';
            case 'Borderline':
                return 'warning';
            case 'Critical':
                return 'danger';
            case 'Pending':
                return 'info';
            default:
                return 'info';
        }
    };

    const getCategorySeverity = (category: string) => {
        switch (category) {
            case 'Hormonal':
                return 'info';
            case 'Hematology':
                return 'success';
            case 'Biochemistry':
                return 'warning';
            case 'Serology':
                return 'warning';
            case 'Imaging':
                return 'danger';
            case 'Semen Analysis':
                return 'info';
            default:
                return 'info';
        }
    };

    const updateInterpretation = (testId: string, updates: Partial<ResultInterpretation>) => {
        setStateValue({
            interpretations: {
                ...state.interpretations,
                [testId]: { ...state.interpretations[testId], ...updates }
            }
        });
    };

    const generateTrendChart = (testName: string) => {
        const test = state.labTests.find((t) => t.testName === testName);
        if (!test || !test.previousResults) return null;

        const data = {
            labels: [...test.previousResults.map((r) => r.date.toLocaleDateString()), test.dateReported.toLocaleDateString()],
            datasets: [
                {
                    label: testName,
                    data: [...test.previousResults.map((r) => parseFloat(r.value)), parseFloat(test.result)],
                    fill: false,
                    borderColor: '#42A5F5',
                    backgroundColor: '#42A5F5',
                    tension: 0.4
                }
            ]
        };

        return data;
    };

    const saveReview = () => {
        if (!state.selectedPatient) {
            toast.current?.show({
                severity: 'error',
                summary: 'Missing Information',
                detail: 'Please select a patient',
                life: 3000
            });
            return;
        }

        toast.current?.show({
            severity: 'success',
            summary: 'Review Completed',
            detail: `Lab results review completed for ${state.selectedPatient.firstName} ${state.selectedPatient.lastName}`,
            life: 5000
        });

        setStateValue({ reportGenerated: true });
    };

    const filteredPatients = state.patients.filter(
        (patient) =>
            `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
            patient.recordNumber.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
            patient.address?.toLowerCase().includes(state.searchQuery.toLowerCase())
    );

    const renderStepContent = () => {
        switch (state.currentStep) {
            case 0: // PatientExtra Selection
                return (
                    <Card className="shadow-2">
                        <div className="flex align-items-center mb-4">
                            <i className="pi pi-user text-primary text-2xl mr-3" />
                            <div>
                                <h4 className="m-0 text-primary">Select PatientExtra for Lab Review</h4>
                                <p className="text-600 m-0">Choose patient with pending lab results</p>
                            </div>
                        </div>

                        <div className="flex gap-3 mb-4">
                            <div className="flex-1">
                                <span className="p-input-icon-left w-full">
                                    <i className="pi pi-search" />
                                    <InputText placeholder="Search by name or record number..." value={state.searchQuery} onChange={(e) => setStateValue({ searchQuery: e.target.value })} className="w-full" />
                                </span>
                            </div>
                        </div>

                        <DataTable value={filteredPatients} selectionMode="single" onSelectionChange={(e) => selectPatient(e.value)} dataKey="patientId" paginator rows={8} emptyMessage="No patients found" className="p-datatable-sm">
                            <Column
                                header="PatientExtra"
                                body={(patient: Patient) => (
                                    <div className="flex align-items-center gap-3">
                                        <Avatar label={`${patient.firstName.charAt(0)}${patient.lastName.charAt(0)}`} shape="circle" className="bg-primary" />
                                        <div>
                                            <div className="font-bold">
                                                {patient.firstName} {patient.lastName}
                                            </div>
                                            <div className="text-sm text-600">
                                                Age: {patient.age} • {patient.recordNumber}
                                            </div>
                                            {patient.partnerName && <div className="text-sm text-500">Partner: {patient.partnerName}</div>}
                                        </div>
                                    </div>
                                )}
                            />
                            <Column
                                header="Treatment"
                                body={(patient: Patient) => (
                                    <div>
                                        <Tag value={patient.treatmentType} severity="info" />
                                        {patient.cycleDay && <div className="text-sm text-600 mt-1">Cycle Day: {patient.cycleDay}</div>}
                                    </div>
                                )}
                            />
                            <Column header="LMP" body={(patient: Patient) => (patient.lastMenstrualPeriod ? <div className="text-sm">{patient.lastMenstrualPeriod.toLocaleDateString()}</div> : <span className="text-500">-</span>)} />
                            <Column header="Action" body={(patient: Patient) => <Button label="Review Results" icon="pi pi-eye" onClick={() => selectPatient(patient)} className="p-button-sm" />} />
                        </DataTable>
                    </Card>
                );

            case 1: // Lab Results Review
                return (
                    <div className="grid">
                        <div className="col-12">
                            <Card className="shadow-2">
                                <div className="flex align-items-center justify-content-between mb-4">
                                    <div className="flex align-items-center">
                                        <i className="pi pi-file text-primary text-2xl mr-3" />
                                        <div>
                                            <h4 className="m-0 text-primary">Laboratory Results Review</h4>
                                            <p className="text-600 m-0">Comprehensive fertility assessment results</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button label="Print Report" icon="pi pi-print" className="p-button-outlined" />
                                        <Button label="Export PDF" icon="pi pi-download" className="p-button-outlined" />
                                    </div>
                                </div>

                                <TabView>
                                    <TabPanel header="Hormonal Profile" leftIcon="pi pi-chart-line">
                                        <DataTable value={state.labTests.filter((test) => test.category === 'Hormonal')} className="p-datatable-sm">
                                            <Column
                                                field="testName"
                                                header="Test"
                                                body={(test: LabTest) => (
                                                    <div className="flex align-items-center gap-2">
                                                        <span className="font-semibold">{test.testName}</span>
                                                        {test.flagged && <i className="pi pi-flag text-red-500" />}
                                                        {test.previousResults && test.previousResults.length > 0 && (
                                                            <Button
                                                                icon="pi pi-chart-line"
                                                                className="p-button-text p-button-sm"
                                                                onClick={() =>
                                                                    setStateValue({
                                                                        showTrendChart: true,
                                                                        selectedTestForTrend: test.testName
                                                                    })
                                                                }
                                                                tooltip="View trend"
                                                            />
                                                        )}
                                                    </div>
                                                )}
                                            />
                                            <Column
                                                header="Result"
                                                body={(test: LabTest) => (
                                                    <div>
                                                        <span className="font-bold text-lg">{test.result}</span>
                                                        <span className="text-sm text-600 ml-1">{test.units}</span>
                                                    </div>
                                                )}
                                            />
                                            <Column field="referenceRange" header="Reference Range" />
                                            <Column field="status" header="Status" body={(test: LabTest) => <Tag value={test.status} severity={getStatusSeverity(test.status)} />} />
                                            <Column field="dateReported" header="Date" body={(test: LabTest) => test.dateReported.toLocaleDateString()} />
                                            <Column header="Source" body={(test: LabTest) => <Tag value={test.labSource} severity={test.labSource === 'Internal' ? 'success' : 'info'} />} />
                                            <Column header="Comments" body={(test: LabTest) => (test.comments ? <small className="text-600">{test.comments}</small> : <span className="text-400">-</span>)} />
                                        </DataTable>
                                    </TabPanel>

                                    <TabPanel header="Imaging Studies" leftIcon="pi pi-image">
                                        {state.imagingStudies.map((study, index) => (
                                            <Card key={index} className="mb-3">
                                                <div className="flex justify-content-between align-items-start mb-3">
                                                    <div>
                                                        <h6 className="text-primary m-0">{study.studyType}</h6>
                                                        <p className="text-600 text-sm m-0">
                                                            {study.datePerformed.toLocaleDateString()} • {study.radiologist}
                                                        </p>
                                                    </div>
                                                    <Button label="View Images" icon="pi pi-eye" className="p-button-outlined p-button-sm" onClick={() => setStateValue({ showImageViewer: true })} />
                                                </div>

                                                <div className="grid">
                                                    <div className="col-12 md:col-8">
                                                        <div className="mb-3">
                                                            <strong className="text-sm">Findings:</strong>
                                                            <p className="text-sm mt-1">{study.findings}</p>
                                                        </div>
                                                        <div className="mb-3">
                                                            <strong className="text-sm">Impression:</strong>
                                                            <p className="text-sm mt-1">{study.impression}</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-12 md:col-4">
                                                        <strong className="text-sm">Key Measurements:</strong>
                                                        <div className="mt-2">
                                                            {study.keyMeasurements &&
                                                                Object.entries(study.keyMeasurements).map(([key, value]) => (
                                                                    <div key={key} className="flex justify-content-between py-1">
                                                                        <span className="text-sm">{key}:</span>
                                                                        <span className="text-sm font-semibold">{value}</span>
                                                                    </div>
                                                                ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </TabPanel>

                                    <TabPanel header="Semen Analysis" leftIcon="pi pi-search">
                                        {state.semenAnalysis && (
                                            <div className="grid">
                                                <div className="col-12">
                                                    <div className="flex justify-content-between align-items-start mb-4">
                                                        <div>
                                                            <h6 className="text-primary m-0">Semen Analysis Report</h6>
                                                            <p className="text-600 text-sm m-0">
                                                                Collected: {state.semenAnalysis.dateCollected.toLocaleDateString()}• Analyzed: {state.semenAnalysis.dateAnalyzed.toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <Tag value={state.semenAnalysis.grade} severity={state.semenAnalysis.grade === 'Normal' ? 'success' : state.semenAnalysis.grade === 'Azoospermia' ? 'danger' : 'warning'} />
                                                    </div>
                                                </div>

                                                <div className="col-12 md:col-6">
                                                    <Panel header="Basic Parameters" className="h-full">
                                                        <div className="grid text-sm">
                                                            <div className="col-6">
                                                                <div className="mb-2">
                                                                    <span className="text-600">Volume:</span>
                                                                    <div className="font-semibold">{state.semenAnalysis.volume} mL</div>
                                                                    <small className="text-500">Normal: ≥1.5 mL</small>
                                                                </div>
                                                            </div>
                                                            <div className="col-6">
                                                                <div className="mb-2">
                                                                    <span className="text-600">pH:</span>
                                                                    <div className="font-semibold">{state.semenAnalysis.pH}</div>
                                                                    <small className="text-500">Normal: 7.2-8.0</small>
                                                                </div>
                                                            </div>
                                                            <div className="col-6">
                                                                <div className="mb-2">
                                                                    <span className="text-600">Concentration:</span>
                                                                    <div className="font-semibold">{state.semenAnalysis.concentration} million/mL</div>
                                                                    <small className="text-500">Normal: ≥15 million/mL</small>
                                                                </div>
                                                            </div>
                                                            <div className="col-6">
                                                                <div className="mb-2">
                                                                    <span className="text-600">Total Count:</span>
                                                                    <div className="font-semibold">{state.semenAnalysis.totalCount} million</div>
                                                                    <small className="text-500">Normal: ≥39 million</small>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Panel>
                                                </div>

                                                <div className="col-12 md:col-6">
                                                    <Panel header="Functional Parameters" className="h-full">
                                                        <div className="grid text-sm">
                                                            <div className="col-6">
                                                                <div className="mb-2">
                                                                    <span className="text-600">Total Motility:</span>
                                                                    <div className="font-semibold">{state.semenAnalysis.motility}%</div>
                                                                    <small className="text-500">Normal: ≥40%</small>
                                                                </div>
                                                            </div>
                                                            <div className="col-6">
                                                                <div className="mb-2">
                                                                    <span className="text-600">Progressive Motility:</span>
                                                                    <div className="font-semibold">{state.semenAnalysis.progressiveMotility}%</div>
                                                                    <small className="text-500">Normal: ≥32%</small>
                                                                </div>
                                                            </div>
                                                            <div className="col-6">
                                                                <div className="mb-2">
                                                                    <span className="text-600">Normal Morphology:</span>
                                                                    <div className="font-semibold">{state.semenAnalysis.normalMorphology}%</div>
                                                                    <small className="text-500">Normal: ≥4%</small>
                                                                </div>
                                                            </div>
                                                            <div className="col-6">
                                                                <div className="mb-2">
                                                                    <span className="text-600">Vitality:</span>
                                                                    <div className="font-semibold">{state.semenAnalysis.vitality}%</div>
                                                                    <small className="text-500">Normal: ≥58%</small>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Panel>
                                                </div>

                                                {state.semenAnalysis.comments && (
                                                    <div className="col-12">
                                                        <Panel header="Additional Comments">
                                                            <p className="text-sm">{state.semenAnalysis.comments}</p>
                                                        </Panel>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </TabPanel>

                                    <TabPanel header="Other Tests" leftIcon="pi pi-list">
                                        <DataTable value={state.labTests.filter((test) => !['Hormonal', 'Imaging', 'Semen Analysis'].includes(test.category))} className="p-datatable-sm" emptyMessage="No other tests available">
                                            <Column field="testName" header="Test" />
                                            <Column field="category" header="Category" body={(test: LabTest) => <Tag value={test.category} severity={getCategorySeverity(test.category)} />} />
                                            <Column
                                                header="Result"
                                                body={(test: LabTest) => (
                                                    <span>
                                                        {test.result} {test.units}
                                                    </span>
                                                )}
                                            />
                                            <Column field="referenceRange" header="Reference Range" />
                                            <Column field="status" header="Status" body={(test: LabTest) => <Tag value={test.status} severity={getStatusSeverity(test.status)} />} />
                                        </DataTable>
                                    </TabPanel>
                                </TabView>
                            </Card>
                        </div>
                    </div>
                );

            case 2: // Clinical Interpretation
                return (
                    <Card className="shadow-2">
                        <div className="flex align-items-center mb-4">
                            <i className="pi pi-search text-primary text-2xl mr-3" />
                            <div>
                                <h4 className="m-0 text-primary">Clinical Interpretation</h4>
                                <p className="text-600 m-0">Analyze and interpret test results in clinical context</p>
                            </div>
                        </div>

                        <Accordion multiple activeIndex={[0]}>
                            {state.labTests.map((test, index) => (
                                <AccordionTab key={test.testId} header={`${test.testName} - ${test.result} ${test.units}`}>
                                    <div className="grid">
                                        <div className="col-12 md:col-4">
                                            <Panel header="Test Information" className="h-full">
                                                <div className="text-sm">
                                                    <div className="mb-2">
                                                        <strong>Result:</strong> {test.result} {test.units}
                                                    </div>
                                                    <div className="mb-2">
                                                        <strong>Reference Range:</strong> {test.referenceRange}
                                                    </div>
                                                    <div className="mb-2">
                                                        <strong>Status:</strong>
                                                        <Tag value={test.status} severity={getStatusSeverity(test.status)} className="ml-2" />
                                                    </div>
                                                    <div className="mb-2">
                                                        <strong>Date:</strong> {test.dateReported.toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </Panel>
                                        </div>

                                        <div className="col-12 md:col-8">
                                            <Panel header="Clinical Interpretation" className="h-full">
                                                <div className="formgrid grid">
                                                    <div className="field col-12 md:col-6">
                                                        <label>Interpretation</label>
                                                        <Dropdown
                                                            value={state.interpretations[test.testId]?.interpretation}
                                                            onChange={(e) => updateInterpretation(test.testId, { interpretation: e.value })}
                                                            options={[
                                                                { label: 'Normal', value: 'Normal' },
                                                                { label: 'Abnormal', value: 'Abnormal' },
                                                                { label: 'Inconclusive', value: 'Inconclusive' }
                                                            ]}
                                                            placeholder="Select interpretation"
                                                            className="w-full"
                                                        />
                                                    </div>

                                                    <div className="field col-12 md:col-6">
                                                        <label>Clinical Significance</label>
                                                        <Dropdown
                                                            value={state.interpretations[test.testId]?.significance}
                                                            onChange={(e) => updateInterpretation(test.testId, { significance: e.value })}
                                                            options={[
                                                                { label: 'High', value: 'High' },
                                                                { label: 'Moderate', value: 'Moderate' },
                                                                { label: 'Low', value: 'Low' }
                                                            ]}
                                                            placeholder="Select significance"
                                                            className="w-full"
                                                        />
                                                    </div>

                                                    <div className="field col-12">
                                                        <label>Clinical Relevance</label>
                                                        <InputTextarea
                                                            value={state.interpretations[test.testId]?.clinicalRelevance || ''}
                                                            onChange={(e) => updateInterpretation(test.testId, { clinicalRelevance: e.target.value })}
                                                            rows={3}
                                                            placeholder="Explain the clinical relevance of this result in the context of fertility treatment..."
                                                            className="w-full"
                                                        />
                                                    </div>

                                                    <div className="field col-12">
                                                        <div className="flex align-items-center gap-2 mb-2">
                                                            <Checkbox
                                                                inputId={`followup-${test.testId}`}
                                                                checked={state.interpretations[test.testId]?.followUpRequired || false}
                                                                onChange={(e) => updateInterpretation(test.testId, { followUpRequired: e.checked || false })}
                                                            />
                                                            <label htmlFor={`followup-${test.testId}`}>Follow-up Required</label>
                                                        </div>
                                                        {state.interpretations[test.testId]?.followUpRequired && (
                                                            <InputText
                                                                value={state.interpretations[test.testId]?.followUpTimeframe || ''}
                                                                onChange={(e) => updateInterpretation(test.testId, { followUpTimeframe: e.target.value })}
                                                                placeholder="e.g., Repeat in 4 weeks, Monitor monthly"
                                                                className="w-full mt-2"
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </Panel>
                                        </div>
                                    </div>
                                </AccordionTab>
                            ))}
                        </Accordion>
                    </Card>
                );

            case 3: // Treatment Recommendations
                return (
                    <Card className="shadow-2">
                        <div className="flex align-items-center mb-4">
                            <i className="pi pi-lightbulb text-primary text-2xl mr-3" />
                            <div>
                                <h4 className="m-0 text-primary">Treatment Recommendations</h4>
                                <p className="text-600 m-0">Develop treatment plan based on test results</p>
                            </div>
                        </div>

                        <TabView>
                            <TabPanel header="Immediate Actions" leftIcon="pi pi-exclamation-triangle">
                                <div className="formgrid grid">
                                    <div className="field col-12">
                                        <label className="font-semibold mb-2 block">Immediate Actions Required</label>
                                        <InputTextarea
                                            value={state.treatmentRecommendations.immediateActions.join('\n')}
                                            onChange={(e) =>
                                                setStateValue({
                                                    treatmentRecommendations: {
                                                        ...state.treatmentRecommendations,
                                                        immediateActions: e.target.value.split('\n').filter((action) => action.trim())
                                                    }
                                                })
                                            }
                                            rows={4}
                                            placeholder="List immediate actions required (one per line)&#10;e.g., Start folic acid supplementation&#10;Refer for thyroid evaluation&#10;Schedule follow-up ultrasound"
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            </TabPanel>

                            <TabPanel header="Medications" leftIcon="pi pi-shopping-bag">
                                <div className="formgrid grid">
                                    <div className="field col-12">
                                        <label className="font-semibold mb-2 block">Medication Changes</label>
                                        <InputTextarea
                                            value={state.treatmentRecommendations.medicationChanges.join('\n')}
                                            onChange={(e) =>
                                                setStateValue({
                                                    treatmentRecommendations: {
                                                        ...state.treatmentRecommendations,
                                                        medicationChanges: e.target.value.split('\n').filter((med) => med.trim())
                                                    }
                                                })
                                            }
                                            rows={4}
                                            placeholder="List medication adjustments (one per line)&#10;e.g., Increase Metformin to 500mg BD&#10;Start Clomiphene 50mg daily (cycle days 3-7)&#10;Continue folic acid 5mg daily"
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            </TabPanel>

                            <TabPanel header="Lifestyle" leftIcon="pi pi-heart">
                                <div className="formgrid grid">
                                    <div className="field col-12">
                                        <label className="font-semibold mb-2 block">Lifestyle Modifications</label>
                                        <InputTextarea
                                            value={state.treatmentRecommendations.lifestyleModifications.join('\n')}
                                            onChange={(e) =>
                                                setStateValue({
                                                    treatmentRecommendations: {
                                                        ...state.treatmentRecommendations,
                                                        lifestyleModifications: e.target.value.split('\n').filter((mod) => mod.trim())
                                                    }
                                                })
                                            }
                                            rows={4}
                                            placeholder="List lifestyle recommendations (one per line)&#10;e.g., Weight reduction - target BMI 20-25&#10;Regular moderate exercise 30 min/day&#10;Mediterranean diet with high antioxidants&#10;Stress reduction techniques"
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            </TabPanel>

                            <TabPanel header="Additional Tests" leftIcon="pi pi-search">
                                <div className="formgrid grid">
                                    <div className="field col-12">
                                        <label className="font-semibold mb-2 block">Additional Investigations</label>
                                        <InputTextarea
                                            value={state.treatmentRecommendations.additionalTests.join('\n')}
                                            onChange={(e) =>
                                                setStateValue({
                                                    treatmentRecommendations: {
                                                        ...state.treatmentRecommendations,
                                                        additionalTests: e.target.value.split('\n').filter((test) => test.trim())
                                                    }
                                                })
                                            }
                                            rows={4}
                                            placeholder="List additional tests needed (one per line)&#10;e.g., Repeat AMH in 3 months&#10;HSG (Hysterosalpingography)&#10;Sperm DNA fragmentation test&#10;Genetic counseling consultation"
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            </TabPanel>

                            <TabPanel header="Treatment Plan" leftIcon="pi pi-file-edit">
                                <div className="formgrid grid">
                                    <div className="field col-12">
                                        <label className="font-semibold mb-2 block">Treatment Plan Adjustments</label>
                                        <InputTextarea
                                            value={state.treatmentRecommendations.treatmentPlanAdjustments}
                                            onChange={(e) =>
                                                setStateValue({
                                                    treatmentRecommendations: {
                                                        ...state.treatmentRecommendations,
                                                        treatmentPlanAdjustments: e.target.value
                                                    }
                                                })
                                            }
                                            rows={5}
                                            placeholder="Describe modifications to the current treatment plan based on these results..."
                                            className="w-full"
                                        />
                                    </div>

                                    <div className="field col-12">
                                        <label className="font-semibold mb-2 block">Prognosis Update</label>
                                        <InputTextarea
                                            value={state.treatmentRecommendations.prognosisUpdate}
                                            onChange={(e) =>
                                                setStateValue({
                                                    treatmentRecommendations: {
                                                        ...state.treatmentRecommendations,
                                                        prognosisUpdate: e.target.value
                                                    }
                                                })
                                            }
                                            rows={3}
                                            placeholder="Update on patient's prognosis based on current results..."
                                            className="w-full"
                                        />
                                    </div>

                                    <div className="field col-12">
                                        <label className="font-semibold mb-2 block">Timeline Adjustments</label>
                                        <InputTextarea
                                            value={state.treatmentRecommendations.timelineAdjustments}
                                            onChange={(e) =>
                                                setStateValue({
                                                    treatmentRecommendations: {
                                                        ...state.treatmentRecommendations,
                                                        timelineAdjustments: e.target.value
                                                    }
                                                })
                                            }
                                            rows={3}
                                            placeholder="Any adjustments to treatment timeline or milestones..."
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            </TabPanel>
                        </TabView>
                    </Card>
                );

            case 4: // PatientExtra Discussion
                return (
                    <Card className="shadow-2">
                        <div className="flex align-items-center mb-4">
                            <i className="pi pi-comments text-primary text-2xl mr-3" />
                            <div>
                                <h4 className="m-0 text-primary">PatientExtra Discussion & Documentation</h4>
                                <p className="text-600 m-0">Document patient communication and plan follow-up</p>
                            </div>
                        </div>

                        <div className="formgrid grid">
                            <div className="field col-12">
                                <label className="font-semibold mb-2 block">Key Discussion Points</label>
                                <InputTextarea
                                    value={state.discussionPoints.join('\n')}
                                    onChange={(e) =>
                                        setStateValue({
                                            discussionPoints: e.target.value.split('\n').filter((point) => point.trim())
                                        })
                                    }
                                    rows={4}
                                    placeholder="Key points discussed with patient (one per line)&#10;e.g., Explained AMH results and ovarian reserve&#10;Discussed timeline for IVF treatment&#10;Reviewed lifestyle modifications&#10;Addressed patient concerns about side effects"
                                    className="w-full"
                                />
                            </div>

                            <div className="field col-12">
                                <label className="font-semibold mb-2 block">PatientExtra Education Materials Provided</label>
                                <div className="grid">
                                    {[
                                        'Ovarian Reserve Information Sheet',
                                        'IVF Process Guide',
                                        'Medication Administration Guide',
                                        'Lifestyle and Fertility Booklet',
                                        'Nutrition Guidelines for Fertility',
                                        'Exercise Recommendations',
                                        'Stress Management Techniques',
                                        'Support Group Information'
                                    ].map((material, index) => (
                                        <div key={index} className="col-6 md:col-4">
                                            <div className="flex align-items-center">
                                                <Checkbox
                                                    inputId={`material-${index}`}
                                                    checked={state.patientEducationMaterial.includes(material)}
                                                    onChange={(e) => {
                                                        const materials = e.checked ? [...state.patientEducationMaterial, material] : state.patientEducationMaterial.filter((m) => m !== material);
                                                        setStateValue({ patientEducationMaterial: materials });
                                                    }}
                                                />
                                                <label htmlFor={`material-${index}`} className="ml-2 text-sm">
                                                    {material}
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="field col-12 md:col-6">
                                <label className="font-semibold mb-2 block">Next Appointment Date</label>
                                <Calendar value={state.nextAppointmentDate} onChange={(e) => setStateValue({ nextAppointmentDate: e.value as Date })} showIcon dateFormat="dd M yy" minDate={new Date()} placeholder="Select date" className="w-full" />
                            </div>

                            <div className="field col-12 md:col-6">
                                <label className="font-semibold mb-2 block">Appointment Type</label>
                                <Dropdown
                                    value={state.nextAppointmentType}
                                    onChange={(e) => setStateValue({ nextAppointmentType: e.value })}
                                    options={[
                                        { label: 'Treatment Planning', value: 'Treatment Planning' },
                                        { label: 'Cycle Monitoring', value: 'Cycle Monitoring' },
                                        { label: 'Follow-up Results', value: 'Follow-up Results' },
                                        { label: 'Pre-procedure Consultation', value: 'Pre-procedure Consultation' },
                                        { label: 'Progress Review', value: 'Progress Review' },
                                        { label: 'Counseling Session', value: 'Counseling Session' }
                                    ]}
                                    placeholder="Select appointment type"
                                    className="w-full"
                                />
                            </div>

                            <div className="field col-12">
                                <label className="font-semibold mb-2 block">Visit Summary Notes</label>
                                <InputTextarea
                                    value={state.reviewNotes}
                                    onChange={(e) => setStateValue({ reviewNotes: e.target.value })}
                                    rows={4}
                                    placeholder="Summary of today's consultation, key decisions made, patient's questions and concerns addressed..."
                                    className="w-full"
                                />
                            </div>

                            <div className="field col-12">
                                <label className="font-semibold mb-2 block">Private Notes (Doctor)</label>
                                <InputTextarea value={state.doctorNotes} onChange={(e) => setStateValue({ doctorNotes: e.target.value })} rows={3} placeholder="Private clinical notes for healthcare provider reference..." className="w-full" />
                            </div>
                        </div>
                    </Card>
                );

            default:
                return null;
        }
    };

    return (
        <div className="grid">
            <Toast ref={toast} />

            {/* Progress Header */}
            <div className="col-12">
                <Card className="shadow-3">
                    <div className="flex align-items-center justify-content-between mb-4">
                        <div>
                            <h3 className="m-0 text-primary">Lab Results Review</h3>
                            <p className="text-600 m-0">Comprehensive fertility test results analysis and treatment planning</p>
                        </div>
                        <Badge value={`${state.currentStep + 1}/${steps.length}`} size="large" />
                    </div>

                    <div className="grid">
                        {steps.map((step, index) => (
                            <div key={index} className="col">
                                <div
                                    className={`text-center p-3 border-round-md transition-colors transition-duration-300 cursor-pointer ${
                                        index === state.currentStep ? 'bg-primary text-white shadow-3' : index < state.currentStep ? 'bg-green-100 text-green-800 border-1 border-green-300' : 'bg-gray-50 text-600 border-1 border-gray-300'
                                    }`}
                                    onClick={() => index <= state.currentStep && setStateValue({ currentStep: index })}
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

            {/* PatientExtra Summary Sidebar */}
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
                                    {state.selectedPatient.partnerName && <span>Partner: {state.selectedPatient.partnerName}</span>}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Tag value={`${state.labTests.length} Tests`} />
                                <Tag value={`${state.imagingStudies.length} Imaging`} />
                                {state.semenAnalysis && <Tag value="Semen Analysis" />}
                            </div>
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
                    <Button label="Previous" icon="pi pi-chevron-left" onClick={prevStep} disabled={state.currentStep === 0} className="p-button-outlined" size="large" />

                    <div className="flex gap-3">
                        <Button label="Save Draft" icon="pi pi-save" className="p-button-outlined" size="large" />

                        {state.currentStep === steps.length - 1 ? (
                            <Button label="Complete Review" icon="pi pi-check" onClick={saveReview} className="p-button-success" size="large" />
                        ) : (
                            <Button label="Next" icon="pi pi-chevron-right" iconPos="right" onClick={nextStep} size="large" disabled={state.currentStep === 0 && !state.selectedPatient} />
                        )}
                    </div>
                </div>
            </div>

            {/* Image Viewer Dialog */}
            <Dialog header="Imaging Study Viewer" visible={state.showImageViewer} onHide={() => setStateValue({ showImageViewer: false })} style={{ width: '80vw', height: '80vh' }} modal maximizable>
                <div className="text-center">
                    <p className="text-600">Image viewer would display ultrasound/imaging studies here</p>
                    <p className="text-500">Integration with medical imaging viewer required</p>
                </div>
            </Dialog>

            {/* Trend Chart Dialog */}
            <Dialog header={`${state.selectedTestForTrend} Trend Analysis`} visible={state.showTrendChart} onHide={() => setStateValue({ showTrendChart: false })} style={{ width: '70vw' }} modal>
                {state.selectedTestForTrend && (
                    <Chart
                        type="line"
                        data={generateTrendChart(state.selectedTestForTrend)}
                        options={{
                            responsive: true,
                            plugins: {
                                title: {
                                    display: true,
                                    text: `${state.selectedTestForTrend} Trend Over Time`
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    title: {
                                        display: true,
                                        text: 'Value'
                                    }
                                },
                                x: {
                                    title: {
                                        display: true,
                                        text: 'Date'
                                    }
                                }
                            }
                        }}
                    />
                )}
            </Dialog>

            <ConfirmDialog />
        </div>
    );
};

export default LabResultsReview;
