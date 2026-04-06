import axiosFetch from '@/libs/axiosConfig';
import { TIVFAssessmentData } from '@/types/ivf/ivf';
import { CRUDTYPE } from '@/types/enums/enums';

class IVFEmbryoService {
    async saveIVFEmbryo(embryoData:TIVFAssessmentData,crudType:CRUDTYPE){
        return await axiosFetch<TIVFAssessmentData>('POST','/api/ivf',{embryoData,crudType})
    }
    async getIVFEmbryoList(){
        return await axiosFetch<TIVFAssessmentData[]>('GET','/api/ivf',{});
    }
    async deleteIVFEmbryo(ivfId:number){
        return await axiosFetch<any>('DELETE',`/api/ivf/${ivfId}`,{});
    }
}
const ivfEmbryoService = new IVFEmbryoService();
export default ivfEmbryoService;
