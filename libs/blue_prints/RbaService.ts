import axiosFetch from '@/libs/axiosConfig';
import { RbaAuthEvent, RbaMePermissions, RbaPermission, RbaRole, RbaRolePermission, RbaUserAssignedRole } from '@/types/rba/rba';

/**
 * Service for the Role-Based Access (RBA) module. All methods call the
 * Next.js proxy under /api/rba/* which forwards to the Express server.
 *
 * The same envelope shape used everywhere else in the app is preserved:
 *   { operatedData, status (HTTP), operationalStatus (proc executionStatus) }.
 */
class RbaService {
    // -------- My effective permissions (used to gate UI) --------
    static async getMyPermissions() {
        const r = await axiosFetch<RbaMePermissions>('GET', '/api/rba/me/permissions', { cache: 'no-store' });
        return { operatedData: r.data.operatedData as unknown as RbaMePermissions, status: r.status, operationalStatus: r.data.status };
    }

    // -------- Roles --------
    static async listRoles() {
        const r = await axiosFetch<RbaRole[]>('GET', '/api/rba/roles', { cache: 'no-store' });
        return { operatedData: r.data.operatedData as unknown as RbaRole[], status: r.status, operationalStatus: r.data.status };
    }

    static async upsertRole(payload: { crudType: 'save' | 'update'; roleId?: number; roleCode: string; roleName: string; description?: string; isActive?: boolean }) {
        const r = await axiosFetch<RbaRole>('POST', '/api/rba/roles', payload);
        return { operatedData: r.data.operatedData as unknown as RbaRole, status: r.status, operationalStatus: r.data.status };
    }

    // -------- Permissions catalogue --------
    static async listPermissions() {
        const r = await axiosFetch<RbaPermission[]>('GET', '/api/rba/permissions', { cache: 'no-store' });
        return { operatedData: r.data.operatedData as unknown as RbaPermission[], status: r.status, operationalStatus: r.data.status };
    }

    // -------- Role-permission grants --------
    static async listRolePermissions(roleId?: number) {
        const url = roleId ? `/api/rba/role-permissions?roleId=${roleId}` : '/api/rba/role-permissions';
        const r = await axiosFetch<RbaRolePermission[]>('GET', url, { cache: 'no-store' });
        return { operatedData: r.data.operatedData as unknown as RbaRolePermission[], status: r.status, operationalStatus: r.data.status };
    }

    static async grantPermission(roleId: number, permissionId: number) {
        const r = await axiosFetch<RbaRolePermission>('POST', '/api/rba/role-permissions', { roleId, permissionId });
        return { operatedData: r.data.operatedData as unknown as RbaRolePermission, status: r.status, operationalStatus: r.data.status };
    }

    static async revokePermission(roleId: number, permissionId: number) {
        const r = await axiosFetch<{ roleId: number; permissionId: number }>('DELETE', `/api/rba/role-permissions/${roleId}/${permissionId}`, { cache: 'no-store' });
        return { operatedData: r.data.operatedData, status: r.status, operationalStatus: r.data.status };
    }

    // -------- User-role assignments --------
    static async listUserRoles(userId?: number) {
        const url = userId ? `/api/rba/user-roles?userId=${userId}` : '/api/rba/user-roles';
        const r = await axiosFetch<RbaUserAssignedRole[]>('GET', url, { cache: 'no-store' });
        return { operatedData: r.data.operatedData as unknown as RbaUserAssignedRole[], status: r.status, operationalStatus: r.data.status };
    }

    static async assignUserRole(payload: { userId: number; roleId: number; validFrom?: string | null; validUntil?: string | null }) {
        const r = await axiosFetch<RbaUserAssignedRole>('POST', '/api/rba/user-roles', payload);
        return { operatedData: r.data.operatedData as unknown as RbaUserAssignedRole, status: r.status, operationalStatus: r.data.status };
    }

    static async revokeUserRole(userRoleId: number) {
        const r = await axiosFetch<{ userRoleId: number }>('DELETE', `/api/rba/user-roles/${userRoleId}`, { cache: 'no-store' });
        return { operatedData: r.data.operatedData, status: r.status, operationalStatus: r.data.status };
    }

    // -------- Auth event log --------
    static async listAuthEvents(limit = 100) {
        const r = await axiosFetch<RbaAuthEvent[]>('GET', `/api/rba/auth-events?limit=${limit}`, { cache: 'no-store' });
        return { operatedData: r.data.operatedData as unknown as RbaAuthEvent[], status: r.status, operationalStatus: r.data.status };
    }
}

export default RbaService;
