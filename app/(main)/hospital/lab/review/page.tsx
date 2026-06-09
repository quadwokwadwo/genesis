'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';

import InvestigationsModel from '@/libs/blue_prints/InvestigationsModel';
import useUserData from '@/libs/hooks/useUserData';
import { displayMessage, pageDataValidation } from '@/libs/utils';
import { validateRejectResult } from '@/libs/joiValidations';
import { TInvestigationResult } from '@/types/hospital';

const ALLOWED_ROLES = ['doctor', 'admin'];

const STATUS_OPTIONS = [
    { label: 'Entered', value: 'Entered' },
    { label: 'Verified', value: 'Verified' },
    { label: 'Rejected', value: 'Rejected' }
];

const LabReviewPage = () => {
    const toast = useRef(null);
    const { user, isLoaded } = useUserData<{ role?: string }>();

    const [results, setResults] = useState<TInvestigationResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string | null>('Entered');
    const [rejectDialog, setRejectDialog] = useState(false);
    const [rejecting, setRejecting] = useState(false);
    const [activeRow, setActiveRow] = useState<TInvestigationResult | null>(null);
    const [reason, setReason] = useState('');

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
                <p>You do not have permission to review lab results.</p>
            </div>
        );
    }

    const doVerify = async (row: TInvestigationResult) => {
        try {
            const res = await service.verifyResult(row.resultId);
            if (res.status === 200) {
                displayMessage({ toastComponent: toast, header: 'Verified', message: 'Result verified', infoType: 'success', life: 2500 });
                loadResults().catch(console.error);
            } else {
                displayMessage({ toastComponent: toast, header: 'Error', message: 'Verification failed', infoType: 'error', life: 3000 });
            }
        } catch (err: any) {
            const msg = err?.response?.data?.error?.message || 'Verification failed';
            displayMessage({ toastComponent: toast, header: 'Error', message: msg, infoType: 'error', life: 3500 });
        }
    };

    const confirmVerify = (row: TInvestigationResult) => {
        confirmDialog({
            message: `Verify result for ${row.testName} (${row.patientName})?`,
            header: 'Confirm Verification',
            icon: 'pi pi-check-circle',
            acceptLabel: 'Verify',
            accept: () => doVerify(row)
        });
    };

    const openReject = (row: TInvestigationResult) => {
        setActiveRow(row);
        setReason('');
        setRejectDialog(true);
    };

    const closeReject = () => {
        setRejectDialog(false);
        setActiveRow(null);
        setReason('');
    };

    const submitReject = async () => {
        if (!activeRow) return;
        if (!pageDataValidation(validateRejectResult, { reason }, toast)) return;
        setRejecting(true);
        try {
            const res = await service.rejectResult(activeRow.resultId, reason.trim());
            if (res.status === 200) {
                displayMessage({ toastComponent: toast, header: 'Rejected', message: 'Result rejected', infoType: 'success', life: 2500 });
                closeReject();
                loadResults().catch(console.error);
            } else {
                displayMessage({ toastComponent: toast, header: 'Error', message: 'Rejection failed', infoType: 'error', life: 3000 });
            }
        } catch (err: any) {
            const msg = err?.response?.data?.error?.message || 'Rejection failed';
            displayMessage({ toastComponent: toast, header: 'Error', message: msg, infoType: 'error', life: 3500 });
        } finally {
            setRejecting(false);
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
        return <span style={{ color: out ? '#c0392b' : undefined, fontWeight: out ? 700 : 400 }}>{row.resultNumeric}</span>;
    };

    const actionsBody = (row: TInvestigationResult) => {
        if (row.status !== 'Entered') {
            return <span className="text-color-secondary text-sm">No actions</span>;
        }
        return (
            <div className="flex gap-2">
                <Button label="Verify" icon="pi pi-check" size="small" severity="success" onClick={() => confirmVerify(row)} />
                <Button label="Reject" icon="pi pi-times" size="small" severity="danger" outlined onClick={() => openReject(row)} />
            </div>
        );
    };

    const rejectFooter = (
        <div>
            <Button label="Cancel" icon="pi pi-times" outlined onClick={closeReject} />
            <Button label="Submit Rejection" icon="pi pi-check" severity="danger" loading={rejecting} onClick={submitReject} />
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />
            <div className="flex justify-content-between align-items-center mb-3">
                <h3 className="m-0">Lab — Result Review</h3>
                <div className="flex gap-2 align-items-center">
                    <Dropdown
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.value)}
                        options={[{ label: 'All', value: null }, ...STATUS_OPTIONS]}
                        placeholder="Status"
                        className="w-10rem"
                    />
                    <Button icon="pi pi-refresh" outlined onClick={() => loadResults().catch(console.error)} />
                </div>
            </div>

            <DataTable value={results} loading={loading} paginator rows={10} responsiveLayout="scroll" emptyMessage="No results awaiting review">
                <Column field="recordNumber" header="MRN" />
                <Column field="patientName" header="Patient" />
                <Column field="testName" header="Test" />
                <Column header="Reference" body={rangeBody} />
                <Column header="Result" body={numericBody} />
                <Column field="resultValue" header="Value" />
                <Column field="comments" header="Comments" />
                <Column header="Status" body={statusBody} />
                <Column field="enteredByName" header="Entered By" />
                <Column field="enteredAt" header="Entered At" />
                <Column header="Actions" body={actionsBody} style={{ width: '14rem' }} />
            </DataTable>

            <Dialog visible={rejectDialog} header="Reject Result" modal style={{ width: '500px' }} footer={rejectFooter} onHide={closeReject}>
                {activeRow && (
                    <div className="mb-3">
                        <p className="m-0">
                            <b>{activeRow.testName}</b> — {activeRow.patientName}
                        </p>
                    </div>
                )}
                <div className="field">
                    <label>Reason *</label>
                    <InputTextarea rows={4} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} placeholder="Min 10 characters" />
                </div>
            </Dialog>
        </div>
    );
};

export default LabReviewPage;
