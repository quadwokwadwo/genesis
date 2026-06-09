'use client';
import { changeDateFormat, defaultSelected, pageDataValidation, remakeDropdown } from '@/libs/utils';
import { CRUDTYPE } from '@/types/enums/enums';
import { TPatient, TPatientState } from '@/types/hospital';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { DataTable, DataTablePageEvent, DataTableSortEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import PatientsModel, { PatientListQuery } from '@/libs/blue_prints/Patients';
import PatientExtra from '@/app/(main)/hospital/patients/components/PatientExtra';
import PatientPartnerExtra from '@/app/(main)/hospital/patients/components/PatientPartnerExtra';
import { PatientContext } from '@/libs/contextProviders/AppContexts';
import { validatePatient } from '@/libs/joiValidations';
import { tableEditOption } from '@/libs/utilityComponents';
import { calcAgeFromDOB } from '@/libs/utils';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';
import { isValid } from 'date-fns';

type ListState = {
    first: number;
    rows: number;
    totalRecords: number;
    sortField: PatientListQuery['sortBy'];
    sortOrder: 1 | -1;
    search: string;
    searchInput: string;
    loading: boolean;
    items: TPatient[];
};

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
    isLoading: false,
    patientsList: [],
    showDialog: false,
    selectedMaritalStatus: defaultSelected()
};

const INITIAL_LIST: ListState = {
    first: 0,
    rows: 20,
    totalRecords: 0,
    sortField: 'lastVisit',
    sortOrder: -1,
    search: '',
    searchInput: '',
    loading: true,
    items: []
};

const patient = new PatientsModel();

