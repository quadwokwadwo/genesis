'use client';
import React, { useRef } from 'react';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { ProgressBar } from 'primereact/progressbar';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Dialog } from 'primereact/dialog';
import { FileUpload } from 'primereact/fileupload';
import { GeneralPageProps } from '@/libs/utilityComponents';
import { ProcedureConsultationProvider, useProcedureContext } from '@/app/(main)/hospital/procedures/consultation/ProcedureConsultationContext';
import PreProcedureInstructions from '@/app/(main)/hospital/procedures/consultation/component/PreProcedureInstructions';
import InformedConsent from '@/app/(main)/hospital/procedures/consultation/component/InformedConsent';
import PreProcedureAssessment from '@/app/(main)/hospital/procedures/consultation/component/PreProcedureAssessment';
import ProcedureDetails from '@/app/(main)/hospital/procedures/consultation/component/ProcedureDetails';

const ProcedureConsultationContent: React.FC = () => {
    const { state, setStateValue, getCompletionPercentage, canProceedToNext } = useProcedureContext();

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

    const handleComplete = () => {
        console.log('Procedure consultation completed:', state);
        // Here you would typically save to backend
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
                                <Button label="Complete Consultation" icon="pi pi-check" className="p-button-primary w-fit" size="small" onClick={handleComplete} disabled={state.informedConsent.consentStatus !== 'Obtained'} />
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
    const toast = useRef(null);

    return (
        <>
            <GeneralPageProps toastRef={toast} toastPosition="top-right" />
            <ProcedureConsultationProvider>
                <ProcedureConsultationContent />
            </ProcedureConsultationProvider>
        </>
    );
};

export default ProcedureConsultation;
