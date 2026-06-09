'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputSwitch } from 'primereact/inputswitch';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import RbaService from '@/libs/blue_prints/RbaService';
import { RbaRole } from '@/types/rba/rba';

const EMPTY_FORM = {
    roleId: undefined as number | undefined,
    roleCode: '',
    roleName: '',
    description: '',
    isActive: true
};

const RolesPage = () => {
    const [roles, setRoles] = useState<RbaRole[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [crudType, setCrudType] = useState<'save' | 'update'>('save');
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const toast = useRef<Toast>(null);

    const fetchRoles = async () => {
        setLoading(true);
        const r = await RbaService.listRoles();
        setRoles(Array.isArray(r.operatedData) ? r.operatedData : []);
        setLoading(false);
    };

    useEffect(() => {
        document.title = 'RBA · Roles';
        void fetchRoles();
    }, []);

    const openCreate = () => {
        setCrudType('save');
        setForm({ ...EMPTY_FORM });
        setDialogVisible(true);
    };

    const openEdit = (row: RbaRole) => {
        setCrudType('update');
        setForm({
            roleId: row.roleId,
            roleCode: row.roleCode,
            roleName: row.roleName,
            description: row.description ?? '',
            isActive: row.isActive === 1
        });
        setDialogVisible(true);
    };

    const save = async () => {
        if (!form.roleCode.trim() || !form.roleName.trim()) {
            toast.current?.show({ severity: 'warn', summary: 'Missing fields', detail: 'Code and name are required.' });
            return;
        }
        const r = await RbaService.upsertRole({
            crudType,
            roleId: form.roleId,
            roleCode: form.roleCode.trim(),
            roleName: form.roleName.trim(),
            description: form.description,
            isActive: form.isActive
        });
        const op = Number(r.operationalStatus);
        if (op === 3) {
            toast.current?.show({ severity: 'warn', summary: 'Duplicate', detail: 'Role code already exists.' });
            return;
        }
        if (op !== 1 && op !== 2) {
            toast.current?.show({ severity: 'error', summary: 'Failed', detail: 'Could not save role.' });
            return;
        }
        toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Role saved.' });
        setDialogVisible(false);
        await fetchRoles();
    };

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12">
                <Card title="Roles" subTitle="Manage role definitions and review permission coverage.">
                    <div className="flex justify-content-end mb-3">
                        <Button label="New Role" icon="pi pi-plus" onClick={openCreate} />
                    </div>
                    <DataTable value={roles} loading={loading} paginator rows={15} dataKey="roleId" stripedRows responsiveLayout="scroll">
                        <Column field="roleCode" header="Code" sortable />
                        <Column field="roleName" header="Name" sortable />
                        <Column field="description" header="Description" />
                        <Column
                            field="isSystemRole"
                            header="System"
                            body={(r: RbaRole) => (r.isSystemRole ? <Tag severity="info" value="System" /> : <Tag severity="warning" value="Custom" />)}
                            style={{ width: '6rem' }}
                        />
                        <Column field="permissionCount" header="Perms" style={{ width: '5rem' }} />
                        <Column field="assignedUserCount" header="Users" style={{ width: '5rem' }} />
                        <Column
                            field="isActive"
                            header="Active"
                            body={(r: RbaRole) => (r.isActive ? <Tag severity="success" value="Active" /> : <Tag severity="danger" value="Inactive" />)}
                            style={{ width: '6rem' }}
                        />
                        <Column
                            header="Actions"
                            style={{ width: '6rem' }}
                            body={(row: RbaRole) => (
                                <Button icon="pi pi-pencil" rounded text severity="secondary" onClick={() => openEdit(row)} disabled={row.isSystemRole === 1 && row.roleCode === 'admin'} />
                            )}
                        />
                    </DataTable>
                </Card>
            </div>

            <Dialog
                visible={dialogVisible}
                onHide={() => setDialogVisible(false)}
                header={crudType === 'save' ? 'New Role' : 'Edit Role'}
                style={{ width: '480px' }}
                modal
            >
                <div className="grid p-fluid">
                    <div className="col-12">
                        <label className="block mb-2">Role Code</label>
                        <InputText value={form.roleCode} onChange={(e) => setForm({ ...form, roleCode: e.target.value })} disabled={crudType === 'update'} />
                    </div>
                    <div className="col-12">
                        <label className="block mb-2">Role Name</label>
                        <InputText value={form.roleName} onChange={(e) => setForm({ ...form, roleName: e.target.value })} />
                    </div>
                    <div className="col-12">
                        <label className="block mb-2">Description</label>
                        <InputTextarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                    </div>
                    <div className="col-12 flex align-items-center gap-2">
                        <InputSwitch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: !!e.value })} />
                        <span>Active</span>
                    </div>
                    <div className="col-12 flex justify-content-end gap-2 mt-3">
                        <Button label="Cancel" text onClick={() => setDialogVisible(false)} />
                        <Button label="Save" icon="pi pi-check" onClick={save} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default RolesPage;
