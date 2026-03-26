// libs/blue_prints/InventorySales.ts

import { CRUDTYPE } from '@/types/enums/enums';
import { TInventorySale } from '@/types/hospital/hospital';
import axiosFetch from '@/libs/axiosConfig';

class InventorySalesService {
    async createSale(saleData: TInventorySale) {
        const data = await axiosFetch<TInventorySale>('POST', '/api/sales', {
            saleData,
            crudType: CRUDTYPE.save
        });
        return {
            operatedData: data.data.operatedData,
            status: data.status,
            operationalStatus: data.data.status
        };
    }

    async getSales(startDate?: string, endDate?: string) {
        const queryParams = new URLSearchParams();
        if (startDate) queryParams.append('startDate', startDate);
        if (endDate) queryParams.append('endDate', endDate);

        const data = await axiosFetch<TInventorySale[]>(
            'GET',
            `/api/sales?${queryParams.toString()}`,
            {cache:'no-store'}
        );
        return {
            operatedData: data.data.operatedData,
            status: data.status,
            operationalStatus: data.data.status
        };
    }

    async getSaleById(saleId: number) {
        const data = await axiosFetch<TInventorySale>('GET', `/api/sales/${saleId}`, {});
        return {
            operatedData: data.data.operatedData,
            status: data.status,
            operationalStatus: data.data.status
        };
    }

    async getSalesByPatient(patientId: number) {
        const data = await axiosFetch<TInventorySale[]>(
            'GET',
            `/api/sales/patient/${patientId}`,
            {}
        );
        return {
            operatedData: data.data.operatedData,
            status: data.status,
            operationalStatus: data.data.status
        };
    }

    async updateSale(saleData: TInventorySale) {
        const data = await axiosFetch<TInventorySale>('PUT', `/api/sales`, {
            saleData
        });
        return {
            operatedData: data.data.operatedData,
            status: data.status,
            operationalStatus: data.data.status
        };
    }

    async deleteSale(saleId: number) {
        const data = await axiosFetch<number>('DELETE', `/api/sales/${saleId}`, {});
        return {
            operatedData: data.data.operatedData,
            status: data.status,
            operationalStatus: data.data.status
        };
    }
}

export default InventorySalesService;
