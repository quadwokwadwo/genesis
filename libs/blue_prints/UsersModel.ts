import { Credential, Doctor, TAxiosReturn, TPatient } from '@/types/hospital';
import { CRUDTYPE } from '@/types/enums/enums';
import axiosFetch from '@/libs/axiosConfig';
import { User } from '@/types/hospital/hospital';

class UsersModel {
    async addNewUser(doctorInformation:User, credentials:Credential[], crudType: CRUDTYPE) {
        const data = await axiosFetch<User>('POST',
            `/api/doctor`, { doctorInformation:{...doctorInformation,crudType,credentials} });

        return {operatedData:data.data.operatedData as User,status:data.status,operationalStatus:data.data.status}
    }
    async getUserList() {
        const data = await axiosFetch<User[]>('GET', `/api/doctor?query=all`, {cache:'no-store'});

        return {operatedData:data.data.operatedData,status:data.status,operationalStatus:data.data.status}
    }
    async getDoctorListOnly() {
        const data = await axiosFetch<Doctor[]>('GET', `/api/doctor?query=doctor`, {cache:'no-store'});

        return {operatedData:data.data.operatedData,status:data.status,operationalStatus:data.data.status}
    }
}
export default UsersModel;
