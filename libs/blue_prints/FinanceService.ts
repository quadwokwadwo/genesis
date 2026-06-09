import axiosFetch from '@/libs/axiosConfig';
import {
    FinanceFiscalYear,
    FinanceFiscalPeriod,
    FinanceAccountType,
    FinanceGlAccount,
    FinanceCostCenter,
    FinanceJournalEntry,
    FinanceJournalEntryLine,
    FinanceVendor,
    FinanceApInvoice,
    FinanceApInvoiceLine,
    FinanceVendorPayment,
    FinanceBudget,
    FinanceBudgetLine,
    FinanceBankReconciliation,
    FinanceBankReconciliationItem,
    FinancePostingMapping,
    FinancePostingMappingLine,
    FinancePostingLog,
    FinancePettyCashAccount,
    FinancePettyCashVoucher,
    FinancePettyCashReplenishment,
    FinanceJournalTemplate,
    FinanceJournalTemplateLine,
    FinanceAccountBalance,
    PostFinanceEventPayload
} from '@/types/finance/finance';

const NO_STORE = { cache: 'no-store' as RequestCache };

function envelope<T>(r: any): { operatedData: T; status: number; operationalStatus: number } {
    return { operatedData: r.data.operatedData as unknown as T, status: r.status, operationalStatus: r.data.status };
}

function qs(filters?: Record<string, any>): string {
    if (!filters) return '';
    const parts: string[] = [];
    Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
    });
    return parts.length ? `?${parts.join('&')}` : '';
}

class FinanceService {
    // -------- Fiscal Years / Periods --------
    static async listFiscalYears() {
        const r = await axiosFetch<FinanceFiscalYear[]>('GET', '/api/finance/fiscal-years', NO_STORE);
        return envelope<FinanceFiscalYear[]>(r);
    }
    static async upsertFiscalYear(payload: any) {
        const r = await axiosFetch<FinanceFiscalYear>('POST', '/api/finance/fiscal-years', payload);
        return envelope<FinanceFiscalYear>(r);
    }
    static async listFiscalPeriods(fiscalYearId?: number) {
        const r = await axiosFetch<FinanceFiscalPeriod[]>('GET', `/api/finance/fiscal-periods${qs({ fiscalYearId })}`, NO_STORE);
        return envelope<FinanceFiscalPeriod[]>(r);
    }
    static async upsertFiscalPeriod(payload: any) {
        const r = await axiosFetch<FinanceFiscalPeriod>('POST', '/api/finance/fiscal-periods', payload);
        return envelope<FinanceFiscalPeriod>(r);
    }
    static async generateMonthlyPeriods(yearId: number, payload: any = {}) {
        const r = await axiosFetch<{ createdCount: number }>('POST', `/api/finance/fiscal-years/${yearId}/generate-monthly`, payload);
        return envelope<{ createdCount: number }>(r);
    }
    static async closeFiscalPeriod(periodId: number, payload: any = {}) {
        const r = await axiosFetch<FinanceFiscalPeriod>('POST', `/api/finance/fiscal-periods/${periodId}/close`, payload);
        return envelope<FinanceFiscalPeriod>(r);
    }

    // -------- Account Types / GL Accounts / Cost Centers --------
    static async listAccountTypes() {
        const r = await axiosFetch<FinanceAccountType[]>('GET', '/api/finance/account-types', NO_STORE);
        return envelope<FinanceAccountType[]>(r);
    }
    static async upsertAccountType(payload: any) {
        const r = await axiosFetch<FinanceAccountType>('POST', '/api/finance/account-types', payload);
        return envelope<FinanceAccountType>(r);
    }
    static async listGlAccounts(filters?: { isActive?: number; allowPosting?: number; accountTypeId?: number; subLedgerType?: string; isBankAccount?: number }) {
        const r = await axiosFetch<FinanceGlAccount[]>('GET', `/api/finance/gl-accounts${qs(filters)}`, NO_STORE);
        return envelope<FinanceGlAccount[]>(r);
    }
    static async upsertGlAccount(payload: any) {
        const r = await axiosFetch<FinanceGlAccount>('POST', '/api/finance/gl-accounts', payload);
        return envelope<FinanceGlAccount>(r);
    }
    static async listCostCenters() {
        const r = await axiosFetch<FinanceCostCenter[]>('GET', '/api/finance/cost-centers', NO_STORE);
        return envelope<FinanceCostCenter[]>(r);
    }
    static async upsertCostCenter(payload: any) {
        const r = await axiosFetch<FinanceCostCenter>('POST', '/api/finance/cost-centers', payload);
        return envelope<FinanceCostCenter>(r);
    }

