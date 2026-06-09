import axiosFetch from '@/libs/axiosConfig';
import {
    HrAttendance,
    HrCountryConfig,
    HrDepartment,
    HrEmployee,
    HrLeaveBalance,
    HrLeaveDecision,
    HrLeaveRequest,
    HrLeaveType,
    HrPayrollEntry,
    HrPayrollEntryDetail,
    HrPayrollPeriod,
    HrPosition,
    HrSalaryComponent,
    HrSalaryStructure,
    HrSchedule,
    HrShift,
    HrStaffSalaryComponent,
    HrTaxBand
} from '@/types/hr/hr';

/**
 * Service for the HR / Payroll module. All methods call the Next.js proxy under
 * /api/hr/* which forwards to the Express server.
 *
 * Standard envelope: { operatedData, status (HTTP), operationalStatus (proc executionStatus) }.
 */
class HrService {
    // ---------- Departments ----------
    static async listDepartments() {
        const r = await axiosFetch<HrDepartment[]>('GET', '/api/hr/departments', { cache: 'no-store' });
        return { operatedData: r.data.operatedData as unknown as HrDepartment[], status: r.status, operationalStatus: r.data.status };
    }
    static async upsertDepartment(payload: any) {
        const r = await axiosFetch<HrDepartment>('POST', '/api/hr/departments', payload);
        return { operatedData: r.data.operatedData as unknown as HrDepartment, status: r.status, operationalStatus: r.data.status };
    }

    // ---------- Positions ----------
    static async listPositions(deptId?: number) {
        const url = deptId ? `/api/hr/positions?deptId=${deptId}` : '/api/hr/positions';
        const r = await axiosFetch<HrPosition[]>('GET', url, { cache: 'no-store' });
        return { operatedData: r.data.operatedData as unknown as HrPosition[], status: r.status, operationalStatus: r.data.status };
    }
    static async upsertPosition(payload: any) {
        const r = await axiosFetch<HrPosition>('POST', '/api/hr/positions', payload);
        return { operatedData: r.data.operatedData as unknown as HrPosition, status: r.status, operationalStatus: r.data.status };
    }

    // ---------- Employees ----------
    static async listEmployees(filters: { userId?: number; deptId?: number; status?: string } = {}) {
        const q = new URLSearchParams();
        if (filters.userId) q.set('userId', String(filters.userId));
        if (filters.deptId) q.set('deptId', String(filters.deptId));
        if (filters.status) q.set('status', filters.status);
        const url = '/api/hr/employees' + (q.toString() ? `?${q.toString()}` : '');
        const r = await axiosFetch<HrEmployee[]>('GET', url, { cache: 'no-store' });
        console.log(r);
        return { operatedData: r.data.operatedData as unknown as HrEmployee[], status: r.status, operationalStatus: r.data.status };
    }
    static async upsertEmployee(payload: any) {
        const r = await axiosFetch<HrEmployee>('POST', '/api/hr/employees', payload);
        return { operatedData: r.data.operatedData as unknown as HrEmployee, status: r.status, operationalStatus: r.data.status };
    }

    // ---------- Shifts ----------
    static async listShifts() {
        const r = await axiosFetch<HrShift[]>('GET', '/api/hr/shifts', { cache: 'no-store' });
        return { operatedData: r.data.operatedData as unknown as HrShift[], status: r.status, operationalStatus: r.data.status };
    }
    static async upsertShift(payload: any) {
        const r = await axiosFetch<HrShift>('POST', '/api/hr/shifts', payload);
        return { operatedData: r.data.operatedData as unknown as HrShift, status: r.status, operationalStatus: r.data.status };
    }

    // ---------- Schedules ----------
    static async listSchedules(filters: { userId?: number; startDate?: string; endDate?: string } = {}) {
        const q = new URLSearchParams();
        if (filters.userId) q.set('userId', String(filters.userId));
        if (filters.startDate) q.set('startDate', filters.startDate);
        if (filters.endDate) q.set('endDate', filters.endDate);
        const url = '/api/hr/schedules' + (q.toString() ? `?${q.toString()}` : '');
        const r = await axiosFetch<HrSchedule[]>('GET', url, { cache: 'no-store' });
        return { operatedData: r.data.operatedData as unknown as HrSchedule[], status: r.status, operationalStatus: r.data.status };
    }
    static async upsertSchedule(payload: any) {
        const r = await axiosFetch<HrSchedule>('POST', '/api/hr/schedules', payload);
        return { operatedData: r.data.operatedData as unknown as HrSchedule, status: r.status, operationalStatus: r.data.status };
    }

    // ---------- Leave types ----------
    static async listLeaveTypes() {
        const r = await axiosFetch<HrLeaveType[]>('GET', '/api/hr/leave-types', { cache: 'no-store' });
        return { operatedData: r.data.operatedData as unknown as HrLeaveType[], status: r.status, operationalStatus: r.data.status };
    }
    static async upsertLeaveType(payload: any) {
        const r = await axiosFetch<HrLeaveType>('POST', '/api/hr/leave-types', payload);
        return { operatedData: r.data.operatedData as unknown as HrLeaveType, status: r.status, operationalStatus: r.data.status };
    }

