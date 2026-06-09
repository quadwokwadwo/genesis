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
import { HrEmployee, HrSchedule, HrScheduleStatus, HrShift } from '@/types/hr/hr';

const STATUSES: HrScheduleStatus[] = ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'ABSENT', 'ON_LEAVE'];

const EMPTY = {
    scheduleId: undefined as number | undefined,
    userId: null as number | null,
    scheduleDate: new Date(),
    shiftId: null as number | null,
    actualStartTime: '',
    actualEndTime: '',
    status: 'SCHEDULED' as HrScheduleStatus,
    notes: ''
};

const SchedulesPage = () => {
    const [rows, setRows] = useState<HrSchedule[]>([]);
    const [shifts, setShifts] = useState<HrShift[]>([]);
    const [employees, setEmployees] = useState<HrEmployee[]>([]);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [crud, setCrud] = useState<'save' | 'update'>('save');
    const [form, setForm] = useState({ ...EMPTY });
    const [range, setRange] = useState<Date[] | null>(null);
    const toast = useRef<Toast>(null);

    const load = async () => {
        setLoading(true);
        try {
            const filters: any = {};
            if (range && range[0]) filters.startDate = range[0].toISOString().slice(0, 10);
            if (range && range[1]) filters.endDate = range[1].toISOString().slice(0, 10);
            const [sRes, shRes, eRes] = await Promise.allSettled([HrService.listSchedules(filters), HrService.listShifts(), HrService.listEmployees()]);
            if (sRes.status === 'fulfilled') setRows(Array.isArray(sRes.value.operatedData) ? sRes.value.operatedData : []);
            if (shRes.status === 'fulfilled') setShifts(Array.isArray(shRes.value.operatedData) ? shRes.value.operatedData : []);
            if (eRes.status === 'fulfilled') setEmployees(Array.isArray(eRes.value.operatedData) ? eRes.value.operatedData : []);
            else toast.current?.show({ severity: 'error', summary: 'Failed to load employees', detail: 'Could not retrieve staff list.' });
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Load error', detail: 'Failed to load schedule data.' });
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { document.title = 'HR · Schedules'; void load(); /* eslint-disable-next-line */ }, []);

    const openCreate = () => { setCrud('save'); setForm({ ...EMPTY, scheduleDate: new Date() }); setVisible(true); };
    const openEdit = (r: HrSchedule) => {
        setCrud('update');
        setForm({
            scheduleId: r.scheduleId,
            userId: r.userId,
            scheduleDate: r.scheduleDate ? new Date(r.scheduleDate) : new Date(),
            shiftId: r.shiftId,
            actualStartTime: r.actualStartTime ?? '',
            actualEndTime: r.actualEndTime ?? '',
            status: r.status,
            notes: r.notes ?? ''
        });
        setVisible(true);
    };

    const save = async () => {
        if (!form.userId || !form.shiftId) {
            toast.current?.show({ severity: 'warn', summary: 'Missing fields', detail: 'User and shift are required.' });
            return;
        }
        const r = await HrService.upsertSchedule({
            crudType: crud,
            scheduleId: form.scheduleId,
            userId: form.userId,
            scheduleDate: form.scheduleDate.toISOString().slice(0, 10),
            shiftId: form.shiftId,
            actualStartTime: form.actualStartTime || null,
            actualEndTime: form.actualEndTime || null,
            status: form.status,
            notes: form.notes
        });
        const op = Number(r.operationalStatus);
        if (op === 3) { toast.current?.show({ severity: 'warn', summary: 'Duplicate', detail: 'Schedule already exists for this user/date.' }); return; }
        if (op !== 1 && op !== 2) { toast.current?.show({ severity: 'error', summary: 'Failed' }); return; }
        toast.current?.show({ severity: 'success', summary: 'Saved' });
        setVisible(false);
        await load();
    };
    console.log(employees);
    const userOpts = useMemo(() => employees.map((e) => ({ label: `${e.fullName} (${e.employeeNumber})`, value: e.userId })), [employees]);
    const shiftOpts = useMemo(() => shifts.map((s) => ({ label: `${s.shiftName} (${s.startTime?.slice(0, 5)}-${s.endTime?.slice(0, 5)})`, value: s.shiftId })), [shifts]);

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12">
                <Card title="Schedules" subTitle="Staff shift assignments">
                    <div className="flex flex-wrap gap-2 justify-content-between align-items-end mb-3">
                        <div className="flex gap-2 align-items-end">
                            <div>
                                <label className="block mb-1">Date range</label>
                                <Calendar value={range as any} onChange={(e) => setRange(e.value as Date[])} selectionMode="range" readOnlyInput dateFormat="yy-mm-dd" showButtonBar />
                            </div>
                            <Button label="Apply" icon="pi pi-filter" outlined onClick={load} />
                        </div>
                        <Button label="New Schedule" icon="pi pi-plus" onClick={openCreate} />
                    </div>
                    <DataTable value={rows} loading={loading} paginator rows={20} dataKey="scheduleId" stripedRows responsiveLayout="scroll">
                        <Column field="scheduleDate" header="Date" sortable body={(r: HrSchedule) => (r.scheduleDate ? new Date(r.scheduleDate).toLocaleDateString() : '')} />
                        <Column field="userFullName" header="Staff" sortable />
                        <Column field="shiftName" header="Shift" />
                        <Column header="Time" body={(r: HrSchedule) => `${r.startTime?.slice(0, 5)} - ${r.endTime?.slice(0, 5)}`} />
                        <Column header="Status" body={(r: HrSchedule) => <Tag value={r.status} />} />
                        <Column header="Actions" body={(r: HrSchedule) => <Button icon="pi pi-pencil" rounded text onClick={() => openEdit(r)} />} />
                    </DataTable>
                </Card>
            </div>

            <Dialog header={crud === 'save' ? 'New Schedule' : 'Edit Schedule'} visible={visible} style={{ width: '520px' }} modal onHide={() => setVisible(false)}>
                <div className="grid pt-3">
                    <div className="col-12"><label className="block mb-1">Staff *</label><Dropdown className="w-full" options={userOpts} value={form.userId} onChange={(e) => setForm({ ...form, userId: e.value })} filter placeholder="Select employee" /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Date *</label><Calendar className="w-full" value={form.scheduleDate} onChange={(e) => setForm({ ...form, scheduleDate: (e.value as Date) ?? new Date() })} dateFormat="yy-mm-dd" /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Shift *</label><Dropdown className="w-full" options={shiftOpts} value={form.shiftId} onChange={(e) => setForm({ ...form, shiftId: e.value })} filter /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Actual Start</label><InputText className="w-full" type="time" value={form.actualStartTime} onChange={(e) => setForm({ ...form, actualStartTime: e.target.value })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Actual End</label><InputText className="w-full" type="time" value={form.actualEndTime} onChange={(e) => setForm({ ...form, actualEndTime: e.target.value })} /></div>
                    <div className="col-12"><label className="block mb-1">Status</label><Dropdown className="w-full" options={STATUSES.map((t) => ({ label: t, value: t }))} value={form.status} onChange={(e) => setForm({ ...form, status: e.value })} /></div>
                    <div className="col-12"><label className="block mb-1">Notes</label><InputTextarea className="w-full" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
                    <div className="col-12 flex justify-content-end gap-2 mt-2">
                        <Button label="Cancel" severity="secondary" outlined onClick={() => setVisible(false)} />
                        <Button label="Save" icon="pi pi-check" onClick={save} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default SchedulesPage;
