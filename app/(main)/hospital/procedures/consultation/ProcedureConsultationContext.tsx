'use client';
import React, { createContext, useContext, useState } from 'react';
import { ProcedureConsultationState } from '@/types/hospital';

interface ProcedureContextProps {
    state: ProcedureConsultationState;
    setStateValue: (updates: Partial<ProcedureConsultationState>) => void;
    updateProcedureDetails: (updates: Partial<ProcedureConsultationState['procedureDetails']>) => void;
    updatePreProcedureAssessment: (updates: Partial<ProcedureConsultationState['preProcedureAssessment']>) => void;
    updateInformedConsent: (updates: Partial<ProcedureConsultationState['informedConsent']>) => void;
    updatePreProcedureInstructions: (updates: Partial<ProcedureConsultationState['preProcedureInstructions']>) => void;
    getCompletionPercentage: () => number;
    canProceedToNext: () => boolean;
}

const INITIAL_STATE: ProcedureConsultationState = {
    currentStep: 0,
    patientId: 0,
    procedureDetails: {
        patientId: 0,
        procedureType: null,
        indication: '',
        scheduledDate: null,
        estimatedDuration: null,
        surgeonId: null,
        surgeonName: '',
        anesthesiaType: 'Local',
        riskLevel: null,
        specialInstructions: ''
    },
    preProcedureAssessment: {
        procedureId: 0,
        medicalHistory: '',
        currentMedications: '',
        allergies: '',
        previousSurgeries: '',
        lastMenstrualPeriod: null,
        vitalSigns: {
            bloodPressure: '',
            heartRate: null,
            temperature: null,
            weight: null,
            respiratoryRate: null
        },
        labResults: {
            hemoglobin: null,
            platelets: null,
            bloodGroup: '',
            pregnancyTest: null,
            hiv: null,
            hepatitisB: null,
            hepatitisC: null,
            syphilis: null
        }
    },
    informedConsent: {
        procedureId: 0,
        procedureExplained: null,
        risksDiscussed: null,
        alternativesDiscussed: null,
        patientQuestions: '',
        consentStatus: 'Pending',
        consentDate: null,
        witnessName: '',
        patientSignature: null,
        doctorSignature: null,
        signatureDataUrl: null
    },
    preProcedureInstructions: {
        procedureId: 0,
        fastingRequired: null,
        fastingHours: null,
        medicationAdjustments: '',
        arrivalTime: null,
        companionRequired: null,
        postProcedureCare: '',
        warningSignsToWatch: '',
        emergencyContact: '',
        additionalNotes: ''
    },
    showFileUpload: false,
    uploadingFor: ''
};

const ProcedureContext = createContext<ProcedureContextProps | undefined>(undefined);

export const ProcedureConsultationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<ProcedureConsultationState>(INITIAL_STATE);

    const setStateValue = (updates: Partial<ProcedureConsultationState>) => {
        setState((prev) => ({ ...prev, ...updates }));
    };

    const updateProcedureDetails = (updates: Partial<ProcedureConsultationState['procedureDetails']>) => {
        setState((prev) => ({
            ...prev,
            procedureDetails: { ...prev.procedureDetails, ...updates }
        }));
    };

    const updatePreProcedureAssessment = (updates: Partial<ProcedureConsultationState['preProcedureAssessment']>) => {
        setState((prev) => ({
            ...prev,
            preProcedureAssessment: { ...prev.preProcedureAssessment, ...updates }
        }));
    };

    const updateInformedConsent = (updates: Partial<ProcedureConsultationState['informedConsent']>) => {
        setState((prev) => ({
            ...prev,
            informedConsent: { ...prev.informedConsent, ...updates }
        }));
    };

    const updatePreProcedureInstructions = (updates: Partial<ProcedureConsultationState['preProcedureInstructions']>) => {
        setState((prev) => ({
            ...prev,
            preProcedureInstructions: { ...prev.preProcedureInstructions, ...updates }
        }));
    };

    const getCompletionPercentage = (): number => {
        let completed = 0;
        const totalItems = 10;

        // Check procedure details
        if (state.procedureDetails.procedureType) completed++;
        if (state.procedureDetails.indication.trim()) completed++;
        if (state.procedureDetails.scheduledDate) completed++;

        // Check assessment
        if (state.preProcedureAssessment.medicalHistory.trim()) completed++;
        if (state.preProcedureAssessment.labResults.pregnancyTest) completed++;
        if (state.preProcedureAssessment.vitalSigns.bloodPressure) completed++;

        // Check consent
        if (state.informedConsent.procedureExplained === 'Yes') completed++;
        if (state.informedConsent.consentStatus === 'Obtained') completed++;

        // Check instructions
        if (state.preProcedureInstructions.fastingRequired) completed++;
        if (state.preProcedureInstructions.emergencyContact.trim()) completed++;

        return Math.round((completed / totalItems) * 100);
    };

    const canProceedToNext = (): boolean => {
        switch (state.currentStep) {
            case 0: // Procedure Details
                return !!(state.procedureDetails.procedureType && state.procedureDetails.indication.trim());
            case 1: // Assessment
                return !!state.preProcedureAssessment.medicalHistory.trim();
            case 2: // Consent
                return state.informedConsent.consentStatus === 'Obtained';
            case 3: // Instructions
                return !!state.preProcedureInstructions.emergencyContact.trim();
            default:
                return true;
        }
    };

    return (
        <ProcedureContext.Provider
            value={{
                state,
                setStateValue,
                updateProcedureDetails,
                updatePreProcedureAssessment,
                updateInformedConsent,
                updatePreProcedureInstructions,
                getCompletionPercentage,
                canProceedToNext
            }}
        >
            {children}
        </ProcedureContext.Provider>
    );
};

export const useProcedureContext = () => {
    const context = useContext(ProcedureContext);
    if (!context) {
        throw new Error('useProcedureContext must be used within ProcedureConsultationProvider');
    }
    return context;
};
