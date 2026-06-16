'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { ProgressBar } from 'primereact/progressbar';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Dialog } from 'primereact/dialog';
import { FileUpload } from 'primereact/fileupload';
import { AutoComplete } from 'primereact/autocomplete';
import { Avatar } from 'primereact/avatar';
import { GeneralPageProps } from '@/libs/utilityComponents';
import { displayMessage, pageDataValidation } from '@/libs/utils';
import { validateProcedureConsultation } from '@/libs/joiValidations';
import PatientsModel from '@/libs/blue_prints/Patients';
import proceduresService from '@/libs/blue_prints/ProceduresService';
import { TPatient } from '@/types/hospital';
import { ProcedureConsultationProvider, useProcedureContext } from '@/app/(main)/hospital/procedures/consultation/ProcedureConsultationContext';
import PreProcedureInstructions from '@/app/(main)/hospital/procedures/consultation/component/PreProcedureInstructions';
import InformedConsent from '@/app/(main)/hospital/procedures/consultation/component/InformedConsent';
import PreProcedureAssessment from '@/app/(main)/hospital/procedures/consultation/component/PreProcedureAssessment';
import ProcedureDetails from '@/app/(main)/hospital/procedures/consultation/component/ProcedureDetails';

const ProcedureConsultationContent: React.FC = () => {
    const { state, setStateValue, updateProcedureDetails, getCompletionPercentage, canProceedToNext } = useProcedureContext();
    const toast = useRef(null);
    const [patients, setPatients] = useState<TPatient[]>([]);
    const [filteredPatients, setFilteredPatients] = useState<TPatient[]>([]);
    const [patientSearch, setPatientSearch] = useState<TPatient | string>('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const loadPatients = async () => {
            try {
                const patientsApi = new PatientsModel();
                const rows = await patientsApi.getAllPatients();
                setPatients(rows);
            } catch (err) {
                console.error('Failed to load patients', err);
            }
        };
        loadPatients();
    }, []);

    const searchPatients = (event: { query: string }) => {
        const query = event.query.toLowerCase();
        const queried = patients.filter(
            (p) => p.firstName.toLowerCase().includes(query) || p.lastName.toLowerCase().includes(query) || p.recordNumber?.toLowerCase().includes(query)
        );
        setFilteredPatients(queried);
    };

    const onPatientSelect = (patient: TPatient) => {
        setStateValue({ patientId: patient.patientId });
        updateProcedureDetails({ patientId: patient.patientId });
    };

    const steps = [
        {
            label: 'Procedure Details',
            icon: 'pi pi-cog',
            description: 'Define procedure type',
            component: <ProcedureDetails />
        },
        {
            label: 'Assessment',
            icon: 'pi pi-check-square',
            description: 'Medical evaluation',
            component: <PreProcedureAssessment />
        },
        {
            label: 'Informed Consent',
            icon: 'pi pi-verified',
            description: 'PatientExtra consent',
            component: <InformedConsent />
        },
        {
            label: 'Instructions',
            icon: 'pi pi-list',
            description: 'Pre-procedure prep',
            component: <PreProcedureInstructions />
        }
    ];

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

    const handleComplete = async () => {
        const plannedProcedure = state.procedureDetails.procedureType || '';
        const payload = {
            patientId: state.patientId,
            visitId: null,
            plannedProcedure,
            procedureDetails: state.procedureDetails,
            assessment: state.preProcedureAssessment,
            consent: state.informedConsent,
            instructions: state.preProcedureInstructions,
            // Module 16: populated below if the clinician captured a signature
            // on the canvas. The Blob is posted to the central upload pipeline
            // and we only persist the returned fileId.
            consentSignatureFileId: null as string | null
        };

        try {
            setSubmitting(true);

            const signatureDataUrl = state.informedConsent.signatureDataUrl;
            if (signatureDataUrl && signatureDataUrl.startsWith('data:image')) {
                try {
                    const blob = await (await fetch(signatureDataUrl)).blob();
                    const file = new File([blob], 'signature.png', { type: blob.type || 'image/png' });
                    const { uploadFileMultipart } = await import('@/libs/blue_prints/IVFEmbryoService');
                    const meta = await uploadFileMultipart('consent-signature', file);
                    payload.consentSignatureFileId = meta?.fileId ?? null;
                } catch (uploadErr: any) {
                    displayMessage({
                        toastComponent: toast,
                        header: 'Signature upload failed',
                        message: uploadErr?.message || 'Could not upload patient signature',
                        infoType: 'error',
                        life: 4000
                    });
                    setSubmitting(false);
                    return;
                }
            }

            if (!pageDataValidation(validateProcedureConsultation, payload, toast)) {
                setSubmitting(false);
                return;
            }

            const res = await proceduresService.createConsultation(payload);
            if (res.status >= 200 && res.status < 300) {
                displayMessage({
                    toastComponent: toast,
                    header: 'Success',
                    message: 'Procedure consultation saved',
                    infoType: 'success',
                    life: 3000
                });
                // Reset wizard
                setStateValue({
                    currentStep: 0,
                    patientId: 0
                });
                setPatientSearch('');
            } else {
                displayMessage({
                    toastComponent: toast,
                    header: 'Error',
                    message: 'Failed to save consultation',
                    infoType: 'error',
                    life: 3000
                });
            }
        } catch (err: any) {
            displayMessage({
                toastComponent: toast,
                header: 'Error',
                message: err?.message || 'Failed to save consultation',
                infoType: 'error',
                life: 3000
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleScheduleProcedure = () => {
        console.log('Schedule procedure:', state);
        // Navigate to scheduling component
    };

    const handlePrintInstructions = () => {
        console.log('Print instructions for:', state.procedureDetails.procedureType);
        // Generate printable instructions
    };

    return (
        <div className="grid p-fluid">
            <GeneralPageProps toastRef={toast} toastPosition="top-right" />
            {/* Progress Header */}
            <div className="col-12">
                <Card className="shadow-3">
                    <div className="flex align-items-center justify-content-between mb-4">
                        <div>
                            <h3 className="m-0 text-primary">Procedure Consultation</h3>
                            <p className="text-600 m-0">Comprehensive pre-procedure assessment and consent documentation</p>
                        </div>
                        <div className="text-right">
                            <div className="flex align-items-center gap-2 mb-2">
                                <Tag value={`Step ${state.currentStep + 1} of ${steps.length}`} severity="info" className="text-lg" />
                                <div className="text-sm text-500">{getCompletionPercentage()}% Complete</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid mb-3">
                        <div className="col-12 md:col-6">
                            <label htmlFor="patient" className="block mb-2 font-semibold">
                                Select Patient *
                            </label>
                            <AutoComplete
                                id="patient"
                                value={patientSearch}
                                suggestions={filteredPatients}
                                completeMethod={searchPatients}
                                field="firstName"
                                onChange={(e) => setPatientSearch(e.value)}
                                onSelect={(e) => onPatientSelect(e.value)}
                                placeholder="Search patient by name or record number..."
                                className="w-full"
                                itemTemplate={(item: TPatient) => (
                                    <div className="flex align-items-center gap-2">
                                        <Avatar label={`${item.firstName.charAt(0)}${item.lastName.charAt(0)}`} shape="circle" className="bg-primary" />
                                        <div>
                                            <div className="font-bold">{`${item.firstName} ${item.lastName}`}</div>
                                            <div className="text-sm text-600">ID: {item.recordNumber}</div>
                                        </div>
                                    </div>
                                )}
                                dropdown
                            />
                        </div>
                        {state.patientId > 0 && typeof patientSearch !== 'string' && (
                            <div className="col-12 md:col-6 flex align-items-end">
                                <Tag value={`Selected: ${(patientSearch as TPatient).firstName} ${(patientSearch as TPatient).lastName} (${(patientSearch as TPatient).recordNumber})`} severity="success" />
                            </div>
                        )}
                    </div>

                    <ProgressBar value={getCompletionPercentage()} className="mb-4" style={{ height: '14px' }} />

                    <div className="grid">
                        {steps.map((step, index) => (
                            <div key={index} className="col-12 md:col">
                                <div
                                    className={`text-center p-3 border-round-md transition-colors transition-duration-300 cursor-pointer ${
                                        index === state.currentStep ? 'bg-primary text-white shadow-3' : index < state.currentStep ? 'bg-green-100 text-green-800 border-1 border-green-300' : 'bg-gray-50 text-600 border-1 border-gray-300'
                                    }`}
                                    onClick={() => setStateValue({ currentStep: index })}
                                >
                                    <div className="flex flex-column align-items-center gap-2">
                                        <i className={`${step.icon} text-2xl`} />
                                        <div>
                                            <div className="font-bold">{step.label}</div>
                                            <small className="opacity-80">{step.description}</small>
                                        </div>
                                        {index < state.currentStep && <i className="pi pi-check-circle text-lg" />}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Main Content */}
            <div className="col-12">
                {steps[state.currentStep].component}

                <Divider />

                {/* Navigation */}
                <div className="flex justify-content-between align-items-center">
                    <Button label="Previous" icon="pi pi-chevron-left" onClick={prevStep} disabled={state.currentStep === 0} className="p-button-outlined w-fit" size="small" />

                    <div className="flex gap-3">
                        <Button label="Save Draft" icon="pi pi-save" className="p-button-outlined w-fit" size="small" />

                        <Button label="Print Instructions" icon="pi pi-print" className="p-button-outlined w-fit" size="small" onClick={handlePrintInstructions} />

                        {state.currentStep === steps.length - 1 ? (
                            <div className="flex gap-2">
                                <Button label="Schedule Procedure" icon="pi pi-calendar-plus" className="p-button-success" size="small" onClick={handleScheduleProcedure} disabled={getCompletionPercentage() < 80} />
                                <Button
                                    label="Complete Consultation"
                                    icon="pi pi-check"
                                    className="p-button-primary w-fit"
                                    size="small"
                                    onClick={handleComplete}
                                    loading={submitting}
                                    disabled={submitting || state.patientId === 0 || state.informedConsent.consentStatus !== 'Obtained'}
                                />
                            </div>
                        ) : (
                            <Button label="Next" icon="pi pi-chevron-right" iconPos="right" onClick={nextStep} disabled={!canProceedToNext()} size="small" className="w-fit" />
                        )}
                    </div>
                </div>
            </div>

            {/* File Upload Dialog */}
            <Dialog header={`Upload File for ${state.uploadingFor}`} visible={state.showFileUpload} onHide={() => setStateValue({ showFileUpload: false })} style={{ width: '50vw' }} modal>
                <FileUpload mode="advanced" name="reportFile" multiple={false} accept="image/*,application/pdf" maxFileSize={5000000} emptyTemplate={<p className="text-center">Drag and drop files here or click to browse.</p>} />
            </Dialog>
        </div>
    );
};

const ProcedureConsultation: React.FC = () => {
    return (
        <ProcedureConsultationProvider>
            <ProcedureConsultationContent />
        </ProcedureConsultationProvider>
    );
};

export default ProcedureConsultation;
