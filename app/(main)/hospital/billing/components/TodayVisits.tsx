import { InputText } from 'primereact/inputtext';
import { FilterMatchMode } from 'primereact/api';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import React, { useState } from 'react';
import { useBillingContext } from '@/libs/contextProviders/AppContexts';
import { Investigation, PrescriptionRecord, TBillPatient, TodayPatient, Visit } from '@/types/hospital';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import { AppointmentType, INVESTIGATION_STATUS, VISIT_STATUS } from '@/types/enums/enums';
import { Button } from 'primereact/button';
import { changeDateFormat } from '@/libs/utils';

const TodayVisits = ({ visitingPatients }: { visitingPatients: TodayPatient[] }) => {
    const { state, setStateValue, toast } = useBillingContext();
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    });
    const selectPatientFromList = async (patient: TodayPatient) => {
        setStateValue({ selectedTodayPatient: patient, isLoading: true });
        try {
            const prescriptions: PrescriptionRecord[] = (patient.visitDetails?.prescriptions || []).map((prescription) => ({ ...prescription, selected: true, available: true }));
            const externalPrescriptions = prescriptions.map((prescription) => ({ ...prescription, selected: false, available: false }));
            const investigations: Investigation[] = (patient.visitDetails?.investigations || []).map((investigation) => ({ ...investigation, selected: true }));
            const internalInvestigations = investigations.filter((i) => i.source === 'Internal');

            // Load partner investigations only when present (patients without a partner have none)
            const partnerInvestigationsRaw: Investigation[] = (patient.visitDetails?.partnerInvestigations || []).map((investigation) => ({ ...investigation, selected: true }));
            const partnerInternalInvestigations = partnerInvestigationsRaw.filter((i) => i.source === 'Internal');
            const partnerExternalInvestigations = partnerInvestigationsRaw.filter((i) => i.source === 'External').map((investigation) => ({ ...investigation, selected: false }));

            // Load full patient details
            const patientDetails: TBillPatient = {
                patientId: patient.patientId,
                firstName: patient.firstName,
                lastName: patient.lastName,
                recordNumber: patient.recordNumber,
                phone: patient.phone,
                email: `${patient.firstName.toLowerCase()}.${patient.lastName.toLowerCase()}@email.com`,
                dateOfBirth: changeDateFormat(new Date(patient.dateOfBirth)),
                gender: 'Male',
                hasHospitalCard: patient.visitType !== AppointmentType.initialConsultation
            };

            const accountsInfo = patient.visitDetails?.accountsInfo;
            const visitDetails: Visit = {
                visitId: patient.visitId,
                patientId: patient.patientId,
                visitDate: new Date().toISOString().split('T')[0],
                doctorId: patient.doctorId,
                doctorName: patient.doctorName,
                visitType: patient.visitType as AppointmentType,
                status: patient.status as VISIT_STATUS,
                diagnosis: 'General consultation',
                prescriptions: prescriptions,
                accountInfo: accountsInfo ?? {
                    chargeHospitalCard: true,
                    chargeConsultation: true,
                    discountGiven: 0,
                    consultationFee: state.determinedFees?.consultationFee ?? 0,
                    hospitalCardFee: state.determinedFees?.hospitalCardFee ?? 0
                }
            };

            setStateValue({
                selectedPatient: patientDetails,
                selectedVisit: visitDetails,
                availableDrugs: prescriptions,
                externalPrescriptions,
                internalInvestigations,
                selectedInvestigations: internalInvestigations,
                externalInvestigations: investigations.map((investigation) => ({ ...investigation, selected: false, source: 'External' })),
                partnerInternalInvestigations: partnerInternalInvestigations,
                partnerSelectedInvestigations: partnerInternalInvestigations,
                partnerExternalInvestigations: partnerExternalInvestigations
            });

            toast.current?.show({
                severity: 'success',
                summary: 'Patient Selected',
                detail: `${patient.firstName} ${patient.lastName} - ${patient.recordNumber}`,
                life: 3000
            });
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to load patient details',
                life: 3000
            });
        } finally {
            setStateValue({ isLoading: false });
        }
    };
    // Templates
    const patientNameTemplate = (rowData: TodayPatient) => {
        return (
            <div className="flex align-items-center gap-2">
                <Avatar label={`${rowData.firstName[0]}${rowData.lastName[0]}`} size="normal" shape="circle" className="bg-primary" />
                <span>
                    {rowData.firstName} {rowData.lastName}
                </span>
            </div>
        );
    };

    const statusTemplate = (rowData: TodayPatient) => {
        const severity = rowData.status === 'Completed' ? 'success' : rowData.status === 'Accounts' ? 'warning' : 'info';
        return <Tag value={rowData.status} severity={severity} />;
    };

    const visitTypeTemplate = (rowData: TodayPatient) => {
        const severity = rowData.visitType === AppointmentType.followupVisit ? 'success' : rowData.visitType === AppointmentType.initialConsultation ? 'info' : 'warning';
        return <Tag value={rowData.visitType} severity={severity} />;
    };

    const actionTemplate = (rowData: TodayPatient) => {
        return <Button label="Select" icon="pi pi-check" size="small" onClick={() => selectPatientFromList(rowData)} disabled={rowData.status !== 'Accounts'} />;
    };
    return (
        <>
            <DataTable
                value={visitingPatients}
                loading={state.isLoading}
                paginator
                rows={10}
                filters={filters}
                onFilter={(e) => setFilters(e.filters as any)}
                globalFilterFields={['firstName', 'lastName', 'recordNumber', 'phone', 'address']}
                header={
                    <div className="flex justify-content-between align-items-center">
                        <span className="p-input-icon-left">
                            <i className="pi pi-search" />
                            <InputText
                                placeholder="Search patients..."
                                onInput={(e) =>
                                    setFilters({
                                        ...filters,
                                        global: { value: (e.target as HTMLInputElement).value, matchMode: FilterMatchMode.CONTAINS }
                                    })
                                }
                            />
                        </span>
                        <span className="text-500">{state.selectedTodayPatient && `Selected: ${state.selectedTodayPatient.firstName} ${state.selectedTodayPatient.lastName}`}</span>
                    </div>
                }
                selectionMode="single"
                selection={state.selectedTodayPatient}
                onSelectionChange={(e) => setStateValue({ selectedPatient: e.value })}
                dataKey="visitId"
                className="p-datatable-striped"
            >
                <Column field="recordNumber" header="Record #" sortable />
                <Column header="Patient Name" body={patientNameTemplate} sortable />
                <Column field="phone" header="Phone" />
                <Column field="visitDate" header="Visit Time" sortable />
                <Column field="doctorName" header="Doctor" />
                <Column field="visitType" header="Visit Type" body={visitTypeTemplate} />
                <Column field="status" header="Status" body={statusTemplate} />
                <Column header="Action" body={actionTemplate} style={{ width: '120px' }} />
            </DataTable>
        </>
    );
};
export default TodayVisits;
