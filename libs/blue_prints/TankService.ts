import axiosFetch from '@/libs/axiosConfig';
import { TTankOccupancy, TTankCustodyEntry } from '@/types/hospital/hospital';

class TankService {
    async getTankOccupancy(tankType?: 'Embryo' | 'Sperm') {
        const qs = tankType ? `?tankType=${tankType}` : '';
        return axiosFetch<TTankOccupancy[]>('GET', `/api/tanks/occupancy${qs}`, {});
    }
    async getTankCustody(sampleType: 'Embryo' | 'Sperm', preservationId: number) {
        return axiosFetch<TTankCustodyEntry[]>(
            'GET',
            `/api/tanks/custody?sampleType=${sampleType}&preservationId=${preservationId}`,
            {}
        );
    }
}

const tankService = new TankService();
export default tankService;