    // -------- Account Balances --------
    static async listAccountBalances(filters?: { fiscalPeriodId?: number; accountId?: number }) {
        const r = await axiosFetch<FinanceAccountBalance[]>('GET', `/api/finance/account-balances${qs(filters)}`, NO_STORE);
        return envelope<FinanceAccountBalance[]>(r);
    }

    // -------- Posting Mappings / Post Event / Log --------
    static async listPostingMappings() {
        const r = await axiosFetch<FinancePostingMapping[]>('GET', '/api/finance/posting-mappings', NO_STORE);
        return envelope<FinancePostingMapping[]>(r);
    }
    static async listPostingMappingLines(mappingId: number) {
        const r = await axiosFetch<FinancePostingMappingLine[]>('GET', `/api/finance/posting-mapping-lines${qs({ mappingId })}`, NO_STORE);
        return envelope<FinancePostingMappingLine[]>(r);
    }
    static async upsertPostingMapping(payload: any) {
        const r = await axiosFetch<FinancePostingMapping>('POST', '/api/finance/posting-mappings', payload);
        return envelope<FinancePostingMapping>(r);
    }
    static async postEvent(payload: PostFinanceEventPayload) {
        const r = await axiosFetch<{ journalEntryId: number | null }>('POST', '/api/finance/post-event', payload);
        return envelope<{ journalEntryId: number | null }>(r);
    }
    static async listPostingLog(filters?: { eventType?: string; referenceType?: string; referenceId?: number; status?: string }) {
        const r = await axiosFetch<FinancePostingLog[]>('GET', `/api/finance/posting-log${qs(filters)}`, NO_STORE);
        return envelope<FinancePostingLog[]>(r);
    }
}

class FinanceJournalService {
    static async listJournalEntries(filters?: { journalEntryId?: number; fiscalPeriodId?: number; status?: string; fromDate?: string; toDate?: string }) {
        const r = await axiosFetch<FinanceJournalEntry[]>('GET', `/api/finance/journal-entries${qs(filters)}`, NO_STORE);
        return envelope<FinanceJournalEntry[]>(r);
    }
    static async getJournalLines(journalEntryId: number) {
        const r = await axiosFetch<FinanceJournalEntryLine[]>('GET', `/api/finance/journal-entry-lines${qs({ journalEntryId })}`, NO_STORE);
        return envelope<FinanceJournalEntryLine[]>(r);
    }
    static async upsertJournalEntry(payload: any) {
        const r = await axiosFetch<FinanceJournalEntry>('POST', '/api/finance/journal-entries', payload);
        return envelope<FinanceJournalEntry>(r);
    }
    static async postJournalEntry(id: number, payload: any = {}) {
        const r = await axiosFetch<FinanceJournalEntry>('POST', `/api/finance/journal-entries/${id}/post`, payload);
        return envelope<FinanceJournalEntry>(r);
    }
    static async reverseJournalEntry(id: number, payload: any = {}) {
        const r = await axiosFetch<{ reversalEntryId: number }>('POST', `/api/finance/journal-entries/${id}/reverse`, payload);
        return envelope<{ reversalEntryId: number }>(r);
    }
    static async listTemplates() {
        const r = await axiosFetch<FinanceJournalTemplate[]>('GET', '/api/finance/journal-templates', NO_STORE);
        return envelope<FinanceJournalTemplate[]>(r);
    }
    static async getTemplateLines(templateId: number) {
        const r = await axiosFetch<FinanceJournalTemplateLine[]>('GET', `/api/finance/journal-template-lines${qs({ templateId })}`, NO_STORE);
        return envelope<FinanceJournalTemplateLine[]>(r);
    }
    static async upsertTemplate(payload: any) {
        const r = await axiosFetch<FinanceJournalTemplate>('POST', '/api/finance/journal-templates', payload);
        return envelope<FinanceJournalTemplate>(r);
    }
    static async generateFromTemplate(id: number, payload: { entryDate: string; amountOverride?: number; description?: string; createdByUserId: number }) {
        const r = await axiosFetch<FinanceJournalEntry>('POST', `/api/finance/journal-templates/${id}/generate`, payload);
        return envelope<FinanceJournalEntry>(r);
    }
}

