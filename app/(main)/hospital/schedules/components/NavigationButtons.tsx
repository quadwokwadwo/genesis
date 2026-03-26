import { usePatientScheduleContext } from '@/libs/contextProviders/AppContexts';
import { Button } from 'primereact/button';
import { useRef } from 'react';
import { Toast } from 'primereact/toast';
import { CRUDTYPE } from '@/types/enums/enums';

const NavigationButtons = () => {
    const { state, setStateValue, steps, scheduleAppointment, resetAppointment } = usePatientScheduleContext();
    const toast = useRef<Toast>(null);

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

    return (
        <>
            <div className="flex justify-content-between align-items-center">
                <Button label="Previous" icon="pi pi-chevron-left" onClick={prevStep} disabled={state.currentStep === 0} className="p-button-outlined w-fit" size="large" />

                <div className="flex gap-3">
                    <Button label="Save Draft" icon="pi pi-save" className="p-button-outlined w-fit" size="large" />
                    {state.crudType === CRUDTYPE.update && <Button label="Cancel Update" icon="pi pi-times" className="p-button-outlined w-fit p-button-danger" size="large" onClick={resetAppointment} />}

                    {state.currentStep === steps.length - 1 ? (
                        <Button
                            label={state.crudType === CRUDTYPE.save ? 'Schedule Appointment' : 'Update Appointment'}
                            icon="pi pi-calendar-plus"
                            onClick={scheduleAppointment}
                            className="p-button-success w-fit"
                            size="large"
                            loading={state.isLoading}
                        />
                    ) : (
                        <Button
                            label="Next"
                            icon="pi pi-chevron-right"
                            iconPos="right"
                            onClick={nextStep}
                            size="large"
                            className="w-fit"
                            disabled={(state.currentStep === 0 && !state.selectedPatient) || (state.currentStep === 1 && !state.selectedDoctor) || (state.currentStep === 2 && !state.selectedSlot)}
                        />
                    )}
                </div>
            </div>
        </>
    );
};
export default NavigationButtons;
