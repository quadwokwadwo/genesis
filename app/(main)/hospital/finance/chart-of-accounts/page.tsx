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
import { TabView, TabPanel } from 'primereact/tabview';
import { Tag } from 'primereact/tag';
import { FinanceService } from '@/libs/blue_prints/FinanceService';
import { FinanceAccountType, FinanceGlAccount } from '@/types/finance/finance';

const EMPTY_TYPE = { accountTypeId: undefined as number | undefined, code: '', name: '', category: 'ASSET' as FinanceAccountType['category'], normalBalance: 'DEBIT' as 'DEBIT' | 'CREDIT', description: '', displayOrder: 0, isActive: true };
const EMPTY_ACCT = {
    accountId: undefined as number | undefined,
    accountCode: '',
    name: '',
    shortName: '',
    description: '',
    accountTypeId: null as number | null,
    parentAccountId: null as number | null,
    isHeaderAccount: false,
    allowPosting: true,
    requireCostCenter: false,
    isSubLedger: false,
    subLedgerType: 'NONE' as FinanceGlAccount['subLedgerType'],
    isBankAccount: false,
    bankName: '',
    bankAccountNumber: '',
    bankBranch: '',
    currencyCode: 'GHS',
    isActive: true
};

const CATEGORIES = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'].map((v) => ({ label: v, value: v }));
const BALANCES = ['DEBIT', 'CREDIT'].map((v) => ({ label: v, value: v }));
const SUB_LEDGERS = ['NONE', 'AR', 'AP', 'INVENTORY', 'FIXED_ASSET', 'BANK'].map((v) => ({ label: v, value: v }));

