import { Panel } from 'primereact/panel';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import { Card } from 'primereact/card';
import { usePatientScheduleContext } from '@/libs/contextProviders/AppContexts';
import { Appointment } from '@/types/hospital';
import { changeDateFormat } from '@/libs/utils';

const ScheduleConfirmation = () => {
    const { state, setStateValue, getPatientAge } = usePatientScheduleContext();

    const getPrioritySeverity = (priority: Appointment['priority']) => {
        switch (priority) {
            case 'Routine':
                return 'info';
            case 'Urgent':
                return 'warning';
            case 'Emergency':
                return 'danger';
            default:
                return 'info';
        }
    };
    return (
        <>
            <Card className="shadow-2">
                <div className="flex align-items-center mb-4">
                    <i className="pi pi-check text-primary text-2xl mr-3" />
                    <div>
                        <h4 className="m-0 text-primary">Confirm Appointment</h4>
                        <p className="text-600 m-0">Review all details before scheduling</p>
                    </div>
                </div>

                <div className="grid">
                    <div className="col-12 md:col-8">
                        <Panel header="Appointment Summary" className="mb-4">
                            <div className="grid">
                                <div className="col-12 md:col-6">
                                    <h6 className="text-primary mb-3">Patient Information</h6>
                                    <div className="mb-2">
                                        <strong>Name:</strong> {state.selectedPatient?.firstName} {state.selectedPatient?.lastName}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Record #:</strong> {state.selectedPatient?.recordNumber}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Phone:</strong> {state.selectedPatient.phone}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Age:</strong> {state.selectedPatient ? getPatientAge(new Date(changeDateFormat(state.selectedPatient.dateOfBirth as Date))) : '--'} years
                                    </div>
                                </div>

                                <div className="col-12 md:col-6">
                                    <h6 className="text-primary mb-3">Appointment Details</h6>
                                    <div className="mb-2">
                                        <strong>Doctor:</strong> {`${state.selectedDoctor.firstName} ${state.selectedDoctor?.lastName}`}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Specialization:</strong> {state.selectedDoctor?.specialization}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Date & Time:</strong> {state.appointment.appointmentDate?.toLocaleDateString()} at {state.appointment.appointmentTime}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Type:</strong> {state.appointment.appointmentType}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Priority:</strong>
                                        <Tag value={state.appointment.priority} severity={getPrioritySeverity(state.appointment.priority)} className="ml-2" />
                                    </div>
                                </div>
                            </div>
                        </Panel>

                        {(state.appointment.vitalSigns.temperature || state.appointment.measurements.height) && (
                            <Panel header="Vital Signs & Measurements" className="mb-4">
                                <div className="grid">
                                    <div className="col-12 md:col-6">
                                        <h6 className="mb-3">Vital Signs</h6>
                                        {state.appointment.vitalSigns.temperature && <div className="mb-2">Temperature: {state.appointment.vitalSigns.temperature}°C</div>}
                                        {state.appointment.vitalSigns.heartRate && <div className="mb-2">Heart Rate: {state.appointment.vitalSigns.heartRate} bpm</div>}
                                        {state.appointment.vitalSigns.bloodPressureSystolic && state.appointment.vitalSigns.bloodPressureDiastolic && (
                                            <div className="mb-2">
                                                Blood Pressure: {state.appointment.vitalSigns.bloodPressureSystolic}/{state.appointment.vitalSigns.bloodPressureDiastolic} mmHg
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-12 md:col-6">
                                        <h6 className="mb-3">Measurements</h6>
                                        {state.appointment.measurements.height && <div className="mb-2">Height: {state.appointment.measurements.height} cm</div>}
                                        {state.appointment.measurements.weight && <div className="mb-2">Weight: {state.appointment.measurements.weight} kg</div>}
                                        {state.appointment.measurements.bmi && <div className="mb-2">BMI: {state.appointment.measurements.bmi}</div>}
                                    </div>
                                </div>
                            </Panel>
                        )}
                    </div>

                    <div className="col-12 md:col-4">
                        <Panel header="Payment Summary">
                            <div className="flex justify-content-between align-items-center mb-3">
                                <span>Consultation Fee:</span>
                                <span className="font-bold">${state.selectedDoctor?.consultationFee}</span>
                            </div>
                            <Divider />
                            <div className="flex justify-content-between align-items-center">
                                <span className="font-bold">Total Amount:</span>
                                <span className="font-bold text-primary text-xl">${state.selectedDoctor.consultationFee}</span>
                            </div>
                        </Panel>
                    </div>
                </div>
            </Card>
        </>
    );
};
export default ScheduleConfirmation;
