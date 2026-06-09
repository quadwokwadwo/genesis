'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { HrService } from '@/libs/blue_prints/HrService';
import { HrAttendance, HrAttendanceStatus, HrEmployee, HrShift } from '@/types/hr/hr';

const STATUSES: HrAttendanceStatus[] = ['PRESENT', 'ABSENT', 'HALF_DAY', 'ON_LEAVE', 'HOLIDAY', 'WEEK_OFF'];
const METHODS = ['BIOMETRIC', 'CARD', 'MANUAL', 'MOBILE', 'SYSTEM'];

const EMPTY = {
    attendanceId: undefined as number | undefined,
    userId: null as number | null,
    attendanceDate: new Date(),
    shiftId: null as number | null,
    clockInTime: null as Date | null,
    clockOutTime: null as Date | null,
    clockInMethod: 'MANUAL',
    clockOutMethod: null as string | null,
    status: 'PRESENT' as HrAttendanceStatus,
    remarks: '',
    regularizationReason: ''
};

const AttendancePage = () => {
    const [rows, setRows] = useState<HrAttendance[]>([]);
    const [shifts, setShifts] = useState<HrShift[]>([]);
    const [employees, setEmployees] = useState<HrEmployee[]>([]);
    const [range, setRange] = useState<Date[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [crud, setCrud] = useState<'save' | 'update'>('save');
    const [form, setForm] = useState({ ...EMPTY });
    const toast = useRef<Toast>(null);

    const load = async () => {
        setLoading(true);
        const filters: any = {};
        if (range && range[0]) filters.startDate = range[0].toISOString().slice(0, 10);
        if (range && range[1]) filters.endDate = range[1].toISOString().slice(0, 10);
        const [a, s, e] = await Promise.all([HrService.listAttendance(filters), HrService.listShifts(), HrService.listEmployees()]);
        setRows(Array.isArray(a.operatedData) ? a.operatedData : []);
        setShifts(Array.isArray(s.operatedData) ? s.operatedData : []);
        setEmployees(Array.isArray(e.operatedData) ? e.operatedData : []);
        setLoading(false);
    };
    useEffect(() => { document.title = 'HR · Attendance'; void load(); /* eslint-disable-next-line */ }, []);

    const openCreate = () => { setCrud('save'); setForm({ ...EMPTY, attendanceDate: new Date() }); setVisible(true); };
    const openEdit = (r: HrAttendance) => {
        setCrud('update');
        setForm({
            attendanceId: r.attendanceId,
            userId: r.userId,
            attendanceDate: r.attendanceDate ? new Date(r.attendanceDate) : new Date(),
            shiftId: r.shiftId,
            clockInTime: r.clockInTime ? new Date(r.clockInTime) : null,
            clockOutTime: r.clockOutTime ? new Date(r.clockOutTime) : null,
            clockInMethod: r.clockInMethod,
            clockOutMethod: r.clockOutMethod,
            status: r.status,
            remarks: r.remarks ?? '',
            regularizationReason: r.regularizationReason ?? ''
        });
        setVisible(true);
    };

    const save = async () => {
        if (!form.userId) { toast.current?.show({ severity: 'warn', summary: 'Missing fields', detail: 'User is required.' }); return; }
        const r = await HrService.upsertAttendance({
            ...form,
            crudType: crud,
            attendanceDate: form.attendanceDate.toISOString().slice(0, 10),
            clockInTime: form.clockInTime ? form.clockInTime.toISOString() : null,
            clockOutTime: form.clockOutTime ? form.clockOutTime.toISOString() : null
        });
        const op = Number(r.operationalStatus);
        if (op !== 1 && op !== 2) { toast.current?.show({ severity: 'error', summary: 'Failed' }); return; }
        toast.current?.show({ severity: 'success', summary: 'Saved' });
        setVisible(false);
        await load();
    };

    const userOpts = useMemo(() => employees.map((e) => ({ label: `${e.fullName} (${e.employeeNumber})`, value: e.userId })), [employees]);
    const shiftOpts = useMemo(() => [{ label: '— None —', value: null }, ...shifts.map((s) => ({ label: s.shiftName, value: s.shiftId }))], [shifts]);

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12">
                <Card title="Attendance" subTitle="Clock-in / clock-out records">
                    <div className="flex flex-wrap gap-2 justify-content-between align-items-end mb-3">
                        <div className="flex gap-2 align-items-end">
                            <div>
                                <label className="block mb-1">Date range</label>
                                <Calendar value={range as any} onChange={(e) => setRange(e.value as Date[])} selectionMode="range" readOnlyInput dateFormat="yy-mm-dd" showButtonBar />
                            </div>
                            <Button label="Apply" icon="pi pi-filter" outlined onClick={load} />
                        </div>
                        <Button label="New Record" icon="pi pi-plus" onClick={openCreate} />
                    </div>
                    <DataTable value={rows} loading={loading} paginator rows={20} dataKey="attendanceId" stripedRows responsiveLayout="scroll">
                        <Column field="attendanceDate" header="Date" sortable body={(r: HrAttendance) => new Date(r.attendanceDate).toLocaleDateString()} />
                        <Column field="userFullName" header="Staff" sortable />
                        <Column field="shiftName" header="Shift" />
                        <Column header="In" body={(r: HrAttendance) => (r.clockInTime ? new Date(r.clockInTime).toLocaleTimeString() : '—')} />
                        <Column header="Out" body={(r: HrAttendance) => (r.clockOutTime ? new Date(r.clockOutTime).toLocaleTimeString() : '—')} />
                        <Column field="workingHours" header="Hours" />
                        <Column field="overtimeHours" header="OT" />
                        <Column header="Status" body={(r: HrAttendance) => <Tag value={r.status} />} />
                        <Column header="Actions" body={(r: HrAttendance) => <Button icon="pi pi-pencil" rounded text onClick={() => openEdit(r)} />} />
                    </DataTable>
                </Card>
            </div>

            <Dialog header={crud === 'save' ? 'New Attendance' : 'Edit Attendance'} visible={visible} style={{ width: '560px' }} modal onHide={() => setVisible(false)}>
                <div className="grid pt-3">
                    <div className="col-12"><label className="block mb-1">Staff *</label><Dropdown className="w-full" options={userOpts} value={form.userId} onChange={(e) => setForm({ ...form, userId: e.value })} filter /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Date *</label><Calendar className="w-full" value={form.attendanceDate} onChange={(e) => setForm({ ...form, attendanceDate: (e.value as Date) ?? new Date() })} dateFormat="yy-mm-dd" /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Shift</label><Dropdown className="w-full" options={shiftOpts} value={form.shiftId} onChange={(e) => setForm({ ...form, shiftId: e.value })} filter /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Clock In</label><Calendar className="w-full" value={form.clockInTime} onChange={(e) => setForm({ ...form, clockInTime: (e.value as Date) ?? null })} showTime hourFormat="24" showButtonBar /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Clock Out</label><Calendar className="w-full" value={form.clockOutTime} onChange={(e) => setForm({ ...form, clockOutTime: (e.value as Date) ?? null })} showTime hourFormat="24" showButtonBar /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">In Method</label><Dropdown className="w-full" options={METHODS.map((m) => ({ label: m, value: m }))} value={form.clockInMethod} onChange={(e) => setForm({ ...form, clockInMethod: e.value })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Out Method</label><Dropdown className="w-full" options={[{ label: '— None —', value: null }, ...METHODS.map((m) => ({ label: m, value: m }))]} value={form.clockOutMethod} onChange={(e) => setForm({ ...form, clockOutMethod: e.value })} /></div>
                    <div className="col-12"><label className="block mb-1">Status</label><Dropdown className="w-full" options={STATUSES.map((s) => ({ label: s, value: s }))} value={form.status} onChange={(e) => setForm({ ...form, status: e.value })} /></div>
                    <div className="col-12"><label className="block mb-1">Remarks</label><InputText className="w-full" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} /></div>
                    <div className="col-12"><label className="block mb-1">Regularization Reason</label><InputTextarea className="w-full" rows={2} value={form.regularizationReason} onChange={(e) => setForm({ ...form, regularizationReason: e.target.value })} /></div>
                    <div className="col-12 flex justify-content-end gap-2 mt-2">
                        <Button label="Cancel" severity="secondary" outlined onClick={() => setVisible(false)} />
                        <Button label="Save" icon="pi pi-check" onClick={save} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default AttendancePage;
