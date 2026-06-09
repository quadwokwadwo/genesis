'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Calendar } from 'primereact/calendar';
import RbaService from '@/libs/blue_prints/RbaService';
import UsersModel from '@/libs/blue_prints/UsersModel';
import { RbaRole, RbaUserAssignedRole } from '@/types/rba/rba';

interface UserOption {
    userId: number;
    firstName: string;
    lastName: string;
    username: string;
    role: string;
    label: string;
}

const UserRolesPage = () => {
    const [users, setUsers] = useState<UserOption[]>([]);
    const [roles, setRoles] = useState<RbaRole[]>([]);
    const [assignments, setAssignments] = useState<RbaUserAssignedRole[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
    const [validFrom, setValidFrom] = useState<Date | null>(null);
    const [validUntil, setValidUntil] = useState<Date | null>(null);
    const [loading, setLoading] = useState(false);
    const toast = useRef<Toast>(null);

    const usersModel = new UsersModel();

    const fetchAll = async () => {
        setLoading(true);
        const [userRes, roleRes, assignRes] = await Promise.all([
            usersModel.getUserList().catch(() => ({ operatedData: [] as any[] })),
            RbaService.listRoles(),
            RbaService.listUserRoles()
        ]);
        const list = Array.isArray(userRes.operatedData) ? userRes.operatedData : [];
        setUsers(
            list.map((u: any) => ({
                userId: u.userId,
                firstName: u.firstName,
                lastName: u.lastName,
                username: u.username,
                role: u.role,
                label: `${u.firstName} ${u.lastName} (${u.username} · ${u.role})`
            }))
        );
        setRoles(Array.isArray(roleRes.operatedData) ? roleRes.operatedData : []);
        setAssignments(Array.isArray(assignRes.operatedData) ? assignRes.operatedData : []);
        setLoading(false);
    };

    useEffect(() => {
        document.title = 'RBA · User Roles';
        void fetchAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const assign = async () => {
        if (!selectedUserId || !selectedRoleId) {
            toast.current?.show({ severity: 'warn', summary: 'Missing fields', detail: 'Select a user and a role.' });
            return;
        }
        const r = await RbaService.assignUserRole({
            userId: selectedUserId,
            roleId: selectedRoleId,
            validFrom: validFrom ? validFrom.toISOString().slice(0, 10) : null,
            validUntil: validUntil ? validUntil.toISOString().slice(0, 10) : null
        });
        const op = Number(r.operationalStatus);
        if (op === 3) {
            toast.current?.show({ severity: 'warn', summary: 'Duplicate', detail: 'User already has this role.' });
            return;
        }
        if (op !== 1) {
            toast.current?.show({ severity: 'error', summary: 'Failed', detail: 'Could not assign role.' });
            return;
        }
        toast.current?.show({ severity: 'success', summary: 'Assigned', detail: 'Role assigned.' });
        setSelectedRoleId(null);
        setValidFrom(null);
        setValidUntil(null);
        await fetchAll();
    };

    const confirmRevoke = (row: RbaUserAssignedRole) => {
        confirmDialog({
            message: `Revoke role "${row.roleName}" from ${row.userFullName}?`,
            header: 'Revoke role',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                const r = await RbaService.revokeUserRole(row.userRoleId);
                if (Number(r.operationalStatus) === 2) {
                    toast.current?.show({ severity: 'success', summary: 'Revoked', detail: 'Role revoked.' });
                    await fetchAll();
                } else {
                    toast.current?.show({ severity: 'error', summary: 'Failed', detail: 'Could not revoke.' });
                }
            }
        });
    };

    return (
        <div className="grid">
            <Toast ref={toast} />
            <ConfirmDialog />

            <div className="col-12">
                <Card title="Assign Role" subTitle="Grant a user one or more additional roles beyond their primary role.">
                    <div className="grid p-fluid">
                        <div className="col-12 md:col-4">
                            <label className="block mb-2">User</label>
                            <Dropdown value={selectedUserId} options={users} optionLabel="label" optionValue="userId" filter onChange={(e) => setSelectedUserId(e.value)} placeholder="Select user" />
                        </div>
                        <div className="col-12 md:col-3">
                            <label className="block mb-2">Role</label>
                            <Dropdown value={selectedRoleId} options={roles} optionLabel="roleName" optionValue="roleId" onChange={(e) => setSelectedRoleId(e.value)} placeholder="Select role" />
                        </div>
                        <div className="col-12 md:col-2">
                            <label className="block mb-2">Valid From</label>
                            <Calendar value={validFrom} onChange={(e) => setValidFrom((e.value as Date) ?? null)} dateFormat="yy-mm-dd" showIcon />
                        </div>
                        <div className="col-12 md:col-2">
                            <label className="block mb-2">Valid Until</label>
                            <Calendar value={validUntil} onChange={(e) => setValidUntil((e.value as Date) ?? null)} dateFormat="yy-mm-dd" showIcon />
                        </div>
                        <div className="col-12 md:col-1 flex align-items-end">
                            <Button label="Assign" icon="pi pi-check" onClick={assign} />
                        </div>
                    </div>
                </Card>
            </div>

            <div className="col-12">
                <Card title="Current Assignments">
                    <DataTable value={assignments} loading={loading} paginator rows={15} dataKey="userRoleId" stripedRows responsiveLayout="scroll">
                        <Column field="userFullName" header="User" sortable />
                        <Column field="username" header="Username" sortable />
                        <Column field="roleName" header="Role" sortable />
                        <Column field="validFrom" header="From" />
                        <Column field="validUntil" header="Until" />
                        <Column field="assignedAt" header="Assigned" />
                        <Column
                            header="Actions"
                            style={{ width: '6rem' }}
                            body={(row: RbaUserAssignedRole) => <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => confirmRevoke(row)} />}
                        />
                    </DataTable>
                </Card>
            </div>
        </div>
    );
};

export default UserRolesPage;
