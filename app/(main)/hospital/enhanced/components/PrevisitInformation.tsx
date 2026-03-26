import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Card } from 'primereact/card';
import { Panel } from 'primereact/panel';
import { Tag } from 'primereact/tag';
import { Chip } from 'primereact/chip';
import { Avatar } from 'primereact/avatar';
import { usePatientVisitContext } from '@/libs/contextProviders/AppContexts';

const PreVisitInformationDisplay: React.FC = () => {
    const { state, setStateValue } = usePatientVisitContext();

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Emergency':
                return 'danger';
            case 'Urgent':
                return 'warning';
            case 'Routine':
                return 'info';
            default:
                return 'info';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Scheduled':
                return 'info';
            case 'CheckedIn':
                return 'warning';
            case 'InProgress':
                return 'danger';
            case 'Completed':
                return 'success';
            default:
                return 'info';
        }
    };

    return (
        <Dialog visible={state.showSchedulingDataDialog} onHide={() => setStateValue({ showSchedulingDataDialog: false })} header="Pre-Visit Information" modal maximized>
            {state.scheduledAppointmentData && (
                <div className="grid">
                    {/* Appointment Overview */}
                    <div className="col-12">
                        <Card className="shadow-1">
                            <div className="flex align-items-center justify-content-between mb-3">
                                <h5 className="m-0 text-primary">Appointment Details</h5>
                                <div className="flex gap-2">
                                    <Tag value={state.scheduledAppointmentData.status} severity={getStatusColor(state.scheduledAppointmentData.status)} />
                                    <Tag value={state.scheduledAppointmentData.priority} severity={getPriorityColor(state.scheduledAppointmentData.priority)} />
                                </div>
                            </div>

                            <div className="grid">
                                <div className="col-12 md:col-6">
                                    <div className="flex align-items-center gap-3 mb-3">
                                        <Avatar label={`${state.scheduledAppointmentData.doctor.firstName?.charAt(0)}${state.scheduledAppointmentData.doctor.lastName?.charAt(0)}`} shape="circle" className="bg-blue-500" />
                                        <div>
                                            <div className="font-bold">
                                                Dr. {state.scheduledAppointmentData.doctor.firstName} {state.scheduledAppointmentData.doctor.lastName}
                                            </div>
                                            <div className="text-600 text-sm">{state.scheduledAppointmentData.doctor.specialization}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-12 md:col-6">
                                    <div className="text-right">
                                        <div className="text-lg font-bold">{new Date(state.scheduledAppointmentData.appointmentDate).toLocaleDateString()}</div>
                                        <div className="text-600">
                                            {state.scheduledAppointmentData.appointmentTime} • {state.scheduledAppointmentData.estimatedDuration} mins
                                        </div>
                                        <div className="text-sm text-500">{state.scheduledAppointmentData.appointmentType}</div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Vital Signs & Measurements (if collected during check-in) */}
                    <div className="col-12 md:col-6">
                        <Panel header="Vital Signs" className="h-full">
                            <div className="grid">
                                <div className="col-6">
                                    <div className="text-center border-1 border-300 border-round p-2 mb-2">
                                        <div className="text-2xl font-bold text-primary">{state.scheduledAppointmentData.vitalSigns.temperature || '--'}</div>
                                        <div className="text-xs text-600">Temperature (°C)</div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="text-center border-1 border-300 border-round p-2 mb-2">
                                        <div className="text-2xl font-bold text-primary">{state.scheduledAppointmentData.vitalSigns.heartRate || '--'}</div>
                                        <div className="text-xs text-600">Heart Rate (bpm)</div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="text-center border-1 border-300 border-round p-2">
                                        <div className="text-2xl font-bold text-primary">
                                            {state.scheduledAppointmentData.vitalSigns.bloodPressureSystolic && state.scheduledAppointmentData.vitalSigns.bloodPressureDiastolic
                                                ? `${state.scheduledAppointmentData.vitalSigns.bloodPressureSystolic}/${state.scheduledAppointmentData.vitalSigns.bloodPressureDiastolic}`
                                                : '--/--'}
                                        </div>
                                        <div className="text-xs text-600">Blood Pressure</div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="text-center border-1 border-300 border-round p-2">
                                        <div className="text-2xl font-bold text-primary">{state.scheduledAppointmentData.vitalSigns.oxygenSaturation || '--'}</div>
                                        <div className="text-xs text-600">O2 Sat (%)</div>
                                    </div>
                                </div>
                            </div>
                        </Panel>
                    </div>

                    <div className="col-12 md:col-6">
                        <Panel header="Measurements" className="h-full">
                            <div className="grid">
                                <div className="col-4">
                                    <div className="text-center border-1 border-300 border-round p-2 mb-2">
                                        <div className="text-2xl font-bold text-primary">{state.scheduledAppointmentData.measurements.height || '--'}</div>
                                        <div className="text-xs text-600">Height (cm)</div>
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="text-center border-1 border-300 border-round p-2 mb-2">
                                        <div className="text-2xl font-bold text-primary">{state.scheduledAppointmentData.measurements.weight || '--'}</div>
                                        <div className="text-xs text-600">Weight (kg)</div>
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="text-center border-1 border-300 border-round p-2 mb-2">
                                        <div className="text-2xl font-bold text-primary">{state.scheduledAppointmentData.measurements.bmi || '--'}</div>
                                        <div className="text-xs text-600">BMI</div>
                                    </div>
                                </div>
                            </div>
                        </Panel>
                    </div>

                    {/* Additional Notes */}
                    {state.scheduledAppointmentData.notes && (
                        <div className="col-12">
                            <Panel header="Additional Notes">
                                <p className="m-0 text-700">{state.scheduledAppointmentData.notes}</p>
                            </Panel>
                        </div>
                    )}
                </div>
            )}
        </Dialog>
    );
};

export default PreVisitInformationDisplay;
