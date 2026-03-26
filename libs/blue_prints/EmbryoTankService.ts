import axiosFetch from '@/libs/axiosConfig';
import { TEmbryoCryoPreservation } from '@/types/ivf/ivf';
import { CRUDTYPE } from '@/types/enums/enums';

class EmbryoTankService {

    async saveEmbryoTank(tankData:TEmbryoCryoPreservation,crudType:CRUDTYPE){
        return await axiosFetch<TEmbryoCryoPreservation>('POST', '/api/embryo-tank', { tankData,crudType });
    }

    async getTankEmbryos(){
        return await axiosFetch<TEmbryoCryoPreservation[]>('GET','/api/embryo-tank',{});
    }
    async deleteEmbryo(embryoPreservationId:number){
        return axiosFetch<any>('DELETE',`/api/embryo-tank/${embryoPreservationId}`,{});
    }
}

const embryoTankService = new EmbryoTankService();
export default embryoTankService;
