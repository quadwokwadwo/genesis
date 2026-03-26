import { useAdjustmentsContext } from '@/libs/contextProviders/AppContexts';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Badge } from 'primereact/badge';
import { InputTextarea } from 'primereact/inputtextarea';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primereact/autocomplete';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { TAdjustmentItem } from '@/types/hospital';
import React from 'react';

const NewAdjustment = () => {
    const { state, setStateValue, toast } = useAdjustmentsContext();
    const adjustmentItemTemplate = (item: TAdjustmentItem, index: number) => {
        const newQuantity = state.adjustment.adjustmentType === 'IN' ? (item.previousQuantity || 0) + item.quantityAdjusted : (item.previousQuantity || 0) - item.quantityAdjusted;

        return (
            <div key={index} className="border-1 border-300 border-round p-3 mb-2">
                <div className="flex justify-content-between align-items-start">
                    <div className="flex-1">
                        <h6 className="m-0 mb-2">{item.itemName}</h6>
                        <div className="text-sm text-600">
                            <span>Current: {item.previousQuantity || 0}</span>
                            <span className="mx-2">→</span>
                            <span className="font-medium">New: {newQuantity}</span>
                        </div>
                        <div className="text-sm text-600 mt-1">
                            Adjust:{' '}
                            <span className={`font-medium ${state.adjustment.adjustmentType === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                                {state.adjustment.adjustmentType === 'IN' ? '+' : '-'}
                                {item.quantityAdjusted}
                            </span>
                        </div>
                        {item.remarks && <div className="text-sm text-500 mt-1 italic">{item.remarks}</div>}
                    </div>
                    <Button icon="pi pi-times" className="p-button-text p-button-danger p-button-sm" onClick={() => removeItemFromAdjustment(index)} />
                </div>
            </div>
        );
    };
    const removeItemFromAdjustment = (index: number) => {
        setStateValue({ adjustment: { ...state.adjustment, adjustmentItems: state.adjustment.adjustmentItems.filter((_, i) => i !== index) } });
    };
    const addItemToAdjustment = () => {
        if (!state.selectedItem || state.singleAdjustment.quantity <= 0) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Warning',
                detail: 'Please select an item and enter a valid quantity'
            });
            return;
        }

        // Check if item already exists in adjustment
        const existingIndex = state.adjustment.adjustmentItems.findIndex((item) => item.itemId === state.selectedItem.itemId);

        const newItem: TAdjustmentItem = {
            itemId: state.selectedItem.itemId,
            itemName: state.selectedItem.itemName,
            quantityAdjusted: state.singleAdjustment.quantity,
            remarks: state.singleAdjustment.remarks,
            previousQuantity: state.selectedItem.quantityInStock
        };

        if (existingIndex >= 0) {
            // Update existing item
            const updatedItems = [...state.adjustment.adjustmentItems];
            updatedItems[existingIndex] = newItem;

            setStateValue({ adjustment: { ...state.adjustment, adjustmentItems: updatedItems } });
        } else {
            // Add new item
            setStateValue({ adjustment: { ...state.adjustment, adjustmentItems: [...state.adjustment.adjustmentItems, newItem] } });
        }

        // Reset single adjustment form
        setStateValue({ selectedItem: null, singleAdjustment: { quantity: 0, remarks: '' } });
    };
    const searchItems = (event: AutoCompleteCompleteEvent) => {
        const filtered = state.inventoryItems.filter((item) => item.itemName.toLowerCase().includes(event.query.toLowerCase()));
        setStateValue({ filteredItems: filtered });
    };
    return (
        <>
            <div className="formgrid grid p-fluid">
                {/* Adjustment Details */}
                <div className="field col-12 md:col-4">
                    <label htmlFor="adjustmentType" className="block text-900 font-medium mb-2">
                        Adjustment Type *
                    </label>
                    <Dropdown
                        id="adjustmentType"
                        value={state.adjustment.adjustmentType}
                        options={[
                            { label: 'Stock In', value: 'IN' },
                            { label: 'Stock Out', value: 'OUT' }
                        ]}
                        onChange={(e) => setStateValue({ adjustment: { ...state.adjustment, adjustmentType: e.value } })}
                        placeholder="Select type"
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="performedBy" className="block text-900 font-medium mb-2">
                        Performed By *
                    </label>
                    <InputText id="performedBy" value={state.adjustment.performedBy} onChange={(e) => setStateValue({ adjustment: { ...state.adjustment, performedBy: e.target.value } })} placeholder="Enter name" />
                </div>

                <div className="field col-12 md:col-4">
                    <label className="block text-900 font-medium mb-2">Items to Adjust</label>
                    <Badge value={state.adjustment.adjustmentItems.length} severity={state.adjustment.adjustmentItems.length > 0 ? 'success' : 'warning'} />
                </div>

                <div className="field col-12">
                    <label htmlFor="reason" className="block text-900 font-medium mb-2">
                        Reason *
                    </label>
                    <InputTextarea id="reason" value={state.adjustment.reason} onChange={(e) => setStateValue({ adjustment: { ...state.adjustment, reason: e.target.value } })} placeholder="Enter reason for adjustment" rows={2} />
                </div>

                {/* Add Items Section */}
                <div className="col-12">
                    <div className="border-1 border-300 border-round p-4">
                        <h5 className="mt-0 mb-3">Add Items</h5>

                        <div className="formgrid grid">
                            <div className="field col-12 md:col-4">
                                <label htmlFor="itemSearch" className="block text-900 font-medium mb-2">
                                    Search Item
                                </label>
                                <AutoComplete
                                    id="itemSearch"
                                    value={state.selectedItem}
                                    suggestions={state.filteredItems}
                                    completeMethod={searchItems}
                                    field="itemName"
                                    placeholder="Type to search items..."
                                    onChange={(e) => setStateValue({ selectedItem: e.value })}
                                    itemTemplate={(item) => (
                                        <div>
                                            <div className="font-medium">{item.itemName}</div>
                                            <div className="text-sm text-600">
                                                Stock: {item.quantityInStock} | Category: {item.categoryName}
                                            </div>
                                        </div>
                                    )}
                                />
                            </div>

                            <div className="field col-12 md:col-3">
                                <label htmlFor="adjustQuantity" className="block text-900 font-medium mb-2">
                                    Quantity
                                </label>
                                <InputNumber id="adjustQuantity" value={state.singleAdjustment.quantity} onValueChange={(e) => setStateValue({ singleAdjustment: { ...state.singleAdjustment, quantity: e.value || 0 } })} placeholder="0" min={0} />
                            </div>

                            <div className="field col-12 md:col-3">
                                <label htmlFor="itemRemarks" className="block text-900 font-medium mb-2">
                                    Remarks
                                </label>
                                <InputText id="itemRemarks" value={state.singleAdjustment.remarks} onChange={(e) => setStateValue({ singleAdjustment: { ...state.singleAdjustment, remarks: e.target.value } })} placeholder="Optional remarks" />
                            </div>

                            <div className="field col-12 md:col-2">
                                <label className="block text-900 font-medium mb-2">&nbsp;</label>
                                <Button label="Add" icon="pi pi-plus" onClick={addItemToAdjustment} disabled={!state.selectedItem || state.singleAdjustment.quantity <= 0} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items List */}
                {state.adjustment.adjustmentItems.length > 0 && (
                    <div className="col-12">
                        <h5>Items to be Adjusted ({state.adjustment.adjustmentItems.length})</h5>
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>{state.adjustment.adjustmentItems.map((item, index) => adjustmentItemTemplate(item, index))}</div>
                    </div>
                )}
            </div>
        </>
    );
};
export default NewAdjustment;
