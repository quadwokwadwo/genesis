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
import { TabView, TabPanel } from 'primereact/tabview';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { FinanceService, FinancePettyCashService } from '@/libs/blue_prints/FinanceService';
import UsersModel from '@/libs/blue_prints/UsersModel';
import useUserData from '@/libs/hooks/useUserData';
import { FinancePettyCashAccount, FinancePettyCashVoucher, FinancePettyCashReplenishment, FinanceGlAccount } from '@/types/finance/finance';

const toYmd = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : '');
const parseDate = (s: string | null | undefined) => (s ? new Date(s) : null);

const ACCT_STATUSES = ['ACTIVE', 'SUSPENDED', 'CLOSED'].map((v) => ({ label: v, value: v }));
const VOUCHER_TYPES = ['DISBURSEMENT', 'RECEIPT'].map((v) => ({ label: v, value: v }));
const VOUCHER_STATUSES = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'VOIDED'].map((v) => ({ label: v, value: v }));

const EMPTY_ACCT = { pettyCashAccountId: undefined as number | undefined, accountName: '', accountCode: '', custodianUserId: null as number | null, maxLimit: 0, pettyCashGlAccountId: null as number | null, defaultExpenseAccountId: null as number | null, currencyCode: 'GHS', status: 'ACTIVE' as FinancePettyCashAccount['status'], notes: '' };
const EMPTY_VOUCHER = { voucherId: undefined as number | undefined, pettyCashAccountId: null as number | null, transactionDate: new Date() as Date | null, voucherType: 'DISBURSEMENT' as FinancePettyCashVoucher['voucherType'], amount: 0, payeeName: '', description: '', expenseAccountId: null as number | null, status: 'DRAFT' as FinancePettyCashVoucher['status'], notes: '' };
const EMPTY_REPL = { replenishmentId: undefined as number | undefined, pettyCashAccountId: null as number | null, requestDate: new Date() as Date | null, requestedAmount: 0, sourceBankAccountId: null as number | null, notes: '' };

