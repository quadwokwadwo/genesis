'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { Checkbox } from 'primereact/checkbox';
import { Tag } from 'primereact/tag';
import RbaService from '@/libs/blue_prints/RbaService';
import { RbaPermission, RbaRole, RbaRolePermission } from '@/types/rba/rba';

const RolePermissionsPage = () => {
    const [roles, setRoles] = useState<RbaRole[]>([]);
    const [permissions, setPermissions] = useState<RbaPermission[]>([]);
    const [grants, setGrants] = useState<RbaRolePermission[]>([]);
    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const toast = useRef<Toast>(null);

    useEffect(() => {
        document.title = 'RBA · Role Permissions';
        (async () => {
            const [r1, r2] = await Promise.all([RbaService.listRoles(), RbaService.listPermissions()]);
            const rs = Array.isArray(r1.operatedData) ? r1.operatedData : [];
            setRoles(rs);
            setPermissions(Array.isArray(r2.operatedData) ? r2.operatedData : []);
            if (rs.length > 0) setSelectedRoleId(rs[0].roleId);
        })();
    }, []);

    useEffect(() => {
        if (selectedRoleId == null) return;
        setLoading(true);
        RbaService.listRolePermissions(selectedRoleId).then((r) => {
            setGrants(Array.isArray(r.operatedData) ? r.operatedData : []);
            setLoading(false);
        });
    }, [selectedRoleId]);

    const grantedIds = useMemo(() => new Set(grants.map((g) => g.permissionId)), [grants]);

    const toggle = async (permission: RbaPermission, currently: boolean) => {
        if (selectedRoleId == null) return;
        const r = currently
            ? await RbaService.revokePermission(selectedRoleId, permission.permissionId)
            : await RbaService.grantPermission(selectedRoleId, permission.permissionId);
        const op = Number(r.operationalStatus);
        if (currently) {
            if (op !== 2) {
                toast.current?.show({ severity: 'error', summary: 'Failed', detail: 'Could not revoke.' });
                return;
            }
        } else if (op !== 1 && op !== 3) {
            toast.current?.show({ severity: 'error', summary: 'Failed', detail: 'Could not grant.' });
            return;
        }
        const refreshed = await RbaService.listRolePermissions(selectedRoleId);
        setGrants(Array.isArray(refreshed.operatedData) ? refreshed.operatedData : []);
    };

    const groupedPermissions = useMemo(() => {
        const groups: Record<string, RbaPermission[]> = {};
        permissions.forEach((p) => {
            (groups[p.module] ||= []).push(p);
        });
        return groups;
    }, [permissions]);

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12">
                <Card title="Role Permissions" subTitle="Grant or revoke individual permissions for the selected role.">
                    <div className="flex align-items-center gap-3 mb-3">
                        <span>Role:</span>
                        <Dropdown value={selectedRoleId} onChange={(e) => setSelectedRoleId(e.value)} options={roles} optionLabel="roleName" optionValue="roleId" placeholder="Select role" style={{ minWidth: 240 }} />
                        <span className="text-color-secondary text-sm">
                            {grants.length} permission{grants.length === 1 ? '' : 's'} granted
                        </span>
                    </div>

                    {Object.entries(groupedPermissions).map(([mod, perms]) => (
                        <Card key={mod} className="mb-3" title={<span className="text-primary text-base">{mod.toUpperCase()}</span>}>
                            <DataTable value={perms} loading={loading} dataKey="permissionId" stripedRows responsiveLayout="scroll" size="small">
                                <Column
                                    header="Granted"
                                    style={{ width: '6rem' }}
                                    body={(p: RbaPermission) => {
                                        const has = grantedIds.has(p.permissionId);
                                        return <Checkbox checked={has} onChange={() => toggle(p, has)} />;
                                    }}
                                />
                                <Column field="permissionCode" header="Code" />
                                <Column field="permissionName" header="Name" />
                                <Column
                                    field="isActive"
                                    header="Active"
                                    style={{ width: '6rem' }}
                                    body={(p: RbaPermission) => (p.isActive ? <Tag severity="success" value="Active" /> : <Tag severity="danger" value="Off" />)}
                                />
                            </DataTable>
                        </Card>
                    ))}
                </Card>
            </div>
        </div>
    );
};

export default RolePermissionsPage;
