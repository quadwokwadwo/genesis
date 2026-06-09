import { usePatientScheduleContext } from '@/libs/contextProviders/AppContexts';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Appointment, TPatient, TTodaysAppointments } from '@/types/hospital';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import { changeDateFormat } from '@/libs/utils';
import { Dialog } from 'primereact/dialog';
import { DataView } from 'primereact/dataview';
import { Divider } from 'primereact/divider';
import { confirmDialog } from 'primereact/confirmdialog';
import { Calendar } from 'primereact/calendar';
import { formatDate } from 'date-fns/format';
import { useState } from 'react';

const PatientSelection = () => {
    const { state, setStateValue, getPatientAge, removeAppointment, editAppointment, onAppointmentDateChange, cancelAppointment, rescheduleAppointment } = usePatientScheduleContext();

    const [cancelDialog, setCancelDialog] = useState<{ visible: boolean; appointmentId: number | null; reason: string }>({ visible: false, appointmentId: null, reason: '' });
    const [rescheduleDialog, setRescheduleDialog] = useState<{ visible: boolean; appointmentId: number | null; date: Date | null; time: string }>({ visible: false, appointmentId: null, date: null, time: '' });

    const filteredPatients = state.patients.filter(
        (patient) =>
            `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
            patient.phone.includes(state.searchQuery) ||
            patient.recordNumber.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
            patient.address?.toLowerCase().includes(state.searchQuery.toLowerCase())
    );

    const selectPatient = (patient: TPatient) => {
        //check if patient is not already selected and booked for appointment for this date.
        const checkPatientAvailability = state.todaysAppointments.find((appointment) => appointment.patientId === patient.patientId);
        if (checkPatientAvailability) {
            confirmDialog({
                message: 'This patient is already booked for this date. Do you want to edit the appointment?',
                header: 'Patient Already Booked',
                icon: 'pi pi-info-circle',
                accept() {
                    editAppointment(checkPatientAvailability);
                },
                reject() {
                    setStateValue({ currentStep: 0 });
                },
                acceptClassName: 'p-button-info'
            });
        }
        setStateValue({
            selectedPatient: patient,
            appointment: { ...state.appointment, patientId: patient.patientId },
            showPatientDialog: false,
            currentStep: 1
        });
    };

    const deleteAppointment = (appointmentId: number) => {
        confirmDialog({
            message: 'Are you sure you want to delete this appointment?',
            header: 'Delete Appointment?',
            icon: 'pi pi-info-circle',
            accept() {
                removeAppointment(appointmentId);
            },
            acceptClassName: 'p-button-danger'
        });
    };
    const TodayAppointmentsViewer = (appointment: TTodaysAppointments) => {
        const todayAppoint: Appointment = typeof appointment.appointmentDetails === 'string' ? JSON.parse(appointment.appointmentDetails) : (appointment.appointmentDetails as Appointment);
        const patient: TPatient = typeof appointment.patient === 'string' ? JSON.parse(appointment.patient) : appointment.patient;

        return (
            <>
                <Divider />
                <div className="grid p-fluid w-full">
                    <div className="col-12">
                        <div className="grid">
                            <div className="col-3">
                                <Avatar label={`${patient.firstName.charAt(0)}${patient.lastName.charAt(0)}`} shape="circle" className="bg-primary" />
                                <span className="pl-2">{`${patient.firstName} ${patient.lastName}`}</span>
                            </div>
                            <div className="col-3">
                                <Tag value={todayAppoint.appointmentType} severity="info" />
                                {/*<Tag value={todayAppoint.appointmentDate.toLocaleDateString()} severity="info" />*/}
                            </div>
                            <div className="col-2">
                                <Tag value={todayAppoint.appointmentTime} severity="warning" />
                            </div>
                            <div className="col-2">
                                <Tag value={todayAppoint.status} severity="success" />
                            </div>
                            <div className="col-2">
                                <Button icon="pi pi-pencil" tooltip="Edit" className="p-button-outlined p-button-info mr-1" size={'small'} onClick={() => editAppointment(appointment)} />
                                <Button
                                    icon="pi pi-calendar-plus"
                                    tooltip="Reschedule"
                                    className="p-button-outlined p-button-warning mr-1"
                                    size={'small'}
                                    onClick={() => setRescheduleDialog({ visible: true, appointmentId: appointment.appointmentId, date: new Date(todayAppoint.appointmentDate), time: todayAppoint.appointmentTime })}
                                />
                                <Button
                                    icon="pi pi-ban"
                                    tooltip="Cancel"
                                    className="p-button-outlined p-button-secondary mr-1"
                                    size={'small'}
                                    onClick={() => setCancelDialog({ visible: true, appointmentId: appointment.appointmentId, reason: '' })}
                                />
                                <Button icon="pi pi-trash" tooltip="Delete" className="p-button-outlined p-button-danger" size={'small'} onClick={() => deleteAppointment(appointment.appointmentId)} />
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    };
    const viewTodayAppointments = () => {
        setStateValue({ showAppointmentsToday: true });
    };
    return (
        <>
            <Card className="shadow-2">
                <div className="flex align-items-center mb-4">
                    <i className="pi pi-user text-primary text-2xl mr-3" />
                    <div>
                        <h4 className="m-0 text-primary">Select Patient</h4>
                        <p className="text-600 m-0">Choose an existing patient or register a new one</p>
                    </div>
                </div>
                <div className="flex gap-3 mb-4">
                    <div className="flex-1">
                        <span className="p-input-icon-left w-full">
                            <i className="pi pi-search" />
                            <InputText placeholder="Search by name, phone, or record number..." value={state.searchQuery} onChange={(e) => setStateValue({ searchQuery: e.target.value })} className="w-full" />
                        </span>
                    </div>
                    <Button label="Register New Patient" icon="pi pi-user-plus" className="p-button-outlined w-fit" onClick={() => setStateValue({ showPatientDialog: true })} />
                    <Button label="Appointments Today" icon="pi pi-list" className="p-button-outlined w-fit" onClick={viewTodayAppointments} />
                </div>
                <DataTable loading={state.isLoading} value={filteredPatients} selectionMode="single" onSelectionChange={(e) => selectPatient(e.value)} dataKey="patientId" paginator rows={5} emptyMessage="No patients found" className="p-datatable-sm">
                    <Column
                        header="Patient"
                        body={(patient: TPatient) => (
                            <div className="flex align-items-center gap-3">
                                <Avatar label={`${patient.firstName.charAt(0)}${patient.lastName.charAt(0)}`} shape="circle" className="bg-primary" />
                                <div>
                                    <div className="font-bold">
                                        {patient.firstName} {patient.lastName}
                                    </div>
                                    <div className="text-sm text-600">Age: {getPatientAge(new Date(changeDateFormat(patient.dateOfBirth as Date)))}</div>
                                </div>
                            </div>
                        )}
                    />
                    <Column field="recordNumber" header="Record #" />
                    <Column field="phone" header="Phone" />
                    <Column header="Last Visit" body={(patient: TPatient) => (patient.lastVisit ? <Tag value={formatDate(patient.lastVisit, "yyyy-MM-dd 'at' HH:mm")} severity="info" /> : <Tag value="New Patient" severity="warning" />)} />
                    <Column header="Action" body={(patient: TPatient) => <Button label="Select" icon="pi pi-check" onClick={() => selectPatient(patient)} className="p-button-sm w-fit" />} />
                </DataTable>
                ()
            </Card>
            <Dialog onHide={() => setStateValue({ showAppointmentsToday: false })} visible={state.showAppointmentsToday} header="Today's Appointments" maximized>
                <div className="flex flex-column p-fluid w-full">
                    <div className="flex justify-content-center align-items-center mb-4">
                        <div className="field">
                            <label htmlFor="appointmentDate" className="mb-2">
                                Select Appointment Date to Filter
                            </label>
                            <Calendar selectionMode={'single'} onChange={onAppointmentDateChange} showIcon />
                        </div>
                    </div>
                    {state.todaysAppointments.length > 0 ? (
                        <>
                            <div className="grid font-bold text-xl">
                                <div className="col-3">Patient</div>
                                <div className="col-3">Appointment Type</div>
                                <div className="col-2">Time</div>
                                <div className="col-2">Status</div>
                                <div className="col-2">Actions</div>
                            </div>
                            <DataView value={state.todaysAppointments} itemID="appointmentId" itemTemplate={TodayAppointmentsViewer} className="mt-1" rows={5} paginator loading={state.isLoading} />
                        </>
                    ) : (
                        <div className="flex justify-content-center align-items-center">
                            <div className="text-center text-2xl">
                                <h6>No Appointments Recorded for today!</h6>
                            </div>
                        </div>
                    )}
                </div>
            </Dialog>

            {/* Cancel Appointment Dialog */}
            <Dialog
                visible={cancelDialog.visible}
                header="Cancel Appointment"
                onHide={() => setCancelDialog({ visible: false, appointmentId: null, reason: '' })}
                style={{ width: '32rem' }}
                footer={
                    <>
                        <Button label="Close" icon="pi pi-times" className="p-button-text" onClick={() => setCancelDialog({ visible: false, appointmentId: null, reason: '' })} />
                        <Button
                            label="Confirm Cancellation"
                            icon="pi pi-check"
                            className="p-button-danger"
                            disabled={cancelDialog.reason.trim().length < 10 || !cancelDialog.appointmentId}
                            onClick={async () => {
                                if (cancelDialog.appointmentId) {
                                    await cancelAppointment(cancelDialog.appointmentId, cancelDialog.reason.trim());
                                    setCancelDialog({ visible: false, appointmentId: null, reason: '' });
                                }
                            }}
                        />
                    </>
                }
            >
                <div className="field">
                    <label htmlFor="cancelReason" className="mb-2 block">
                        Reason for cancellation <span className="text-red-500">*</span> (min 10 characters)
                    </label>
                    <InputTextarea id="cancelReason" rows={4} value={cancelDialog.reason} onChange={(e) => setCancelDialog({ ...cancelDialog, reason: e.target.value })} className="w-full" autoFocus />
                    <small className={cancelDialog.reason.trim().length < 10 ? 'p-error block mt-1' : 'text-600 block mt-1'}>{cancelDialog.reason.trim().length}/10 minimum characters</small>
                </div>
            </Dialog>

            {/* Reschedule Appointment Dialog */}
            <Dialog
                visible={rescheduleDialog.visible}
                header="Reschedule Appointment"
                onHide={() => setRescheduleDialog({ visible: false, appointmentId: null, date: null, time: '' })}
                style={{ width: '32rem' }}
                footer={
                    <>
                        <Button label="Close" icon="pi pi-times" className="p-button-text" onClick={() => setRescheduleDialog({ visible: false, appointmentId: null, date: null, time: '' })} />
                        <Button
                            label="Confirm Reschedule"
                            icon="pi pi-check"
                            className="p-button-warning"
                            disabled={!rescheduleDialog.date || !rescheduleDialog.time || !rescheduleDialog.appointmentId}
                            onClick={async () => {
                                if (rescheduleDialog.appointmentId && rescheduleDialog.date && rescheduleDialog.time) {
                                    await rescheduleAppointment(rescheduleDialog.appointmentId, changeDateFormat(rescheduleDialog.date), rescheduleDialog.time);
                                    setRescheduleDialog({ visible: false, appointmentId: null, date: null, time: '' });
                                }
                            }}
                        />
                    </>
                }
            >
                <div className="grid p-fluid">
                    <div className="col-12 md:col-6 field">
                        <label htmlFor="newDate" className="mb-2 block">
                            New Date <span className="text-red-500">*</span>
                        </label>
                        <Calendar id="newDate" value={rescheduleDialog.date} onChange={(e) => setRescheduleDialog({ ...rescheduleDialog, date: e.value as Date })} dateFormat="yy-mm-dd" showIcon />
                    </div>
                    <div className="col-12 md:col-6 field">
                        <label htmlFor="newTime" className="mb-2 block">
                            New Time (HH:MM) <span className="text-red-500">*</span>
                        </label>
                        <InputText id="newTime" value={rescheduleDialog.time} onChange={(e) => setRescheduleDialog({ ...rescheduleDialog, time: e.target.value })} placeholder="HH:MM" />
                    </div>
                </div>
            </Dialog>
        </>
    );
};

export default PatientSelection;
