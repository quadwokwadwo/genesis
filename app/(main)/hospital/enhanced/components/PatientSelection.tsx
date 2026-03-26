import React from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import { Panel } from 'primereact/panel';
import { usePatientVisitContext } from '@/libs/contextProviders/AppContexts';
import { TFollowupRecord, TPatient } from '@/types/hospital';
import { CRUDTYPE } from '@/types/enums/enums';

const PatientSelection: React.FC = () => {
    const { state, setStateValue, getPatientAge, selectPatient } = usePatientVisitContext();

    const patientTemplate = (patient: TPatient) => {
        return (
            <div className="flex align-items-center gap-3">
                <Avatar label={`${patient.firstName.charAt(0)}${patient.lastName.charAt(0)}`} shape="circle" className="bg-primary" />
                <div>
                    <div className="font-bold">
                        {patient.firstName} {patient.lastName}
                    </div>
                    <div className="text-sm text-600">
                        Age: {getPatientAge(patient.dateOfBirth || new Date())} | {patient.gender}
                    </div>
                </div>
            </div>
        );
    };

    const lastVisitTemplate = (patient: TPatient) => {
        return patient.lastVisit ? <Tag value={new Date(patient.lastVisit).toLocaleDateString()} severity="info" /> : <Tag value="New Patient" severity="warning" />;
    };

    const actionTemplate = (patient: TPatient) => {
        return (
            <div className="flex gap-2">
                <Button label="Select" icon="pi pi-check" onClick={() => selectPatient(patient, patient.appointmentType, state.crudType, {} as TFollowupRecord)} className="p-button-sm" />
                <Button
                    icon="pi pi-eye"
                    className="p-button-sm p-button-outlined"
                    onClick={() => {
                        selectPatient(patient, patient.appointmentType, CRUDTYPE.save, {} as TFollowupRecord);
                        setStateValue({ showPreviousVisitsDialog: true });
                    }}
                    tooltip="View patient history"
                />
            </div>
        );
    };
    const onQueuedPatientsSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value === '') {
            setStateValue({ queuedPatients: state.immutableQueuedPatients, searchQuery: '' });
            return;
        }
        const filteredQueuedPatients = state.immutableQueuedPatients.filter(
            (patient) =>
                `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                patient.phone.includes(state.searchQuery) ||
                patient.recordNumber.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                patient.address?.toLowerCase().includes(state.searchQuery.toLowerCase())
        );
        setStateValue({ searchQuery: e.target.value, queuedPatients: filteredQueuedPatients });
    };
    return (
        <div className="grid">
            <div className="col-12">
                <Card className="shadow-2">
                    <div className="flex align-items-center mb-4">
                        <i className="pi pi-user text-primary text-2xl mr-3" />
                        <div>
                            <h4 className="m-0 text-primary">Select Patient for Visit</h4>
                            <p className="text-600 m-0">Choose a patient to begin clinical documentation</p>
                        </div>
                    </div>

                    {state.selectedPatient && (
                        <Panel header="Selected Patient" className="mb-4 border-primary">
                            <div className="flex align-items-center justify-content-between">
                                <div className="flex align-items-center gap-3">
                                    <Avatar label={`${state.selectedPatient.firstName.charAt(0)}${state.selectedPatient.lastName.charAt(0)}`} shape="circle" className="bg-primary" size="large" />
                                    <div>
                                        <div className="text-xl font-bold">
                                            {state.selectedPatient.firstName} {state.selectedPatient.lastName}
                                        </div>
                                        <div className="text-600">
                                            Record: {state.selectedPatient.recordNumber} | Age: {state.patientAge} |{state.selectedPatient.gender} | Phone: {state.selectedPatient.phone}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button label="Pre-Visit Info" icon="pi pi-info-circle" className="p-button-outlined" onClick={() => setStateValue({ showSchedulingDataDialog: true })} />
                                    <Button label="Previous Visits" icon="pi pi-history" className="p-button-outlined" onClick={() => setStateValue({ showPreviousVisitsDialog: true })} />
                                    <Button label="Change Patient" icon="pi pi-user-edit" className="p-button-outlined p-button-info" onClick={() => setStateValue({ selectedPatient: null })} />
                                </div>
                            </div>
                        </Panel>
                    )}

                    {!state.selectedPatient && (
                        <>
                            <div className="flex gap-3 mb-4">
                                <div className="flex-1">
                                    <span className="p-input-icon-left w-full">
                                        <i className="pi pi-search" />
                                        <InputText placeholder="Search by name, phone, or record number..." value={state.searchQuery} onChange={onQueuedPatientsSearch} className="w-full" />
                                    </span>
                                </div>
                                <Button label="View Visits Today" icon="pi pi-list" className="p-button-outlined" onClick={() => setStateValue({ showVisitsToday: true })} />
                            </div>

                            <DataTable value={state.queuedPatients} selectionMode="single" dataKey="patientId" paginator rows={10} emptyMessage="No patients found" className="p-datatable-sm" loading={state.isLoading}>
                                <Column header="Patient" body={patientTemplate} style={{ minWidth: '250px' }} />
                                <Column field="recordNumber" header="Record #" style={{ minWidth: '120px' }} />
                                <Column field="phone" header="Phone" style={{ minWidth: '150px' }} />
                                <Column field="maritalStatus" header="Marital Status" style={{ minWidth: '120px' }} />
                                <Column field="appointmentType" header="Appointment Type" style={{ minWidth: '120px' }} />
                                <Column header="Last Visit" body={lastVisitTemplate} style={{ minWidth: '120px' }} />
                                <Column header="Actions" body={actionTemplate} style={{ minWidth: '180px' }} />
                            </DataTable>
                        </>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default PatientSelection;
