'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { FinanceService } from '@/libs/blue_prints/FinanceService';
import { FinanceFiscalYear, FinanceFiscalPeriod } from '@/types/finance/finance';

const toYmd = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : '');
const parseDate = (s: string | null | undefined) => (s ? new Date(s) : null);

const YR_STATUSES = ['UPCOMING', 'OPEN', 'CLOSED', 'LOCKED'].map((v) => ({ label: v, value: v }));

const EMPTY_YEAR = { fiscalYearId: undefined as number | undefined, yearCode: '', name: '', startDate: null as Date | null, endDate: null as Date | null, status: 'UPCOMING' as FinanceFiscalYear['status'], notes: '' };
const EMPTY_PERIOD = { fiscalPeriodId: undefined as number | undefined, fiscalYearId: null as number | null, periodNumber: 1, name: '', shortName: '', startDate: null as Date | null, endDate: null as Date | null, glStatus: 'OPEN' as FinanceFiscalPeriod['glStatus'] };

const FiscalPeriodsPage = () => {
    const toast = useRef<Toast>(null);
    const [years, setYears] = useState<FinanceFiscalYear[]>([]);
    const [periods, setPeriods] = useState<FinanceFiscalPeriod[]>([]);
    const [loading, setLoading] = useState(true);
    const [yearVisible, setYearVisible] = useState(false);
    const [perVisible, setPerVisible] = useState(false);
    const [yearCrud, setYearCrud] = useState<'save' | 'update'>('save');
    const [perCrud, setPerCrud] = useState<'save' | 'update'>('save');
    const [yearForm, setYearForm] = useState({ ...EMPTY_YEAR });
    const [perForm, setPerForm] = useState({ ...EMPTY_PERIOD });
    const [selectedYearId, setSelectedYearId] = useState<number | null>(null);

    const load = async () => {
        setLoading(true);
        const y = await FinanceService.listFiscalYears();
        const yrs = Array.isArray(y.operatedData) ? y.operatedData : [];
        setYears(yrs);
        const targetYear = selectedYearId ?? yrs[0]?.fiscalYearId ?? null;
        setSelectedYearId(targetYear);
        if (targetYear) {
            const p = await FinanceService.listFiscalPeriods(targetYear);
            setPeriods(Array.isArray(p.operatedData) ? p.operatedData : []);
        } else {
            setPeriods([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        document.title = 'Finance · Fiscal Periods';
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (selectedYearId) {
            void FinanceService.listFiscalPeriods(selectedYearId).then((p) => setPeriods(Array.isArray(p.operatedData) ? p.operatedData : []));
        }
    }, [selectedYearId]);

    const yearOptions = useMemo(() => years.map((y) => ({ label: `${y.yearCode} · ${y.name}`, value: y.fiscalYearId })), [years]);

    const handle = (op: number, label: string) => {
        if (op === 3) { toast.current?.show({ severity: 'warn', summary: 'Duplicate', detail: `${label} already exists.` }); return false; }
        if (op !== 1 && op !== 2) { toast.current?.show({ severity: 'error', summary: 'Failed', detail: `Could not save ${label}.` }); return false; }
        toast.current?.show({ severity: 'success', summary: 'Saved', detail: `${label} saved.` });
        return true;
    };

    const saveYear = async () => {
        if (!yearForm.yearCode.trim() || !yearForm.name.trim() || !yearForm.startDate || !yearForm.endDate) { toast.current?.show({ severity: 'warn', summary: 'Missing', detail: 'All required fields needed.' }); return; }
        const r = await FinanceService.upsertFiscalYear({ crudType: yearCrud, fiscalYearId: yearForm.fiscalYearId, yearCode: yearForm.yearCode, name: yearForm.name, startDate: toYmd(yearForm.startDate), endDate: toYmd(yearForm.endDate), status: yearForm.status, notes: yearForm.notes });
        if (handle(Number(r.operationalStatus), 'Fiscal year')) { setYearVisible(false); await load(); }
    };

    const savePeriod = async () => {
        if (!perForm.fiscalYearId || !perForm.name.trim() || !perForm.startDate || !perForm.endDate) { toast.current?.show({ severity: 'warn', summary: 'Missing', detail: 'All required fields needed.' }); return; }
        const r = await FinanceService.upsertFiscalPeriod({ crudType: perCrud, fiscalPeriodId: perForm.fiscalPeriodId, fiscalYearId: perForm.fiscalYearId, periodNumber: perForm.periodNumber, name: perForm.name, shortName: perForm.shortName, startDate: toYmd(perForm.startDate), endDate: toYmd(perForm.endDate), glStatus: perForm.glStatus });
        if (handle(Number(r.operationalStatus), 'Period')) { setPerVisible(false); await load(); }
    };

    const generateMonthly = async (yearId: number) => {
        confirmDialog({
            message: 'Generate 12 monthly periods for this fiscal year?',
            header: 'Confirm',
            accept: async () => {
                const r = await FinanceService.generateMonthlyPeriods(yearId);
                if (Number(r.operationalStatus) === 1 || Number(r.operationalStatus) === 2) {
                    toast.current?.show({ severity: 'success', summary: 'Generated', detail: `Periods generated.` });
                    await load();
                } else {
                    toast.current?.show({ severity: 'error', summary: 'Failed', detail: 'Could not generate.' });
                }
            }
        });
    };

    const closePeriod = (periodId: number) => {
        confirmDialog({
            message: 'Close this fiscal period? No new journal entries can be posted to it.',
            header: 'Confirm Close',
            accept: async () => {
                const r = await FinanceService.closeFiscalPeriod(periodId);
                if (Number(r.operationalStatus) === 1 || Number(r.operationalStatus) === 2) {
                    toast.current?.show({ severity: 'success', summary: 'Closed', detail: 'Period closed.' });
                    await load();
                } else {
                    toast.current?.show({ severity: 'error', summary: 'Failed', detail: 'Could not close period.' });
                }
            }
        });
    };

    const periodStatusSeverity = (s: string): 'success' | 'warning' | 'danger' => (s === 'OPEN' ? 'success' : s === 'CLOSED' ? 'warning' : 'danger');

    return (
        <div className="grid">
            <Toast ref={toast} /><ConfirmDialog />
            <div className="col-12">
                <Card title="Fiscal Years">
                    <div className="flex justify-content-end mb-3"><Button label="New Year" icon="pi pi-plus" onClick={() => { setYearCrud('save'); setYearForm({ ...EMPTY_YEAR }); setYearVisible(true); }} /></div>
                    <DataTable value={years} loading={loading} dataKey="fiscalYearId" stripedRows responsiveLayout="scroll" selectionMode="single" selection={years.find((y) => y.fiscalYearId === selectedYearId) ?? null} onSelectionChange={(e: any) => setSelectedYearId(e.value?.fiscalYearId ?? null)}>
                        <Column field="yearCode" header="Code" />
                        <Column field="name" header="Name" />
                        <Column field="startDate" header="Start" />
                        <Column field="endDate" header="End" />
                        <Column field="status" header="Status" body={(r: FinanceFiscalYear) => <Tag value={r.status} severity={r.status === 'OPEN' ? 'success' : r.status === 'CLOSED' ? 'warning' : r.status === 'LOCKED' ? 'danger' : 'info'} />} />
                        <Column field="periodCount" header="Periods" />
                        <Column field="openPeriodCount" header="Open" />
                        <Column header="Actions" body={(r: FinanceFiscalYear) => (
                            <div className="flex gap-1">
                                <Button icon="pi pi-pencil" rounded text onClick={() => { setYearCrud('update'); setYearForm({ fiscalYearId: r.fiscalYearId, yearCode: r.yearCode, name: r.name, startDate: parseDate(r.startDate), endDate: parseDate(r.endDate), status: r.status, notes: r.notes ?? '' }); setYearVisible(true); }} />
                                <Button icon="pi pi-calendar-plus" rounded text tooltip="Generate Monthly Periods" onClick={() => generateMonthly(r.fiscalYearId)} disabled={r.periodCount > 0} />
                            </div>
                        )} />
                    </DataTable>
                </Card>
            </div>

            <div className="col-12">
                <Card title="Fiscal Periods">
                    <div className="flex justify-content-between mb-3">
                        <Dropdown options={yearOptions} value={selectedYearId} onChange={(e) => setSelectedYearId(e.value)} placeholder="Select fiscal year" />
                        <Button label="New Period" icon="pi pi-plus" onClick={() => { setPerCrud('save'); setPerForm({ ...EMPTY_PERIOD, fiscalYearId: selectedYearId }); setPerVisible(true); }} disabled={!selectedYearId} />
                    </div>
                    <DataTable value={periods} loading={loading} dataKey="fiscalPeriodId" stripedRows responsiveLayout="scroll">
                        <Column field="periodNumber" header="#" />
                        <Column field="name" header="Period" />
                        <Column field="startDate" header="Start" />
                        <Column field="endDate" header="End" />
                        <Column field="glStatus" header="GL Status" body={(r: FinanceFiscalPeriod) => <Tag value={r.glStatus} severity={periodStatusSeverity(r.glStatus)} />} />
                        <Column header="Actions" body={(r: FinanceFiscalPeriod) => (
                            <div className="flex gap-1">
                                <Button icon="pi pi-pencil" rounded text onClick={() => { setPerCrud('update'); setPerForm({ fiscalPeriodId: r.fiscalPeriodId, fiscalYearId: r.fiscalYearId, periodNumber: r.periodNumber, name: r.name, shortName: r.shortName ?? '', startDate: parseDate(r.startDate), endDate: parseDate(r.endDate), glStatus: r.glStatus }); setPerVisible(true); }} />
                                <Button icon="pi pi-lock" rounded text tooltip="Close Period" severity="warning" onClick={() => closePeriod(r.fiscalPeriodId)} disabled={r.glStatus !== 'OPEN'} />
                            </div>
                        )} />
                    </DataTable>
                </Card>
            </div>

            <Dialog header={yearCrud === 'save' ? 'New Fiscal Year' : 'Edit Fiscal Year'} visible={yearVisible} style={{ width: '480px' }} modal onHide={() => setYearVisible(false)}>
                <div className="grid pt-3">
                    <div className="col-12 md:col-6"><label className="block mb-1">Year Code *</label><InputText className="w-full" value={yearForm.yearCode} onChange={(e) => setYearForm({ ...yearForm, yearCode: e.target.value })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Status</label><Dropdown className="w-full" options={YR_STATUSES} value={yearForm.status} onChange={(e) => setYearForm({ ...yearForm, status: e.value })} /></div>
                    <div className="col-12"><label className="block mb-1">Name *</label><InputText className="w-full" value={yearForm.name} onChange={(e) => setYearForm({ ...yearForm, name: e.target.value })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Start *</label><Calendar className="w-full" value={yearForm.startDate} onChange={(e) => setYearForm({ ...yearForm, startDate: e.value as Date | null })} dateFormat="yy-mm-dd" /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">End *</label><Calendar className="w-full" value={yearForm.endDate} onChange={(e) => setYearForm({ ...yearForm, endDate: e.value as Date | null })} dateFormat="yy-mm-dd" /></div>
                    <div className="col-12"><label className="block mb-1">Notes</label><InputTextarea className="w-full" rows={2} value={yearForm.notes} onChange={(e) => setYearForm({ ...yearForm, notes: e.target.value })} /></div>
                    <div className="col-12 flex justify-content-end gap-2 mt-2"><Button label="Cancel" severity="secondary" outlined onClick={() => setYearVisible(false)} /><Button label="Save" icon="pi pi-check" onClick={saveYear} /></div>
                </div>
            </Dialog>

            <Dialog header={perCrud === 'save' ? 'New Period' : 'Edit Period'} visible={perVisible} style={{ width: '460px' }} modal onHide={() => setPerVisible(false)}>
                <div className="grid pt-3">
                    <div className="col-12 md:col-6"><label className="block mb-1">Period #</label><InputText className="w-full" type="number" value={String(perForm.periodNumber)} onChange={(e) => setPerForm({ ...perForm, periodNumber: Number(e.target.value) || 1 })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Short Name</label><InputText className="w-full" value={perForm.shortName} onChange={(e) => setPerForm({ ...perForm, shortName: e.target.value })} /></div>
                    <div className="col-12"><label className="block mb-1">Name *</label><InputText className="w-full" value={perForm.name} onChange={(e) => setPerForm({ ...perForm, name: e.target.value })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Start *</label><Calendar className="w-full" value={perForm.startDate} onChange={(e) => setPerForm({ ...perForm, startDate: e.value as Date | null })} dateFormat="yy-mm-dd" /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">End *</label><Calendar className="w-full" value={perForm.endDate} onChange={(e) => setPerForm({ ...perForm, endDate: e.value as Date | null })} dateFormat="yy-mm-dd" /></div>
                    <div className="col-12 flex justify-content-end gap-2 mt-2"><Button label="Cancel" severity="secondary" outlined onClick={() => setPerVisible(false)} /><Button label="Save" icon="pi pi-check" onClick={savePeriod} /></div>
                </div>
            </Dialog>
        </div>
    );
};

export default FiscalPeriodsPage;
