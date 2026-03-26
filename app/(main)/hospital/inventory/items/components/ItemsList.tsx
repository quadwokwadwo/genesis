import SimpleTable from '@/libs/components/SimpleTable';
import React from 'react';
import { useItemsContext } from '@/libs/contextProviders/AppContexts';
import { TInventoryItem } from '@/types/hospital';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';

const ItemsList = () => {
    const { state, editItem, deleteItem } = useItemsContext();
    const actionBodyTemplate = (rowData: TInventoryItem) => (
        <div className="flex gap-2">
            <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => editItem(rowData)} />
            <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => deleteItem(rowData)} />
        </div>
    );

    const priceBodyTemplate = (rowData: TInventoryItem) => <span>${rowData.unitPrice}</span>;

    const stockBodyTemplate = (rowData: TInventoryItem) => {
        const isLowStock = (rowData.quantityInStock || 0) <= (rowData.reorderLevel || 0);
        return <Tag value={rowData.quantityInStock || 0} severity={isLowStock ? 'danger' : 'success'} />;
    };
    return (
        <>
            <div className="flex justify-content-center align-items-center">
                <SimpleTable
                    tableData={state.inventoryItems}
                    tableKey="itemId"
                    searchValues={['itemName', 'categoryName']}
                    columnsDef={[
                        { field: 'itemName', header: 'Item Name', sortable: true },
                        { field: 'categoryName', header: 'Category' },
                        { field: 'brandName', header: 'Brand' },
                        { field: 'unitPrice', header: 'Unit Price', body: priceBodyTemplate, sortable: true },
                        { field: 'quantityInStock', header: 'Stock', body: stockBodyTemplate, sortable: true },
                        { field: 'reorderLevel', header: 'Reorder Level' },
                        { header: '', body: actionBodyTemplate }
                    ]}
                    loadingStatus={state.loading}
                />
            </div>
        </>
    );
};
export default ItemsList;