const Patients = () => {
    const [state, setState] = useState<TPatientState>(INITIAL_STATE);
    const [list, setList] = useState<ListState>(INITIAL_LIST);
    const toast = useRef<Toast>(null);
    const router = useRouter();
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const setStateValue = (stateValues: Partial<TPatientState>) => {
        setState((prevState) => ({ ...prevState, ...stateValues }));
    };
    const setListValue = (vals: Partial<ListState>) => setList((prev) => ({ ...prev, ...vals }));

    const fetchList = async (override: Partial<ListState> = {}) => {
        const merged = { ...list, ...override };
        setListValue({ loading: true });
        try {
            const data = await patient.getPatientsList({
                page: Math.floor(merged.first / merged.rows) + 1,
                pageSize: merged.rows,
                search: merged.search || undefined,
                sortBy: merged.sortField,
                sortDir: merged.sortOrder === 1 ? 'asc' : 'desc'
            });
            setListValue({ items: data.rows, totalRecords: data.total, loading: false });
        } catch (error: any) {
            setListValue({ loading: false });
            toast.current?.show({ severity: 'error', summary: 'Error', detail: error?.message || 'Failed to load patients' });
        }
    };

    useEffect(() => {
        document.title = 'Patients';
        setStateValue({
            genders: remakeDropdown([{ name: 'Male' }, { name: 'Female' }, { name: 'Other' }], 'name', 'name'),
            maritalStatuses: remakeDropdown([{ name: 'Single' }, { name: 'Married' }, { name: 'Divorced' }, { name: 'Widowed' }], 'name', 'name')
        });
        fetchList();
        return () => {
            if (searchTimer.current) clearTimeout(searchTimer.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSearchChange = (value: string) => {
        setListValue({ searchInput: value });
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            fetchList({ search: value, first: 0 });
            setListValue({ search: value, first: 0 });
        }, 400);
    };

    const onPage = (e: DataTablePageEvent) => {
        const next = { first: e.first, rows: e.rows };
        setListValue(next);
        fetchList(next);
    };

    const onSort = (e: DataTableSortEvent) => {
        const next = { sortField: (e.sortField as PatientListQuery['sortBy']) || 'lastVisit', sortOrder: (e.sortOrder ?? -1) as 1 | -1, first: 0 };
        setListValue(next);
        fetchList(next);
    };

    const onSavePatient = async () => {
        const { firstName, lastName, dateOfBirth, gender, phone, recordNumber } = state.patientForm;
        if (!pageDataValidation(validatePatient, { firstName, lastName, dateOfBirth, gender, phone, recordNumber }, toast as any)) return;
        try {
            setStateValue({ isLoading: true });
            const response = await patient.addNewPatient(state.patientForm, state.partnerForm, state.crudType);
            if (response.operationalStatus === 2) {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Record number already exists for a patient. Choose another one!' });
                return;
            }
            // Server validation failure → surface message from envelope
            if (response.status === 422) {
                const msg = (response as any)?.message || 'Validation failed. Check the highlighted fields.';
                toast.current?.show({ severity: 'warn', summary: 'Validation', detail: msg });
                return;
            }
            if (response.status === 200 && response.operatedData !== undefined) {
                setStateValue({ patientForm: INITIAL_STATE.patientForm, partnerForm: INITIAL_STATE.partnerForm, tabIndex: 0, showDialog: false, isLoading: false });
                toast.current?.show({ severity: 'success', summary: 'Success', detail: `Patient ${state.crudType === CRUDTYPE.save ? 'saved' : 'updated'} successfully` });
                fetchList({ first: 0 });
            }
        } catch (error: any) {
            const msg = error?.response?.data?.message || error?.message || 'An error occurred while saving the patient';
            toast.current?.show({ severity: 'error', summary: 'Error', detail: msg });
        } finally {
            setStateValue({ isLoading: false });
        }
    };

    const onEditClick = (row: TPatient) => {
        const { partner, ...rest } = row;
        const modifiedPartner = typeof partner === 'string' ? JSON.parse(partner) : partner || {};
        setStateValue({
            patientForm: { ...(rest as TPatient), dateOfBirth: new Date(changeDateFormat(new Date(row.dateOfBirth as Date))) },
            showDialog: true,
            tabIndex: 0,
            crudType: CRUDTYPE.update,
            partnerForm: { ...modifiedPartner, dateOfBirth: isValid(modifiedPartner.dateOfBirth) ? changeDateFormat(modifiedPartner.dateOfBirth as Date) : new Date() },
            selectedGender: state.genders.find((gender) => gender.name === row.gender),
            selectedMaritalStatus: state.maritalStatuses.find((s) => s.name === row.maritalStatus)
        });
    };

    const onViewClick = (row: TPatient) => router.push(`/hospital/patients/${row.patientId}`);

    const Footer = () => (
        <div className="flex justify-content-between w-full">
            <div className="flex">
                {state.tabIndex === 0 && <Button label="Next" className="mr-2" onClick={() => setStateValue({ tabIndex: 1 })} />}
                {state.tabIndex === 1 && <Button label="Back" onClick={() => setStateValue({ tabIndex: 0 })} />}
            </div>
            {state.tabIndex === 1 && (
                <div className="flex justify-content-end">
                    <Button label={state.crudType === CRUDTYPE.save ? 'Save' : 'Update'} icon="pi pi-save" onClick={onSavePatient} loading={state.isLoading} />
                </div>
            )}
        </div>
    );

    const onTabViewChange = (e: TabViewTabChangeEvent) => setStateValue({ tabIndex: e.index });

    const startContent = (
        <div className="flex align-items-center gap-2">
            {state.showDialog === false ? (
                <Button icon="pi pi-plus" label="Add New Patient" className="mr-2" onClick={() => setStateValue({ showDialog: true })} />
            ) : (
                <Button icon="pi pi-arrow-left" label="Back to Patients List" className="mr-2" onClick={() => setStateValue({ showDialog: false })} />
            )}
        </div>
    );
    const endContent = !state.showDialog ? (
        <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText placeholder="Search by name, phone, record #" value={list.searchInput} onChange={(e) => onSearchChange(e.target.value)} />
        </span>
    ) : null;

    const actionsBody = (rowData: TPatient) => (
        <div className="flex gap-1">
            <Button icon="pi pi-eye" rounded text severity="info" tooltip="View" onClick={() => onViewClick(rowData)} />
            {tableEditOption(
                () => onEditClick(rowData),
                () => {}
            )}
        </div>
    );

    return (
        <>
            <Toast ref={toast} position={'bottom-right'} baseZIndex={9999} />
            <div className="grid">
                <div className="col-12">
                    <Toolbar start={startContent} end={endContent} className="mb-4" />

                    <PatientContext.Provider value={{ state, setStateValue }}>
                        {!state.showDialog ? (
                            <DataTable
                                value={list.items}
                                dataKey="patientId"
                                lazy
                                paginator
                                first={list.first}
                                rows={list.rows}
                                rowsPerPageOptions={[10, 20, 50, 100]}
                                totalRecords={list.totalRecords}
                                onPage={onPage}
                                onSort={onSort}
                                sortField={list.sortField as string}
                                sortOrder={list.sortOrder}
                                loading={list.loading}
                                emptyMessage="No patients found"
                                responsiveLayout="scroll"
                            >
                                <Column field="patientId" header="ID" sortable style={{ width: '6rem' }} />
                                <Column field="recordNumber" header="Record #" sortable />
                                <Column field="firstName" header="First Name" sortable />
                                <Column field="lastName" header="Last Name" sortable />
                                <Column field="gender" header="Gender" />
                                <Column header="Age" body={(r: TPatient) => `${calcAgeFromDOB(new Date(r.dateOfBirth))} yrs`} />
                                <Column field="phone" header="Phone" />
                                <Column field="lastVisit" header="Last Visit" sortable body={(r: TPatient) => (r.lastVisit ? changeDateFormat(new Date(r.lastVisit)) : '—')} />
                                <Column header="Actions" body={actionsBody} style={{ width: '10rem' }} />
                            </DataTable>
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
