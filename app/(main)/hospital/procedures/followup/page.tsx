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
import { Dropdown } from 'primereact/dropdown';
import { GeneralPageProps } from '@/libs/utilityComponents';
import { displayMessage, pageDataValidation } from '@/libs/utils';
import { validateProcedureFollowup } from '@/libs/joiValidations';
import PatientsModel from '@/libs/blue_prints/Patients';
import proceduresService from '@/libs/blue_prints/ProceduresService';
import { TPatient, TProcedureConsultation } from '@/types/hospital';
import ChiefComplaintFollowUp from './components/ChiefComplaintFollowUp';
import PostProcedureSymptoms from './components/PostProcedureSymptoms';
import RecoveryAssessment from './components/RecoveryAssessment';
import ComplicationAssessment from './components/ComplicationAssessment';
import ProcedureOutcome from './components/ProcedureOutcome';
import FutureCarePlan from './components/FutureCarePlan';
import { FollowUpVisitProvider, useFollowUpContext } from '@/app/(main)/hospital/procedures/followup/components/FollowUpProvider';

const FollowUpVisitContent: React.FC = () => {
    const { state, setStateValue, getCompletionPercentage, canProceedToNext } = useFollowUpContext();
    const toast = useRef(null);
    const [patients, setPatients] = useState<TPatient[]>([]);
    const [filteredPatients, setFilteredPatients] = useState<TPatient[]>([]);
    const [patientSearch, setPatientSearch] = useState<TPatient | string>('');
    const [consultations, setConsultations] = useState<TProcedureConsultation[]>([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const loadPatients = async () => {
            try {
                const patientsApi = new PatientsModel();
                const response = await patientsApi.getPatientsList({ pageSize: 200 });
                setPatients(response.rows || []);
            } catch (err) {
                console.error('Failed to load patients', err);
            }
        };
        loadPatients();
    }, []);

    useEffect(() => {
        const loadConsultations = async () => {
            if (!state.patientId) {
                setConsultations([]);
                return;
            }
            try {
                const res = await proceduresService.getPatientConsultations(state.patientId);
                setConsultations(res.operatedData || []);
            } catch (err) {
                console.error('Failed to load consultations', err);
                setConsultations([]);
            }
        };
        loadConsultations();
    }, [state.patientId]);

    const searchPatients = (event: { query: string }) => {
        const query = event.query.toLowerCase();
        const queried = patients.filter(
            (p) => p.firstName.toLowerCase().includes(query) || p.lastName.toLowerCase().includes(query) || p.recordNumber?.toLowerCase().includes(query)
        );
        setFilteredPatients(queried);
    };

    const onPatientSelect = (patient: TPatient) => {
        setStateValue({ patientId: patient.patientId, consultationId: 0 });
    };

    const steps = [
        {
            label: 'Visit Assessment',
            icon: 'pi pi-history',
            description: 'Follow-up purpose',
            component: <ChiefComplaintFollowUp />
        },
        {
            label: 'Symptoms Review',
            icon: 'pi pi-heart',
            description: 'Post-procedure symptoms',
            component: <PostProcedureSymptoms />
        },
        {
            label: 'Recovery Status',
            icon: 'pi pi-chart-line',
            description: 'Recovery assessment',
            component: <RecoveryAssessment />
        },
        {
            label: 'Complications',
            icon: 'pi pi-exclamation-triangle',
            description: 'Complication screening',
            component: <ComplicationAssessment />
        },
        {
            label: 'Procedure Outcome',
            icon: 'pi pi-chart-bar',
            description: 'Results evaluation',
            component: <ProcedureOutcome />
        },
        {
            label: 'Future Care Plan',
            icon: 'pi pi-calendar-plus',
            description: 'Ongoing care plan',
            component: <FutureCarePlan />
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
        const payload = {
            consultationId: state.consultationId,
            patientId: state.patientId,
            symptoms: state.postProcedureSymptoms,
            recovery: state.recoveryAssessment,
            complications: state.complicationAssessment,
            outcome: state.procedureOutcome?.overallOutcome ?? null,
            notes: state.chiefComplaint || null
        };

        if (!pageDataValidation(validateProcedureFollowup, payload, toast)) return;

        try {
            setSubmitting(true);
            const res = await proceduresService.createFollowup(payload);
            if (res.status >= 200 && res.status < 300) {
                displayMessage({
                    toastComponent: toast,
                    header: 'Success',
                    message: 'Follow-up saved',
                    infoType: 'success',
                    life: 3000
                });
                setStateValue({ currentStep: 0, patientId: 0, consultationId: 0 });
                setPatientSearch('');
                setConsultations([]);
            } else {
                displayMessage({
                    toastComponent: toast,
                    header: 'Error',
                    message: 'Failed to save follow-up',
                    infoType: 'error',
                    life: 3000
                });
            }
        } catch (err: any) {
            displayMessage({
                toastComponent: toast,
                header: 'Error',
                message: err?.message || 'Failed to save follow-up',
                infoType: 'error',
                life: 3000
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleScheduleNext = () => {
        console.log('Schedule next appointment:', state.futureCarePlan.nextAppointmentDate);
        // Navigate to scheduling component
    };

    const handlePrintReport = () => {
        console.log('Print follow-up report');
        // Generate printable report
    };

    const getDaysSinceProcedure = () => {
        const diffTime = Math.abs(new Date().getTime() - state.procedureReference.procedureDate.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const consultationOptions = consultations.map((c) => ({
        label: `#${c.consultationId} — ${c.plannedProcedure} (${new Date(c.createdAt).toLocaleDateString()})`,
        value: c.consultationId
    }));

    return (
        <div className="grid">
            <GeneralPageProps toastRef={toast} toastPosition="top-right" />
            {/* Progress Header */}
            <div className="col-12">
                <Card className="shadow-3">
                    <div className="flex align-items-center justify-content-between mb-4">
                        <div>
                            <h3 className="m-0 text-primary">Procedure Follow-up Visit</h3>
                            <p className="text-600 m-0">
                                Post-procedure assessment for {state.procedureReference.procedureType}({getDaysSinceProcedure()} days post-procedure)
                            </p>
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
                        <div className="col-12 md:col-6">
                            <label htmlFor="consultation" className="block mb-2 font-semibold">
                                Parent Consultation *
                            </label>
                            <Dropdown
                                id="consultation"
                                value={state.consultationId || null}
                                options={consultationOptions}
                                onChange={(e) => setStateValue({ consultationId: e.value })}
                                placeholder={state.patientId ? (consultations.length ? 'Select a consultation' : 'No consultations for patient') : 'Select a patient first'}
                                disabled={!state.patientId || consultations.length === 0}
                                className="w-full"
                            />
                        </div>
                    </div>

                    <ProgressBar value={getCompletionPercentage()} className="mb-4" style={{ height: '14px' }} />

                    <div className="grid">
                        {steps.map((step, index) => (
                            <div key={index} className="col-12 md:col-2">
                                <div
                                    className={`text-center p-3 border-round-md transition-colors transition-duration-300 cursor-pointer ${
                                        index === state.currentStep ? 'bg-primary text-white shadow-3' : index < state.currentStep ? 'bg-green-100 text-green-800 border-1 border-green-300' : 'bg-gray-50 text-600 border-1 border-gray-300'
                                    }`}
                                    onClick={() => setStateValue({ currentStep: index })}
                                >
                                    <div className="flex flex-column align-items-center gap-2">
                                        <i className={`${step.icon} text-2xl`} />
                                        <div>
                                            <div className="font-bold text-sm">{step.label}</div>
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
                    <Button label="Previous" icon="pi pi-chevron-left" onClick={prevStep} disabled={state.currentStep === 0} className="p-button-outlined" size="large" />

                    <div className="flex gap-3">
                        <Button label="Save Draft" icon="pi pi-save" className="p-button-outlined" size="large" />

                        <Button label="Print Report" icon="pi pi-print" className="p-button-outlined" size="large" onClick={handlePrintReport} />

                        {state.currentStep === steps.length - 1 ? (
                            <div className="flex gap-2">
                                <Button label="Schedule Next Visit" icon="pi pi-calendar-plus" className="p-button-success" size="large" onClick={handleScheduleNext} disabled={!state.futureCarePlan.nextAppointmentDate} />
                                <Button
                                    label="Complete Follow-up"
                                    icon="pi pi-check"
                                    className="p-button-primary"
                                    size="large"
                                    onClick={handleComplete}
                                    loading={submitting}
                                    disabled={submitting || !state.patientId || !state.consultationId || getCompletionPercentage() < 80}
                                />
                            </div>
                        ) : (
                            <Button label="Next" icon="pi pi-chevron-right" iconPos="right" onClick={nextStep} disabled={!canProceedToNext()} size="large" />
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

const FollowUpVisit: React.FC = () => {
    return (
        <FollowUpVisitProvider>
            <FollowUpVisitContent />
        </FollowUpVisitProvider>
    );
};

export default FollowUpVisit;
