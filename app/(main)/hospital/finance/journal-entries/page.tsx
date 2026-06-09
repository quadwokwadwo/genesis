'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { FinanceService, FinanceJournalService } from '@/libs/blue_prints/FinanceService';
import { FinanceJournalEntry, FinanceFiscalPeriod, FinanceGlAccount, FinanceCostCenter } from '@/types/finance/finance';

const toYmd = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : '');
const parseDate = (s: string | null | undefined) => (s ? new Date(s) : null);

const STATUSES = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'POSTED', 'REVERSED', 'CANCELLED'];
const TYPES = ['STANDARD', 'ADJUSTING', 'CLOSING', 'REVERSING', 'RECURRING', 'OPENING'].map((v) => ({ label: v, value: v }));

type LineForm = { accountId: number | null; description: string; debitAmount: number; creditAmount: number; costCenterId: number | null };

const EMPTY_LINE: LineForm = { accountId: null, description: '', debitAmount: 0, creditAmount: 0, costCenterId: null };
const EMPTY_HEADER = {
    journalEntryId: undefined as number | undefined,
    fiscalPeriodId: null as number | null,
    journalType: 'STANDARD' as FinanceJournalEntry['journalType'],
    entryDate: new Date() as Date | null,
    referenceType: '',
    referenceNumber: '',
    description: '',
    notes: ''
};

