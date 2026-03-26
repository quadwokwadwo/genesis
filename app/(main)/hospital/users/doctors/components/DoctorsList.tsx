import { useDoctorContext } from '@/libs/contextProviders/AppContexts';
import { Card } from 'primereact/card';
import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Doctor, EmploymentStatus, User } from '@/types/hospital';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { changeDateFormat, defaultSelected } from '@/libs/utils';
import { CRUDTYPE } from '@/types/enums/enums';

const DoctorsList = () => {
    const { state, setStateValue } = useDoctorContext();

    const onEditClick = (doctor: User) => {
        console.log(doctor);
        const { credentials, ...rest } = doctor;
        setStateValue({
            doctorForm: {
                ...rest,
                dateOfBirth: doctor.dateOfBirth ? new Date(changeDateFormat(doctor.dateOfBirth as Date)) : null,
                hireDate: doctor.hireDate ? new Date(changeDateFormat(doctor.hireDate as Date)) : null,
                password: '@New12345678'
            },
            credentials: typeof doctor.credentials === 'string' ? JSON.parse(doctor.credentials) : doctor.credentials,
            showDialog: true,
            tabIndex: 0,
            crudType: CRUDTYPE.update,
            selectedGender: state.genders.find((g) => g.code === doctor.gender) || defaultSelected(),
            selectedEmploymentStatus: state.employmentStatuses.find((s) => s.code === doctor.employmentStatus) || defaultSelected(),
            selectedSpecialization: state.specializations.find((s) => s.name === doctor.specialization) || defaultSelected(),
            selectedRole: state.rolesList.find((_role) => _role.code === doctor.role) || defaultSelected()
        });
    };

    const getEmploymentStatusSeverity = (status: EmploymentStatus) => {
        switch (status) {
            case 'active':
                return 'success';
            case 'inactive':
                return 'warning';
            case 'retired':
                return 'info';
            case 'on_leave':
                return 'info';
            default:
                return 'info';
        }
    };

    const doctorNameTemplate = (doctor: Doctor) => {
        return (
            <div className="flex align-items-center gap-3">
                <Avatar label={`${doctor.firstName.charAt(0)}${doctor.lastName.charAt(0)}`} shape="circle" className="bg-primary" />
                <div>
                    <div className="font-bold">
                        {' '}
                        {doctor.firstName} {doctor.lastName}
                    </div>
                    <div className="text-sm text-600">{doctor.role.toUpperCase()}</div>
                </div>
            </div>
        );
    };

    const statusTemplate = (doctor: Doctor) => {
        return <Tag value={doctor.employmentStatus.charAt(0).toUpperCase() + doctor.employmentStatus.slice(1).replace('_', ' ')} severity={getEmploymentStatusSeverity(doctor.employmentStatus)} />;
    };

    const actionTemplate = (doctor: Doctor) => {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-text p-button-sm" onClick={() => onEditClick(doctor)} tooltip="Edit Doctor" />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-text p-button-sm p-button-danger" tooltip="Delete Doctor" />
            </div>
        );
    };
    return (
        <>
            <Card className="shadow-2">
                <div className="flex align-items-center mb-4">
                    <i className="pi pi-users text-primary text-2xl mr-3" />
                    <div>
                        <h4 className="m-0 text-primary">Staff Management</h4>
                        <p className="text-600 m-0">Manage medical staff information and credentials</p>
                    </div>
                </div>

                <DataTable value={state.doctorsList} paginator rows={10} emptyMessage="No doctors found" responsiveLayout="scroll" className="p-datatable-sm" loading={state.isLoading}>
                    <Column header="Doctor" body={doctorNameTemplate} style={{ minWidth: '250px' }} />
                    <Column field="phoneNumber" header="Phone" style={{ minWidth: '150px' }} />
                    <Column field="email" header="Email" style={{ minWidth: '200px' }} />
                    <Column field="hireDate" header="Hire Date" body={(doctor) => (doctor.hireDate ? new Date(doctor.hireDate).toLocaleDateString() : '-')} style={{ minWidth: '120px' }} />
                    <Column header="Status" body={statusTemplate} style={{ minWidth: '120px' }} />
                    <Column header="Actions" body={actionTemplate} style={{ width: '120px' }} />
                </DataTable>
            </Card>
        </>
    );
};
export default DoctorsList;
