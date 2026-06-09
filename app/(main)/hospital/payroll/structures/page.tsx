'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { InputSwitch } from 'primereact/inputswitch';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { HrService, HrPayrollService } from '@/libs/blue_prints/HrService';
import { HrEmployee, HrPayFrequency, HrSalaryComponent, HrSalaryStructure, HrStaffSalaryComponent } from '@/types/hr/hr';

const FREQ: HrPayFrequency[] = ['WEEKLY', 'BI_WEEKLY', 'MONTHLY', 'SEMI_MONTHLY'];

const EMPTY = {
    structureId: undefined as number | undefined,
    userId: null as number | null,
    effectiveFrom: new Date(),
    effectiveUntil: null as Date | null,
    baseSalary: 0,
    currency: 'GHS',
    payFrequency: 'MONTHLY' as HrPayFrequency,
    isActive: true,
    notes: ''
};

const StructuresPage = () => {
    const [rows, setRows] = useState<HrSalaryStructure[]>([]);
    const [employees, setEmployees] = useState<HrEmployee[]>([]);
    const [components, setComponents] = useState<HrSalaryComponent[]>([]);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [crud, setCrud] = useState<'save' | 'update'>('save');
    const [form, setForm] = useState({ ...EMPTY });
    const [detailVisible, setDetailVisible] = useState(false);
    const [activeStructure, setActiveStructure] = useState<HrSalaryStructure | null>(null);
    const [staffComps, setStaffComps] = useState<HrStaffSalaryComponent[]>([]);
    const [addCompId, setAddCompId] = useState<number | null>(null);
    const [addAmount, setAddAmount] = useState<number | null>(null);
    const [addQty, setAddQty] = useState<number>(1);
    const toast = useRef<Toast>(null);

    const load = async () => {
        setLoading(true);
        const [s, e, c] = await Promise.all([HrPayrollService.listStructures(), HrService.listEmployees(), HrPayrollService.listComponents()]);
        setRows(Array.isArray(s.operatedData) ? s.operatedData : []);
        setEmployees(Array.isArray(e.operatedData) ? e.operatedData : []);
        setComponents(Array.isArray(c.operatedData) ? c.operatedData : []);
        setLoading(false);
    };
    useEffect(() => { document.title = 'Payroll · Structures'; void load(); }, []);

    const openCreate = () => { setCrud('save'); setForm({ ...EMPTY, effectiveFrom: new Date() }); setVisible(true); };
    const openEdit = (r: HrSalaryStructure) => {
        setCrud('update');
        setForm({
            structureId: r.structureId,
            userId: r.userId,
            effectiveFrom: r.effectiveFrom ? new Date(r.effectiveFrom) : new Date(),
            effectiveUntil: r.effectiveUntil ? new Date(r.effectiveUntil) : null,
            baseSalary: r.baseSalary,
            currency: r.currency,
            payFrequency: r.payFrequency,
            isActive: r.isActive === 1,
            notes: r.notes ?? ''
        });
        setVisible(true);
    };

    const save = async () => {
        if (!form.userId || !form.baseSalary) { toast.current?.show({ severity: 'warn', summary: 'Missing fields' }); return; }
        const r = await HrPayrollService.upsertStructure({
            ...form,
            crudType: crud,
            effectiveFrom: form.effectiveFrom.toISOString().slice(0, 10),
            effectiveUntil: form.effectiveUntil ? form.effectiveUntil.toISOString().slice(0, 10) : null
        });
        const op = Number(r.operationalStatus);
        if (op !== 1 && op !== 2) { toast.current?.show({ severity: 'error', summary: 'Failed' }); return; }
        toast.current?.show({ severity: 'success', summary: 'Saved' });
        setVisible(false);
        await load();
    };

    const openDetail = async (row: HrSalaryStructure) => {
        setActiveStructure(row);
        setDetailVisible(true);
        const r = await HrPayrollService.listStaffComponents(row.structureId);
        setStaffComps(Array.isArray(r.operatedData) ? r.operatedData : []);
    };
    const reloadDetail = async () => {
        if (!activeStructure) return;
        const r = await HrPayrollService.listStaffComponents(activeStructure.structureId);
        setStaffComps(Array.isArray(r.operatedData) ? r.operatedData : []);
    };
    const addStaffComp = async () => {
        if (!activeStructure || !addCompId) { toast.current?.show({ severity: 'warn', summary: 'Pick a component' }); return; }
        const r = await HrPayrollService.upsertStaffComponent({ structureId: activeStructure.structureId, componentId: addCompId, amount: addAmount, qty: addQty, isActive: true });
        const op = Number(r.operationalStatus);
        if (op !== 1 && op !== 2) { toast.current?.show({ severity: 'error', summary: 'Failed' }); return; }
        setAddCompId(null); setAddAmount(null); setAddQty(1);
        await reloadDetail();
        await load();
    };
    const removeStaffComp = async (id: number) => {
        const r = await HrPayrollService.removeStaffComponent(id);
        const op = Number(r.operationalStatus);
        if (op !== 1 && op !== 2) { toast.current?.show({ severity: 'error', summary: 'Failed' }); return; }
        await reloadDetail();
        await load();
    };

    const userOpts = useMemo(() => employees.map((e) => ({ label: `${e.fullName} (${e.employeeNumber})`, value: e.userId })), [employees]);
    const compOpts = useMemo(() => components.filter((c) => c.isActive).map((c) => ({ label: `${c.componentCode} — ${c.componentName} (${c.componentType}/${c.calculationType})`, value: c.componentId })), [components]);

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12">
                <Card title="Salary Structures" subTitle="Per-staff base salary + assigned components">
                    <div className="flex justify-content-end mb-3"><Button label="New Structure" icon="pi pi-plus" onClick={openCreate} /></div>
                    <DataTable value={rows} loading={loading} paginator rows={15} dataKey="structureId" stripedRows responsiveLayout="scroll">
                        <Column field="userFullName" header="Staff" sortable />
                        <Column field="baseSalary" header="Base" body={(r: HrSalaryStructure) => `${r.currency} ${Number(r.baseSalary).toFixed(2)}`} />
                        <Column field="payFrequency" header="Frequency" />
                        <Column field="effectiveFrom" header="From" body={(r: HrSalaryStructure) => new Date(r.effectiveFrom).toLocaleDateString()} />
                        <Column field="effectiveUntil" header="Until" body={(r: HrSalaryStructure) => (r.effectiveUntil ? new Date(r.effectiveUntil).toLocaleDateString() : '—')} />
                        <Column field="componentCount" header="Components" />
                        <Column header="Active" body={(r: HrSalaryStructure) => <Tag severity={r.isActive ? 'success' : 'danger'} value={r.isActive ? 'Active' : 'Inactive'} />} />
                        <Column header="Actions" body={(r: HrSalaryStructure) => (
                            <div className="flex gap-1">
                                <Button icon="pi pi-pencil" rounded text onClick={() => openEdit(r)} />
                                <Button icon="pi pi-list" rounded text onClick={() => openDetail(r)} tooltip="Components" />
                            </div>
                        )} />
                    </DataTable>
                </Card>
            </div>

            <Dialog header={crud === 'save' ? 'New Structure' : 'Edit Structure'} visible={visible} style={{ width: '560px' }} modal onHide={() => setVisible(false)}>
                <div className="grid pt-3">
                    <div className="col-12"><label className="block mb-1">Staff *</label><Dropdown className="w-full" options={userOpts} value={form.userId} onChange={(e) => setForm({ ...form, userId: e.value })} filter disabled={crud === 'update'} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Base Salary *</label><InputNumber className="w-full" value={form.baseSalary} onValueChange={(e) => setForm({ ...form, baseSalary: e.value ?? 0 })} mode="decimal" minFractionDigits={2} maxFractionDigits={2} /></div>
                    <div className="col-12 md:col-3"><label className="block mb-1">Currency</label><InputText className="w-full" value={form.currency} maxLength={3} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} /></div>
                    <div className="col-12 md:col-3"><label className="block mb-1">Frequency</label><Dropdown className="w-full" options={FREQ.map((f) => ({ label: f, value: f }))} value={form.payFrequency} onChange={(e) => setForm({ ...form, payFrequency: e.value })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Effective From *</label><Calendar className="w-full" value={form.effectiveFrom} onChange={(e) => setForm({ ...form, effectiveFrom: (e.value as Date) ?? new Date() })} dateFormat="yy-mm-dd" /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Effective Until</label><Calendar className="w-full" value={form.effectiveUntil} onChange={(e) => setForm({ ...form, effectiveUntil: (e.value as Date) ?? null })} dateFormat="yy-mm-dd" showButtonBar /></div>
                    <div className="col-12 flex align-items-center gap-2"><InputSwitch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: !!e.value })} /><span>Active</span></div>
                    <div className="col-12"><label className="block mb-1">Notes</label><InputTextarea className="w-full" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
                    <div className="col-12 flex justify-content-end gap-2 mt-2">
                        <Button label="Cancel" severity="secondary" outlined onClick={() => setVisible(false)} />
                        <Button label="Save" icon="pi pi-check" onClick={save} />
                    </div>
                </div>
            </Dialog>

            <Dialog header={activeStructure ? `Components — ${activeStructure.userFullName}` : 'Components'} visible={detailVisible} style={{ width: '760px' }} modal onHide={() => setDetailVisible(false)}>
                <div className="pt-3">
                    <div className="grid align-items-end mb-3">
                        <div className="col-12 md:col-6"><label className="block mb-1">Add Component</label><Dropdown className="w-full" options={compOpts} value={addCompId} onChange={(e) => setAddCompId(e.value)} filter placeholder="Pick a component" /></div>
                        <div className="col-12 md:col-3"><label className="block mb-1">Amount</label><InputNumber className="w-full" value={addAmount} onValueChange={(e) => setAddAmount(e.value ?? null)} minFractionDigits={0} maxFractionDigits={4} placeholder="Leave blank to use default" /></div>
                        <div className="col-6 md:col-2"><label className="block mb-1">Qty</label><InputNumber className="w-full" value={addQty} onValueChange={(e) => setAddQty(e.value ?? 1)} min={1} /></div>
                        <div className="col-6 md:col-1"><Button label="Add" icon="pi pi-plus" onClick={addStaffComp} /></div>
                    </div>
                    <DataTable value={staffComps} dataKey="staffComponentId" stripedRows responsiveLayout="scroll">
                        <Column field="componentCode" header="Code" />
                        <Column field="componentName" header="Name" />
                        <Column field="componentType" header="Type" />
                        <Column field="calculationType" header="Calc" />
                        <Column field="amount" header="Amount" />
                        <Column field="qty" header="Qty" />
                        <Column header="Active" body={(r: HrStaffSalaryComponent) => <Tag severity={r.isActive ? 'success' : 'danger'} value={r.isActive ? 'Yes' : 'No'} />} />
                        <Column header="Actions" body={(r: HrStaffSalaryComponent) => <Button icon="pi pi-trash" severity="danger" rounded text onClick={() => removeStaffComp(r.staffComponentId)} />} />
                    </DataTable>
                </div>
            </Dialog>
        </div>
    );
};

export default StructuresPage;
