'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { HrService } from '@/libs/blue_prints/HrService';
import { HrLeaveType } from '@/types/hr/hr';

const EMPTY = {
    leaveTypeId: undefined as number | undefined,
    leaveCode: '',
    leaveName: '',
    description: '',
    isPaid: true,
    maxDaysPerYear: null as number | null,
    canCarryForward: false,
    maxCarryForwardDays: null as number | null,
    requiresApproval: true,
    colorCode: '#10B981',
    isActive: true
};

const LeaveTypesPage = () => {
    const [rows, setRows] = useState<HrLeaveType[]>([]);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [crud, setCrud] = useState<'save' | 'update'>('save');
    const [form, setForm] = useState({ ...EMPTY });
    const toast = useRef<Toast>(null);

    const load = async () => { setLoading(true); const r = await HrService.listLeaveTypes(); setRows(Array.isArray(r.operatedData) ? r.operatedData : []); setLoading(false); };
    useEffect(() => { document.title = 'HR · Leave Types'; void load(); }, []);

    const openCreate = () => { setCrud('save'); setForm({ ...EMPTY }); setVisible(true); };
    const openEdit = (r: HrLeaveType) => {
        setCrud('update');
        setForm({
            leaveTypeId: r.leaveTypeId,
            leaveCode: r.leaveCode,
            leaveName: r.leaveName,
            description: r.description ?? '',
            isPaid: r.isPaid === 1,
            maxDaysPerYear: r.maxDaysPerYear,
            canCarryForward: r.canCarryForward === 1,
            maxCarryForwardDays: r.maxCarryForwardDays,
            requiresApproval: r.requiresApproval === 1,
            colorCode: r.colorCode ?? '#10B981',
            isActive: r.isActive === 1
        });
        setVisible(true);
    };

    const save = async () => {
        if (!form.leaveCode.trim() || !form.leaveName.trim()) { toast.current?.show({ severity: 'warn', summary: 'Missing fields' }); return; }
        const r = await HrService.upsertLeaveType({ ...form, crudType: crud });
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
                <Card title="Leave Types" subTitle="Leave entitlement catalogue">
                    <div className="flex justify-content-end mb-3"><Button label="New Type" icon="pi pi-plus" onClick={openCreate} /></div>
                    <DataTable value={rows} loading={loading} paginator rows={15} dataKey="leaveTypeId" stripedRows responsiveLayout="scroll">
                        <Column field="leaveCode" header="Code" sortable />
                        <Column field="leaveName" header="Name" sortable />
                        <Column field="maxDaysPerYear" header="Max/Year" />
                        <Column header="Paid" body={(r: HrLeaveType) => <Tag severity={r.isPaid ? 'success' : 'warning'} value={r.isPaid ? 'Paid' : 'Unpaid'} />} />
                        <Column header="Carry Forward" body={(r: HrLeaveType) => (r.canCarryForward ? `Up to ${r.maxCarryForwardDays ?? '∞'}` : '—')} />
                        <Column header="Approval" body={(r: HrLeaveType) => (r.requiresApproval ? 'Required' : 'Auto')} />
                        <Column header="Color" body={(r: HrLeaveType) => <span style={{ display: 'inline-block', width: 18, height: 18, borderRadius: 4, background: r.colorCode ?? '#999' }} />} />
                        <Column header="Active" body={(r: HrLeaveType) => <Tag severity={r.isActive ? 'success' : 'danger'} value={r.isActive ? 'Active' : 'Inactive'} />} />
                        <Column header="Actions" body={(r: HrLeaveType) => <Button icon="pi pi-pencil" rounded text onClick={() => openEdit(r)} />} />
                    </DataTable>
                </Card>
            </div>

            <Dialog header={crud === 'save' ? 'New Leave Type' : 'Edit Leave Type'} visible={visible} style={{ width: '560px' }} modal onHide={() => setVisible(false)}>
                <div className="grid pt-3">
                    <div className="col-12 md:col-6"><label className="block mb-1">Code *</label><InputText className="w-full" value={form.leaveCode} onChange={(e) => setForm({ ...form, leaveCode: e.target.value })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Name *</label><InputText className="w-full" value={form.leaveName} onChange={(e) => setForm({ ...form, leaveName: e.target.value })} /></div>
                    <div className="col-12"><label className="block mb-1">Description</label><InputTextarea className="w-full" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Max Days/Year</label><InputNumber className="w-full" value={form.maxDaysPerYear} onValueChange={(e) => setForm({ ...form, maxDaysPerYear: e.value ?? null })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Max Carry Forward</label><InputNumber className="w-full" value={form.maxCarryForwardDays} onValueChange={(e) => setForm({ ...form, maxCarryForwardDays: e.value ?? null })} disabled={!form.canCarryForward} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Color</label><InputText className="w-full" type="color" value={form.colorCode} onChange={(e) => setForm({ ...form, colorCode: e.target.value })} /></div>
                    <div className="col-12 md:col-6 flex align-items-end gap-2"><InputSwitch checked={form.isPaid} onChange={(e) => setForm({ ...form, isPaid: !!e.value })} /><span>Paid</span></div>
                    <div className="col-12 md:col-6 flex align-items-center gap-2"><InputSwitch checked={form.canCarryForward} onChange={(e) => setForm({ ...form, canCarryForward: !!e.value })} /><span>Can Carry Forward</span></div>
                    <div className="col-12 md:col-6 flex align-items-center gap-2"><InputSwitch checked={form.requiresApproval} onChange={(e) => setForm({ ...form, requiresApproval: !!e.value })} /><span>Requires Approval</span></div>
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

export default LeaveTypesPage;
