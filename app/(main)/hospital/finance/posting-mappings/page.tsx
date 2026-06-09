'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { FinanceService } from '@/libs/blue_prints/FinanceService';
import { FinancePostingMapping, FinancePostingMappingLine, FinancePostingLog, FinanceGlAccount } from '@/types/finance/finance';

const ENTRY_TYPES = ['DEBIT', 'CREDIT'].map((v) => ({ label: v, value: v }));
const ACCOUNT_SOURCES = ['FIXED', 'AR', 'AP', 'INVENTORY', 'BANK', 'PAYMENT_METHOD', 'REVENUE', 'EXPENSE', 'COGS', 'DISCOUNT', 'DEPOSIT_LIABILITY'].map((v) => ({ label: v, value: v }));
const AMOUNT_SOURCES = ['TRANSACTION_AMOUNT', 'COST_AMOUNT', 'TAX_AMOUNT', 'DISCOUNT_AMOUNT', 'OTHER_AMOUNT'].map((v) => ({ label: v, value: v }));

type LineForm = { mappingLineId?: number; sequence: number; entryType: 'DEBIT' | 'CREDIT'; accountSource: string; fixedAccountId: number | null; amountSource: any; description: string };
const EMPTY_LINE: LineForm = { sequence: 1, entryType: 'DEBIT', accountSource: 'FIXED', fixedAccountId: null, amountSource: 'TRANSACTION_AMOUNT', description: '' };
const EMPTY_MAPPING = { mappingId: undefined as number | undefined, eventType: '', description: '', isActive: true };

