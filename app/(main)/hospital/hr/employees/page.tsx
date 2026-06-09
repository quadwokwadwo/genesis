'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputSwitch } from 'primereact/inputswitch';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { HrService } from '@/libs/blue_prints/HrService';
import { HrDepartment, HrEmployee, HrEmploymentStatus, HrEmploymentType, HrPosition } from '@/types/hr/hr';
import UsersModel from '@/libs/blue_prints/UsersModel';

const EMP_TYPES: HrEmploymentType[] = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'VISITING', 'INTERN', 'RESIDENT', 'CONSULTANT'];
const STATUSES: HrEmploymentStatus[] = ['ACTIVE', 'ON_LEAVE', 'SUSPENDED', 'RESIGNED', 'TERMINATED', 'RETIRED'];

const EMPTY = {
    employeeId: undefined as number | undefined,
    userId: null as number | null,
    employeeNumber: '',
    deptId: null as number | null,
    positionId: null as number | null,
    employmentType: 'FULL_TIME' as HrEmploymentType,
    reportingToUserId: null as number | null,
    joiningDate: new Date(),
    confirmationDate: null as Date | null,
    bankName: '',
    bankAccountNumber: '',
    bankBranch: '',
    taxIdentificationNumber: '',
    socialSecurityNumber: '',
    nationalId: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    status: 'ACTIVE' as HrEmploymentStatus,
    isActive: true
};

