import axiosFetch from '@/libs/axiosConfig';
import { TSpermPreservation } from '@/types/semen/semen';
import { CRUDTYPE } from '@/types/enums/enums';

class SpermTankService{
    async saveSperm(spermTankData:TSpermPreservation,crudType:CRUDTYPE){
        return axiosFetch<TSpermPreservation>('POST','/api/sperm-tank',{spermTankData,crudType})
    }
    async getSpermTankData(){
        return axiosFetch<TSpermPreservation[]>('GET','/api/sperm-tank',{});
    }
}
const spermTankService = new SpermTankService();
export default spermTankService;
