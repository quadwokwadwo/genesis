// Finance module domain types — mirror MySQL view shapes.

export type Bool01 = 0 | 1;
export type CrudType = 'save' | 'update';

export interface FinanceFiscalYear {
    fiscalYearId: number;
    yearCode: string;
    name: string;
    startDate: string;
    endDate: string;
    status: 'UPCOMING' | 'OPEN' | 'CLOSED' | 'LOCKED';
    closedAt: string | null;
    closedByUserId: number | null;
    notes: string | null;
    periodCount: number;
    openPeriodCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface FinanceFiscalPeriod {
    fiscalPeriodId: number;
    fiscalYearId: number;
    periodNumber: number;
    name: string;
    shortName: string | null;
    startDate: string;
    endDate: string;
    glStatus: 'OPEN' | 'CLOSED' | 'LOCKED';
    closedAt: string | null;
    closedByUserId: number | null;
    yearCode: string;
    fiscalYearName: string;
    fiscalYearStatus: string;
    createdAt: string;
    updatedAt: string;
}

export interface FinanceAccountType {
    accountTypeId: number;
    code: string;
    name: string;
    category: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
    normalBalance: 'DEBIT' | 'CREDIT';
    description: string | null;
    displayOrder: number;
    isActive: Bool01;
}

export interface FinanceGlAccount {
    accountId: number;
    accountCode: string;
    name: string;
    shortName: string | null;
    description: string | null;
    accountTypeId: number;
    accountTypeCode: string;
    accountTypeName: string;
    accountCategory: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
    parentAccountId: number | null;
    parentAccountCode: string | null;
    parentAccountName: string | null;
    accountLevel: number;
    isHeaderAccount: Bool01;
    normalBalance: 'DEBIT' | 'CREDIT';
    allowPosting: Bool01;
    requireCostCenter: Bool01;
    isSubLedger: Bool01;
    subLedgerType: 'AR' | 'AP' | 'INVENTORY' | 'FIXED_ASSET' | 'BANK' | 'NONE';
    isBankAccount: Bool01;
    bankName: string | null;
    bankAccountNumber: string | null;
    bankBranch: string | null;
    currencyCode: string;
    isActive: Bool01;
    createdAt: string;
    updatedAt: string;
}

export interface FinanceCostCenter {
    costCenterId: number;
    code: string;
    name: string;
    description: string | null;
    costCenterType: 'REVENUE' | 'EXPENSE' | 'INVESTMENT' | 'SUPPORT';
    parentCostCenterId: number | null;
    parentCostCenterCode: string | null;
    parentCostCenterName: string | null;
    managerUserId: number | null;
    managerFirstName: string | null;
    managerLastName: string | null;
    annualBudget: number | null;
    isActive: Bool01;
    createdAt: string;
    updatedAt: string;
}

export interface FinanceJournalEntry {
    journalEntryId: number;
    journalNumber: string;
    fiscalYearId: number;
    fiscalYearCode: string;
    fiscalPeriodId: number;
    fiscalPeriodName: string;
    journalType: 'STANDARD' | 'ADJUSTING' | 'CLOSING' | 'REVERSING' | 'RECURRING' | 'OPENING';
    entryDate: string;
    postingDate: string | null;
    referenceType: string | null;
    referenceId: number | null;
    referenceNumber: string | null;
    description: string;
    totalDebit: number;
    totalCredit: number;
    currencyCode: string;
    exchangeRate: number;
    status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'POSTED' | 'REVERSED' | 'CANCELLED';
    approvedByUserId: number | null;
    approvedAt: string | null;
    postedByUserId: number | null;
    postedAt: string | null;
    isReversed: Bool01;
    reversalJournalEntryId: number | null;
    reversedAt: string | null;
    reversedByUserId: number | null;
    templateId: number | null;
    notes: string | null;
    createdByUserId: number;
    createdFirstName: string | null;
    createdLastName: string | null;
    approvedFirstName: string | null;
    approvedLastName: string | null;
    postedFirstName: string | null;
    postedLastName: string | null;
    lineCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface FinanceJournalEntryLine {
    journalLineId: number;
    journalEntryId: number;
    journalNumber: string;
    entryDate: string;
    journalStatus: string;
    lineNumber: number;
    accountId: number;
    accountCode: string;
    accountName: string;
    normalBalance: 'DEBIT' | 'CREDIT';
    description: string | null;
    debitAmount: number;
    creditAmount: number;
    costCenterId: number | null;
    costCenterCode: string | null;
    costCenterName: string | null;
    referenceType: string | null;
    referenceId: number | null;
    createdAt: string;
}

export interface FinanceVendor {
    vendorId: number;
    vendorCode: string;
    vendorName: string;
    contactPerson: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    taxIdentificationNumber: string | null;
    bankName: string | null;
    bankAccountNumber: string | null;
    paymentTermsDays: number;
    currencyCode: string;
    defaultApAccountId: number | null;
    defaultExpenseAccountId: number | null;
    outstandingAmount: number;
    openInvoiceCount: number;
    isActive: Bool01;
    createdAt: string;
    updatedAt: string;
}

export interface FinanceApInvoice {
    apInvoiceId: number;
    invoiceNumber: string;
    vendorId: number;
    vendorCode: string;
    vendorName: string;
    vendorInvoiceNumber: string;
    vendorInvoiceDate: string;
    invoiceDate: string;
    dueDate: string;
    subtotalAmount: number;
    discountAmount: number;
    taxAmount: number;
    otherCharges: number;
    totalAmount: number;
    paidAmount: number;
    balanceAmount: number;
    currencyCode: string;
    apAccountId: number | null;
    apAccountCode: string | null;
    apAccountName: string | null;
    costCenterId: number | null;
    costCenterCode: string | null;
    costCenterName: string | null;
    status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'POSTED' | 'PARTIAL_PAID' | 'PAID' | 'CANCELLED' | 'DISPUTED';
    isOverdue: Bool01;
    notes: string | null;
    journalEntryId: number | null;
    createdAt: string;
    updatedAt: string;
}

export interface FinanceApInvoiceLine {
    apInvoiceLineId: number;
    apInvoiceId: number;
    lineNumber: number;
    description: string;
    quantity: number;
    unitPrice: number;
    lineAmount: number;
    taxAmount: number;
    expenseAccountId: number;
    expenseAccountCode: string;
    expenseAccountName: string;
    costCenterId: number | null;
    costCenterCode: string | null;
    costCenterName: string | null;
}

export interface FinanceVendorPayment {
    vendorPaymentId: number;
    paymentNumber: string;
    vendorId: number;
    vendorCode: string;
    vendorName: string;
    paymentDate: string;
    paymentMethod: 'CHEQUE' | 'BANK_TRANSFER' | 'CASH' | 'MOBILE_MONEY' | 'OTHER';
    chequeNumber: string | null;
    chequeDate: string | null;
    bankAccountId: number | null;
    bankAccountCode: string | null;
    bankAccountName: string | null;
    transactionReference: string | null;
    paymentAmount: number;
    deductionAmount: number;
    deductionReason: string | null;
    status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'POSTED' | 'CANCELLED' | 'BOUNCED';
    allocationCount: number;
    totalAllocated: number;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface FinanceBudget {
    budgetId: number;
    budgetCode: string;
    name: string;
    description: string | null;
    fiscalYearId: number;
    fiscalYearCode: string;
    fiscalYearName: string;
    budgetType: 'OPERATING' | 'CAPITAL' | 'PROJECT' | 'DEPARTMENT';
    costCenterId: number | null;
    costCenterCode: string | null;
    costCenterName: string | null;
    totalBudgetAmount: number;
    status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'ACTIVE' | 'CLOSED';
    lineCount: number;
    sumLineBudget: number;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface FinanceBudgetLine {
    budgetLineId: number;
    budgetId: number;
    accountId: number;
    accountCode: string;
    accountName: string;
    costCenterId: number | null;
    costCenterCode: string | null;
    costCenterName: string | null;
    annualBudget: number;
    notes: string | null;
}

export interface FinanceBankReconciliation {
    reconciliationId: number;
    reconciliationNumber: string;
    bankAccountId: number;
    bankAccountCode: string;
    bankAccountName: string;
    statementDate: string;
    statementEndingBalance: number;
    bookBalance: number;
    reconciledBalance: number | null;
    difference: number | null;
    outstandingDeposits: number;
    outstandingChecks: number;
    status: 'IN_PROGRESS' | 'COMPLETED' | 'POSTED';
    completedAt: string | null;
    completedFirstName: string | null;
    completedLastName: string | null;
    itemCount: number;
    reconciledCount: number;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface FinanceBankReconciliationItem {
    reconciliationItemId: number;
    reconciliationId: number;
    transactionType: 'CHECK' | 'DEPOSIT' | 'TRANSFER' | 'BANK_CHARGE' | 'INTEREST' | 'OTHER';
    transactionDate: string;
    referenceNumber: string | null;
    description: string | null;
    amount: number;
    isDebit: Bool01;
    isReconciled: Bool01;
    reconciledAt: string | null;
}

export interface FinancePostingMapping {
    mappingId: number;
    eventType: string;
    description: string | null;
    isActive: Bool01;
    lineCount: number;
}

export interface FinancePostingMappingLine {
    mappingLineId: number;
    mappingId: number;
    sequence: number;
    entryType: 'DEBIT' | 'CREDIT';
    accountSource: string;
    fixedAccountId: number | null;
    fixedAccountCode: string | null;
    fixedAccountName: string | null;
    amountSource: 'TRANSACTION_AMOUNT' | 'COST_AMOUNT' | 'TAX_AMOUNT' | 'DISCOUNT_AMOUNT' | 'OTHER_AMOUNT';
    description: string | null;
}

export interface FinancePostingLog {
    logId: number;
    eventType: string;
    referenceType: string;
    referenceId: number;
    journalEntryId: number | null;
    journalNumber: string | null;
    journalStatus: string | null;
    entryDate: string | null;
    status: 'SUCCESS' | 'FAILED' | 'SKIPPED';
    errorMessage: string | null;
    createdAt: string;
}

export interface FinancePettyCashAccount {
    pettyCashAccountId: number;
    accountName: string;
    accountCode: string | null;
    custodianUserId: number;
    custodianFirstName: string | null;
    custodianLastName: string | null;
    maxLimit: number;
    currentBalance: number;
    pettyCashGlAccountId: number;
    pettyCashGlAccountCode: string;
    pettyCashGlAccountName: string;
    defaultExpenseAccountId: number | null;
    defaultExpenseAccountCode: string | null;
    defaultExpenseAccountName: string | null;
    currencyCode: string;
    status: 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
    isActive: Bool01;
    notes: string | null;
}

export interface FinancePettyCashVoucher {
    voucherId: number;
    pettyCashAccountId: number;
    pettyCashAccountName: string;
    pettyCashAccountCode: string | null;
    voucherNumber: string;
    transactionDate: string;
    voucherType: 'RECEIPT' | 'DISBURSEMENT';
    amount: number;
    payeeName: string | null;
    description: string;
    expenseCategory: string | null;
    expenseAccountId: number;
    expenseAccountCode: string;
    expenseAccountName: string;
    receiptAttachmentUrl: string | null;
    status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'VOIDED';
    approvedByUserId: number | null;
    approvedAt: string | null;
    notes: string | null;
    createdAt: string;
}

export interface FinancePettyCashReplenishment {
    replenishmentId: number;
    pettyCashAccountId: number;
    pettyCashAccountName: string;
    pettyCashAccountCode: string | null;
    replenishmentNumber: string;
    requestDate: string;
    requestedAmount: number;
    approvedAmount: number | null;
    disbursedAmount: number | null;
    sourceBankAccountId: number;
    sourceBankAccountCode: string;
    sourceBankAccountName: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISBURSED' | 'CANCELLED';
    requestedByUserId: number;
    approvedByUserId: number | null;
    notes: string | null;
    createdAt: string;
}

export interface FinanceJournalTemplate {
    templateId: number;
    templateName: string;
    description: string | null;
    recurrenceType: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
    nextRunDate: string | null;
    lastRunDate: string | null;
    defaultAmount: number | null;
    autoPost: Bool01;
    isActive: Bool01;
    lineCount: number;
}

export interface FinanceJournalTemplateLine {
    templateLineId: number;
    templateId: number;
    lineNumber: number;
    accountId: number;
    accountCode: string;
    accountName: string;
    entryType: 'DEBIT' | 'CREDIT';
    defaultAmount: number | null;
    memo: string | null;
    costCenterId: number | null;
    costCenterCode: string | null;
    costCenterName: string | null;
}

export interface PostFinanceEventPayload {
    eventType: string;
    referenceType: string;
    referenceId: number;
    referenceNumber?: string;
    entryDate?: string;
    description?: string;
    amount: number;
    costAmount?: number;
    taxAmount?: number;
    discountAmount?: number;
    bankAccountId?: number | null;
    paymentMethodAccountId?: number | null;
    costCenterId?: number | null;
    autoPost?: boolean;
    createdByUserId: number;
}

export interface FinanceAccountBalance {
    balanceId: number;
    accountId: number;
    accountCode: string;
    accountName: string;
    accountCategory: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
    fiscalPeriodId: number;
    periodName: string;
    yearCode: string;
    costCenterId: number | null;
    costCenterCode: string | null;
    costCenterName: string | null;
    openingBalance: number;
    periodDebit: number;
    periodCredit: number;
    closingBalance: number;
    ytdDebit: number;
    ytdCredit: number;
    updatedAt: string;
}
