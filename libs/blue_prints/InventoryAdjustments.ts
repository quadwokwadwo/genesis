import { TAdjustmentHistory, TStockAdjustment } from '@/types/hospital';
import axiosFetch from '@/libs/axiosConfig';

class InventoryAdjustments {
    async addNewAdjustment(adjustment: TStockAdjustment) {
        const data = await axiosFetch<TStockAdjustment>('POST', `/api/adjustments`, { adjustment });
        return { operatedData: data.data.operatedData, status: data.status, operationalStatus: data.data.status };
    }
    async getAdjustmentsList() {
        const data = await axiosFetch<TAdjustmentHistory[]>('GET', `/api/adjustments`, {cache:'no-store'});

        return { operatedData: data.data.operatedData, status: data.status, operationalStatus: data.data.status };
    }
}
export default InventoryAdjustments;
