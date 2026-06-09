'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import { useRouter } from 'next/navigation';
import useUserData from '@/libs/hooks/useUserData';
import { USER_ROLES } from '@/types/enums/enums';
import UsersAdminService, { AdminUserRow, ExpiringCredentialRow, UpdateUserPayload } from '@/libs/blue_prints/UsersAdminService';

const ROLE_OPTIONS = [
    { label: 'All roles', value: '' },
    { label: 'Admin', value: 'admin' },
    { label: 'Doctor', value: 'doctor' },
    { label: 'Nurse', value: 'nurse' },
    { label: 'Lab Tech', value: 'lab_tech' }
];

const STATUS_OPTIONS = [
    { label: 'All statuses', value: '' },
    { label: 'Active', value: 'Active' },
    { label: 'Disabled', value: 'Disabled' },
    { label: 'Locked', value: 'Locked' }
];

const ROLE_FORM_OPTIONS = ROLE_OPTIONS.filter((o) => o.value !== '');

interface EditFormState {
    fullName: string;
    email: string;
    role: string;
    phoneNumber: string;
    licenseNumber: string;
    licenseExpiryDate: Date | null;
}

const EMPTY_FORM: EditFormState = {
    fullName: '',
    email: '',
    role: 'doctor',
    phoneNumber: '',
    licenseNumber: '',
    licenseExpiryDate: null
};

