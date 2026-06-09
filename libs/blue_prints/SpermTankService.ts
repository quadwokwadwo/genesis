import axiosFetch from '@/libs/axiosConfig';
import { TSpermPreservation } from '@/types/semen/semen';
import { CRUDTYPE } from '@/types/enums/enums';
import { TTankCustodyEntry } from '@/types/hospital/hospital';

class SpermTankService{
    async saveSperm(spermTankData:TSpermPreservation,crudType:CRUDTYPE){
        return axiosFetch<TSpermPreservation>('POST','/api/sperm-tank',{spermTankData,crudType})
    }
    async getSpermTankData(){
        return axiosFetch<TSpermPreservation[]>('GET','/api/sperm-tank',{});
    }
    async deletePreservation(id:number){
        return axiosFetch<any>('DELETE', `/api/sperm-tank/${id}`, {});
    }
    async thawPreservation(id:number, reason:string){
        return axiosFetch<any>('POST', `/api/sperm-tank/${id}/thaw`, { reason });
    }
    async discardPreservation(id:number, reason:string){
        return axiosFetch<any>('POST', `/api/sperm-tank/${id}/discard`, { reason });
    }
    async getCustodyLog(preservationId:number){
        return axiosFetch<TTankCustodyEntry[]>('GET', `/api/tanks/custody?sampleType=Sperm&preservationId=${preservationId}`, {});
    }
}
const spermTankService = new SpermTankService();
export default spermTankService;
