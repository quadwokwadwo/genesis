import axiosFetch from '@/libs/axiosConfig';
import { TEmbryoCryoPreservation } from '@/types/ivf/ivf';
import { CRUDTYPE } from '@/types/enums/enums';
import { TTankCustodyEntry } from '@/types/hospital/hospital';

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
    async thawPreservation(id:number, reason:string){
        return axiosFetch<any>('POST', `/api/embryo-tank/${id}/thaw`, { reason });
    }
    async discardPreservation(id:number, reason:string){
        return axiosFetch<any>('POST', `/api/embryo-tank/${id}/discard`, { reason });
    }
    async getCustodyLog(preservationId:number){
        return axiosFetch<TTankCustodyEntry[]>('GET', `/api/tanks/custody?sampleType=Embryo&preservationId=${preservationId}`, {});
    }
}

const embryoTankService = new EmbryoTankService();
export default embryoTankService;
