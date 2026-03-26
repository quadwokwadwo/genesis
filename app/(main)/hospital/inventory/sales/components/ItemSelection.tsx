import { useInventorySalesContext } from '@/libs/contextProviders/AppContexts';
import { AutoComplete } from 'primereact/autocomplete';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { displayMessage } from '@/libs/utils';
import { TInventoryItem, TSalesItem } from '@/types/hospital';

const ItemSelection = () => {
    const { state, setStateValue, toast, resetItemForm } = useInventorySalesContext();
    const searchItems = (event: any) => {
        const query = event.query.toLowerCase();
        const filtered = state.inventoryItems.filter((item) => item.itemName.toLowerCase().includes(query) || item.description?.toLowerCase().includes(query));
        setStateValue({ filteredItems: filtered });
    };

    const addItemToCart = () => {
        if (!state.selectedItem) {
            displayMessage({
                header: 'Warning',
                message: 'Please select an item',
                life: 3000,
                toastComponent: toast,
                infoType: 'warn'
            });
            return;
        }

        if (state.itemQuantity <= 0) {
            displayMessage({
                header: 'Warning',
                message: 'Quantity must be greater than 0',
                life: 3000,
                toastComponent: toast,
                infoType: 'warn'
            });
            return;
        }

        if (state.itemQuantity > state.selectedItem.quantityInStock) {
            displayMessage({
                header: 'Warning',
                message: `Only ${state.selectedItem.quantityInStock} units available in stock`,
                life: 3000,
                toastComponent: toast,
                infoType: 'warn'
            });
            return;
        }

        const unitPrice = state.selectedItem.unitPrice || 0;
        const totalPrice = unitPrice * state.itemQuantity;
        const finalPrice = totalPrice - state.itemDiscount;

        const newItem: TSalesItem = {
            itemId: state.selectedItem.itemId,
            itemName: state.selectedItem.itemName,
            quantity: state.itemQuantity,
            unitPrice: unitPrice,
            totalPrice: totalPrice,
            discount: state.itemDiscount,
            finalPrice: finalPrice,
            availableStock: state.selectedItem.quantityInStock
        };

        if (state.editingItemIndex !== null) {
            const updatedItems = [...state.saleData.items];
            updatedItems[state.editingItemIndex] = newItem;
            setStateValue({ saleData: { ...state.saleData, items: updatedItems } });
            setStateValue({ editingItemIndex: null });
        } else {
            const existingIndex = state.saleData.items.findIndex((sItem) => sItem.itemId === state.selectedItem.itemId);
            if (existingIndex >= 0) {
                const updatedItems = [...state.saleData.items];
                updatedItems[existingIndex].quantity += state.itemQuantity;
                updatedItems[existingIndex].totalPrice = updatedItems[existingIndex].unitPrice * updatedItems[existingIndex].quantity;
                updatedItems[existingIndex].finalPrice = updatedItems[existingIndex].totalPrice - updatedItems[existingIndex].discount;
                setStateValue({ saleData: { ...state.saleData, items: updatedItems } });
            } else {
                setStateValue({ saleData: { ...state.saleData, items: [...state.saleData.items, newItem] } });
            }
        }

        resetItemForm();
    };
    return (
        <>
            <div className="grid">
                <div className="col-12 md:col-4">
                    <label htmlFor="item" className="block mb-2 font-semibold">
                        Search Item *
                    </label>
                    <AutoComplete
                        id="item"
                        value={state.selectedItem}
                        suggestions={state.filteredItems}
                        completeMethod={searchItems}
                        field="itemName"
                        onChange={(e) => setStateValue({ selectedItem: e.value })}
                        placeholder="Search items..."
                        className="w-full"
                        itemTemplate={(item: TInventoryItem) => (
                            <div className="flex justify-content-between align-items-center">
                                <div>
                                    <div className="font-bold">{item.itemName}</div>
                                    <div className="text-sm text-600">{item.description}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm">Stock: {item.quantityInStock}</div>
                                    <div className="font-bold text-primary">${item.unitPrice}</div>
                                </div>
                            </div>
                        )}
                        dropdown
                    />
                </div>

                <div className="col-6 md:col-2">
                    <label htmlFor="quantity" className="block mb-2 font-semibold">
                        Quantity *
                    </label>
                    <InputNumber
                        id="quantity"
                        value={state.itemQuantity}
                        onValueChange={(e) => setStateValue({ itemQuantity: typeof e.value === 'number' ? e.value : state.itemQuantity })}
                        min={1}
                        max={state.selectedItem?.quantityInStock}
                        showButtons
                        className="w-full"
                        onFocus={(e) => e.target.select()}
                    />
                </div>

                <div className="col-6 md:col-2">
                    <label htmlFor="discount" className="block mb-2 font-semibold">
                        Discount ($)
                    </label>
                    <InputNumber
                        id="discount"
                        value={state.itemDiscount}
                        onValueChange={(e) => setStateValue({ itemDiscount: e.value || 0 })}
                        min={0}
                        max={state.selectedItem ? (state.selectedItem.unitPrice || 0) * state.itemQuantity : 0}
                        mode="decimal"
                        className="w-full"
                        onFocus={(e) => e.target.select()}
                    />
                </div>

                <div className="col-6 md:col-2">
                    <label className="block mb-2 font-semibold">Final Price</label>
                    <div className="p-3 border-round text-center">
                        <span className="font-bold text-primary text-lg">${state.selectedItem ? ((state.selectedItem.unitPrice || 0) * state.itemQuantity - state.itemDiscount).toFixed(2) : '0.00'}</span>
                    </div>
                </div>

                <div className="col-6 md:col-2">
                    <label className="block mb-2 font-semibold">&nbsp;</label>
                    <Button label={state.editingItemIndex !== null ? 'Update' : 'Add'} icon={state.editingItemIndex !== null ? 'pi pi-check' : 'pi pi-plus'} onClick={addItemToCart} disabled={!state.selectedItem} className="w-full" />
                </div>

                {state.editingItemIndex !== null && (
                    <div className="col-12">
                        <Button label="Cancel Edit" icon="pi pi-times" onClick={resetItemForm} className="p-button-outlined p-button-secondary" />
                    </div>
                )}
            </div>
        </>
    );
};
export default ItemSelection;
