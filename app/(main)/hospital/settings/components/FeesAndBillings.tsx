import { InputNumber } from 'primereact/inputnumber';
import { MultiSelect } from 'primereact/multiselect';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import React from 'react';
import { useHospitalSettingsContext } from '@/libs/contextProviders/AppContexts';
import { BillPrintingDisplayType } from '@/types/enums/enums';

const FeesAndBillings = () => {
    const { state: settings, updateSetting, toast } = useHospitalSettingsContext();

    const paymentMethods = [
        { label: 'Cash', value: 'Cash' },
        { label: 'Credit Card', value: 'Card' },
        { label: 'Insurance', value: 'Insurance' },
        { label: 'Mobile Money', value: 'Mobile Money' },
        { label: 'Bank Transfer', value: 'Bank Transfer' }
    ];

    const billPrintTypes = [
        { label: 'Summary', value: BillPrintingDisplayType.summary },
        { label: 'Detailed', value: BillPrintingDisplayType.detailed }
    ];
    return (
        <>
            <div className="grid">
                <div className="col-12">
                    <h4>Basic Fee Structure</h4>
                </div>

                <div className="col-12 lg:col-6">
                    <div className="field">
                        <label htmlFor="consultationFee">Standard Consultation Fee</label>
                        <InputNumber id="consultationFee" value={settings.fees.consultationFee} onValueChange={(e) => updateSetting('fees', 'consultationFee', e.value)} mode="currency" currency="USD" className="w-full" />
                    </div>

                    <div className="field">
                        <label htmlFor="hospitalCardFee">Hospital Card Fee</label>
                        <InputNumber id="hospitalCardFee" value={settings.fees.hospitalCardFee} onValueChange={(e) => updateSetting('fees', 'hospitalCardFee', e.value)} mode="currency" currency="USD" className="w-full" />
                    </div>

                    <div className="field">
                        <label htmlFor="emergencyFee">Hospital Card Renewal Fee</label>
                        <InputNumber id="emergencyFee" value={settings.fees.hospitalCardRenewalFee} onValueChange={(e) => updateSetting('fees', 'emergencyFee', e.value)} mode="currency" currency="USD" className="w-full" />
                    </div>

                    <div className="field">
                        <label htmlFor="followUpDiscount">Follow-up Consultation Fee</label>
                        <InputNumber id="followUpDiscount" value={settings.fees.followUpConsultationFee} onValueChange={(e) => updateSetting('fees', 'followUpDiscount', e.value)} min={0} max={100} className="w-full" />
                    </div>
                </div>

                <div className="col-12 lg:col-6">
                    <div className="field">
                        <label htmlFor="taxRate">Tax Rate (%)</label>
                        <InputNumber id="taxRate" value={settings.fees.taxRate} onValueChange={(e) => updateSetting('fees', 'taxRate', e.value)} suffix="%" minFractionDigits={1} maxFractionDigits={2} className="w-full" />
                    </div>

                    <div className="field">
                        <label htmlFor="paymentMethods">Accepted Payment Methods</label>
                        <MultiSelect id="paymentMethods" value={settings.fees.paymentMethods} options={paymentMethods} onChange={(e) => updateSetting('fees', 'paymentMethods', e.value)} className="w-full" display="chip" />
                    </div>

                    <div className="field">
                        <label htmlFor="defaultPayment">Default Payment Method</label>
                        <Dropdown
                            id="defaultPayment"
                            value={settings.fees.defaultPaymentMethod}
                            options={settings.fees.paymentMethods.map((m) => ({ label: m, value: m }))}
                            onChange={(e) => updateSetting('fees', 'defaultPaymentMethod', e.value)}
                            className="w-full"
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="autoInvoicing">Enable Auto-Invoicing</label>
                        <div className="flex align-items-center">
                            <InputSwitch id="autoInvoicing" checked={settings.fees.enableAutoInvoicing} onChange={(e) => updateSetting('fees', 'enableAutoInvoicing', e.value)} />
                            <span className="ml-2">{settings.fees.enableAutoInvoicing ? 'Enabled' : 'Disabled'}</span>
                        </div>
                    </div>

                    <div className="field">
                        <label htmlFor="billPrintType">Bill Print Type</label>
                        <Dropdown id="billPrintType" value={settings.fees.billPrintType} options={billPrintTypes} onChange={(e) => updateSetting('fees', 'billPrintType', e.value)} className="w-full" placeholder="Select bill print type" />
                    </div>
                </div>
            </div>
        </>
    );
};
export default FeesAndBillings;
