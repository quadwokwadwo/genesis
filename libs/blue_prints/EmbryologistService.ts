import axiosFetch from '@/libs/axiosConfig';
import { TEmbryologistDashboardData } from '@/types/embryologist/embryologist';

class EmbryologistService {
    async getEmbryologists(){
        return await axiosFetch<TEmbryologistDashboardData>('GET','/api/embryologist-dashboard',{});
    }
}

const embryologistService = new EmbryologistService();
export default embryologistService;
