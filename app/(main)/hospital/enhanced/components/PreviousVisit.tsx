import React from 'react';
import { Dialog } from 'primereact/dialog';
import { usePatientVisitContext } from '@/libs/contextProviders/AppContexts';
import VisitFollowupPreviousVisit from '@/app/(main)/hospital/visit/followup/components/VisitFollowupPreviousVisit';

const PreviousVisitsHistory: React.FC = () => {
    const { state, setStateValue } = usePatientVisitContext();

    return (
        <>
            <Dialog visible={state.showPreviousVisitsDialog} onHide={() => setStateValue({ showPreviousVisitsDialog: false })} header={`Previous Visits - ${state.selectedPatient?.firstName} ${state.selectedPatient?.lastName}`} maximized>
                <VisitFollowupPreviousVisit visits={state.previousVisits} showPatientInfo={true} loading={state.isLoading} />;
            </Dialog>
        </>
    );
};

export default PreviousVisitsHistory;
