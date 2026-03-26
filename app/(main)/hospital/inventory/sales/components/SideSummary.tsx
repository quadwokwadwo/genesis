import { Panel } from 'primereact/panel';
import { Badge } from 'primereact/badge';
import { Divider } from 'primereact/divider';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import React from 'react';
import { useInventorySalesContext } from '@/libs/contextProviders/AppContexts';
import { FilterSelect } from '@/libs/components/UtilComponents';
import { CRUDTYPE } from '@/types/enums/enums';

const SideSummary = () => {
    const { state, setStateValue, completeSale, user } = useInventorySalesContext();

    return (
        <>
            <div className="col-12 lg:col-4">
                <div className="sticky" style={{ top: '2rem' }}>
                    <Panel header="Sale Summary" className="shadow-3">
                        <div className="flex flex-column gap-3">
                            <div className="flex justify-content-between align-items-center p-3 border-round">
                                <span className="font-semibold">Items Count:</span>
                                <Badge value={state.saleData.items.length} severity="info" size="large" />
                            </div>
                            <div className="flex justify-content-between align-items-center p-3 border-round">
                                <span className="font-semibold">Subtotal:</span>
                                <span className="font-bold text-lg">{state.saleData.items.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-content-between align-items-center p-3 border-round">
                                <span className="font-semibold">Total Discount:</span>
                                <span className="font-bold text-lg text-orange-600">-{state.saleData.items.reduce((sum, item) => sum + item.discount, 0).toFixed(2)}</span>
                            </div>
                            <Divider />
                            <div className="flex justify-content-between align-items-center p-4 border-round">
                                <span className="font-bold text-xl">TOTAL AMOUNT:</span>
                                <span className="font-bold text-3xl text-primary">{state.saleData.totalAmount.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-content-between align-items-center p-3 border-round">
                                <span className="font-semibold">Amount Tendered:</span>
                                <span className="font-bold text-lg">{state.saleData.amountTendered.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-content-between align-items-center p-3 border-round">
                                <span className="font-semibold">Change:</span>
                                <span className="font-bold text-lg text-green-600">{state.saleData.changeAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-content-between align-items-center p-3 border-round">
                                <label htmlFor="paymentMethod" className="block mb-2 font-semibold">
                                    Payment Method *
                                </label>
                                <FilterSelect
                                    selectedOption={state.selectedPaymentMethod}
                                    selectableOptions={state.paymentMethods}
                                    onSelectChange={(e) => setStateValue({ saleData: { ...state.saleData, paymentMethod: e.value.name }, selectedPaymentMethod: e.value })}
                                    elementId="salePayments"
                                    defaultValue="Select"
                                />
                            </div>
                            <div className="flex justify-content-between align-items-center p-3 border-round">
                                <label htmlFor="createdBy" className="block mb-2 font-semibold">
                                    Cashier/Staff
                                </label>
                                <InputText id="createdBy" value={user?.username ?? ''} disabled placeholder="Enter staff name" className="w-fit" />
                            </div>
                            <div className="flex justify-content-between align-items-center p-3 border-round">
                                <label htmlFor="amountTendered" className="flex-1 block mb-2 font-semibold">
                                    Amount Tendered *
                                </label>
                                <InputNumber
                                    id="amountTendered"
                                    value={state.saleData.amountTendered}
                                    onValueChange={(e) => setStateValue({ saleData: { ...state.saleData, amountTendered: e.value || 0 } })}
                                    className="w-fit mb-3"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="flex justify-content-between align-items-center p-3 border-round">
                                <span className="font-semibold">Change:</span>
                                <div className="flex justify-content-between">
                                    <span className={`font-bold text-xl ${state.saleData.changeAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>${state.saleData.changeAmount.toFixed(2)}</span>
                                </div>

                                {state.saleData.amountTendered < state.saleData.totalAmount && state.saleData.totalAmount > 0 && <div className="mt-2 p-2 bg-red-100 border-round text-red-800 text-sm">Insufficient payment</div>}
                            </div>
                        </div>
                        <Button
                            label={state.crudType === CRUDTYPE.save ? 'Complete Sale' : 'Update Sale'}
                            icon="pi pi-check-circle"
                            className="p-button-success w-full"
                            onClick={completeSale}
                            disabled={state.saleData.items.length === 0 || !state.selectedPatient || state.isLoading}
                            loading={state.isLoading}
                        />
                    </Panel>
                </div>
            </div>
        </>
    );
};
export default SideSummary;
