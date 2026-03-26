import React from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { useDoctorContext } from '@/libs/contextProviders/AppContexts';

const DoctorBasicInfo: React.FC = () => {
    const { state, setStateValue } = useDoctorContext();

    const updateDoctorForm = (field: string, value: any) => {
        setStateValue({
            doctorForm: { ...state.doctorForm, [field]: value }
        });
    };

    return (
        <div className="flex flex-col gap-4 justify-content-center">
            <Card className="shadow-2 w-full">
                <div className="flex flex-column justify-content-center align-items-center mb-4">
                    <div className="flex align-items-center mb-4">
                        <i className="pi pi-user text-primary text-2xl mr-3" />
                        <div>
                            <h4 className="m-0 text-primary">Staff Basic Information</h4>
                            <p className="text-600 m-0">Enter personal and contact details</p>
                        </div>
                    </div>

                    <div className="flex flex-column lg:w-6 w-12">
                        <div className="field col-12">
                            <label className="font-semibold mb-2 block">
                                <i className="pi pi-user mr-2" />
                                First Name *
                            </label>
                            <InputText value={state.doctorForm.firstName} onChange={(e) => updateDoctorForm('firstName', e.target.value)} placeholder="Enter first name" className="w-full" maxLength={100} />
                        </div>

                        <div className="field col-12">
                            <label className="font-semibold mb-2 block">
                                <i className="pi pi-user mr-2" />
                                Last Name *
                            </label>
                            <InputText value={state.doctorForm.lastName} onChange={(e) => updateDoctorForm('lastName', e.target.value)} placeholder="Enter last name" className="w-full" maxLength={100} />
                        </div>
                        <div className="field col-12">
                            <label className="font-semibold mb-2 block">
                                <i className="pi pi-users mr-2" />
                                Role *
                            </label>
                            <Dropdown
                                value={state.selectedRole}
                                onChange={(e) => {
                                    setStateValue({ selectedRole: e.value });
                                    updateDoctorForm('role', e.value?.code || '');
                                }}
                                options={state.rolesList}
                                optionLabel="name"
                                placeholder="Select Role"
                                className="w-full"
                            />
                        </div>
                        <div className="field col-12">
                            <label className="font-semibold mb-2 block">
                                <i className="pi pi-users mr-2" />
                                Gender *
                            </label>
                            <Dropdown
                                value={state.selectedGender}
                                onChange={(e) => {
                                    setStateValue({ selectedGender: e.value });
                                    updateDoctorForm('gender', e.value?.code || '');
                                }}
                                options={state.genders}
                                optionLabel="name"
                                placeholder="Select gender"
                                className="w-full"
                            />
                        </div>

                        <div className="field col-12 ">
                            <label className="font-semibold mb-2 block">
                                <i className="pi pi-calendar mr-2" />
                                Date of Birth
                            </label>
                            <Calendar
                                value={state.doctorForm.dateOfBirth as Date}
                                onChange={(e) => updateDoctorForm('dateOfBirth', e.value)}
                                showIcon
                                dateFormat="dd M yy"
                                maxDate={new Date()}
                                yearRange="1950:2010"
                                placeholder="Select date of birth"
                                className="w-full"
                            />
                        </div>

                        <div className="field col-12">
                            <label className="font-semibold mb-2 block">
                                <i className="pi pi-phone mr-2" />
                                Phone Number *
                            </label>
                            <InputText value={state.doctorForm.phoneNumber} onChange={(e) => updateDoctorForm('phoneNumber', e.target.value)} placeholder="Enter phone number" className="w-full" maxLength={20} keyfilter="pnum" />
                        </div>

                        <div className="field col-12">
                            <label className="font-semibold mb-2 block">
                                <i className="pi pi-envelope mr-2" />
                                Email Address *
                            </label>
                            <InputText value={state.doctorForm.email} onChange={(e) => updateDoctorForm('email', e.target.value)} placeholder="Enter email address" className="w-full" maxLength={150} keyfilter="email" />
                        </div>

                        <div className="field col-12">
                            <label className="font-semibold mb-2 block">
                                <i className="pi pi-briefcase mr-2" />
                                Specialization *
                            </label>
                            <Dropdown
                                value={state.selectedSpecialization}
                                onChange={(e) => {
                                    setStateValue({ selectedSpecialization: e.value });
                                    updateDoctorForm('specialization', e.value?.name || '');
                                }}
                                options={state.specializations}
                                optionLabel="name"
                                placeholder="Select specialization"
                                className="w-full"
                                filter
                                editable
                                // onInput={(e) => updateDoctorForm('specialization', e.target.value)}
                            />
                        </div>

                        <div className="field col-12">
                            <label className="font-semibold mb-2 block">
                                <i className="pi pi-calendar-plus mr-2" />
                                Hire Date *
                            </label>
                            <Calendar value={state.doctorForm.hireDate as Date} onChange={(e) => updateDoctorForm('hireDate', e.value)} showIcon dateFormat="dd M yy" maxDate={new Date()} placeholder="Select hire date" className="w-full" />
                        </div>

                        <div className="field col-12">
                            <label className="font-semibold mb-2 block">
                                <i className="pi pi-check-circle mr-2" />
                                Employment Status
                            </label>
                            <Dropdown
                                value={state.selectedEmploymentStatus}
                                onChange={(e) => {
                                    setStateValue({ selectedEmploymentStatus: e.value });
                                    updateDoctorForm('employmentStatus', e.value?.code || 'active');
                                }}
                                options={state.employmentStatuses}
                                optionLabel="name"
                                placeholder="Select employment status"
                                className="w-full"
                            />
                        </div>
                        <div className="field col-12">
                            <label className="font-semibold mb-2 block">
                                <i className="pi pi-user mr-2" />
                                Username *
                            </label>
                            <InputText value={state.doctorForm.username} onChange={(e) => updateDoctorForm('username', e.target.value)} placeholder="Enter user name" className="w-full" maxLength={100} />
                        </div>
                        <div className="field col-12">
                            <label className="font-semibold mb-2 block">
                                <i className="pi pi-lock mr-2" />
                                Password *
                            </label>
                            <InputText value={state.doctorForm.password} onChange={(e) => updateDoctorForm('password', e.target.value)} placeholder="Enter user password" className="w-full" maxLength={100} type={'password'} />
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default DoctorBasicInfo;
