import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import React from 'react';
import { useInventorySalesContext } from '@/libs/contextProviders/AppContexts';
import { TSalesItem } from '@/types/hospital';
import { Button } from 'primereact/button';
import { number } from 'joi';
import { confirmDialog } from 'primereact/confirmdialog';

const CartItems = () => {
    const { state, setStateValue } = useInventorySalesContext();
    const editCartItem = (item: TSalesItem, index: number) => {
        const inventoryItem = state.inventoryItems.find((i) => i.itemId === item.itemId);
        if (inventoryItem) {
            setStateValue({ selectedItem: inventoryItem, itemQuantity: item.quantity, itemDiscount: item.discount, editingItemIndex: index });
        }
    };

    const removeItem = (index: number) => {
        confirmDialog({
            message: 'Are you sure you want to remove this item?',
            header: 'Confirm Remove',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const updatedItems = state.saleData.items.filter((_, i) => i !== index);
                setStateValue({ saleData: { ...state.saleData, items: updatedItems } });
            }
        });
    };
    const actionBodyTemplate = (rowData: TSalesItem, options: any) => {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-text p-button-warning" onClick={() => editCartItem(rowData, options.rowIndex)} tooltip="Edit" />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-text p-button-danger" onClick={() => removeItem(options.rowIndex)} tooltip="Remove" />
            </div>
        );
    };

    const priceBodyTemplate = (rowData: TSalesItem, field: keyof TSalesItem) => {
        return <span>${Number(rowData[field]).toFixed(2)}</span>;
    };
    return (
        <>
            <DataTable value={state.saleData.items} emptyMessage="No items added to cart yet" responsiveLayout="scroll" stripedRows showGridlines>
                <Column field="itemName" header="Item Name" style={{ minWidth: '200px' }} />
                <Column field="quantity" header="Qty" style={{ minWidth: '80px' }} />
                <Column field="unitPrice" header="Unit Price" body={(rowData) => priceBodyTemplate(rowData, 'unitPrice')} style={{ minWidth: '120px' }} />
                <Column field="totalPrice" header="Total" body={(rowData) => priceBodyTemplate(rowData, 'totalPrice')} style={{ minWidth: '120px' }} />
                <Column field="discount" header="Discount" body={(rowData) => priceBodyTemplate(rowData, 'discount')} style={{ minWidth: '100px' }} />
                <Column field="finalPrice" header="Final Price" body={(rowData) => <span className="font-bold text-primary">{priceBodyTemplate(rowData, 'finalPrice')}</span>} style={{ minWidth: '120px' }} />
                <Column header="Actions" body={actionBodyTemplate} style={{ minWidth: '120px' }} />
            </DataTable>
        </>
    );
};
export default CartItems;
