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
import { FinanceService, FinanceApService } from '@/libs/blue_prints/FinanceService';
import { FinanceApInvoice, FinanceVendor, FinanceGlAccount, FinanceCostCenter } from '@/types/finance/finance';

const toYmd = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : '');
const parseDate = (s: string | null | undefined) => (s ? new Date(s) : null);

type LineForm = { description: string; quantity: number; unitPrice: number; lineAmount: number; taxAmount: number; expenseAccountId: number | null; costCenterId: number | null };
const EMPTY_LINE: LineForm = { description: '', quantity: 1, unitPrice: 0, lineAmount: 0, taxAmount: 0, expenseAccountId: null, costCenterId: null };
const EMPTY_HEADER = {
    apInvoiceId: undefined as number | undefined,
    vendorId: null as number | null,
    vendorInvoiceNumber: '',
    vendorInvoiceDate: new Date() as Date | null,
    invoiceDate: new Date() as Date | null,
    dueDate: new Date() as Date | null,
    discountAmount: 0,
    otherCharges: 0,
    currencyCode: 'GHS',
    apAccountId: null as number | null,
    costCenterId: null as number | null,
    notes: ''
};

const ApInvoicesPage = () => {
    const toast = useRef<Toast>(null);
    const [rows, setRows] = useState<FinanceApInvoice[]>([]);
    const [vendors, setVendors] = useState<FinanceVendor[]>([]);
    const [apAccts, setApAccts] = useState<FinanceGlAccount[]>([]);
    const [expAccts, setExpAccts] = useState<FinanceGlAccount[]>([]);
    const [costCenters, setCostCenters] = useState<FinanceCostCenter[]>([]);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [crud, setCrud] = useState<'save' | 'update'>('save');
    const [header, setHeader] = useState({ ...EMPTY_HEADER });
    const [lines, setLines] = useState<LineForm[]>([{ ...EMPTY_LINE }]);

    const load = async () => {
        setLoading(true);
        const r = await FinanceApService.listApInvoices();
        setRows(Array.isArray(r.operatedData) ? r.operatedData : []);
        setLoading(false);
    };

    useEffect(() => {
        document.title = 'Finance · AP Invoices';
        void load();
        void FinanceApService.listVendors().then((r) => setVendors(Array.isArray(r.operatedData) ? r.operatedData : []));
        void FinanceService.listGlAccounts({ subLedgerType: 'AP', isActive: 1 }).then((r) => setApAccts(Array.isArray(r.operatedData) ? r.operatedData : []));
        void FinanceService.listGlAccounts({ allowPosting: 1, isActive: 1 }).then((r) => setExpAccts((Array.isArray(r.operatedData) ? r.operatedData : []).filter((a) => a.accountCategory === 'EXPENSE')));
        void FinanceService.listCostCenters().then((r) => setCostCenters(Array.isArray(r.operatedData) ? r.operatedData : []));
    }, []);

    const vendorOpts = useMemo(() => vendors.map((v) => ({ label: `${v.vendorCode} · ${v.vendorName}`, value: v.vendorId })), [vendors]);
    const apOpts = useMemo(() => [{ label: '— Default —', value: null }, ...apAccts.map((a) => ({ label: `${a.accountCode} · ${a.name}`, value: a.accountId }))], [apAccts]);
    const expOpts = useMemo(() => expAccts.map((a) => ({ label: `${a.accountCode} · ${a.name}`, value: a.accountId })), [expAccts]);
    const ccOpts = useMemo(() => [{ label: '— None —', value: null }, ...costCenters.map((c) => ({ label: `${c.code} · ${c.name}`, value: c.costCenterId }))], [costCenters]);

    const totals = useMemo(() => {
        const sub = lines.reduce((s, l) => s + (Number(l.lineAmount) || 0), 0);
        const tax = lines.reduce((s, l) => s + (Number(l.taxAmount) || 0), 0);
        const total = sub - Number(header.discountAmount || 0) + tax + Number(header.otherCharges || 0);
        return { sub, tax, total };
    }, [lines, header.discountAmount, header.otherCharges]);

    const save = async () => {
        if (!header.vendorId || !header.vendorInvoiceNumber.trim() || !header.invoiceDate || !header.dueDate) { toast.current?.show({ severity: 'warn', summary: 'Missing', detail: 'Vendor, invoice number and dates required.' }); return; }
        const clean = lines.filter((l) => l.description.trim() && l.expenseAccountId && Number(l.lineAmount) > 0);
        if (!clean.length) { toast.current?.show({ severity: 'warn', summary: 'Lines', detail: 'At least one valid line required.' }); return; }
        const r = await FinanceApService.upsertApInvoice({
            crudType: crud, apInvoiceId: header.apInvoiceId, vendorId: header.vendorId, vendorInvoiceNumber: header.vendorInvoiceNumber,
            vendorInvoiceDate: toYmd(header.vendorInvoiceDate), invoiceDate: toYmd(header.invoiceDate), dueDate: toYmd(header.dueDate),
            subtotalAmount: totals.sub, discountAmount: header.discountAmount, taxAmount: totals.tax, otherCharges: header.otherCharges, totalAmount: totals.total,
            currencyCode: header.currencyCode, apAccountId: header.apAccountId, costCenterId: header.costCenterId, notes: header.notes, lines: clean
        });
        const op = Number(r.operationalStatus);
        if (op !== 1 && op !== 2) { toast.current?.show({ severity: 'error', summary: 'Failed', detail: 'Could not save invoice.' }); return; }
        toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Invoice saved.' });
        setVisible(false); await load();
    };

    const openEdit = async (r: FinanceApInvoice) => {
        setCrud('update');
        setHeader({ apInvoiceId: r.apInvoiceId, vendorId: r.vendorId, vendorInvoiceNumber: r.vendorInvoiceNumber, vendorInvoiceDate: parseDate(r.vendorInvoiceDate), invoiceDate: parseDate(r.invoiceDate), dueDate: parseDate(r.dueDate), discountAmount: Number(r.discountAmount), otherCharges: Number(r.otherCharges), currencyCode: r.currencyCode, apAccountId: r.apAccountId, costCenterId: r.costCenterId, notes: r.notes ?? '' });
        const lr = await FinanceApService.getApInvoiceLines(r.apInvoiceId);
        const ll = Array.isArray(lr.operatedData) ? lr.operatedData : [];
        setLines(ll.length ? ll.map((l) => ({ description: l.description, quantity: Number(l.quantity), unitPrice: Number(l.unitPrice), lineAmount: Number(l.lineAmount), taxAmount: Number(l.taxAmount), expenseAccountId: l.expenseAccountId, costCenterId: l.costCenterId })) : [{ ...EMPTY_LINE }]);
        setVisible(true);
    };

    const approve = (id: number) => confirmDialog({
        message: 'Approve this AP invoice?',
        header: 'Confirm',
        accept: async () => {
            const r = await FinanceApService.approveApInvoice(id);
            const op = Number(r.operationalStatus);
            if (op === 1 || op === 2) { toast.current?.show({ severity: 'success', summary: 'Approved', detail: 'Invoice approved.' }); await load(); }
            else toast.current?.show({ severity: 'error', summary: 'Failed', detail: 'Could not approve.' });
        }
    });

    const statusSeverity = (s: string): 'success' | 'info' | 'warning' | 'danger' => (s === 'PAID' || s === 'APPROVED' ? 'success' : s === 'DRAFT' ? 'info' : s === 'CANCELLED' || s === 'DISPUTED' ? 'danger' : 'warning');

    return (
        <div className="grid">
            <Toast ref={toast} /><ConfirmDialog />
            <div className="col-12">
                <Card title="AP Invoices">
                    <div className="flex justify-content-end mb-3"><Button label="New Invoice" icon="pi pi-plus" onClick={() => { setCrud('save'); setHeader({ ...EMPTY_HEADER }); setLines([{ ...EMPTY_LINE }]); setVisible(true); }} /></div>
                    <DataTable value={rows} loading={loading} paginator rows={15} dataKey="apInvoiceId" stripedRows responsiveLayout="scroll">
                        <Column field="invoiceNumber" header="Number" sortable />
                        <Column field="vendorName" header="Vendor" />
                        <Column field="vendorInvoiceNumber" header="Vendor Inv #" />
                        <Column field="invoiceDate" header="Date" />
                        <Column field="dueDate" header="Due" />
                        <Column field="totalAmount" header="Total" body={(r: FinanceApInvoice) => Number(r.totalAmount).toFixed(2)} />
                        <Column field="balanceAmount" header="Balance" body={(r: FinanceApInvoice) => Number(r.balanceAmount).toFixed(2)} />
                        <Column field="status" header="Status" body={(r: FinanceApInvoice) => <Tag value={r.status} severity={statusSeverity(r.status)} />} />
                        <Column header="Actions" body={(r: FinanceApInvoice) => (
                            <div className="flex gap-1">
                                <Button icon="pi pi-pencil" rounded text onClick={() => openEdit(r)} disabled={r.status === 'POSTED' || r.status === 'PAID' || r.status === 'CANCELLED'} />
                                <Button icon="pi pi-check" rounded text severity="success" tooltip="Approve" onClick={() => approve(r.apInvoiceId)} disabled={r.status === 'APPROVED' || r.status === 'POSTED' || r.status === 'PAID' || r.status === 'CANCELLED'} />
                            </div>
                        )} />
                    </DataTable>
                </Card>
            </div>

            <Dialog header={crud === 'save' ? 'New AP Invoice' : 'Edit AP Invoice'} visible={visible} style={{ width: '950px' }} modal onHide={() => setVisible(false)}>
                <div className="grid pt-3">
                    <div className="col-12 md:col-6"><label className="block mb-1">Vendor *</label><Dropdown className="w-full" options={vendorOpts} value={header.vendorId} onChange={(e) => setHeader({ ...header, vendorId: e.value })} filter /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Vendor Invoice # *</label><InputText className="w-full" value={header.vendorInvoiceNumber} onChange={(e) => setHeader({ ...header, vendorInvoiceNumber: e.target.value })} /></div>
                    <div className="col-12 md:col-4"><label className="block mb-1">Vendor Invoice Date</label><Calendar className="w-full" value={header.vendorInvoiceDate} onChange={(e) => setHeader({ ...header, vendorInvoiceDate: e.value as Date | null })} dateFormat="yy-mm-dd" /></div>
                    <div className="col-12 md:col-4"><label className="block mb-1">Invoice Date *</label><Calendar className="w-full" value={header.invoiceDate} onChange={(e) => setHeader({ ...header, invoiceDate: e.value as Date | null })} dateFormat="yy-mm-dd" /></div>
                    <div className="col-12 md:col-4"><label className="block mb-1">Due Date *</label><Calendar className="w-full" value={header.dueDate} onChange={(e) => setHeader({ ...header, dueDate: e.value as Date | null })} dateFormat="yy-mm-dd" /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">AP Account (override)</label><Dropdown className="w-full" options={apOpts} value={header.apAccountId} onChange={(e) => setHeader({ ...header, apAccountId: e.value })} filter /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Cost Center</label><Dropdown className="w-full" options={ccOpts} value={header.costCenterId} onChange={(e) => setHeader({ ...header, costCenterId: e.value })} filter /></div>

                    <div className="col-12 mt-2">
                        <div className="flex justify-content-between mb-2"><h4 className="m-0">Lines</h4><Button label="Add Line" icon="pi pi-plus" size="small" onClick={() => setLines([...lines, { ...EMPTY_LINE }])} /></div>
                        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                            <thead><tr><th>Description</th><th>Account</th><th>Cost Center</th><th>Qty</th><th>Unit</th><th>Amount</th><th>Tax</th><th></th></tr></thead>
                            <tbody>
                                {lines.map((l, i) => (
                                    <tr key={i}>
                                        <td><InputText className="w-full" value={l.description} onChange={(e) => { const n = [...lines]; n[i] = { ...n[i], description: e.target.value }; setLines(n); }} /></td>
                                        <td><Dropdown className="w-full" options={expOpts} value={l.expenseAccountId} onChange={(e) => { const n = [...lines]; n[i] = { ...n[i], expenseAccountId: e.value }; setLines(n); }} filter /></td>
                                        <td><Dropdown className="w-full" options={ccOpts} value={l.costCenterId} onChange={(e) => { const n = [...lines]; n[i] = { ...n[i], costCenterId: e.value }; setLines(n); }} /></td>
                                        <td><InputNumber value={l.quantity} onValueChange={(e) => { const n = [...lines]; const q = e.value ?? 0; n[i] = { ...n[i], quantity: q, lineAmount: q * n[i].unitPrice }; setLines(n); }} /></td>
                                        <td><InputNumber value={l.unitPrice} onValueChange={(e) => { const n = [...lines]; const up = e.value ?? 0; n[i] = { ...n[i], unitPrice: up, lineAmount: n[i].quantity * up }; setLines(n); }} mode="decimal" minFractionDigits={2} /></td>
                                        <td><InputNumber value={l.lineAmount} onValueChange={(e) => { const n = [...lines]; n[i] = { ...n[i], lineAmount: e.value ?? 0 }; setLines(n); }} mode="decimal" minFractionDigits={2} /></td>
                                        <td><InputNumber value={l.taxAmount} onValueChange={(e) => { const n = [...lines]; n[i] = { ...n[i], taxAmount: e.value ?? 0 }; setLines(n); }} mode="decimal" minFractionDigits={2} /></td>
                                        <td><Button icon="pi pi-trash" rounded text severity="danger" onClick={() => setLines(lines.filter((_, j) => j !== i))} disabled={lines.length <= 1} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="col-12 md:col-4"><label className="block mb-1">Discount</label><InputNumber className="w-full" value={header.discountAmount} onValueChange={(e) => setHeader({ ...header, discountAmount: e.value ?? 0 })} mode="decimal" minFractionDigits={2} /></div>
                    <div className="col-12 md:col-4"><label className="block mb-1">Other Charges</label><InputNumber className="w-full" value={header.otherCharges} onValueChange={(e) => setHeader({ ...header, otherCharges: e.value ?? 0 })} mode="decimal" minFractionDigits={2} /></div>
                    <div className="col-12 md:col-4 flex align-items-end"><div className="w-full text-right"><div>Subtotal: <b>{totals.sub.toFixed(2)}</b></div><div>Tax: <b>{totals.tax.toFixed(2)}</b></div><div>Total: <b>{totals.total.toFixed(2)}</b></div></div></div>
                    <div className="col-12"><label className="block mb-1">Notes</label><InputTextarea className="w-full" rows={2} value={header.notes} onChange={(e) => setHeader({ ...header, notes: e.target.value })} /></div>
                    <div className="col-12 flex justify-content-end gap-2 mt-2"><Button label="Cancel" severity="secondary" outlined onClick={() => setVisible(false)} /><Button label="Save" icon="pi pi-check" onClick={save} /></div>
                </div>
            </Dialog>
        </div>
    );
};

export default ApInvoicesPage;
