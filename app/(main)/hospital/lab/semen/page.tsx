'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Steps } from 'primereact/steps';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { Calendar } from 'primereact/calendar';
import { InputTextarea } from 'primereact/inputtextarea';
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';
import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { AutoComplete } from 'primereact/autocomplete';
import { Dialog } from 'primereact/dialog';
import { Toolbar } from 'primereact/toolbar';
import { Badge } from 'primereact/badge';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import { TSemenAnalysis, TSemenReport, TSemenFlag } from '@/types/semen/semen';
import semenService from '@/libs/blue_prints/SemenService';
import { CRUDTYPE } from '@/types/enums/enums';
import { format, differenceInYears } from 'date-fns';
import { Toast } from 'primereact/toast';
import PatientsModel from '@/libs/blue_prints/Patients';
import { TPatient } from '@/types/hospital';
import useUserData from '@/libs/hooks/useUserData';
import SemenPrint from './SemenPrint';

const INITIAL_STATE: TSemenAnalysis = {
    semenAnalysisId: 0,
    patientId: null,
    labId: '',
    collectionMethod: null,
    location: null,
    abstinence: null,
    sampleCompleted: false,
    collectionDate: null,
    analysisDate: null,
    reportDate: null,
    physicalExamination: {
        volume: '',
        color: null,
        liquefaction: null,
        ph: '',
        viscosity: null,
        odor: null
    },
    microscopicExamination: {
        concentration: '',
        progressiveMotility: '',
        normalMorPhology: '',
        totalMotility: '',
        vitality: '',
        aggregation: null,
        totalSpermCount: null,
        totalMotileSperm: null,
        progressiveMotileSperm: null
    },
    motilityCategories: {
        categoryA: null,
        categoryB: null,
        categoryC: null,
        categoryD: null
    },
    additionalCells: {
        peroxidasePositiveLeukocytes: '',
        immatureCell: '',
        epithelialCell: null,
        erythrocyte: null
    },
    clinicalFindings: {
        interpretation: '',
        recommendation: '',
        technicalComments: ''
    },
    status: 'In-Progress'
};
const patientsService = new PatientsModel();

