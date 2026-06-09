import axiosFetch from '@/libs/axiosConfig';

export interface AdminUserRow {
    userId: number;
    firstName: string;
    lastName: string;
    username: string;
    email?: string | null;
    role: 'admin' | 'doctor' | 'nurse' | 'lab_tech';
    status?: string | null;
    phoneNumber?: string | null;
    licenseNumber?: string | null;
    licenseExpiryDate?: string | null;
    createdAt?: string;
    updatedAt?: string;
    [k: string]: any;
}

export interface ListUsersParams {
    role?: string;
    status?: string;
    search?: string;
    page?: number;
    pageSize?: number;
}

export interface UpdateUserPayload {
    fullName: string;
    email?: string | null;
    role: string;
    licenseExpiryDate?: string | null;
    licenseNumber?: string | null;
    phoneNumber?: string | null;
}

export interface ExpiringCredentialRow {
    id: number;
    fullName: string;
    role: string;
    licenseNumber: string | null;
    licenseExpiryDate: string;
    daysUntilExpiry: number;
}

function unwrap<T>(resp: any): T {
    return (resp?.data?.data ?? resp?.data?.operatedData ?? resp?.data) as T;
}

class UsersAdminService {
    async listUsers(params: ListUsersParams = {}) {
        const qs = new URLSearchParams();
        if (params.role) qs.set('role', params.role);
        if (params.status) qs.set('status', params.status);
        if (params.search) qs.set('search', params.search);
        qs.set('page', String(params.page ?? 1));
        qs.set('pageSize', String(params.pageSize ?? 25));
        const resp = await axiosFetch<any>('GET', `/api/users?${qs.toString()}`, {});
        return unwrap<{ rows: AdminUserRow[]; total: number; page: number; pageSize: number }>(resp);
    }

    async updateUser(id: number, payload: UpdateUserPayload) {
        const resp = await axiosFetch<any>('PATCH', `/api/users/${id}`, payload);
        return unwrap<AdminUserRow>(resp);
    }

    async disable(id: number) {
        const resp = await axiosFetch<any>('POST', `/api/users/${id}/disable`, {});
        return unwrap<AdminUserRow>(resp);
    }

    async enable(id: number) {
        const resp = await axiosFetch<any>('POST', `/api/users/${id}/enable`, {});
        return unwrap<AdminUserRow>(resp);
    }

    async resetPassword(id: number, newPassword: string) {
        const resp = await axiosFetch<any>('POST', `/api/users/${id}/reset-password`, { newPassword });
        return unwrap<{ userId: number; passwordReset: boolean }>(resp);
    }

    async getExpiringCredentials(days = 90) {
        const resp = await axiosFetch<any>('GET', `/api/users/expiring?days=${days}`, {});
        return unwrap<{ rows: ExpiringCredentialRow[]; total: number }>(resp);
    }
}

export default new UsersAdminService();
