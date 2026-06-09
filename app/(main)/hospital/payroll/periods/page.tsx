'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import { HrPayrollService } from '@/libs/blue_prints/HrService';
import { HrPaymentMethod, HrPayrollEntry, HrPayrollEntryDetail, HrPayrollPeriod, HrPayrollPeriodStatus } from '@/types/hr/hr';

const EMPTY = {
    periodId: undefined as number | undefined,
    periodName: '',
    startDate: new Date(),
    endDate: new Date(),
    payDate: new Date(),
    notes: ''
};

const sevForPeriod = (s: HrPayrollPeriodStatus) => s === 'PAID' ? 'success' : s === 'FINALIZED' ? 'info' : s === 'PROCESSING' ? 'warning' : s === 'DRAFT' ? 'secondary' : 'danger';
const sevForEntry = (s: string) => s === 'PAID' ? 'success' : s === 'CALCULATED' ? 'info' : s === 'APPROVED' ? 'warning' : s === 'CANCELLED' ? 'danger' : 'secondary';

const PAYMENT_METHODS: HrPaymentMethod[] = ['BANK_TRANSFER', 'CHEQUE', 'CASH', 'MOBILE_MONEY'];

const PeriodsPage = () => {
    const [rows, setRows] = useState<HrPayrollPeriod[]>([]);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [crud, setCrud] = useState<'save' | 'update'>('save');
    const [form, setForm] = useState({ ...EMPTY });
    const [entriesVisible, setEntriesVisible] = useState(false);
    const [activePeriod, setActivePeriod] = useState<HrPayrollPeriod | null>(null);
    const [entries, setEntries] = useState<HrPayrollEntry[]>([]);
    const [detailVisible, setDetailVisible] = useState(false);
    const [activeEntry, setActiveEntry] = useState<HrPayrollEntry | null>(null);
    const [details, setDetails] = useState<HrPayrollEntryDetail[]>([]);
    const [payVisible, setPayVisible] = useState(false);
    const [payEntry, setPayEntry] = useState<HrPayrollEntry | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<HrPaymentMethod>('BANK_TRANSFER');
    const [paymentReference, setPaymentReference] = useState('');
    const toast = useRef<Toast>(null);

    const load = async () => { setLoading(true); const r = await HrPayrollService.listPeriods(); setRows(Array.isArray(r.operatedData) ? r.operatedData : []); setLoading(false); };
    useEffect(() => { document.title = 'Payroll · Periods'; void load(); }, []);

    const openCreate = () => { setCrud('save'); setForm({ ...EMPTY }); setVisible(true); };
    const openEdit = (r: HrPayrollPeriod) => {
        setCrud('update');
        setForm({
            periodId: r.periodId,
            periodName: r.periodName,
            startDate: new Date(r.startDate),
            endDate: new Date(r.endDate),
            payDate: new Date(r.payDate),
            notes: r.notes ?? ''
        });
        setVisible(true);
    };

    const save = async () => {
        if (!form.periodName.trim()) { toast.current?.show({ severity: 'warn', summary: 'Name required' }); return; }
        const r = await HrPayrollService.upsertPeriod({
            crudType: crud,
            periodId: form.periodId,
            periodName: form.periodName,
            startDate: form.startDate.toISOString().slice(0, 10),
            endDate: form.endDate.toISOString().slice(0, 10),
            payDate: form.payDate.toISOString().slice(0, 10),
            notes: form.notes
        });
        const op = Number(r.operationalStatus);
        if (op === 3) { toast.current?.show({ severity: 'warn', summary: 'Duplicate' }); return; }
        if (op !== 1 && op !== 2) { toast.current?.show({ severity: 'error', summary: 'Failed' }); return; }
        toast.current?.show({ severity: 'success', summary: 'Saved' });
        setVisible(false);
        await load();
    };

    const generate = (p: HrPayrollPeriod) => confirmDialog({
        message: `Generate payroll entries for ${p.periodName}?`, header: 'Generate', acceptLabel: 'Generate', icon: 'pi pi-cog',
        accept: async () => {
            const r = await HrPayrollService.generateEntries(p.periodId);
            const op = Number(r.operationalStatus);
            if (op !== 1 && op !== 2) { toast.current?.show({ severity: 'error', summary: 'Failed' }); return; }
            toast.current?.show({ severity: 'success', summary: 'Entries generated' });
            await load();
        }
    });
    const calculate = (p: HrPayrollPeriod) => confirmDialog({
        message: `Calculate payroll for ${p.periodName}? This recomputes all entries.`, header: 'Calculate', acceptLabel: 'Calculate', icon: 'pi pi-calculator',
        accept: async () => {
            const r = await HrPayrollService.calculatePeriod(p.periodId);
            const op = Number(r.operationalStatus);
            if (op !== 1 && op !== 2) { toast.current?.show({ severity: 'error', summary: 'Failed' }); return; }
            toast.current?.show({ severity: 'success', summary: 'Calculated' });
            await load();
        }
    });
    const finalize = (p: HrPayrollPeriod) => confirmDialog({
        message: `Finalize ${p.periodName}? Entries can no longer be recalculated.`, header: 'Finalize', acceptLabel: 'Finalize', icon: 'pi pi-lock',
        accept: async () => {
            const r = await HrPayrollService.finalizePeriod(p.periodId);
            const op = Number(r.operationalStatus);
            if (op !== 1 && op !== 2) { toast.current?.show({ severity: 'error', summary: 'Failed' }); return; }
            toast.current?.show({ severity: 'success', summary: 'Finalized' });
            await load();
        }
    });

    const viewEntries = async (p: HrPayrollPeriod) => {
        setActivePeriod(p);
        setEntriesVisible(true);
        const r = await HrPayrollService.listEntries({ periodId: p.periodId });
        setEntries(Array.isArray(r.operatedData) ? r.operatedData : []);
    };
    const reloadEntries = async () => {
        if (!activePeriod) return;
        const r = await HrPayrollService.listEntries({ periodId: activePeriod.periodId });
        setEntries(Array.isArray(r.operatedData) ? r.operatedData : []);
    };

    const calcEntry = async (e: HrPayrollEntry) => {
        const r = await HrPayrollService.calculateEntry(e.entryId);
        const op = Number(r.operationalStatus);
        if (op !== 1 && op !== 2) { toast.current?.show({ severity: 'error', summary: 'Failed' }); return; }
        toast.current?.show({ severity: 'success', summary: 'Recalculated' });
        await reloadEntries();
    };
    const viewDetails = async (e: HrPayrollEntry) => {
        setActiveEntry(e);
        setDetailVisible(true);
        const r = await HrPayrollService.entryDetails(e.entryId);
        setDetails(Array.isArray(r.operatedData) ? r.operatedData : []);
    };
    const openPay = (e: HrPayrollEntry) => { setPayEntry(e); setPaymentMethod('BANK_TRANSFER'); setPaymentReference(''); setPayVisible(true); };
    const submitPay = async () => {
        if (!payEntry) return;
        const r = await HrPayrollService.markEntryPaid({ entryId: payEntry.entryId, paymentMethod, paymentReference });
        const op = Number(r.operationalStatus);
        if (op !== 1 && op !== 2) { toast.current?.show({ severity: 'error', summary: 'Failed' }); return; }
        toast.current?.show({ severity: 'success', summary: 'Marked paid' });
        setPayVisible(false);
        await reloadEntries();
        await load();
    };

    return (
        <div className="grid">
            <Toast ref={toast} />
            <ConfirmDialog />
            <div className="col-12">
                <Card title="Payroll Periods" subTitle="Run, finalize and pay payroll">
                    <div className="flex justify-content-end mb-3"><Button label="New Period" icon="pi pi-plus" onClick={openCreate} /></div>
                    <DataTable value={rows} loading={loading} paginator rows={15} dataKey="periodId" stripedRows responsiveLayout="scroll">
                        <Column field="periodName" header="Period" sortable />
                        <Column field="startDate" header="Start" body={(r: HrPayrollPeriod) => new Date(r.startDate).toLocaleDateString()} />
                        <Column field="endDate" header="End" body={(r: HrPayrollPeriod) => new Date(r.endDate).toLocaleDateString()} />
                        <Column field="payDate" header="Pay Date" body={(r: HrPayrollPeriod) => new Date(r.payDate).toLocaleDateString()} />
                        <Column field="entryCount" header="Entries" />
                        <Column field="totalGross" header="Total Gross" body={(r: HrPayrollPeriod) => Number(r.totalGross).toFixed(2)} />
                        <Column field="totalNet" header="Total Net" body={(r: HrPayrollPeriod) => Number(r.totalNet).toFixed(2)} />
                        <Column header="Status" body={(r: HrPayrollPeriod) => <Tag severity={sevForPeriod(r.status) as any} value={r.status} />} />
                        <Column header="Actions" body={(r: HrPayrollPeriod) => (
                            <div className="flex flex-wrap gap-1">
                                <Button icon="pi pi-pencil" rounded text onClick={() => openEdit(r)} tooltip="Edit" />
                                <Button icon="pi pi-list" rounded text onClick={() => viewEntries(r)} tooltip="View entries" />
                                {r.status === 'DRAFT' && <Button label="Generate" size="small" icon="pi pi-cog" onClick={() => generate(r)} />}
                                {(r.status === 'PROCESSING' || r.status === 'DRAFT') && <Button label="Calc" size="small" icon="pi pi-calculator" severity="warning" onClick={() => calculate(r)} />}
                                {r.status === 'PROCESSING' && <Button label="Finalize" size="small" icon="pi pi-lock" severity="info" onClick={() => finalize(r)} />}
                            </div>
                        )} />
                    </DataTable>
                </Card>
            </div>

            <Dialog header={crud === 'save' ? 'New Period' : 'Edit Period'} visible={visible} style={{ width: '560px' }} modal onHide={() => setVisible(false)}>
                <div className="grid pt-3">
                    <div className="col-12"><label className="block mb-1">Name *</label><InputText className="w-full" value={form.periodName} onChange={(e) => setForm({ ...form, periodName: e.target.value })} placeholder="e.g. October 2025" /></div>
                    <div className="col-12 md:col-4"><label className="block mb-1">Start *</label><Calendar className="w-full" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: (e.value as Date) ?? new Date() })} dateFormat="yy-mm-dd" /></div>
                    <div className="col-12 md:col-4"><label className="block mb-1">End *</label><Calendar className="w-full" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: (e.value as Date) ?? new Date() })} dateFormat="yy-mm-dd" /></div>
                    <div className="col-12 md:col-4"><label className="block mb-1">Pay Date *</label><Calendar className="w-full" value={form.payDate} onChange={(e) => setForm({ ...form, payDate: (e.value as Date) ?? new Date() })} dateFormat="yy-mm-dd" /></div>
                    <div className="col-12"><label className="block mb-1">Notes</label><InputTextarea className="w-full" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
                    <div className="col-12 flex justify-content-end gap-2 mt-2">
                        <Button label="Cancel" severity="secondary" outlined onClick={() => setVisible(false)} />
                        <Button label="Save" icon="pi pi-check" onClick={save} />
                    </div>
                </div>
            </Dialog>

            <Dialog header={activePeriod ? `Entries — ${activePeriod.periodName}` : 'Entries'} visible={entriesVisible} style={{ width: '95vw', maxWidth: '1200px' }} modal onHide={() => setEntriesVisible(false)}>
                <DataTable value={entries} dataKey="entryId" paginator rows={15} stripedRows responsiveLayout="scroll">
                    <Column field="userFullName" header="Staff" sortable />
                    <Column field="basicSalary" header="Basic" body={(r: HrPayrollEntry) => Number(r.basicSalary).toFixed(2)} />
                    <Column field="grossEarnings" header="Gross" body={(r: HrPayrollEntry) => Number(r.grossEarnings).toFixed(2)} />
                    <Column field="statutoryDeductions" header="Statutory" body={(r: HrPayrollEntry) => Number(r.statutoryDeductions).toFixed(2)} />
                    <Column field="paye" header="PAYE" body={(r: HrPayrollEntry) => Number(r.paye).toFixed(2)} />
                    <Column field="otherDeductions" header="Other" body={(r: HrPayrollEntry) => Number(r.otherDeductions).toFixed(2)} />
                    <Column field="totalDeductions" header="Total Ded" body={(r: HrPayrollEntry) => Number(r.totalDeductions).toFixed(2)} />
                    <Column field="netSalary" header="Net" body={(r: HrPayrollEntry) => <strong>{Number(r.netSalary).toFixed(2)}</strong>} />
                    <Column header="Status" body={(r: HrPayrollEntry) => <Tag value={r.status} severity={sevForEntry(r.status) as any} />} />
                    <Column header="Actions" body={(r: HrPayrollEntry) => (
                        <div className="flex gap-1">
                            <Button icon="pi pi-calculator" rounded text onClick={() => calcEntry(r)} tooltip="Recalculate" />
                            <Button icon="pi pi-eye" rounded text onClick={() => viewDetails(r)} tooltip="View details" />
                            {r.status !== 'PAID' && r.status !== 'CANCELLED' && <Button icon="pi pi-wallet" rounded text severity="success" onClick={() => openPay(r)} tooltip="Mark paid" />}
                        </div>
                    )} />
                </DataTable>
            </Dialog>

            <Dialog header={activeEntry ? `Breakdown — ${activeEntry.userFullName}` : 'Breakdown'} visible={detailVisible} style={{ width: '700px' }} modal onHide={() => setDetailVisible(false)}>
                <DataTable value={details} dataKey="detailId" stripedRows responsiveLayout="scroll">
                    <Column field="componentCode" header="Code" />
                    <Column field="componentName" header="Name" />
                    <Column field="componentType" header="Type" />
                    <Column field="description" header="Description" />
                    <Column field="amount" header="Amount" body={(r: HrPayrollEntryDetail) => Number(r.amount).toFixed(2)} />
                </DataTable>
            </Dialog>

            <Dialog header="Mark Entry Paid" visible={payVisible} style={{ width: '440px' }} modal onHide={() => setPayVisible(false)}>
                <div className="flex flex-column gap-3 pt-3">
                    {payEntry && <div><strong>{payEntry.userFullName}</strong> — Net: {Number(payEntry.netSalary).toFixed(2)}</div>}
                    <div>
                        <label className="block mb-1">Payment Method</label>
                        <Dropdown className="w-full" options={PAYMENT_METHODS.map((m) => ({ label: m, value: m }))} value={paymentMethod} onChange={(e) => setPaymentMethod(e.value)} />
                    </div>
                    <div>
                        <label className="block mb-1">Reference</label>
                        <InputText className="w-full" value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} />
                    </div>
                    <div className="flex justify-content-end gap-2">
                        <Button label="Cancel" severity="secondary" outlined onClick={() => setPayVisible(false)} />
                        <Button label="Mark Paid" icon="pi pi-check" onClick={submitPay} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default PeriodsPage;
