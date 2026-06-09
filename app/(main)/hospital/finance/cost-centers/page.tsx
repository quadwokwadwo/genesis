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
import { FinanceService } from '@/libs/blue_prints/FinanceService';
import { FinanceCostCenter } from '@/types/finance/finance';
import UsersModel from '@/libs/blue_prints/UsersModel';

const EMPTY = {
    costCenterId: undefined as number | undefined,
    code: '',
    name: '',
    description: '',
    costCenterType: 'EXPENSE' as FinanceCostCenter['costCenterType'],
    parentCostCenterId: null as number | null,
    managerUserId: null as number | null,
    annualBudget: null as number | null,
    isActive: true
};

const TYPES = ['REVENUE', 'EXPENSE', 'INVESTMENT', 'SUPPORT'].map((v) => ({ label: v, value: v }));

const CostCentersPage = () => {
    const toast = useRef<Toast>(null);
    const [rows, setRows] = useState<FinanceCostCenter[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [crud, setCrud] = useState<'save' | 'update'>('save');
    const [form, setForm] = useState({ ...EMPTY });

    const load = async () => {
        setLoading(true);
        const r = await FinanceService.listCostCenters();
        setRows(Array.isArray(r.operatedData) ? r.operatedData : []);
        setLoading(false);
    };

    useEffect(() => {
        document.title = 'Finance · Cost Centers';
        void load();
        void new UsersModel().getUserList().then((u: any) => setUsers(Array.isArray(u?.operatedData) ? u.operatedData : []));
    }, []);

    const parentOptions = useMemo(() => [{ label: '— None —', value: null }, ...rows.filter((r) => r.costCenterId !== form.costCenterId).map((r) => ({ label: `${r.code} · ${r.name}`, value: r.costCenterId }))], [rows, form.costCenterId]);
    const userOptions = useMemo(() => [{ label: '— None —', value: null }, ...users.map((u: any) => ({ label: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.username || `User ${u.userId}`, value: u.userId }))], [users]);

    const save = async () => {
        if (!form.code.trim() || !form.name.trim()) { toast.current?.show({ severity: 'warn', summary: 'Missing', detail: 'Code and name required.' }); return; }
        const r = await FinanceService.upsertCostCenter({ crudType: crud, ...form });
        const op = Number(r.operationalStatus);
        if (op === 3) { toast.current?.show({ severity: 'warn', summary: 'Duplicate', detail: 'Code already exists.' }); return; }
        if (op !== 1 && op !== 2) { toast.current?.show({ severity: 'error', summary: 'Failed', detail: 'Could not save.' }); return; }
        toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Cost center saved.' });
        setVisible(false); await load();
    };

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12">
                <Card title="Cost Centers">
                    <div className="flex justify-content-end mb-3"><Button label="New Cost Center" icon="pi pi-plus" onClick={() => { setCrud('save'); setForm({ ...EMPTY }); setVisible(true); }} /></div>
                    <DataTable value={rows} loading={loading} paginator rows={15} dataKey="costCenterId" stripedRows responsiveLayout="scroll">
                        <Column field="code" header="Code" sortable />
                        <Column field="name" header="Name" sortable />
                        <Column field="costCenterType" header="Type" />
                        <Column field="parentCostCenterName" header="Parent" />
                        <Column header="Manager" body={(r: FinanceCostCenter) => `${r.managerFirstName ?? ''} ${r.managerLastName ?? ''}`.trim() || '—'} />
                        <Column field="annualBudget" header="Annual Budget" />
                        <Column header="Active" body={(r: FinanceCostCenter) => <Tag severity={r.isActive ? 'success' : 'danger'} value={r.isActive ? 'Yes' : 'No'} />} />
                        <Column header="Actions" body={(r: FinanceCostCenter) => (
                            <Button icon="pi pi-pencil" rounded text onClick={() => {
                                setCrud('update');
                                setForm({ costCenterId: r.costCenterId, code: r.code, name: r.name, description: r.description ?? '', costCenterType: r.costCenterType, parentCostCenterId: r.parentCostCenterId, managerUserId: r.managerUserId, annualBudget: r.annualBudget, isActive: r.isActive === 1 });
                                setVisible(true);
                            }} />
                        )} />
                    </DataTable>
                </Card>
            </div>

            <Dialog header={crud === 'save' ? 'New Cost Center' : 'Edit Cost Center'} visible={visible} style={{ width: '520px' }} modal onHide={() => setVisible(false)}>
                <div className="grid pt-3">
                    <div className="col-12 md:col-6"><label className="block mb-1">Code *</label><InputText className="w-full" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Type</label><Dropdown className="w-full" options={TYPES} value={form.costCenterType} onChange={(e) => setForm({ ...form, costCenterType: e.value })} /></div>
                    <div className="col-12"><label className="block mb-1">Name *</label><InputText className="w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                    <div className="col-12"><label className="block mb-1">Description</label><InputTextarea className="w-full" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Parent</label><Dropdown className="w-full" options={parentOptions} value={form.parentCostCenterId} onChange={(e) => setForm({ ...form, parentCostCenterId: e.value })} filter /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Manager</label><Dropdown className="w-full" options={userOptions} value={form.managerUserId} onChange={(e) => setForm({ ...form, managerUserId: e.value })} filter /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Annual Budget</label><InputNumber className="w-full" value={form.annualBudget ?? undefined} onValueChange={(e) => setForm({ ...form, annualBudget: e.value ?? null })} mode="decimal" minFractionDigits={2} /></div>
                    <div className="col-12 md:col-6 flex align-items-center gap-2"><InputSwitch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: !!e.value })} /><span>Active</span></div>
                    <div className="col-12 flex justify-content-end gap-2 mt-2"><Button label="Cancel" severity="secondary" outlined onClick={() => setVisible(false)} /><Button label="Save" icon="pi pi-check" onClick={save} /></div>
                </div>
            </Dialog>
        </div>
    );
};

export default CostCentersPage;
