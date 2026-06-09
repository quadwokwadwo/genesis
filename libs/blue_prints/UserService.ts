import { TLoginResponse } from '@/types/hospital';
import axiosFetch, { setAccessToken } from '@/libs/axiosConfig';

class UserService {
    async performUserLogin(password: string, username: string) {
        try {
            const data = await axiosFetch<any>('POST', `/api/auth/login`, { username, password });
            const payload = data.data?.data ?? data.data?.operatedData ?? {};
            if (payload.accessToken) {
                setAccessToken(payload.accessToken);
            }
            // Legacy callsites expect { isUser, user }; keep that shape and add accessToken.
            return {
                isUser: !!payload.user,
                user: payload.user ?? null,
                accessToken: payload.accessToken ?? null
            } as unknown as TLoginResponse;
        } catch {
            return { isUser: false, user: null, accessToken: null } as unknown as TLoginResponse;
        }
    }

    async performLogout() {
        try {
            await axiosFetch<any>('POST', `/api/auth/logout`, {});
        } finally {
            setAccessToken(null);
        }
    }

    static async getNurseDashboardData() {
        const data = await axiosFetch<any>('GET', `/api/nurse`, { cache: 'no-store' });
        return data.data.operatedData;
    }
    static async getDoctorDashboardData(searchedDate: string) {
        const data = await axiosFetch<any>('GET', `/api/doctor-dashboard?searchedDate=${encodeURIComponent(searchedDate)}`, {});
        return data.data.operatedData;
    }
}
export default UserService;
