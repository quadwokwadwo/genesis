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
import { HrDepartment } from '@/types/hr/hr';
import UsersModel from '@/libs/blue_prints/UsersModel';

const EMPTY = {
    deptId: undefined as number | undefined,
    deptCode: '',
    deptName: '',
    description: '',
    parentDeptId: null as number | null,
    headUserId: null as number | null,
    isActive: true
};

const DepartmentsPage = () => {
    const [rows, setRows] = useState<HrDepartment[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [crud, setCrud] = useState<'save' | 'update'>('save');
    const [form, setForm] = useState({ ...EMPTY });
    const toast = useRef<Toast>(null);

    const load = async () => {
        setLoading(true);
        const r = await HrService.listDepartments();
        setRows(Array.isArray(r.operatedData) ? r.operatedData : []);
        setLoading(false);
    };

    useEffect(() => {
        document.title = 'HR · Departments';
        void load();
        void new UsersModel().getUserList().then((u: any) => setUsers(Array.isArray(u?.operatedData) ? u.operatedData : []));
    }, []);

    const openCreate = () => { setCrud('save'); setForm({ ...EMPTY }); setVisible(true); };
    const openEdit = (row: HrDepartment) => {
        setCrud('update');
        setForm({
            deptId: row.deptId,
            deptCode: row.deptCode,
            deptName: row.deptName,
            description: row.description ?? '',
            parentDeptId: row.parentDeptId,
            headUserId: row.headUserId,
            isActive: row.isActive === 1
        });
        setVisible(true);
    };

    const save = async () => {
        if (!form.deptCode.trim() || !form.deptName.trim()) {
            toast.current?.show({ severity: 'warn', summary: 'Missing fields', detail: 'Code and name are required.' });
            return;
        }
        const r = await HrService.upsertDepartment({
            crudType: crud,
            deptId: form.deptId,
            deptCode: form.deptCode.trim(),
            deptName: form.deptName.trim(),
            description: form.description,
            parentDeptId: form.parentDeptId,
            headUserId: form.headUserId,
            isActive: form.isActive
        });
        const op = Number(r.operationalStatus);
        if (op === 3) { toast.current?.show({ severity: 'warn', summary: 'Duplicate', detail: 'Code already exists.' }); return; }
        if (op !== 1 && op !== 2) { toast.current?.show({ severity: 'error', summary: 'Failed', detail: 'Could not save.' }); return; }
        toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Department saved.' });
        setVisible(false);
        await load();
    };

    const parentOptions = [{ label: '— None —', value: null }, ...rows.filter((r) => r.deptId !== form.deptId).map((r) => ({ label: r.deptName, value: r.deptId }))];
    const userOptions = [{ label: '— None —', value: null }, ...users.map((u: any) => ({ label: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.username || `User ${u.userId}`, value: u.userId }))];

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12">
                <Card title="Departments" subTitle="Organizational structure">
                    <div className="flex justify-content-end mb-3">
                        <Button label="New Department" icon="pi pi-plus" onClick={openCreate} />
                    </div>
                    <DataTable value={rows} loading={loading} paginator rows={15} dataKey="deptId" stripedRows responsiveLayout="scroll">
                        <Column field="deptCode" header="Code" sortable />
                        <Column field="deptName" header="Name" sortable />
                        <Column field="parentDeptName" header="Parent" />
                        <Column field="headUserName" header="Head" />
                        <Column field="employeeCount" header="Staff" sortable />
                        <Column header="Active" body={(r: HrDepartment) => <Tag severity={r.isActive ? 'success' : 'danger'} value={r.isActive ? 'Active' : 'Inactive'} />} />
                        <Column header="Actions" body={(r: HrDepartment) => <Button icon="pi pi-pencil" rounded text onClick={() => openEdit(r)} />} />
                    </DataTable>
                </Card>
            </div>

            <Dialog header={crud === 'save' ? 'New Department' : 'Edit Department'} visible={visible} style={{ width: '480px' }} modal onHide={() => setVisible(false)}>
                <div className="flex flex-column gap-3 pt-3">
                    <div>
                        <label className="block mb-1">Code *</label>
                        <InputText className="w-full" value={form.deptCode} onChange={(e) => setForm({ ...form, deptCode: e.target.value })} />
                    </div>
                    <div>
                        <label className="block mb-1">Name *</label>
                        <InputText className="w-full" value={form.deptName} onChange={(e) => setForm({ ...form, deptName: e.target.value })} />
                    </div>
                    <div>
                        <label className="block mb-1">Description</label>
                        <InputTextarea className="w-full" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                    </div>
                    <div>
                        <label className="block mb-1">Parent Department</label>
                        <Dropdown className="w-full" options={parentOptions} value={form.parentDeptId} onChange={(e) => setForm({ ...form, parentDeptId: e.value })} placeholder="Select parent" />
                    </div>
                    <div>
                        <label className="block mb-1">Department Head</label>
                        <Dropdown className="w-full" options={userOptions} value={form.headUserId} onChange={(e) => setForm({ ...form, headUserId: e.value })} placeholder="Select user" filter />
                    </div>
                    <div className="flex align-items-center gap-2">
                        <InputSwitch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: !!e.value })} />
                        <span>Active</span>
                    </div>
                    <div className="flex justify-content-end gap-2 mt-2">
                        <Button label="Cancel" severity="secondary" outlined onClick={() => setVisible(false)} />
                        <Button label="Save" icon="pi pi-check" onClick={save} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default DepartmentsPage;
