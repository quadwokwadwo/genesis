'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { HrService } from '@/libs/blue_prints/HrService';
import { HrEmployee, HrLeaveBalance, HrLeaveType } from '@/types/hr/hr';

const currentYear = new Date().getFullYear();
const EMPTY = {
    balanceId: undefined as number | undefined,
    userId: null as number | null,
    leaveTypeId: null as number | null,
    balanceYear: currentYear,
    entitledDays: 0,
    usedDays: 0,
    carriedForwardDays: 0,
    adjustmentDays: 0
};

const LeaveBalancesPage = () => {
    const [rows, setRows] = useState<HrLeaveBalance[]>([]);
    const [types, setTypes] = useState<HrLeaveType[]>([]);
    const [employees, setEmployees] = useState<HrEmployee[]>([]);
    const [year, setYear] = useState<number>(currentYear);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [crud, setCrud] = useState<'save' | 'update'>('save');
    const [form, setForm] = useState({ ...EMPTY });
    const toast = useRef<Toast>(null);

    const load = async () => {
        setLoading(true);
        const [b, t, e] = await Promise.all([HrService.listLeaveBalances({ balanceYear: year }), HrService.listLeaveTypes(), HrService.listEmployees()]);
        setRows(Array.isArray(b.operatedData) ? b.operatedData : []);
        setTypes(Array.isArray(t.operatedData) ? t.operatedData : []);
        setEmployees(Array.isArray(e.operatedData) ? e.operatedData : []);
        setLoading(false);
    };
    useEffect(() => { document.title = 'HR · Leave Balances'; void load(); /* eslint-disable-next-line */ }, [year]);

    const openCreate = () => { setCrud('save'); setForm({ ...EMPTY, balanceYear: year }); setVisible(true); };
    const openEdit = (r: HrLeaveBalance) => {
        setCrud('update');
        setForm({ balanceId: r.balanceId, userId: r.userId, leaveTypeId: r.leaveTypeId, balanceYear: r.balanceYear, entitledDays: r.entitledDays, usedDays: r.usedDays, carriedForwardDays: r.carriedForwardDays, adjustmentDays: r.adjustmentDays });
        setVisible(true);
    };

    const save = async () => {
        if (!form.userId || !form.leaveTypeId) { toast.current?.show({ severity: 'warn', summary: 'Missing fields' }); return; }
        const r = await HrService.upsertLeaveBalance({ ...form, crudType: crud });
        const op = Number(r.operationalStatus);
        if (op !== 1 && op !== 2) { toast.current?.show({ severity: 'error', summary: 'Failed' }); return; }
        toast.current?.show({ severity: 'success', summary: 'Saved' });
        setVisible(false);
        await load();
    };

    const userOpts = useMemo(() => employees.map((e) => ({ label: `${e.fullName} (${e.employeeNumber})`, value: e.userId })), [employees]);
    const typeOpts = useMemo(() => types.map((t) => ({ label: t.leaveName, value: t.leaveTypeId })), [types]);
    const yearOpts = useMemo(() => [currentYear - 1, currentYear, currentYear + 1].map((y) => ({ label: String(y), value: y })), []);

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12">
                <Card title="Leave Balances" subTitle="Annual entitlements per staff member">
                    <div className="flex justify-content-between align-items-end mb-3">
                        <div>
                            <label className="block mb-1">Year</label>
                            <Dropdown options={yearOpts} value={year} onChange={(e) => setYear(e.value)} />
                        </div>
                        <Button label="New Balance" icon="pi pi-plus" onClick={openCreate} />
                    </div>
                    <DataTable value={rows} loading={loading} paginator rows={20} dataKey="balanceId" stripedRows responsiveLayout="scroll">
                        <Column field="userFullName" header="Staff" sortable />
                        <Column field="leaveName" header="Leave Type" sortable />
                        <Column field="balanceYear" header="Year" sortable />
                        <Column field="entitledDays" header="Entitled" />
                        <Column field="carriedForwardDays" header="Carried" />
                        <Column field="adjustmentDays" header="Adj" />
                        <Column field="usedDays" header="Used" />
                        <Column field="remainingDays" header="Remaining" sortable />
                        <Column header="Actions" body={(r: HrLeaveBalance) => <Button icon="pi pi-pencil" rounded text onClick={() => openEdit(r)} />} />
                    </DataTable>
                </Card>
            </div>

            <Dialog header={crud === 'save' ? 'New Balance' : 'Edit Balance'} visible={visible} style={{ width: '520px' }} modal onHide={() => setVisible(false)}>
                <div className="grid pt-3">
                    <div className="col-12"><label className="block mb-1">Staff *</label><Dropdown className="w-full" options={userOpts} value={form.userId} onChange={(e) => setForm({ ...form, userId: e.value })} filter disabled={crud === 'update'} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Leave Type *</label><Dropdown className="w-full" options={typeOpts} value={form.leaveTypeId} onChange={(e) => setForm({ ...form, leaveTypeId: e.value })} filter disabled={crud === 'update'} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Year</label><InputNumber className="w-full" value={form.balanceYear} onValueChange={(e) => setForm({ ...form, balanceYear: e.value ?? currentYear })} useGrouping={false} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Entitled</label><InputNumber className="w-full" value={form.entitledDays} onValueChange={(e) => setForm({ ...form, entitledDays: e.value ?? 0 })} minFractionDigits={0} maxFractionDigits={2} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Carried Forward</label><InputNumber className="w-full" value={form.carriedForwardDays} onValueChange={(e) => setForm({ ...form, carriedForwardDays: e.value ?? 0 })} minFractionDigits={0} maxFractionDigits={2} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Adjustment (+/-)</label><InputNumber className="w-full" value={form.adjustmentDays} onValueChange={(e) => setForm({ ...form, adjustmentDays: e.value ?? 0 })} minFractionDigits={0} maxFractionDigits={2} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Used (override)</label><InputNumber className="w-full" value={form.usedDays} onValueChange={(e) => setForm({ ...form, usedDays: e.value ?? 0 })} minFractionDigits={0} maxFractionDigits={2} /></div>
                    <div className="col-12 flex justify-content-end gap-2 mt-2">
                        <Button label="Cancel" severity="secondary" outlined onClick={() => setVisible(false)} />
                        <Button label="Save" icon="pi pi-check" onClick={save} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default LeaveBalancesPage;
