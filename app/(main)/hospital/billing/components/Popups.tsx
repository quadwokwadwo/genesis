import { InputText } from 'primereact/inputtext';
import { RadioButton } from 'primereact/radiobutton';
import React from 'react';
import { Dialog } from 'primereact/dialog';
import { useBillingContext } from '@/libs/contextProviders/AppContexts';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import PrescriptionCard from '@/app/(main)/hospital/billing/components/PrescriptionCard';

export const CustomerCharge = () => {
    const { state, setStateValue, addCustomCharge, viewPrescriptionItem } = useBillingContext();
    return (
        <>
            <Dialog visible={state.showCustomChargeDialog} onHide={() => setStateValue({ showCustomChargeDialog: false })} header="Add Custom Charge" style={{ width: '450px' }}>
                <div className="field">
                    <label htmlFor="chargeDescription">Description *</label>
                    <InputText
                        id="chargeDescription"
                        value={state.customCharge.description}
                        onChange={(e) => setStateValue({ customCharge: { ...state.customCharge, description: e.target.value } })}
                        className="w-full"
                        placeholder="Enter charge description"
                    />
                </div>
                <div className="field">
                    <label htmlFor="chargeAmount">Amount *</label>
                    <InputNumber id="chargeAmount" value={state.customCharge.amount} onValueChange={(e) => setStateValue({ customCharge: { ...state.customCharge, amount: e.value } })} className="w-full" min={0} />
                </div>
                <div className="flex justify-content-end gap-2">
                    <Button label="Cancel" icon="pi pi-times" text onClick={() => setStateValue({ showCustomChargeDialog: false })} />
                    <Button label="Add" icon="pi pi-check" onClick={addCustomCharge} />
                </div>
            </Dialog>
        </>
    );
};
export const AddInvestigation = () => {
    const { state, setStateValue, addNewInvestigation } = useBillingContext();
    return (
        <>
            <Dialog visible={state.showAddInvestigationDialog} onHide={() => setStateValue({ showAddInvestigationDialog: false })} header="Add New Investigation" style={{ width: '450px' }}>
                <div className="field">
                    <label htmlFor="testName">Test Name *</label>
                    <InputText
                        id="testName"
                        value={state.newInvestigation.testName || ''}
                        onChange={(e) => setStateValue({ newInvestigation: { ...state.newInvestigation, testName: e.target.value } })}
                        className="w-full"
                        placeholder="Enter test name"
                    />
                </div>
                <div className="field">
                    <label>Source *</label>
                    <div className="flex gap-3">
                        <div className="flex align-items-center">
                            <RadioButton inputId="internal" value="Internal" checked={state.newInvestigation.source === 'Internal'} onChange={(e) => setStateValue({ newInvestigation: { ...state.newInvestigation, source: e.value, price: 0 } })} />
                            <label htmlFor="internal" className="ml-2">
                                Internal
                            </label>
                        </div>
                        <div className="flex align-items-center">
                            <RadioButton inputId="external" value="External" checked={state.newInvestigation.source === 'External'} onChange={(e) => setStateValue({ newInvestigation: { ...state.newInvestigation, source: e.value, price: 0 } })} />
                            <label htmlFor="external" className="ml-2">
                                External
                            </label>
                        </div>
                    </div>
                </div>
                {state.newInvestigation.source === 'Internal' && (
                    <div className="field">
                        <label htmlFor="price">Price</label>
                        <InputNumber id="price" value={state.newInvestigation.price || 0} onValueChange={(e) => setStateValue({ newInvestigation: { ...state.newInvestigation, price: e.value } })} className="w-full" min={0} />
                    </div>
                )}
                <div className="flex justify-content-end gap-2">
                    <Button label="Cancel" icon="pi pi-times" text onClick={() => setStateValue({ showAddInvestigationDialog: false })} />
                    <Button label="Add" icon="pi pi-check" onClick={addNewInvestigation} />
                </div>
            </Dialog>
        </>
    );
};
export const PrescriptionItemView = () => {
    const { state } = useBillingContext();
    return (
        <>
            <div className="col-12 w-full">
                <PrescriptionCard med={state.selectedPrescription} loading={state.isLoading} generalSettings={state.generalSettings} />
            </div>
        </>
    );
};
