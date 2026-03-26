import { TLoginResponse } from '@/types/hospital';
import axiosFetch from '@/libs/axiosConfig';

class UserService{
    async performUserLogin(password:string,username:string) {
        const data = await axiosFetch<TLoginResponse>('POST',
            `/api/login`, { username,password });
        return data.data.operatedData;
    }
    static async getNurseDashboardData() {

        const data = await axiosFetch<any>('GET',
            `/api/nurse`, {cache:'no-store'});

        return data.data.operatedData;
    }
    static async getDoctorDashboardData(searchedDate:string) {

        const data = await axiosFetch<any>('POST',
            `/api/doctor-dashboard`, {searchedDate});
        return data.data.operatedData;
    }
}
export default UserService;