const EmployeesPage = () => {
    const [rows, setRows] = useState<HrEmployee[]>([]);
    const [depts, setDepts] = useState<HrDepartment[]>([]);
    const [positions, setPositions] = useState<HrPosition[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [crud, setCrud] = useState<'save' | 'update'>('save');
    const [form, setForm] = useState({ ...EMPTY });
    const toast = useRef<Toast>(null);

    const load = async () => {
        setLoading(true);
        const [e, d, p] = await Promise.all([HrService.listEmployees(), HrService.listDepartments(), HrService.listPositions()]);
        setRows(Array.isArray(e.operatedData) ? e.operatedData : []);
        setDepts(Array.isArray(d.operatedData) ? d.operatedData : []);
        setPositions(Array.isArray(p.operatedData) ? p.operatedData : []);
        setLoading(false);
    };

    useEffect(() => {
        document.title = 'HR · Employees';
        void load();
        void new UsersModel().getUserList().then((u: any) => setUsers(Array.isArray(u?.operatedData) ? u.operatedData : []));
    }, []);

    const openCreate = () => { setCrud('save'); setForm({ ...EMPTY, joiningDate: new Date() }); setVisible(true); };
    const openEdit = (r: HrEmployee) => {
        setCrud('update');
        setForm({
            employeeId: r.employeeId,
            userId: r.userId,
            employeeNumber: r.employeeNumber,
            deptId: r.deptId,
            positionId: r.positionId,
            employmentType: r.employmentType,
            reportingToUserId: r.reportingToUserId,
            joiningDate: r.joiningDate ? new Date(r.joiningDate) : new Date(),
            confirmationDate: r.confirmationDate ? new Date(r.confirmationDate) : null,
            bankName: r.bankName ?? '',
            bankAccountNumber: r.bankAccountNumber ?? '',
            bankBranch: r.bankBranch ?? '',
            taxIdentificationNumber: r.taxIdentificationNumber ?? '',
            socialSecurityNumber: r.socialSecurityNumber ?? '',
            nationalId: r.nationalId ?? '',
            emergencyContactName: r.emergencyContactName ?? '',
            emergencyContactPhone: r.emergencyContactPhone ?? '',
            status: r.status,
            isActive: r.isActive === 1
        });
        setVisible(true);
    };

    const save = async () => {
        if (!form.userId || !form.employeeNumber.trim()) {
            toast.current?.show({ severity: 'warn', summary: 'Missing fields', detail: 'User and employee number are required.' });
            return;
        }
        const r = await HrService.upsertEmployee({
            ...form,
            crudType: crud,
            employeeNumber: form.employeeNumber.trim(),
            joiningDate: form.joiningDate?.toISOString().slice(0, 10),
            confirmationDate: form.confirmationDate ? form.confirmationDate.toISOString().slice(0, 10) : null
        });
        const op = Number(r.operationalStatus);
        if (op === 3) { toast.current?.show({ severity: 'warn', summary: 'Duplicate', detail: 'User or employee number already linked.' }); return; }
        if (op !== 1 && op !== 2) { toast.current?.show({ severity: 'error', summary: 'Failed' }); return; }
        toast.current?.show({ severity: 'success', summary: 'Saved' });
        setVisible(false);
        await load();
    };

    const userOpts = useMemo(
        () => users.map((u: any) => ({ label: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.username || `User ${u.userId}`, value: u.userId })),
        [users]
    );
    const userOptsWithNone = useMemo(() => [{ label: '— None —', value: null }, ...userOpts], [userOpts]);
    const deptOpts = useMemo(() => [{ label: '— None —', value: null }, ...depts.map((d) => ({ label: d.deptName, value: d.deptId }))], [depts]);
    const positionOpts = useMemo(() => [{ label: '— None —', value: null }, ...positions.map((p) => ({ label: p.positionName, value: p.positionId }))], [positions]);

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12">
                <Card title="Employees" subTitle="HR roster — every record links to a system user">
                    <div className="flex justify-content-end mb-3">
                        <Button label="New Employee" icon="pi pi-plus" onClick={openCreate} />
                    </div>
                    <DataTable value={rows} loading={loading} paginator rows={15} dataKey="employeeId" stripedRows responsiveLayout="scroll">
                        <Column field="employeeNumber" header="Emp #" sortable />
                        <Column field="fullName" header="Name" sortable />
                        <Column field="deptName" header="Department" />
                        <Column field="positionName" header="Position" />
                        <Column field="employmentType" header="Type" />
                        <Column header="Status" body={(r: HrEmployee) => <Tag severity={r.status === 'ACTIVE' ? 'success' : r.status === 'ON_LEAVE' ? 'warning' : 'danger'} value={r.status} />} />
                        <Column field="joiningDate" header="Joined" body={(r: HrEmployee) => (r.joiningDate ? new Date(r.joiningDate).toLocaleDateString() : '')} />
                        <Column header="Actions" body={(r: HrEmployee) => <Button icon="pi pi-pencil" rounded text onClick={() => openEdit(r)} />} />
                    </DataTable>
                </Card>
            </div>

            <Dialog header={crud === 'save' ? 'New Employee' : 'Edit Employee'} visible={visible} style={{ width: '720px' }} modal onHide={() => setVisible(false)}>
                <div className="grid pt-3">
                    <div className="col-12 md:col-6"><label className="block mb-1">User *</label><Dropdown className="w-full" options={userOpts} value={form.userId} onChange={(e) => setForm({ ...form, userId: e.value })} placeholder="Select user" filter disabled={crud === 'update'} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Employee # *</label><InputText className="w-full" value={form.employeeNumber} onChange={(e) => setForm({ ...form, employeeNumber: e.target.value })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Department</label><Dropdown className="w-full" options={deptOpts} value={form.deptId} onChange={(e) => setForm({ ...form, deptId: e.value })} filter /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Position</label><Dropdown className="w-full" options={positionOpts} value={form.positionId} onChange={(e) => setForm({ ...form, positionId: e.value })} filter /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Type</label><Dropdown className="w-full" options={EMP_TYPES.map((t) => ({ label: t, value: t }))} value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.value })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Status</label><Dropdown className="w-full" options={STATUSES.map((t) => ({ label: t, value: t }))} value={form.status} onChange={(e) => setForm({ ...form, status: e.value })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Reports To</label><Dropdown className="w-full" options={userOptsWithNone} value={form.reportingToUserId} onChange={(e) => setForm({ ...form, reportingToUserId: e.value })} filter /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Joining Date *</label><Calendar className="w-full" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: (e.value as Date) ?? new Date() })} dateFormat="yy-mm-dd" /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Confirmation Date</label><Calendar className="w-full" value={form.confirmationDate} onChange={(e) => setForm({ ...form, confirmationDate: (e.value as Date) ?? null })} dateFormat="yy-mm-dd" showButtonBar /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Bank Name</label><InputText className="w-full" value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Bank Account</label><InputText className="w-full" value={form.bankAccountNumber} onChange={(e) => setForm({ ...form, bankAccountNumber: e.target.value })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Bank Branch</label><InputText className="w-full" value={form.bankBranch} onChange={(e) => setForm({ ...form, bankBranch: e.target.value })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Tax ID (TIN)</label><InputText className="w-full" value={form.taxIdentificationNumber} onChange={(e) => setForm({ ...form, taxIdentificationNumber: e.target.value })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">SSNIT #</label><InputText className="w-full" value={form.socialSecurityNumber} onChange={(e) => setForm({ ...form, socialSecurityNumber: e.target.value })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">National ID</label><InputText className="w-full" value={form.nationalId} onChange={(e) => setForm({ ...form, nationalId: e.target.value })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Emergency Contact Name</label><InputText className="w-full" value={form.emergencyContactName} onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Emergency Contact Phone</label><InputText className="w-full" value={form.emergencyContactPhone} onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })} /></div>
                    <div className="col-12 flex align-items-center gap-2"><InputSwitch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: !!e.value })} /><span>Active</span></div>
                    <div className="col-12 flex justify-content-end gap-2 mt-2">
                        <Button label="Cancel" severity="secondary" outlined onClick={() => setVisible(false)} />
                        <Button label="Save" icon="pi pi-check" onClick={save} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default EmployeesPage;
