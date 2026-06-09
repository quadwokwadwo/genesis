import { TBrand, TCategory, TInventoryItem, TNewBrand, TNewCategory } from '@/types/hospital';
import { CRUDTYPE } from '@/types/enums/enums';
import axiosFetch from '@/libs/axiosConfig';

class InventoryItems{

    async addNewItem(inventoryItem: TInventoryItem, crudType: CRUDTYPE) {
        const data = await axiosFetch<TInventoryItem>('POST', `/api/items`, { inventoryItem, crudType });
        return { operatedData: data.data.operatedData, status: data.status, operationalStatus: data.data.status };
    }
    async uploadInventoryItems(inventoryItems: TInventoryItem[]) {
        const data = await axiosFetch<{ inserted: number; failedRows: Array<{ row: number; itemName?: string; reason: string }> }>('POST', `/api/items/upload`, { inventoryItems });
        const payload = data.data.operatedData ?? (data.data as any).data ?? { inserted: 0, failedRows: [] };
        return { operatedData: payload, status: data.status, operationalStatus: data.data.status };
    }
    async addNewBrand(brand: TNewBrand, crudType: CRUDTYPE) {
        const data = await axiosFetch<TBrand>('POST', `/api/brands`, { brand, crudType });
        return { operatedData: data.data.operatedData, status: data.status, operationalStatus: data.data.status };
    }
    async addNewCategory(category: TNewCategory, crudType: CRUDTYPE) {
        const data = await axiosFetch<TCategory>('POST', `/api/categories`, { category, crudType });
        return { operatedData: data.data.operatedData, status: data.status, operationalStatus: data.data.status };
    }
    async getItems() {
        const data = await axiosFetch<TInventoryItem[]>('GET', `/api/items`, {cache:'no-store'});

        return { operatedData: data.data.operatedData, status: data.status, operationalStatus: data.data.status };
    }
    async getBrands() {
        const data = await axiosFetch<TBrand[]>('GET', `/api/brands`, {cache:'no-store'});

        return { operatedData: data.data.operatedData, status: data.status, operationalStatus: data.data.status };
    }
    async getCategories() {
        const data = await axiosFetch<TCategory[]>('GET', `/api/categories`, {cache:'no-store'});

        return { operatedData: data.data.operatedData, status: data.status, operationalStatus: data.data.status };
    }
    async removeItem(itemId:number) {
        try {
            const data = await axiosFetch<TInventoryItem>('DELETE', `/api/items/${itemId}`, {});
            return { operatedData: data.data.operatedData, status: data.status, operationalStatus: data.data.status };
        } catch (err: any) {
            const status = err?.response?.status ?? 500;
            const code = err?.response?.data?.code ?? 'DELETE_FAILED';
            const message = err?.response?.data?.message ?? 'Failed to delete item';
            return { operatedData: null as any, status, operationalStatus: status, error: { code, message } };
        }
    }
}
export default InventoryItems;
