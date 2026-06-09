'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { HrService } from '@/libs/blue_prints/HrService';
import { HrShift, HrShiftType } from '@/types/hr/hr';

const TYPES: HrShiftType[] = ['REGULAR', 'NIGHT', 'SPLIT', 'FLEXIBLE', 'ON_CALL'];

const EMPTY = {
    shiftId: undefined as number | undefined,
    shiftCode: '',
    shiftName: '',
    startTime: '08:00',
    endTime: '17:00',
    breakDurationMinutes: 60,
    shiftType: 'REGULAR' as HrShiftType,
    colorCode: '#3B82F6',
    isActive: true
};

const ShiftsPage = () => {
    const [rows, setRows] = useState<HrShift[]>([]);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [crud, setCrud] = useState<'save' | 'update'>('save');
    const [form, setForm] = useState({ ...EMPTY });
    const toast = useRef<Toast>(null);

    const load = async () => {
        setLoading(true);
        const r = await HrService.listShifts();
        setRows(Array.isArray(r.operatedData) ? r.operatedData : []);
        setLoading(false);
    };
    useEffect(() => { document.title = 'HR · Shifts'; void load(); }, []);

    const openCreate = () => { setCrud('save'); setForm({ ...EMPTY }); setVisible(true); };
    const openEdit = (r: HrShift) => {
        setCrud('update');
        setForm({
            shiftId: r.shiftId,
            shiftCode: r.shiftCode,
            shiftName: r.shiftName,
            startTime: r.startTime?.slice(0, 5) ?? '08:00',
            endTime: r.endTime?.slice(0, 5) ?? '17:00',
            breakDurationMinutes: r.breakDurationMinutes ?? 0,
            shiftType: r.shiftType,
            colorCode: r.colorCode ?? '#3B82F6',
            isActive: r.isActive === 1
        });
        setVisible(true);
    };

    const save = async () => {
        if (!form.shiftCode.trim() || !form.shiftName.trim()) {
            toast.current?.show({ severity: 'warn', summary: 'Missing fields', detail: 'Code and name required.' });
            return;
        }
        const r = await HrService.upsertShift({ ...form, crudType: crud });
        const op = Number(r.operationalStatus);
        if (op === 3) { toast.current?.show({ severity: 'warn', summary: 'Duplicate' }); return; }
        if (op !== 1 && op !== 2) { toast.current?.show({ severity: 'error', summary: 'Failed' }); return; }
        toast.current?.show({ severity: 'success', summary: 'Saved' });
        setVisible(false);
        await load();
    };

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12">
                <Card title="Shifts" subTitle="Working-hour templates">
                    <div className="flex justify-content-end mb-3">
                        <Button label="New Shift" icon="pi pi-plus" onClick={openCreate} />
                    </div>
                    <DataTable value={rows} loading={loading} paginator rows={15} dataKey="shiftId" stripedRows responsiveLayout="scroll">
                        <Column field="shiftCode" header="Code" sortable />
                        <Column field="shiftName" header="Name" sortable />
                        <Column field="startTime" header="Start" body={(r: HrShift) => r.startTime?.slice(0, 5)} />
                        <Column field="endTime" header="End" body={(r: HrShift) => r.endTime?.slice(0, 5)} />
                        <Column field="totalMinutes" header="Total (min)" sortable />
                        <Column field="breakDurationMinutes" header="Break (min)" />
                        <Column field="shiftType" header="Type" />
                        <Column header="Color" body={(r: HrShift) => <span style={{ display: 'inline-block', width: 18, height: 18, borderRadius: 4, background: r.colorCode ?? '#999' }} />} />
                        <Column header="Active" body={(r: HrShift) => <Tag severity={r.isActive ? 'success' : 'danger'} value={r.isActive ? 'Active' : 'Inactive'} />} />
                        <Column header="Actions" body={(r: HrShift) => <Button icon="pi pi-pencil" rounded text onClick={() => openEdit(r)} />} />
                    </DataTable>
                </Card>
            </div>

            <Dialog header={crud === 'save' ? 'New Shift' : 'Edit Shift'} visible={visible} style={{ width: '520px' }} modal onHide={() => setVisible(false)}>
                <div className="grid pt-3">
                    <div className="col-12 md:col-6"><label className="block mb-1">Code *</label><InputText className="w-full" value={form.shiftCode} onChange={(e) => setForm({ ...form, shiftCode: e.target.value })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Name *</label><InputText className="w-full" value={form.shiftName} onChange={(e) => setForm({ ...form, shiftName: e.target.value })} /></div>
                    <div className="col-6 md:col-3"><label className="block mb-1">Start</label><InputText className="w-full" type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} /></div>
                    <div className="col-6 md:col-3"><label className="block mb-1">End</label><InputText className="w-full" type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} /></div>
                    <div className="col-6 md:col-3"><label className="block mb-1">Break (min)</label><InputNumber className="w-full" value={form.breakDurationMinutes} onValueChange={(e) => setForm({ ...form, breakDurationMinutes: e.value ?? 0 })} /></div>
                    <div className="col-6 md:col-3"><label className="block mb-1">Color</label><InputText className="w-full" type="color" value={form.colorCode} onChange={(e) => setForm({ ...form, colorCode: e.target.value })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Type</label><Dropdown className="w-full" options={TYPES.map((t) => ({ label: t, value: t }))} value={form.shiftType} onChange={(e) => setForm({ ...form, shiftType: e.value })} /></div>
                    <div className="col-12 md:col-6 flex align-items-end gap-2"><InputSwitch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: !!e.value })} /><span>Active</span></div>
                    <div className="col-12 flex justify-content-end gap-2 mt-2">
                        <Button label="Cancel" severity="secondary" outlined onClick={() => setVisible(false)} />
                        <Button label="Save" icon="pi pi-check" onClick={save} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default ShiftsPage;
