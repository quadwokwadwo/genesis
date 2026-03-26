'use client';
import { GeneralPageProps } from '@/libs/utilityComponents';
import { changeDateFormat, defaultSelected, pageDataValidation, remakeDropdown } from '@/libs/utils';
import { CRUDTYPE } from '@/types/enums/enums';
import { TPatient, TPatientState } from '@/types/hospital';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import PatientsModel from '@/libs/blue_prints/Patients';
import PatientExtra from '@/app/(main)/hospital/patients/components/PatientExtra';
import PatientPartnerExtra from '@/app/(main)/hospital/patients/components/PatientPartnerExtra';
import { PatientContext } from '@/libs/contextProviders/AppContexts';
import { validatePatient, validatePatientPartner } from '@/libs/joiValidations';
import PatientsList from '@/libs/dataTables/PatientsList';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';
import { isValid } from 'date-fns';

const INITIAL_STATE: TPatientState = {
    patientForm: {
        patientId: 0,
        firstName: '',
        lastName: '',
        dateOfBirth: null,
        gender: '',
        maritalStatus: '',
        nationality: '',
        occupation: '',
        religion: '',
        address: '',
        phone: '',
        email: '',
        nextOfKinName: '',
        nextOfKinPhone: '',
        recordNumber: '',
        lastVisit: new Date(),
        age: 0
    },
    partnerForm: {
        partnerId: 0,
        firstName: '',
        lastName: '',
        dateOfBirth: null,
        occupation: '',
        phone: '',
        email: '',
        gender: ''
    },
    genders: [],
    maritalStatuses: [],
    selectedGender: defaultSelected(),
    crudType: CRUDTYPE.save,
    tabIndex: 0,
    isLoading: true,
    patientsList: [],
    showDialog: false,
    selectedMaritalStatus: defaultSelected()
};

const patient = new PatientsModel();

const Patients = () => {
    const [state, setState] = useState<TPatientState>(INITIAL_STATE);
    const toast = useRef<Toast>(null);

    useEffect(() => {
        const initPatient = async () => {
            document.title = 'New Patient';
            const patientsList = await getPatientsList();
            setStateValue({
                genders: remakeDropdown([{ name: 'Male' }, { name: 'Female' }, { name: 'Other' }], 'name', 'name'),
                maritalStatuses: remakeDropdown(
                    [{ name: 'Single' }, { name: 'Married' }, { name: 'Divorced' }, { name: 'Widowed' }].map((x) => x),
                    'name',
                    'name'
                ),
                patientsList,
                isLoading: false
            });
        };
        initPatient().catch(console.error);
    }, []);

    const setStateValue = (stateValues: Partial<TPatientState>) => {
        setState((prevState) => ({ ...prevState, ...stateValues }));
    };

    // Basic validation aligned to schema for UX gating
    const onSavePatient = async () => {
        // If your validatePatient expects combined values, keep the existing pattern:
        const { firstName, lastName, dateOfBirth, gender, phone, recordNumber } = state.patientForm;
        if (!pageDataValidation(validatePatient, { firstName, lastName, dateOfBirth, gender, phone, recordNumber }, toast as any)) return;
        try {
            setStateValue({ isLoading: true });

            const response = await patient.addNewPatient(state.patientForm, state.partnerForm, state.crudType);
            // You can add success feedback here
            if (response.operationalStatus === 2) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: 'Record number already exists for a patient. Choose another one!' });
                return;
            }
            if (response.status === 200 && response.operatedData !== undefined) {
                const patientsList = await getPatientsList();
                setStateValue({ patientsList, patientForm: INITIAL_STATE.patientForm, partnerForm: INITIAL_STATE.partnerForm, tabIndex: 0, showDialog: false, isLoading: false });
                toast.current.show({ severity: 'success', summary: 'Success', detail: `Patient ${state.crudType === CRUDTYPE.save ? 'saved' : 'updated'} successfully` });
            }
        } catch (error) {
            console.log(error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'An error occurred while saving the patient' });
        } finally {
            setStateValue({ isLoading: false });
        }
    };
    const getPatientsList = async () => {
        try {
            const data = await patient.getPatientsList();
            return data.operatedData as TPatient[];
        } catch (error) {
            throw new Error(error.message);
        }
    };
    const Footer = () => {
        return (
            <div className="flex justify-content-between w-full">
                <div className="flex">
                    {state.tabIndex === 0 && <Button label="Next" className="mr-2" onClick={onGoToPartnerPage} />}
                    {state.tabIndex === 1 && <Button label="Back" onClick={() => setStateValue({ tabIndex: 0 })} />}
                </div>
                {state.tabIndex === 1 && (
                    <div className="flex justify-content-end">
                        <Button label={state.crudType === CRUDTYPE.save ? 'Save' : 'Update'} icon="pi pi-save" onClick={onSavePatient} loading={state.isLoading} />
                    </div>
                )}
            </div>
        );
    };

    const onGoToPartnerPage = () => {
        // if (!validatePatientStep()) return;
        setStateValue({ tabIndex: 1 });
    };

    const onTabViewChange = (e: TabViewTabChangeEvent) => {
        // if (e.index === 1) onGoToPartnerPage();
        setStateValue({ tabIndex: e.index });
    };
    const startContent = (
        <>
            {state.showDialog === false ? (
                <Button icon="pi pi-plus" label="Add New Patient" className="mr-2" onClick={() => setStateValue({ showDialog: true })} />
            ) : (
                <Button icon="pi pi-arrow-left" label="Go Back to Patients List" className="mr-2" onClick={() => setStateValue({ showDialog: false })} />
            )}
        </>
    );
    const onEditClick = (patient: TPatient) => {
        const { partner, ...rest } = patient;
        const modifiedPartner = JSON.parse(partner as string);
        console.log(partner);

        setStateValue({
            patientForm: {
                ...rest,
                dateOfBirth: new Date(changeDateFormat(new Date(patient.dateOfBirth as Date)))
            },
            showDialog: true,
            tabIndex: 0,
            crudType: CRUDTYPE.update,
            partnerForm: { ...modifiedPartner, dateOfBirth: isValid(modifiedPartner.dateOfBirth) ? changeDateFormat(modifiedPartner.dateOfBirth as Date) : new Date() },
            selectedGender: state.genders.find((gender) => gender.name === patient.gender),
            selectedMaritalStatus: state.maritalStatuses.find((status) => status.name === patient.maritalStatus)
        });
    };
    return (
        <>
            <Toast ref={toast} position={'bottom-right'} baseZIndex={9999} />
            <div className="grid">
                <div className="col-12">
                    <Toolbar start={startContent} className="mb-4" />

                    <PatientContext.Provider value={{ state, setStateValue }}>
                        {!state.showDialog ? (
                            <PatientsList tableData={state.patientsList} setupTableDataEdit={onEditClick} promptTableDataDelete={() => {}} loading={state.isLoading} />
                        ) : (
                            <Card footer={<Footer />}>
                                <TabView activeIndex={state.tabIndex} onTabChange={onTabViewChange}>
                                    <TabPanel header="Patient Information">
                                        <PatientExtra />
                                    </TabPanel>
                                    <TabPanel header="Partner Information">
                                        <PatientPartnerExtra />
                                    </TabPanel>
                                </TabView>
                            </Card>
                        )}
                    </PatientContext.Provider>
                </div>
            </div>
        </>
    );
};
export default Patients;
