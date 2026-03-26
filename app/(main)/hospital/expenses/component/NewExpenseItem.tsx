import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import React from 'react';
import { useExpenditureContext } from '@/libs/contextProviders/AppContexts';

const NewExpenseItem = () => {
    const { state, setStateValue, addExpenseItem } = useExpenditureContext();
    return (
        <>
            <div className="formgrid grid">
                <div className="field col-12">
                    <label htmlFor="itemDescription">Description *</label>
                    <InputText
                        id="itemDescription"
                        value={state.newItem.description}
                        onChange={(e) =>
                            setStateValue({
                                newItem: { ...state.newItem, description: e.target.value }
                            })
                        }
                        placeholder="Enter item description"
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="quantity">Quantity *</label>
                    <InputNumber
                        id="quantity"
                        value={state.newItem.quantity}
                        onChange={(e) =>
                            setStateValue({
                                newItem: { ...state.newItem, quantity: e.value || 1 }
                            })
                        }
                        min={1}
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="unitPrice">Unit Price *</label>
                    <InputNumber
                        id="unitPrice"
                        value={state.newItem.unitPrice}
                        onChange={(e) =>
                            setStateValue({
                                newItem: { ...state.newItem, unitPrice: e.value || 0 }
                            })
                        }
                        min={0}
                    />
                </div>
                <div className="field col-12">
                    <label htmlFor="itemNotes">Notes</label>
                    <InputTextarea
                        id="itemNotes"
                        value={state.newItem.notes}
                        onChange={(e) =>
                            setStateValue({
                                newItem: { ...state.newItem, notes: e.target.value }
                            })
                        }
                        rows={2}
                    />
                </div>
            </div>
        </>
    );
};
export default NewExpenseItem;
