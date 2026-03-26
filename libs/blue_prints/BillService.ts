import { TInventoryItem, User } from '@/types/hospital';

import axiosFetch from '@/libs/axiosConfig';

class BillService {
    static async createBill(billDetails:any) {
        const data = await axiosFetch<any>('POST',
            `/api/billings`, { billDetails });

        return {operatedData:data.data.operatedData ,status:data.status,operationalStatus:data.data.status}
    }
    static async getPrescriptionFull(itemId:number){
        const data = await axiosFetch<TInventoryItem>('GET', `/api/billings?itemId=${itemId}`, {cache:'no-store'});
        return {operatedData:data.data.operatedData};
    }
}
export default BillService;