const ChartOfAccountsPage = () => {
    const toast = useRef<Toast>(null);
    const [types, setTypes] = useState<FinanceAccountType[]>([]);
    const [accounts, setAccounts] = useState<FinanceGlAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [typeVisible, setTypeVisible] = useState(false);
    const [acctVisible, setAcctVisible] = useState(false);
    const [typeCrud, setTypeCrud] = useState<'save' | 'update'>('save');
    const [acctCrud, setAcctCrud] = useState<'save' | 'update'>('save');
    const [typeForm, setTypeForm] = useState({ ...EMPTY_TYPE });
    const [acctForm, setAcctForm] = useState({ ...EMPTY_ACCT });

    const load = async () => {
        setLoading(true);
        const [t, a] = await Promise.all([FinanceService.listAccountTypes(), FinanceService.listGlAccounts()]);
        setTypes(Array.isArray(t.operatedData) ? t.operatedData : []);
        setAccounts(Array.isArray(a.operatedData) ? a.operatedData : []);
        setLoading(false);
    };

    useEffect(() => {
        document.title = 'Finance · Chart of Accounts';
        void load();
    }, []);

    const typeOptions = useMemo(() => types.map((t) => ({ label: `${t.code} · ${t.name}`, value: t.accountTypeId })), [types]);
    const parentOptions = useMemo(() => [{ label: '— None —', value: null }, ...accounts.filter((a) => a.isHeaderAccount === 1 && a.accountId !== acctForm.accountId).map((a) => ({ label: `${a.accountCode} · ${a.name}`, value: a.accountId }))], [accounts, acctForm.accountId]);

    const handle = (op: number, label: string) => {
        if (op === 3) { toast.current?.show({ severity: 'warn', summary: 'Duplicate', detail: `${label} code already exists.` }); return false; }
        if (op !== 1 && op !== 2) { toast.current?.show({ severity: 'error', summary: 'Failed', detail: `Could not save ${label}.` }); return false; }
        toast.current?.show({ severity: 'success', summary: 'Saved', detail: `${label} saved.` });
        return true;
    };

    const saveType = async () => {
        if (!typeForm.code.trim() || !typeForm.name.trim()) { toast.current?.show({ severity: 'warn', summary: 'Missing', detail: 'Code and name required.' }); return; }
        const r = await FinanceService.upsertAccountType({ crudType: typeCrud, ...typeForm });
        if (handle(Number(r.operationalStatus), 'Account type')) { setTypeVisible(false); await load(); }
    };

    const saveAcct = async () => {
        if (!acctForm.accountCode.trim() || !acctForm.name.trim() || !acctForm.accountTypeId) { toast.current?.show({ severity: 'warn', summary: 'Missing', detail: 'Code, name and type required.' }); return; }
        const r = await FinanceService.upsertGlAccount({ crudType: acctCrud, ...acctForm });
        if (handle(Number(r.operationalStatus), 'Account')) { setAcctVisible(false); await load(); }
    };

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12">
                <Card title="Chart of Accounts">
                    <TabView>
                        <TabPanel header="GL Accounts">
                            <div className="flex justify-content-end mb-3">
                                <Button label="New Account" icon="pi pi-plus" onClick={() => { setAcctCrud('save'); setAcctForm({ ...EMPTY_ACCT }); setAcctVisible(true); }} />
                            </div>
                            <DataTable value={accounts} loading={loading} paginator rows={20} dataKey="accountId" stripedRows responsiveLayout="scroll">
                                <Column field="accountCode" header="Code" sortable />
                                <Column field="name" header="Name" sortable />
                                <Column field="accountTypeName" header="Type" />
                                <Column field="accountCategory" header="Category" />
                                <Column field="normalBalance" header="Bal" />
                                <Column field="subLedgerType" header="Sub" />
                                <Column header="Bank" body={(r: FinanceGlAccount) => (r.isBankAccount ? <Tag severity="info" value="Bank" /> : null)} />
                                <Column header="Active" body={(r: FinanceGlAccount) => <Tag severity={r.isActive ? 'success' : 'danger'} value={r.isActive ? 'Yes' : 'No'} />} />
                                <Column header="Actions" body={(r: FinanceGlAccount) => (
                                    <Button icon="pi pi-pencil" rounded text onClick={() => {
                                        setAcctCrud('update');
                                        setAcctForm({
                                            accountId: r.accountId,
                                            accountCode: r.accountCode,
                                            name: r.name,
                                            shortName: r.shortName ?? '',
                                            description: r.description ?? '',
                                            accountTypeId: r.accountTypeId,
                                            parentAccountId: r.parentAccountId,
                                            isHeaderAccount: r.isHeaderAccount === 1,
                                            allowPosting: r.allowPosting === 1,
                                            requireCostCenter: r.requireCostCenter === 1,
                                            isSubLedger: r.isSubLedger === 1,
                                            subLedgerType: r.subLedgerType,
                                            isBankAccount: r.isBankAccount === 1,
                                            bankName: r.bankName ?? '',
                                            bankAccountNumber: r.bankAccountNumber ?? '',
                                            bankBranch: r.bankBranch ?? '',
                                            currencyCode: r.currencyCode,
                                            isActive: r.isActive === 1
                                        });
                                        setAcctVisible(true);
                                    }} />
                                )} />
                            </DataTable>
                        </TabPanel>
                        <TabPanel header="Account Types">
                            <div className="flex justify-content-end mb-3">
                                <Button label="New Type" icon="pi pi-plus" onClick={() => { setTypeCrud('save'); setTypeForm({ ...EMPTY_TYPE }); setTypeVisible(true); }} />
                            </div>
                            <DataTable value={types} loading={loading} dataKey="accountTypeId" stripedRows responsiveLayout="scroll">
                                <Column field="code" header="Code" />
                                <Column field="name" header="Name" />
                                <Column field="category" header="Category" />
                                <Column field="normalBalance" header="Normal Balance" />
                                <Column field="displayOrder" header="Order" />
                                <Column header="Actions" body={(r: FinanceAccountType) => (
                                    <Button icon="pi pi-pencil" rounded text onClick={() => {
                                        setTypeCrud('update');
                                        setTypeForm({ accountTypeId: r.accountTypeId, code: r.code, name: r.name, category: r.category, normalBalance: r.normalBalance, description: r.description ?? '', displayOrder: r.displayOrder, isActive: r.isActive === 1 });
                                        setTypeVisible(true);
                                    }} />
                                )} />
                            </DataTable>
                        </TabPanel>
                    </TabView>
                </Card>
            </div>

            <Dialog header={typeCrud === 'save' ? 'New Account Type' : 'Edit Account Type'} visible={typeVisible} style={{ width: '460px' }} modal onHide={() => setTypeVisible(false)}>
                <div className="flex flex-column gap-3 pt-3">
                    <div><label className="block mb-1">Code *</label><InputText className="w-full" value={typeForm.code} onChange={(e) => setTypeForm({ ...typeForm, code: e.target.value })} /></div>
                    <div><label className="block mb-1">Name *</label><InputText className="w-full" value={typeForm.name} onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })} /></div>
                    <div><label className="block mb-1">Category</label><Dropdown className="w-full" options={CATEGORIES} value={typeForm.category} onChange={(e) => setTypeForm({ ...typeForm, category: e.value })} /></div>
                    <div><label className="block mb-1">Normal Balance</label><Dropdown className="w-full" options={BALANCES} value={typeForm.normalBalance} onChange={(e) => setTypeForm({ ...typeForm, normalBalance: e.value })} /></div>
                    <div><label className="block mb-1">Display Order</label><InputNumber className="w-full" value={typeForm.displayOrder} onValueChange={(e) => setTypeForm({ ...typeForm, displayOrder: e.value ?? 0 })} /></div>
                    <div className="flex align-items-center gap-2"><InputSwitch checked={typeForm.isActive} onChange={(e) => setTypeForm({ ...typeForm, isActive: !!e.value })} /><span>Active</span></div>
                    <div className="flex justify-content-end gap-2 mt-2"><Button label="Cancel" severity="secondary" outlined onClick={() => setTypeVisible(false)} /><Button label="Save" icon="pi pi-check" onClick={saveType} /></div>
                </div>
            </Dialog>

            <Dialog header={acctCrud === 'save' ? 'New GL Account' : 'Edit GL Account'} visible={acctVisible} style={{ width: '600px' }} modal onHide={() => setAcctVisible(false)}>
                <div className="grid pt-3">
                    <div className="col-12 md:col-6"><label className="block mb-1">Code *</label><InputText className="w-full" value={acctForm.accountCode} onChange={(e) => setAcctForm({ ...acctForm, accountCode: e.target.value })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Currency</label><InputText className="w-full" value={acctForm.currencyCode} onChange={(e) => setAcctForm({ ...acctForm, currencyCode: e.target.value })} /></div>
                    <div className="col-12"><label className="block mb-1">Name *</label><InputText className="w-full" value={acctForm.name} onChange={(e) => setAcctForm({ ...acctForm, name: e.target.value })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Short Name</label><InputText className="w-full" value={acctForm.shortName} onChange={(e) => setAcctForm({ ...acctForm, shortName: e.target.value })} /></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Account Type *</label><Dropdown className="w-full" options={typeOptions} value={acctForm.accountTypeId} onChange={(e) => setAcctForm({ ...acctForm, accountTypeId: e.value })} filter /></div>
                    <div className="col-12"><label className="block mb-1">Parent Account</label><Dropdown className="w-full" options={parentOptions} value={acctForm.parentAccountId} onChange={(e) => setAcctForm({ ...acctForm, parentAccountId: e.value })} filter /></div>
                    <div className="col-12"><label className="block mb-1">Description</label><InputTextarea className="w-full" rows={2} value={acctForm.description} onChange={(e) => setAcctForm({ ...acctForm, description: e.target.value })} /></div>
                    <div className="col-6 flex align-items-center gap-2"><InputSwitch checked={acctForm.isHeaderAccount} onChange={(e) => setAcctForm({ ...acctForm, isHeaderAccount: !!e.value, allowPosting: e.value ? false : acctForm.allowPosting })} /><span>Header</span></div>
                    <div className="col-6 flex align-items-center gap-2"><InputSwitch checked={acctForm.allowPosting} onChange={(e) => setAcctForm({ ...acctForm, allowPosting: !!e.value })} /><span>Allow Posting</span></div>
                    <div className="col-6 flex align-items-center gap-2"><InputSwitch checked={acctForm.requireCostCenter} onChange={(e) => setAcctForm({ ...acctForm, requireCostCenter: !!e.value })} /><span>Require Cost Center</span></div>
                    <div className="col-6 flex align-items-center gap-2"><InputSwitch checked={acctForm.isSubLedger} onChange={(e) => setAcctForm({ ...acctForm, isSubLedger: !!e.value })} /><span>Sub-Ledger</span></div>
                    <div className="col-12 md:col-6"><label className="block mb-1">Sub-Ledger Type</label><Dropdown className="w-full" options={SUB_LEDGERS} value={acctForm.subLedgerType} onChange={(e) => setAcctForm({ ...acctForm, subLedgerType: e.value })} /></div>
                    <div className="col-12 md:col-6 flex align-items-center gap-2"><InputSwitch checked={acctForm.isBankAccount} onChange={(e) => setAcctForm({ ...acctForm, isBankAccount: !!e.value })} /><span>Is Bank Account</span></div>
                    {acctForm.isBankAccount && (
                        <>
                            <div className="col-12 md:col-6"><label className="block mb-1">Bank Name</label><InputText className="w-full" value={acctForm.bankName} onChange={(e) => setAcctForm({ ...acctForm, bankName: e.target.value })} /></div>
                            <div className="col-12 md:col-6"><label className="block mb-1">Account Number</label><InputText className="w-full" value={acctForm.bankAccountNumber} onChange={(e) => setAcctForm({ ...acctForm, bankAccountNumber: e.target.value })} /></div>
                            <div className="col-12 md:col-6"><label className="block mb-1">Branch</label><InputText className="w-full" value={acctForm.bankBranch} onChange={(e) => setAcctForm({ ...acctForm, bankBranch: e.target.value })} /></div>
                        </>
                    )}
                    <div className="col-12 flex align-items-center gap-2"><InputSwitch checked={acctForm.isActive} onChange={(e) => setAcctForm({ ...acctForm, isActive: !!e.value })} /><span>Active</span></div>
                    <div className="col-12 flex justify-content-end gap-2 mt-2"><Button label="Cancel" severity="secondary" outlined onClick={() => setAcctVisible(false)} /><Button label="Save" icon="pi pi-check" onClick={saveAcct} /></div>
                </div>
            </Dialog>
        </div>
    );
};

export default ChartOfAccountsPage;