const AdminUsersPage = () => {
    const { user, isLoaded } = useUserData<any>();
    const router = useRouter();
    const toast = useRef<Toast>(null);

    const [rows, setRows] = useState<AdminUserRow[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const [loading, setLoading] = useState(false);

    const [filterRole, setFilterRole] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [search, setSearch] = useState('');

    const [editing, setEditing] = useState<AdminUserRow | null>(null);
    const [editForm, setEditForm] = useState<EditFormState>(EMPTY_FORM);
    const [editSaving, setEditSaving] = useState(false);

    const [resetTarget, setResetTarget] = useState<AdminUserRow | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [resetSaving, setResetSaving] = useState(false);

    const [expiring, setExpiring] = useState<ExpiringCredentialRow[]>([]);

    const isAdmin = user?.role === USER_ROLES.admin;

    useEffect(() => {
        document.title = 'User Management';
    }, []);

    useEffect(() => {
        if (!isLoaded) return;
        if (!isAdmin) {
            router.replace('/');
            return;
        }
        load();
        loadExpiring();
    }, [isLoaded, isAdmin]);

    useEffect(() => {
        if (!isAdmin) return;
        load();
    }, [page, pageSize, filterRole, filterStatus]);

    const load = async () => {
        setLoading(true);
        try {
            const res = await UsersAdminService.listUsers({
                role: filterRole || undefined,
                status: filterStatus || undefined,
                search: search || undefined,
                page,
                pageSize
            });
            setRows(res?.rows ?? []);
            setTotal(res?.total ?? 0);
        } catch (e: any) {
            toast.current?.show({ severity: 'error', summary: 'Load failed', detail: e?.message ?? 'Could not load users' });
        } finally {
            setLoading(false);
        }
    };

    const loadExpiring = async () => {
        try {
            const res = await UsersAdminService.getExpiringCredentials(90);
            setExpiring(res?.rows ?? []);
        } catch {
            // non-fatal
        }
    };

    const openEdit = (row: AdminUserRow) => {
        setEditing(row);
        setEditForm({
            fullName: `${row.firstName ?? ''} ${row.lastName ?? ''}`.trim(),
            email: row.email ?? '',
            role: row.role,
            phoneNumber: row.phoneNumber ?? '',
            licenseNumber: row.licenseNumber ?? '',
            licenseExpiryDate: row.licenseExpiryDate ? new Date(row.licenseExpiryDate) : null
        });
    };

    const closeEdit = () => {
        setEditing(null);
        setEditForm(EMPTY_FORM);
    };

    const saveEdit = async () => {
        if (!editing) return;
        if (!editForm.fullName.trim()) {
            toast.current?.show({ severity: 'warn', summary: 'Validation', detail: 'Full name is required' });
            return;
        }
        const payload: UpdateUserPayload = {
            fullName: editForm.fullName.trim(),
            email: editForm.email || null,
            role: editForm.role,
            phoneNumber: editForm.phoneNumber || null,
            licenseNumber: editForm.licenseNumber || null,
            licenseExpiryDate: editForm.licenseExpiryDate ? editForm.licenseExpiryDate.toISOString().slice(0, 10) : null
        };
        setEditSaving(true);
        try {
            await UsersAdminService.updateUser(editing.userId, payload);
            toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'User updated' });
            closeEdit();
            load();
            loadExpiring();
        } catch (e: any) {
            const msg = e?.response?.data?.message ?? e?.message ?? 'Update failed';
            toast.current?.show({ severity: 'error', summary: 'Update failed', detail: msg });
        } finally {
            setEditSaving(false);
        }
    };

    const doDisable = (row: AdminUserRow) => {
        confirmDialog({
            message: `Disable ${row.firstName} ${row.lastName}? They will no longer be able to log in.`,
            header: 'Disable user',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    await UsersAdminService.disable(row.userId);
                    toast.current?.show({ severity: 'success', summary: 'Disabled', detail: `${row.username} disabled` });
                    load();
                } catch (e: any) {
                    toast.current?.show({ severity: 'error', summary: 'Failed', detail: e?.message ?? 'Disable failed' });
                }
            }
        });
    };

    const doEnable = (row: AdminUserRow) => {
        confirmDialog({
            message: `Re-enable ${row.firstName} ${row.lastName}?`,
            header: 'Enable user',
            icon: 'pi pi-check',
            accept: async () => {
                try {
                    await UsersAdminService.enable(row.userId);
                    toast.current?.show({ severity: 'success', summary: 'Enabled', detail: `${row.username} enabled` });
                    load();
                } catch (e: any) {
                    toast.current?.show({ severity: 'error', summary: 'Failed', detail: e?.message ?? 'Enable failed' });
                }
            }
        });
    };

    const submitReset = async () => {
        if (!resetTarget) return;
        if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
            toast.current?.show({ severity: 'warn', summary: 'Weak password', detail: 'Min 8 chars, include a letter and a digit' });
            return;
        }
        setResetSaving(true);
        try {
            await UsersAdminService.resetPassword(resetTarget.userId, newPassword);
            toast.current?.show({ severity: 'success', summary: 'Password reset', detail: `Password reset for ${resetTarget.username}` });
            setResetTarget(null);
            setNewPassword('');
        } catch (e: any) {
            const msg = e?.response?.data?.message ?? e?.message ?? 'Reset failed';
            toast.current?.show({ severity: 'error', summary: 'Reset failed', detail: msg });
        } finally {
            setResetSaving(false);
        }
    };

    const statusBody = (row: AdminUserRow) => {
        const s = row.status ?? 'Active';
        const sev = s === 'Active' ? 'success' : s === 'Disabled' ? 'danger' : 'warning';
        return <Tag value={s} severity={sev as any} />;
    };

    const actionsBody = (row: AdminUserRow) => {
        const isDisabled = row.status === 'Disabled';
        return (
            <div className="flex gap-1">
                <Button icon="pi pi-pencil" rounded text severity="info" tooltip="Edit" onClick={() => openEdit(row)} />
                {isDisabled ? (
                    <Button icon="pi pi-check" rounded text severity="success" tooltip="Enable" onClick={() => doEnable(row)} />
                ) : (
                    <Button icon="pi pi-ban" rounded text severity="warning" tooltip="Disable" onClick={() => doDisable(row)} />
                )}
                <Button icon="pi pi-key" rounded text severity="secondary" tooltip="Reset password" onClick={() => setResetTarget(row)} />
            </div>
        );
    };

    const expiringCount = useMemo(() => expiring.length, [expiring]);

    if (!isLoaded) return null;
    if (!isAdmin) return null;

    return (
        <div className="grid">
            <Toast ref={toast} />
            <ConfirmDialog />

            {expiringCount > 0 && (
                <div className="col-12">
                    <Message
                        severity="warn"
                        text={`${expiringCount} user${expiringCount === 1 ? '' : 's'} ${expiringCount === 1 ? 'has' : 'have'} credentials expiring within 90 days.`}
                        className="w-full"
                    />
                </div>
            )}

            <div className="col-12">
                <Card title="User Management">
                    <div className="grid mb-3 align-items-end">
                        <div className="col-12 md:col-3">
                            <label className="block mb-1">Role</label>
                            <Dropdown value={filterRole} options={ROLE_OPTIONS} onChange={(e) => { setFilterRole(e.value); setPage(1); }} className="w-full" />
                        </div>
                        <div className="col-12 md:col-3">
                            <label className="block mb-1">Status</label>
                            <Dropdown value={filterStatus} options={STATUS_OPTIONS} onChange={(e) => { setFilterStatus(e.value); setPage(1); }} className="w-full" />
                        </div>
                        <div className="col-12 md:col-4">
                            <label className="block mb-1">Search</label>
                            <span className="p-input-icon-left w-full">
                                <i className="pi pi-search" />
                                <InputText
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); load(); } }}
                                    placeholder="Name, username or email"
                                    className="w-full"
                                />
                            </span>
                        </div>
                        <div className="col-12 md:col-2">
                            <Button label="Search" icon="pi pi-search" onClick={() => { setPage(1); load(); }} className="w-full" />
                        </div>
                    </div>

                    <DataTable
                        value={rows}
                        loading={loading}
                        lazy
                        paginator
                        rows={pageSize}
                        first={(page - 1) * pageSize}
                        totalRecords={total}
                        rowsPerPageOptions={[10, 25, 50, 100]}
                        onPage={(e) => {
                            setPage(Math.floor((e.first ?? 0) / (e.rows ?? pageSize)) + 1);
                            setPageSize(e.rows ?? pageSize);
                        }}
                        dataKey="userId"
                        emptyMessage="No users found"
                    >
                        <Column field="userId" header="ID" style={{ width: 70 }} />
                        <Column header="Name" body={(r: AdminUserRow) => `${r.firstName ?? ''} ${r.lastName ?? ''}`.trim()} />
                        <Column field="username" header="Username" />
                        <Column field="role" header="Role" />
                        <Column field="email" header="Email" />
                        <Column field="phoneNumber" header="Phone" />
                        <Column field="licenseNumber" header="License #" />
                        <Column field="licenseExpiryDate" header="License expiry" body={(r) => (r.licenseExpiryDate ? String(r.licenseExpiryDate).slice(0, 10) : '—')} />
                        <Column header="Status" body={statusBody} style={{ width: 120 }} />
                        <Column header="Actions" body={actionsBody} style={{ width: 180 }} />
                    </DataTable>
                </Card>
            </div>

            <Dialog
                visible={!!editing}
                header={editing ? `Edit ${editing.username}` : 'Edit user'}
                onHide={closeEdit}
                style={{ width: 480 }}
                modal
            >
                <div className="grid">
                    <div className="col-12">
                        <label className="block mb-1">Full name *</label>
                        <InputText value={editForm.fullName} onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })} className="w-full" />
                    </div>
                    <div className="col-12">
                        <label className="block mb-1">Email</label>
                        <InputText value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="w-full" />
                    </div>
                    <div className="col-12 md:col-6">
                        <label className="block mb-1">Role *</label>
                        <Dropdown value={editForm.role} options={ROLE_FORM_OPTIONS} onChange={(e) => setEditForm({ ...editForm, role: e.value })} className="w-full" />
                    </div>
                    <div className="col-12 md:col-6">
                        <label className="block mb-1">Phone</label>
                        <InputText value={editForm.phoneNumber} onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })} className="w-full" />
                    </div>
                    <div className="col-12 md:col-6">
                        <label className="block mb-1">License #</label>
                        <InputText value={editForm.licenseNumber} onChange={(e) => setEditForm({ ...editForm, licenseNumber: e.target.value })} className="w-full" />
                    </div>
                    <div className="col-12 md:col-6">
                        <label className="block mb-1">License expiry</label>
                        <Calendar
                            value={editForm.licenseExpiryDate}
                            onChange={(e) => setEditForm({ ...editForm, licenseExpiryDate: (e.value as Date) ?? null })}
                            dateFormat="yy-mm-dd"
                            showIcon
                            className="w-full"
                        />
                    </div>
                    <div className="col-12 flex justify-content-end gap-2 mt-3">
                        <Button label="Cancel" outlined onClick={closeEdit} disabled={editSaving} />
                        <Button label="Save" icon="pi pi-save" onClick={saveEdit} loading={editSaving} />
                    </div>
                </div>
            </Dialog>

            <Dialog
                visible={!!resetTarget}
                header={resetTarget ? `Reset password — ${resetTarget.username}` : 'Reset password'}
                onHide={() => { setResetTarget(null); setNewPassword(''); }}
                style={{ width: 420 }}
                modal
            >
                <div className="grid">
                    <div className="col-12">
                        <label className="block mb-1">New password *</label>
                        <InputText type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full" />
                        <small className="text-color-secondary">Min 8 characters, include a letter and a digit.</small>
                    </div>
                    <div className="col-12 flex justify-content-end gap-2 mt-3">
                        <Button label="Cancel" outlined onClick={() => { setResetTarget(null); setNewPassword(''); }} disabled={resetSaving} />
                        <Button label="Reset password" icon="pi pi-key" onClick={submitReset} loading={resetSaving} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default AdminUsersPage;
