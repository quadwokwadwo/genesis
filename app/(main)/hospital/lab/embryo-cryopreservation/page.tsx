'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
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
import { Divider } from 'primereact/divider';
import { Panel } from 'primereact/panel';
import { Badge } from 'primereact/badge';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import { TEmbryoCryoPreservation } from '@/types/ivf/ivf';
import { changeDateFormat, pageDataValidation } from '@/libs/utils';
import embryoTankService from '@/libs/blue_prints/EmbryoTankService';
import tankService from '@/libs/blue_prints/TankService';
import { CRUDTYPE } from '@/types/enums/enums';
import { TPatient, TTankCustodyEntry, TTankOccupancy, User } from '@/types/hospital';
import PatientsModel from '@/libs/blue_prints/Patients';
import useUserData from '@/libs/hooks/useUserData';
import { validateTankAction } from '@/libs/joiValidations';
import { ProgressBar } from 'primereact/progressbar';

const INITIAL_STATE: TEmbryoCryoPreservation = {
    canister: '1',
    goblet: '1',
    strawNumber: 0,
    gobletColorCode: '#6366f1',
    strawColorCode: '#6366f1',
    patientId: 0,
    embryoType: null,
    embryoQuantity: 0,
    embryoQuality: '',
    oocyteQuantity: 0,
    oocyteQuality: 0,
    freezeDate: new Date(),
    notes: '',
    status: 'InTank',
    userId: 0,
    tankNumber: '',
    cane: '',
    position: ''
};

const patientService = new PatientsModel();

/*
TODO: IN THE FUTURE ALLOW USERS TO SET UP THEIR OWN STORAGE LOCATIONS (CANISTER, GOBLET, STRAW)
THAT WAY WE CAN CONTROL HOW MANY EMBRYOES CAN BE STORED IN EACH LOCATION
 */
