'use client';
import React, { useEffect, useRef, useState } from 'react';
import { GeneralPageProps } from '@/libs/utilityComponents';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { Toolbar } from 'primereact/toolbar';
import { CRUDTYPE, USER_ROLES } from '@/types/enums/enums';
import { changeDateFormat, defaultSelected, remakeDropdown, pageDataValidation } from '@/libs/utils';
import DoctorBasicInfo from './components/DoctorBasicInfo';
import DoctorCredentials from './components/DoctorCredentials';
import { Doctor, DoctorCredential, User } from '@/types/hospital';
import { DoctorContext } from '@/libs/contextProviders/AppContexts';
import DoctorsList from '@/app/(main)/hospital/users/doctors/components/DoctorsList';
import { DoctorState } from '@/types/hospital/hospital';
import UsersModel from '@/libs/blue_prints/UsersModel';
import { validateDoctor } from '@/libs/joiValidations';

const INITIAL_STATE: DoctorState = {
    doctorForm: {
        firstName: '',
        lastName: '',
        gender: '',
        dateOfBirth: changeDateFormat(new Date()),
        phoneNumber: '',
        email: '',
        specialization: '',
        hireDate: changeDateFormat(new Date()),
        employmentStatus: 'active',
        role: USER_ROLES.admin,
        username: '',
        password: ''
    },
    credentials: [],
    genders: [],
    employmentStatuses: [],
    specializations: [],
    selectedGender: defaultSelected(),
    selectedEmploymentStatus: defaultSelected(),
    selectedSpecialization: defaultSelected(),
    crudType: CRUDTYPE.save,
    tabIndex: 0,
    isLoading: true,
    doctorsList: [],
    showDialog: false,
    showCredentialDialog: false,
    editingCredentialIndex: -1,
    rolesList: [],
    selectedRole: defaultSelected()
};