const PostingMappingsPage = () => {
    const toast = useRef<Toast>(null);
    const [rows, setRows] = useState<FinancePostingMapping[]>([]);
    const [logs, setLogs] = useState<FinancePostingLog[]>([]);
    const [accts, setAccts] = useState<FinanceGlAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [crud, setCrud] = useState<'save' | 'update'>('save');
    const [form, setForm] = useState({ ...EMPTY_MAPPING });
    const [lines, setLines] = useState<LineForm[]>([]);

    const load = async () => {
        setLoading(true);
        const r = await FinanceService.listPostingMappings();
        setRows(Array.isArray(r.operatedData) ? r.operatedData : []);
        setLoading(false);
        const l = await FinanceService.listPostingLog();
        setLogs(Array.isArray(l.operatedData) ? l.operatedData : []);
    };

    useEffect(() => {
        document.title = 'Finance · Posting Mappings';
        void load();
        void FinanceService.listGlAccounts({ allowPosting: 1, isActive: 1 }).then((r) => setAccts(Array.isArray(r.operatedData) ? r.operatedData : []));
    }, []);

    const acctOpts = useMemo(() => [{ label: '— Resolved at runtime —', value: null }, ...accts.map((a) => ({ label: `${a.accountCode} · ${a.name}`, value: a.accountId }))], [accts]);

    const openEdit = async (r: FinancePostingMapping) => {
        setCrud('update');
        setForm({ mappingId: r.mappingId, eventType: r.eventType, description: r.description ?? '', isActive: r.isActive === 1 });
        const lr = await FinanceService.listPostingMappingLines(r.mappingId);
        const ll = Array.isArray(lr.operatedData) ? lr.operatedData : [];
        setLines(ll.map((x: FinancePostingMappingLine) => ({ mappingLineId: x.mappingLineId, sequence: x.sequence, entryType: x.entryType, accountSource: x.accountSource, fixedAccountId: x.fixedAccountId, amountSource: x.amountSource, description: x.description ?? '' })));
        setVisible(true);
    };

    const save = async () => {
        if (!form.eventType.trim()) { toast.current?.show({ severity: 'warn', summary: 'Missing', detail: 'Event type required.' }); return; }
        const r = await FinanceService.upsertPostingMapping({ crudType: crud, ...form, lines });
        const op = Number(r.operationalStatus);
        if (op === 3) { toast.current?.show({ severity: 'warn', summary: 'Duplicate', detail: 'Event type exists.' }); return; }
        if (op !== 1 && op !== 2) { toast.current?.show({ severity: 'error', summary: 'Failed', detail: 'Could not save.' }); return; }
        toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Mapping saved.' });
        setVisible(false); await load();
    };

    const sev = (s: string): 'success' | 'danger' | 'warning' => (s === 'SUCCESS' ? 'success' : s === 'FAILED' ? 'danger' : 'warning');

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12">
                <Card title="Posting Mappings">
                    <div className="flex justify-content-end mb-3"><Button label="New Mapping" icon="pi pi-plus" onClick={() => { setCrud('save'); setForm({ ...EMPTY_MAPPING }); setLines([{ ...EMPTY_LINE }]); setVisible(true); }} /></div>
                    <DataTable value={rows} loading={loading} paginator rows={10} dataKey="mappingId" stripedRows responsiveLayout="scroll">
                        <Column field="eventType" header="Event Type" sortable />
                        <Column field="description" header="Description" />
                        <Column field="lineCount" header="Lines" />
                        <Column header="Active" body={(r: FinancePostingMapping) => <Tag value={r.isActive ? 'Yes' : 'No'} severity={r.isActive ? 'success' : 'danger'} />} />
                        <Column header="Actions" body={(r: FinancePostingMapping) => <Button icon="pi pi-pencil" rounded text onClick={() => openEdit(r)} />} />
                    </DataTable>
                </Card>
            </div>

            <div className="col-12">
                <Card title="Posting Log">
                    <DataTable value={logs} paginator rows={15} dataKey="logId" stripedRows responsiveLayout="scroll">
                        <Column field="createdAt" header="Created" />
                        <Column field="eventType" header="Event" />
                        <Column field="referenceType" header="Ref Type" />
                        <Column field="referenceId" header="Ref Id" />
                        <Column field="journalNumber" header="Journal" />
                        <Column field="status" header="Status" body={(r: FinancePostingLog) => <Tag value={r.status} severity={sev(r.status)} />} />
                        <Column field="errorMessage" header="Error" />
                    </DataTable>
                </Card>
            </div>

            <Dialog header={crud === 'save' ? 'New Mapping' : 'Edit Mapping'} visible={visible} style={{ width: '960px' }} modal onHide={() => setVisible(false)}>
                <div className="grid pt-3">
                    <div className="col-12 md:col-5"><label className="block mb-1">Event Type *</label><InputText className="w-full" value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value })} disabled={crud === 'update'} /></div>
                    <div className="col-12 md:col-5"><label className="block mb-1">Description</label><InputText className="w-full" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                    <div className="col-12 md:col-2 flex align-items-end gap-2"><InputSwitch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: !!e.value })} /><span>Active</span></div>

                    <div className="col-12 mt-2">
                        <div className="flex justify-content-between mb-2"><h4 className="m-0">Lines</h4><Button label="Add Line" icon="pi pi-plus" size="small" onClick={() => setLines([...lines, { ...EMPTY_LINE, sequence: (lines.at(-1)?.sequence ?? 0) + 1 }])} /></div>
                        <table className="w-full"><thead><tr><th>Seq</th><th>Entry</th><th>Account Source</th><th>Fixed Account</th><th>Amount Source</th><th>Description</th><th></th></tr></thead>
                            <tbody>{lines.map((l, i) => (
                                <tr key={i}>
                                    <td style={{ width: 60 }}><InputNumber value={l.sequence} onValueChange={(e) => { const n = [...lines]; n[i] = { ...n[i], sequence: e.value ?? 1 }; setLines(n); }} showButtons={false} /></td>
                                    <td><Dropdown options={ENTRY_TYPES} value={l.entryType} onChange={(e) => { const n = [...lines]; n[i] = { ...n[i], entryType: e.value }; setLines(n); }} /></td>
                                    <td><Dropdown options={ACCOUNT_SOURCES} value={l.accountSource} onChange={(e) => { const n = [...lines]; n[i] = { ...n[i], accountSource: e.value, fixedAccountId: e.value === 'FIXED' ? n[i].fixedAccountId : null }; setLines(n); }} /></td>
                                    <td><Dropdown className="w-full" options={acctOpts} value={l.fixedAccountId} onChange={(e) => { const n = [...lines]; n[i] = { ...n[i], fixedAccountId: e.value }; setLines(n); }} filter disabled={l.accountSource !== 'FIXED'} /></td>
                                    <td><Dropdown options={AMOUNT_SOURCES} value={l.amountSource} onChange={(e) => { const n = [...lines]; n[i] = { ...n[i], amountSource: e.value }; setLines(n); }} /></td>
                                    <td><InputText value={l.description} onChange={(e) => { const n = [...lines]; n[i] = { ...n[i], description: e.target.value }; setLines(n); }} /></td>
                                    <td><Button icon="pi pi-trash" rounded text severity="danger" onClick={() => setLines(lines.filter((_, j) => j !== i))} /></td>
                                </tr>))}
                            </tbody>
                        </table>
                    </div>

                    <div className="col-12 flex justify-content-end gap-2 mt-3"><Button label="Cancel" severity="secondary" outlined onClick={() => setVisible(false)} /><Button label="Save" icon="pi pi-check" onClick={save} /></div>
                </div>
            </Dialog>
        </div>
    );
};

export default PostingMappingsPage;