export default function EmbryoCryoPreservationPage() {
    const [currentView, setCurrentView] = useState<'grid' | 'form'>('grid');
    const [formData, setFormData] = useState<TEmbryoCryoPreservation>(INITIAL_STATE);
    const [preservations, setPreservations] = useState<TEmbryoCryoPreservation[]>([]);
    const [crudType, setCrudType] = useState<CRUDTYPE>(CRUDTYPE.save);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [errors, setErrors] = useState<any>({});

    // Patient search
    // Holds the picked patient object, OR the raw text while the user is typing
    // in the AutoComplete (PrimeReact passes a string to onChange until a
    // suggestion is selected).
    const [selectedPatient, setSelectedPatient] = useState<TPatient | string | null>(null);
    const [filteredPatients, setFilteredPatients] = useState<TPatient[]>([]);
    const [showPatientDialog, setShowPatientDialog] = useState(false);
    const [patientsList, setPatientsList] = useState<TPatient[]>([]);

    // Storage location visualization
    const [showStorageMap, setShowStorageMap] = useState(false);

    // Tank lifecycle dialogs
    const [showThawDialog, setShowThawDialog] = useState(false);
    const [showDiscardDialog, setShowDiscardDialog] = useState(false);
    const [showHistoryDialog, setShowHistoryDialog] = useState(false);
    const [actionTarget, setActionTarget] = useState<TEmbryoCryoPreservation | null>(null);
    const [actionReason, setActionReason] = useState('');
    const [actionBusy, setActionBusy] = useState(false);
    const [custodyLog, setCustodyLog] = useState<TTankCustodyEntry[]>([]);
    const [custodyLoading, setCustodyLoading] = useState(false);
    const [occupancy, setOccupancy] = useState<TTankOccupancy[]>([]);

    const toastRef = React.useRef<any>(null);
    const { user } = useUserData<User>();
    // Search query for the preservations list
    const [preservationSearch, setPreservationSearch] = useState('');

    // Derived filtered list for the grid search
    const filteredPreservations = useMemo(() => {
        const q = preservationSearch.trim().toLowerCase();
        if (!q) return preservations;
        return preservations.filter((row) => {
            const patient = patientsList.find((p) => p.patientId === row.patientId);
            const recordNumber = (patient?.recordNumber ?? '').toString().toLowerCase();
            const patientName = `${patient?.firstName ?? ''} ${patient?.lastName ?? ''}`.trim().toLowerCase();
            const canister = (row.canister ?? '').toString().toLowerCase();
            const goblet = (row.goblet ?? '').toString().toLowerCase();
            const straw = (row.strawNumber ?? '').toString().toLowerCase();
            const embryoType = (row.embryoType ?? '').toString().toLowerCase();
            const embryoQty = (row.embryoQuantity ?? '').toString().toLowerCase();
            const embryoQuality = (row.embryoQuality ?? '').toString().toLowerCase();
            const oocyteQty = (row.oocyteQuantity ?? '').toString().toLowerCase();
            const oocyteQuality = (row.oocyteQuality ?? '').toString().toLowerCase();
            const freezeDate = row.freezeDate ? new Date(row.freezeDate as any).toLocaleString().toLowerCase() : '';
            const status = (row.status ?? '').toString().toLowerCase();
            const notes = (row.notes ?? '').toString().toLowerCase();
            const gobletColor = (row.gobletColorCode ?? '').toString().toLowerCase();
            const strawColor = (row.strawColorCode ?? '').toString().toLowerCase();

            return (
                recordNumber.includes(q) ||
                patientName.includes(q) ||
                canister.includes(q) ||
                goblet.includes(q) ||
                straw.includes(q) ||
                embryoType.includes(q) ||
                embryoQty.includes(q) ||
                embryoQuality.includes(q) ||
                oocyteQty.includes(q) ||
                oocyteQuality.includes(q) ||
                freezeDate.includes(q) ||
                status.includes(q) ||
                notes.includes(q) ||
                gobletColor.includes(q) ||
                strawColor.includes(q)
            );
        });
    }, [preservations, preservationSearch, patientsList]);

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

    const embryoTypeOptions = [
        { label: 'Oocyte', value: 'Oocyte', icon: 'pi pi-circle' },
        { label: 'Blastocyte', value: 'Blastocyte', icon: 'pi pi-circle-fill' }
    ];

    const qualityOptions = [
        { label: 'Grade A - Excellent', value: 'Grade A' },
        { label: 'Grade B - Good', value: 'Grade B' },
        { label: 'Grade C - Fair', value: 'Grade C' },
        { label: 'Grade D - Poor', value: 'Grade D' }
    ];
    const statusOptions = [
        { label: 'In Tank', value: 'InTank' },
        { label: 'Thawed', value: 'Thawed' },
        { label: 'Discarded', value: 'Discarded' }
    ];
    useEffect(() => {
        const initPage = async () => {
            const patients = await patientService.getAllPatients();
            const preservationsList = await embryoTankService.getTankEmbryos();
            setPatientsList(patients);
            setPreservations(preservationsList.data.operatedData);
            try {
                const occ = await tankService.getTankOccupancy('Embryo');
                setOccupancy(((occ as any)?.data?.data ?? (occ as any)?.data?.operatedData ?? []) as TTankOccupancy[]);
            } catch {}
        };
        initPage();
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
        if(patientsList.length <= 1) {
            setFilteredPatients(patientsList);
            return;
        }
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
        if (!formData.embryoType) newErrors.embryoType = 'Embryo type is required';
        if (!formData.freezeDate) newErrors.freezeDate = 'Freeze date is required';

        if (formData.embryoType === 'Blastocyte' && !formData.embryoQuantity) {
            newErrors.embryoQuantity = 'Embryo quantity is required for Blastocyte';
        }
        if (formData.embryoType === 'Oocyte' && !formData.oocyteQuantity) {
            newErrors.oocyteQuantity = 'Oocyte quantity is required for Oocyte';
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
        setCrudType(CRUDTYPE.save);
    };

    const handleEdit = (record: TEmbryoCryoPreservation) => {
        setFormData(record);
        const patient = patientsList.find((p) => p.patientId === record.patientId);
        setSelectedPatient(patient || null);
        setEditingId(record.embryoCryoPreservationId || null);
        setCurrentView('form');
        setCrudType(CRUDTYPE.update);
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            toastRef.current?.show({ severity: 'error', summary: 'Validation Error', detail: 'Please fill all required fields', life: 3000 });
            return;
        }

        const dataToSave: TEmbryoCryoPreservation = {
            ...formData,
            freezeDate: changeDateFormat(formData.freezeDate as Date),
            userId: user.userId
        };

        const response = await embryoTankService.saveEmbryoTank(dataToSave, crudType);

        if (response.status === 200 && response.data.status === 2) {
            toastRef.current?.show({ severity: 'error', summary: 'Record Exists', detail: 'Similar record exists for the selected parameters', life: 3000 });
            return;
        }
        if (response.status === 200 && response.data.operatedData !== undefined) {
            if (crudType === CRUDTYPE.save) {
                setPreservations([...preservations, response.data.operatedData]);
                toastRef.current?.show({ severity: 'success', summary: 'Saved', detail: 'New record saved successfully', life: 3000 });
            } else {
                setPreservations(preservations.map((p) => (p.embryoCryoPreservationId === response.data.operatedData.embryoCryoPreservationId ? response.data.operatedData : p)));
                toastRef.current?.show({ severity: 'success', summary: 'Updated', detail: 'Record updated successfully', life: 3000 });
            }
            setCurrentView('grid');
            setFormData(INITIAL_STATE);
            setSelectedPatient(null);
            setEditingId(null);
            setCrudType(CRUDTYPE.save);
        } else {
            toastRef.current?.show({ severity: 'error', summary: 'Save Error', detail: 'Record was not saved.', life: 3000 });
        }
    };

    const handleDelete = (embryoPreservationId: number) => {
        confirmDialog({
            message: 'Are you sure you want to delete this preservation record?',
            header: 'Delete Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                const response = await embryoTankService.deleteEmbryo(embryoPreservationId);
                if (response.data.operatedData.affectedRows === 1) {
                    setPreservations(preservations.filter((p) => p.embryoCryoPreservationId !== embryoPreservationId));
                    toastRef.current?.show({ severity: 'info', summary: 'Deleted', detail: 'Record deleted successfully', life: 3000 });
                } else {
                    toastRef.current?.show({ severity: 'info', summary: 'Delete Error', detail: 'Delete could not complete!', life: 3000 });
                }
            }
        });
    };

    const handleCancel = () => {
        setCurrentView('grid');
        setFormData(INITIAL_STATE);
        setSelectedPatient(null);
        setEditingId(null);
        setErrors({});
        setCrudType(CRUDTYPE.save);
    };

    // DataTable templates
    const patientBodyTemplate = (rowData: TEmbryoCryoPreservation) => {
        const patient = patientsList.find((p) => p.patientId === rowData.patientId);
        const partner = getPartnerFromPatient(patient);
        // ✅ Guard: patient may be undefined while list is loading or if record is orphaned
        if (!patient) {
            return (
                <div className="flex align-items-center gap-2">
                    <i className="pi pi-user text-400"></i>
                    <span className="text-400 text-sm">Patient #{rowData.patientId}</span>
                </div>
            );
        }
        return (
            <div className="flex align-items-center gap-2">
                <i className="pi pi-user text-primary"></i>
                <div>
                    <div className="font-semibold">{`${patient?.firstName} ${patient?.lastName}`}</div>
                    <div className="text-sm text-600">ID: {patient?.recordNumber}</div>
                    {partner && (
                        <div className="text-sm text-yellow-700">
                            <i className="pi pi-users mr-1" style={{ fontSize: '0.75rem' }}></i>Partner: {`${partner?.firstName ?? ''} ${partner.lastName ?? ''}`.trim() || '—'}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const locationBodyTemplate = (rowData: TEmbryoCryoPreservation) => {
        return (
            <div className="flex flex-column gap-1">
                <Tag value={`C${rowData.canister}-G${rowData.goblet}-S${rowData.strawNumber}`} severity="info" />
                <div className="flex align-items-center gap-2 mt-1">
                    <div
                        style={{
                            width: '16px',
                            height: '16px',
                            backgroundColor: rowData.gobletColorCode,
                            borderRadius: '4px',
                            border: '1px solid #ccc'
                        }}
                    />
                    <span className="text-sm text-600">{rowData.gobletColorCode} (Goblet)</span>
                </div>
                <div className="flex align-items-center gap-2 mt-1">
                    <div
                        style={{
                            width: '16px',
                            height: '16px',
                            backgroundColor: rowData.strawColorCode,
                            borderRadius: '4px',
                            border: '1px solid #ccc'
                        }}
                    />
                    <span className="text-sm text-600">{rowData.strawColorCode} (Straw)</span>
                </div>
            </div>
        );
    };

    const typeBodyTemplate = (rowData: TEmbryoCryoPreservation) => {
        const isOocyte = rowData.embryoType === 'Oocyte';
        return (
            <div>
                <Tag value={rowData.embryoType || ''} severity={isOocyte ? 'warning' : 'success'} icon={isOocyte ? 'pi pi-circle' : 'pi pi-circle-fill'} />
                <div className="text-sm text-600 mt-1">{isOocyte ? `${rowData.oocyteQuantity} oocytes (Q${rowData.oocyteQuality})` : `${rowData.embryoQuantity} embryos (${rowData.embryoQuality})`}</div>
            </div>
        );
    };

    const dateBodyTemplate = (rowData: TEmbryoCryoPreservation) => {
        return (
            <div className="flex flex-column gap-1">
                <span className="font-semibold">{new Date(rowData.freezeDate).toLocaleDateString()}</span>
                <span className="text-sm text-600">{Math.floor((new Date().getTime() - (new Date(rowData.freezeDate).getTime() || 0)) / (1000 * 60 * 60 * 24))} days frozen</span>
            </div>
        );
    };

    const actionBodyTemplate = (rowData: TEmbryoCryoPreservation) => {
        const isInTank = rowData.status === 'InTank' || rowData.status === 'Active';
        const isThawed = rowData.status === 'Thawed';
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-pencil" rounded outlined severity="info" onClick={() => handleEdit(rowData)} tooltip="Edit" tooltipOptions={{ position: 'top' }} />
                {isInTank && <Button icon="pi pi-sun" rounded outlined severity="warning" onClick={() => openThaw(rowData)} tooltip="Thaw" tooltipOptions={{ position: 'top' }} />}
                {(isInTank || isThawed) && <Button icon="pi pi-ban" rounded outlined severity="danger" onClick={() => openDiscard(rowData)} tooltip="Discard" tooltipOptions={{ position: 'top' }} />}
                <Button icon="pi pi-history" rounded outlined severity="secondary" onClick={() => openHistory(rowData)} tooltip="Custody log" tooltipOptions={{ position: 'top' }} />
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => handleDelete(rowData.embryoCryoPreservationId!)} tooltip="Delete" tooltipOptions={{ position: 'top' }} />
            </div>
        );
    };

    const openThaw = (row: TEmbryoCryoPreservation) => {
        setActionTarget(row);
        setActionReason('');
        setShowThawDialog(true);
    };
    const openDiscard = (row: TEmbryoCryoPreservation) => {
        setActionTarget(row);
        setActionReason('');
        setShowDiscardDialog(true);
    };
    const openHistory = async (row: TEmbryoCryoPreservation) => {
        setActionTarget(row);
        setCustodyLog([]);
        setShowHistoryDialog(true);
        setCustodyLoading(true);
        try {
            const resp = await embryoTankService.getCustodyLog(row.embryoCryoPreservationId!);
            setCustodyLog(((resp as any)?.data?.data ?? (resp as any)?.data?.operatedData ?? []) as TTankCustodyEntry[]);
        } finally {
            setCustodyLoading(false);
        }
    };
    const refreshOccupancy = async () => {
        try {
            const occ = await tankService.getTankOccupancy('Embryo');
            setOccupancy(((occ as any)?.data?.data ?? (occ as any)?.data?.operatedData ?? []) as TTankOccupancy[]);
        } catch {}
    };
    const submitThaw = async () => {
        if (!actionTarget?.embryoCryoPreservationId) return;
        const ok = pageDataValidation<{ reason: string }>(validateTankAction, { reason: actionReason }, toastRef);
        if (!ok) return;
        setActionBusy(true);
        try {
            const resp: any = await embryoTankService.thawPreservation(actionTarget.embryoCryoPreservationId, actionReason);
            if (resp?.status === 200 && (resp.data?.status === 'ok' || resp.data?.operatedData)) {
                setPreservations((prev) => prev.map((p) => (p.embryoCryoPreservationId === actionTarget.embryoCryoPreservationId ? { ...p, status: 'Thawed' } : p)));
                toastRef.current?.show({ severity: 'success', summary: 'Thawed', detail: 'Sample marked as Thawed', life: 3000 });
                setShowThawDialog(false);
                refreshOccupancy();
            } else {
                const msg = resp?.data?.message || 'Could not thaw sample';
                toastRef.current?.show({ severity: 'error', summary: 'Thaw failed', detail: msg, life: 4000 });
            }
        } finally {
            setActionBusy(false);
        }
    };
    const submitDiscard = async () => {
        if (!actionTarget?.embryoCryoPreservationId) return;
        const ok = pageDataValidation<{ reason: string }>(validateTankAction, { reason: actionReason }, toastRef);
        if (!ok) return;
        setActionBusy(true);
        try {
            const resp: any = await embryoTankService.discardPreservation(actionTarget.embryoCryoPreservationId, actionReason);
            if (resp?.status === 200 && (resp.data?.status === 'ok' || resp.data?.operatedData)) {
                setPreservations((prev) => prev.map((p) => (p.embryoCryoPreservationId === actionTarget.embryoCryoPreservationId ? { ...p, status: 'Discarded' } : p)));
                toastRef.current?.show({ severity: 'success', summary: 'Discarded', detail: 'Sample marked as Discarded', life: 3000 });
                setShowDiscardDialog(false);
                refreshOccupancy();
            } else {
                const msg = resp?.data?.message || 'Could not discard sample';
                toastRef.current?.show({ severity: 'error', summary: 'Discard failed', detail: msg, life: 4000 });
            }
        } finally {
            setActionBusy(false);
        }
    };

    // Patient Selection Dialog
    const renderPatientDialog = () => (
        <Dialog header="Select Patient" visible={showPatientDialog} style={{ width: '600px' }} onHide={() => setShowPatientDialog(false)} modal>
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
            >
                <Column field="id" header="ID" style={{ width: '15%' }} />
                <Column field="name" header="Name" style={{ width: '30%' }} />
                <Column header="Partner" body={(rowData: TPatient) => { const partner = getPartnerFromPatient(rowData); return partner ? `${partner.firstName ?? ''} ${partner.lastName ?? ''}`.trim() || '\u2014' : '\u2014'; }} style={{ width: '25%' }} />
                <Column field="age" header="Age" style={{ width: '15%' }} />
                <Column field="phone" header="Phone" style={{ width: '15%' }} />
            </DataTable>
        </Dialog>
    );

    // Storage Map Visualization
    const renderStorageMap = () => {
        const getCanisterStats = (canisterId: string) => {
            // Stored embryos use status 'InTank' (the default); 'Active' is only a
            // legacy alias. Match both, mirroring the in-tank check used elsewhere
            // on this page — filtering on 'Active' alone leaves the map empty.
            const items = preservations.filter((p) => p.canister === canisterId && (p.status === 'InTank' || p.status === 'Active'));
            const gobletUsage = gobletOptions.map((g) => ({
                goblet: g.value,
                count: items.filter((p) => p.goblet === g.value).reduce((acc, p) => acc + (Number(p.strawNumber) || 0), 0)
            }));
            return { total: items.length, gobletUsage };
        };

        return (
            <Dialog
                header={
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-map text-primary"></i>
                        <span>Storage Location Map</span>
                    </div>
                }
                visible={showStorageMap}
                style={{ width: '1000px' }}
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
                                            <span className="font-bold">{canister.label}</span>
                                            <Badge value={stats.total} severity={stats.total > 0 ? 'warning' : 'info'} />
                                        </div>
                                    }
                                    className="mb-3"
                                >
                                    {stats.gobletUsage.map((gu) => (
                                        <div key={gu.goblet} className="flex justify-content-between align-items-center p-2 border-bottom-1 surface-border hover:surface-100 transition-colors transition-duration-150">
                                            <div className="flex align-items-center gap-2">
                                                <i className="pi pi-inbox text-600"></i>
                                                <span className="font-semibold">Goblet {gu.goblet}</span>
                                            </div>
                                            <Tag value={`${gu.count} ${gu.count > 0 ? 'straws' : 'straw'}`} severity={gu.count === 0 ? 'success' : gu.count > 7 ? 'danger' : 'warning'} icon={gu.count > 0 ? 'pi pi-check-circle' : 'pi pi-circle'} />
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
                    <div className="text-center">
                        <div className="text-3xl font-bold text-primary">{gobletOptions.length}</div>
                        <div className="text-sm text-600">Goblets per Canister</div>
                    </div>
                </div>
            </Dialog>
        );
    };

    // Grid View
    const renderGridView = () => (
        <>
            <Toolbar
                start={
                    <div className="flex gap-2 align-items-center">
                        <i className="pi pi-snowflake text-4xl text-primary"></i>
                        <div>
                            <h2 className="m-0 text-2xl">Embryo Cryopreservation</h2>
                            <p className="m-0 text-sm text-600">Manage frozen embryos and oocytes</p>
                        </div>
                    </div>
                }
                end={
                    <div className="flex gap-2 align-items-center">
                        <span className="p-input-icon-left">
                            <i className="pi pi-search" />
                            <InputText placeholder="Search preservations" value={preservationSearch} onChange={(e) => setPreservationSearch(e.target.value)} />
                        </span>
                        <Button label="Storage Map" icon="pi pi-map" outlined onClick={() => setShowStorageMap(true)} />
                        <Button label="New Preservation" icon="pi pi-plus" onClick={handleNewEntry} />
                    </div>
                }
                className="mb-4"
            />

            <Card className="mb-3">
                <div className="flex align-items-center gap-2 mb-3">
                    <i className="pi pi-chart-bar text-primary"></i>
                    <h3 className="m-0 text-lg">Tank Capacity (Embryo)</h3>
                </div>
                {occupancy.length === 0 ? (
                    <p className="text-600 m-0">No tank capacity registered.</p>
                ) : (
                    <div className="grid">
                        {occupancy.map((t) => {
                            const pct = t.capacityTotal > 0 ? Math.round((t.usedCount / t.capacityTotal) * 100) : 0;
                            const color = pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#22c55e';
                            return (
                                <div key={`${t.tankType}-${t.tankNumber}`} className="col-12 md:col-6 lg:col-4">
                                    <div className="p-3 border-round surface-100">
                                        <div className="flex justify-content-between align-items-center mb-2">
                                            <span className="font-bold">{t.tankNumber}</span>
                                            <Tag value={`${t.usedCount} / ${t.capacityTotal}`} />
                                        </div>
                                        <ProgressBar value={pct} showValue color={color} style={{ height: '12px' }} />
                                        {t.location && <div className="text-sm text-600 mt-2">{t.location}</div>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>

            <Card>
                <DataTable value={filteredPreservations} paginator rows={10} rowsPerPageOptions={[5, 10, 25, 50]} emptyMessage="No preservation records found" className="p-datatable-gridlines">
                    <Column field="patientName" header="Patient" body={patientBodyTemplate} sortable style={{ minWidth: '200px' }} />
                    <Column header="Storage Location" body={locationBodyTemplate} style={{ minWidth: '150px' }} />
                    <Column header="Type & Quantity" body={typeBodyTemplate} sortable field="embryoType" style={{ minWidth: '180px' }} />
                    <Column header="Freeze Date" body={dateBodyTemplate} sortable field="freezeDate" style={{ minWidth: '150px' }} />
                    <Column field="notes" header="Notes" style={{ minWidth: '200px' }} />
                    <Column field="status" header="Status" body={(rowData: TEmbryoCryoPreservation) => {
                        const s = rowData.status;
                        const severity = s === 'Thawed' ? 'warning' : s === 'Discarded' ? 'danger' : 'success';
                        return <Tag severity={severity} value={s} />;
                    }} style={{ minWidth: '200px' }} />
                    <Column header="Actions" body={actionBodyTemplate} style={{ width: '120px' }} />
                </DataTable>
            </Card>
        </>
    );

    // Form View
    const renderFormView = () => (
        <>
            <div className="flex justify-content-between align-items-center mb-4">
                <div className="flex gap-2 align-items-center">
                    <Button icon="pi pi-arrow-left" rounded outlined onClick={handleCancel} />
                    <div>
                        <h2 className="m-0 text-2xl">{editingId ? 'Edit Preservation Record' : 'New Preservation Record'}</h2>
                        <p className="m-0 text-sm text-600">Fill in the details below</p>
                    </div>
                </div>
            </div>

            <div className="grid">
                {/* Patient Selection */}
                <div className="col-12">
                    <Card className="mb-4 bg-primary-50">
                        <h3 className="mt-0 mb-3 text-primary">
                            <i className="pi pi-user mr-2"></i>Patient Information
                        </h3>
                        <div className="grid">
                            <div className="col-12 md:col-8">
                                <label className="block mb-2 font-semibold">Search Patient *</label>
                                <AutoComplete
                                    value={selectedPatient}
                                    suggestions={filteredPatients}
                                    completeMethod={searchPatient}
                                    field="name"
                                    onChange={(e) => {
                                        // Reflect whatever the user types (string) or picks (object)
                                        // so the input isn't cleared on every keystroke.
                                        setSelectedPatient(e.value);
                                    }}
                                    onSelect={(e) => onPatientSelect(e.value)}
                                    itemTemplate={(item: TPatient) => (
                                        <div className="flex justify-content-between align-items-center">
                                            <span>
                                                <strong>{`${item.firstName} ${item.lastName}`}</strong> (ID: {item.recordNumber})
                                            </span>
                                        </div>
                                    )}
                                    placeholder="Type patient name or ID..."
                                    className={`w-full ${errors.patientId ? 'p-invalid' : ''}`}
                                    dropdown
                                    selectedItemTemplate={(item: TPatient) => (item ? `${`${item.firstName} ${item.lastName}`} (${item.recordNumber})` : '')}
                                />
                                {errors.patientId && <small className="p-error">{errors.patientId}</small>}
                            </div>
                            <div className="col-12 md:col-4 flex align-items-end">
                                <Button label="Browse Patients" icon="pi pi-search" outlined className="w-full" onClick={() => setShowPatientDialog(true)} />
                            </div>
                            {selectedPatient && typeof selectedPatient === 'object' && (() => {
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
                    <Card className="mb-4 h-full">
                        <h3 className="mt-0 mb-3 text-primary">
                            <i className="pi pi-map-marker mr-2"></i>Storage Location
                        </h3>
                        <div className="grid">
                            <div className="col-12 md:col-4">
                                <label className="block mb-2 font-semibold">Canister *</label>
                                <Dropdown value={formData.canister} options={canisterOptions} onChange={(e) => updateFormData('canister', e.value)} className={`w-full ${errors.canister ? 'p-invalid' : ''}`} placeholder="Select" />
                                {errors.canister && <small className="p-error block">{errors.canister}</small>}
                            </div>
                            <div className="col-12 md:col-4">
                                <label className="block mb-2 font-semibold">Goblet *</label>
                                <Dropdown value={formData.goblet} options={gobletOptions} onChange={(e) => updateFormData('goblet', e.value)} className={`w-full ${errors.goblet ? 'p-invalid' : ''}`} placeholder="Select" />
                                {errors.goblet && <small className="p-error block">{errors.goblet}</small>}
                            </div>
                            <div className="col-12 md:col-4">
                                <label className="block mb-2 font-semibold">Straw # *</label>
                                <InputNumber value={formData.strawNumber} onValueChange={(e) => updateFormData('strawNumber', e.value)} className={`w-full ${errors.strawNumber ? 'p-invalid' : ''}`} placeholder="000" />
                                {errors.strawNumber && <small className="p-error block">{errors.strawNumber}</small>}
                            </div>
                            <div className="col-12 md:col-4">
                                <label className="block mb-2 font-semibold">Tank #</label>
                                <InputText value={formData.tankNumber ?? ''} onChange={(e) => updateFormData('tankNumber', e.target.value)} className="w-full" placeholder="e.g. TANK-E1" />
                            </div>
                            <div className="col-12 md:col-4">
                                <label className="block mb-2 font-semibold">Cane</label>
                                <InputText value={formData.cane ?? ''} onChange={(e) => updateFormData('cane', e.target.value)} className="w-full" placeholder="Cane id" />
                            </div>
                            <div className="col-12 md:col-4">
                                <label className="block mb-2 font-semibold">Position</label>
                                <InputText value={formData.position ?? ''} onChange={(e) => updateFormData('position', e.target.value)} className="w-full" placeholder="Slot / position" />
                            </div>
                            <div className="col-12 md:col-6">
                                <label className="block mb-2 font-semibold">Goblet Color Code</label>
                                <div className="flex gap-3 align-items-center">
                                    <ColorPicker value={formData.gobletColorCode.replace('#', '')} onChange={(e) => updateFormData('gobletColorCode', `#${e.value}`)} />
                                    <InputText value={formData.gobletColorCode} onChange={(e) => updateFormData('gobletColorCode', e.target.value)} placeholder="#000000" className="flex-1" />
                                </div>
                            </div>
                            <div className="col-12 md:col-6">
                                <label className="block mb-2 font-semibold">Straw Color Code</label>
                                <div className="flex gap-3 align-items-center">
                                    <ColorPicker value={formData.strawColorCode.replace('#', '')} onChange={(e) => updateFormData('strawColorCode', `#${e.value}`)} />
                                    <InputText value={formData.strawColorCode} onChange={(e) => updateFormData('strawColorCode', e.target.value)} placeholder="#000000" className="flex-1" />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Embryo/Oocyte Details */}
                <div className="col-12 md:col-6">
                    <Card className="mb-4 h-full">
                        <h3 className="mt-0 mb-3 text-primary">
                            <i className="pi pi-circle-fill mr-2"></i>Embryo/Oocyte Details
                        </h3>
                        <div className="grid">
                            <div className="col-12">
                                <label className="block mb-2 font-semibold">Type *</label>
                                <Dropdown value={formData.embryoType} options={embryoTypeOptions} onChange={(e) => updateFormData('embryoType', e.value)} className={`w-full ${errors.embryoType ? 'p-invalid' : ''}`} placeholder="Select type" />
                                {errors.embryoType && <small className="p-error block">{errors.embryoType}</small>}
                            </div>

                            {formData.embryoType === 'Blastocyte' && (
                                <>
                                    <div className="col-12 md:col-6">
                                        <label className="block mb-2 font-semibold">Embryo Quantity *</label>
                                        <InputNumber value={formData.embryoQuantity} onValueChange={(e) => updateFormData('embryoQuantity', e.value)} className={`w-full ${errors.embryoQuantity ? 'p-invalid' : ''}`} min={1} placeholder="0" />
                                        {errors.embryoQuantity && <small className="p-error block">{errors.embryoQuantity}</small>}
                                    </div>
                                    <div className="col-12 md:col-6">
                                        <label className="block mb-2 font-semibold">Embryo Quality</label>
                                        <Dropdown value={formData.embryoQuality} options={qualityOptions} onChange={(e) => updateFormData('embryoQuality', e.value)} className="w-full" placeholder="Select quality" />
                                    </div>
                                </>
                            )}

                            {formData.embryoType === 'Oocyte' && (
                                <>
                                    <div className="col-12 md:col-6">
                                        <label className="block mb-2 font-semibold">Oocyte Quantity *</label>
                                        <InputNumber value={formData.oocyteQuantity} onValueChange={(e) => updateFormData('oocyteQuantity', e.value)} className={`w-full ${errors.oocyteQuantity ? 'p-invalid' : ''}`} min={1} placeholder="0" />
                                        {errors.oocyteQuantity && <small className="p-error block">{errors.oocyteQuantity}</small>}
                                    </div>
                                    <div className="col-12 md:col-6">
                                        <label className="block mb-2 font-semibold">Oocyte Quality (1-5)</label>
                                        <InputNumber value={formData.oocyteQuality} onValueChange={(e) => updateFormData('oocyteQuality', e.value)} className="w-full" min={1} max={5} placeholder="1-5" />
                                    </div>
                                </>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Additional Information */}
                <div className="col-12">
                    <Card>
                        <h3 className="mt-0 mb-3 text-primary">
                            <i className="pi pi-info-circle mr-2"></i>Additional Information
                        </h3>
                        <div className="grid">
                            <div className="col-12 md:col-6">
                                <label className="block mb-2 font-semibold">Freeze Date *</label>
                                <Calendar
                                    value={new Date(formData.freezeDate)}
                                    onChange={(e) => updateFormData('freezeDate', e.value)}
                                    showIcon
                                    dateFormat="yy-mm-dd"
                                    className={`w-full ${errors.freezeDate ? 'p-invalid' : ''}`}
                                    placeholder="Select date"
                                />
                                {errors.freezeDate && <small className="p-error block">{errors.freezeDate}</small>}
                            </div>
                            <div className="col-12 md:col-6">
                                <label className="block mb-2 font-semibold">Storage Status</label>
                                <Dropdown value={formData.status} options={statusOptions} onChange={(e) => updateFormData('status', e.value)} className="w-full" placeholder="Select Storage Status" />
                            </div>
                            <div className="col-12">
                                <label className="block mb-2 font-semibold">Notes</label>
                                <InputTextarea value={formData.notes} onChange={(e) => updateFormData('notes', e.target.value)} rows={4} className="w-full" placeholder="Enter any additional notes..." />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Action Buttons */}
                <div className="col-12">
                    <div className="flex justify-content-end gap-2">
                        <Button label="Cancel" icon="pi pi-times" outlined onClick={handleCancel} />
                        <Button label={crudType === CRUDTYPE.save ? 'Save' : 'Update'} icon="pi pi-check" onClick={handleSubmit} />
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

            <Dialog header="Thaw Sample" visible={showThawDialog} style={{ width: '460px' }} onHide={() => setShowThawDialog(false)} modal>
                <div className="flex flex-column gap-3">
                    <p className="m-0 text-600">Provide a reason (min 10 chars) for thawing this sample. This action will be logged.</p>
                    <InputTextarea rows={4} value={actionReason} onChange={(e) => setActionReason(e.target.value)} placeholder="Reason for thawing" />
                    <div className="flex justify-content-end gap-2">
                        <Button label="Cancel" outlined onClick={() => setShowThawDialog(false)} disabled={actionBusy} />
                        <Button label="Confirm Thaw" icon="pi pi-sun" severity="warning" loading={actionBusy} onClick={submitThaw} />
                    </div>
                </div>
            </Dialog>

            <Dialog header="Discard Sample" visible={showDiscardDialog} style={{ width: '460px' }} onHide={() => setShowDiscardDialog(false)} modal>
                <div className="flex flex-column gap-3">
                    <p className="m-0 text-600">Provide a reason (min 10 chars) for discarding this sample. This action is final and will be logged.</p>
                    <InputTextarea rows={4} value={actionReason} onChange={(e) => setActionReason(e.target.value)} placeholder="Reason for discarding" />
                    <div className="flex justify-content-end gap-2">
                        <Button label="Cancel" outlined onClick={() => setShowDiscardDialog(false)} disabled={actionBusy} />
                        <Button label="Confirm Discard" icon="pi pi-ban" severity="danger" loading={actionBusy} onClick={submitDiscard} />
                    </div>
                </div>
            </Dialog>

            <Dialog header={`Custody Log${actionTarget?.embryoCryoPreservationId ? ` — #${actionTarget.embryoCryoPreservationId}` : ''}`} visible={showHistoryDialog} style={{ width: '720px' }} onHide={() => setShowHistoryDialog(false)} modal>
                <DataTable value={custodyLog} loading={custodyLoading} emptyMessage="No custody events yet" paginator rows={10}>
                    <Column field="createdAt" header="When" body={(r: TTankCustodyEntry) => new Date(r.createdAt).toLocaleString()} />
                    <Column field="action" header="Action" body={(r: TTankCustodyEntry) => <Tag value={r.action} severity={r.action === 'Discarded' ? 'danger' : r.action === 'Thawed' ? 'warning' : 'info'} />} />
                    <Column field="userId" header="User" />
                    <Column field="reason" header="Reason" />
                </DataTable>
            </Dialog>
        </div>
    );
}
