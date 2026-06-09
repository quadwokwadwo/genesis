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
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { FinanceService, FinanceJournalService } from '@/libs/blue_prints/FinanceService';
import useUserData from '@/libs/hooks/useUserData';
import { FinanceJournalTemplate, FinanceJournalTemplateLine, FinanceGlAccount, FinanceCostCenter } from '@/types/finance/finance';

const toYmd = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : '');
const RECURRENCE = ['NONE', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'].map((v) => ({ label: v, value: v }));
const ENTRY_TYPES = ['DEBIT', 'CREDIT'].map((v) => ({ label: v, value: v }));

type LineForm = { templateLineId?: number; lineNumber: number; accountId: number | null; entryType: 'DEBIT' | 'CREDIT'; defaultAmount: number; memo: string; costCenterId: number | null };
const EMPTY_LINE: LineForm = { lineNumber: 1, accountId: null, entryType: 'DEBIT', defaultAmount: 0, memo: '', costCenterId: null };
const EMPTY_TPL = { templateId: undefined as number | undefined, templateName: '', description: '', recurrenceType: 'NONE' as FinanceJournalTemplate['recurrenceType'], defaultAmount: 0, autoPost: false, isActive: true };

const JournalTemplatesPage = () => {
    const toast = useRef<Toast>(null);
    const { user } = useUserData<{ userId: number }>();
    const [rows, setRows] = useState<FinanceJournalTemplate[]>([]);
    const [accts, setAccts] = useState<FinanceGlAccount[]>([]);
    const [ccs, setCcs] = useState<FinanceCostCenter[]>([]);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [genVisible, setGenVisible] = useState(false);
    const [crud, setCrud] = useState<'save' | 'update'>('save');
    const [form, setForm] = useState({ ...EMPTY_TPL });
    const [lines, setLines] = useState<LineForm[]>([]);
    const [genFor, setGenFor] = useState<FinanceJournalTemplate | null>(null);
    const [genForm, setGenForm] = useState({ entryDate: new Date() as Date | null, amountOverride: 0, description: '' });

    const load = async () => {
        setLoading(true);
        const r = await FinanceJournalService.listTemplates();
        setRows(Array.isArray(r.operatedData) ? r.operatedData : []);
        setLoading(false);
    };

    useEffect(() => {
        document.title = 'Finance · Journal Templates';
        void load();
        void FinanceService.listGlAccounts({ allowPosting: 1, isActive: 1 }).then((r) => setAccts(Array.isArray(r.operatedData) ? r.operatedData : []));
        void FinanceService.listCostCenters().then((r) => setCcs(Array.isArray(r.operatedData) ? r.operatedData : []));
    }, []);

    const acctOpts = useMemo(() => accts.map((a) => ({ label: `${a.accountCode} · ${a.name}`, value: a.accountId })), [accts]);
    const ccOpts = useMemo(() => [{ label: '— None —', value: null }, ...ccs.map((c) => ({ label: `${c.code} · ${c.name}`, value: c.costCenterId }))], [ccs]);

    const openEdit = async (r: FinanceJournalTemplate) => {
        setCrud('update');
        setForm({ templateId: r.templateId, templateName: r.templateName, description: r.description ?? '', recurrenceType: r.recurrenceType, defaultAmount: Number(r.defaultAmount ?? 0), autoPost: r.autoPost === 1, isActive: r.isActive === 1 });
        const lr = await FinanceJournalService.getTemplateLines(r.templateId);
        const ll = Array.isArray(lr.operatedData) ? lr.operatedData : [];
        setLines(ll.map((x: FinanceJournalTemplateLine) => ({ templateLineId: x.templateLineId, lineNumber: x.lineNumber, accountId: x.accountId, entryType: x.entryType, defaultAmount: Number(x.defaultAmount ?? 0), memo: x.memo ?? '', costCenterId: x.costCenterId })));
        setVisible(true);
    };

    const save = async () => {
        if (!form.templateName.trim()) { toast.current?.show({ severity: 'warn', summary: 'Missing', detail: 'Template name required.' }); return; }
        const r = await FinanceJournalService.upsertTemplate({ crudType: crud, ...form, lines });
        const op = Number(r.operationalStatus);
        if (op !== 1 && op !== 2) { toast.current?.show({ severity: 'error', summary: 'Failed', detail: 'Could not save.' }); return; }
        toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Template saved.' });
        setVisible(false); await load();
    };

    const openGenerate = (r: FinanceJournalTemplate) => { setGenFor(r); setGenForm({ entryDate: new Date(), amountOverride: Number(r.defaultAmount ?? 0), description: '' }); setGenVisible(true); };

    const doGenerate = async () => {
        if (!genFor || !user?.userId || !genForm.entryDate) { toast.current?.show({ severity: 'warn', summary: 'Missing', detail: 'Entry date and session required.' }); return; }
        confirmDialog({
            message: `Generate a journal entry from "${genFor.templateName}" for ${toYmd(genForm.entryDate)}?`,
            header: 'Confirm Generate',
            accept: async () => {
                const r = await FinanceJournalService.generateFromTemplate(genFor.templateId, { entryDate: toYmd(genForm.entryDate), amountOverride: genForm.amountOverride || undefined, description: genForm.description || undefined, createdByUserId: user.userId });
                const op = Number(r.operationalStatus);
                if (op === 1 || op === 2) { toast.current?.show({ severity: 'success', summary: 'Generated', detail: 'Journal entry created.' }); setGenVisible(false); await load(); }
                else toast.current?.show({ severity: 'error', summary: 'Failed', detail: 'Could not generate.' });
            }
        });
    };

    return (
        <div className="grid">
            <Toast ref={toast} /><ConfirmDialog />
            <div className="col-12">
                <Card title="Journal Templates">
                    <div className="flex justify-content-end mb-3"><Button label="New Template" icon="pi pi-plus" onClick={() => { setCrud('save'); setForm({ ...EMPTY_TPL }); setLines([{ ...EMPTY_LINE }]); setVisible(true); }} /></div>
                    <DataTable value={rows} loading={loading} paginator rows={15} dataKey="templateId" stripedRows responsiveLayout="scroll">
                        <Column field="templateName" header="Template" sortable />
                        <Column field="description" header="Description" />
                        <Column field="recurrenceType" header="Recurrence" />
                        <Column field="defaultAmount" header="Default Amt" body={(r: FinanceJournalTemplate) => r.defaultAmount !== null ? Number(r.defaultAmount).toFixed(2) : '—'} />
                        <Column header="Auto Post" body={(r: FinanceJournalTemplate) => <Tag value={r.autoPost ? 'Yes' : 'No'} severity={r.autoPost ? 'success' : 'info'} />} />
                        <Column field="lineCount" header="Lines" />
                        <Column header="Active" body={(r: FinanceJournalTemplate) => <Tag value={r.isActive ? 'Yes' : 'No'} severity={r.isActive ? 'success' : 'danger'} />} />
                        <Column header="Actions" body={(r: FinanceJournalTemplate) => (
                            <div className="flex gap-1">
                                <Button icon="pi pi-pencil" rounded text onClick={() => openEdit(r)} />
                                <Button icon="pi pi-cog" rounded text severity="success" tooltip="Generate Entry" disabled={!r.isActive || r.lineCount === 0} onClick={() => openGenerate(r)} />
                            </div>
                        )} />
                    </DataTable>
                </Card>
            </div>

            <Dialog header={crud === 'save' ? 'New Template' : 'Edit Template'} visible={visible} style={{ width: '900px' }} modal onHide={() => setVisible(false)}>
                <div className="grid pt-3">
                    <div className="col-12 md:col-6"><label className="block mb-1">Template Name *</label><InputText className="w-full" value={form.templateName} onChange={(e) => setForm({ ...form, templateName: e.target.value })} /></div>
                    <div className="col-12 md:col-3"><label className="block mb-1">Recurrence</label><Dropdown className="w-full" options={RECURRENCE} value={form.recurrenceType} onChange={(e) => setForm({ ...form, recurrenceType: e.value })} /></div>
                    <div className="col-12 md:col-3"><label className="block mb-1">Default Amount</label><InputNumber className="w-full" value={form.defaultAmount} onValueChange={(e) => setForm({ ...form, defaultAmount: e.value ?? 0 })} mode="decimal" minFractionDigits={2} /></div>
                    <div className="col-12"><label className="block mb-1">Description</label><InputTextarea className="w-full" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                    <div className="col-6 flex align-items-center gap-2"><InputSwitch checked={form.autoPost} onChange={(e) => setForm({ ...form, autoPost: !!e.value })} /><span>Auto Post</span></div>
                    <div className="col-6 flex align-items-center gap-2"><InputSwitch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: !!e.value })} /><span>Active</span></div>

                    <div className="col-12 mt-2">
                        <div className="flex justify-content-between mb-2"><h4 className="m-0">Lines</h4><Button label="Add Line" icon="pi pi-plus" size="small" onClick={() => setLines([...lines, { ...EMPTY_LINE, lineNumber: (lines.at(-1)?.lineNumber ?? 0) + 1 }])} /></div>
                        <table className="w-full"><thead><tr><th>#</th><th>Account</th><th>Entry</th><th>Default Amt</th><th>Cost Center</th><th>Memo</th><th></th></tr></thead>
                            <tbody>{lines.map((l, i) => (
                                <tr key={i}>
                                    <td style={{ width: 50 }}>{l.lineNumber}</td>
                                    <td><Dropdown className="w-full" options={acctOpts} value={l.accountId} onChange={(e) => { const n = [...lines]; n[i] = { ...n[i], accountId: e.value }; setLines(n); }} filter /></td>
                                    <td><Dropdown options={ENTRY_TYPES} value={l.entryType} onChange={(e) => { const n = [...lines]; n[i] = { ...n[i], entryType: e.value }; setLines(n); }} /></td>
                                    <td><InputNumber value={l.defaultAmount} onValueChange={(e) => { const n = [...lines]; n[i] = { ...n[i], defaultAmount: e.value ?? 0 }; setLines(n); }} mode="decimal" minFractionDigits={2} /></td>
                                    <td><Dropdown className="w-full" options={ccOpts} value={l.costCenterId} onChange={(e) => { const n = [...lines]; n[i] = { ...n[i], costCenterId: e.value }; setLines(n); }} /></td>
                                    <td><InputText value={l.memo} onChange={(e) => { const n = [...lines]; n[i] = { ...n[i], memo: e.target.value }; setLines(n); }} /></td>
                                    <td><Button icon="pi pi-trash" rounded text severity="danger" onClick={() => setLines(lines.filter((_, j) => j !== i))} /></td>
                                </tr>))}
                            </tbody>
                        </table>
                    </div>

                    <div className="col-12 flex justify-content-end gap-2 mt-3"><Button label="Cancel" severity="secondary" outlined onClick={() => setVisible(false)} /><Button label="Save" icon="pi pi-check" onClick={save} /></div>
                </div>
            </Dialog>

            <Dialog header={`Generate Entry from ${genFor?.templateName ?? ''}`} visible={genVisible} style={{ width: '500px' }} modal onHide={() => setGenVisible(false)}>
                <div className="flex flex-column gap-3 pt-3">
                    <div><label className="block mb-1">Entry Date *</label><Calendar className="w-full" value={genForm.entryDate} onChange={(e) => setGenForm({ ...genForm, entryDate: e.value as Date | null })} dateFormat="yy-mm-dd" /></div>
                    <div><label className="block mb-1">Amount Override</label><InputNumber className="w-full" value={genForm.amountOverride} onValueChange={(e) => setGenForm({ ...genForm, amountOverride: e.value ?? 0 })} mode="decimal" minFractionDigits={2} /></div>
                    <div><label className="block mb-1">Description</label><InputText className="w-full" value={genForm.description} onChange={(e) => setGenForm({ ...genForm, description: e.target.value })} /></div>
                    <div className="flex justify-content-end gap-2 mt-2"><Button label="Cancel" severity="secondary" outlined onClick={() => setGenVisible(false)} /><Button label="Generate" icon="pi pi-check" onClick={doGenerate} /></div>
                </div>
            </Dialog>
        </div>
    );
};

export default JournalTemplatesPage;
