'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { HrPayrollService } from '@/libs/blue_prints/HrService';
import { HrCalculationType, HrComponentType, HrSalaryComponent } from '@/types/hr/hr';

const TYPES: HrComponentType[] = ['EARNING', 'DEDUCTION', 'REIMBURSEMENT', 'TAX', 'RELIEF', 'EMPLOYER_CONTRIBUTIONS'];
const CALC: HrCalculationType[] = ['FIXED', 'PERCENTAGE', 'FORMULA'];
const BASES = ['BASIC', 'GROSS', 'NET', 'TAXABLE'];

const EMPTY = {
    componentId: undefined as number | undefined,
    componentCode: '',
    componentName: '',
    componentType: 'EARNING' as HrComponentType,
    calculationType: 'FIXED' as HrCalculationType,
    calculationBase: null as string | null,
    defaultAmount: null as number | null,
    isTaxable: true,
    isStatutory: false,
    isCash: true,
    affectGrossPay: true,
    sortOrder: 0,
    isActive: true
};

const ComponentsPage = () => {
    const [rows, setRows] = useState<HrSalaryComponent[]>([]);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [crud, setCrud] = useState<'save' | 'update'>('save');
    const [form, setForm] = useState({ ...EMPTY });
    const toast = useRef<Toast>(null);

    const load = async () => { setLoading(true); const r = await HrPayrollService.listComponents(); setRows(Array.isArray(r.operatedData) ? r.operatedData : []); setLoading(false); };
    useEffect(() => { document.title = 'Payroll · Components'; void load(); }, []);

    const openCreate = () => { setCrud('save'); setForm({ ...EMPTY }); setVisible(true); };
    const openEdit = (r: HrSalaryComponent) => {
        setCrud('update');
        setForm({
            componentId: r.componentId,
            componentCode: r.componentCode,
            componentName: r.componentName,
            componentType: r.componentType as HrComponentType,
            calculationType: r.calculationType,
            calculationBase: r.calculationBase,
            defaultAmount: r.defaultAmount,
            isTaxable: r.isTaxable === 1,
            isStatutory: r.isStatutory === 1,
            isCash: r.isCash === 1,
            affectGrossPay: r.affectGrossPay === 1,
            sortOrder: r.sortOrder,
            isActive: r.isActive === 1
        });
        setVisible(true);
    };

    const save = async () => {
        if (!form.componentCode.trim() || !form.componentName.trim()) { toast.current?.show({ severity: 'warn', summary: 'Missing fields' }); return; }
        const r = await HrPayrollService.upsertComponent({ ...form, crudType: crud });
        const op = Number(r.operationalStatus);
        if (op === 3) { toast.current?.show({ severity: 'warn', summary: 'Duplicate' }); return; }
        if (op !== 1 && op !== 2) { toast.current?.show({ severity: 'error', summary: 'Failed' }); return; }
        toast.current?.show({ severity: 'success', summary: 'Saved' });
        setVisible(false);
        await load();
    };

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12">
                <Card title="Salary Components" subTitle="Catalogue of earnings, deductions, reliefs, taxes">
                    <div className="flex justify-content-end mb-3"><Button label="New Component" icon="pi pi-plus" onClick={openCreate} /></div>
                    <DataTable value={rows} loading={loading} paginator rows={20} dataKey="componentId" stripedRows responsiveLayout="scroll">
                        <Column field="componentCode" header="Code" sortable />
                        <Column field="componentName" header="Name" sortable />
                        <Column field="componentType" header="Type" />
                        <Column field="calculationType" header="Calc" />
                        <Column field="calculationBase" header="Base" />
                        <Column field="defaultAmount" header="Default" />
                        <Column header="Statutory" body={(r: HrSalaryComponent) => (r.isStatutory ? <Tag severity="warning" value="Statutory" /> : '—')} />
                        <Column header="Active" body={(r: HrSalaryComponent) => <Tag severity={r.isActive ? 'success' : 'danger'} value={r.isActive ? 'Active' : 'Inactive'} />} />
                        <Column header="Actions" body={(r: HrSalaryComponent) => <Button icon="pi pi-pencil" rounded text onClick={() => openEdit(r)} />} />
                    </DataTable>
                </Card>
            </div>

            <Dialog header={crud === 'save' ? 'New Component' : 'Edit Component'} visible={visible} style={{ width: '600px' }} modal onHide={() => setVisible(false)}>
                <div className="grid pt-3">
                    <div className="col-12 md:col-6"><label className="block mb-1">Code *</label><InputText className="w-full" value={form.componentCode} onChange={(e) => setForm({ ...form, componentCode: e.target.value })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Name *</label><InputText className="w-full" value={form.componentName} onChange={(e) => setForm({ ...form, componentName: e.target.value })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Type</label><Dropdown className="w-full" options={TYPES.map((t) => ({ label: t, value: t }))} value={form.componentType} onChange={(e) => setForm({ ...form, componentType: e.value })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Calculation</label><Dropdown className="w-full" options={CALC.map((t) => ({ label: t, value: t }))} value={form.calculationType} onChange={(e) => setForm({ ...form, calculationType: e.value })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Calc Base</label><Dropdown className="w-full" options={[{ label: '— None —', value: null }, ...BASES.map((b) => ({ label: b, value: b }))]} value={form.calculationBase} onChange={(e) => setForm({ ...form, calculationBase: e.value })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Default Amount / %</label><InputNumber className="w-full" value={form.defaultAmount} onValueChange={(e) => setForm({ ...form, defaultAmount: e.value ?? null })} minFractionDigits={0} maxFractionDigits={4} /></div>
                    <div className="col-12 md:col-3"><label className="block mb-1">Sort Order</label><InputNumber className="w-full" value={form.sortOrder} onValueChange={(e) => setForm({ ...form, sortOrder: e.value ?? 0 })} /></div>
                    <div className="col-6 md:col-3 flex align-items-end gap-2"><InputSwitch checked={form.isTaxable} onChange={(e) => setForm({ ...form, isTaxable: !!e.value })} /><span>Taxable</span></div>
                    <div className="col-6 md:col-3 flex align-items-end gap-2"><InputSwitch checked={form.isStatutory} onChange={(e) => setForm({ ...form, isStatutory: !!e.value })} /><span>Statutory</span></div>
                    <div className="col-6 md:col-3 flex align-items-end gap-2"><InputSwitch checked={form.isCash} onChange={(e) => setForm({ ...form, isCash: !!e.value })} /><span>Cash</span></div>
                    <div className="col-6 md:col-3 flex align-items-end gap-2"><InputSwitch checked={form.affectGrossPay} onChange={(e) => setForm({ ...form, affectGrossPay: !!e.value })} /><span>Affects Gross</span></div>
                    <div className="col-6 md:col-3 flex align-items-end gap-2"><InputSwitch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: !!e.value })} /><span>Active</span></div>
                    <div className="col-12 flex justify-content-end gap-2 mt-2">
                        <Button label="Cancel" severity="secondary" outlined onClick={() => setVisible(false)} />
                        <Button label="Save" icon="pi pi-check" onClick={save} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default ComponentsPage;