const JournalEntriesPage = () => {
    const toast = useRef<Toast>(null);
    const [rows, setRows] = useState<FinanceJournalEntry[]>([]);
    const [periods, setPeriods] = useState<FinanceFiscalPeriod[]>([]);
    const [accounts, setAccounts] = useState<FinanceGlAccount[]>([]);
    const [costCenters, setCostCenters] = useState<FinanceCostCenter[]>([]);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [crud, setCrud] = useState<'save' | 'update'>('save');
    const [header, setHeader] = useState({ ...EMPTY_HEADER });
    const [lines, setLines] = useState<LineForm[]>([{ ...EMPTY_LINE }, { ...EMPTY_LINE }]);

    const load = async () => {
        setLoading(true);
        const r = await FinanceJournalService.listJournalEntries();
        setRows(Array.isArray(r.operatedData) ? r.operatedData : []);
        setLoading(false);
    };

    useEffect(() => {
        document.title = 'Finance · Journal Entries';
        void load();
        void FinanceService.listFiscalPeriods().then((p) => setPeriods(Array.isArray(p.operatedData) ? p.operatedData : []));
        void FinanceService.listGlAccounts({ allowPosting: 1, isActive: 1 }).then((a) => setAccounts(Array.isArray(a.operatedData) ? a.operatedData : []));
        void FinanceService.listCostCenters().then((c) => setCostCenters(Array.isArray(c.operatedData) ? c.operatedData : []));
    }, []);

    const acctOptions = useMemo(() => accounts.map((a) => ({ label: `${a.accountCode} · ${a.name}`, value: a.accountId })), [accounts]);
    const ccOptions = useMemo(() => [{ label: '— None —', value: null }, ...costCenters.map((c) => ({ label: `${c.code} · ${c.name}`, value: c.costCenterId }))], [costCenters]);
    const periodOptions = useMemo(() => periods.filter((p) => p.glStatus === 'OPEN').map((p) => ({ label: `${p.yearCode} · ${p.name}`, value: p.fiscalPeriodId })), [periods]);

    const totals = useMemo(() => {
        const dr = lines.reduce((s, l) => s + (Number(l.debitAmount) || 0), 0);
        const cr = lines.reduce((s, l) => s + (Number(l.creditAmount) || 0), 0);
        return { dr, cr, diff: dr - cr };
    }, [lines]);

    const openCreate = () => {
        setCrud('save'); setHeader({ ...EMPTY_HEADER }); setLines([{ ...EMPTY_LINE }, { ...EMPTY_LINE }]); setVisible(true);
    };

    const openEdit = async (r: FinanceJournalEntry) => {
        setCrud('update');
        setHeader({ journalEntryId: r.journalEntryId, fiscalPeriodId: r.fiscalPeriodId, journalType: r.journalType, entryDate: parseDate(r.entryDate), referenceType: r.referenceType ?? '', referenceNumber: r.referenceNumber ?? '', description: r.description, notes: r.notes ?? '' });
        const lr = await FinanceJournalService.getJournalLines(r.journalEntryId);
        const ll = Array.isArray(lr.operatedData) ? lr.operatedData : [];
        setLines(ll.length ? ll.map((l) => ({ accountId: l.accountId, description: l.description ?? '', debitAmount: Number(l.debitAmount), creditAmount: Number(l.creditAmount), costCenterId: l.costCenterId })) : [{ ...EMPTY_LINE }, { ...EMPTY_LINE }]);
        setVisible(true);
    };

    const save = async () => {
        if (!header.fiscalPeriodId || !header.entryDate || !header.description.trim()) { toast.current?.show({ severity: 'warn', summary: 'Missing', detail: 'Period, date and description required.' }); return; }
        const cleanLines = lines.filter((l) => l.accountId && (Number(l.debitAmount) > 0 || Number(l.creditAmount) > 0));
        if (cleanLines.length < 2) { toast.current?.show({ severity: 'warn', summary: 'Lines', detail: 'At least two valid lines required.' }); return; }
        if (Math.abs(totals.diff) > 0.005) { toast.current?.show({ severity: 'warn', summary: 'Out of balance', detail: `Dr ${totals.dr.toFixed(2)} vs Cr ${totals.cr.toFixed(2)}` }); return; }
        const r = await FinanceJournalService.upsertJournalEntry({
            crudType: crud, journalEntryId: header.journalEntryId, fiscalPeriodId: header.fiscalPeriodId,
            journalType: header.journalType, entryDate: toYmd(header.entryDate), referenceType: header.referenceType, referenceNumber: header.referenceNumber,
            description: header.description, notes: header.notes, lines: cleanLines
        });
        const op = Number(r.operationalStatus);
        if (op !== 1 && op !== 2) { toast.current?.show({ severity: 'error', summary: 'Failed', detail: 'Could not save journal entry.' }); return; }
        toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Journal entry saved.' });
        setVisible(false); await load();
    };

    const post = (id: number) => confirmDialog({
        message: 'Post this journal entry to the general ledger? This action is permanent.',
        header: 'Confirm Posting',
        accept: async () => {
            const r = await FinanceJournalService.postJournalEntry(id);
            const op = Number(r.operationalStatus);
            if (op === 1 || op === 2) { toast.current?.show({ severity: 'success', summary: 'Posted', detail: 'Journal entry posted.' }); await load(); }
            else toast.current?.show({ severity: 'error', summary: 'Failed', detail: 'Could not post.' });
        }
    });

    const reverse = (id: number) => confirmDialog({
        message: 'Reverse this posted journal entry? A new reversing entry will be created.',
        header: 'Confirm Reversal',
        accept: async () => {
            const r = await FinanceJournalService.reverseJournalEntry(id);
            const op = Number(r.operationalStatus);
            if (op === 1 || op === 2) { toast.current?.show({ severity: 'success', summary: 'Reversed', detail: 'Reversal posted.' }); await load(); }
            else toast.current?.show({ severity: 'error', summary: 'Failed', detail: 'Could not reverse.' });
        }
    });

    const statusSeverity = (s: string): 'success' | 'info' | 'warning' | 'danger' => (s === 'POSTED' ? 'success' : s === 'DRAFT' ? 'info' : s === 'CANCELLED' || s === 'REVERSED' ? 'danger' : 'warning');

    return (
        <div className="grid">
            <Toast ref={toast} /><ConfirmDialog />
            <div className="col-12">
                <Card title="Journal Entries">
                    <div className="flex justify-content-end mb-3"><Button label="New Journal Entry" icon="pi pi-plus" onClick={openCreate} /></div>
                    <DataTable value={rows} loading={loading} paginator rows={15} dataKey="journalEntryId" stripedRows responsiveLayout="scroll">
                        <Column field="journalNumber" header="Number" sortable />
                        <Column field="entryDate" header="Date" sortable />
                        <Column field="fiscalPeriodName" header="Period" />
                        <Column field="journalType" header="Type" />
                        <Column field="description" header="Description" />
                        <Column field="totalDebit" header="Debit" body={(r: FinanceJournalEntry) => Number(r.totalDebit).toFixed(2)} />
                        <Column field="totalCredit" header="Credit" body={(r: FinanceJournalEntry) => Number(r.totalCredit).toFixed(2)} />
                        <Column field="status" header="Status" body={(r: FinanceJournalEntry) => <Tag value={r.status} severity={statusSeverity(r.status)} />} />
                        <Column header="Actions" body={(r: FinanceJournalEntry) => (
                            <div className="flex gap-1">
                                <Button icon="pi pi-pencil" rounded text onClick={() => openEdit(r)} disabled={r.status === 'POSTED' || r.status === 'REVERSED'} />
                                <Button icon="pi pi-check" rounded text severity="success" tooltip="Post" onClick={() => post(r.journalEntryId)} disabled={r.status === 'POSTED' || r.status === 'REVERSED' || r.status === 'CANCELLED'} />
                                <Button icon="pi pi-replay" rounded text severity="warning" tooltip="Reverse" onClick={() => reverse(r.journalEntryId)} disabled={r.status !== 'POSTED' || r.isReversed === 1} />
                            </div>
                        )} />
                    </DataTable>
                </Card>
            </div>

            <Dialog header={crud === 'save' ? 'New Journal Entry' : 'Edit Journal Entry'} visible={visible} style={{ width: '900px' }} modal onHide={() => setVisible(false)}>
                <div className="grid pt-3">
                    <div className="col-12 md:col-4"><label className="block mb-1">Fiscal Period *</label><Dropdown className="w-full" options={periodOptions} value={header.fiscalPeriodId} onChange={(e) => setHeader({ ...header, fiscalPeriodId: e.value })} filter /></div>
                    <div className="col-12 md:col-4"><label className="block mb-1">Entry Date *</label><Calendar className="w-full" value={header.entryDate} onChange={(e) => setHeader({ ...header, entryDate: e.value as Date | null })} dateFormat="yy-mm-dd" /></div>
                    <div className="col-12 md:col-4"><label className="block mb-1">Type</label><Dropdown className="w-full" options={TYPES} value={header.journalType} onChange={(e) => setHeader({ ...header, journalType: e.value })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Reference Type</label><InputText className="w-full" value={header.referenceType} onChange={(e) => setHeader({ ...header, referenceType: e.target.value })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Reference Number</label><InputText className="w-full" value={header.referenceNumber} onChange={(e) => setHeader({ ...header, referenceNumber: e.target.value })} /></div>
                    <div className="col-12"><label className="block mb-1">Description *</label><InputText className="w-full" value={header.description} onChange={(e) => setHeader({ ...header, description: e.target.value })} /></div>
                    <div className="col-12"><label className="block mb-1">Notes</label><InputTextarea className="w-full" rows={2} value={header.notes} onChange={(e) => setHeader({ ...header, notes: e.target.value })} /></div>

                    <div className="col-12 mt-2">
                        <div className="flex justify-content-between mb-2"><h4 className="m-0">Lines</h4><Button label="Add Line" icon="pi pi-plus" size="small" onClick={() => setLines([...lines, { ...EMPTY_LINE }])} /></div>
                        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                            <thead><tr><th>Account *</th><th>Description</th><th>Cost Center</th><th>Debit</th><th>Credit</th><th></th></tr></thead>
                            <tbody>
                                {lines.map((l, i) => (
                                    <tr key={i}>
                                        <td><Dropdown className="w-full" options={acctOptions} value={l.accountId} onChange={(e) => { const n = [...lines]; n[i] = { ...n[i], accountId: e.value }; setLines(n); }} filter placeholder="Select" /></td>
                                        <td><InputText className="w-full" value={l.description} onChange={(e) => { const n = [...lines]; n[i] = { ...n[i], description: e.target.value }; setLines(n); }} /></td>
                                        <td><Dropdown className="w-full" options={ccOptions} value={l.costCenterId} onChange={(e) => { const n = [...lines]; n[i] = { ...n[i], costCenterId: e.value }; setLines(n); }} /></td>
                                        <td><InputNumber value={l.debitAmount} onValueChange={(e) => { const n = [...lines]; n[i] = { ...n[i], debitAmount: e.value ?? 0, creditAmount: e.value ? 0 : n[i].creditAmount }; setLines(n); }} mode="decimal" minFractionDigits={2} /></td>
                                        <td><InputNumber value={l.creditAmount} onValueChange={(e) => { const n = [...lines]; n[i] = { ...n[i], creditAmount: e.value ?? 0, debitAmount: e.value ? 0 : n[i].debitAmount }; setLines(n); }} mode="decimal" minFractionDigits={2} /></td>
                                        <td><Button icon="pi pi-trash" rounded text severity="danger" onClick={() => setLines(lines.filter((_, j) => j !== i))} disabled={lines.length <= 2} /></td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr><td colSpan={3} className="text-right font-bold">Totals:</td><td>{totals.dr.toFixed(2)}</td><td>{totals.cr.toFixed(2)}</td><td>{Math.abs(totals.diff) < 0.005 ? <Tag severity="success" value="Balanced" /> : <Tag severity="danger" value={`Δ ${totals.diff.toFixed(2)}`} />}</td></tr>
                            </tfoot>
                        </table>
                    </div>

                    <div className="col-12 flex justify-content-end gap-2 mt-3"><Button label="Cancel" severity="secondary" outlined onClick={() => setVisible(false)} /><Button label="Save" icon="pi pi-check" onClick={save} /></div>
                </div>
            </Dialog>
        </div>
    );
};

export default JournalEntriesPage;
