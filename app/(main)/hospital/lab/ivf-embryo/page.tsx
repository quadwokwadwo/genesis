'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { TabPanel, TabView } from 'primereact/tabview';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Panel } from 'primereact/panel';
import { Chip } from 'primereact/chip';
import { FileUpload } from 'primereact/fileupload';
import { Image } from 'primereact/image';
import { Dialog } from 'primereact/dialog';
import { IBlastocystImage, TBlastocyst, TIVFAssessmentData, TPolarBodies, TProNuclei, TZygoteInfo } from '@/types/ivf/ivf';
import { CRUDTYPE } from '@/types/enums/enums';
import ivfEmbryoService from '@/libs/blue_prints/IVFEmbryoService';
import useUserData from '@/libs/hooks/useUserData';
import { TPatient, User } from '@/types/hospital';
import PatientsModel from '@/libs/blue_prints/Patients';
import { differenceInYears } from 'date-fns';
import { changeDateFormat, resolveEmbryoImageSrc } from '@/libs/utils';
import { MultiSelect } from 'primereact/multiselect';
import IVFEmbryoPrint from './IVFEmbryoPrint';

const patients = new PatientsModel();
const IVFEmbryoAssessment = () => {
    const toast = useRef<Toast>(null);
    const printRef = useRef<HTMLDivElement>(null);
    const pendingPrintDataRef = useRef<TIVFAssessmentData | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
    const [patientsList, setPatientsList] = useState<TPatient[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<TPatient | null>(null);
    const [selectedAssessment, setSelectedAssessment] = useState<TIVFAssessmentData | null>(null);
    const [showPatientDialog, setShowPatientDialog] = useState(false);
    const [savedAssessments, setSavedAssessments] = useState<TIVFAssessmentData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [printData, setPrintData] = useState<TIVFAssessmentData | null>(null);
    const [imageUploading, setImageUploading] = useState(false);
    const [crudType, setCrudType] = useState<CRUDTYPE>(CRUDTYPE.save);
    const { user } = useUserData<User>();
    // Search state
    const [assessmentsSearch, setAssessmentsSearch] = useState('');
    const [patientsSearch, setPatientsSearch] = useState('');

    useEffect(() => {
        const initPage = async () => {
            const patientsList = await patients.getPatientsList({ pageSize: 200 });
            const getEmbryoList = await ivfEmbryoService.getIVFEmbryoList();
            const parsedEmbryoList = getEmbryoList.data.operatedData.map((embryo) => parseIVFEmbryoData(embryo));
            setSavedAssessments(parsedEmbryoList);
            setPatientsList(patientsList.rows);
            setIsLoading(false);
        };
        initPage();
        document.title = 'IVF Embryo Assessment';
    }, []);
    const parseIVFEmbryoData = (embryo: TIVFAssessmentData): TIVFAssessmentData => {
        const fertilizationAssessment = typeof embryo.fertilizationAssessment === 'string' ? JSON.parse(embryo.fertilizationAssessment) : embryo.fertilizationAssessment;
        const blastoCystAssessment = typeof embryo.blastoCystAssessment === 'string' ? JSON.parse(embryo.blastoCystAssessment) : embryo.blastoCystAssessment;
        const embryoTransfer = typeof embryo.embryoTransfer === 'string' ? JSON.parse(embryo.embryoTransfer) : embryo.embryoTransfer;
        const cryoPreservation = typeof embryo.cryoPreservation === 'string' ? JSON.parse(embryo.cryoPreservation) : embryo.cryoPreservation;
        const typeOfIVFCycle = typeof embryo.typeOfIVFCycle === 'string' ? JSON.parse(embryo.typeOfIVFCycle) : embryo.typeOfIVFCycle;
        return { ...embryo, fertilizationAssessment, blastoCystAssessment, embryoTransfer, cryoPreservation, typeOfIVFCycle };
    };
    // IVF Cycle Type Options
    const ivfCycleTypes = [
        { label: 'Self Cycle', value: 'Self Cycle' },
        { label: 'ICSI', value: 'ICSI' },
        { label: 'Donor Sperm', value: 'Donor Sperm' },
        { label: 'Minimal Stimulation', value: 'Minimal Stimulation' },
        { label: 'Donor Egg', value: 'Donor Egg' },
        { label: 'Frozen Embryo Transfer', value: 'Frozen Embryo Transfer' }
    ];
    const gardnerGrades = [
        { label: '1AA', value: '1AA' },
        { label: '1AB', value: '1AB' },
        { label: '1AC', value: '1AC' },
        { label: '1BA', value: '1BA' },
        { label: '1BB', value: '1BB' },
        { label: '1BC', value: '1BC' },
        { label: '1CA', value: '1CA' },
        { label: '1CB', value: '1CB' },
        { label: '1CC', value: '1CC' },
        { label: '2AA', value: '2AA' },
        { label: '2AB', value: '2AB' },
        { label: '2AC', value: '2AC' },
        { label: '2BA', value: '2BA' },
        { label: '2BB', value: '2BB' },
        { label: '2BC', value: '2BC' },
        { label: '2CA', value: '2CA' },
        { label: '2CB', value: '2CB' },
        { label: '2CC', value: '2CC' },
        { label: '3AA', value: '3AA' },
        { label: '3AB', value: '3AB' },
        { label: '3AC', value: '3AC' },
        { label: '3BA', value: '3BA' },
        { label: '3BB', value: '3BB' },
        { label: '3BC', value: '3BC' },
        { label: '3CA', value: '3CA' },
        { label: '3CB', value: '3CB' },
        { label: '3CC', value: '3CC' },
        { label: '4AA', value: '4AA' },
        { label: '4AB', value: '4AB' },
        { label: '4AC', value: '4AC' },
        { label: '4BA', value: '4BA' },
        { label: '4BB', value: '4BB' },
        { label: '4BC', value: '4BC' },
        { label: '4CA', value: '4CA' },
        { label: '4CB', value: '4CB' },
        { label: '4CC', value: '4CC' },
        { label: '5AA', value: '5AA' },
        { label: '5AB', value: '5AB' },
        { label: '5AC', value: '5AC' },
        { label: '5BA', value: '5BA' },
        { label: '5BB', value: '5BB' },
        { label: '5BC', value: '5BC' },
        { label: '5CA', value: '5CA' },
        { label: '5CB', value: '5CB' },
        { label: '5CC', value: '5CC' },
        { label: '6AA', value: '6AA' },
        { label: '6AB', value: '6AB' },
        { label: '6AC', value: '6AC' },
        { label: '6BA', value: '6BA' },
        { label: '6BB', value: '6BB' },
        { label: '6BC', value: '6BC' },
        { label: '6CA', value: '6CA' },
        { label: '6CB', value: '6CB' },
        { label: '6CC', value: '6CC' }
    ];

    const proNucleiOptions: TProNuclei[] = ['0PN', '1PN', '2PN (Normal)', '3PN', '>3PN'];
    const polarBodyOptions: TPolarBodies[] = ['None', '1 Polar Body', '2 Polar Bodies', 'Fragmented'];
    const dayOptions = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
    const cryoMethodOptions = ['Vitrification', 'Slow Freezing', 'Ultra-rapid Vitrification'];

    // Initial State
    const INITIAL_ZYGOTE: TZygoteInfo = {
        zygoteId: 1,
        time: '',
        pronuclei: null,
        polarBodies: null,
        zygoteNumber: ''
    };

    const INITIAL_BLASTOCYST: TBlastocyst = {
        embryoId: 1,
        day: 'Day 1',
        time: '',
        gardnerGrade: '',
        blastocystNumber: ''
    };

    const getInitialAssessmentData = (): TIVFAssessmentData => ({
        dateOfCycle: null,
        typeOfIVFCycle: [],
        numberOfOocytesRetrieved: 0,
        fertilizationAssessment: {
            zygoteInfo: [{ ...INITIAL_ZYGOTE }],
            embryologistNotes: ''
        },
        blastoCystAssessment: {
            blastocysts: [{ ...INITIAL_BLASTOCYST }],
            embryologistNotes: '',
            images: []
        },
        embryoTransfer: {
            transferDate: null,
            dateOfTransfer: 'Day 5',
            dayToured: '',
            numberTransferred: 0,
            notes: ''
        },
        cryoPreservation: {
            cryoDate: null,
            dayOfCryo: 'Day 5',
            embryoIds: '',
            method: 'Vitrification',
            numberPreserved: 0,
            storageLocation: ''
        },
        userId: selectedPatient?.patientId
    });

    const [assessmentData, setAssessmentData] = useState<TIVFAssessmentData>(getInitialAssessmentData());

    // Update Functions
    const updateCycleInfo = (field: string, value: any) => {
        setAssessmentData((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    const addZygote = () => {
        const newZygote = {
            ...INITIAL_ZYGOTE,
            zygoteId: assessmentData.fertilizationAssessment.zygoteInfo.length + 1
        };
        setAssessmentData((prev) => ({
            ...prev,
            fertilizationAssessment: {
                ...prev.fertilizationAssessment,
                zygoteInfo: [...prev.fertilizationAssessment.zygoteInfo, newZygote]
            }
        }));
    };

    const updateZygote = (index: number, field: string, value: any) => {
        setAssessmentData((prev) => {
            const updatedZygotes = [...prev.fertilizationAssessment.zygoteInfo];
            updatedZygotes[index] = { ...updatedZygotes[index], [field]: value };
            return {
                ...prev,
                fertilizationAssessment: {
                    ...prev.fertilizationAssessment,
                    zygoteInfo: updatedZygotes
                }
            };
        });
    };

    const removeZygote = (index: number) => {
        setAssessmentData((prev) => ({
            ...prev,
            fertilizationAssessment: {
                ...prev.fertilizationAssessment,
                zygoteInfo: prev.fertilizationAssessment.zygoteInfo.filter((_, i) => i !== index)
            }
        }));
    };

    const addBlastocyst = () => {
        const newBlastocyst = {
            ...INITIAL_BLASTOCYST,
            embryoId: assessmentData.blastoCystAssessment.blastocysts.length + 1
        };
        setAssessmentData((prev) => ({
            ...prev,
            blastoCystAssessment: {
                ...prev.blastoCystAssessment,
                blastocysts: [...prev.blastoCystAssessment.blastocysts, newBlastocyst]
            }
        }));
    };

    const updateBlastocyst = (index: number, field: string, value: any) => {
        setAssessmentData((prev) => {
            const updatedBlastocysts = [...prev.blastoCystAssessment.blastocysts];
            updatedBlastocysts[index] = { ...updatedBlastocysts[index], [field]: value };
            return {
                ...prev,
                blastoCystAssessment: {
                    ...prev.blastoCystAssessment,
                    blastocysts: updatedBlastocysts
                }
            };
        });
    };

    const removeBlastocyst = (index: number) => {
        setAssessmentData((prev) => ({
            ...prev,
            blastoCystAssessment: {
                ...prev.blastoCystAssessment,
                blastocysts: prev.blastoCystAssessment.blastocysts.filter((_, i) => i !== index)
            }
        }));
    };

    const updateBlastocystSection = (field: 'embryologistNotes' | 'images', value: any) => {
        setAssessmentData((prev) => ({
            ...prev,
            blastoCystAssessment: {
                ...prev.blastoCystAssessment,
                [field]: value
            }
        }));
    };

    const updateEmbryoTransfer = (field: string, value: any) => {
        setAssessmentData((prev) => ({
            ...prev,
            embryoTransfer: {
                ...prev.embryoTransfer,
                [field]: value
            }
        }));
    };

    const updateCryoPreservation = (field: string, value: any) => {
        setAssessmentData((prev) => ({
            ...prev,
            cryoPreservation: {
                ...prev.cryoPreservation,
                [field]: value
            }
        }));
    };

    // Validation
    const validateForm = (): boolean => {
        if (!assessmentData.dateOfCycle) {
            toast.current?.show({ severity: 'error', summary: 'Validation Error', detail: 'Cycle date is required' });
            return false;
        }
        if (!assessmentData.typeOfIVFCycle) {
            toast.current?.show({ severity: 'error', summary: 'Validation Error', detail: 'IVF cycle type is required' });
            return false;
        }
        if (assessmentData.numberOfOocytesRetrieved === null) {
            toast.current?.show({ severity: 'error', summary: 'Validation Error', detail: 'Number of oocytes is required' });
            return false;
        }
        return true;
    };

    // Submit Handler
    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            const payload = { ...assessmentData, userId: user.userId, patientId: selectedPatient?.patientId, dateOfCycle: changeDateFormat(new Date(assessmentData.dateOfCycle)) };
            const response = await ivfEmbryoService.saveIVFEmbryo(payload, crudType);

            if (response.data.status === 2) {
                toast.current?.show({
                    severity: 'info',
                    summary: 'Activity In Progress',
                    detail: 'There is a similar in-progress activity for selected patient. Ensure to conclude all concerned investigations with patient before beginning another.',
                    life: 3000
                });
                return;
            }
            if (response.status === 200 && response.data.operatedData !== undefined) {
                if (crudType === CRUDTYPE.save) {
                    setSavedAssessments((prev) => [...prev, parseIVFEmbryoData(response.data.operatedData)]);
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Assessment saved successfully',
                        life: 3000
                    });
                } else {
                    // Update existing assessment
                    setSavedAssessments((prev) => prev.map((a) => (a.ivfEmbryoAssessmentId === selectedAssessment.ivfEmbryoAssessmentId ? parseIVFEmbryoData(response.data.operatedData) : a)));
                    toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Assessment updated successfully', life: 3000 });
                }
                setViewMode('list');
                setSelectedAssessment(null);
                setCrudType(CRUDTYPE.save);
                setSelectedPatient(null);
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to save assessment' });
            }
        } catch (error) {
            console.log(error);
        }
    };

    // Load assessment for editing
    const handleEditAssessment = (assessment: TIVFAssessmentData) => {
        const assessmentSelected = savedAssessments.find((a) => a.ivfEmbryoAssessmentId === assessment.ivfEmbryoAssessmentId);
        const selectedPatient = patientsList.find((p) => p.patientId === assessmentSelected?.patientId);
        setSelectedAssessment(assessmentSelected);
        setAssessmentData(assessmentSelected);
        setSelectedPatient(selectedPatient);
        setViewMode('form');
        setActiveIndex(0);
        setCrudType(CRUDTYPE.update);
    };

    // Create new assessment
    const handleNewAssessment = () => {
        if (!selectedPatient) {
            setShowPatientDialog(true);
            return;
        }
        setSelectedAssessment(null);
        setAssessmentData(getInitialAssessmentData());
        setViewMode('form');
        setActiveIndex(0);
    };

    // Select patient and create assessment
    const handleSelectPatient = (patient: TPatient) => {
        setSelectedPatient(patient);
        setShowPatientDialog(false);
        setAssessmentData({ ...getInitialAssessmentData(), userId: user.userId, patientId: patient.patientId });
        setViewMode('form');
    };

    // Delete assessment
    const handleDeleteAssessment = (id: number) => {
        confirmDialog({
            message: 'Are you sure you want to delete this assessment?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                const response = await ivfEmbryoService.deleteIVFEmbryo(id);
                // New envelope: { status: 'ok', data: { ivfEmbryoAssessmentId, affectedRows } }
                // Legacy envelope still also exposed via operatedData.
                const succeeded =
                    (response?.data?.status as unknown) === 'ok' ||
                    response?.data?.operatedData?.affectedRows === 1 ||
                    response?.data?.operatedData?.ivfEmbryoAssessmentId === id;
                if (succeeded) {
                    setSavedAssessments((prev) => prev.filter((a) => a.ivfEmbryoAssessmentId !== id));
                    toast.current?.show({ severity: 'info', summary: 'Deleted', detail: 'Assessment deleted successfully' });
                } else {
                    toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to delete assessment' });
                }
            }
        });
    };

    // ART cycle outcome capture
    const [outcomeDialog, setOutcomeDialog] = useState<{ open: boolean; record: TIVFAssessmentData | null }>({ open: false, record: null });
    const [outcomeForm, setOutcomeForm] = useState<{ outcome: string; notes: string; recordedDate: Date | null }>({ outcome: '', notes: '', recordedDate: new Date() });
    const [outcomeSubmitting, setOutcomeSubmitting] = useState(false);
    const outcomeOptions = [
        { label: 'Positive', value: 'Positive' },
        { label: 'Negative', value: 'Negative' },
        { label: 'Biochemical', value: 'Biochemical' },
        { label: 'Clinical Pregnancy', value: 'Clinical Pregnancy' },
        { label: 'Miscarriage', value: 'Miscarriage' },
        { label: 'Live Birth', value: 'Live Birth' }
    ];

    const openOutcomeDialog = (record: TIVFAssessmentData) => {
        setOutcomeForm({
            outcome: record.artCycleOutcome ?? '',
            notes: record.outcomeNotes ?? '',
            recordedDate: record.outcomeRecordedDate ? new Date(record.outcomeRecordedDate) : new Date()
        });
        setOutcomeDialog({ open: true, record });
    };

    const closeOutcomeDialog = () => setOutcomeDialog({ open: false, record: null });

    const submitOutcome = async () => {
        if (!outcomeDialog.record?.ivfEmbryoAssessmentId) return;
        if (!outcomeForm.outcome) {
            toast.current?.show({ severity: 'warn', summary: 'Required', detail: 'Select an outcome' });
            return;
        }
        try {
            setOutcomeSubmitting(true);
            const recordedDate = outcomeForm.recordedDate ? outcomeForm.recordedDate.toISOString().slice(0, 10) : undefined;
            const response = await ivfEmbryoService.recordArtOutcome(outcomeDialog.record.ivfEmbryoAssessmentId, {
                outcome: outcomeForm.outcome,
                notes: outcomeForm.notes || undefined,
                recordedDate
            });
            if ((response?.data?.status as unknown) === 'ok') {
                const updated = (response.data as any)?.data?.record ?? (response.data as any)?.operatedData?.record ?? null;
                setSavedAssessments((prev) =>
                    prev.map((a) =>
                        a.ivfEmbryoAssessmentId === outcomeDialog.record!.ivfEmbryoAssessmentId
                            ? parseIVFEmbryoData({ ...a, ...(updated ?? {}), artCycleOutcome: outcomeForm.outcome, outcomeNotes: outcomeForm.notes, outcomeRecordedDate: recordedDate ?? a.outcomeRecordedDate })
                            : a
                    )
                );
                toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Outcome recorded' });
                closeOutcomeDialog();
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: (response?.data as any)?.message || 'Failed to record outcome' });
            }
        } catch (e: any) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: e?.message || 'Failed to record outcome' });
        } finally {
            setOutcomeSubmitting(false);
        }
    };

    // Module 16: upload each selected file through the central multipart
    // pipeline. The server returns an opaque fileId per file; we keep a UI-only
    // blob: URL for the preview thumbnail and stash the fileId so the DB row
    // persists `file:<uuid>` instead of inline base64.
    const handleImageUpload = async (event: any) => {
        const files = (event.files as File[]) ?? [];
        if (!files.length) return;
        try {
            setImageUploading(true);
            const uploaded = await Promise.all(
                files.map(async (file) => {
                    const meta = await ivfEmbryoService.uploadBlastocyst(file);
                    return {
                        fileId: meta.fileId,
                        imageUrl: URL.createObjectURL(file), // preview only — never persisted
                        gardnerGrade: ''
                    } as IBlastocystImage;
                })
            );
            const existing = (assessmentData.blastoCystAssessment.images || []).map((img: any) =>
                typeof img === 'string' ? ({ imageUrl: img, gardnerGrade: '' } as IBlastocystImage) : (img as IBlastocystImage)
            );
            updateBlastocystSection('images', [...existing, ...uploaded]);
            toast.current?.show({ severity: 'success', summary: 'Uploaded', detail: `${uploaded.length} image(s) uploaded` });
        } catch (error: any) {
            toast.current?.show({ severity: 'error', summary: 'Upload Error', detail: error?.message || 'Failed to upload image' });
        } finally {
            setImageUploading(false);
        }
    };

    const removeImage = (imgIndex: number) => {
        const updatedImages = (assessmentData.blastoCystAssessment.images || []).filter((_: any, i: number) => i !== imgIndex);
        updateBlastocystSection('images', updatedImages);
    };

    const updateImageGardnerGrade = (imgIndex: number, grade: string) => {
        const images = (assessmentData.blastoCystAssessment.images || []).map((img: any) => (typeof img === 'string' ? ({ imageUrl: img, gardnerGrade: '' } as IBlastocystImage) : (img as IBlastocystImage)));
        images[imgIndex] = { ...images[imgIndex], gardnerGrade: grade };
        updateBlastocystSection('images', images);
    };

    // Use shared resolver to ensure correct host for production-served images
    const resolveImageSrc = (imageUrl: string): string => resolveEmbryoImageSrc(imageUrl);

    // Tab navigation
    const handleNextTab = () => {
        if (activeIndex < 3) {
            setActiveIndex(activeIndex + 1);
        }
    };

    const handlePreviousTab = () => {
        if (activeIndex > 0) {
            setActiveIndex(activeIndex - 1);
        }
    };

    // Reset Handler
    const handleReset = () => {
        confirmDialog({
            message: 'Are you sure you want to reset all data?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                setAssessmentData(getInitialAssessmentData());
                setActiveIndex(0);
                toast.current?.show({ severity: 'info', summary: 'Reset', detail: 'Form has been reset' });
            }
        });
    };

    const getPartnerFromPatient = (p?: TPatient | null) => {
        if (!p || !p.partner) return null;
        try {
            const partner = typeof p.partner === 'string' ? JSON.parse(p.partner) : p.partner;
            if (partner && typeof partner === 'object') return partner as any;
        } catch {}
        return null;
    };

    // Get patient name
    const getPatientName = (patientId: number) => {
        const patient = patientsList.find((p) => p.patientId === patientId);
        if (!patient) return 'Unknown';
        const partner = getPartnerFromPatient(patient);
        const partnerName = partner ? `${partner.firstName ?? ''} ${partner.lastName ?? ''}`.trim() : '';
        return partnerName ? `${patient.firstName} ${patient.lastName} (${patient.recordNumber}) | Partner: ${partnerName}` : `${patient.firstName} ${patient.lastName} (${patient.recordNumber})`;
    };

    const getPatientById = (patientId?: number | null): TPatient | null => {
        if (!patientId) return null;
        const p = patientsList.find((px) => px.patientId === patientId);
        return p ?? null;
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'IVF Embryo Assessment'
    });

    const printAssessment = (data?: TIVFAssessmentData) => {
        pendingPrintDataRef.current = data ? parseIVFEmbryoData(data) : assessmentData;
        handlePrint();
    };

    // Filtered lists for search functionality
    const filteredPatients = useMemo(() => {
        const q = patientsSearch.trim().toLowerCase();
        if (!q) return patientsList;
        return patientsList.filter((p) => {
            const rn = (p.recordNumber ?? '').toString().toLowerCase();
            const fn = (p.firstName ?? '').toLowerCase();
            const ln = (p.lastName ?? '').toLowerCase();
            return rn.includes(q) || fn.includes(q) || ln.includes(q);
        });
    }, [patientsList, patientsSearch]);

    const filteredAssessments = useMemo(() => {
        const q = assessmentsSearch.trim().toLowerCase();
        if (!q) return savedAssessments;
        return savedAssessments.filter((row) => {
            const recordNumber = ((row as any).recordNumber ?? '').toString().toLowerCase();
            const patientName = getPatientName((row as any).patientId ?? 0).toLowerCase();
            const cycleDate = (() => {
                try {
                    return changeDateFormat(new Date((row as any).dateOfCycle)).toLowerCase();
                } catch {
                    return ((row as any).dateOfCycle ?? '').toString().toLowerCase();
                }
            })();
            const cycleType = Array.isArray((row as any).typeOfIVFCycle) ? ((row as any).typeOfIVFCycle.join(', ') as string).toLowerCase() : ((row as any).typeOfIVFCycle ?? '').toString().toLowerCase();
            const oocytes = ((row as any).numberOfOocytesRetrieved ?? '').toString().toLowerCase();
            return recordNumber.includes(q) || patientName.includes(q) || cycleDate.includes(q) || cycleType.includes(q) || oocytes.includes(q);
        });
    }, [savedAssessments, assessmentsSearch]);

    return (
        <div className="grid p-fluid">
            <Toast ref={toast} />
            <ConfirmDialog />

            {/* Record ART Cycle Outcome */}
            <Dialog
                header="Record ART Cycle Outcome"
                visible={outcomeDialog.open}
                style={{ width: '32rem' }}
                onHide={closeOutcomeDialog}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button label="Cancel" className="p-button-text" onClick={closeOutcomeDialog} disabled={outcomeSubmitting} />
                        <Button label="Save" icon="pi pi-check" onClick={submitOutcome} loading={outcomeSubmitting} />
                    </div>
                }
            >
                <div className="flex flex-column gap-3">
                    <div>
                        <label className="block mb-2 font-medium">Outcome</label>
                        <Dropdown value={outcomeForm.outcome} options={outcomeOptions} onChange={(e) => setOutcomeForm((f) => ({ ...f, outcome: e.value }))} placeholder="Select outcome" className="w-full" />
                    </div>
                    <div>
                        <label className="block mb-2 font-medium">Recorded Date</label>
                        <Calendar value={outcomeForm.recordedDate} onChange={(e) => setOutcomeForm((f) => ({ ...f, recordedDate: (e.value as Date) ?? null }))} dateFormat="yy-mm-dd" showIcon className="w-full" />
                    </div>
                    <div>
                        <label className="block mb-2 font-medium">Notes</label>
                        <InputTextarea value={outcomeForm.notes} onChange={(e) => setOutcomeForm((f) => ({ ...f, notes: e.target.value }))} rows={4} autoResize className="w-full" />
                    </div>
                </div>
            </Dialog>

            {/* Patient Selection Dialog */}
            <Dialog header="Select Patient" visible={showPatientDialog} style={{ width: '50vw' }} onHide={() => setShowPatientDialog(false)}>
                <div className="mb-3">
                    <span className="p-input-icon-left w-full">
                        <i className="pi pi-search" />
                        <InputText placeholder="Search patients by record number or name" value={patientsSearch} onChange={(e) => setPatientsSearch(e.target.value)} className="w-full" />
                    </span>
                </div>
                <DataTable value={filteredPatients} selectionMode="single" onRowClick={(e) => handleSelectPatient(e.data as any)} className="cursor-pointer">
                    <Column field="recordNumber" header="Record Number" />
                    <Column header="Patient Name" body={(rowData: TPatient) => <span>{`${rowData?.firstName} ${rowData?.lastName}`}</span>} />
                    <Column header="Partner" body={(rowData: TPatient) => { const partner = getPartnerFromPatient(rowData); return partner ? <span>{`${partner.firstName ?? ''} ${partner.lastName ?? ''}`.trim() || '—'}</span> : <span className="text-400">—</span>; }} />
                    <Column field="age" header="Age" body={(rowData: TPatient) => <span>{differenceInYears(new Date(), rowData.dateOfBirth)}</span>} />
                </DataTable>
            </Dialog>

            <div className="col-12">
                <Card>
                    <div className="flex align-items-center justify-content-between mb-4">
                        <div>
                            <h3 className="m-0 text-primary">IVF Embryo Assessment</h3>
                            <p className="text-600 m-0">Comprehensive embryology data management system</p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {selectedPatient && <Chip label={`Patient: ${selectedPatient.firstName} ${selectedPatient.lastName} (${selectedPatient.recordNumber})`} icon="pi pi-user" className="bg-blue-100 text-blue-900" />}
                            {selectedPatient && (() => { const partner = getPartnerFromPatient(selectedPatient); return partner ? <Chip label={`Partner: ${partner.firstName ?? ''} ${partner.lastName ?? ''}`.trim()} icon="pi pi-users" className="bg-yellow-100 text-yellow-900" /> : null; })()}
                            <Chip label="Embryology Lab" icon="pi pi-flask" className="bg-primary" />
                        </div>
                    </div>

                    {/* Printable content (offscreen) - separate component */}
                    <div style={{ position: 'absolute', top: -10000, left: -10000 }}>
                        <IVFEmbryoPrint ref={printRef} data={printData ?? assessmentData} patientsList={patientsList} selectedPatient={selectedPatient} />
                    </div>

                    {/* List View */}
                    {viewMode === 'list' && (
                        <>
                            <div className="flex justify-content-between align-items-center mb-3 gap-3 flex-wrap">
                                <h4 className="m-0">Saved Assessments</h4>
                                <div className="flex align-items-center gap-2">
                                    <span className="p-input-icon-left">
                                        <i className="pi pi-search" />
                                        <InputText placeholder="Search assessments" value={assessmentsSearch} onChange={(e) => setAssessmentsSearch(e.target.value)} />
                                    </span>
                                    <Button label="New Assessment" icon="pi pi-plus" onClick={handleNewAssessment} className="w-fit" />
                                </div>
                            </div>

                            <DataTable value={filteredAssessments} paginator rows={10} emptyMessage="No assessments found" loading={isLoading}>
                                <Column field="recordNumber" header="Record Number" />
                                <Column field="userId" header="Patient" body={(rowData: TPatient) => getPatientName(rowData.patientId)} />
                                <Column field="dateOfCycle" header="Cycle Date" body={(rowData) => changeDateFormat(new Date(rowData.dateOfCycle))} />
                                <Column field="typeOfIVFCycle" header="Cycle Type" body={(rowData) => rowData.typeOfIVFCycle.join(', ') || '-'} />
                                <Column field="numberOfOoctytesRetrieved" header="Oocytes" body={(rowData: TIVFAssessmentData) => rowData.numberOfOocytesRetrieved || '-'} />
                                <Column
                                    header="Actions"
                                    body={(rowData: TIVFAssessmentData) => (
                                        <div className="flex gap-2">
                                            <Button icon="pi pi-print" className="p-button-rounded p-button-text p-button-help" onClick={() => printAssessment(rowData)} tooltip="Print" />
                                            <Button icon="pi pi-pencil" className="p-button-rounded p-button-text" onClick={() => handleEditAssessment(rowData)} tooltip="Edit" />
                                            <Button icon="pi pi-flag" className="p-button-rounded p-button-text p-button-success" onClick={() => openOutcomeDialog(rowData)} tooltip="Record Outcome" />
                                            <Button icon="pi pi-trash" className="p-button-rounded p-button-text p-button-danger" onClick={() => handleDeleteAssessment(rowData.ivfEmbryoAssessmentId!)} tooltip="Delete" />
                                        </div>
                                    )}
                                />
                            </DataTable>
                        </>
                    )}

                    {/* Form View */}
                    {viewMode === 'form' && (
                        <>
                            <div className="flex justify-content-between align-items-center mb-3">
                                <Button
                                    label="Back to List"
                                    icon="pi pi-arrow-left"
                                    onClick={() => {
                                        setViewMode('list');
                                        setSelectedAssessment(null);
                                    }}
                                    className="p-button-text"
                                />
                                {selectedAssessment && <Chip label="Editing Assessment" icon="pi pi-pencil" className="bg-orange-100 text-orange-900 lg:w-2" />}
                            </div>

                            {/* Partner Info Banner */}
                            {selectedPatient && (() => {
                                const partner = getPartnerFromPatient(selectedPatient);
                                if (!partner) return null;
                                const partnerName = `${partner.firstName ?? ''} ${partner.lastName ?? ''}`.trim();
                                return (
                                    <div className="mb-3 p-2 border-round bg-yellow-50 text-800" style={{ border: '1px dashed var(--yellow-400)' }}>
                                        <i className="pi pi-users mr-2 text-yellow-700"></i>
                                        <strong>Male Partner:</strong> {partnerName || 'Unnamed'}
                                        {partner.phone && <span className="ml-2 text-600">• {partner.phone}</span>}
                                        {partner.email && <span className="ml-2 text-600">• {partner.email}</span>}
                                    </div>
                                );
                            })()}

                            {/* IVF Cycle Information */}
                            <Panel header="IVF Cycle Information" className="mb-3">
                                <div className="formgrid grid">
                                    <div className="field col-12 md:col-4">
                                        <label htmlFor="dateOfCycle" className="font-semibold">
                                            Date of Cycle <span className="text-red-500">*</span>
                                        </label>
                                        <Calendar
                                            id="dateOfCycle"
                                            value={assessmentData.dateOfCycle ? new Date(assessmentData.dateOfCycle) : null}
                                            onChange={(e) => updateCycleInfo('dateOfCycle', e.value?.toISOString().split('T')[0])}
                                            showIcon
                                            dateFormat="yy-mm-dd"
                                        />
                                    </div>

                                    <div className="field col-12 md:col-4">
                                        <label htmlFor="typeOfIVFCycle" className="font-semibold">
                                            Type of IVF Cycle <span className="text-red-500">*</span>
                                        </label>
                                        <MultiSelect options={ivfCycleTypes} onChange={(e) => updateCycleInfo('typeOfIVFCycle', e.value)} value={assessmentData.typeOfIVFCycle} display="chip" placeholder="Select cycle types" />
                                    </div>

                                    <div className="field col-12 md:col-4">
                                        <label htmlFor="numberOfOocytes" className="font-semibold">
                                            Number of Oocytes Retrieved <span className="text-red-500">*</span>
                                        </label>
                                        <InputNumber id="numberOfOocytes" value={assessmentData.numberOfOocytesRetrieved} onValueChange={(e) => updateCycleInfo('numberOfOocytesRetrieved', e.value)} min={0} showButtons />
                                    </div>
                                </div>
                            </Panel>

                            {/* Tabbed Sections */}
                            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                                {/* Fertilization Assessment Tab */}
                                <TabPanel header="Fertilization Assessment" leftIcon="pi pi-circle mr-2">
                                    <div className="mb-3">
                                        <div className="flex justify-content-between align-items-center mb-3">
                                            <h4 className="m-0">Zygote Information</h4>
                                            <Button label="Add Zygote" icon="pi pi-plus" onClick={addZygote} className="p-button-sm w-fit" />
                                        </div>

                                        <DataTable value={assessmentData.fertilizationAssessment.zygoteInfo} responsiveLayout="scroll">
                                            <Column
                                                field="zygoteNumber"
                                                header="No. Of Zygotes"
                                                body={(rowData, options) => <InputText value={rowData.zygoteNumber} onChange={(e) => updateZygote(options.rowIndex, 'zygoteNumber', e.target.value)} placeholder="Z-01" />}
                                            />
                                            <Column
                                                field="time"
                                                header="Date & Time"
                                                body={(rowData, options) => (
                                                    <Calendar value={rowData.time ? new Date(rowData.time) : null} onChange={(e) => updateZygote(options.rowIndex, 'time', e.value?.toISOString())} showTime hourFormat="24" showIcon />
                                                )}
                                            />
                                            <Column
                                                field="pronuclei"
                                                header="Pronuclei"
                                                body={(rowData, options) => (
                                                    <Dropdown
                                                        value={rowData.pronuclei}
                                                        options={proNucleiOptions.map((opt) => ({ label: opt, value: opt }))}
                                                        onChange={(e) => updateZygote(options.rowIndex, 'pronuclei', e.value)}
                                                        placeholder="Select"
                                                    />
                                                )}
                                            />
                                            <Column
                                                field="polarBodies"
                                                header="Polar Bodies"
                                                body={(rowData, options) => (
                                                    <Dropdown
                                                        value={rowData.polarBodies}
                                                        options={polarBodyOptions.map((opt) => ({ label: opt, value: opt }))}
                                                        onChange={(e) => updateZygote(options.rowIndex, 'polarBodies', e.value)}
                                                        placeholder="Select"
                                                    />
                                                )}
                                            />
                                            <Column
                                                body={(rowData, options) => (
                                                    <Button
                                                        icon="pi pi-trash"
                                                        className="p-button-rounded p-button-danger p-button-text"
                                                        onClick={() => removeZygote(options.rowIndex)}
                                                        disabled={assessmentData.fertilizationAssessment.zygoteInfo.length === 1}
                                                    />
                                                )}
                                            />
                                        </DataTable>
                                    </div>

                                    <div className="field">
                                        <label htmlFor="fertilizationNotes" className="font-semibold">
                                            Embryologist Notes
                                        </label>
                                        <InputTextarea
                                            id="fertilizationNotes"
                                            value={assessmentData.fertilizationAssessment.embryologistNotes}
                                            onChange={(e) =>
                                                setAssessmentData((prev) => ({
                                                    ...prev,
                                                    fertilizationAssessment: {
                                                        ...prev.fertilizationAssessment,
                                                        embryologistNotes: e.target.value
                                                    }
                                                }))
                                            }
                                            rows={3}
                                            placeholder="Enter observations and notes..."
                                        />
                                    </div>
                                </TabPanel>

                                {/* Blastocyst Assessment Tab */}
                                <TabPanel header="Blastocyst Assessment" leftIcon="pi pi-circle mr-2">
                                    <div className="mb-3">
                                        <div className="flex justify-content-between align-items-center mb-3">
                                            <h4 className="m-0">Blastocyst Development</h4>
                                            <Button label="Add Blastocyst" icon="pi pi-plus" onClick={addBlastocyst} className="p-button-sm w-fit" />
                                        </div>

                                        {assessmentData.blastoCystAssessment.blastocysts.map((blast, index) => (
                                            <Card key={index} className="mb-3">
                                                <div className="formgrid grid">
                                                    <div className="field col-12 md:col-2">
                                                        <label className="font-semibold">No. of Blastocyst</label>
                                                        <InputText value={blast.blastocystNumber} onChange={(e) => updateBlastocyst(index, 'blastocystNumber', e.target.value)} placeholder="0" />
                                                    </div>
                                                    <div className="field col-12 md:col-2">
                                                        <label className="font-semibold">Day</label>
                                                        <Dropdown value={blast.day} options={dayOptions.map((day) => ({ label: day, value: day }))} onChange={(e) => updateBlastocyst(index, 'day', e.value)} />
                                                    </div>
                                                    <div className="field col-12 md:col-3">
                                                        <label className="font-semibold">Date & Time</label>
                                                        <Calendar value={blast.time ? new Date(blast.time) : null} onChange={(e) => updateBlastocyst(index, 'time', e.value?.toISOString())} showTime hourFormat="24" showIcon />
                                                    </div>
                                                    <div className="field col-12 md:col-2">
                                                        <label className="font-semibold">Gardner Grade</label>
                                                        <Dropdown value={blast.gardnerGrade} options={gardnerGrades} onChange={(e) => updateBlastocyst(index, 'gardnerGrade', e.value)} placeholder="Select Grade" filter />
                                                    </div>
                                                    <div className="field col-12 md:col-2 pt-5">
                                                        <Button
                                                            label="Remove Blastocyst"
                                                            icon="pi pi-trash"
                                                            className="p-button-danger p-button-sm w-fit"
                                                            onClick={() => removeBlastocyst(index)}
                                                            disabled={assessmentData.blastoCystAssessment.blastocysts.length === 1}
                                                        />
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}

                                        <Divider />

                                        {/* Overall Assessment Notes and Images */}
                                        <Panel header="Overall Blastocyst Assessment" className="mt-3">
                                            <div className="formgrid grid">
                                                <div className="field col-12">
                                                    <label htmlFor="blastocystNotes" className="font-semibold">
                                                        Embryologist Notes
                                                    </label>
                                                    <InputTextarea
                                                        id="blastocystNotes"
                                                        value={assessmentData.blastoCystAssessment.embryologistNotes}
                                                        onChange={(e) => updateBlastocystSection('embryologistNotes', e.target.value)}
                                                        rows={3}
                                                        placeholder="Enter overall observations and notes for all blastocysts..."
                                                    />
                                                </div>

                                                <div className="field col-12">
                                                    <label className="font-semibold">Assessment Images</label>
                                                    <div className="flex align-items-center gap-2 mb-2">
                                                        <FileUpload mode="basic" name="blastocystImages" accept="image/*" multiple auto customUpload uploadHandler={handleImageUpload} chooseLabel="Add Image(s)" className="p-button-sm" />
                                                    </div>
                                                    {assessmentData.blastoCystAssessment.images && assessmentData.blastoCystAssessment.images.length > 0 && (
                                                        <div className="grid mt-3">
                                                            {assessmentData.blastoCystAssessment.images.map((img: any, imgIndex: number) => {
                                                                const imageObj: IBlastocystImage = typeof img === 'string' ? { imageUrl: img, gardnerGrade: '' } : (img as IBlastocystImage);

                                                                return (
                                                                    <div key={imgIndex} className="col-12 md:col-4">
                                                                        <div className="p-2 border-1 surface-border border-round">
                                                                            <div className="relative mb-2">
                                                                                <Image src={resolveImageSrc(imageObj.imageUrl)} alt={`Assessment Image ${imgIndex + 1}`} width="100%" preview />
                                                                                <Button
                                                                                    icon="pi pi-times"
                                                                                    className="p-button-rounded p-button-danger p-button-sm absolute"
                                                                                    style={{ top: '5px', right: '5px' }}
                                                                                    onClick={() => removeImage(imgIndex)}
                                                                                    tooltip="Remove"
                                                                                />
                                                                            </div>
                                                                            <div className="field m-0">
                                                                                <label className="font-semibold text-sm">Gardner Grade</label>
                                                                                <Dropdown
                                                                                    value={imageObj.gardnerGrade}
                                                                                    options={gardnerGrades}
                                                                                    onChange={(e) => updateImageGardnerGrade(imgIndex, e.value)}
                                                                                    placeholder="Select Grade"
                                                                                    filter
                                                                                    className="w-full"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Panel>
                                    </div>
                                </TabPanel>

                                {/* Embryo Transfer Tab */}
                                <TabPanel header="Embryo Transfer" leftIcon="pi pi-share-alt mr-2">
                                    <div className="formgrid grid">
                                        <div className="field col-12 md:col-3">
                                            <label className="font-semibold">Transfer Date</label>
                                            <Calendar
                                                value={assessmentData.embryoTransfer.transferDate ? new Date(assessmentData.embryoTransfer.transferDate) : null}
                                                onChange={(e) => updateEmbryoTransfer('transferDate', e.value?.toISOString().split('T')[0])}
                                                showIcon
                                                dateFormat="yy-mm-dd"
                                            />
                                        </div>
                                        <div className="field col-12 md:col-3">
                                            <label className="font-semibold">Day of Transfer</label>
                                            <Dropdown value={assessmentData.embryoTransfer.dateOfTransfer} options={dayOptions.map((day) => ({ label: day, value: day }))} onChange={(e) => updateEmbryoTransfer('dateOfTransfer', e.value)} />
                                        </div>
                                        <div className="field col-12 md:col-3">
                                            <label className="font-semibold">Day Toured</label>
                                            <InputText value={assessmentData.embryoTransfer.dayToured} onChange={(e) => updateEmbryoTransfer('dayToured', e.target.value)} placeholder="B-03,B-05" />
                                        </div>
                                        <div className="field col-12 md:col-3">
                                            <label className="font-semibold">Number Transferred</label>
                                            <InputNumber value={assessmentData.embryoTransfer.numberTransferred} onChange={(e) => updateEmbryoTransfer('numberTransferred', e.value)} placeholder="Number Transferred" min={0} showButtons />
                                        </div>
                                        <div className="field col-12">
                                            <label className="font-semibold">Transfer Notes</label>
                                            <InputTextarea value={assessmentData.embryoTransfer.notes} onChange={(e) => updateEmbryoTransfer('notes', e.target.value)} rows={3} placeholder="Details about the transfer procedure..." />
                                        </div>
                                    </div>
                                </TabPanel>

                                {/* Cryopreservation Tab */}
                                <TabPanel header="Cryopreservation" leftIcon="pi pi-box mr-2">
                                    <div className="formgrid grid">
                                        <div className="field col-12 md:col-4">
                                            <label className="font-semibold">Cryopreservation Date</label>
                                            <Calendar
                                                value={assessmentData.cryoPreservation.cryoDate ? new Date(assessmentData.cryoPreservation.cryoDate) : null}
                                                onChange={(e) => updateCryoPreservation('cryoDate', e.value?.toISOString().split('T')[0])}
                                                showIcon
                                                dateFormat="yy-mm-dd"
                                            />
                                        </div>
                                        <div className="field col-12 md:col-4">
                                            <label className="font-semibold">Day of Cryopreservation</label>
                                            <Dropdown value={assessmentData.cryoPreservation.dayOfCryo} options={dayOptions.map((day) => ({ label: day, value: day }))} onChange={(e) => updateCryoPreservation('dayOfCryo', e.value)} />
                                        </div>
                                        <div className="field col-12 md:col-4">
                                            <label className="font-semibold">Embryo IDs</label>
                                            <InputText value={assessmentData.cryoPreservation.embryoIds} onChange={(e) => updateCryoPreservation('embryoIds', e.target.value)} placeholder="B-02,B-06" />
                                        </div>
                                        <div className="field col-12 md:col-4">
                                            <label className="font-semibold">Cryopreservation Method</label>
                                            <Dropdown value={assessmentData.cryoPreservation.method} options={cryoMethodOptions.map((method) => ({ label: method, value: method }))} onChange={(e) => updateCryoPreservation('method', e.value)} />
                                        </div>
                                        <div className="field col-12 md:col-4">
                                            <label className="font-semibold">Storage Location</label>
                                            <InputText value={assessmentData.cryoPreservation.storageLocation} onChange={(e) => updateCryoPreservation('storageLocation', e.target.value)} placeholder="CryoTank A - Slot 5" />
                                        </div>
                                        <div className="field col-12 md:col-4">
                                            <label className="font-semibold">Number Preserved</label>
                                            <InputNumber value={assessmentData.cryoPreservation.numberPreserved} onChange={(e) => updateCryoPreservation('numberPreserved', e.value)} placeholder="Number Preserved" />
                                        </div>
                                    </div>
                                </TabPanel>
                            </TabView>

                            <Divider />

                            {/* Tab Navigation and Action Buttons */}
                            <div className="flex justify-content-between">
                                <div className="flex gap-2">
                                    <Button label="Previous" icon="pi pi-chevron-left" onClick={handlePreviousTab} disabled={activeIndex === 0} className="p-button-outlined" />
                                    <Button label="Next" icon="pi pi-chevron-right" iconPos="right" onClick={handleNextTab} disabled={activeIndex === 3} className="p-button-outlined" />
                                </div>
                                <div className="flex gap-2">
                                    <Button label="Reset" icon="pi pi-refresh" onClick={handleReset} className="p-button-outlined p-button-danger" />
                                    <Button label="Print PDF" icon="pi pi-print" onClick={() => printAssessment(assessmentData)} className="p-button-help" />
                                    <Button
                                        label="Cancel"
                                        icon="pi pi-times"
                                        onClick={() => {
                                            setViewMode('list');
                                            setSelectedAssessment(null);
                                        }}
                                        className="p-button-outlined"
                                    />
                                    <Button label={crudType === CRUDTYPE.save ? 'Save Assessment' : 'Update Assessment'} icon="pi pi-check" onClick={handleSubmit} className="p-button-success w-full" loading={isLoading} disabled={isLoading} />
                                </div>
                            </div>
                        </>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default IVFEmbryoAssessment;
