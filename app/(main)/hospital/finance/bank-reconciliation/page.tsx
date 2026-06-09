'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { FinanceService, FinanceBankService } from '@/libs/blue_prints/FinanceService';
import { FinanceBankReconciliation, FinanceBankReconciliationItem, FinanceGlAccount } from '@/types/finance/finance';

const toYmd = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : '');
const parseDate = (s: string | null | undefined) => (s ? new Date(s) : null);

const TYPES = ['CHECK', 'DEPOSIT', 'TRANSFER', 'BANK_CHARGE', 'INTEREST', 'OTHER'].map((v) => ({ label: v, value: v }));

const EMPTY = { reconciliationId: undefined as number | undefined, bankAccountId: null as number | null, statementDate: new Date() as Date | null, statementEndingBalance: 0, bookBalance: 0, notes: '' };
const EMPTY_ITEM = { reconciliationItemId: undefined as number | undefined, reconciliationId: null as number | null, transactionType: 'CHECK' as FinanceBankReconciliationItem['transactionType'], transactionDate: new Date() as Date | null, referenceNumber: '', description: '', amount: 0, isDebit: true, isReconciled: false };

const BankReconciliationPage = () => {
    const toast = useRef<Toast>(null);
    const [rows, setRows] = useState<FinanceBankReconciliation[]>([]);
    const [items, setItems] = useState<FinanceBankReconciliationItem[]>([]);
    const [banks, setBanks] = useState<FinanceGlAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<FinanceBankReconciliation | null>(null);
    const [visible, setVisible] = useState(false);
    const [itemVisible, setItemVisible] = useState(false);
    const [crud, setCrud] = useState<'save' | 'update'>('save');
    const [itemCrud, setItemCrud] = useState<'save' | 'update'>('save');
    const [form, setForm] = useState({ ...EMPTY });
    const [itemForm, setItemForm] = useState({ ...EMPTY_ITEM });

    const load = async () => {
        setLoading(true);
        const r = await FinanceBankService.listReconciliations();
        setRows(Array.isArray(r.operatedData) ? r.operatedData : []);
        setLoading(false);
    };

    const loadItems = async (id: number) => {
        const r = await FinanceBankService.listReconciliationItems(id);
        setItems(Array.isArray(r.operatedData) ? r.operatedData : []);
    };

    useEffect(() => {
        document.title = 'Finance · Bank Reconciliation';
        void load();
        void FinanceService.listGlAccounts({ isBankAccount: 1, isActive: 1 }).then((r) => setBanks(Array.isArray(r.operatedData) ? r.operatedData : []));
    }, []);

    useEffect(() => { if (selected) void loadItems(selected.reconciliationId); else setItems([]); }, [selected]);

    const bankOpts = useMemo(() => banks.map((b) => ({ label: `${b.accountCode} · ${b.name}`, value: b.accountId })), [banks]);

    const save = async () => {
        if (!form.bankAccountId || !form.statementDate) { toast.current?.show({ severity: 'warn', summary: 'Missing', detail: 'Bank account and statement date required.' }); return; }
        const r = await FinanceBankService.upsertReconciliation({ crudType: crud, ...form, statementDate: toYmd(form.statementDate) });
        const op = Number(r.operationalStatus);
        if (op !== 1 && op !== 2) { toast.current?.show({ severity: 'error', summary: 'Failed', detail: 'Could not save.' }); return; }
        toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Reconciliation saved.' });
        setVisible(false); await load();
    };

    const saveItem = async () => {
        if (!selected || !itemForm.amount) { toast.current?.show({ severity: 'warn', summary: 'Missing', detail: 'Amount required.' }); return; }
        const r = await FinanceBankService.upsertReconciliationItem({ crudType: itemCrud, ...itemForm, reconciliationId: selected.reconciliationId, transactionDate: toYmd(itemForm.transactionDate) });
        const op = Number(r.operationalStatus);
        if (op !== 1 && op !== 2) { toast.current?.show({ severity: 'error', summary: 'Failed', detail: 'Could not save item.' }); return; }
        toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Item saved.' });
        setItemVisible(false); await loadItems(selected.reconciliationId);
    };

    const complete = (id: number) => confirmDialog({
        message: 'Mark this reconciliation as completed?',
        header: 'Confirm Complete',
        accept: async () => {
            const r = await FinanceBankService.completeReconciliation(id);
            const op = Number(r.operationalStatus);
            if (op === 1 || op === 2) { toast.current?.show({ severity: 'success', summary: 'Completed', detail: 'Reconciliation completed.' }); await load(); }
            else toast.current?.show({ severity: 'error', summary: 'Failed', detail: 'Could not complete.' });
        }
    });

    const statusSev = (s: string): 'success' | 'info' | 'warning' => (s === 'POSTED' || s === 'COMPLETED' ? 'success' : 'info');

    return (
        <div className="grid">
            <Toast ref={toast} /><ConfirmDialog />
            <div className="col-12">
                <Card title="Bank Reconciliations">
                    <div className="flex justify-content-end mb-3"><Button label="New Reconciliation" icon="pi pi-plus" onClick={() => { setCrud('save'); setForm({ ...EMPTY }); setVisible(true); }} /></div>
                    <DataTable value={rows} loading={loading} paginator rows={10} dataKey="reconciliationId" stripedRows responsiveLayout="scroll" selectionMode="single" selection={selected} onSelectionChange={(e: any) => setSelected(e.value)}>
                        <Column field="reconciliationNumber" header="Number" />
                        <Column field="bankAccountName" header="Bank" />
                        <Column field="statementDate" header="Statement Date" />
                        <Column field="statementEndingBalance" header="Statement" body={(r: FinanceBankReconciliation) => Number(r.statementEndingBalance).toFixed(2)} />
                        <Column field="bookBalance" header="Book" body={(r: FinanceBankReconciliation) => Number(r.bookBalance).toFixed(2)} />
                        <Column field="reconciledBalance" header="Reconciled" body={(r: FinanceBankReconciliation) => r.reconciledBalance !== null ? Number(r.reconciledBalance).toFixed(2) : '—'} />
                        <Column field="difference" header="Δ" body={(r: FinanceBankReconciliation) => r.difference !== null ? Number(r.difference).toFixed(2) : '—'} />
                        <Column field="status" header="Status" body={(r: FinanceBankReconciliation) => <Tag value={r.status} severity={statusSev(r.status)} />} />
                        <Column header="Actions" body={(r: FinanceBankReconciliation) => (
                            <div className="flex gap-1">
                                <Button icon="pi pi-pencil" rounded text disabled={r.status !== 'IN_PROGRESS'} onClick={() => { setCrud('update'); setForm({ reconciliationId: r.reconciliationId, bankAccountId: r.bankAccountId, statementDate: parseDate(r.statementDate), statementEndingBalance: Number(r.statementEndingBalance), bookBalance: Number(r.bookBalance), notes: r.notes ?? '' }); setVisible(true); }} />
                                <Button icon="pi pi-check" rounded text severity="success" tooltip="Complete" onClick={() => complete(r.reconciliationId)} disabled={r.status !== 'IN_PROGRESS'} />
                            </div>
                        )} />
                    </DataTable>
                </Card>
            </div>

            {selected && (
                <div className="col-12">
                    <Card title={`Items · ${selected.reconciliationNumber}`}>
                        <div className="flex justify-content-end mb-3"><Button label="Add Item" icon="pi pi-plus" onClick={() => { setItemCrud('save'); setItemForm({ ...EMPTY_ITEM }); setItemVisible(true); }} disabled={selected.status !== 'IN_PROGRESS'} /></div>
                        <DataTable value={items} dataKey="reconciliationItemId" stripedRows responsiveLayout="scroll">
                            <Column field="transactionDate" header="Date" />
                            <Column field="transactionType" header="Type" />
                            <Column field="referenceNumber" header="Ref" />
                            <Column field="description" header="Description" />
                            <Column field="amount" header="Amount" body={(r: FinanceBankReconciliationItem) => Number(r.amount).toFixed(2)} />
                            <Column header="Dr/Cr" body={(r: FinanceBankReconciliationItem) => <Tag value={r.isDebit ? 'Debit' : 'Credit'} severity={r.isDebit ? 'info' : 'warning'} />} />
                            <Column header="Reconciled" body={(r: FinanceBankReconciliationItem) => <Tag value={r.isReconciled ? 'Yes' : 'No'} severity={r.isReconciled ? 'success' : 'danger'} />} />
                            <Column header="Actions" body={(r: FinanceBankReconciliationItem) => (
                                <Button icon="pi pi-pencil" rounded text disabled={selected.status !== 'IN_PROGRESS'} onClick={() => { setItemCrud('update'); setItemForm({ reconciliationItemId: r.reconciliationItemId, reconciliationId: r.reconciliationId, transactionType: r.transactionType, transactionDate: parseDate(r.transactionDate), referenceNumber: r.referenceNumber ?? '', description: r.description ?? '', amount: Number(r.amount), isDebit: r.isDebit === 1, isReconciled: r.isReconciled === 1 }); setItemVisible(true); }} />
                            )} />
                        </DataTable>
                    </Card>
                </div>
            )}

            <Dialog header={crud === 'save' ? 'New Reconciliation' : 'Edit Reconciliation'} visible={visible} style={{ width: '520px' }} modal onHide={() => setVisible(false)}>
                <div className="grid pt-3">
                    <div className="col-12"><label className="block mb-1">Bank Account *</label><Dropdown className="w-full" options={bankOpts} value={form.bankAccountId} onChange={(e) => setForm({ ...form, bankAccountId: e.value })} filter /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Statement Date *</label><Calendar className="w-full" value={form.statementDate} onChange={(e) => setForm({ ...form, statementDate: e.value as Date | null })} dateFormat="yy-mm-dd" /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Statement Balance</label><InputNumber className="w-full" value={form.statementEndingBalance} onValueChange={(e) => setForm({ ...form, statementEndingBalance: e.value ?? 0 })} mode="decimal" minFractionDigits={2} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Book Balance</label><InputNumber className="w-full" value={form.bookBalance} onValueChange={(e) => setForm({ ...form, bookBalance: e.value ?? 0 })} mode="decimal" minFractionDigits={2} /></div>
                    <div className="col-12"><label className="block mb-1">Notes</label><InputTextarea className="w-full" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
                    <div className="col-12 flex justify-content-end gap-2 mt-2"><Button label="Cancel" severity="secondary" outlined onClick={() => setVisible(false)} /><Button label="Save" icon="pi pi-check" onClick={save} /></div>
                </div>
            </Dialog>

            <Dialog header={itemCrud === 'save' ? 'New Item' : 'Edit Item'} visible={itemVisible} style={{ width: '500px' }} modal onHide={() => setItemVisible(false)}>
                <div className="grid pt-3">
                    <div className="col-12 md:col-6"><label className="block mb-1">Type</label><Dropdown className="w-full" options={TYPES} value={itemForm.transactionType} onChange={(e) => setItemForm({ ...itemForm, transactionType: e.value })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Date</label><Calendar className="w-full" value={itemForm.transactionDate} onChange={(e) => setItemForm({ ...itemForm, transactionDate: e.value as Date | null })} dateFormat="yy-mm-dd" /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Reference</label><InputText className="w-full" value={itemForm.referenceNumber} onChange={(e) => setItemForm({ ...itemForm, referenceNumber: e.target.value })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Amount *</label><InputNumber className="w-full" value={itemForm.amount} onValueChange={(e) => setItemForm({ ...itemForm, amount: e.value ?? 0 })} mode="decimal" minFractionDigits={2} /></div>
                    <div className="col-12"><label className="block mb-1">Description</label><InputText className="w-full" value={itemForm.description} onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })} /></div>
                    <div className="col-6 flex align-items-center gap-2"><InputSwitch checked={itemForm.isDebit} onChange={(e) => setItemForm({ ...itemForm, isDebit: !!e.value })} /><span>Debit (else Credit)</span></div>
                    <div className="col-6 flex align-items-center gap-2"><InputSwitch checked={itemForm.isReconciled} onChange={(e) => setItemForm({ ...itemForm, isReconciled: !!e.value })} /><span>Reconciled</span></div>
                    <div className="col-12 flex justify-content-end gap-2 mt-2"><Button label="Cancel" severity="secondary" outlined onClick={() => setItemVisible(false)} /><Button label="Save" icon="pi pi-check" onClick={saveItem} /></div>
                </div>
            </Dialog>
        </div>
    );
};

export default BankReconciliationPage;
