// HR / Payroll module domain types — mirror MySQL view shapes.
// Booleans in MySQL TINYINT(1) come over as 0|1.

export type Bool01 = 0 | 1;
export type CrudType = 'save' | 'update';

// ----- Departments / Positions / Employees -----
export interface HrDepartment {
    deptId: number;
    deptCode: string;
    deptName: string;
    description: string | null;
    parentDeptId: number | null;
    parentDeptName: string | null;
    headUserId: number | null;
    headUserName: string | null;
    isActive: Bool01;
    employeeCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface HrPosition {
    positionId: number;
    positionCode: string;
    positionName: string;
    deptId: number | null;
    deptName: string | null;
    description: string | null;
    isActive: Bool01;
    employeeCount: number;
    createdAt: string;
    updatedAt: string;
}

export type HrEmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'VISITING' | 'INTERN' | 'RESIDENT' | 'CONSULTANT';
export type HrEmploymentStatus = 'ACTIVE' | 'ON_LEAVE' | 'SUSPENDED' | 'RESIGNED' | 'TERMINATED' | 'RETIRED';

export interface HrEmployee {
    employeeId: number;
    userId: number;
    employeeNumber: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string | null;
    phoneNumber: string | null;
    primaryRole: string | null;
    gender: string | null;
    dateOfBirth: string | null;
    deptId: number | null;
    deptName: string | null;
    positionId: number | null;
    positionName: string | null;
    employmentType: HrEmploymentType;
    reportingToUserId: number | null;
    reportingToName: string | null;
    joiningDate: string;
    confirmationDate: string | null;
    terminationDate: string | null;
    terminationReason: string | null;
    bankName: string | null;
    bankAccountNumber: string | null;
    bankBranch: string | null;
    taxIdentificationNumber: string | null;
    socialSecurityNumber: string | null;
    nationalId: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
    status: HrEmploymentStatus;
    isActive: Bool01;
    createdAt: string;
    updatedAt: string;
}

// ----- Shifts & Schedules -----
export type HrShiftType = 'REGULAR' | 'NIGHT' | 'SPLIT' | 'FLEXIBLE' | 'ON_CALL';

export interface HrShift {
    shiftId: number;
    shiftCode: string;
    shiftName: string;
    startTime: string;
    endTime: string;
    breakDurationMinutes: number;
    shiftType: HrShiftType;
    colorCode: string | null;
    totalMinutes: number;
    isActive: Bool01;
    createdAt: string;
    updatedAt: string;
}

export type HrScheduleStatus = 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'ABSENT' | 'ON_LEAVE';

export interface HrSchedule {
    scheduleId: number;
    userId: number;
    userFullName: string;
    scheduleDate: string;
    shiftId: number;
    shiftCode: string;
    shiftName: string;
    startTime: string;
    endTime: string;
    colorCode: string | null;
    actualStartTime: string | null;
    actualEndTime: string | null;
    status: HrScheduleStatus;
    notes: string | null;
    isActive: Bool01;
    createdAt: string;
    updatedAt: string;
}

// ----- Leave -----
export interface HrLeaveType {
    leaveTypeId: number;
    leaveCode: string;
    leaveName: string;
    description: string | null;
    isPaid: Bool01;
    maxDaysPerYear: number | null;
    canCarryForward: Bool01;
    maxCarryForwardDays: number | null;
    requiresApproval: Bool01;
    colorCode: string | null;
    isActive: Bool01;
    createdAt: string;
    updatedAt: string;
}

export interface HrLeaveBalance {
    balanceId: number;
    userId: number;
    userFullName: string;
    leaveTypeId: number;
    leaveCode: string;
    leaveName: string;
    colorCode: string | null;
    balanceYear: number;
    entitledDays: number;
    usedDays: number;
    carriedForwardDays: number;
    adjustmentDays: number;
    remainingDays: number;
    createdAt: string;
    updatedAt: string;
}

export type HrLeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'WITHDRAWN';
export type HrLeaveDecision = 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'WITHDRAWN';

export interface HrLeaveRequest {
    requestId: number;
    userId: number;
    userFullName: string;
    leaveTypeId: number;
    leaveCode: string;
    leaveName: string;
    colorCode: string | null;
    startDate: string;
    endDate: string;
    totalDays: number;
    isHalfDay: Bool01;
    halfDayPeriod: 'FIRST_HALF' | 'SECOND_HALF' | null;
    reason: string | null;
    emergencyContact: string | null;
    emergencyPhone: string | null;
    status: HrLeaveStatus;
    approverUserId: number | null;
    approverName: string | null;
    approvedAt: string | null;
    approverComments: string | null;
    cancelledAt: string | null;
    cancellationReason: string | null;
    createdAt: string;
    updatedAt: string;
}

// ----- Attendance -----
export type HrClockMethod = 'BIOMETRIC' | 'CARD' | 'MANUAL' | 'MOBILE' | 'SYSTEM';
export type HrAttendanceStatus = 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'ON_LEAVE' | 'HOLIDAY' | 'WEEK_OFF';

export interface HrAttendance {
    attendanceId: number;
    userId: number;
    userFullName: string;
    attendanceDate: string;
    shiftId: number | null;
    shiftCode: string | null;
    shiftName: string | null;
    clockInTime: string | null;
    clockOutTime: string | null;
    clockInMethod: HrClockMethod;
    clockOutMethod: HrClockMethod | null;
    workingHours: number | null;
    overtimeHours: number | null;
    lateMinutes: number | null;
    earlyLeaveMinutes: number | null;
    status: HrAttendanceStatus;
    remarks: string | null;
    isRegularized: Bool01;
    regularizedByUserId: number | null;
    regularizedByName: string | null;
    regularizedAt: string | null;
    regularizationReason: string | null;
    createdAt: string;
    updatedAt: string;
}

// ----- Payroll components & structures -----
export type HrComponentType = 'EARNING' | 'DEDUCTION' | 'REIMBURSEMENT' | 'TAX' | 'RELIEF' | 'EMPLOYER_CONTRIBUTIONS' | 'STATUTORY';
export type HrCalculationType = 'FIXED' | 'PERCENTAGE' | 'FORMULA';

export interface HrSalaryComponent {
    componentId: number;
    componentCode: string;
    componentName: string;
    componentType: HrComponentType;
    calculationType: HrCalculationType;
    calculationBase: string | null;
    formulaExpression: string | null;
    defaultAmount: number | null;
    metadata: any;
    isTaxable: Bool01;
    isStatutory: Bool01;
    isCash: Bool01;
    affectGrossPay: Bool01;
    sortOrder: number;
    isActive: Bool01;
    createdAt: string;
    updatedAt: string;
}

export type HrPayFrequency = 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY' | 'SEMI_MONTHLY';

export interface HrSalaryStructure {
    structureId: number;
    userId: number;
    userFullName: string;
    effectiveFrom: string;
    effectiveUntil: string | null;
    baseSalary: number;
    currency: string;
    payFrequency: HrPayFrequency;
    isActive: Bool01;
    notes: string | null;
    componentCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface HrStaffSalaryComponent {
    staffComponentId: number;
    structureId: number;
    componentId: number;
    componentCode: string;
    componentName: string;
    componentType: HrComponentType;
    calculationType: HrCalculationType;
    calculationBase: string | null;
    amount: number | null;
    qty: number;
    isActive: Bool01;
    createdAt: string;
    updatedAt: string;
}

// ----- Payroll periods & entries -----
export type HrPayrollPeriodStatus = 'DRAFT' | 'PROCESSING' | 'FINALIZED' | 'PAID' | 'CANCELLED';
export type HrPayrollEntryStatus = 'DRAFT' | 'CALCULATED' | 'APPROVED' | 'PAID' | 'CANCELLED';
export type HrPaymentMethod = 'BANK_TRANSFER' | 'CHEQUE' | 'CASH' | 'MOBILE_MONEY';

export interface HrPayrollPeriod {
    periodId: number;
    periodName: string;
    startDate: string;
    endDate: string;
    payDate: string;
    status: HrPayrollPeriodStatus;
    processedAt: string | null;
    processedByUserId: number | null;
    processedByName: string | null;
    finalizedAt: string | null;
    finalizedByUserId: number | null;
    finalizedByName: string | null;
    notes: string | null;
    entryCount: number;
    totalGross: number;
    totalNet: number;
    createdAt: string;
    updatedAt: string;
}

export interface HrPayrollEntry {
    entryId: number;
    periodId: number;
    periodName: string;
    payDate: string;
    periodStatus: HrPayrollPeriodStatus;
    userId: number;
    userFullName: string;
    employeeNumber: string | null;
    deptId: number | null;
    deptName: string | null;
    positionId: number | null;
    positionName: string | null;
    structureId: number | null;
    workingDays: number;
    presentDays: number;
    leaveDays: number;
    absentDays: number;
    overtimeHours: number;
    basicSalary: number;
    grossEarnings: number;
    statutoryDeductions: number;
    taxReliefs: number;
    taxableIncome: number;
    paye: number;
    otherDeductions: number;
    totalDeductions: number;
    employerContributions: number;
    reimbursements: number;
    netSalary: number;
    status: HrPayrollEntryStatus;
    paymentMethod: HrPaymentMethod | null;
    paymentReference: string | null;
    paidAt: string | null;
    remarks: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface HrPayrollEntryDetail {
    detailId: number;
    entryId: number;
    componentId: number | null;
    componentCode: string | null;
    componentName: string | null;
    componentType: HrComponentType;
    description: string | null;
    amount: number;
    createdAt: string;
}

export interface HrCountryConfig {
    configId: number;
    countryCode: string;
    countryName: string;
    taxCalculationMethod: 'PROGRESSIVE' | 'FLAT' | 'NONE';
    flatTaxRate: number | null;
    currencyCode: string;
    isActive: Bool01;
    effectiveFrom: string;
    effectiveUntil: string | null;
    bandCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface HrTaxBand {
    bandId: number;
    configId: number;
    countryCode: string;
    countryName: string;
    bandOrder: number;
    lowerLimit: number;
    upperLimit: number | null;
    rate: number;
    description: string | null;
}