class FinanceApService {
    static async listVendors() {
        const r = await axiosFetch<FinanceVendor[]>('GET', '/api/finance/vendors', NO_STORE);
        return envelope<FinanceVendor[]>(r);
    }
    static async upsertVendor(payload: any) {
        const r = await axiosFetch<FinanceVendor>('POST', '/api/finance/vendors', payload);
        return envelope<FinanceVendor>(r);
    }
    static async listApInvoices(filters?: { apInvoiceId?: number; vendorId?: number; status?: string }) {
        const r = await axiosFetch<FinanceApInvoice[]>('GET', `/api/finance/ap-invoices${qs(filters)}`, NO_STORE);
        return envelope<FinanceApInvoice[]>(r);
    }
    static async getApInvoiceLines(apInvoiceId: number) {
        const r = await axiosFetch<FinanceApInvoiceLine[]>('GET', `/api/finance/ap-invoice-lines${qs({ apInvoiceId })}`, NO_STORE);
        return envelope<FinanceApInvoiceLine[]>(r);
    }
    static async upsertApInvoice(payload: any) {
        const r = await axiosFetch<FinanceApInvoice>('POST', '/api/finance/ap-invoices', payload);
        return envelope<FinanceApInvoice>(r);
    }
    static async approveApInvoice(id: number, payload: any = {}) {
        const r = await axiosFetch<FinanceApInvoice>('POST', `/api/finance/ap-invoices/${id}/approve`, payload);
        return envelope<FinanceApInvoice>(r);
    }
    static async listVendorPayments(filters?: { vendorPaymentId?: number; vendorId?: number; status?: string }) {
        const r = await axiosFetch<FinanceVendorPayment[]>('GET', `/api/finance/vendor-payments${qs(filters)}`, NO_STORE);
        return envelope<FinanceVendorPayment[]>(r);
    }
    static async upsertVendorPayment(payload: any) {
        const r = await axiosFetch<FinanceVendorPayment>('POST', '/api/finance/vendor-payments', payload);
        return envelope<FinanceVendorPayment>(r);
    }
    static async postVendorPayment(id: number, payload: any = {}) {
        const r = await axiosFetch<FinanceVendorPayment>('POST', `/api/finance/vendor-payments/${id}/post`, payload);
        return envelope<FinanceVendorPayment>(r);
    }
}

class FinanceBudgetService {
    static async listBudgets(filters?: { fiscalYearId?: number; costCenterId?: number; status?: string }) {
        const r = await axiosFetch<FinanceBudget[]>('GET', `/api/finance/budgets${qs(filters)}`, NO_STORE);
        return envelope<FinanceBudget[]>(r);
    }
    static async upsertBudget(payload: any) {
        const r = await axiosFetch<FinanceBudget>('POST', '/api/finance/budgets', payload);
        return envelope<FinanceBudget>(r);
    }
    static async listBudgetLines(budgetId: number) {
        const r = await axiosFetch<FinanceBudgetLine[]>('GET', `/api/finance/budget-lines${qs({ budgetId })}`, NO_STORE);
        return envelope<FinanceBudgetLine[]>(r);
    }
    static async upsertBudgetLine(payload: any) {
        const r = await axiosFetch<FinanceBudgetLine>('POST', '/api/finance/budget-lines', payload);
        return envelope<FinanceBudgetLine>(r);
    }
    static async removeBudgetLine(id: number) {
        const r = await axiosFetch<{ deleted: boolean }>('DELETE', `/api/finance/budget-lines/${id}`, NO_STORE);
        return envelope<{ deleted: boolean }>(r);
    }
}

