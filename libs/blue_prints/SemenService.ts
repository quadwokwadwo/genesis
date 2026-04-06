import axiosFetch from '@/libs/axiosConfig';
import { TSemenAnalysis } from '@/types/semen/semen';
import { CRUDTYPE } from '@/types/enums/enums';

class SemenService{
    async saveSemenAnalysis(semenData:TSemenAnalysis,crudType:CRUDTYPE){
        return axiosFetch<TSemenAnalysis>('POST','/api/semen',{semenData,crudType})
    }
    async getSavedSemen(){
        return axiosFetch<TSemenAnalysis[]>('GET','/api/semen',{});
    }
    async deleteSemenAnalysis(analysisId:number){
        return await axiosFetch<any>('DELETE',`/api/semen/${analysisId}`,{});
    }
}
const semenService = new SemenService();

export default semenService;
