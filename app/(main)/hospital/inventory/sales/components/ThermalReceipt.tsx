import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import React, { useRef } from 'react';
import { useInventorySalesContext } from '@/libs/contextProviders/AppContexts';
import { useReactToPrint } from 'react-to-print';
import { displayMessage } from '@/libs/utils';
import { TInventorySale, TPatient } from '@/types/hospital';

// Thermal Receipt Component
const ThermalReceiptComponent = React.forwardRef<
    HTMLDivElement,
    {
        saleData: TInventorySale;
        selectedPatient: TPatient | null;
        saleId?: string;
        saleDate: Date;
    }
>((props, ref) => {
    const { saleData, selectedPatient, saleId, saleDate } = props;

    return (
        <div
            ref={ref}
            style={{
                width: '80mm',
                fontFamily: 'monospace',
                fontSize: '12px',
                lineHeight: '1.2',
                padding: '5mm',
                color: '#000'
            }}
        >
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>HOSPITAL PHARMACY</div>
                <div style={{ fontSize: '10px' }}>123 Medical Center Drive</div>
                <div style={{ fontSize: '10px' }}>Phone: (555) 123-4567</div>
                <div style={{ borderTop: '1px dashed #000', margin: '5px 0' }}></div>
            </div>

            {/* Sale Info */}
            <div style={{ marginBottom: '10px' }}>
                <div>Receipt #: {saleId || 'TEMP001'}</div>
                <div>
                    Date: {saleDate.toLocaleDateString()} {saleDate.toLocaleTimeString()}
                </div>
                <div>Cashier: {saleData.createdBy || 'Staff'}</div>
                <div style={{ borderTop: '1px dashed #000', margin: '5px 0' }}></div>
            </div>

            {/* Patient Info */}
            {selectedPatient && (
                <div style={{ marginBottom: '10px' }}>
                    <div>
                        Patient: {selectedPatient.firstName} {selectedPatient.lastName}
                    </div>
                    <div>ID: {selectedPatient.patientId}</div>
                    <div style={{ borderTop: '1px dashed #000', margin: '5px 0' }}></div>
                </div>
            )}

            {/* Items */}
            <div style={{ marginBottom: '10px' }}>
                {saleData.items.map((item, index) => (
                    <div key={index} style={{ marginBottom: '8px' }}>
                        <div style={{ fontWeight: 'bold' }}>{item.itemName}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>
                                {item.quantity} x ${item.unitPrice}
                            </span>
                            <span>${item.totalPrice.toFixed(2)}</span>
                        </div>
                        {item.discount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                                <span>Discount:</span>
                                <span>-${item.discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                            <span>Subtotal:</span>
                            <span>${item.finalPrice.toFixed(2)}</span>
                        </div>
                    </div>
                ))}
                <div style={{ borderTop: '1px dashed #000', margin: '5px 0' }}></div>
            </div>

            {/* Totals */}
            <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Subtotal:</span>
                    <span>${saleData.items.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Total Discount:</span>
                    <span>-${saleData.items.reduce((sum, item) => sum + item.discount, 0).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px' }}>
                    <span>TOTAL:</span>
                    <span>${saleData.totalAmount}</span>
                </div>
                <div style={{ borderTop: '1px dashed #000', margin: '5px 0' }}></div>
            </div>

            {/* Payment */}
            <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Payment Method:</span>
                    <span>{saleData.paymentMethod}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Amount Tendered:</span>
                    <span>${saleData.amountTendered}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                    <span>Change:</span>
                    <span>${saleData.changeAmount}</span>
                </div>
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '10px' }}>
                <div style={{ borderTop: '1px dashed #000', margin: '5px 0' }}></div>
                <div>Thank you for your business!</div>
                <div>Please keep this receipt for your records</div>
                {saleData.remarks && <div style={{ marginTop: '5px', fontStyle: 'italic' }}>Note: {saleData.remarks}</div>}
            </div>
        </div>
    );
});
ThermalReceiptComponent.displayName = 'ThermalReceipt';
const ThermalReceipt = () => {
    const { state, setStateValue, toast } = useInventorySalesContext();
    const receiptRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: receiptRef,
        ignoreGlobalStyles: true,
        documentTitle: `Receipt_${state.lastCompletedSale?.saleId || 'TEMP'}`,
        onAfterPrint: () => {
            displayMessage({
                header: 'Success',
                message: 'Receipt sent to printer',
                life: 2000,
                toastComponent: toast,
                infoType: 'success'
            });
        }
    });
    return (
        <>
            {/* Receipt Dialog */}
            <Dialog header="Receipt Generated" visible={state.showReceiptDialog} onHide={() => setStateValue({ showReceiptDialog: false })} style={{ width: '400px' }} modal>
                <div className="text-center">
                    <i className="pi pi-check-circle text-6xl text-green-500 mb-3" />
                    <h4>Sale Completed Successfully!</h4>
                    <p className="text-600">Would you like to print the receipt?</p>

                    <div className="flex gap-3 justify-content-center mt-4">
                        <Button
                            label="Print Receipt"
                            icon="pi pi-print"
                            onClick={() => {
                                handlePrint();
                                setStateValue({ showReceiptDialog: false });
                            }}
                            className="p-button-success"
                        />
                        <Button label="Close" onClick={() => setStateValue({ showReceiptDialog: false })} className="p-button-outlined" />
                    </div>
                </div>
            </Dialog>

            {/* Hidden Receipt for Printing */}
            <div style={{ display: 'none' }}>
                {state.lastCompletedSale && (
                    <ThermalReceiptComponent ref={receiptRef} saleData={state.lastCompletedSale.saleData} selectedPatient={state.lastCompletedSale.patient} saleId={state.lastCompletedSale.saleId} saleDate={state.lastCompletedSale.date} />
                )}
            </div>
        </>
    );
};
export default ThermalReceipt;
