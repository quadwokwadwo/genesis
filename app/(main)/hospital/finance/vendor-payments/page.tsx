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
import { FinanceVendorPayment, FinanceVendor, FinanceGlAccount, FinanceApInvoice } from '@/types/finance/finance';

const toYmd = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : '');
const parseDate = (s: string | null | undefined) => (s ? new Date(s) : null);

const METHODS = ['CHEQUE', 'BANK_TRANSFER', 'CASH', 'MOBILE_MONEY', 'OTHER'].map((v) => ({ label: v, value: v }));

type Alloc = { apInvoiceId: number | null; allocatedAmount: number; discountTaken: number };

const EMPTY_ALLOC: Alloc = { apInvoiceId: null, allocatedAmount: 0, discountTaken: 0 };
const EMPTY_HEADER = {
    vendorPaymentId: undefined as number | undefined,
    vendorId: null as number | null,
    paymentDate: new Date() as Date | null,
    paymentMethod: 'BANK_TRANSFER' as FinanceVendorPayment['paymentMethod'],
    chequeNumber: '',
    chequeDate: null as Date | null,
    bankAccountId: null as number | null,
    transactionReference: '',
    paymentAmount: 0,
    deductionAmount: 0,
    deductionReason: '',
    notes: ''
};

const VendorPaymentsPage = () => {
    const toast = useRef<Toast>(null);
    const [rows, setRows] = useState<FinanceVendorPayment[]>([]);
    const [vendors, setVendors] = useState<FinanceVendor[]>([]);
    const [banks, setBanks] = useState<FinanceGlAccount[]>([]);
    const [openInvoices, setOpenInvoices] = useState<FinanceApInvoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [crud, setCrud] = useState<'save' | 'update'>('save');
    const [header, setHeader] = useState({ ...EMPTY_HEADER });
    const [allocs, setAllocs] = useState<Alloc[]>([]);

    const load = async () => {
        setLoading(true);
        const r = await FinanceApService.listVendorPayments();
        setRows(Array.isArray(r.operatedData) ? r.operatedData : []);
        setLoading(false);
    };

    useEffect(() => {
        document.title = 'Finance · Vendor Payments';
        void load();
        void FinanceApService.listVendors().then((r) => setVendors(Array.isArray(r.operatedData) ? r.operatedData : []));
        void FinanceService.listGlAccounts({ isBankAccount: 1, isActive: 1 }).then((r) => setBanks(Array.isArray(r.operatedData) ? r.operatedData : []));
    }, []);

    useEffect(() => {
        if (header.vendorId) {
            void FinanceApService.listApInvoices({ vendorId: header.vendorId }).then((r) => {
                const list = Array.isArray(r.operatedData) ? r.operatedData : [];
                setOpenInvoices(list.filter((i) => i.balanceAmount > 0 && i.status !== 'CANCELLED'));
            });
        } else setOpenInvoices([]);
    }, [header.vendorId]);

    const vendorOpts = useMemo(() => vendors.map((v) => ({ label: `${v.vendorCode} · ${v.vendorName}`, value: v.vendorId })), [vendors]);
    const bankOpts = useMemo(() => [{ label: '— Select —', value: null }, ...banks.map((b) => ({ label: `${b.accountCode} · ${b.name}`, value: b.accountId }))], [banks]);
    const invOpts = useMemo(() => openInvoices.map((i) => ({ label: `${i.invoiceNumber} · bal ${Number(i.balanceAmount).toFixed(2)}`, value: i.apInvoiceId })), [openInvoices]);

    const totalAlloc = useMemo(() => allocs.reduce((s, a) => s + (Number(a.allocatedAmount) || 0) + (Number(a.discountTaken) || 0), 0), [allocs]);

    const save = async () => {
        if (!header.vendorId || !header.paymentDate || !header.paymentAmount) { toast.current?.show({ severity: 'warn', summary: 'Missing', detail: 'Vendor, date and amount required.' }); return; }
        const clean = allocs.filter((a) => a.apInvoiceId && Number(a.allocatedAmount) > 0);
        const r = await FinanceApService.upsertVendorPayment({
            crudType: crud, vendorPaymentId: header.vendorPaymentId, vendorId: header.vendorId, paymentDate: toYmd(header.paymentDate),
            paymentMethod: header.paymentMethod, chequeNumber: header.chequeNumber, chequeDate: toYmd(header.chequeDate), bankAccountId: header.bankAccountId,
            transactionReference: header.transactionReference, paymentAmount: header.paymentAmount, deductionAmount: header.deductionAmount,
            deductionReason: header.deductionReason, notes: header.notes, allocations: clean
        });
        const op = Number(r.operationalStatus);
        if (op !== 1 && op !== 2) { toast.current?.show({ severity: 'error', summary: 'Failed', detail: 'Could not save.' }); return; }
        toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Vendor payment saved.' });
        setVisible(false); await load();
    };

    const post = (id: number) => confirmDialog({
        message: 'Post this vendor payment and apply allocations to invoices?',
        header: 'Confirm Posting',
        accept: async () => {
            const r = await FinanceApService.postVendorPayment(id);
            const op = Number(r.operationalStatus);
            if (op === 1 || op === 2) { toast.current?.show({ severity: 'success', summary: 'Posted', detail: 'Payment posted.' }); await load(); }
            else toast.current?.show({ severity: 'error', summary: 'Failed', detail: 'Could not post.' });
        }
    });

    const statusSeverity = (s: string): 'success' | 'info' | 'warning' | 'danger' => (s === 'POSTED' ? 'success' : s === 'DRAFT' ? 'info' : s === 'CANCELLED' || s === 'BOUNCED' ? 'danger' : 'warning');

    return (
        <div className="grid">
            <Toast ref={toast} /><ConfirmDialog />
            <div className="col-12">
                <Card title="Vendor Payments">
                    <div className="flex justify-content-end mb-3"><Button label="New Payment" icon="pi pi-plus" onClick={() => { setCrud('save'); setHeader({ ...EMPTY_HEADER }); setAllocs([]); setVisible(true); }} /></div>
                    <DataTable value={rows} loading={loading} paginator rows={15} dataKey="vendorPaymentId" stripedRows responsiveLayout="scroll">
                        <Column field="paymentNumber" header="Number" sortable />
                        <Column field="paymentDate" header="Date" />
                        <Column field="vendorName" header="Vendor" />
                        <Column field="paymentMethod" header="Method" />
                        <Column field="paymentAmount" header="Amount" body={(r: FinanceVendorPayment) => Number(r.paymentAmount).toFixed(2)} />
                        <Column field="totalAllocated" header="Allocated" body={(r: FinanceVendorPayment) => Number(r.totalAllocated).toFixed(2)} />
                        <Column field="status" header="Status" body={(r: FinanceVendorPayment) => <Tag value={r.status} severity={statusSeverity(r.status)} />} />
                        <Column header="Actions" body={(r: FinanceVendorPayment) => (
                            <div className="flex gap-1">
                                <Button icon="pi pi-pencil" rounded text disabled={r.status === 'POSTED' || r.status === 'CANCELLED'} onClick={() => { setCrud('update'); setHeader({ vendorPaymentId: r.vendorPaymentId, vendorId: r.vendorId, paymentDate: parseDate(r.paymentDate), paymentMethod: r.paymentMethod, chequeNumber: r.chequeNumber ?? '', chequeDate: parseDate(r.chequeDate), bankAccountId: r.bankAccountId, transactionReference: r.transactionReference ?? '', paymentAmount: Number(r.paymentAmount), deductionAmount: Number(r.deductionAmount), deductionReason: r.deductionReason ?? '', notes: r.notes ?? '' }); setAllocs([]); setVisible(true); }} />
                                <Button icon="pi pi-check" rounded text severity="success" tooltip="Post" onClick={() => post(r.vendorPaymentId)} disabled={r.status === 'POSTED' || r.status === 'CANCELLED'} />
                            </div>
                        )} />
                    </DataTable>
                </Card>
            </div>

            <Dialog header={crud === 'save' ? 'New Vendor Payment' : 'Edit Vendor Payment'} visible={visible} style={{ width: '860px' }} modal onHide={() => setVisible(false)}>
                <div className="grid pt-3">
                    <div className="col-12 md:col-6"><label className="block mb-1">Vendor *</label><Dropdown className="w-full" options={vendorOpts} value={header.vendorId} onChange={(e) => setHeader({ ...header, vendorId: e.value })} filter /></div>
                    <div className="col-12 md:col-3"><label className="block mb-1">Payment Date *</label><Calendar className="w-full" value={header.paymentDate} onChange={(e) => setHeader({ ...header, paymentDate: e.value as Date | null })} dateFormat="yy-mm-dd" /></div>
                    <div className="col-12 md:col-3"><label className="block mb-1">Method</label><Dropdown className="w-full" options={METHODS} value={header.paymentMethod} onChange={(e) => setHeader({ ...header, paymentMethod: e.value })} /></div>
                    <div className="col-12 md:col-4"><label className="block mb-1">Bank Account</label><Dropdown className="w-full" options={bankOpts} value={header.bankAccountId} onChange={(e) => setHeader({ ...header, bankAccountId: e.value })} filter /></div>
                    <div className="col-12 md:col-4"><label className="block mb-1">Cheque #</label><InputText className="w-full" value={header.chequeNumber} onChange={(e) => setHeader({ ...header, chequeNumber: e.target.value })} /></div>
                    <div className="col-12 md:col-4"><label className="block mb-1">Cheque Date</label><Calendar className="w-full" value={header.chequeDate} onChange={(e) => setHeader({ ...header, chequeDate: e.value as Date | null })} dateFormat="yy-mm-dd" /></div>
                    <div className="col-12 md:col-4"><label className="block mb-1">Transaction Ref</label><InputText className="w-full" value={header.transactionReference} onChange={(e) => setHeader({ ...header, transactionReference: e.target.value })} /></div>
                    <div className="col-12 md:col-4"><label className="block mb-1">Payment Amount *</label><InputNumber className="w-full" value={header.paymentAmount} onValueChange={(e) => setHeader({ ...header, paymentAmount: e.value ?? 0 })} mode="decimal" minFractionDigits={2} /></div>
                    <div className="col-12 md:col-4"><label className="block mb-1">Deduction</label><InputNumber className="w-full" value={header.deductionAmount} onValueChange={(e) => setHeader({ ...header, deductionAmount: e.value ?? 0 })} mode="decimal" minFractionDigits={2} /></div>

                    <div className="col-12 mt-2">
                        <div className="flex justify-content-between mb-2"><h4 className="m-0">Invoice Allocations</h4><Button label="Add" icon="pi pi-plus" size="small" onClick={() => setAllocs([...allocs, { ...EMPTY_ALLOC }])} disabled={!header.vendorId} /></div>
                        <table className="w-full"><thead><tr><th>Invoice</th><th>Allocated</th><th>Discount Taken</th><th></th></tr></thead>
                            <tbody>{allocs.map((a, i) => (
                                <tr key={i}>
                                    <td><Dropdown className="w-full" options={invOpts} value={a.apInvoiceId} onChange={(e) => { const n = [...allocs]; n[i] = { ...n[i], apInvoiceId: e.value }; setAllocs(n); }} filter /></td>
                                    <td><InputNumber value={a.allocatedAmount} onValueChange={(e) => { const n = [...allocs]; n[i] = { ...n[i], allocatedAmount: e.value ?? 0 }; setAllocs(n); }} mode="decimal" minFractionDigits={2} /></td>
                                    <td><InputNumber value={a.discountTaken} onValueChange={(e) => { const n = [...allocs]; n[i] = { ...n[i], discountTaken: e.value ?? 0 }; setAllocs(n); }} mode="decimal" minFractionDigits={2} /></td>
                                    <td><Button icon="pi pi-trash" rounded text severity="danger" onClick={() => setAllocs(allocs.filter((_, j) => j !== i))} /></td>
                                </tr>))}
                            </tbody>
                            <tfoot><tr><td className="text-right font-bold">Total:</td><td colSpan={3}>{totalAlloc.toFixed(2)}</td></tr></tfoot>
                        </table>
                    </div>

                    <div className="col-12"><label className="block mb-1">Notes</label><InputTextarea className="w-full" rows={2} value={header.notes} onChange={(e) => setHeader({ ...header, notes: e.target.value })} /></div>
                    <div className="col-12 flex justify-content-end gap-2 mt-2"><Button label="Cancel" severity="secondary" outlined onClick={() => setVisible(false)} /><Button label="Save" icon="pi pi-check" onClick={save} /></div>
                </div>
            </Dialog>
        </div>
    );
};

export default VendorPaymentsPage;
