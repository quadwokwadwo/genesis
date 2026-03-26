import { useAdjustmentsContext } from '@/libs/contextProviders/AppContexts';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';

const LowStock = () => {
    const { state } = useAdjustmentsContext();
    return (
        <>
            <DataTable value={state.inventoryItems.filter((item) => item.quantityInStock <= item.reorderLevel)} dataKey="itemId" paginator rows={10} emptyMessage="No low stock items found.">
                <Column field="itemName" header="Item Name" sortable />
                <Column field="categoryName" header="Category" sortable />
                <Column field="quantityInStock" header="Current Stock" sortable />
                <Column field="reorderLevel" header="Reorder Level" sortable />
            </DataTable>
        </>
    );
};
export default LowStock;
