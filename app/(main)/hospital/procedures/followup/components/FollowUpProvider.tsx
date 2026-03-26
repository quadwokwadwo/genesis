'use client';
import React, { createContext, useContext, useState } from 'react';
import { FollowUpVisitState } from '@/types/hospital';

interface FollowUpContextProps {
    state: FollowUpVisitState;
    setStateValue: (updates: Partial<FollowUpVisitState>) => void;
    updatePostProcedureSymptoms: (updates: Partial<FollowUpVisitState['postProcedureSymptoms']>) => void;
    updateRecoveryAssessment: (updates: Partial<FollowUpVisitState['recoveryAssessment']>) => void;
    updateComplicationAssessment: (updates: Partial<FollowUpVisitState['complicationAssessment']>) => void;
    updateProcedureOutcome: (updates: Partial<FollowUpVisitState['procedureOutcome']>) => void;
    updateFutureCarePlan: (updates: Partial<FollowUpVisitState['futureCarePlan']>) => void;
    getCompletionPercentage: () => number;
    canProceedToNext: () => boolean;
}

const INITIAL_STATE: FollowUpVisitState = {
    currentStep: 0,
    patientId: 1, // Would come from route params
    procedureReference: {
        procedureId: 1,
        procedureType: 'IVF',
        procedureDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        surgeonName: 'Dr. Amanda Wilson',
        procedureLocation: 'Main OR'
    },
    followUpType: null,
    visitDate: new Date(),
    chiefComplaint: '',
    postProcedureSymptoms: {
        pain: null,
        painLocation: '',
        bleeding: null,
        bleedingAmount: null,
        nausea: null,
        vomiting: null,
        fever: null,
        dizziness: null,
        swelling: null,
        discharge: null,
        dischargeType: '',
        otherSymptoms: '',
        symptomsOnset: null,
        symptomsResolution: null
    },
    recoveryAssessment: {
        followUpId: 0,
        overallRecovery: null,
        mobilityLevel: null,
        appetiteLevel: null,
        sleepQuality: null,
        energyLevel: null,
        returnToWork: null,
        returnToWorkDate: null,
        activityRestrictions: '',
        medicationCompliance: null,
        medicationIssues: '',
        physicalTherapy: null,
        physiotherapyNotes: ''
    },
    complicationAssessment: {
        followUpId: 0,
        hasComplications: null,
        complicationSeverity: null,
        complicationDetails: '',
        treatmentRequired: null,
        treatmentProvided: '',
        hospitalizationRequired: null,
        additionalProceduresRequired: null,
        additionalProcedureDetails: '',
        resolutionDate: null,
        preventiveMeasures: ''
    },
    procedureOutcome: {
        followUpId: 0,
        overallOutcome: null,
        successCriteria: '',
        objectiveResults: '',
        patientSatisfaction: null,
        functionalImprovement: null,
        functionalDetails: '',
        qualityOfLifeImprovement: null,
        qualityOfLifeDetails: '',
        expectedVsActualResults: '',
        additionalInterventionsNeeded: null,
        interventionDetails: ''
    },
    futureCarePlan: {
        followUpId: 0,
        nextAppointmentDate: null,
        nextAppointmentType: null,
        monitoringFrequency: '',
        expectedMilestones: '',
        warningSignsEducation: '',
        lifestyleRecommendations: '',
        medicationChanges: '',
        additionalTestsRequired: null,
        testsDetails: '',
        referralsRequired: null,
        referralDetails: '',
        patientEducationProvided: '',
        emergencyContactInstructions: ''
    },
    showFileUpload: false,
    uploadingFor: '',
    followUpChecks: {
        painManagement: false,
        woundCare: false,
        medicationReview: false,
        complicationScreen: false,
        resultDiscussion: false
    }
};

const FollowUpContext = createContext<FollowUpContextProps | undefined>(undefined);

export const FollowUpVisitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<FollowUpVisitState>(INITIAL_STATE);

    const setStateValue = (updates: Partial<FollowUpVisitState>) => {
        setState((prev) => ({ ...prev, ...updates }));
    };

    const updatePostProcedureSymptoms = (updates: Partial<FollowUpVisitState['postProcedureSymptoms']>) => {
        setState((prev) => ({
            ...prev,
            postProcedureSymptoms: { ...prev.postProcedureSymptoms, ...updates }
        }));
    };

    const updateRecoveryAssessment = (updates: Partial<FollowUpVisitState['recoveryAssessment']>) => {
        setState((prev) => ({
            ...prev,
            recoveryAssessment: { ...prev.recoveryAssessment, ...updates }
        }));
    };

    const updateComplicationAssessment = (updates: Partial<FollowUpVisitState['complicationAssessment']>) => {
        setState((prev) => ({
            ...prev,
            complicationAssessment: { ...prev.complicationAssessment, ...updates }
        }));
    };

    const updateProcedureOutcome = (updates: Partial<FollowUpVisitState['procedureOutcome']>) => {
        setState((prev) => ({
            ...prev,
            procedureOutcome: { ...prev.procedureOutcome, ...updates }
        }));
    };

    const updateFutureCarePlan = (updates: Partial<FollowUpVisitState['futureCarePlan']>) => {
        setState((prev) => ({
            ...prev,
            futureCarePlan: { ...prev.futureCarePlan, ...updates }
        }));
    };

    const getCompletionPercentage = (): number => {
        let completed = 0;
        const totalItems = 12;

        // Check symptoms assessment
        if (state.postProcedureSymptoms.pain !== null) completed++;
        if (state.postProcedureSymptoms.bleeding) completed++;

        // Check recovery assessment
        if (state.recoveryAssessment.overallRecovery) completed++;
        if (state.recoveryAssessment.medicationCompliance) completed++;

        // Check complications
        if (state.complicationAssessment.hasComplications) completed++;

        // Check outcome
        if (state.procedureOutcome.overallOutcome) completed++;
        if (state.procedureOutcome.patientSatisfaction) completed++;

        // Check care plan
        if (state.futureCarePlan.nextAppointmentDate) completed++;
        if (state.futureCarePlan.warningSignsEducation.trim()) completed++;
        if (state.futureCarePlan.emergencyContactInstructions.trim()) completed++;

        // Check follow-up type and chief complaint
        if (state.followUpType) completed++;
        if (state.chiefComplaint.trim()) completed++;

        return Math.round((completed / totalItems) * 100);
    };

    const canProceedToNext = (): boolean => {
        switch (state.currentStep) {
            case 0: // Chief complaint & symptoms
                return !!(state.followUpType && state.chiefComplaint.trim());
            case 1: // Recovery assessment
                return !!state.recoveryAssessment.overallRecovery;
            case 2: // Complications
                return !!state.complicationAssessment.hasComplications;
            case 3: // Outcome
                return !!state.procedureOutcome.overallOutcome;
            case 4: // Care plan
                return !!state.futureCarePlan.emergencyContactInstructions.trim();
            default:
                return true;
        }
    };

    return (
        <FollowUpContext.Provider
            value={{
                state,
                setStateValue,
                updatePostProcedureSymptoms,
                updateRecoveryAssessment,
                updateComplicationAssessment,
                updateProcedureOutcome,
                updateFutureCarePlan,
                getCompletionPercentage,
                canProceedToNext
            }}
        >
            {children}
        </FollowUpContext.Provider>
    );
};

export const useFollowUpContext = () => {
    const context = useContext(FollowUpContext);
    if (!context) {
        throw new Error('useFollowUpContext must be used within FollowUpVisitProvider');
    }
    return context;
};
