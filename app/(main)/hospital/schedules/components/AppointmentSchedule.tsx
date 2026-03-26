import { Card } from 'primereact/card';
import { Calendar } from 'primereact/calendar';
import { DropdownChangeEvent } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { usePatientScheduleContext } from '@/libs/contextProviders/AppContexts';
import { Appointment, AppointmentSlot, TPatient } from '@/types/hospital';
import { FilterSelect } from '@/libs/components/UtilComponents';
import { useEffect } from 'react';
import { changeDateFormat } from '@/libs/utils';
import { CRUDTYPE } from '@/types/enums/enums';

const AppointmentSchedule = () => {
    const { state, setStateValue, generateTimeSlots } = usePatientScheduleContext();

    useEffect(() => {
        let availableTimes = generateTimeSlots(state.todaysAppointments);

        if (state.crudType === CRUDTYPE.update) {
            availableTimes = availableTimes.map((availableTime) => (availableTime.time === state.appointment.appointmentTime ? { ...availableTime, available: true } : availableTime));
        }

        setStateValue({ availableSlots: availableTimes });
    }, []);

    const getStatusSeverity = (status: Appointment['status']) => {
        switch (status) {
            case 'Scheduled':
                return 'info';
            case 'CheckedIn':
                return 'warning';
            case 'InProgress':
                return 'success';
            case 'Completed':
                return 'success';
            case 'Cancelled':
                return 'danger';
            case 'NoShow':
                return 'danger';
            default:
                return 'info';
        }
    };
    const selectSlot = (slot: AppointmentSlot) => {
        if (!slot.available) return;

        const resetSlots = state.availableSlots.map((availableSlot) => (availableSlot.time === state.appointment.appointmentTime ? { ...availableSlot, available: true } : availableSlot));
        const modifiedAppointments = state.todaysAppointments.map((apt) => (apt.appointmentId === state.appointment.appointmentId ? { ...apt, appointmentDetails: { ...(apt.appointmentDetails as Appointment), appointmentTime: slot.time } } : apt));

        setStateValue({
            selectedSlot: slot,
            availableSlots: resetSlots,
            todaysAppointments: modifiedAppointments,
            appointment: {
                ...state.appointment,
                appointmentDate: state.selectedDate,
                appointmentTime: slot.time
            },
            currentStep: 3
        });
    };
    const onAppointmentTypeChange = (e: DropdownChangeEvent) => {
        setStateValue({ selectedAppointmentType: e.value, appointment: { ...state.appointment, appointmentType: e.value.code } });
    };
    const onAppointmentDateChange = (e: any) => {
        const selectedDate = e.value;
        const appointments = state.savedTodayAppointments.filter((apt) => changeDateFormat(new Date(apt.appointmentDate)) === changeDateFormat(new Date(selectedDate)));
        const slots = generateTimeSlots(appointments);
        setStateValue({ selectedDate, availableSlots: slots });
    };
    return (
        <>
            <div className="grid">
                <div className="col-12 md:col-8">
                    <Card className="shadow-2">
                        <div className="flex align-items-center mb-4">
                            <i className="pi pi-calendar text-primary text-2xl mr-3" />
                            <div>
                                <h4 className="m-0 text-primary">Schedule Appointment</h4>
                                <p className="text-600 m-0">Select date and time slot</p>
                            </div>
                        </div>

                        <div className="formgrid grid mb-4">
                            <div className="field col-12 md:col-6">
                                <label className="font-semibold mb-2 block">Appointment Type</label>
                                <FilterSelect
                                    selectedOption={state.selectedAppointmentType}
                                    selectableOptions={state.appointmentTypes}
                                    onSelectChange={onAppointmentTypeChange}
                                    elementId="appointmentType"
                                    defaultValue="Select type"
                                    showLabel={false}
                                />
                            </div>
                            <div className="field col-12 md:col-6">
                                <label className="font-semibold mb-2 block">Appointment Date</label>
                                <Calendar value={state.selectedDate} onChange={onAppointmentDateChange} dateFormat="dd M yy" showIcon minDate={new Date()} placeholder="Select date" className="w-full" />
                            </div>
                        </div>

                        {state.selectedDate && (
                            <>
                                <h6 className="text-primary mb-3">Available Time Slots</h6>
                                <div className="grid">
                                    {state.availableSlots.map((slot) => (
                                        <div key={slot.slotId} className="col-6 md:col-3 lg:col-2">
                                            <Button
                                                label={slot.time}
                                                onClick={() => selectSlot(slot)}
                                                disabled={!slot.available}
                                                className={`w-full mb-2 ${state.selectedSlot?.slotId === slot.slotId ? 'p-button-success' : slot.available ? 'p-button-outlined' : 'p-button-secondary'}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </Card>
                </div>

                <div className="col-12 md:col-4">
                    <Card className="shadow-2">
                        <h5 className="text-primary mb-3">Todays Schedule</h5>
                        {state.todaysAppointments.map((apt, index) => {
                            const parsedAppointment = apt.appointmentDetails as Appointment;
                            const patient: TPatient = typeof apt.patient === 'string' ? JSON.parse(apt.patient) : apt.patient;
                            return (
                                <div key={index} className="border-bottom-1 border-300 pb-3 mb-3">
                                    <div className="flex justify-content-between align-items-start">
                                        <div>
                                            <div className="font-semibold">{parsedAppointment.appointmentTime}</div>
                                            <div className="text-sm">
                                                {patient?.firstName} {patient?.lastName}
                                            </div>
                                            <div className="text-xs text-600">{parsedAppointment.appointmentType}</div>
                                        </div>
                                        <Tag value={parsedAppointment.status} severity={getStatusSeverity(parsedAppointment.status)} />
                                    </div>
                                </div>
                            );
                        })}
                    </Card>
                </div>
            </div>
        </>
    );
};
export default AppointmentSchedule;