export default function SemenAnalysisForm() {
    const [activeStep, setActiveStep] = useState(0);
    const [errors, setErrors] = useState<any>({});
    const toast = useRef<Toast>(null);
    const [formData, setFormData] = useState<TSemenAnalysis>(INITIAL_STATE);
    const printRef = useRef<HTMLDivElement>(null);
    const [printData, setPrintData] = useState<TSemenAnalysis | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [savedAnalyses, setSavedAnalyses] = useState<TSemenAnalysis[]>([]);
    const [savedDialogVisible, setSavedDialogVisible] = useState(false);
    const [reportDialogVisible, setReportDialogVisible] = useState(false);
    const [reportData, setReportData] = useState<TSemenReport | null>(null);
    const [reportLoading, setReportLoading] = useState(false);
    const reportPrintRef = useRef<HTMLDivElement>(null);
    const [patientSuggestions, setPatientSuggestions] = useState<TPatient[]>([]);
    const [patients, setPatients] = useState<TPatient[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<TPatient | null>(null);
    const [crudType, setCrudType] = useState<CRUDTYPE>(CRUDTYPE.save);
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useUserData();
    // Search query for Saved Analyses list
    const [savedSearch, setSavedSearch] = useState('');

    // Auto-calc derived microscopic values based on Volume, Concentration, and Motility percentages
    useEffect(() => {
        // Extract source values
        const volRaw = formData.physicalExamination?.volume ?? '';
        const concRaw = formData.microscopicExamination?.concentration ?? '';
        const totalMotilityPctRaw = formData.microscopicExamination?.totalMotility ?? '';
        const progMotilityPctRaw = formData.microscopicExamination?.progressiveMotility ?? '';

        // Parse to numbers safely
        const volume = typeof volRaw === 'number' ? volRaw : parseFloat((volRaw as any) || '');
        const concentration = typeof concRaw === 'number' ? concRaw : parseFloat((concRaw as any) || '');
        const totalMotilityPct = typeof totalMotilityPctRaw === 'number' ? totalMotilityPctRaw : parseFloat((totalMotilityPctRaw as any) || '');
        const progressiveMotilityPct = typeof progMotilityPctRaw === 'number' ? progMotilityPctRaw : parseFloat((progMotilityPctRaw as any) || '');

        const haveBase = !isNaN(volume) && !isNaN(concentration);
        const totalSpermCount = haveBase ? volume * concentration : null;

        const totalMotileSperm = haveBase && !isNaN(totalMotilityPct) ? totalSpermCount! * (totalMotilityPct / 100) : null;

        const progressiveMotileSperm = haveBase && !isNaN(progressiveMotilityPct) ? totalSpermCount! * (progressiveMotilityPct / 100) : null;

        // Only update state if values actually changed to avoid render loops
        const prevMicro = formData.microscopicExamination || ({} as any);
        const changed = prevMicro.totalSpermCount !== totalSpermCount || prevMicro.totalMotileSperm !== totalMotileSperm || prevMicro.progressiveMotileSperm !== progressiveMotileSperm;

        if (changed) {
            setFormData((prev) => ({
                ...prev,
                microscopicExamination: {
                    ...prev.microscopicExamination,
                    totalSpermCount,
                    totalMotileSperm,
                    progressiveMotileSperm
                }
            }));
        }
        // We intentionally depend on the specific source fields only
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.physicalExamination.volume, formData.microscopicExamination.concentration, formData.microscopicExamination.totalMotility, formData.microscopicExamination.progressiveMotility]);

    useEffect(() => {
        const initPage = async () => {
            const patients = await patientsService.getAllPatients();
            const savedSemen = await semenService.getSavedSemen();
            setPatients(patients);
            setSavedAnalyses(savedSemen.data.operatedData.map((semenData) => parseSemenData(semenData)));
        };
        initPage();
        document.title = 'Semen Analysis';
    }, []);

    const loadSavedAnalyses = async () => {
        try {
            const savedSemen = await semenService.getSavedSemen();
            setSavedAnalyses(savedSemen.data.operatedData);
        } catch (e) {
            console.error('Failed to load saved analyses', e);
            setSavedAnalyses([]);
        }
    };

    const parseSemenData = (semenData: TSemenAnalysis): TSemenAnalysis => {
        const physicalExamination = typeof semenData.physicalExamination === 'string' ? JSON.parse(semenData.physicalExamination) : semenData.physicalExamination;
        const motilityCategories = typeof semenData.motilityCategories === 'string' ? JSON.parse(semenData.motilityCategories) : semenData.motilityCategories;
        const additionalCells = typeof semenData.additionalCells === 'string' ? JSON.parse(semenData.additionalCells) : semenData.additionalCells;
        const clinicalFindings = typeof semenData.clinicalFindings === 'string' ? JSON.parse(semenData.clinicalFindings) : semenData.clinicalFindings;
        const microscopicExamination = typeof semenData.microscopicExamination === 'string' ? JSON.parse(semenData.microscopicExamination) : semenData.microscopicExamination;
        const completed = semenData.sampleCompleted === 1;

        return { ...semenData, physicalExamination, motilityCategories, additionalCells, clinicalFindings, microscopicExamination, sampleCompleted: completed };
    };

    // Helper: when a patient has a registered partner, semen analysis is performed on the partner
    const getPartnerFromPatient = (p?: TPatient | null) => {
        console.log(p);
        if (!p || !p.partner) return null;
        try {
            const partner = typeof p.partner === 'string' ? JSON.parse(p.partner) : p.partner;
            // Ensure required shape
            if (partner && typeof partner === 'object') {
                return partner as any; // TPatientPartner shape
            }
        } catch {
            return null;
        }
        return null;
    };

    // Printing
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'Semen Analysis Report'
    });

    const printAssessment = (data?: TSemenAnalysis) => {
        const source = data ? parseSemenData(data) : formData;
        setPrintData(source);
        // Defer to ensure print component receives updated props
        setTimeout(() => handlePrint(), 0);
    };

    const steps = [
        { label: 'General Info', icon: 'pi pi-user' },
        { label: 'Dates', icon: 'pi pi-calendar' },
        { label: 'Physical Exam', icon: 'pi pi-eye' },
        { label: 'Microscopic', icon: 'pi pi-search' },
        { label: 'Motility', icon: 'pi pi-chart-bar' },
        { label: 'Additional Cells', icon: 'pi pi-th-large' },
        { label: 'Clinical Findings', icon: 'pi pi-file-edit' }
    ];

    const collectionMethods = [
        { label: 'Masturbation', value: 'masturbation' },
        { label: 'Non-Spermicidal Condom', value: 'non_spermicidal_condom' },
        { label: 'Coitus Interruptus', value: 'coitus_interruptus' }
    ];

    const locations = [
        { label: 'Laboratory', value: 'laboratory' },
        { label: 'Home', value: 'home' },
        { label: 'Clinic', value: 'clinic' }
    ];

    const colors = [
        { label: 'Greyish White', value: 'Greyish White' },
        { label: 'Clear', value: 'clear' },
        { label: 'Yellow', value: 'Yellow' },
        { label: 'Brown', value: 'brown' },
        { label: 'Red', value: 'red' }
    ];

    const liquefactionOptions = [
        { label: 'Complete', value: 'Complete' },
        { label: 'Incomplete', value: 'Incomplete' },
        { label: 'Absent', value: 'Absent' }
    ];

    const viscosityOptions = [
        { label: 'Normal', value: 'Normal' },
        { label: 'Increase', value: 'Increase' },
        { label: 'Decrease', value: 'Decrease' }
    ];

    const odorOptions = [
        { label: 'Characteristic', value: 'Characteristic' },
        { label: 'Foul', value: 'Foul' },
        { label: 'Absent', value: 'Absent' }
    ];

    const aggregationOptions = [
        { label: 'Absent', value: 'Absent' },
        { label: 'Present', value: 'Present' }
    ];

    const cellCountOptions = [
        { label: 'Absent', value: 'Absent' },
        { label: 'Few', value: 'Few' },
        { label: 'Moderate', value: 'Moderate' },
        { label: 'Many', value: 'Many' }
    ];

    const updateFormData = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    const updateNestedData = (parent, field, value) => {
        setFormData((prev) => ({
            ...prev,
            [parent]: { ...prev[parent], [field]: value }
        }));
        if (errors[`${parent}.${field}`]) {
            setErrors((prev) => ({ ...prev, [`${parent}.${field}`]: null }));
        }
    };

    const validateStep = (step) => {
        const newErrors: any = {};

        switch (step) {
            case 0:
                if (!formData.patientId) newErrors.patientId = 'Patient ID is required';
                // if (!formData.labId) newErrors.labId = 'Lab ID is required';
                if (!formData.collectionMethod) newErrors.collectionMethod = 'Collection method is required';
                if (!formData.location) newErrors.location = 'Location is required';
                if (formData.abstinence === null) newErrors.abstinence = 'Abstinence days is required';
                break;
            case 1:
                if (!formData.collectionDate) newErrors.collectionDate = 'Collection date is required';
                if (!formData.analysisDate) newErrors.analysisDate = 'Analysis date is required';
                break;
            case 2:
                if (!formData.physicalExamination.volume) newErrors['physicalExamination.volume'] = 'Volume is required';
                if (!formData.physicalExamination.color) newErrors['physicalExamination.color'] = 'Color is required';
                if (!formData.physicalExamination.liquefaction) newErrors['physicalExamination.liquefaction'] = 'Liquefaction is required';
                if (!formData.physicalExamination.ph) newErrors['physicalExamination.ph'] = 'pH is required';
                if (!formData.physicalExamination.viscosity) newErrors['physicalExamination.viscosity'] = 'Viscosity is required';
                if (!formData.physicalExamination.odor) newErrors['physicalExamination.odor'] = 'Odor is required';
                break;
            case 3:
                if (!formData.microscopicExamination.concentration) newErrors['microscopicExamination.concentration'] = 'Concentration is required';
                if (!formData.microscopicExamination.progressiveMotility) newErrors['microscopicExamination.progressiveMotility'] = 'Progressive motility is required';
                if (!formData.microscopicExamination.normalMorPhology) newErrors['microscopicExamination.normalMorPhology'] = 'Normal morphology is required';
                break;
            case 4:
                if (formData.motilityCategories.categoryA === null) newErrors['motilityCategories.categoryA'] = 'Category A is required';
                if (formData.motilityCategories.categoryB === null) newErrors['motilityCategories.categoryB'] = 'Category B is required';
                if (formData.motilityCategories.categoryC === null) newErrors['motilityCategories.categoryC'] = 'Category C is required';
                if (formData.motilityCategories.categoryD === null) newErrors['motilityCategories.categoryD'] = 'Category D is required';
                break;
            case 5:
                if (!formData.additionalCells.peroxidasePositiveLeukocytes) newErrors['additionalCells.peroxidasePositiveLeukocytes'] = 'Leukocytes is required';
                if (!formData.additionalCells.immatureCell) newErrors['additionalCells.immatureCell'] = 'Immature cell is required';
                if (!formData.additionalCells.epithelialCell) newErrors['additionalCells.epithelialCell'] = 'Epithelial cell is required';
                if (!formData.additionalCells.erythrocyte) newErrors['additionalCells.erythrocyte'] = 'Erythrocyte is required';
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(activeStep)) {
            setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => Math.max(prev - 1, 0));
    };

    const handleSubmit = async () => {
        try {
            if (validateStep(activeStep)) {
                // Mark as completed if not already and save to storage
                const completedData = {
                    ...formData,
                    collectionDate: format(formData.collectionDate, 'yyyy-MM-dd HH:mm:ss'),
                    analysisDate: format(formData.analysisDate, 'yyyy-MM-dd HH:mm:ss'),
                    reportDate: format(formData.reportDate, 'yyyy-MM-dd HH:mm:ss'),
                    userId: user.userId
                } as TSemenAnalysis;

                setIsLoading(true);

                const response = await semenService.saveSemenAnalysis(completedData, crudType);

                if (response.data.status === 2) {
                    toast.current?.show({ severity: 'info', summary: 'Analysis In Progress', detail: 'In-Progress analysis exists for selected patient. Update the status of current analysis to complete to begin new for patient.', life: 3000 });
                    return;
                }

                if (response.status === 200 && response.data.operatedData !== undefined) {
                    if (crudType === CRUDTYPE.save) {
                        setSavedAnalyses((prevState) => [...prevState, parseSemenData(response.data.operatedData)]);
                        toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Assessment updated successfully', life: 3000 });
                    } else {
                        setSavedAnalyses((prevState) => prevState.map((analysis) => (analysis.semenAnalysisId === response.data.operatedData.semenAnalysisId ? parseSemenData(response.data.operatedData) : analysis)));
                        toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Assessment saved successfully', life: 3000 });
                    }

                    setCrudType(CRUDTYPE.save);

                    setEditingId(null);

                    resetFormData();

                    setActiveStep(0);
                } else {
                    toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to save assessment', life: 3000 });
                }
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    const getMotilityChartData = () => {
        const { categoryA, categoryB, categoryC, categoryD } = formData.motilityCategories;
        return {
            labels: ['Category A (Rapid)', 'Category B (Slow)', 'Category C (Non-progressive)', 'Category D (Immotile)'],
            datasets: [
                {
                    data: [categoryA || 0, categoryB || 0, categoryC || 0, categoryD || 0],
                    backgroundColor: ['#4CAF50', '#FFC107', '#FF9800', '#F44336']
                }
            ]
        };
    };

    const patientById = (id?: number | null) => patients.find((p) => p.patientId === id) || null;

    // Filter Saved Analyses by query (patient name/record, lab ID, date, status)
    const filteredSavedAnalyses = useMemo(() => {
        const q = savedSearch.trim().toLowerCase();
        if (!q) return savedAnalyses;
        return savedAnalyses.filter((row) => {
            const p = patientById(row?.patientId);
            const recordNumber = (p?.recordNumber ?? '').toString().toLowerCase();
            const patientName = `${p?.firstName ?? ''} ${p?.lastName ?? ''}`.trim().toLowerCase();
            const labId = (row?.labId ?? '').toString().toLowerCase();
            const analysisDate = row?.analysisDate ? new Date(row.analysisDate).toLocaleString().toLowerCase() : '';
            const statusText = (row?.sampleCompleted ? row?.status : 'Draft')?.toString().toLowerCase();
            return recordNumber.includes(q) || patientName.includes(q) || labId.includes(q) || analysisDate.includes(q) || statusText.includes(q);
        });
    }, [savedAnalyses, savedSearch, patients]);

    const completePatientMethod = (e) => {
        const q = (e.query || '').toLowerCase();
        const filtered = !q
            ? patients
            : patients.filter((p) => p.firstName.toLowerCase().includes(q) || p.lastName.toLowerCase().includes(q) || String(p.patientId).includes(q) || p.recordNumber.toLowerCase().includes(q) || p.address?.toLowerCase().includes(q));
        setPatientSuggestions(filtered);
    };

    const startNewAnalysis = () => {
        setFormData(INITIAL_STATE);
        setErrors({});
        setEditingId(null);
        setSelectedPatient(null);
        setActiveStep(0);
    };

    const reviveAnalysisData = (data: TSemenAnalysis): TSemenAnalysis => {
        const reviveDate = (v: any) => (typeof v === 'string' ? new Date(v) : v);
        return {
            ...data,
            collectionDate: data.collectionDate ? reviveDate(data.collectionDate) : null,
            analysisDate: data.analysisDate ? reviveDate(data.analysisDate) : null,
            reportDate: data.reportDate ? reviveDate(data.reportDate) : null
        } as TSemenAnalysis;
    };

    const saveDraft = async () => {
        await handleSubmit();
    };

    const deleteAnalysis = async (analysisId: number) => {
        const accept = async () => {
            const response = await semenService.deleteSemenAnalysis(analysisId);
            const body: any = response?.data;
            const success = body?.status === 'ok' || body?.operatedData?.affectedRows === 1;
            if (success) {
                toast.current?.show({ severity: 'success', summary: 'Analysis Deleted', detail: 'Focused Analysis was successfully removed!', life: 3000 });
                const list = savedAnalyses.filter((x) => x.semenAnalysisId !== analysisId);
                setSavedAnalyses(list);
                if (editingId === analysisId) startNewAnalysis();
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: body?.message || 'Failed to delete assessment', life: 3000 });
            }
        };
        confirmDialog({
            message: 'Delete this saved analysis? This action cannot be undone.',
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            accept
        });
    };

    const handleReportPrint = useReactToPrint({
        contentRef: reportPrintRef,
        documentTitle: 'Semen-Analysis-WHO-Report'
    });

    const openWhoReport = async (analysisId: number) => {
        try {
            setReportLoading(true);
            setReportData(null);
            setReportDialogVisible(true);
            const response = await semenService.getSemenReport(analysisId);
            const body: any = response?.data;
            if (body?.status === 'ok') {
                setReportData((body.data ?? body.operatedData) as TSemenReport);
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: body?.message || 'Failed to load report', life: 3000 });
                setReportDialogVisible(false);
            }
        } catch (e: any) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: e?.message || 'Failed to load report', life: 3000 });
            setReportDialogVisible(false);
        } finally {
            setReportLoading(false);
        }
    };

    const loadAnalysis = (item: TSemenAnalysis) => {
        const revived = reviveAnalysisData(item);
        setFormData(revived);
        setEditingId(item.semenAnalysisId);
        setErrors({});
        setActiveStep(0);
        // Attempt to show the owning patient in the UI. Stored patientId may actually be a partnerId.
        const asPartnerOwner = patients.find((px) => {
            try {
                const partner = getPartnerFromPatient(px);
                return partner?.partnerId === (revived.patientId as any);
            } catch {
                return false;
            }
        });
        setSelectedPatient(asPartnerOwner ?? patientById(revived.patientId as any));
        setSavedDialogVisible(false);
        setCrudType(CRUDTYPE.update);
    };
    const resetFormData = () => {
        setFormData(INITIAL_STATE);
        setErrors({});
        setSelectedPatient(null);
    };
    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <div>
                        <div className="bg-primary-50 border-round p-3 mb-4 flex align-items-center gap-3">
                            <i className="pi pi-user text-primary text-4xl"></i>
                            <div>
                                <h3 className="m-0 text-primary text-xl">Patient & Sample Information</h3>
                                <p className="m-0 mt-1 text-600 text-sm">Enter patient details and sample collection information</p>
                            </div>
                        </div>
                        <div className="grid">
                            <div className="col-12 md:col-6">
                                <label className="block mb-2 font-semibold">
                                    <i className="pi pi-user mr-2 text-primary"></i>Patient *
                                </label>
                                <AutoComplete
                                    value={selectedPatient}
                                    field="name"
                                    suggestions={patientSuggestions}
                                    completeMethod={completePatientMethod}
                                    onChange={(e) => setSelectedPatient(e.value)}
                                    onSelect={(e) => {
                                        setSelectedPatient(e.value);
                                        // Save records under the selected patient's ID (partner info is UI-only)
                                        const effectiveId = e.value?.patientId ?? null;
                                        updateFormData('patientId', effectiveId);
                                    }}
                                    dropdown
                                    placeholder="Search by name, MRN or ID"
                                    className={`w-full ${errors.patientId ? 'p-invalid' : ''}`}
                                    itemTemplate={(item) => (
                                        <div className="flex align-items-center gap-2">
                                            <i className="pi pi-user text-600"></i>
                                            <div>
                                                <div className="font-medium">{`${item.firstName} ${item.lastName}`}</div>
                                                <small className="text-600">
                                                    ID: {item.patientId} • {item.recordNumber}
                                                </small>
                                            </div>
                                        </div>
                                    )}
                                    selectedItemTemplate={(item: TPatient) => (item ? `${`${item.firstName} ${item.lastName}`} (${item.recordNumber})` : '')}
                                />
                                {errors.patientId && <small className="p-error">{errors.patientId}</small>}
                                {selectedPatient && (
                                    <div className="mt-2 flex flex-column gap-2">
                                        <div className="flex align-items-center gap-2">
                                            <Badge value="Selected" severity="info"></Badge>
                                            <span className="text-700">
                                                {`${selectedPatient.firstName} ${selectedPatient.lastName}`} • {selectedPatient.recordNumber} • ID {selectedPatient.patientId}
                                            </span>
                                        </div>
                                        {(() => {
                                            const partner = getPartnerFromPatient(selectedPatient);
                                            if (!partner) return null;
                                            const partnerName = `${partner.firstName ?? ''} ${partner.lastName ?? ''}`.trim();
                                            return (
                                                <div className="p-2 border-round bg-yellow-50 text-800" style={{ border: '1px dashed var(--yellow-400)' }}>
                                                    <i className="pi pi-users mr-2 text-yellow-700"></i>
                                                    <strong>Partner for analysis:</strong> {partnerName || 'Unnamed'}
                                                    {partner.phone && <span className="ml-2 text-600">• {partner.phone}</span>}
                                                    {partner.email && <span className="ml-2 text-600">• {partner.email}</span>}
                                                    <span className="ml-2 text-600">(Partner info shown for context only; the record is saved under the selected patient)</span>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>

                            <div className="col-12 md:col-6">
                                <label className="block mb-2 font-semibold">
                                    <i className="pi pi-building mr-2 text-primary"></i>Lab ID *
                                </label>
                                <InputText value={formData.labId} onChange={(e) => updateFormData('labId', e.target.value)} className={`w-full ${errors.labId ? 'p-invalid' : ''}`} placeholder="Enter lab ID" />
                                {errors.labId && <small className="p-error">{errors.labId}</small>}
                            </div>

                            <div className="col-12 md:col-6">
                                <label className="block mb-2 font-semibold">
                                    <i className="pi pi-box mr-2 text-primary"></i>Collection Method *
                                </label>
                                <Dropdown
                                    value={formData.collectionMethod}
                                    options={collectionMethods}
                                    onChange={(e) => updateFormData('collectionMethod', e.value)}
                                    className={`w-full ${errors.collectionMethod ? 'p-invalid' : ''}`}
                                    placeholder="Select method"
                                />
                                {errors.collectionMethod && <small className="p-error">{errors.collectionMethod}</small>}
                            </div>

                            <div className="col-12 md:col-6">
                                <label className="block mb-2 font-semibold">
                                    <i className="pi pi-map-marker mr-2 text-primary"></i>Location *
                                </label>
                                <Dropdown value={formData.location} options={locations} onChange={(e) => updateFormData('location', e.value)} className={`w-full ${errors.location ? 'p-invalid' : ''}`} placeholder="Select location" />
                                {errors.location && <small className="p-error">{errors.location}</small>}
                            </div>

                            <div className="col-12 md:col-6">
                                <label className="block mb-2 font-semibold">
                                    <i className="pi pi-clock mr-2 text-primary"></i>Abstinence (days) *
                                </label>
                                <InputNumber value={formData.abstinence} onValueChange={(e) => updateFormData('abstinence', e.value)} className={`w-full ${errors.abstinence ? 'p-invalid' : ''}`} min={0} placeholder="Days" />
                                {errors.abstinence && <small className="p-error">{errors.abstinence}</small>}
                            </div>

                            <div className="col-12 md:col-6 flex align-items-end">
                                <div className="field-checkbox mb-0 p-3 border-round bg-blue-50">
                                    <Checkbox inputId="sampleCompleted" value={formData.sampleCompleted} checked={formData.sampleCompleted as boolean} onChange={(e) => updateFormData('sampleCompleted', e.checked)} />
                                    <label htmlFor="sampleCompleted" className="ml-2 font-semibold">
                                        <i className="pi pi-check-circle mr-2"></i>Sample Completed
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 1:
                return (
                    <div>
                        <div className="bg-blue-50 border-round p-3 mb-4 flex align-items-center gap-3">
                            <i className="pi pi-calendar text-blue-600 text-4xl"></i>
                            <div>
                                <h3 className="m-0 text-blue-700 text-xl">Date & Time Recording</h3>
                                <p className="m-0 mt-1 text-600 text-sm">Record collection, analysis, and report dates</p>
                            </div>
                        </div>
                        <div className="grid">
                            <div className="col-12 md:col-4">
                                <label className="block mb-2 font-semibold">
                                    <i className="pi pi-calendar-plus mr-2 text-primary"></i>Collection Date *
                                </label>
                                <Calendar
                                    value={formData.collectionDate as Date}
                                    onChange={(e) => updateFormData('collectionDate', e.value)}
                                    showTime
                                    hourFormat="24"
                                    className={`w-full ${errors.collectionDate ? 'p-invalid' : ''}`}
                                    placeholder="Select date & time"
                                    hideOnDateTimeSelect
                                />
                                {errors.collectionDate && <small className="p-error">{errors.collectionDate}</small>}
                            </div>

                            <div className="col-12 md:col-4">
                                <label className="block mb-2 font-semibold">
                                    <i className="pi pi-search mr-2 text-primary"></i>Analysis Date *
                                </label>
                                <Calendar
                                    value={formData.analysisDate as Date}
                                    onChange={(e) => updateFormData('analysisDate', e.value)}
                                    showTime
                                    hourFormat="24"
                                    className={`w-full ${errors.analysisDate ? 'p-invalid' : ''}`}
                                    placeholder="Select date & time"
                                    hideOnDateTimeSelect
                                />
                                {errors.analysisDate && <small className="p-error">{errors.analysisDate}</small>}
                            </div>

                            <div className="col-12 md:col-4">
                                <label className="block mb-2 font-semibold">
                                    <i className="pi pi-file mr-2 text-primary"></i>Report Date
                                </label>
                                <Calendar hideOnDateTimeSelect value={formData.reportDate as Date} onChange={(e) => updateFormData('reportDate', e.value)} showTime hourFormat="24" className="w-full" placeholder="Select date & time (optional)" />
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div>
                        <div className="bg-indigo-50 border-round p-3 mb-4 flex align-items-center gap-3">
                            <i className="pi pi-eye text-indigo-600 text-4xl"></i>
                            <div>
                                <h3 className="m-0 text-indigo-700 text-xl">Physical Examination</h3>
                                <p className="m-0 mt-1 text-600 text-sm">Macroscopic analysis of semen sample</p>
                            </div>
                        </div>
                        <div className="grid">
                            <div className="col-12 md:col-6">
                                <label className="block mb-2 font-semibold">
                                    <i className="pi pi-chart-line mr-2 text-primary"></i>Volume (ml) *
                                </label>
                                <InputText
                                    value={formData.physicalExamination.volume}
                                    onChange={(e) => updateNestedData('physicalExamination', 'volume', e.target.value)}
                                    className={`w-full ${errors['physicalExamination.volume'] ? 'p-invalid' : ''}`}
                                    placeholder="e.g., 2.5"
                                />
                                {errors['physicalExamination.volume'] && <small className="p-error">{errors['physicalExamination.volume']}</small>}
                            </div>

                            <div className="col-12 md:col-6">
                                <label className="block mb-2 font-semibold">
                                    <i className="pi pi-palette mr-2 text-primary"></i>Color *
                                </label>
                                <Dropdown
                                    value={formData.physicalExamination.color}
                                    options={colors}
                                    onChange={(e) => updateNestedData('physicalExamination', 'color', e.value)}
                                    className={`w-full ${errors['physicalExamination.color'] ? 'p-invalid' : ''}`}
                                    placeholder="Select color"
                                />
                                {errors['physicalExamination.color'] && <small className="p-error">{errors['physicalExamination.color']}</small>}
                            </div>

                            <div className="col-12 md:col-6">
                                <label className="block mb-2 font-semibold">Liquefaction *</label>
                                <Dropdown
                                    value={formData.physicalExamination.liquefaction}
                                    options={liquefactionOptions}
                                    onChange={(e) => updateNestedData('physicalExamination', 'liquefaction', e.value)}
                                    className={`w-full ${errors['physicalExamination.liquefaction'] ? 'p-invalid' : ''}`}
                                    placeholder="Select status"
                                />
                                {errors['physicalExamination.liquefaction'] && <small className="p-error">{errors['physicalExamination.liquefaction']}</small>}
                            </div>

                            <div className="col-12 md:col-6">
                                <label className="block mb-2 font-semibold">pH *</label>
                                <InputText
                                    value={formData.physicalExamination.ph}
                                    onChange={(e) => updateNestedData('physicalExamination', 'ph', e.target.value)}
                                    className={`w-full ${errors['physicalExamination.ph'] ? 'p-invalid' : ''}`}
                                    placeholder="e.g., 7.5"
                                />
                                {errors['physicalExamination.ph'] && <small className="p-error">{errors['physicalExamination.ph']}</small>}
                            </div>

                            <div className="col-12 md:col-6">
                                <label className="block mb-2 font-semibold">
                                    <i className="pi pi-align-justify mr-2 text-primary"></i>Viscosity *
                                </label>
                                <Dropdown
                                    value={formData.physicalExamination.viscosity}
                                    options={viscosityOptions}
                                    onChange={(e) => updateNestedData('physicalExamination', 'viscosity', e.value)}
                                    className={`w-full ${errors['physicalExamination.viscosity'] ? 'p-invalid' : ''}`}
                                    placeholder="Select viscosity"
                                />
                                {errors['physicalExamination.viscosity'] && <small className="p-error">{errors['physicalExamination.viscosity']}</small>}
                            </div>

                            <div className="col-12 md:col-6">
                                <label className="block mb-2 font-semibold">
                                    <i className="pi pi-heart mr-2 text-primary"></i>Odor *
                                </label>
                                <Dropdown
                                    value={formData.physicalExamination.odor}
                                    options={odorOptions}
                                    onChange={(e) => updateNestedData('physicalExamination', 'odor', e.value)}
                                    className={`w-full ${errors['physicalExamination.odor'] ? 'p-invalid' : ''}`}
                                    placeholder="Select odor"
                                />
                                {errors['physicalExamination.odor'] && <small className="p-error">{errors['physicalExamination.odor']}</small>}
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div>
                        <div className="bg-teal-50 border-round p-3 mb-4 flex align-items-center gap-3">
                            <i className="pi pi-search text-teal-600 text-4xl"></i>
                            <div>
                                <h3 className="m-0 text-teal-700 text-xl">Microscopic Examination</h3>
                                <p className="m-0 mt-1 text-600 text-sm">Detailed sperm analysis and counts</p>
                            </div>
                        </div>
                        <div className="grid">
                            <div className="col-12 md:col-6">
                                <label className="block mb-2 font-semibold">Concentration (million/ml) *</label>
                                <InputText
                                    value={formData.microscopicExamination.concentration}
                                    onChange={(e) => updateNestedData('microscopicExamination', 'concentration', e.target.value)}
                                    className={`w-full ${errors['microscopicExamination.concentration'] ? 'p-invalid' : ''}`}
                                    placeholder="e.g., 50"
                                />
                                {errors['microscopicExamination.concentration'] && <small className="p-error">{errors['microscopicExamination.concentration']}</small>}
                            </div>

                            <div className="col-12 md:col-6">
                                <label className="block mb-2 font-semibold">Progressive Motility (%) *</label>
                                <InputText
                                    value={formData.microscopicExamination.progressiveMotility}
                                    onChange={(e) => updateNestedData('microscopicExamination', 'progressiveMotility', e.target.value)}
                                    className={`w-full ${errors['microscopicExamination.progressiveMotility'] ? 'p-invalid' : ''}`}
                                    placeholder="e.g., 40"
                                />
                                {errors['microscopicExamination.progressiveMotility'] && <small className="p-error">{errors['microscopicExamination.progressiveMotility']}</small>}
                            </div>

                            <div className="col-12 md:col-6">
                                <label className="block mb-2 font-semibold">Normal Morphology (%) *</label>
                                <InputText
                                    value={formData.microscopicExamination.normalMorPhology}
                                    onChange={(e) => updateNestedData('microscopicExamination', 'normalMorPhology', e.target.value)}
                                    className={`w-full ${errors['microscopicExamination.normalMorPhology'] ? 'p-invalid' : ''}`}
                                    placeholder="e.g., 4"
                                />
                                {errors['microscopicExamination.normalMorPhology'] && <small className="p-error">{errors['microscopicExamination.normalMorPhology']}</small>}
                            </div>

                            <div className="col-12 md:col-6">
                                <label className="block mb-2 font-semibold">Total Motility (%)</label>
                                <InputText value={formData.microscopicExamination.totalMotility} onChange={(e) => updateNestedData('microscopicExamination', 'totalMotility', e.target.value)} className="w-full" placeholder="e.g., 60" />
                            </div>

                            <div className="col-12 md:col-6">
                                <label className="block mb-2 font-semibold">Vitality (%)</label>
                                <InputText value={formData.microscopicExamination.vitality} onChange={(e) => updateNestedData('microscopicExamination', 'vitality', e.target.value)} className="w-full" placeholder="e.g., 75" />
                            </div>

                            <div className="col-12 md:col-6">
                                <label className="block mb-2 font-semibold">Aggregation</label>
                                <Dropdown
                                    value={formData.microscopicExamination.aggregation}
                                    options={aggregationOptions}
                                    onChange={(e) => updateNestedData('microscopicExamination', 'aggregation', e.value)}
                                    className="w-full"
                                    placeholder="Select status"
                                />
                            </div>

                            <div className="col-12 md:col-4">
                                <label className="block mb-2 font-semibold">Total Sperm Count (million)</label>
                                <InputNumber value={formData.microscopicExamination.totalSpermCount} onValueChange={(e) => updateNestedData('microscopicExamination', 'totalSpermCount', e.value)} className="w-full" placeholder="e.g., 150" />
                            </div>

                            <div className="col-12 md:col-4">
                                <label className="block mb-2 font-semibold">Total Motile Sperm (million)</label>
                                <InputNumber value={formData.microscopicExamination.totalMotileSperm} onValueChange={(e) => updateNestedData('microscopicExamination', 'totalMotileSperm', e.value)} className="w-full" placeholder="e.g., 90" />
                            </div>

                            <div className="col-12 md:col-4">
                                <label className="block mb-2 font-semibold">Progressive Motile Sperm (million)</label>
                                <InputNumber
                                    value={formData.microscopicExamination.progressiveMotileSperm}
                                    onValueChange={(e) => updateNestedData('microscopicExamination', 'progressiveMotileSperm', e.value)}
                                    className="w-full"
                                    placeholder="e.g., 60"
                                />
                            </div>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div>
                        <div className="bg-orange-50 border-round p-3 mb-4 flex align-items-center gap-3">
                            <i className="pi pi-chart-bar text-orange-600 text-4xl"></i>
                            <div>
                                <h3 className="m-0 text-orange-700 text-xl">Motility Categories</h3>
                                <p className="m-0 mt-1 text-600 text-sm">WHO 2021 sperm motility classification</p>
                            </div>
                        </div>
                        <div className="grid">
                            <div className="col-12">
                                <Message severity="info" text="WHO 2010 Classification: A = Rapid progressive, B = Slow progressive, C = Non-progressive, D = Immotile" className="mb-3" />
                            </div>

                            <div className="col-12 md:col-6">
                                <label className="block mb-2 font-semibold">
                                    <i className="pi pi-arrow-up mr-2 text-green-600"></i>Category A - Rapid Progressive (%) *
                                </label>
                                <InputNumber
                                    value={formData.motilityCategories.categoryA}
                                    onValueChange={(e) => updateNestedData('motilityCategories', 'categoryA', e.value)}
                                    className={`w-full ${errors['motilityCategories.categoryA'] ? 'p-invalid' : ''}`}
                                    min={0}
                                    max={100}
                                    placeholder="0-100"
                                />
                                {errors['motilityCategories.categoryA'] && <small className="p-error">{errors['motilityCategories.categoryA']}</small>}
                            </div>

                            <div className="col-12 md:col-6">
                                <label className="block mb-2 font-semibold">
                                    <i className="pi pi-arrow-right mr-2 text-yellow-600"></i>Category B - Slow Progressive (%) *
                                </label>
                                <InputNumber
                                    value={formData.motilityCategories.categoryB}
                                    onValueChange={(e) => updateNestedData('motilityCategories', 'categoryB', e.value)}
                                    className={`w-full ${errors['motilityCategories.categoryB'] ? 'p-invalid' : ''}`}
                                    min={0}
                                    max={100}
                                    placeholder="0-100"
                                />
                                {errors['motilityCategories.categoryB'] && <small className="p-error">{errors['motilityCategories.categoryB']}</small>}
                            </div>

                            <div className="col-12 md:col-6">
                                <label className="block mb-2 font-semibold">
                                    <i className="pi pi-circle mr-2 text-orange-600"></i>Category C - Non-Progressive (%) *
                                </label>
                                <InputNumber
                                    value={formData.motilityCategories.categoryC}
                                    onValueChange={(e) => updateNestedData('motilityCategories', 'categoryC', e.value)}
                                    className={`w-full ${errors['motilityCategories.categoryC'] ? 'p-invalid' : ''}`}
                                    min={0}
                                    max={100}
                                    placeholder="0-100"
                                />
                                {errors['motilityCategories.categoryC'] && <small className="p-error">{errors['motilityCategories.categoryC']}</small>}
                            </div>

                            <div className="col-12 md:col-6">
                                <label className="block mb-2 font-semibold">
                                    <i className="pi pi-stop mr-2 text-red-600"></i>Category D - Immotile (%) *
                                </label>
                                <InputNumber
                                    value={formData.motilityCategories.categoryD}
                                    onValueChange={(e) => updateNestedData('motilityCategories', 'categoryD', e.value)}
                                    className={`w-full ${errors['motilityCategories.categoryD'] ? 'p-invalid' : ''}`}
                                    min={0}
                                    max={100}
                                    placeholder="0-100"
                                />
                                {errors['motilityCategories.categoryD'] && <small className="p-error">{errors['motilityCategories.categoryD']}</small>}
                            </div>

                            {(formData.motilityCategories.categoryA !== null || formData.motilityCategories.categoryB !== null || formData.motilityCategories.categoryC !== null || formData.motilityCategories.categoryD !== null) && (
                                <div className="col-12 justify-content-center align-items-center flex">
                                    <Card title="📊 Motility Distribution" className="mt-3 shadow-3">
                                        <Chart type="pie" data={getMotilityChartData()} style={{ height: '200px', width: '200px' }} />
                                    </Card>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div>
                        <div className="bg-pink-50 border-round p-3 mb-4 flex align-items-center gap-3">
                            <i className="pi pi-th-large text-pink-600 text-4xl"></i>
                            <div>
                                <h3 className="m-0 text-pink-700 text-xl">Additional Cellular Components</h3>
                                <p className="m-0 mt-1 text-600 text-sm">Leukocytes, immature cells, and other findings</p>
                            </div>
                        </div>
                        <div className="grid">
                            <div className="col-12 md:col-6">
                                <label className="block mb-2 font-semibold">Peroxidase Positive Leukocytes *</label>
                                <InputText
                                    value={formData.additionalCells.peroxidasePositiveLeukocytes}
                                    onChange={(e) => updateNestedData('additionalCells', 'peroxidasePositiveLeukocytes', e.target.value)}
                                    className={`w-full ${errors['additionalCells.peroxidasePositiveLeukocytes'] ? 'p-invalid' : ''}`}
                                    placeholder="e.g., <1 million/ml"
                                />
                                {errors['additionalCells.peroxidasePositiveLeukocytes'] && <small className="p-error">{errors['additionalCells.peroxidasePositiveLeukocytes']}</small>}
                            </div>

                            <div className="col-12 md:col-6">
                                <label className="block mb-2 font-semibold">Immature Cell *</label>
                                <InputText
                                    value={formData.additionalCells.immatureCell}
                                    onChange={(e) => updateNestedData('additionalCells', 'immatureCell', e.target.value)}
                                    className={`w-full ${errors['additionalCells.immatureCell'] ? 'p-invalid' : ''}`}
                                    placeholder="e.g., Few"
                                />
                                {errors['additionalCells.immatureCell'] && <small className="p-error">{errors['additionalCells.immatureCell']}</small>}
                            </div>

                            <div className="col-12 md:col-6">
                                <label className="block mb-2 font-semibold">Epithelial Cell *</label>
                                <Dropdown
                                    value={formData.additionalCells.epithelialCell}
                                    options={cellCountOptions}
                                    onChange={(e) => updateNestedData('additionalCells', 'epithelialCell', e.value)}
                                    className={`w-full ${errors['additionalCells.epithelialCell'] ? 'p-invalid' : ''}`}
                                    placeholder="Select count"
                                />
                                {errors['additionalCells.epithelialCell'] && <small className="p-error">{errors['additionalCells.epithelialCell']}</small>}
                            </div>

                            <div className="col-12 md:col-6">
                                <label className="block mb-2 font-semibold">Erythrocyte *</label>
                                <Dropdown
                                    value={formData.additionalCells.erythrocyte}
                                    options={cellCountOptions}
                                    onChange={(e) => updateNestedData('additionalCells', 'erythrocyte', e.value)}
                                    className={`w-full ${errors['additionalCells.erythrocyte'] ? 'p-invalid' : ''}`}
                                    placeholder="Select count"
                                />
                                {errors['additionalCells.erythrocyte'] && <small className="p-error">{errors['additionalCells.erythrocyte']}</small>}
                            </div>
                        </div>
                    </div>
                );
            case 6:
                return (
                    <div>
                        x
                        <div className="bg-cyan-50 border-round p-3 mb-4 flex align-items-center gap-3">
                            <i className="pi pi-file-edit text-cyan-600 text-4xl"></i>
                            <div>
                                <h3 className="m-0 text-cyan-700 text-xl">Clinical Findings & Recommendations</h3>
                                <p className="m-0 mt-1 text-600 text-sm">Interpretation, recommendations, and technical notes</p>
                            </div>
                        </div>
                        <div className="grid">
                            <div className="col-12">
                                <label className="block mb-2 font-semibold">
                                    <i className="pi pi-comments mr-2 text-primary"></i>Interpretation
                                </label>
                                <InputTextarea
                                    value={formData.clinicalFindings.interpretation}
                                    onChange={(e) => updateNestedData('clinicalFindings', 'interpretation', e.target.value)}
                                    rows={4}
                                    className="w-full"
                                    placeholder="Enter clinical interpretation..."
                                />
                            </div>

                            <div className="col-12">
                                <label className="block mb-2 font-semibold">
                                    <i className="pi pi-thumbs-up mr-2 text-primary"></i>Recommendation
                                </label>
                                <InputTextarea
                                    value={formData.clinicalFindings.recommendation}
                                    onChange={(e) => updateNestedData('clinicalFindings', 'recommendation', e.target.value)}
                                    rows={4}
                                    className="w-full"
                                    placeholder="Enter recommendations..."
                                />
                            </div>

                            <div className="col-12">
                                <label className="block mb-2 font-semibold">
                                    <i className="pi pi-pencil mr-2 text-primary"></i>Technical Comments
                                </label>
                                <InputTextarea
                                    value={formData.clinicalFindings.technicalComments}
                                    onChange={(e) => updateNestedData('clinicalFindings', 'technicalComments', e.target.value)}
                                    rows={4}
                                    className="w-full"
                                    placeholder="Enter technical comments..."
                                />
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <Toast position="top-right" ref={toast} />
            <div className="surface-ground min-h-screen p-4">
                <div className="max-w-6xl mx-auto">
                    <Card className="mb-4 shadow-4">
                        <div className="flex align-items-center gap-3">
                            <div className="bg-primary border-circle p-3">
                                <i className="pi pi-book text-white text-3xl"></i>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-primary m-0">Semen Analysis Form</h1>
                                <p className="text-600 m-0 mt-1">Complete all required fields in each step to proceed</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="shadow-4">
                        <Toolbar
                            className="mb-4"
                            left={() => (
                                <div className="flex align-items-center gap-2">
                                    <Button
                                        label="New"
                                        icon="pi pi-plus"
                                        onClick={() => {
                                            confirmDialog({
                                                message: 'Start a new analysis? Unsaved changes will be lost unless you save a draft.',
                                                header: 'Confirm',
                                                icon: 'pi pi-exclamation-triangle',
                                                accept: () => startNewAnalysis()
                                            });
                                        }}
                                    />
                                    <Button label={editingId ? 'Save Changes' : 'Save'} icon="pi pi-save" severity="success" onClick={saveDraft} />
                                    <Button label="Saved Analyses" icon="pi pi-database" severity="info" onClick={() => setSavedDialogVisible(true)} outlined />
                                    <Button label="Print PDF" icon="pi pi-print" severity="help" onClick={() => printAssessment()} outlined />
                                </div>
                            )}
                            right={() => (
                                <div className="flex align-items-center gap-2">
                                    {editingId && <Badge value="Editing" severity="warning" />}
                                    <Badge value={`${savedAnalyses.length} saved`} />
                                </div>
                            )}
                        />
                        {/* Printable content (offscreen) */}
                        <div style={{ position: 'absolute', top: -10000, left: -10000 }}>
                            <SemenPrint ref={printRef} data={printData ?? formData} patientsList={patients} selectedPatient={selectedPatient} />
                        </div>
                        <Steps model={steps} activeIndex={activeStep} onSelect={(e) => setActiveStep(e.index)} readOnly={false} className="mb-5" />

                        <div className="mb-4">{renderStepContent()}</div>

                        <div className="flex justify-content-between pt-4 border-top-1 surface-border">
                            <Button label="Back" icon="pi pi-arrow-left" onClick={handleBack} disabled={activeStep === 0} severity="info" outlined />

                            {activeStep < steps.length - 1 ? (
                                <Button label="Next" icon="pi pi-arrow-right" iconPos="right" onClick={handleNext} />
                            ) : (
                                <Button label={crudType === CRUDTYPE.save ? 'Submit' : 'Update'} icon="pi pi-check" onClick={handleSubmit} severity="success" loading={isLoading} disabled={isLoading} />
                            )}
                        </div>
                    </Card>

                    <Dialog header="Saved Analyses" visible={savedDialogVisible} onHide={() => setSavedDialogVisible(false)} position={'top'}>
                        <div className="mb-3 flex justify-content-between align-items-center gap-3 flex-wrap">
                            <span className="text-600">Load a saved analysis to continue editing.</span>
                            <div className="flex align-items-center gap-2">
                                <span className="p-input-icon-left">
                                    <i className="pi pi-search" />
                                    <InputText placeholder="Search by patient, record, lab ID, date, status" value={savedSearch} onChange={(e) => setSavedSearch(e.target.value)} />
                                </span>
                                <Button label="Refresh" icon="pi pi-refresh" text onClick={loadSavedAnalyses} />
                            </div>
                        </div>
                        <DataTable value={filteredSavedAnalyses} paginator rows={10} emptyMessage="No saved analyses">
                            <Column header="#" body={(_, opt) => opt.rowIndex + 1} style={{ width: '4rem' }}></Column>
                            <Column
                                header="Patient"
                                body={(row: TSemenAnalysis) => {
                                    const p = patientById(row?.patientId);
                                    return p ? `${p.firstName} ${p.lastName} (${p.recordNumber})` : `ID ${row?.patientId ?? '-'}`;
                                }}
                            ></Column>
                            <Column
                                header="Partner (Name, Age)"
                                body={(row: TSemenAnalysis) => {
                                    const owner = patientById(row?.patientId);
                                    if (!owner) return '-';
                                    const partner = getPartnerFromPatient(owner);
                                    if (!partner) return '-';
                                    const fullName = `${partner.firstName ?? ''} ${partner.lastName ?? ''}`.trim() || 'Unnamed';
                                    let ageNum: number | null = null;
                                    try {
                                        if (partner.dateOfBirth) {
                                            const dob = new Date(partner.dateOfBirth as any);
                                            if (!isNaN(dob.getTime())) {
                                                ageNum = differenceInYears(new Date(), dob);
                                            }
                                        }
                                    } catch {}
                                    return `${fullName}${ageNum !== null ? `, ${ageNum}` : ''}`;
                                }}
                                style={{ width: '16rem' }}
                            ></Column>
                            <Column header="Lab ID" body={(row: TSemenAnalysis) => row.labId ?? '-'} style={{ width: '8rem' }}></Column>
                            <Column header="Analysis Date" body={(row: TSemenAnalysis) => (row.analysisDate ? new Date(row.analysisDate).toLocaleString() : '-')} style={{ width: '16rem' }}></Column>
                            <Column header="Updated" body={(row: TSemenAnalysis) => (row.analysisDate ? new Date(row.analysisDate).toLocaleString() : '-')} style={{ width: '16rem' }}></Column>
                            <Column header="Status" body={(row: TSemenAnalysis) => <Badge value={row.sampleCompleted ? row.status : 'Draft'} severity={row.sampleCompleted ? 'success' : 'info'} />} style={{ width: '8rem' }}></Column>
                            <Column
                                header="Actions"
                                body={(row: TSemenAnalysis) => (
                                    <div className="flex gap-2">
                                        <Button icon="pi pi-print" label="Print" size="small" severity="help" outlined onClick={() => printAssessment(row)} />
                                        <Button icon="pi pi-file" label="WHO Report" size="small" severity="warning" outlined onClick={() => openWhoReport(row.semenAnalysisId)} />
                                        <Button icon="pi pi-pencil" label="Load" size="small" onClick={() => loadAnalysis(row)} />
                                        <Button icon="pi pi-trash" label="Delete" size="small" severity="danger" outlined onClick={() => deleteAnalysis(row?.semenAnalysisId)} />
                                    </div>
                                )}
                                style={{ width: '16rem' }}
                            ></Column>
                        </DataTable>
                    </Dialog>
                    <Dialog
                        header="WHO Reference Report"
                        visible={reportDialogVisible}
                        onHide={() => setReportDialogVisible(false)}
                        style={{ width: '60rem' }}
                        position="top"
                    >
                        {reportLoading && <div className="p-4 text-center"><i className="pi pi-spin pi-spinner text-2xl" /> Loading report…</div>}
                        {!reportLoading && reportData && (
                            <div>
                                <div className="flex justify-content-end mb-3">
                                    <Button label="Print Report" icon="pi pi-print" size="small" onClick={() => handleReportPrint()} />
                                </div>
                                <div ref={reportPrintRef} className="p-3">
                                    <div className="mb-3">
                                        <h3 className="m-0">Semen Analysis — WHO Reference Report</h3>
                                        <p className="text-600 m-0 mt-1">Lab ID: {reportData.analysis?.labId ?? '-'} · Analysis ID: {reportData.analysis?.semenAnalysisId}</p>
                                    </div>
                                    <div className="p-3 mb-3 border-round" style={{ background: '#f1f5f9' }}>
                                        <div className="text-sm text-600 uppercase">Interpretation</div>
                                        <div className="text-2xl font-bold">{reportData.interpretation}</div>
                                    </div>
                                    <table className="w-full border-collapse" style={{ borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ background: '#e2e8f0' }}>
                                                <th className="text-left p-2 border-1 surface-border">Parameter</th>
                                                <th className="text-left p-2 border-1 surface-border">Patient Value</th>
                                                <th className="text-left p-2 border-1 surface-border">WHO Reference</th>
                                                <th className="text-left p-2 border-1 surface-border">Flag</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reportData.flags.map((f: TSemenFlag) => {
                                                const colorClass = f.flag === 'low' ? 'text-red-500' : f.flag === 'high' ? 'text-orange-500' : 'text-green-600';
                                                return (
                                                    <tr key={f.key}>
                                                        <td className="p-2 border-1 surface-border">{f.name}</td>
                                                        <td className={`p-2 border-1 surface-border font-semibold ${colorClass}`}>{f.value ?? '—'}</td>
                                                        <td className="p-2 border-1 surface-border">{f.who}</td>
                                                        <td className={`p-2 border-1 surface-border font-semibold ${colorClass}`}>{f.flag.toUpperCase()}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                    <p className="text-xs text-600 mt-3 m-0">Reference: WHO laboratory manual for the examination and processing of human semen, lower reference limits.</p>
                                </div>
                            </div>
                        )}
                    </Dialog>
                    <ConfirmDialog />
                </div>
            </div>
        </>
    );
}
