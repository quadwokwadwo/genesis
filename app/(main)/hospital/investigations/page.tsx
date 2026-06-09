'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Toolbar } from 'primereact/toolbar';
import { Card } from 'primereact/card';
import { CRUDTYPE, InvestigationSource } from '@/types/enums/enums';
import { Investigation } from '@/types/hospital';
import InvestigationsModel from '@/libs/blue_prints/InvestigationsModel';
import { displayMessage } from '@/libs/utils';
import { GeneralPageProps } from '@/libs/utilityComponents';

// Local storage keys
const STORAGE_KEY = 'investigations';
const VISIT_KEY = 'visitId';

const saveInvestigations = (items: Investigation[]) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

const investigationService = new InvestigationsModel();

const InvestigationManager: React.FC = () => {
    const toast = useRef(null);

    const [investigations, setInvestigations] = useState<Investigation[]>([]);

    const [investigationDialog, setInvestigationDialog] = useState(false);
    const [deleteInvestigationDialog, setDeleteInvestigationDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [crudType, setCrudType] = useState<CRUDTYPE>(CRUDTYPE.save);

    // Current item being edited/deleted
    const [investigation, setInvestigation] = useState<Investigation>({
        investigationId: 0,
        testName: '',
        source: InvestigationSource.internal,
        price: 0
    });

    // Load from storage on mount
    useEffect(() => {
        const initPage = async () => {
            const initialInvestigations = await loadInvestigations();
            setInvestigations(initialInvestigations);
        };
        initPage().catch(console.error);
    }, []);

    useEffect(() => {}, []);
    const sourceOptions = [
        { label: 'Internal', value: InvestigationSource.internal },
        { label: 'External', value: InvestigationSource.external }
    ];

    // CRUD (internal)

    const openNew = () => {
        setInvestigation({
            investigationId: 0,
            testName: '',
            source: InvestigationSource.internal,
            price: 0
        });
        setSubmitted(false);
        setInvestigationDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setInvestigationDialog(false);
    };

    const hideDeleteInvestigationDialog = () => setDeleteInvestigationDialog(false);

    // Create or Update
    const saveInvestigation = async () => {
        setSubmitted(true);

        if (!investigation.testName?.trim()) return;
        setLoading(true);

        try {
            const response = await investigationService.addNewInvestigation(investigation, crudType);

            if (response.status === 200 && response.operatedData !== undefined) {
                displayMessage({
                    header: 'Success',
                    message: 'Investigation record was successfully changed!',
                    life: 3000,
                    infoType: 'success',
                    toastComponent: toast
                });
                setInvestigations((prev) => {
                    if (crudType === CRUDTYPE.save) {
                        return [...prev, response.operatedData];
                    } else {
                        return prev.map((i) => (i.investigationId === investigation.investigationId ? response.operatedData : i));
                    }
                });
            }
            setInvestigationDialog(false);
            setInvestigation({
                investigationId: 0,
                testName: '',
                source: InvestigationSource.internal,
                price: 0
            });
            setCrudType(CRUDTYPE.save);
        } catch {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to save investigation',
                life: 3000
            });
        } finally {
            setLoading(false);
        }
    };
    const loadInvestigations = async () => {
        try {
            setLoading(true);
            const raw = await investigationService.getInvestigationsList();
            return raw.operatedData;
        } catch {
            throw new Error('Failed to load investigations');
        } finally {
            setLoading(false);
        }
    };
    const editInvestigation = (row: Investigation) => {
        setCrudType(CRUDTYPE.update);
        setInvestigation({ ...row });
        setInvestigationDialog(true);
    };

    const confirmDeleteInvestigation = (row: Investigation) => {
        setInvestigation(row);
        setDeleteInvestigationDialog(true);
    };

    const deleteInvestigation = async () => {
        if (!investigation.investigationId) return;
        setLoading(true);

        try {
            setInvestigations((prev) => {
                const updated = prev.filter((i) => i.investigationId !== investigation.investigationId);
                saveInvestigations(updated);
                return updated;
            });

            toast.current?.show({
                severity: 'success',
                summary: 'Successful',
                detail: 'Investigation Deleted',
                life: 3000
            });

            setDeleteInvestigationDialog(false);
            setInvestigation({
                investigationId: 0,
                testName: '',
                source: InvestigationSource.internal,
                price: 0
            });
        } catch {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to delete investigation',
                life: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    // Inputs

    /**
     * Handles input changes for the Investigation entity.
     * @param e - ChangeEvent triggered by the input or textarea field.
     * @param name - The key of the Investigation entity to be updated.
     * Updates the corresponding property in the Investigation state
     * with the new value from the input field.
     */
    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: keyof Investigation) => {
        const val = e.target.value || '';
        setInvestigation((prev) => ({ ...prev, [name]: val }));
    };

    const onSourceChange = (e: { value: InvestigationSource }) => {
        setInvestigation((prev) => ({ ...prev, source: e.value }));
    };

    const onPriceChange = (value: number | null) => {
        setInvestigation((prev) => ({ ...prev, price: value || 0 }));
    };

    const leftToolbarTemplate = () => (
        <div className="flex flex-wrap gap-2">
            <Button label="New" icon="pi pi-plus" severity="success" onClick={openNew} />
        </div>
    );

    const actionBodyTemplate = (rowData: Investigation) => (
        <div className="flex gap-2">
            <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => editInvestigation(rowData)} />
            <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteInvestigation(rowData)} />
        </div>
    );

    const sourceBodyTemplate = (rowData: Investigation) => (
        <span className={`px-2 py-1 rounded-full text-sm font-medium ${rowData.source === InvestigationSource.internal ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{rowData.source}</span>
    );

    const priceBodyTemplate = (rowData: Investigation) => `$ ${rowData.price || '0.00'}`;

    const investigationDialogFooter = (
        <div>
            <Button label="Cancel" icon="pi pi-times" outlined onClick={hideDialog} />
            <Button label={crudType === CRUDTYPE.save ? 'Save' : 'Update'} icon="pi pi-check" loading={loading} onClick={saveInvestigation} />
        </div>
    );

    const deleteInvestigationDialogFooter = (
        <div>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteInvestigationDialog} />
            <Button label="Yes" icon="pi pi-check" severity="danger" loading={loading} onClick={deleteInvestigation} />
        </div>
    );

    return (
        <div className="card">
            <GeneralPageProps toastRef={toast} toastPosition="top-right" />

            <Card title="Investigations" className="mb-4">
                <p className="text-500 mb-4">Manage laboratory investigations and test results for this visit.</p>

                <Toolbar className="mb-4" left={leftToolbarTemplate} />

                <DataTable
                    value={investigations!}
                    dataKey="investigationId"
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} investigations"
                    emptyMessage="No investigations found."
                    scrollable
                    scrollHeight="400px"
                    loading={loading}
                >
                    <Column field="testName" header="Test Name" sortable style={{ minWidth: '12rem' }} />
                    <Column field="source" header="Source" body={sourceBodyTemplate} sortable style={{ minWidth: '8rem' }} />
                    <Column field="price" header="Price" body={priceBodyTemplate} sortable style={{ minWidth: '8rem' }} />
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }} />
                </DataTable>
            </Card>

            {/* \Add/Edit Investigation Dialog */}
            <Dialog visible={investigationDialog} style={{ width: '600px' }} header="Investigation Details" modal className="p-fluid" footer={investigationDialogFooter} onHide={hideDialog}>
                <div className="formgrid grid">
                    <div className="field col-12">
                        <label htmlFor="testName">Test Name *</label>
                        <InputText
                            id="testName"
                            value={investigation.testName}
                            onChange={(e) => onInputChange(e, 'testName')}
                            required
                            autoFocus
                            className={submitted && !investigation.testName ? 'p-invalid' : ''}
                            placeholder="e.g. Complete Blood Count"
                        />
                        {submitted && !investigation.testName && <small className="p-error">Test name is required.</small>}
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="source">Source *</label>
                        <Dropdown id="source" value={investigation.source} onChange={onSourceChange} options={sourceOptions} placeholder="Select source" />
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="price">Price</label>
                        <InputNumber id="price" value={investigation.price} onChange={(e) => onPriceChange(e.value)} mode="currency" currency="USD" locale="en-US" placeholder="0.00" />
                    </div>

                    <div className="field col-12 md:col-3">
                        <label htmlFor="normalMin">Normal Min</label>
                        <InputNumber
                            id="normalMin"
                            value={investigation.normalMin ?? null}
                            onChange={(e) => setInvestigation((prev) => ({ ...prev, normalMin: e.value ?? null }))}
                            mode="decimal"
                            minFractionDigits={0}
                            maxFractionDigits={4}
                            placeholder="e.g. 4.5"
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label htmlFor="normalMax">Normal Max</label>
                        <InputNumber
                            id="normalMax"
                            value={investigation.normalMax ?? null}
                            onChange={(e) => setInvestigation((prev) => ({ ...prev, normalMax: e.value ?? null }))}
                            mode="decimal"
                            minFractionDigits={0}
                            maxFractionDigits={4}
                            placeholder="e.g. 11.0"
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label htmlFor="unit">Unit</label>
                        <InputText id="unit" value={investigation.unit ?? ''} onChange={(e) => setInvestigation((prev) => ({ ...prev, unit: e.target.value }))} placeholder="e.g. mg/dL" maxLength={40} />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label htmlFor="referenceText">Reference Text</label>
                        <InputText
                            id="referenceText"
                            value={investigation.referenceText ?? ''}
                            onChange={(e) => setInvestigation((prev) => ({ ...prev, referenceText: e.target.value }))}
                            placeholder="Free-text range / notes"
                            maxLength={500}
                        />
                    </div>
                </div>
            </Dialog>

            {/* \Delete Single Investigation Dialog */}
            <Dialog visible={deleteInvestigationDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteInvestigationDialogFooter} onHide={hideDeleteInvestigationDialog}>
                <div className="flex align-items-center justify-content-center">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {investigation && (
                        <span>
                            Are you sure you want to delete <b>{investigation.testName}</b>?
                        </span>
                    )}
                </div>
            </Dialog>
        </div>
    );
};

export default InvestigationManager;
