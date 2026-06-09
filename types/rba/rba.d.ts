export interface RbaRole {
    roleId: number;
    roleCode: string;
    roleName: string;
    description?: string | null;
    isSystemRole: 0 | 1;
    isActive: 0 | 1;
    permissionCount?: number;
    assignedUserCount?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface RbaPermission {
    permissionId: number;
    permissionCode: string;
    permissionName: string;
    module: string;
    description?: string | null;
    isActive: 0 | 1;
}

export interface RbaRolePermission {
    rolePermissionId: number;
    roleId: number;
    roleCode: string;
    roleName: string;
    permissionId: number;
    permissionCode: string;
    permissionName: string;
    module: string;
    grantedAt: string;
}

export interface RbaUserAssignedRole {
    userRoleId: number;
    userId: number;
    userFullName: string;
    username: string;
    roleId: number;
    roleCode: string;
    roleName: string;
    validFrom?: string | null;
    validUntil?: string | null;
    assignedAt: string;
}

export interface RbaEffectiveRole {
    roleCode: string;
    roleName: string;
    isPrimary: 0 | 1;
}

export interface RbaMePermissions {
    permissions: string[];
    roles: RbaEffectiveRole[];
}

export interface RbaAuthEvent {
    eventId: number;
    userId: number | null;
    username: string | null;
    eventType: 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'LOGOUT' | 'PERMISSION_DENIED' | 'PASSWORD_RESET' | 'TOKEN_REFRESH';
    ipAddress?: string | null;
    userAgent?: string | null;
    details?: string | null;
    occurredAt: string;
}

export interface RbaRoleFormState {
    roleId?: number;
    roleCode: string;
    roleName: string;
    description: string;
    isActive: boolean;
}

export interface RbaRoleState {
    roles: RbaRole[];
    permissions: RbaPermission[];
    selectedRole: RbaRole | null;
    rolePermissions: RbaRolePermission[];
    form: RbaRoleFormState;
    crudType: 'save' | 'update';
    showDialog: boolean;
    isLoading: boolean;
}

export interface RbaUserRoleState {
    users: { userId: number; firstName: string; lastName: string; username: string; role: string }[];
    roles: RbaRole[];
    assignedRoles: RbaUserAssignedRole[];
    selectedUser: { userId: number; firstName: string; lastName: string; username: string } | null;
    selectedRoleId: number | null;
    validFrom: string;
    validUntil: string;
    isLoading: boolean;
}