const users = new UsersModel();
const Users = () => {
    const [state, setState] = useState<DoctorState>(INITIAL_STATE);
    const toast = useRef(null);

    useEffect(() => {
        const initDoctors = async () => {
            document.title = 'Doctor Management';

            const doctorsList: Doctor[] = await getDoctorsList();

            setStateValue({
                genders: remakeDropdown(
                    [
                        { name: 'Male', code: 'male' },
                        { name: 'Female', code: 'female' },
                        { name: 'Other', code: 'other' }
                    ],
                    'name',
                    'code'
                ),
                rolesList: remakeDropdown(
                    [
                        { name: 'Doctor', code: 'doctor' },
                        { name: 'Nurse', code: 'nurse' },
                        { name: 'Lab Tech', code: 'lab_tech' },
                        { name: 'Admin', code: 'admin' }
                    ],
                    'name',
                    'code'
                ),
                employmentStatuses: remakeDropdown(
                    [
                        { name: 'Active', code: 'active' },
                        { name: 'Inactive', code: 'inactive' },
                        { name: 'Retired', code: 'retired' },
                        { name: 'On Leave', code: 'on_leave' }
                    ],
                    'name',
                    'code'
                ),
                specializations: remakeDropdown(
                    [{ name: 'Fertility Specialist' }, { name: 'Reproductive Endocrinologist' }, { name: 'OB/GYN' }, { name: 'Urologist' }, { name: 'Embryologist' }, { name: 'Genetic Counselor' }, { name: 'Nurse Practitioner' }],
                    'name',
                    'name'
                ),
                doctorsList,
                selectedEmploymentStatus: { name: 'Active', code: 'active' },
                isLoading: false
            });
        };
        initDoctors().catch(console.error);
    }, []);

    const setStateValue = (stateValues: Partial<DoctorState>) => {
        setState((prevState) => ({ ...prevState, ...stateValues }));
    };

    const addNewCredential = (credential: DoctorCredential) => {
        setState((prev) => ({
            ...prev,
            credentials: [...prev.credentials, credential]
        }));
    };

    const updateCredential = (index: number, credential: DoctorCredential) => {
        setState((prev) => ({
            ...prev,
            credentials: prev.credentials.map((cred, i) => (i === index ? credential : cred))
        }));
    };

    const removeCredential = (index: number) => {
        setState((prev) => ({
            ...prev,
            credentials: prev.credentials.filter((_, i) => i !== index)
        }));
    };

    const validateDoctorStep = (): boolean => {
        return pageDataValidation(validateDoctor, state.doctorForm, toast);
    };

    const onSaveDoctor = async () => {
        try {
            if (!pageDataValidation(validateDoctor, state.doctorForm, toast)) return;
            setStateValue({ isLoading: true });
            const response = await users.addNewUser(state.doctorForm, state.credentials, state.crudType);
            if (response.status === 200 && response.operatedData !== undefined) {
                if (state.crudType === CRUDTYPE.save) {
                    setStateValue({ doctorsList: [...state.doctorsList, response.operatedData as User] });
                } else {
                    setStateValue({ doctorsList: state.doctorsList.map((doctor) => (doctor.userId === response.operatedData.userId ? (response.operatedData as User) : doctor)) });
                }
            }
            // Reset form
            resetForm();
        } catch (error) {
            console.error(error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'An error occurred while saving the doctor'
            });
        } finally {
            setStateValue({ isLoading: false });
        }
    };
    const getDoctorsList = async () => {
        try {
            const data = await users.getUserList();
            console.log(data);
            return data.operatedData as User[];
        } catch (error) {
            throw new Error(error.message);
        }
    };
    const resetForm = () => {
        setStateValue({
            doctorForm: {
                firstName: '',
                lastName: '',
                gender: '',
                dateOfBirth: null,
                phoneNumber: '',
                email: '',
                specialization: '',
                hireDate: null,
                employmentStatus: 'active'
            },
            credentials: [],
            selectedGender: defaultSelected(),
            selectedEmploymentStatus: { name: 'Active', code: 'active' },
            selectedSpecialization: defaultSelected(),
            tabIndex: 0,
            showDialog: false,
            crudType: CRUDTYPE.save
        });
    };

    const Footer = () => {
        return (
            <div className="flex justify-content-between w-full">
                <div className="flex">
                    {state.tabIndex === 0 && (
                        <Button
                            label="Next"
                            className="mr-2"
                            onClick={() => {
                                if (validateDoctorStep()) {
                                    setStateValue({ tabIndex: 1 });
                                }
                            }}
                        />
                    )}
                    {state.tabIndex === 1 && <Button label="Back" onClick={() => setStateValue({ tabIndex: 0 })} />}
                </div>
                {state.tabIndex === 1 && (
                    <div className="flex justify-content-end">
                        <Button label={state.crudType === CRUDTYPE.save ? 'Save Doctor' : 'Update Doctor'} icon="pi pi-save" onClick={onSaveDoctor} loading={state.isLoading} />
                    </div>
                )}
            </div>
        );
    };

    const onTabViewChange = (e: TabViewTabChangeEvent) => {
        // if (e.index === 1 && !validateDoctorStep()) return;
        setStateValue({ tabIndex: e.index });
    };

    const startContent = () => {
        return (
            <>
                {state.showDialog === false ? (
                    <Button loading={state.isLoading} icon="pi pi-plus" className="mr-2" onClick={() => setStateValue({ showDialog: true })} tooltip="Add New Doctor" />
                ) : (
                    <Button icon="pi pi-arrow-left" className="mr-2" onClick={() => setStateValue({ showDialog: false })} tooltip="Return" />
                )}
            </>
        );
    };

    return (
        <>
            <div className="grid">
                <div className="col-12">
                    <Toolbar start={startContent} className="mb-4" />

                    <DoctorContext.Provider
                        value={{
                            state,
                            setStateValue,
                            addNewCredential,
                            updateCredential,
                            removeCredential
                        }}
                    >
                        {!state.showDialog ? (
                            <DoctorsList />
                        ) : (
                            <>
                                <Card footer={<Footer />}>
                                    <TabView activeIndex={state.tabIndex} onTabChange={onTabViewChange}>
                                        <TabPanel header="Basic Information" leftIcon="pi pi-user">
                                            <DoctorBasicInfo />
                                        </TabPanel>
                                        <TabPanel header="Medical Credentials" leftIcon="pi pi-certificate">
                                            <DoctorCredentials />
                                        </TabPanel>
                                    </TabView>
                                </Card>
                            </>
                        )}
                    </DoctorContext.Provider>
                </div>
            </div>
            <GeneralPageProps toastRef={toast} toastPosition="bottom-center" />
        </>
    );
};

export default Users;