class FinanceBankService {
    static async listReconciliations(filters?: { bankAccountId?: number; status?: string }) {
        const r = await axiosFetch<FinanceBankReconciliation[]>('GET', `/api/finance/bank-reconciliations${qs(filters)}`, NO_STORE);
        return envelope<FinanceBankReconciliation[]>(r);
    }
    static async upsertReconciliation(payload: any) {
        const r = await axiosFetch<FinanceBankReconciliation>('POST', '/api/finance/bank-reconciliations', payload);
        return envelope<FinanceBankReconciliation>(r);
    }
    static async listReconciliationItems(reconciliationId: number) {
        const r = await axiosFetch<FinanceBankReconciliationItem[]>('GET', `/api/finance/bank-reconciliation-items${qs({ reconciliationId })}`, NO_STORE);
        return envelope<FinanceBankReconciliationItem[]>(r);
    }
    static async upsertReconciliationItem(payload: any) {
        const r = await axiosFetch<FinanceBankReconciliationItem>('POST', '/api/finance/bank-reconciliation-items', payload);
        return envelope<FinanceBankReconciliationItem>(r);
    }
    static async completeReconciliation(id: number, payload: any = {}) {
        const r = await axiosFetch<FinanceBankReconciliation>('POST', `/api/finance/bank-reconciliations/${id}/complete`, payload);
        return envelope<FinanceBankReconciliation>(r);
    }
}

class FinancePettyCashService {
    static async listAccounts() {
        const r = await axiosFetch<FinancePettyCashAccount[]>('GET', '/api/finance/petty-cash-accounts', NO_STORE);
        return envelope<FinancePettyCashAccount[]>(r);
    }
    static async upsertAccount(payload: any) {
        const r = await axiosFetch<FinancePettyCashAccount>('POST', '/api/finance/petty-cash-accounts', payload);
        return envelope<FinancePettyCashAccount>(r);
    }
    static async listVouchers(filters?: { pettyCashAccountId?: number; status?: string }) {
        const r = await axiosFetch<FinancePettyCashVoucher[]>('GET', `/api/finance/petty-cash-vouchers${qs(filters)}`, NO_STORE);
        return envelope<FinancePettyCashVoucher[]>(r);
    }
    static async upsertVoucher(payload: any) {
        const r = await axiosFetch<FinancePettyCashVoucher>('POST', '/api/finance/petty-cash-vouchers', payload);
        return envelope<FinancePettyCashVoucher>(r);
    }
    static async approveVoucher(id: number, payload: any = {}) {
        const r = await axiosFetch<FinancePettyCashVoucher>('POST', `/api/finance/petty-cash-vouchers/${id}/approve`, payload);
        return envelope<FinancePettyCashVoucher>(r);
    }
    static async listReplenishments(filters?: { pettyCashAccountId?: number; status?: string }) {
        const r = await axiosFetch<FinancePettyCashReplenishment[]>('GET', `/api/finance/petty-cash-replenishments${qs(filters)}`, NO_STORE);
        return envelope<FinancePettyCashReplenishment[]>(r);
    }
    static async upsertReplenishment(payload: any) {
        const r = await axiosFetch<FinancePettyCashReplenishment>('POST', '/api/finance/petty-cash-replenishments', payload);
        return envelope<FinancePettyCashReplenishment>(r);
    }
    static async disburseReplenishment(id: number, payload: { amount: number; disbursedByUserId: number }) {
        const r = await axiosFetch<FinancePettyCashReplenishment>('POST', `/api/finance/petty-cash-replenishments/${id}/disburse`, payload);
        return envelope<FinancePettyCashReplenishment>(r);
    }
}

export { FinanceService, FinanceJournalService, FinanceApService, FinanceBudgetService, FinanceBankService, FinancePettyCashService };
export default FinanceService;
