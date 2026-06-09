'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { HrService } from '@/libs/blue_prints/HrService';
import { HrEmployee, HrLeaveDecision, HrLeaveRequest, HrLeaveType } from '@/types/hr/hr';

const STATUS_OPTS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'WITHDRAWN'];

const EMPTY = {
    requestId: undefined as number | undefined,
    userId: null as number | null,
    leaveTypeId: null as number | null,
    startDate: new Date(),
    endDate: new Date(),
    totalDays: 1,
    isHalfDay: false,
    halfDayPeriod: null as 'FIRST_HALF' | 'SECOND_HALF' | null,
    reason: ''
};

const sevForStatus = (s: string) =>
    s === 'APPROVED' ? 'success' : s === 'PENDING' ? 'warning' : s === 'REJECTED' ? 'danger' : 'info';

const LeaveRequestsPage = () => {
    const [rows, setRows] = useState<HrLeaveRequest[]>([]);
    const [types, setTypes] = useState<HrLeaveType[]>([]);
    const [employees, setEmployees] = useState<HrEmployee[]>([]);
    const [filterStatus, setFilterStatus] = useState<string>('PENDING');
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [decideVisible, setDecideVisible] = useState(false);
    const [decideRow, setDecideRow] = useState<HrLeaveRequest | null>(null);
    const [decision, setDecision] = useState<HrLeaveDecision>('APPROVED');
    const [comments, setComments] = useState('');
    const [crud, setCrud] = useState<'save' | 'update'>('save');
    const [form, setForm] = useState({ ...EMPTY });
    const toast = useRef<Toast>(null);

    const load = async () => {
        setLoading(true);
        const filters: any = {};
        if (filterStatus && filterStatus !== 'ALL') filters.status = filterStatus;
        const [r, t, e] = await Promise.all([HrService.listLeaveRequests(filters), HrService.listLeaveTypes(), HrService.listEmployees()]);
        setRows(Array.isArray(r.operatedData) ? r.operatedData : []);
        setTypes(Array.isArray(t.operatedData) ? t.operatedData : []);
        setEmployees(Array.isArray(e.operatedData) ? e.operatedData : []);
        setLoading(false);
    };
    useEffect(() => { document.title = 'HR · Leave Requests'; void load(); /* eslint-disable-next-line */ }, [filterStatus]);

    const openCreate = () => { setCrud('save'); setForm({ ...EMPTY, startDate: new Date(), endDate: new Date() }); setVisible(true); };

    const save = async () => {
        if (!form.userId || !form.leaveTypeId) { toast.current?.show({ severity: 'warn', summary: 'Missing fields' }); return; }
        const r = await HrService.upsertLeaveRequest({
            crudType: crud,
            requestId: form.requestId,
            userId: form.userId,
            leaveTypeId: form.leaveTypeId,
            startDate: form.startDate.toISOString().slice(0, 10),
            endDate: form.endDate.toISOString().slice(0, 10),
            totalDays: form.totalDays,
            isHalfDay: form.isHalfDay,
            halfDayPeriod: form.halfDayPeriod,
            reason: form.reason
        });
        const op = Number(r.operationalStatus);
        if (op !== 1 && op !== 2) { toast.current?.show({ severity: 'error', summary: 'Failed' }); return; }
        toast.current?.show({ severity: 'success', summary: 'Saved' });
        setVisible(false);
        await load();
    };

    const openDecide = (row: HrLeaveRequest) => { setDecideRow(row); setDecision('APPROVED'); setComments(''); setDecideVisible(true); };
    const submitDecide = async () => {
        if (!decideRow) return;
        const r = await HrService.decideLeaveRequest({ requestId: decideRow.requestId, decision, comments });
        const op = Number(r.operationalStatus);
        if (op !== 1 && op !== 2) { toast.current?.show({ severity: 'error', summary: 'Failed' }); return; }
        toast.current?.show({ severity: 'success', summary: 'Decision recorded' });
        setDecideVisible(false);
        await load();
    };

    const userOpts = useMemo(() => employees.map((e) => ({ label: `${e.fullName} (${e.employeeNumber})`, value: e.userId })), [employees]);
    const typeOpts = useMemo(() => types.map((t) => ({ label: t.leaveName, value: t.leaveTypeId })), [types]);

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12">
                <Card title="Leave Requests" subTitle="Submit and approve leave">
                    <div className="flex justify-content-between align-items-end mb-3">
                        <div>
                            <label className="block mb-1">Status</label>
                            <Dropdown options={STATUS_OPTS.map((s) => ({ label: s, value: s }))} value={filterStatus} onChange={(e) => setFilterStatus(e.value)} />
                        </div>
                        <Button label="New Request" icon="pi pi-plus" onClick={openCreate} />
                    </div>
                    <DataTable value={rows} loading={loading} paginator rows={20} dataKey="requestId" stripedRows responsiveLayout="scroll">
                        <Column field="userFullName" header="Staff" sortable />
                        <Column field="leaveName" header="Type" />
                        <Column field="startDate" header="From" body={(r: HrLeaveRequest) => new Date(r.startDate).toLocaleDateString()} />
                        <Column field="endDate" header="To" body={(r: HrLeaveRequest) => new Date(r.endDate).toLocaleDateString()} />
                        <Column field="totalDays" header="Days" />
                        <Column header="Status" body={(r: HrLeaveRequest) => <Tag severity={sevForStatus(r.status) as any} value={r.status} />} />
                        <Column field="approverName" header="Approver" />
                        <Column header="Actions" body={(r: HrLeaveRequest) => (r.status === 'PENDING' ? <Button label="Decide" icon="pi pi-check-square" size="small" onClick={() => openDecide(r)} /> : null)} />
                    </DataTable>
                </Card>
            </div>

            <Dialog header={crud === 'save' ? 'New Leave Request' : 'Edit Leave Request'} visible={visible} style={{ width: '560px' }} modal onHide={() => setVisible(false)}>
                <div className="grid pt-3">
                    <div className="col-12"><label className="block mb-1">Staff *</label><Dropdown className="w-full" options={userOpts} value={form.userId} onChange={(e) => setForm({ ...form, userId: e.value })} filter /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Leave Type *</label><Dropdown className="w-full" options={typeOpts} value={form.leaveTypeId} onChange={(e) => setForm({ ...form, leaveTypeId: e.value })} filter /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Total Days</label><InputNumber className="w-full" value={form.totalDays} onValueChange={(e) => setForm({ ...form, totalDays: e.value ?? 1 })} minFractionDigits={0} maxFractionDigits={2} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Start *</label><Calendar className="w-full" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: (e.value as Date) ?? new Date() })} dateFormat="yy-mm-dd" /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">End *</label><Calendar className="w-full" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: (e.value as Date) ?? new Date() })} dateFormat="yy-mm-dd" /></div>
                    <div className="col-12"><label className="block mb-1">Reason</label><InputTextarea className="w-full" rows={3} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></div>
                    <div className="col-12 flex justify-content-end gap-2 mt-2">
                        <Button label="Cancel" severity="secondary" outlined onClick={() => setVisible(false)} />
                        <Button label="Submit" icon="pi pi-check" onClick={save} />
                    </div>
                </div>
            </Dialog>

            <Dialog header="Decide Leave Request" visible={decideVisible} style={{ width: '480px' }} modal onHide={() => setDecideVisible(false)}>
                <div className="flex flex-column gap-3 pt-3">
                    {decideRow && (
                        <div className="text-sm">
                            <div><strong>{decideRow.userFullName}</strong> — {decideRow.leaveName}</div>
                            <div className="text-color-secondary">{new Date(decideRow.startDate).toLocaleDateString()} → {new Date(decideRow.endDate).toLocaleDateString()} ({decideRow.totalDays} days)</div>
                            {decideRow.reason && <div className="mt-2"><em>{decideRow.reason}</em></div>}
                        </div>
                    )}
                    <div>
                        <label className="block mb-1">Decision</label>
                        <Dropdown className="w-full" options={[{ label: 'Approve', value: 'APPROVED' }, { label: 'Reject', value: 'REJECTED' }, { label: 'Cancel', value: 'CANCELLED' }, { label: 'Withdraw', value: 'WITHDRAWN' }]} value={decision} onChange={(e) => setDecision(e.value)} />
                    </div>
                    <div>
                        <label className="block mb-1">Comments</label>
                        <InputTextarea className="w-full" rows={3} value={comments} onChange={(e) => setComments(e.target.value)} />
                    </div>
                    <div className="flex justify-content-end gap-2">
                        <Button label="Cancel" severity="secondary" outlined onClick={() => setDecideVisible(false)} />
                        <Button label="Submit Decision" icon="pi pi-check" onClick={submitDecide} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default LeaveRequestsPage;
