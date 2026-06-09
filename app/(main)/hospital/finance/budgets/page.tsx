'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { FinanceService, FinanceBudgetService } from '@/libs/blue_prints/FinanceService';
import { FinanceBudget, FinanceBudgetLine, FinanceFiscalYear, FinanceCostCenter, FinanceGlAccount } from '@/types/finance/finance';

const BUDGET_TYPES = ['OPERATING', 'CAPITAL', 'PROJECT', 'DEPARTMENT'].map((v) => ({ label: v, value: v }));
const BUDGET_STATUSES = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'ACTIVE', 'CLOSED'].map((v) => ({ label: v, value: v }));

const EMPTY_BUDGET = { budgetId: undefined as number | undefined, budgetCode: '', name: '', description: '', fiscalYearId: null as number | null, budgetType: 'OPERATING' as FinanceBudget['budgetType'], costCenterId: null as number | null, totalBudgetAmount: 0, status: 'DRAFT' as FinanceBudget['status'], notes: '' };
const EMPTY_LINE = { budgetLineId: undefined as number | undefined, budgetId: null as number | null, accountId: null as number | null, costCenterId: null as number | null, annualBudget: 0, notes: '' };

const BudgetsPage = () => {
    const toast = useRef<Toast>(null);
    const [rows, setRows] = useState<FinanceBudget[]>([]);
    const [lines, setLines] = useState<FinanceBudgetLine[]>([]);
    const [years, setYears] = useState<FinanceFiscalYear[]>([]);
    const [costCenters, setCostCenters] = useState<FinanceCostCenter[]>([]);
    const [accounts, setAccounts] = useState<FinanceGlAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBudget, setSelectedBudget] = useState<FinanceBudget | null>(null);
    const [budgetVisible, setBudgetVisible] = useState(false);
    const [lineVisible, setLineVisible] = useState(false);
    const [crud, setCrud] = useState<'save' | 'update'>('save');
    const [lineCrud, setLineCrud] = useState<'save' | 'update'>('save');
    const [budgetForm, setBudgetForm] = useState({ ...EMPTY_BUDGET });
    const [lineForm, setLineForm] = useState({ ...EMPTY_LINE });

    const load = async () => {
        setLoading(true);
        const r = await FinanceBudgetService.listBudgets();
        setRows(Array.isArray(r.operatedData) ? r.operatedData : []);
        setLoading(false);
    };

    const loadLines = async (id: number) => {
        const r = await FinanceBudgetService.listBudgetLines(id);
        setLines(Array.isArray(r.operatedData) ? r.operatedData : []);
    };

    useEffect(() => {
        document.title = 'Finance · Budgets';
        void load();
        void FinanceService.listFiscalYears().then((r) => setYears(Array.isArray(r.operatedData) ? r.operatedData : []));
        void FinanceService.listCostCenters().then((r) => setCostCenters(Array.isArray(r.operatedData) ? r.operatedData : []));
        void FinanceService.listGlAccounts({ allowPosting: 1, isActive: 1 }).then((r) => setAccounts(Array.isArray(r.operatedData) ? r.operatedData : []));
    }, []);

    useEffect(() => { if (selectedBudget) void loadLines(selectedBudget.budgetId); else setLines([]); }, [selectedBudget]);

    const yearOpts = useMemo(() => years.map((y) => ({ label: `${y.yearCode} · ${y.name}`, value: y.fiscalYearId })), [years]);
    const ccOpts = useMemo(() => [{ label: '— None —', value: null }, ...costCenters.map((c) => ({ label: `${c.code} · ${c.name}`, value: c.costCenterId }))], [costCenters]);
    const acctOpts = useMemo(() => accounts.map((a) => ({ label: `${a.accountCode} · ${a.name}`, value: a.accountId })), [accounts]);

    const saveBudget = async () => {
        if (!budgetForm.budgetCode.trim() || !budgetForm.name.trim() || !budgetForm.fiscalYearId) { toast.current?.show({ severity: 'warn', summary: 'Missing', detail: 'Code, name and fiscal year required.' }); return; }
        const r = await FinanceBudgetService.upsertBudget({ crudType: crud, ...budgetForm });
        const op = Number(r.operationalStatus);
        if (op === 3) { toast.current?.show({ severity: 'warn', summary: 'Duplicate', detail: 'Code exists.' }); return; }
        if (op !== 1 && op !== 2) { toast.current?.show({ severity: 'error', summary: 'Failed', detail: 'Could not save.' }); return; }
        toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Budget saved.' });
        setBudgetVisible(false); await load();
    };

    const saveLine = async () => {
        if (!lineForm.accountId || !lineForm.annualBudget) { toast.current?.show({ severity: 'warn', summary: 'Missing', detail: 'Account and amount required.' }); return; }
        const r = await FinanceBudgetService.upsertBudgetLine({ crudType: lineCrud, ...lineForm, budgetId: selectedBudget?.budgetId });
        const op = Number(r.operationalStatus);
        if (op !== 1 && op !== 2) { toast.current?.show({ severity: 'error', summary: 'Failed', detail: 'Could not save line.' }); return; }
        toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Line saved.' });
        setLineVisible(false); if (selectedBudget) await loadLines(selectedBudget.budgetId); await load();
    };

    const removeLine = (id: number) => confirmDialog({
        message: 'Remove this budget line?',
        header: 'Confirm',
        accept: async () => {
            const r = await FinanceBudgetService.removeBudgetLine(id);
            const op = Number(r.operationalStatus);
            if (op === 1 || op === 2) { toast.current?.show({ severity: 'success', summary: 'Removed', detail: 'Line removed.' }); if (selectedBudget) await loadLines(selectedBudget.budgetId); }
            else toast.current?.show({ severity: 'error', summary: 'Failed', detail: 'Could not remove.' });
        }
    });

    return (
        <div className="grid">
            <Toast ref={toast} /><ConfirmDialog />
            <div className="col-12">
                <Card title="Budgets">
                    <div className="flex justify-content-end mb-3"><Button label="New Budget" icon="pi pi-plus" onClick={() => { setCrud('save'); setBudgetForm({ ...EMPTY_BUDGET }); setBudgetVisible(true); }} /></div>
                    <DataTable value={rows} loading={loading} paginator rows={15} dataKey="budgetId" stripedRows responsiveLayout="scroll" selectionMode="single" selection={selectedBudget} onSelectionChange={(e: any) => setSelectedBudget(e.value)}>
                        <Column field="budgetCode" header="Code" sortable />
                        <Column field="name" header="Name" />
                        <Column field="fiscalYearCode" header="Year" />
                        <Column field="budgetType" header="Type" />
                        <Column field="costCenterName" header="Cost Center" />
                        <Column field="totalBudgetAmount" header="Total" body={(r: FinanceBudget) => Number(r.totalBudgetAmount).toFixed(2)} />
                        <Column field="sumLineBudget" header="Lines Total" body={(r: FinanceBudget) => Number(r.sumLineBudget).toFixed(2)} />
                        <Column field="status" header="Status" body={(r: FinanceBudget) => <Tag value={r.status} />} />
                        <Column header="Actions" body={(r: FinanceBudget) => (
                            <Button icon="pi pi-pencil" rounded text onClick={() => { setCrud('update'); setBudgetForm({ budgetId: r.budgetId, budgetCode: r.budgetCode, name: r.name, description: r.description ?? '', fiscalYearId: r.fiscalYearId, budgetType: r.budgetType, costCenterId: r.costCenterId, totalBudgetAmount: Number(r.totalBudgetAmount), status: r.status, notes: r.notes ?? '' }); setBudgetVisible(true); }} />
                        )} />
                    </DataTable>
                </Card>
            </div>

            {selectedBudget && (
                <div className="col-12">
                    <Card title={`Budget Lines · ${selectedBudget.name}`}>
                        <div className="flex justify-content-end mb-3"><Button label="Add Line" icon="pi pi-plus" onClick={() => { setLineCrud('save'); setLineForm({ ...EMPTY_LINE, budgetId: selectedBudget.budgetId }); setLineVisible(true); }} /></div>
                        <DataTable value={lines} dataKey="budgetLineId" stripedRows responsiveLayout="scroll">
                            <Column field="accountCode" header="Account Code" />
                            <Column field="accountName" header="Account" />
                            <Column field="costCenterName" header="Cost Center" />
                            <Column field="annualBudget" header="Annual" body={(r: FinanceBudgetLine) => Number(r.annualBudget).toFixed(2)} />
                            <Column header="Actions" body={(r: FinanceBudgetLine) => (
                                <div className="flex gap-1">
                                    <Button icon="pi pi-pencil" rounded text onClick={() => { setLineCrud('update'); setLineForm({ budgetLineId: r.budgetLineId, budgetId: r.budgetId, accountId: r.accountId, costCenterId: r.costCenterId, annualBudget: Number(r.annualBudget), notes: r.notes ?? '' }); setLineVisible(true); }} />
                                    <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => removeLine(r.budgetLineId)} />
                                </div>
                            )} />
                        </DataTable>
                    </Card>
                </div>
            )}

            <Dialog header={crud === 'save' ? 'New Budget' : 'Edit Budget'} visible={budgetVisible} style={{ width: '620px' }} modal onHide={() => setBudgetVisible(false)}>
                <div className="grid pt-3">
                    <div className="col-12 md:col-6"><label className="block mb-1">Code *</label><InputText className="w-full" value={budgetForm.budgetCode} onChange={(e) => setBudgetForm({ ...budgetForm, budgetCode: e.target.value })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Status</label><Dropdown className="w-full" options={BUDGET_STATUSES} value={budgetForm.status} onChange={(e) => setBudgetForm({ ...budgetForm, status: e.value })} /></div>
                    <div className="col-12"><label className="block mb-1">Name *</label><InputText className="w-full" value={budgetForm.name} onChange={(e) => setBudgetForm({ ...budgetForm, name: e.target.value })} /></div>
                    <div className="col-12"><label className="block mb-1">Description</label><InputTextarea className="w-full" rows={2} value={budgetForm.description} onChange={(e) => setBudgetForm({ ...budgetForm, description: e.target.value })} /></div>
                    <div className="col-12 md:col-4"><label className="block mb-1">Fiscal Year *</label><Dropdown className="w-full" options={yearOpts} value={budgetForm.fiscalYearId} onChange={(e) => setBudgetForm({ ...budgetForm, fiscalYearId: e.value })} /></div>
                    <div className="col-12 md:col-4"><label className="block mb-1">Type</label><Dropdown className="w-full" options={BUDGET_TYPES} value={budgetForm.budgetType} onChange={(e) => setBudgetForm({ ...budgetForm, budgetType: e.value })} /></div>
                    <div className="col-12 md:col-4"><label className="block mb-1">Cost Center</label><Dropdown className="w-full" options={ccOpts} value={budgetForm.costCenterId} onChange={(e) => setBudgetForm({ ...budgetForm, costCenterId: e.value })} filter /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Total Budget Amount</label><InputNumber className="w-full" value={budgetForm.totalBudgetAmount} onValueChange={(e) => setBudgetForm({ ...budgetForm, totalBudgetAmount: e.value ?? 0 })} mode="decimal" minFractionDigits={2} /></div>
                    <div className="col-12"><label className="block mb-1">Notes</label><InputTextarea className="w-full" rows={2} value={budgetForm.notes} onChange={(e) => setBudgetForm({ ...budgetForm, notes: e.target.value })} /></div>
                    <div className="col-12 flex justify-content-end gap-2 mt-2"><Button label="Cancel" severity="secondary" outlined onClick={() => setBudgetVisible(false)} /><Button label="Save" icon="pi pi-check" onClick={saveBudget} /></div>
                </div>
            </Dialog>

            <Dialog header={lineCrud === 'save' ? 'New Line' : 'Edit Line'} visible={lineVisible} style={{ width: '500px' }} modal onHide={() => setLineVisible(false)}>
                <div className="flex flex-column gap-3 pt-3">
                    <div><label className="block mb-1">Account *</label><Dropdown className="w-full" options={acctOpts} value={lineForm.accountId} onChange={(e) => setLineForm({ ...lineForm, accountId: e.value })} filter /></div>
                    <div><label className="block mb-1">Cost Center</label><Dropdown className="w-full" options={ccOpts} value={lineForm.costCenterId} onChange={(e) => setLineForm({ ...lineForm, costCenterId: e.value })} /></div>
                    <div><label className="block mb-1">Annual Budget *</label><InputNumber className="w-full" value={lineForm.annualBudget} onValueChange={(e) => setLineForm({ ...lineForm, annualBudget: e.value ?? 0 })} mode="decimal" minFractionDigits={2} /></div>
                    <div><label className="block mb-1">Notes</label><InputTextarea className="w-full" rows={2} value={lineForm.notes} onChange={(e) => setLineForm({ ...lineForm, notes: e.target.value })} /></div>
                    <div className="flex justify-content-end gap-2 mt-2"><Button label="Cancel" severity="secondary" outlined onClick={() => setLineVisible(false)} /><Button label="Save" icon="pi pi-check" onClick={saveLine} /></div>
                </div>
            </Dialog>
        </div>
    );
};

export default BudgetsPage;
