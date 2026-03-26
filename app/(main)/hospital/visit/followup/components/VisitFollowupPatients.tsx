import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import { TPatient } from '@/types/hospital';
import { useFollowupContext } from '@/libs/contextProviders/AppContexts';
import { changeDateFormat } from '@/libs/utils';

const VisitFollowupPatients = () => {
    const { state, setStateValue, selectPatient } = useFollowupContext();
    const filteredPatients = state.patients.filter(
        (patient) =>
            `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
            patient.recordNumber.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
            patient.phone.includes(state.searchQuery) ||
            patient.address?.toLowerCase().includes(state.searchQuery.toLowerCase())
    );
    return (
        <>
            <Card className="shadow-2">
                <div className="flex align-items-center mb-4">
                    <i className="pi pi-user text-primary text-2xl mr-3" />
                    <div>
                        <h4 className="m-0 text-primary">Patients Schedule for Follow-up Today</h4>
                        <p className="text-600 m-0">Choose a patient for their follow-up visit</p>
                    </div>
                </div>

                <div className="flex gap-3 mb-4">
                    <div className="flex-1">
                        <span className="p-input-icon-left w-full">
                            <i className="pi pi-search" />
                            <InputText placeholder="Search by name, record number, or phone..." value={state.searchQuery} onChange={(e) => setStateValue({ searchQuery: e.target.value })} className="w-full" />
                        </span>
                    </div>
                    <Button label="Follow-ups Today" icon="pi pi-list" onClick={() => setStateValue({ showFollowupsList: true })} />
                </div>

                <DataTable value={filteredPatients} selectionMode="single" onSelectionChange={(e) => selectPatient(e.value)} dataKey="patientId" paginator rows={8} emptyMessage="No patients found" className="p-datatable-sm">
                    <Column
                        header="Patient"
                        body={(patient: TPatient) => (
                            <div className="flex align-items-center gap-3">
                                <Avatar label={`${patient.firstName.charAt(0)}${patient.lastName.charAt(0)}`} shape="circle" className="bg-primary" />
                                <div>
                                    <div className="font-bold">
                                        {patient.firstName} {patient.lastName}
                                    </div>
                                    <div className="text-sm text-600">
                                        Age: {patient.age} • {patient.recordNumber}
                                    </div>
                                </div>
                            </div>
                        )}
                    />
                    <Column field="phone" header="Contact" />
                    <Column
                        header="Last Visit"
                        body={(patient: TPatient) => (
                            <div>
                                <div>{patient.lastVisit ? changeDateFormat(patient.lastVisit as Date) : 'New Patient'}</div>
                                {patient.lastVisit && <small className="text-600">{Math.floor((new Date().getTime() - new Date(patient.lastVisit).getTime()) / (1000 * 60 * 60 * 24))} days ago</small>}
                            </div>
                        )}
                    />
                    <Column header="Current Treatment" body={(patient: TPatient) => <Tag value={patient.currentTreatment || 'No active treatment'} severity="info" />} />
                    <Column header="Action" body={(patient: TPatient) => <Button label="Select" icon="pi pi-check" onClick={() => selectPatient(patient)} className="p-button-sm" />} />
                </DataTable>
            </Card>
        </>
    );
};
export default VisitFollowupPatients;