    // ---------- Leave balances ----------
    static async listLeaveBalances(filters: { userId?: number; balanceYear?: number } = {}) {
        const q = new URLSearchParams();
        if (filters.userId) q.set('userId', String(filters.userId));
        if (filters.balanceYear) q.set('balanceYear', String(filters.balanceYear));
        const url = '/api/hr/leave-balances' + (q.toString() ? `?${q.toString()}` : '');
        const r = await axiosFetch<HrLeaveBalance[]>('GET', url, { cache: 'no-store' });
        return { operatedData: r.data.operatedData as unknown as HrLeaveBalance[], status: r.status, operationalStatus: r.data.status };
    }
    static async upsertLeaveBalance(payload: any) {
        const r = await axiosFetch<HrLeaveBalance>('POST', '/api/hr/leave-balances', payload);
        return { operatedData: r.data.operatedData as unknown as HrLeaveBalance, status: r.status, operationalStatus: r.data.status };
    }

    // ---------- Leave requests ----------
    static async listLeaveRequests(filters: { userId?: number; status?: string } = {}) {
        const q = new URLSearchParams();
        if (filters.userId) q.set('userId', String(filters.userId));
        if (filters.status) q.set('status', filters.status);
        const url = '/api/hr/leave-requests' + (q.toString() ? `?${q.toString()}` : '');
        const r = await axiosFetch<HrLeaveRequest[]>('GET', url, { cache: 'no-store' });
        return { operatedData: r.data.operatedData as unknown as HrLeaveRequest[], status: r.status, operationalStatus: r.data.status };
    }
    static async upsertLeaveRequest(payload: any) {
        const r = await axiosFetch<HrLeaveRequest>('POST', '/api/hr/leave-requests', payload);
        return { operatedData: r.data.operatedData as unknown as HrLeaveRequest, status: r.status, operationalStatus: r.data.status };
    }
    static async decideLeaveRequest(payload: { requestId: number; decision: HrLeaveDecision; comments?: string | null }) {
        const r = await axiosFetch<HrLeaveRequest>('POST', '/api/hr/leave-requests/decide', payload);
        return { operatedData: r.data.operatedData as unknown as HrLeaveRequest, status: r.status, operationalStatus: r.data.status };
    }

    // ---------- Attendance ----------
    static async listAttendance(filters: { userId?: number; startDate?: string; endDate?: string } = {}) {
        const q = new URLSearchParams();
        if (filters.userId) q.set('userId', String(filters.userId));
        if (filters.startDate) q.set('startDate', filters.startDate);
        if (filters.endDate) q.set('endDate', filters.endDate);
        const url = '/api/hr/attendance' + (q.toString() ? `?${q.toString()}` : '');
        const r = await axiosFetch<HrAttendance[]>('GET', url, { cache: 'no-store' });
        return { operatedData: r.data.operatedData as unknown as HrAttendance[], status: r.status, operationalStatus: r.data.status };
    }
    static async upsertAttendance(payload: any) {
        const r = await axiosFetch<HrAttendance>('POST', '/api/hr/attendance', payload);
        return { operatedData: r.data.operatedData as unknown as HrAttendance, status: r.status, operationalStatus: r.data.status };
    }
}

class HrPayrollService {
    // ---------- Salary components ----------
    static async listComponents() {
        const r = await axiosFetch<HrSalaryComponent[]>('GET', '/api/hr/salary-components', { cache: 'no-store' });
        return { operatedData: r.data.operatedData as unknown as HrSalaryComponent[], status: r.status, operationalStatus: r.data.status };
    }
    static async upsertComponent(payload: any) {
        const r = await axiosFetch<HrSalaryComponent>('POST', '/api/hr/salary-components', payload);
        return { operatedData: r.data.operatedData as unknown as HrSalaryComponent, status: r.status, operationalStatus: r.data.status };
    }

    // ---------- Salary structures ----------
    static async listStructures(userId?: number) {
        const url = userId ? `/api/hr/salary-structures?userId=${userId}` : '/api/hr/salary-structures';
        const r = await axiosFetch<HrSalaryStructure[]>('GET', url, { cache: 'no-store' });
        return { operatedData: r.data.operatedData as unknown as HrSalaryStructure[], status: r.status, operationalStatus: r.data.status };
    }
    static async upsertStructure(payload: any) {
        const r = await axiosFetch<HrSalaryStructure>('POST', '/api/hr/salary-structures', payload);
        return { operatedData: r.data.operatedData as unknown as HrSalaryStructure, status: r.status, operationalStatus: r.data.status };
    }

