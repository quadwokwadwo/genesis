'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';

import InvestigationsModel from '@/libs/blue_prints/InvestigationsModel';
import useUserData from '@/libs/hooks/useUserData';
import { displayMessage, pageDataValidation } from '@/libs/utils';
import { validateInvestigationResult } from '@/libs/joiValidations';
import { TInvestigationResult } from '@/types/hospital';

const ALLOWED_ROLES = ['lab_tech', 'admin', 'nurse'];

const STATUS_OPTIONS = [
    { label: 'Entered', value: 'Entered' },
    { label: 'Verified', value: 'Verified' },
    { label: 'Rejected', value: 'Rejected' }
];

type EntryForm = {
    visitInvestigationId: number;
    investigationId: number;
    testName?: string;
    unit?: string | null;
    normalMin?: number | null;
    normalMax?: number | null;
    referenceText?: string | null;
    resultValue: string;
    resultNumeric: number | null;
    comments: string;
};

const EMPTY_FORM: EntryForm = {
    visitInvestigationId: 0,
    investigationId: 0,
    testName: '',
    unit: '',
    normalMin: null,
    normalMax: null,
    referenceText: '',
    resultValue: '',
    resultNumeric: null,
    comments: ''
};

const LabEntryPage = () => {
    const toast = useRef(null);
    const { user, isLoaded } = useUserData<{ role?: string }>();

    const [results, setResults] = useState<TInvestigationResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string | null>('Entered');
    const [dialogVisible, setDialogVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState<EntryForm>(EMPTY_FORM);

    const service = useMemo(() => new InvestigationsModel(), []);

    const role = user?.role || '';
    const isAllowed = ALLOWED_ROLES.includes(role);

    const loadResults = async () => {
        setLoading(true);
        try {
            const res = await service.getResults({ status: statusFilter || undefined, pageSize: 200 });
            setResults((res.operatedData as TInvestigationResult[]) || []);
        } catch (err) {
            displayMessage({ toastComponent: toast, header: 'Error', message: 'Failed to load results', infoType: 'error', life: 3000 });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLoaded && isAllowed) {
            loadResults().catch(console.error);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoaded, isAllowed, statusFilter]);

    if (!isLoaded) {
        return <div className="p-4">Loading...</div>;
    }

    if (!isAllowed) {
        return (
            <div className="card">
                <h3>Forbidden</h3>
                <p>You do not have permission to enter lab results.</p>
            </div>
        );
    }

    const openEntryDialog = (row?: TInvestigationResult) => {
        if (row) {
            setForm({
                visitInvestigationId: row.visitInvestigationId,
                investigationId: row.investigationId,
                testName: row.testName,
                unit: row.unit ?? '',
                normalMin: row.normalMin ?? null,
                normalMax: row.normalMax ?? null,
                referenceText: row.referenceText ?? '',
                resultValue: row.resultValue ?? '',
                resultNumeric: row.resultNumeric ?? null,
                comments: row.comments ?? ''
            });
        } else {
            setForm(EMPTY_FORM);
        }
        setDialogVisible(true);
    };

    const closeDialog = () => {
        setDialogVisible(false);
        setForm(EMPTY_FORM);
    };

    const onSubmit = async () => {
        const payload = {
            investigationId: form.investigationId,
            resultValue: form.resultValue || undefined,
            resultNumeric: form.resultNumeric ?? undefined,
            comments: form.comments || undefined
        };
        if (!form.visitInvestigationId || !form.investigationId) {
            displayMessage({ toastComponent: toast, header: 'Validation', message: 'Visit and investigation are required', infoType: 'warn', life: 3000 });
            return;
        }
        if (!pageDataValidation(validateInvestigationResult, payload, toast)) return;
        setSubmitting(true);
        try {
            const res = await service.recordResult(form.visitInvestigationId, payload);
            if (res.status === 200 || res.status === 201) {
                displayMessage({ toastComponent: toast, header: 'Saved', message: 'Result recorded', infoType: 'success', life: 2500 });
                closeDialog();
                loadResults().catch(console.error);
            } else {
                displayMessage({ toastComponent: toast, header: 'Error', message: 'Could not save result', infoType: 'error', life: 3000 });
            }
        } catch (err: any) {
            const msg = err?.response?.data?.error?.message || 'Failed to record result';
            displayMessage({ toastComponent: toast, header: 'Error', message: msg, infoType: 'error', life: 3500 });
        } finally {
            setSubmitting(false);
        }
    };

    const statusBody = (row: TInvestigationResult) => {
        const sev = row.status === 'Verified' ? 'success' : row.status === 'Rejected' ? 'danger' : 'info';
        return <Tag value={row.status} severity={sev} />;
    };

    const rangeBody = (row: TInvestigationResult) => {
        if (row.normalMin != null && row.normalMax != null) {
            return `${row.normalMin} – ${row.normalMax}${row.unit ? ' ' + row.unit : ''}`;
        }
        return row.referenceText || '-';
    };

    const numericBody = (row: TInvestigationResult) => {
        if (row.resultNumeric == null) return row.resultValue || '-';
        const min = row.normalMin;
        const max = row.normalMax;
        const out = (min != null && row.resultNumeric < min) || (max != null && row.resultNumeric > max);
        return <span style={{ color: out ? '#c0392b' : undefined, fontWeight: out ? 600 : 400 }}>{row.resultNumeric}</span>;
    };

    const actionsBody = (row: TInvestigationResult) => (
        <Button
            label={row.status === 'Entered' ? 'Edit' : 'Re-enter'}
            icon="pi pi-pencil"
            size="small"
            outlined
            onClick={() => openEntryDialog(row)}
            disabled={row.status === 'Verified'}
        />
    );

    const dialogFooter = (
        <div>
            <Button label="Cancel" icon="pi pi-times" outlined onClick={closeDialog} />
            <Button label="Save Result" icon="pi pi-check" loading={submitting} onClick={onSubmit} />
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />
            <div className="flex justify-content-between align-items-center mb-3">
                <h3 className="m-0">Lab — Result Entry</h3>
                <div className="flex gap-2 align-items-center">
                    <Dropdown
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.value)}
                        options={[{ label: 'All', value: null }, ...STATUS_OPTIONS]}
                        placeholder="Status"
                        className="w-10rem"
                    />
                    <Button icon="pi pi-refresh" outlined onClick={() => loadResults().catch(console.error)} />
                    <Button icon="pi pi-plus" label="New Entry" onClick={() => openEntryDialog()} />
                </div>
            </div>

            <DataTable value={results} loading={loading} paginator rows={10} responsiveLayout="scroll" emptyMessage="No investigation results found">
                <Column field="recordNumber" header="MRN" />
                <Column field="patientName" header="Patient" />
                <Column field="testName" header="Test" />
                <Column header="Reference" body={rangeBody} />
                <Column header="Result" body={numericBody} />
                <Column field="resultValue" header="Value" />
                <Column header="Status" body={statusBody} />
                <Column field="enteredByName" header="Entered By" />
                <Column field="enteredAt" header="Entered At" />
                <Column header="Actions" body={actionsBody} style={{ width: '10rem' }} />
            </DataTable>

            <Dialog visible={dialogVisible} header="Record Investigation Result" modal style={{ width: '650px' }} footer={dialogFooter} onHide={closeDialog}>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-6">
                        <label>Visit Investigation ID *</label>
                        <InputNumber
                            value={form.visitInvestigationId || null}
                            onValueChange={(e) => setForm((prev) => ({ ...prev, visitInvestigationId: Number(e.value) || 0 }))}
                            useGrouping={false}
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label>Investigation ID *</label>
                        <InputNumber
                            value={form.investigationId || null}
                            onValueChange={(e) => setForm((prev) => ({ ...prev, investigationId: Number(e.value) || 0 }))}
                            useGrouping={false}
                        />
                    </div>
                    <div className="field col-12">
                        <label>Test</label>
                        <InputText value={form.testName ?? ''} disabled />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label>Reference Range</label>
                        <InputText
                            value={
                                form.normalMin != null && form.normalMax != null
                                    ? `${form.normalMin} – ${form.normalMax}${form.unit ? ' ' + form.unit : ''}`
                                    : form.referenceText ?? ''
                            }
                            disabled
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label>Numeric Result</label>
                        <InputNumber
                            value={form.resultNumeric}
                            onValueChange={(e) => setForm((prev) => ({ ...prev, resultNumeric: e.value ?? null }))}
                            minFractionDigits={0}
                            maxFractionDigits={4}
                        />
                    </div>
                    <div className="field col-12">
                        <label>Result Value (text)</label>
                        <InputText value={form.resultValue} onChange={(e) => setForm((prev) => ({ ...prev, resultValue: e.target.value }))} maxLength={500} />
                    </div>
                    <div className="field col-12">
                        <label>Comments</label>
                        <InputTextarea rows={3} value={form.comments} onChange={(e) => setForm((prev) => ({ ...prev, comments: e.target.value }))} maxLength={2000} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default LabEntryPage;
