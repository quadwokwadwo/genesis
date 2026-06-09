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
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { FinanceService, FinanceApService } from '@/libs/blue_prints/FinanceService';
import { FinanceVendor, FinanceGlAccount } from '@/types/finance/finance';

const EMPTY = {
    vendorId: undefined as number | undefined,
    vendorCode: '',
    vendorName: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    taxIdentificationNumber: '',
    bankName: '',
    bankAccountNumber: '',
    paymentTermsDays: 30,
    currencyCode: 'GHS',
    defaultApAccountId: null as number | null,
    defaultExpenseAccountId: null as number | null,
    isActive: true
};

const VendorsPage = () => {
    const toast = useRef<Toast>(null);
    const [rows, setRows] = useState<FinanceVendor[]>([]);
    const [apAccounts, setApAccounts] = useState<FinanceGlAccount[]>([]);
    const [expAccounts, setExpAccounts] = useState<FinanceGlAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [crud, setCrud] = useState<'save' | 'update'>('save');
    const [form, setForm] = useState({ ...EMPTY });

    const load = async () => {
        setLoading(true);
        const r = await FinanceApService.listVendors();
        setRows(Array.isArray(r.operatedData) ? r.operatedData : []);
        setLoading(false);
    };

    useEffect(() => {
        document.title = 'Finance · Vendors';
        void load();
        void FinanceService.listGlAccounts({ subLedgerType: 'AP', isActive: 1 }).then((r) => setApAccounts(Array.isArray(r.operatedData) ? r.operatedData : []));
        void FinanceService.listGlAccounts({ allowPosting: 1, isActive: 1 }).then((r) => setExpAccounts((Array.isArray(r.operatedData) ? r.operatedData : []).filter((a) => a.accountCategory === 'EXPENSE')));
    }, []);

    const apOptions = useMemo(() => [{ label: '— Default —', value: null }, ...apAccounts.map((a) => ({ label: `${a.accountCode} · ${a.name}`, value: a.accountId }))], [apAccounts]);
    const expOptions = useMemo(() => [{ label: '— Default —', value: null }, ...expAccounts.map((a) => ({ label: `${a.accountCode} · ${a.name}`, value: a.accountId }))], [expAccounts]);

    const save = async () => {
        if (!form.vendorCode.trim() || !form.vendorName.trim()) { toast.current?.show({ severity: 'warn', summary: 'Missing', detail: 'Code and name required.' }); return; }
        const r = await FinanceApService.upsertVendor({ crudType: crud, ...form });
        const op = Number(r.operationalStatus);
        if (op === 3) { toast.current?.show({ severity: 'warn', summary: 'Duplicate', detail: 'Vendor code already exists.' }); return; }
        if (op !== 1 && op !== 2) { toast.current?.show({ severity: 'error', summary: 'Failed', detail: 'Could not save.' }); return; }
        toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Vendor saved.' });
        setVisible(false); await load();
    };

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12">
                <Card title="Vendors">
                    <div className="flex justify-content-end mb-3"><Button label="New Vendor" icon="pi pi-plus" onClick={() => { setCrud('save'); setForm({ ...EMPTY }); setVisible(true); }} /></div>
                    <DataTable value={rows} loading={loading} paginator rows={15} dataKey="vendorId" stripedRows responsiveLayout="scroll">
                        <Column field="vendorCode" header="Code" sortable />
                        <Column field="vendorName" header="Name" sortable />
                        <Column field="contactPerson" header="Contact" />
                        <Column field="phone" header="Phone" />
                        <Column field="paymentTermsDays" header="Terms" />
                        <Column field="openInvoiceCount" header="Open Inv" />
                        <Column field="outstandingAmount" header="Outstanding" body={(r: FinanceVendor) => Number(r.outstandingAmount).toFixed(2)} />
                        <Column header="Active" body={(r: FinanceVendor) => <Tag severity={r.isActive ? 'success' : 'danger'} value={r.isActive ? 'Yes' : 'No'} />} />
                        <Column header="Actions" body={(r: FinanceVendor) => (
                            <Button icon="pi pi-pencil" rounded text onClick={() => {
                                setCrud('update');
                                setForm({ vendorId: r.vendorId, vendorCode: r.vendorCode, vendorName: r.vendorName, contactPerson: r.contactPerson ?? '', phone: r.phone ?? '', email: r.email ?? '', address: r.address ?? '', taxIdentificationNumber: r.taxIdentificationNumber ?? '', bankName: r.bankName ?? '', bankAccountNumber: r.bankAccountNumber ?? '', paymentTermsDays: r.paymentTermsDays, currencyCode: r.currencyCode, defaultApAccountId: r.defaultApAccountId, defaultExpenseAccountId: r.defaultExpenseAccountId, isActive: r.isActive === 1 });
                                setVisible(true);
                            }} />
                        )} />
                    </DataTable>
                </Card>
            </div>

            <Dialog header={crud === 'save' ? 'New Vendor' : 'Edit Vendor'} visible={visible} style={{ width: '640px' }} modal onHide={() => setVisible(false)}>
                <div className="grid pt-3">
                    <div className="col-12 md:col-6"><label className="block mb-1">Code *</label><InputText className="w-full" value={form.vendorCode} onChange={(e) => setForm({ ...form, vendorCode: e.target.value })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Currency</label><InputText className="w-full" value={form.currencyCode} onChange={(e) => setForm({ ...form, currencyCode: e.target.value })} /></div>
                    <div className="col-12"><label className="block mb-1">Name *</label><InputText className="w-full" value={form.vendorName} onChange={(e) => setForm({ ...form, vendorName: e.target.value })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Contact Person</label><InputText className="w-full" value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Phone</label><InputText className="w-full" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Email</label><InputText className="w-full" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Tax ID</label><InputText className="w-full" value={form.taxIdentificationNumber} onChange={(e) => setForm({ ...form, taxIdentificationNumber: e.target.value })} /></div>
                    <div className="col-12"><label className="block mb-1">Address</label><InputTextarea className="w-full" rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Bank Name</label><InputText className="w-full" value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Bank Account #</label><InputText className="w-full" value={form.bankAccountNumber} onChange={(e) => setForm({ ...form, bankAccountNumber: e.target.value })} /></div>
                    <div className="col-12 md:col-4"><label className="block mb-1">Payment Terms (days)</label><InputNumber className="w-full" value={form.paymentTermsDays} onValueChange={(e) => setForm({ ...form, paymentTermsDays: e.value ?? 30 })} /></div>
                    <div className="col-12 md:col-4"><label className="block mb-1">Default AP Account</label><Dropdown className="w-full" options={apOptions} value={form.defaultApAccountId} onChange={(e) => setForm({ ...form, defaultApAccountId: e.value })} filter /></div>
                    <div className="col-12 md:col-4"><label className="block mb-1">Default Expense Account</label><Dropdown className="w-full" options={expOptions} value={form.defaultExpenseAccountId} onChange={(e) => setForm({ ...form, defaultExpenseAccountId: e.value })} filter /></div>
                    <div className="col-12 flex align-items-center gap-2"><InputSwitch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: !!e.value })} /><span>Active</span></div>
                    <div className="col-12 flex justify-content-end gap-2 mt-2"><Button label="Cancel" severity="secondary" outlined onClick={() => setVisible(false)} /><Button label="Save" icon="pi pi-check" onClick={save} /></div>
                </div>
            </Dialog>
        </div>
    );
};

export default VendorsPage;