    // ---------- Staff salary components ----------
    static async listStaffComponents(structureId: number) {
        const r = await axiosFetch<HrStaffSalaryComponent[]>('GET', `/api/hr/staff-salary-components?structureId=${structureId}`, { cache: 'no-store' });
        return { operatedData: r.data.operatedData as unknown as HrStaffSalaryComponent[], status: r.status, operationalStatus: r.data.status };
    }
    static async upsertStaffComponent(payload: any) {
        const r = await axiosFetch<HrStaffSalaryComponent>('POST', '/api/hr/staff-salary-components', payload);
        return { operatedData: r.data.operatedData as unknown as HrStaffSalaryComponent, status: r.status, operationalStatus: r.data.status };
    }
    static async removeStaffComponent(staffComponentId: number) {
        const r = await axiosFetch<{ staffComponentId: number }>('DELETE', `/api/hr/staff-salary-components/${staffComponentId}`, { cache: 'no-store' });
        return { operatedData: r.data.operatedData, status: r.status, operationalStatus: r.data.status };
    }

    // ---------- Periods ----------
    static async listPeriods() {
        const r = await axiosFetch<HrPayrollPeriod[]>('GET', '/api/hr/payroll-periods', { cache: 'no-store' });
        return { operatedData: r.data.operatedData as unknown as HrPayrollPeriod[], status: r.status, operationalStatus: r.data.status };
    }
    static async upsertPeriod(payload: any) {
        const r = await axiosFetch<HrPayrollPeriod>('POST', '/api/hr/payroll-periods', payload);
        return { operatedData: r.data.operatedData as unknown as HrPayrollPeriod, status: r.status, operationalStatus: r.data.status };
    }
    static async generateEntries(periodId: number) {
        const r = await axiosFetch<{ periodId: number; createdCount: number }>('POST', `/api/hr/payroll-periods/${periodId}/generate`, {});
        return { operatedData: r.data.operatedData, status: r.status, operationalStatus: r.data.status };
    }
    static async calculatePeriod(periodId: number) {
        const r = await axiosFetch<{ periodId: number; processedCount: number }>('POST', `/api/hr/payroll-periods/${periodId}/calculate`, {});
        return { operatedData: r.data.operatedData, status: r.status, operationalStatus: r.data.status };
    }
    static async finalizePeriod(periodId: number) {
        const r = await axiosFetch<{ periodId: number }>('POST', `/api/hr/payroll-periods/${periodId}/finalize`, {});
        return { operatedData: r.data.operatedData, status: r.status, operationalStatus: r.data.status };
    }

    // ---------- Entries ----------
    static async listEntries(filters: { periodId?: number; userId?: number; status?: string } = {}) {
        const q = new URLSearchParams();
        if (filters.periodId) q.set('periodId', String(filters.periodId));
        if (filters.userId) q.set('userId', String(filters.userId));
        if (filters.status) q.set('status', filters.status);
        const url = '/api/hr/payroll-entries' + (q.toString() ? `?${q.toString()}` : '');
        const r = await axiosFetch<HrPayrollEntry[]>('GET', url, { cache: 'no-store' });
        return { operatedData: r.data.operatedData as unknown as HrPayrollEntry[], status: r.status, operationalStatus: r.data.status };
    }
    static async entryDetails(entryId: number) {
        const r = await axiosFetch<HrPayrollEntryDetail[]>('GET', `/api/hr/payroll-entries/${entryId}/details`, { cache: 'no-store' });
        return { operatedData: r.data.operatedData as unknown as HrPayrollEntryDetail[], status: r.status, operationalStatus: r.data.status };
    }
    static async calculateEntry(entryId: number) {
        const r = await axiosFetch<{ entryId: number }>('POST', `/api/hr/payroll-entries/${entryId}/calculate`, {});
        return { operatedData: r.data.operatedData, status: r.status, operationalStatus: r.data.status };
    }
    static async markEntryPaid(payload: { entryId: number; paymentMethod: string; paymentReference?: string }) {
        const r = await axiosFetch('POST', '/api/hr/payroll-entries/pay', payload);
        return { operatedData: r.data.operatedData, status: r.status, operationalStatus: r.data.status };
    }

    // ---------- Tax config (read-only) ----------
    static async listCountryConfigs() {
        const r = await axiosFetch<HrCountryConfig[]>('GET', '/api/hr/payroll-country-configs', { cache: 'no-store' });
        return { operatedData: r.data.operatedData as unknown as HrCountryConfig[], status: r.status, operationalStatus: r.data.status };
    }
    static async listTaxBands(configId: number) {
        const r = await axiosFetch<HrTaxBand[]>('GET', `/api/hr/payroll-tax-bands?configId=${configId}`, { cache: 'no-store' });
        return { operatedData: r.data.operatedData as unknown as HrTaxBand[], status: r.status, operationalStatus: r.data.status };
    }
}

export { HrService, HrPayrollService };
export default HrService;
