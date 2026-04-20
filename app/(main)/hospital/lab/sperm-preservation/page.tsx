'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { AutoComplete } from 'primereact/autocomplete';
import { Tag } from 'primereact/tag';
import { Toolbar } from 'primereact/toolbar';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { ColorPicker } from 'primereact/colorpicker';
import { Panel } from 'primereact/panel';
import { Chip } from 'primereact/chip';
import { Divider } from 'primereact/divider';
import { Badge } from 'primereact/badge';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import { TPatient, User } from '@/types/hospital';
import PatientsModel from '@/libs/blue_prints/Patients';
import { TSpermPreservation } from '@/types/semen/semen';
import spermTankService from '@/libs/blue_prints/SpermTankService';
import { CRUDTYPE } from '@/types/enums/enums';
import useUserData from '@/libs/hooks/useUserData';

const INITIAL_STATE: TSpermPreservation = {
    canister: '1',
    goblet: '1',
    strawNumber: null,
    gobletColorCode: '#3b82f6',
    strawColorCode: '#3b82f6',
    patientId: null,
    notes: '',
    preservationDate: new Date(),
    userId: 0,
    status: 'Active'
};

// Color presets for quick selection
const colorPresets = [
    { label: 'Blue', value: '#3b82f6' },
    { label: 'Green', value: '#10b981' },
    { label: 'Yellow', value: '#f59e0b' },
    { label: 'Red', value: '#ef4444' },
    { label: 'Purple', value: '#8b5cf6' },
    { label: 'Pink', value: '#ec4899' },
    { label: 'Orange', value: '#f97316' },
    { label: 'Teal', value: '#14b8a6' }
];
const patientService = new PatientsModel();
export default function SpermPreservationPage() {
    const [currentView, setCurrentView] = useState<'grid' | 'form' | 'visual'>('grid');
    const [formData, setFormData] = useState<TSpermPreservation>(INITIAL_STATE);
    const [preservations, setPreservations] = useState<TSpermPreservation[]>([]);
    const [crudType, setCrudType] = useState<CRUDTYPE>(CRUDTYPE.save);
    const [patientsList, setPatientsList] = useState<TPatient[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [errors, setErrors] = useState<any>({});
    const [isLoading, setIsLoading] = useState(false);

    // Patient search
    const [selectedPatient, setSelectedPatient] = useState<TPatient | null>(null);
    const [filteredPatients, setFilteredPatients] = useState<TPatient[]>([]);
    const [showPatientDialog, setShowPatientDialog] = useState(false);

    // Storage visualization
    const [showStorageMap, setShowStorageMap] = useState(false);
    const [selectedCanister, setSelectedCanister] = useState<string | null>(null);

    // Filters
    const [globalFilter, setGlobalFilter] = useState('');
    const [selectedCanisterFilter, setSelectedCanisterFilter] = useState<string | null>(null);
    const { user } = useUserData<User>();

    const toastRef = React.useRef<any>(null);

    const canisterOptions = [
        { label: 'Canister 1', value: '1', icon: 'pi pi-box' },
        { label: 'Canister 2', value: '2', icon: 'pi pi-box' },
        { label: 'Canister 3', value: '3', icon: 'pi pi-box' },
        { label: 'Canister 4', value: '4', icon: 'pi pi-box' },
        { label: 'Canister 5', value: '5', icon: 'pi pi-box' },
        { label: 'Canister 6', value: '6', icon: 'pi pi-box' }
    ];

    const gobletOptions = [
        { label: 'Goblet 1', value: '1' },
        { label: 'Goblet 2', value: '2' },
        { label: 'Goblet 3', value: '3' },
        { label: 'Goblet 4', value: '4' },
        { label: 'Goblet 5', value: '5' }
    ];
    const statusOptions = [
        { label: 'Active', value: 'Active' },
        { label: 'InActive', value: 'InActive' }
    ];
    useEffect(() => {
        const initPage = async () => {
            const patients = await patientService.getPatientsList();
            const spermTankData = await spermTankService.getSpermTankData();
            setPatientsList(patients.operatedData);
            setPreservations(spermTankData.data.operatedData);
        };
        initPage();
        document.title = 'Sperm Bank';
    }, []);

    const getPartnerFromPatient = (p?: TPatient | null) => {
        if (!p || !p.partner) return null;
        try {
            const partner = typeof p.partner === 'string' ? JSON.parse(p.partner) : p.partner;
            if (partner && typeof partner === 'object') return partner as any;
        } catch {}
        return null;
    };

    // Patient search functions
    const searchPatient = (event: any) => {
        const query = event.query.toLowerCase();
        const filtered = patientsList.filter((p) => p.firstName.toLowerCase().includes(query) || p.lastName.toLowerCase().includes(query) || p.recordNumber.toString().includes(query) || p.address?.toLowerCase().includes(query));
        setFilteredPatients(filtered);
    };

    const onPatientSelect = (patient: TPatient) => {
        setSelectedPatient(patient);
        setFormData({ ...formData, patientId: patient.patientId });
        if (errors.patientId) {
            setErrors({ ...errors, patientId: null });
        }
    };

    const updateFormData = (field: string, value: any) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: null });
        }
    };

    const validateForm = () => {
        const newErrors: any = {};

        if (!formData.patientId) newErrors.patientId = 'Patient is required';
        if (!formData.canister) newErrors.canister = 'Canister is required';
        if (!formData.goblet) newErrors.goblet = 'Goblet is required';
        if (!formData.strawNumber) newErrors.strawNumber = 'Straw number is required';

        // Check for duplicate location
        const duplicateLocation = preservations.find((p) => p.canister === formData.canister && p.goblet === formData.goblet && p.strawNumber === formData.strawNumber && p.semenPreservationTankId !== editingId);

        if (duplicateLocation) {
            newErrors.strawNumber = 'This storage location is already occupied';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNewEntry = () => {
        setFormData(INITIAL_STATE);
        setSelectedPatient(null);
        setEditingId(null);
        setErrors({});
        setCurrentView('form');
    };

    const handleEdit = (record: TSpermPreservation) => {
        console.log(record);
        setFormData(record);
        const patient = patientsList.find((p) => p.patientId === record.patientId);
        setSelectedPatient(patient || null);
        setEditingId(record.semenPreservationTankId || null);
        setCurrentView('form');
        setCrudType(CRUDTYPE.update);
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            toastRef.current?.show({
                severity: 'error',
                summary: 'Validation Error',
                detail: 'Please fill all required fields correctly',
                life: 3000
            });
            return;
        }

        try {
            const dataToSave = {
                ...formData,
                preservationDate: formData.preservationDate || new Date(),
                userId: user.userId
            };
            setIsLoading(true);
            const response = await spermTankService.saveSperm(dataToSave, crudType);

            if (response.data.status === 2) {
                toastRef.current?.show({ severity: 'info', summary: 'Record Exists', detail: 'Similar Record with the same parameters exists.', life: 3000 });
                return;
            }
            if (response.status === 200 && response.data.operatedData !== undefined) {
                if (crudType === CRUDTYPE.save) {
                    setPreservations([...preservations, response.data.operatedData]);
                    toastRef.current?.show({ severity: 'success', summary: 'Saved', detail: 'New preservation record saved successfully', life: 3000 });
                } else {
                    setPreservations(preservations.map((p) => (p.semenPreservationTankId === editingId ? response.data.operatedData : p)));
                    toastRef.current?.show({ severity: 'success', summary: 'Updated', detail: 'Preservation record updated successfully', life: 3000 });
                }
                setCurrentView('grid');
                setFormData(INITIAL_STATE);
                setSelectedPatient(null);
                setEditingId(null);
                setCrudType(CRUDTYPE.save);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = (id: number) => {
        confirmDialog({
            message: 'Are you sure you want to delete this preservation record? This action cannot be undone.',
            header: 'Delete Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            accept: () => {
                setPreservations(preservations.filter((p) => p.semenPreservationTankId !== id));
                toastRef.current?.show({
                    severity: 'info',
                    summary: 'Deleted',
                    detail: 'Record deleted successfully',
                    life: 3000
                });
            }
        });
    };

    const handleCancel = () => {
        setCurrentView('grid');
        setFormData(INITIAL_STATE);
        setSelectedPatient(null);
        setEditingId(null);
        setErrors({});
    };

    // Get next available straw number for a location
    const getNextStrawNumber = (canister: string, goblet: string) => {
        const existing = preservations.filter((p) => p.canister === canister && p.goblet === goblet);
        if (existing.length === 0) return 1001;
        const maxStraw = Math.max(...existing.map((p) => p.strawNumber || 0));
        return maxStraw + 1;
    };

    const suggestStrawNumber = () => {
        const nextNumber = getNextStrawNumber(formData.canister, formData.goblet);
        updateFormData('strawNumber', nextNumber);
        toastRef.current?.show({
            severity: 'info',
            summary: 'Suggested',
            detail: `Next available straw number: ${nextNumber}`,
            life: 2000
        });
    };

    // DataTable templates
    const patientBodyTemplate = (rowData: TSpermPreservation) => {
        const patient = patientsList.find((p) => p.patientId === rowData.patientId);
        const partner = getPartnerFromPatient(patient);
        return (
            <div className="flex align-items-center gap-2">
                <i className="pi pi-user text-primary text-xl"></i>
                <div>
                    <div className="font-semibold text-900">{`${patient.firstName} ${patient.lastName}`}</div>
                    <div className="text-sm text-600">ID: {patient.recordNumber}</div>
                    {partner && <div className="text-sm text-yellow-700"><i className="pi pi-users mr-1" style={{ fontSize: '0.75rem' }}></i>Partner: {`${partner.firstName ?? ''} ${partner.lastName ?? ''}`.trim() || '—'}</div>}
                </div>
            </div>
        );
    };

    const locationBodyTemplate = (rowData: TSpermPreservation) => {
        return (
            <div className="flex flex-column gap-2">
                <div className="flex align-items-center gap-2">
                    <Tag value={`C${rowData.canister}-G${rowData.goblet}-S${rowData.strawNumber}`} severity="info" icon="pi pi-map-marker" />
                </div>
                <div className="flex align-items-center gap-2">
                    <div
                        style={{
                            width: '20px',
                            height: '20px',
                            backgroundColor: rowData.gobletColorCode,
                            borderRadius: '4px',
                            border: '2px solid #dee2e6',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                    />
                    <span className="text-sm text-600 font-mono">{rowData.gobletColorCode} (Goblet)</span>
                </div>
                <div className="flex align-items-center gap-2">
                    <div
                        style={{
                            width: '20px',
                            height: '20px',
                            backgroundColor: rowData.strawColorCode,
                            borderRadius: '4px',
                            border: '2px solid #dee2e6',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                    />
                    <span className="text-sm text-600 font-mono">{rowData.strawColorCode} (Straw)</span>
                </div>
            </div>
        );
    };

    const dateBodyTemplate = (rowData: TSpermPreservation) => {
        if (!rowData.preservationDate) return '-';
        const daysFrozen = Math.floor((new Date().getTime() - new Date(rowData.preservationDate).getTime()) / (1000 * 60 * 60 * 24));
        return (
            <div className="flex flex-column gap-1">
                <span className="font-semibold text-900">
                    {new Date(rowData.preservationDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    })}
                </span>
                <Chip label={`${daysFrozen} days frozen`} icon="pi pi-clock" className="text-xs" />
            </div>
        );
    };

    const notesBodyTemplate = (rowData: TSpermPreservation) => {
        if (!rowData.notes) return <span className="text-400">No notes</span>;
        return (
            <div className="text-600" style={{ maxWidth: '300px' }}>
                {rowData.notes.length > 100 ? rowData.notes.substring(0, 100) + '...' : rowData.notes}
            </div>
        );
    };

    const actionBodyTemplate = (rowData: TSpermPreservation) => {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-pencil" rounded outlined severity="info" onClick={() => handleEdit(rowData)} tooltip="Edit Record" tooltipOptions={{ position: 'top' }} />
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => handleDelete(rowData.semenPreservationTankId!)} tooltip="Delete Record" tooltipOptions={{ position: 'top' }} />
            </div>
        );
    };

    // Patient Selection Dialog
    const renderPatientDialog = () => (
        <Dialog
            header={
                <div className="flex align-items-center gap-2">
                    <i className="pi pi-users text-primary"></i>
                    <span>Select Patient</span>
                </div>
            }
            visible={showPatientDialog}
            style={{ width: '700px' }}
            onHide={() => setShowPatientDialog(false)}
            modal
        >
            <DataTable
                value={patientsList}
                selectionMode="single"
                onRowSelect={(e) => {
                    onPatientSelect(e.data);
                    setShowPatientDialog(false);
                }}
                paginator
                rows={5}
                emptyMessage="No patients found"
                className="p-datatable-sm"
            >
                <Column field="recordNumber" header="Record #" style={{ width: '20%' }} />
                <Column header="Name" body={(rowData: TPatient) => <div>{`${rowData.firstName} ${rowData.lastName}`}</div>} style={{ width: '25%' }} />
                <Column header="Partner" body={(rowData: TPatient) => { const partner = getPartnerFromPatient(rowData); return partner ? <div>{`${partner.firstName ?? ''} ${partner.lastName ?? ''}`.trim() || '—'}</div> : <div className="text-400">—</div>; }} style={{ width: '25%' }} />
                <Column field="age" header="Age" style={{ width: '15%' }} />
                <Column field="phone" header="Phone" style={{ width: '15%' }} />
            </DataTable>
        </Dialog>
    );

    // Storage Map Visualization
    const renderStorageMap = () => {
        const getCanisterStats = (canisterId: string) => {
            const items = preservations.filter((p) => p.canister === canisterId);
            const gobletUsage = gobletOptions.map((g) => ({
                goblet: g.value,
                count: items.filter((p) => p.goblet === g.value).length
            }));
            return { total: items.length, gobletUsage };
        };

        return (
            <Dialog
                header={
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-map text-primary"></i>
                        <span>Storage Tank Map</span>
                    </div>
                }
                visible={showStorageMap}
                style={{ width: '900px' }}
                onHide={() => setShowStorageMap(false)}
                modal
                maximizable
            >
                <div className="grid">
                    {canisterOptions.map((canister) => {
                        const stats = getCanisterStats(canister.value);
                        return (
                            <div key={canister.value} className="col-12 md:col-6 lg:col-4">
                                <Panel
                                    header={
                                        <div className="flex justify-content-between align-items-center">
                                            <span>{canister.label}</span>
                                            <Badge value={stats.total} severity={stats.total > 0 ? 'success' : 'info'} />
                                        </div>
                                    }
                                    className="mb-3"
                                >
                                    {stats.gobletUsage.map((gu) => (
                                        <div key={gu.goblet} className="flex justify-content-between align-items-center p-2 border-bottom-1 surface-border hover:surface-100 cursor-pointer transition-colors transition-duration-150">
                                            <div className="flex align-items-center gap-2">
                                                <i className="pi pi-inbox text-600"></i>
                                                <span className="font-semibold">Goblet {gu.goblet}</span>
                                            </div>
                                            <Tag value={`${gu.count} ${gu.count === 1 ? 'straw' : 'straws'}`} severity={gu.count > 0 ? 'success' : 'info'} icon={gu.count > 0 ? 'pi pi-check-circle' : 'pi pi-circle'} />
                                        </div>
                                    ))}
                                </Panel>
                            </div>
                        );
                    })}
                </div>

                <Divider />

                <div className="flex justify-content-around p-3 bg-primary-50 border-round">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-primary">{preservations.length}</div>
                        <div className="text-sm text-600">Total Samples</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-primary">{new Set(preservations.map((p) => p.patientId)).size}</div>
                        <div className="text-sm text-600">Unique Patients</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-primary">{canisterOptions.length}</div>
                        <div className="text-sm text-600">Available Canisters</div>
                    </div>
                </div>
            </Dialog>
        );
    };

    // Derived filtered list combining canister filter and global text search
    const filteredPreservations = useMemo(() => {
        const canisterFiltered = selectedCanisterFilter ? preservations.filter((p) => p.canister === selectedCanisterFilter) : preservations;
        const q = (globalFilter || '').trim().toLowerCase();
        if (!q) return canisterFiltered;
        return canisterFiltered.filter((row) => {
            const patient = patientsList.find((p) => p.patientId === row.patientId);
            const recordNumber = (patient?.recordNumber ?? '').toString().toLowerCase();
            const patientName = `${patient?.firstName ?? ''} ${patient?.lastName ?? ''}`.trim().toLowerCase();
            const canister = (row.canister ?? '').toString().toLowerCase();
            const goblet = (row.goblet ?? '').toString().toLowerCase();
            const straw = (row.strawNumber ?? '').toString().toLowerCase();
            const gobletColor = (row.gobletColorCode ?? '').toString().toLowerCase();
            const strawColor = (row.strawColorCode ?? '').toString().toLowerCase();
            const notes = (row.notes ?? '').toString().toLowerCase();
            const status = (row.status ?? '').toString().toLowerCase();
            const dateText = row.preservationDate ? new Date(row.preservationDate as any).toLocaleString().toLowerCase() : '';
            return (
                recordNumber.includes(q) ||
                patientName.includes(q) ||
                canister.includes(q) ||
                goblet.includes(q) ||
                straw.includes(q) ||
                gobletColor.includes(q) ||
                strawColor.includes(q) ||
                notes.includes(q) ||
                status.includes(q) ||
                dateText.includes(q)
            );
        });
    }, [preservations, selectedCanisterFilter, globalFilter, patientsList]);

    // Grid View
    const renderGridView = () => {
        return (
            <>
                <Toolbar
                    start={
                        <div className="flex gap-3 align-items-center">
                            <div className="flex align-items-center justify-content-center bg-primary border-circle" style={{ width: '50px', height: '50px' }}>
                                <i className="pi pi-box text-white text-2xl"></i>
                            </div>
                            <div>
                                <h2 className="m-0 text-2xl font-bold text-900">Sperm Preservation Tank</h2>
                                <p className="m-0 text-sm text-600">Manage cryopreserved sperm samples</p>
                            </div>
                        </div>
                    }
                    end={
                        <div className="flex gap-2">
                            <Button label="Storage Map" icon="pi pi-map" outlined onClick={() => setShowStorageMap(true)} />
                            <Button label="New Sample" icon="pi pi-plus" onClick={handleNewEntry} />
                        </div>
                    }
                    className="mb-4 border-none"
                    style={{ background: 'transparent', padding: '0' }}
                />

                {/* Statistics Cards */}
                <div className="grid mb-4">
                    <div className="col-12 md:col-6 lg:col-3">
                        <Card className="bg-blue-50 border-none shadow-2">
                            <div className="flex justify-content-between align-items-center">
                                <div>
                                    <div className="text-500 font-medium mb-1">Total Samples</div>
                                    <div className="text-3xl font-bold text-blue-600">{preservations.length}</div>
                                </div>
                                <i className="pi pi-inbox text-blue-600" style={{ fontSize: '2.5rem' }}></i>
                            </div>
                        </Card>
                    </div>
                    <div className="col-12 md:col-6 lg:col-3">
                        <Card className="bg-green-50 border-none shadow-2">
                            <div className="flex justify-content-between align-items-center">
                                <div>
                                    <div className="text-500 font-medium mb-1">Patients</div>
                                    <div className="text-3xl font-bold text-green-600">{new Set(preservations.map((p) => p.patientId)).size}</div>
                                </div>
                                <i className="pi pi-users text-green-600" style={{ fontSize: '2.5rem' }}></i>
                            </div>
                        </Card>
                    </div>
                    <div className="col-12 md:col-6 lg:col-3">
                        <Card className="bg-orange-50 border-none shadow-2">
                            <div className="flex justify-content-between align-items-center">
                                <div>
                                    <div className="text-500 font-medium mb-1">Canisters Used</div>
                                    <div className="text-3xl font-bold text-orange-600">
                                        {new Set(preservations.map((p) => p.canister)).size}/{canisterOptions.length}
                                    </div>
                                </div>
                                <i className="pi pi-box text-orange-600" style={{ fontSize: '2.5rem' }}></i>
                            </div>
                        </Card>
                    </div>
                    <div className="col-12 md:col-6 lg:col-3">
                        <Card className="bg-purple-50 border-none shadow-2">
                            <div className="flex justify-content-between align-items-center">
                                <div>
                                    <div className="text-500 font-medium mb-1">Latest Sample</div>
                                    <div className="text-xl font-bold text-purple-600">
                                        {preservations.length > 0 ? Math.floor((new Date().getTime() - (new Date(preservations[preservations.length - 1].preservationDate)?.getTime() || 0)) / (1000 * 60 * 60 * 24)) + ' days ago' : 'N/A'}
                                    </div>
                                </div>
                                <i className="pi pi-clock text-purple-600" style={{ fontSize: '2.5rem' }}></i>
                            </div>
                        </Card>
                    </div>
                </div>

                <Card className="shadow-3">
                    {/* Search and Filter Bar */}
                    <div className="flex flex-column md:flex-row gap-3 mb-4">
                        <span className="p-input-icon-left flex-1">
                            <i className="pi pi-search" />
                            <InputText placeholder="Search by patient name, ID, or notes..." value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="w-full" />
                        </span>
                        <Dropdown
                            value={selectedCanisterFilter}
                            options={[{ label: 'All Canisters', value: null }, ...canisterOptions]}
                            onChange={(e) => setSelectedCanisterFilter(e.value)}
                            placeholder="Filter by Canister"
                            className="w-full md:w-auto"
                        />
                    </div>

                    <DataTable value={filteredPreservations} paginator rows={10} rowsPerPageOptions={[5, 10, 25, 50]} emptyMessage="No preservation records found" className="p-datatable-gridlines" stripedRows>
                        <Column field="patientName" header="Patient" body={patientBodyTemplate} sortable style={{ minWidth: '200px' }} />
                        <Column header="Storage Location" body={locationBodyTemplate} sortable field="canister" style={{ minWidth: '180px' }} />
                        <Column header="Preservation Date" body={dateBodyTemplate} sortable field="preservationDate" style={{ minWidth: '180px' }} />
                        <Column field="notes" header="Notes" body={notesBodyTemplate} style={{ minWidth: '250px' }} />
                        <Column header="Status" body={(rowData: TSpermPreservation) => <Tag value={rowData.status} severity={rowData.status === 'Active' ? 'success' : 'danger'} />} style={{ width: '130px' }} />
                        <Column header="Actions" body={actionBodyTemplate} style={{ width: '130px' }} />
                    </DataTable>
                </Card>
            </>
        );
    };

    // Form View
    const renderFormView = () => (
        <>
            <div className="flex justify-content-between align-items-center mb-4">
                <div className="flex gap-3 align-items-center">
                    <Button icon="pi pi-arrow-left" rounded onClick={handleCancel} severity="danger" />
                    <div>
                        <h2 className="m-0 text-2xl font-bold text-900">{editingId ? 'Edit Preservation Record' : 'New Preservation Record'}</h2>
                        <p className="m-0 text-sm text-600">{editingId ? 'Update the information below' : 'Fill in the details to preserve a new sample'}</p>
                    </div>
                </div>
            </div>

            <div className="grid">
                {/* Patient Selection */}
                <div className="col-12">
                    <Card className="mb-4">
                        <div className="flex align-items-center gap-3 mb-3">
                            <i className="pi pi-user text-3xl"></i>
                            <h3 className="m-0 text-xl font-bold">Patient Information</h3>
                        </div>
                        <div className="grid">
                            <div className="col-12 md:col-8">
                                <label className="block mb-2 font-semibold">Search Patient *</label>
                                <AutoComplete
                                    value={selectedPatient}
                                    suggestions={filteredPatients}
                                    completeMethod={searchPatient}
                                    field="name"
                                    onChange={(e) => {
                                        if (e.value && typeof e.value === 'object') {
                                            onPatientSelect(e.value);
                                        }
                                    }}
                                    itemTemplate={(item: TPatient) => (
                                        <div className="flex justify-content-between align-items-center p-2">
                                            <div>
                                                <div className="font-bold">{`${item.firstName} ${item.lastName}`}</div>
                                                <div className="text-sm text-600">
                                                    ID: {item.recordNumber} • Age: {item.age}
                                                </div>
                                            </div>
                                            <span className="text-sm text-600">{item.phone}</span>
                                        </div>
                                    )}
                                    placeholder="Type patient name or ID..."
                                    className={`w-full ${errors.patientId ? 'p-invalid' : ''}`}
                                    dropdown
                                    selectedItemTemplate={(item: TPatient) => (item ? `${`${item.firstName} ${item.lastName}`} (${item.recordNumber})` : '')}
                                />
                                {errors.patientId && <small className="text-white block mt-1">{errors.patientId}</small>}
                            </div>
                            <div className="col-12 md:col-4 flex align-items-end">
                                <Button label="Browse All Patients" icon="pi pi-search" outlined className="w-full" onClick={() => setShowPatientDialog(true)} />
                            </div>
                            {selectedPatient && (() => {
                                const partner = getPartnerFromPatient(selectedPatient);
                                if (!partner) return null;
                                const partnerName = `${partner.firstName ?? ''} ${partner.lastName ?? ''}`.trim();
                                return (
                                    <div className="col-12">
                                        <div className="p-2 border-round bg-yellow-50 text-800" style={{ border: '1px dashed var(--yellow-400)' }}>
                                            <i className="pi pi-users mr-2 text-yellow-700"></i>
                                            <strong>Male Partner:</strong> {partnerName || 'Unnamed'}
                                            {partner.phone && <span className="ml-2 text-600">• {partner.phone}</span>}
                                            {partner.email && <span className="ml-2 text-600">• {partner.email}</span>}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </Card>
                </div>

                {/* Storage Location */}
                <div className="col-12 md:col-6">
                    <Card className="mb-4 h-full shadow-3">
                        <div className="flex align-items-center gap-2 mb-3">
                            <i className="pi pi-map-marker text-primary text-2xl"></i>
                            <h3 className="m-0 text-primary text-xl font-bold">Storage Location</h3>
                        </div>
                        <div className="grid">
                            <div className="col-12 md:col-4">
                                <label className="block mb-2 font-semibold text-900">Canister *</label>
                                <Dropdown value={formData.canister} options={canisterOptions} onChange={(e) => updateFormData('canister', e.value)} className={`w-full ${errors.canister ? 'p-invalid' : ''}`} placeholder="Select" />
                                {errors.canister && <small className="p-error block mt-1">{errors.canister}</small>}
                            </div>
                            <div className="col-12 md:col-4">
                                <label className="block mb-2 font-semibold text-900">Goblet *</label>
                                <Dropdown value={formData.goblet} options={gobletOptions} onChange={(e) => updateFormData('goblet', e.value)} className={`w-full ${errors.goblet ? 'p-invalid' : ''}`} placeholder="Select" />
                                {errors.goblet && <small className="p-error block mt-1">{errors.goblet}</small>}
                            </div>
                            <div className="col-12 md:col-4">
                                <label className="block mb-2 font-semibold text-900">Straw # *</label>
                                <div className="p-inputgroup">
                                    <InputNumber value={formData.strawNumber} onValueChange={(e) => updateFormData('strawNumber', e.value)} className={`${errors.strawNumber ? 'p-invalid' : ''}`} placeholder="0000" />
                                    <Button icon="pi pi-arrow-right" onClick={suggestStrawNumber} tooltip="Suggest next available" tooltipOptions={{ position: 'top' }} />
                                </div>
                                {errors.strawNumber && <small className="p-error block mt-1">{errors.strawNumber}</small>}
                            </div>

                            <div className="col-12">
                                <Divider />
                                <div className="flex align-items-center justify-content-between mb-2">
                                    <label className="font-semibold text-900">Goblet Color Code</label>
                                    <span className="text-sm text-600">For easy identification</span>
                                </div>
                                <div className="flex gap-2 mb-3">
                                    {colorPresets.map((preset) => (
                                        <div
                                            key={preset.value}
                                            onClick={() => updateFormData('gobletColorCode', preset.value)}
                                            className="cursor-pointer border-2 border-round transition-all transition-duration-200 hover:shadow-3"
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                backgroundColor: preset.value,
                                                borderColor: formData.gobletColorCode === preset.value ? '#000' : '#dee2e6'
                                            }}
                                            title={preset.label}
                                        />
                                    ))}
                                </div>
                                <div className="flex gap-3 align-items-center">
                                    <ColorPicker value={formData.gobletColorCode.replace('#', '')} onChange={(e) => updateFormData('gobletColorCode', `#${e.value}`)} />
                                    <InputText value={formData.gobletColorCode} onChange={(e) => updateFormData('gobletColorCode', e.target.value)} placeholder="#000000" className="flex-1" />
                                </div>
                            </div>
                            <div className="col-12">
                                <Divider />
                                <div className="flex align-items-center justify-content-between mb-2">
                                    <label className="font-semibold text-900">Straw Color Code</label>
                                    <span className="text-sm text-600">For easy identification</span>
                                </div>
                                <div className="flex gap-2 mb-3">
                                    {colorPresets.map((preset) => (
                                        <div
                                            key={preset.value}
                                            onClick={() => updateFormData('strawColorCode', preset.value)}
                                            className="cursor-pointer border-2 border-round transition-all transition-duration-200 hover:shadow-3"
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                backgroundColor: preset.value,
                                                borderColor: formData.strawColorCode === preset.value ? '#000' : '#dee2e6'
                                            }}
                                            title={preset.label}
                                        />
                                    ))}
                                </div>
                                <div className="flex gap-3 align-items-center">
                                    <ColorPicker value={formData.strawColorCode.replace('#', '')} onChange={(e) => updateFormData('strawColorCode', `#${e.value}`)} />
                                    <InputText value={formData.strawColorCode} onChange={(e) => updateFormData('strawColorCode', e.target.value)} placeholder="#000000" className="flex-1" />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Additional Information */}
                <div className="col-12 md:col-6">
                    <Card className="mb-4 h-full shadow-3">
                        <div className="flex align-items-center gap-2 mb-3">
                            <i className="pi pi-info-circle text-primary text-2xl"></i>
                            <h3 className="m-0 text-primary text-xl font-bold">Additional Information</h3>
                        </div>
                        <div className="grid">
                            <div className="col-12">
                                <label className="block mb-2 font-semibold text-900">Notes</label>
                                <InputTextarea value={formData.notes} onChange={(e) => updateFormData('notes', e.target.value)} rows={8} className="w-full" placeholder="Enter preservation details, sample quality, special instructions..." />
                            </div>
                            <div className="col-12">
                                <label className="block mb-2 font-semibold">Storage Status</label>
                                <Dropdown value={formData.status} options={statusOptions} onChange={(e) => updateFormData('status', e.value)} className="w-full" placeholder="Select Storage Status" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Preview Card */}
                <div className="col-12">
                    <Card className="shadow-3 bg-blue-50">
                        <h3 className="mt-0 mb-3 text-primary">
                            <i className="pi pi-eye mr-2"></i>Preview
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            <Chip label={selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : 'No patient selected'} icon="pi pi-user" className="bg-white" />
                            {selectedPatient && (() => { const partner = getPartnerFromPatient(selectedPatient); return partner ? <Chip label={`Partner: ${partner.firstName ?? ''} ${partner.lastName ?? ''}`.trim()} icon="pi pi-users" className="bg-yellow-50" /> : null; })()}
                            <Chip label={`Location: C${formData.canister}-G${formData.goblet}${formData.strawNumber ? `-S${formData.strawNumber}` : ''}`} icon="pi pi-map-marker" className="bg-white" />
                            <Chip
                                template={
                                    <div className="flex align-items-center gap-2 px-3 py-2">
                                        <div
                                            style={{
                                                width: '16px',
                                                height: '16px',
                                                backgroundColor: formData.gobletColorCode,
                                                borderRadius: '4px',
                                                border: '1px solid #dee2e6'
                                            }}
                                        />
                                        <span>Goblet Color: {formData.gobletColorCode}</span>
                                    </div>
                                }
                                className="bg-white"
                            />
                            <Chip
                                template={
                                    <div className="flex align-items-center gap-2 px-3 py-2">
                                        <div
                                            style={{
                                                width: '16px',
                                                height: '16px',
                                                backgroundColor: formData.strawColorCode,
                                                borderRadius: '4px',
                                                border: '1px solid #dee2e6'
                                            }}
                                        />
                                        <span>Straw Color: {formData.strawColorCode}</span>
                                    </div>
                                }
                                className="bg-white"
                            />
                        </div>
                    </Card>
                </div>

                {/* Action Buttons */}
                <div className="col-12">
                    <div className="flex justify-content-end gap-2">
                        <Button label="Cancel" icon="pi pi-times" outlined severity="secondary" onClick={handleCancel} size="large" />
                        <Button label={editingId ? 'Update Record' : 'Save Record'} icon="pi pi-check" onClick={handleSubmit} size="large" loading={isLoading} />
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <div className="surface-ground min-h-screen p-4">
            <Toast ref={toastRef} />
            <ConfirmDialog />

            <div className="max-w-7xl mx-auto">{currentView === 'grid' ? renderGridView() : renderFormView()}</div>

            {renderPatientDialog()}
            {renderStorageMap()}
        </div>
    );
}