const PettyCashPage = () => {
    const toast = useRef<Toast>(null);
    const { user } = useUserData<{ userId: number }>();
    const [accts, setAccts] = useState<FinancePettyCashAccount[]>([]);
    const [vouchers, setVouchers] = useState<FinancePettyCashVoucher[]>([]);
    const [repls, setRepls] = useState<FinancePettyCashReplenishment[]>([]);
    const [glAccts, setGlAccts] = useState<FinanceGlAccount[]>([]);
    const [banks, setBanks] = useState<FinanceGlAccount[]>([]);
    const [staff, setStaff] = useState<any[]>([]);
    const [acctVisible, setAcctVisible] = useState(false);
    const [voucherVisible, setVoucherVisible] = useState(false);
    const [replVisible, setReplVisible] = useState(false);
    const [acctCrud, setAcctCrud] = useState<'save' | 'update'>('save');
    const [voucherCrud, setVoucherCrud] = useState<'save' | 'update'>('save');
    const [replCrud, setReplCrud] = useState<'save' | 'update'>('save');
    const [acctForm, setAcctForm] = useState({ ...EMPTY_ACCT });
    const [voucherForm, setVoucherForm] = useState({ ...EMPTY_VOUCHER });
    const [replForm, setReplForm] = useState({ ...EMPTY_REPL });

    const loadAll = async () => {
        const [a, v, r] = await Promise.all([FinancePettyCashService.listAccounts(), FinancePettyCashService.listVouchers(), FinancePettyCashService.listReplenishments()]);
        setAccts(Array.isArray(a.operatedData) ? a.operatedData : []);
        setVouchers(Array.isArray(v.operatedData) ? v.operatedData : []);
        setRepls(Array.isArray(r.operatedData) ? r.operatedData : []);
    };

    useEffect(() => {
        document.title = 'Finance · Petty Cash';
        void loadAll();
        void FinanceService.listGlAccounts({ allowPosting: 1, isActive: 1 }).then((r) => setGlAccts(Array.isArray(r.operatedData) ? r.operatedData : []));
        void FinanceService.listGlAccounts({ isBankAccount: 1, isActive: 1 }).then((r) => setBanks(Array.isArray(r.operatedData) ? r.operatedData : []));
        void new UsersModel().getUserList().then((r: any) => setStaff(Array.isArray(r?.operatedData) ? r.operatedData : []));
    }, []);

    const acctOpts = useMemo(() => accts.map((a) => ({ label: `${a.accountCode ?? ''} · ${a.accountName}`, value: a.pettyCashAccountId })), [accts]);
    const glOpts = useMemo(() => glAccts.map((a) => ({ label: `${a.accountCode} · ${a.name}`, value: a.accountId })), [glAccts]);
    const bankOpts = useMemo(() => banks.map((b) => ({ label: `${b.accountCode} · ${b.name}`, value: b.accountId })), [banks]);
    const staffOpts = useMemo(() => staff.map((s: any) => ({ label: `${s.firstName ?? s.first_name ?? ''} ${s.lastName ?? s.last_name ?? ''}`.trim() || s.username, value: s.userId ?? s.user_id })), [staff]);

    const saveAcct = async () => {
        if (!acctForm.accountName.trim() || !acctForm.custodianUserId || !acctForm.pettyCashGlAccountId) { toast.current?.show({ severity: 'warn', summary: 'Missing', detail: 'Name, custodian, GL required.' }); return; }
        const r = await FinancePettyCashService.upsertAccount({ crudType: acctCrud, ...acctForm });
        const op = Number(r.operationalStatus);
        if (op !== 1 && op !== 2) { toast.current?.show({ severity: 'error', summary: 'Failed', detail: 'Could not save.' }); return; }
        toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Account saved.' });
        setAcctVisible(false); await loadAll();
    };

    const saveVoucher = async () => {
        if (!voucherForm.pettyCashAccountId || !voucherForm.amount || !voucherForm.expenseAccountId) { toast.current?.show({ severity: 'warn', summary: 'Missing', detail: 'Account, amount, expense account required.' }); return; }
        const r = await FinancePettyCashService.upsertVoucher({ crudType: voucherCrud, ...voucherForm, transactionDate: toYmd(voucherForm.transactionDate) });
        const op = Number(r.operationalStatus);
        if (op !== 1 && op !== 2) { toast.current?.show({ severity: 'error', summary: 'Failed', detail: 'Could not save.' }); return; }
        toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Voucher saved.' });
        setVoucherVisible(false); await loadAll();
    };

    const approveVoucher = (id: number) => confirmDialog({
        message: 'Approve this voucher?', header: 'Confirm Approve',
        accept: async () => {
            const r = await FinancePettyCashService.approveVoucher(id);
            const op = Number(r.operationalStatus);
            if (op === 1 || op === 2) { toast.current?.show({ severity: 'success', summary: 'Approved', detail: 'Voucher approved.' }); await loadAll(); }
            else toast.current?.show({ severity: 'error', summary: 'Failed', detail: 'Could not approve.' });
        }
    });

    const saveRepl = async () => {
        if (!replForm.pettyCashAccountId || !replForm.requestedAmount || !replForm.sourceBankAccountId) { toast.current?.show({ severity: 'warn', summary: 'Missing', detail: 'Account, amount, bank required.' }); return; }
        const r = await FinancePettyCashService.upsertReplenishment({ crudType: replCrud, ...replForm, requestDate: toYmd(replForm.requestDate) });
        const op = Number(r.operationalStatus);
        if (op !== 1 && op !== 2) { toast.current?.show({ severity: 'error', summary: 'Failed', detail: 'Could not save.' }); return; }
        toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Replenishment saved.' });
        setReplVisible(false); await loadAll();
    };

    const disburseRepl = (row: FinancePettyCashReplenishment) => confirmDialog({
        message: `Disburse ${Number(row.requestedAmount).toFixed(2)} for ${row.pettyCashAccountName}?`, header: 'Confirm Disburse',
        accept: async () => {
            if (!user?.userId) { toast.current?.show({ severity: 'error', summary: 'No user', detail: 'Login session missing.' }); return; }
            const r = await FinancePettyCashService.disburseReplenishment(row.replenishmentId, { amount: Number(row.requestedAmount), disbursedByUserId: user.userId });
            const op = Number(r.operationalStatus);
            if (op === 1 || op === 2) { toast.current?.show({ severity: 'success', summary: 'Disbursed', detail: 'Replenishment disbursed.' }); await loadAll(); }
            else toast.current?.show({ severity: 'error', summary: 'Failed', detail: 'Could not disburse.' });
        }
    });

    return (
        <div className="grid">
            <Toast ref={toast} /><ConfirmDialog />
            <div className="col-12">
                <Card>
                    <TabView>
                        <TabPanel header="Accounts">
                            <div className="flex justify-content-end mb-3"><Button label="New Account" icon="pi pi-plus" onClick={() => { setAcctCrud('save'); setAcctForm({ ...EMPTY_ACCT }); setAcctVisible(true); }} /></div>
                            <DataTable value={accts} dataKey="pettyCashAccountId" stripedRows responsiveLayout="scroll">
                                <Column field="accountCode" header="Code" />
                                <Column field="accountName" header="Name" />
                                <Column header="Custodian" body={(r: FinancePettyCashAccount) => `${r.custodianFirstName ?? ''} ${r.custodianLastName ?? ''}`.trim()} />
                                <Column field="maxLimit" header="Limit" body={(r: FinancePettyCashAccount) => Number(r.maxLimit).toFixed(2)} />
                                <Column field="currentBalance" header="Balance" body={(r: FinancePettyCashAccount) => Number(r.currentBalance).toFixed(2)} />
                                <Column field="pettyCashGlAccountCode" header="GL" />
                                <Column field="status" header="Status" body={(r: FinancePettyCashAccount) => <Tag value={r.status} severity={r.status === 'ACTIVE' ? 'success' : 'warning'} />} />
                                <Column header="Actions" body={(r: FinancePettyCashAccount) => (
                                    <Button icon="pi pi-pencil" rounded text onClick={() => { setAcctCrud('update'); setAcctForm({ pettyCashAccountId: r.pettyCashAccountId, accountName: r.accountName, accountCode: r.accountCode ?? '', custodianUserId: r.custodianUserId, maxLimit: Number(r.maxLimit), pettyCashGlAccountId: r.pettyCashGlAccountId, defaultExpenseAccountId: r.defaultExpenseAccountId, currencyCode: r.currencyCode, status: r.status, notes: r.notes ?? '' }); setAcctVisible(true); }} />
                                )} />
                            </DataTable>
                        </TabPanel>

                        <TabPanel header="Vouchers">
                            <div className="flex justify-content-end mb-3"><Button label="New Voucher" icon="pi pi-plus" onClick={() => { setVoucherCrud('save'); setVoucherForm({ ...EMPTY_VOUCHER }); setVoucherVisible(true); }} /></div>
                            <DataTable value={vouchers} dataKey="voucherId" stripedRows paginator rows={10} responsiveLayout="scroll">
                                <Column field="voucherNumber" header="Number" />
                                <Column field="transactionDate" header="Date" />
                                <Column field="pettyCashAccountName" header="Account" />
                                <Column field="voucherType" header="Type" />
                                <Column field="amount" header="Amount" body={(r: FinancePettyCashVoucher) => Number(r.amount).toFixed(2)} />
                                <Column field="payeeName" header="Payee" />
                                <Column field="expenseAccountCode" header="Expense" />
                                <Column field="status" header="Status" body={(r: FinancePettyCashVoucher) => <Tag value={r.status} />} />
                                <Column header="Actions" body={(r: FinancePettyCashVoucher) => (
                                    <div className="flex gap-1">
                                        <Button icon="pi pi-pencil" rounded text disabled={r.status === 'APPROVED' || r.status === 'VOIDED'} onClick={() => { setVoucherCrud('update'); setVoucherForm({ voucherId: r.voucherId, pettyCashAccountId: r.pettyCashAccountId, transactionDate: parseDate(r.transactionDate), voucherType: r.voucherType, amount: Number(r.amount), payeeName: r.payeeName ?? '', description: r.description, expenseAccountId: r.expenseAccountId, status: r.status, notes: r.notes ?? '' }); setVoucherVisible(true); }} />
                                        <Button icon="pi pi-check" rounded text severity="success" tooltip="Approve" disabled={r.status === 'APPROVED' || r.status === 'VOIDED'} onClick={() => approveVoucher(r.voucherId)} />
                                    </div>
                                )} />
                            </DataTable>
                        </TabPanel>

                        <TabPanel header="Replenishments">
                            <div className="flex justify-content-end mb-3"><Button label="New Replenishment" icon="pi pi-plus" onClick={() => { setReplCrud('save'); setReplForm({ ...EMPTY_REPL }); setReplVisible(true); }} /></div>
                            <DataTable value={repls} dataKey="replenishmentId" stripedRows paginator rows={10} responsiveLayout="scroll">
                                <Column field="replenishmentNumber" header="Number" />
                                <Column field="requestDate" header="Request Date" />
                                <Column field="pettyCashAccountName" header="Account" />
                                <Column field="requestedAmount" header="Requested" body={(r: FinancePettyCashReplenishment) => Number(r.requestedAmount).toFixed(2)} />
                                <Column field="disbursedAmount" header="Disbursed" body={(r: FinancePettyCashReplenishment) => r.disbursedAmount !== null ? Number(r.disbursedAmount).toFixed(2) : '—'} />
                                <Column field="sourceBankAccountCode" header="Bank" />
                                <Column field="status" header="Status" body={(r: FinancePettyCashReplenishment) => <Tag value={r.status} />} />
                                <Column header="Actions" body={(r: FinancePettyCashReplenishment) => (
                                    <div className="flex gap-1">
                                        <Button icon="pi pi-pencil" rounded text disabled={r.status === 'DISBURSED' || r.status === 'CANCELLED'} onClick={() => { setReplCrud('update'); setReplForm({ replenishmentId: r.replenishmentId, pettyCashAccountId: r.pettyCashAccountId, requestDate: parseDate(r.requestDate), requestedAmount: Number(r.requestedAmount), sourceBankAccountId: r.sourceBankAccountId, notes: r.notes ?? '' }); setReplVisible(true); }} />
                                        <Button icon="pi pi-send" rounded text severity="success" tooltip="Disburse" disabled={r.status === 'DISBURSED' || r.status === 'CANCELLED'} onClick={() => disburseRepl(r)} />
                                    </div>
                                )} />
                            </DataTable>
                        </TabPanel>
                    </TabView>
                </Card>
            </div>

            <Dialog header={acctCrud === 'save' ? 'New Petty Cash Account' : 'Edit Petty Cash Account'} visible={acctVisible} style={{ width: '620px' }} modal onHide={() => setAcctVisible(false)}>
                <div className="grid pt-3">
                    <div className="col-12 md:col-6"><label className="block mb-1">Name *</label><InputText className="w-full" value={acctForm.accountName} onChange={(e) => setAcctForm({ ...acctForm, accountName: e.target.value })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Code</label><InputText className="w-full" value={acctForm.accountCode} onChange={(e) => setAcctForm({ ...acctForm, accountCode: e.target.value })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Custodian *</label><Dropdown className="w-full" options={staffOpts} value={acctForm.custodianUserId} onChange={(e) => setAcctForm({ ...acctForm, custodianUserId: e.value })} filter /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Max Limit</label><InputNumber className="w-full" value={acctForm.maxLimit} onValueChange={(e) => setAcctForm({ ...acctForm, maxLimit: e.value ?? 0 })} mode="decimal" minFractionDigits={2} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Petty Cash GL *</label><Dropdown className="w-full" options={glOpts} value={acctForm.pettyCashGlAccountId} onChange={(e) => setAcctForm({ ...acctForm, pettyCashGlAccountId: e.value })} filter /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Default Expense Account</label><Dropdown className="w-full" options={[{ label: '— None —', value: null }, ...glOpts]} value={acctForm.defaultExpenseAccountId} onChange={(e) => setAcctForm({ ...acctForm, defaultExpenseAccountId: e.value })} filter /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Currency</label><InputText className="w-full" value={acctForm.currencyCode} onChange={(e) => setAcctForm({ ...acctForm, currencyCode: e.target.value })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Status</label><Dropdown className="w-full" options={ACCT_STATUSES} value={acctForm.status} onChange={(e) => setAcctForm({ ...acctForm, status: e.value })} /></div>
                    <div className="col-12"><label className="block mb-1">Notes</label><InputTextarea className="w-full" rows={2} value={acctForm.notes} onChange={(e) => setAcctForm({ ...acctForm, notes: e.target.value })} /></div>
                    <div className="col-12 flex justify-content-end gap-2 mt-2"><Button label="Cancel" severity="secondary" outlined onClick={() => setAcctVisible(false)} /><Button label="Save" icon="pi pi-check" onClick={saveAcct} /></div>
                </div>
            </Dialog>

            <Dialog header={voucherCrud === 'save' ? 'New Voucher' : 'Edit Voucher'} visible={voucherVisible} style={{ width: '620px' }} modal onHide={() => setVoucherVisible(false)}>
                <div className="grid pt-3">
                    <div className="col-12 md:col-6"><label className="block mb-1">Petty Cash Account *</label><Dropdown className="w-full" options={acctOpts} value={voucherForm.pettyCashAccountId} onChange={(e) => setVoucherForm({ ...voucherForm, pettyCashAccountId: e.value })} filter /></div>
                    <div className="col-12 md:col-3"><label className="block mb-1">Date</label><Calendar className="w-full" value={voucherForm.transactionDate} onChange={(e) => setVoucherForm({ ...voucherForm, transactionDate: e.value as Date | null })} dateFormat="yy-mm-dd" /></div>
                    <div className="col-12 md:col-3"><label className="block mb-1">Type</label><Dropdown className="w-full" options={VOUCHER_TYPES} value={voucherForm.voucherType} onChange={(e) => setVoucherForm({ ...voucherForm, voucherType: e.value })} /></div>
                    <div className="col-12 md:col-4"><label className="block mb-1">Amount *</label><InputNumber className="w-full" value={voucherForm.amount} onValueChange={(e) => setVoucherForm({ ...voucherForm, amount: e.value ?? 0 })} mode="decimal" minFractionDigits={2} /></div>
                    <div className="col-12 md:col-4"><label className="block mb-1">Payee</label><InputText className="w-full" value={voucherForm.payeeName} onChange={(e) => setVoucherForm({ ...voucherForm, payeeName: e.target.value })} /></div>
                    <div className="col-12 md:col-4"><label className="block mb-1">Status</label><Dropdown className="w-full" options={VOUCHER_STATUSES} value={voucherForm.status} onChange={(e) => setVoucherForm({ ...voucherForm, status: e.value })} /></div>
                    <div className="col-12"><label className="block mb-1">Expense Account *</label><Dropdown className="w-full" options={glOpts} value={voucherForm.expenseAccountId} onChange={(e) => setVoucherForm({ ...voucherForm, expenseAccountId: e.value })} filter /></div>
                    <div className="col-12"><label className="block mb-1">Description *</label><InputText className="w-full" value={voucherForm.description} onChange={(e) => setVoucherForm({ ...voucherForm, description: e.target.value })} /></div>
                    <div className="col-12"><label className="block mb-1">Notes</label><InputTextarea className="w-full" rows={2} value={voucherForm.notes} onChange={(e) => setVoucherForm({ ...voucherForm, notes: e.target.value })} /></div>
                    <div className="col-12 flex justify-content-end gap-2 mt-2"><Button label="Cancel" severity="secondary" outlined onClick={() => setVoucherVisible(false)} /><Button label="Save" icon="pi pi-check" onClick={saveVoucher} /></div>
                </div>
            </Dialog>

            <Dialog header={replCrud === 'save' ? 'New Replenishment' : 'Edit Replenishment'} visible={replVisible} style={{ width: '560px' }} modal onHide={() => setReplVisible(false)}>
                <div className="grid pt-3">
                    <div className="col-12 md:col-6"><label className="block mb-1">Petty Cash Account *</label><Dropdown className="w-full" options={acctOpts} value={replForm.pettyCashAccountId} onChange={(e) => setReplForm({ ...replForm, pettyCashAccountId: e.value })} filter /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Request Date</label><Calendar className="w-full" value={replForm.requestDate} onChange={(e) => setReplForm({ ...replForm, requestDate: e.value as Date | null })} dateFormat="yy-mm-dd" /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Requested Amount *</label><InputNumber className="w-full" value={replForm.requestedAmount} onValueChange={(e) => setReplForm({ ...replForm, requestedAmount: e.value ?? 0 })} mode="decimal" minFractionDigits={2} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Source Bank *</label><Dropdown className="w-full" options={bankOpts} value={replForm.sourceBankAccountId} onChange={(e) => setReplForm({ ...replForm, sourceBankAccountId: e.value })} filter /></div>
                    <div className="col-12"><label className="block mb-1">Notes</label><InputTextarea className="w-full" rows={2} value={replForm.notes} onChange={(e) => setReplForm({ ...replForm, notes: e.target.value })} /></div>
                    <div className="col-12 flex justify-content-end gap-2 mt-2"><Button label="Cancel" severity="secondary" outlined onClick={() => setReplVisible(false)} /><Button label="Save" icon="pi pi-check" onClick={saveRepl} /></div>
                </div>
            </Dialog>
        </div>
    );
};

export default PettyCashPage;
