'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputSwitch } from 'primereact/inputswitch';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { HrService } from '@/libs/blue_prints/HrService';
import { HrDepartment, HrPosition } from '@/types/hr/hr';

const EMPTY = { positionId: undefined as number | undefined, positionCode: '', positionName: '', deptId: null as number | null, description: '', isActive: true };

const PositionsPage = () => {
    const [rows, setRows] = useState<HrPosition[]>([]);
    const [depts, setDepts] = useState<HrDepartment[]>([]);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [crud, setCrud] = useState<'save' | 'update'>('save');
    const [form, setForm] = useState({ ...EMPTY });
    const toast = useRef<Toast>(null);

    const load = async () => {
        setLoading(true);
        const [r, d] = await Promise.all([HrService.listPositions(), HrService.listDepartments()]);
        setRows(Array.isArray(r.operatedData) ? r.operatedData : []);
        setDepts(Array.isArray(d.operatedData) ? d.operatedData : []);
        setLoading(false);
    };

    useEffect(() => { document.title = 'HR · Positions'; void load(); }, []);

    const openCreate = () => { setCrud('save'); setForm({ ...EMPTY }); setVisible(true); };
    const openEdit = (r: HrPosition) => {
        setCrud('update');
        setForm({ positionId: r.positionId, positionCode: r.positionCode, positionName: r.positionName, deptId: r.deptId, description: r.description ?? '', isActive: r.isActive === 1 });
        setVisible(true);
    };

    const save = async () => {
        if (!form.positionCode.trim() || !form.positionName.trim()) {
            toast.current?.show({ severity: 'warn', summary: 'Missing fields', detail: 'Code and name required.' });
            return;
        }
        const r = await HrService.upsertPosition({ ...form, crudType: crud, positionCode: form.positionCode.trim(), positionName: form.positionName.trim() });
        const op = Number(r.operationalStatus);
        if (op === 3) { toast.current?.show({ severity: 'warn', summary: 'Duplicate', detail: 'Code exists.' }); return; }
        if (op !== 1 && op !== 2) { toast.current?.show({ severity: 'error', summary: 'Failed' }); return; }
        toast.current?.show({ severity: 'success', summary: 'Saved' });
        setVisible(false);
        await load();
    };

    const deptOpts = [{ label: '— None —', value: null }, ...depts.map((d) => ({ label: d.deptName, value: d.deptId }))];

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12">
                <Card title="Positions" subTitle="Job titles and roles">
                    <div className="flex justify-content-end mb-3">
                        <Button label="New Position" icon="pi pi-plus" onClick={openCreate} />
                    </div>
                    <DataTable value={rows} loading={loading} paginator rows={15} dataKey="positionId" stripedRows responsiveLayout="scroll">
                        <Column field="positionCode" header="Code" sortable />
                        <Column field="positionName" header="Name" sortable />
                        <Column field="deptName" header="Department" />
                        <Column field="employeeCount" header="Staff" sortable />
                        <Column header="Active" body={(r: HrPosition) => <Tag severity={r.isActive ? 'success' : 'danger'} value={r.isActive ? 'Active' : 'Inactive'} />} />
                        <Column header="Actions" body={(r: HrPosition) => <Button icon="pi pi-pencil" rounded text onClick={() => openEdit(r)} />} />
                    </DataTable>
                </Card>
            </div>

            <Dialog header={crud === 'save' ? 'New Position' : 'Edit Position'} visible={visible} style={{ width: '460px' }} modal onHide={() => setVisible(false)}>
                <div className="flex flex-column gap-3 pt-3">
                    <div><label className="block mb-1">Code *</label><InputText className="w-full" value={form.positionCode} onChange={(e) => setForm({ ...form, positionCode: e.target.value })} /></div>
                    <div><label className="block mb-1">Name *</label><InputText className="w-full" value={form.positionName} onChange={(e) => setForm({ ...form, positionName: e.target.value })} /></div>
                    <div><label className="block mb-1">Department</label><Dropdown className="w-full" options={deptOpts} value={form.deptId} onChange={(e) => setForm({ ...form, deptId: e.value })} placeholder="Select" filter /></div>
                    <div><label className="block mb-1">Description</label><InputTextarea className="w-full" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                    <div className="flex align-items-center gap-2"><InputSwitch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: !!e.value })} /><span>Active</span></div>
                    <div className="flex justify-content-end gap-2 mt-2">
                        <Button label="Cancel" severity="secondary" outlined onClick={() => setVisible(false)} />
                        <Button label="Save" icon="pi pi-check" onClick={save} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default PositionsPage;
