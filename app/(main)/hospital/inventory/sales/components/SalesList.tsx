import { useInventorySalesContext } from '@/libs/contextProviders/AppContexts';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { castStringToFloat, displayMessage } from '@/libs/utils';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { TInventorySale, TSalesItem } from '@/types/hospital';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import React, { useRef, useState } from 'react';
import { DataView } from 'primereact/dataview';
import { Divider } from 'primereact/divider';
import { CRUDTYPE } from '@/types/enums/enums';
import { useReactToPrint } from 'react-to-print';

const PrintableDrugList = React.forwardRef<HTMLDivElement, { items: TSalesItem[] }>((props, ref) => {
    const { items } = props;
    const total = items.reduce((sum, item) => sum + castStringToFloat(item.finalPrice), 0);
    return (
        <div ref={ref} style={{ width: '80mm', fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.4', padding: '5mm', color: '#000' }}>
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>HOSPITAL PHARMACY</div>
                <div style={{ fontSize: '10px' }}>Drug Dispensing List</div>
                <div style={{ fontSize: '10px' }}>
                    Date: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                </div>
                <div style={{ borderTop: '1px dashed #000', margin: '5px 0' }}></div>
            </div>
            <div style={{ marginBottom: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '11px', borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '5px' }}>
                    <span style={{ flex: 3 }}>Drug</span>
                    <span style={{ flex: 1, textAlign: 'right' }}>Qty</span>
                    <span style={{ flex: 1, textAlign: 'right' }}>Price</span>
                    <span style={{ flex: 1, textAlign: 'right' }}>Total</span>
                </div>
                {items.map((item, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '11px' }}>
                        <span style={{ flex: 3 }}>{item.itemName}</span>
                        <span style={{ flex: 1, textAlign: 'right' }}>{item.quantity}</span>
                        <span style={{ flex: 1, textAlign: 'right' }}>{item.unitPrice}</span>
                        <span style={{ flex: 1, textAlign: 'right' }}>{item.finalPrice}</span>
                    </div>
                ))}
            </div>
            <div style={{ borderTop: '1px dashed #000', margin: '5px 0' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '13px' }}>
                <span>TOTAL:</span>
                <span>${total.toFixed(2)}</span>
            </div>
            <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '10px' }}>
                <div style={{ borderTop: '1px dashed #000', margin: '5px 0' }}></div>
                <div>Thank you!</div>
            </div>
        </div>
    );
});
PrintableDrugList.displayName = 'PrintableDrugList';

const SalesList = () => {
    const { state, setStateValue, toast, deleteSale, loadSales } = useInventorySalesContext();
    const [showSalesItemsDialog, setShowSaleItemsDialog] = useState(false);
    const [saleItems, setSaleItems] = useState<TSalesItem[]>([]);
    const drugPrintRef = useRef<HTMLDivElement>(null);
    const handlePrintDrugs = useReactToPrint({
        contentRef: drugPrintRef,
        ignoreGlobalStyles: true,
        documentTitle: `Drugs_${new Date().toISOString()}`,
        pageStyle: `
      @page {
        size: 80mm auto;
        margin: 2mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          font-family: monospace;
          font-size: 11px;
          line-height: 1.3;
        }
      }
    `
    });
    const handleEditSale = (sale: TInventorySale) => {
        const salesPatient = state.patients.find((patient) => patient.patientId === sale.patientId);

        const saleItems: TSalesItem[] = typeof sale.items === 'string' ? JSON.parse(sale.items) : sale.items;

        const parsedSaleItems = saleItems.map((item) => ({
            ...item,
            unitPrice: castStringToFloat(item.unitPrice),
            quantity: castStringToFloat(item.quantity),
            totalPrice: castStringToFloat(item.totalPrice),
            discount: castStringToFloat(item.discount),
            finalPrice: castStringToFloat(item.finalPrice)
        }));

        const preparedSale: TInventorySale = {
            ...sale,
            items: parsedSaleItems,
            saleDate: new Date(sale.saleDate),
            amountTendered: castStringToFloat(sale.amountTendered),
            changeAmount: castStringToFloat(sale.changeAmount),
            totalAmount: castStringToFloat(sale.totalAmount)
        };

        setStateValue({ saleData: preparedSale, selectedPatient: salesPatient, showSalesDialog: false, crudType: CRUDTYPE.update });
    };

    const dateTemplate = (sale: TInventorySale) => {
        return new Date(sale.saleDate!).toLocaleDateString() + ' ' + new Date(sale.saleDate!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const paymentMethodTemplate = (sale: TInventorySale) => {
        const severityMap = {
            Cash: 'success',
            Card: 'info',
            Insurance: 'warning',
            'Mobile Money': 'help',
            Other: 'secondary'
        };
        return <Tag value={sale.paymentMethod} severity={severityMap[sale.paymentMethod] as any} />;
    };

    const amountTemplate = (sale: TInventorySale) => {
        return <span className="font-bold">${sale.totalAmount}</span>;
    };

    const onViewSaleItems = (saleItem: TInventorySale) => {
        setSaleItems(typeof saleItem.items === 'string' ? JSON.parse(saleItem.items) : saleItem.items);
        setShowSaleItemsDialog(true);
    };
    const actionsTemplate = (sale: TInventorySale) => {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-eye" className="p-button-rounded p-button-text p-button-info" onClick={() => onViewSaleItems(sale)} tooltip="View Details" />
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-text p-button-warning" onClick={() => handleEditSale(sale)} tooltip="Edit Sale" />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-text p-button-danger" onClick={() => deleteSale(sale.saleId!)} tooltip="Delete Sale" />
            </div>
        );
    };
    const viewSaleItemsTemplate = (item: TSalesItem) => {
        return (
            <>
                <Divider />
                <div className="col-12">
                    <div className="grid">
                        <div className="col-3">{item.itemName}</div>
                        <div className="col-1">{item.quantity}</div>
                        <div className="col-2">{item.unitPrice}</div>
                        <div className="col-2">{item.totalPrice}</div>
                        <div className="col-2">{item.discount}</div>
                        <div className="col-2">{item.finalPrice}</div>
                    </div>
                </div>
            </>
        );
    };
    return (
        <>
            {/* Sales List Dialog */}
            <Dialog header="Sales History" visible={state.showSalesDialog} onHide={() => setStateValue({ showSalesDialog: false })} style={{ width: '90vw', maxWidth: '1200px' }} modal maximized>
                <div className="mb-4">
                    <div className="flex justify-content-between align-items-center">
                        <h5 className="m-0">All Sales Transactions</h5>
                        <div className="flex gap-2">
                            <Button label="Refresh" icon="pi pi-refresh" onClick={loadSales} className="p-button-outlined" loading={state.isLoading} />
                            <Button
                                label="Export"
                                icon="pi pi-download"
                                className="p-button-outlined p-button-success"
                                onClick={() => {
                                    displayMessage({
                                        header: 'Info',
                                        message: 'Export functionality can be implemented',
                                        life: 2000,
                                        toastComponent: toast,
                                        infoType: 'info'
                                    });
                                }}
                            />
                        </div>
                    </div>
                </div>

                <DataTable
                    value={state.salesList}
                    loading={state.isLoading}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    dataKey="saleId"
                    emptyMessage="No sales found"
                    className="p-datatable-sm"
                    responsiveLayout="scroll"
                    stripedRows
                    showGridlines
                    sortMode="multiple"
                >
                    <Column field="saleId" header="Sale ID" sortable style={{ minWidth: '100px' }} />
                    <Column
                        field="patientName"
                        header="Patient"
                        sortable
                        style={{ minWidth: '150px' }}
                        body={(sale: TInventorySale) => (
                            <div className="flex align-items-center gap-2">
                                <Avatar label={sale.patientName?.charAt(0) || 'P'} shape="circle" size="normal" className="bg-primary" />
                                <span>{sale.patientName || 'Unknown Patient'}</span>
                            </div>
                        )}
                    />
                    <Column field="saleDate" header="Date & Time" sortable body={dateTemplate} style={{ minWidth: '150px' }} />
                    <Column field="paymentMethod" header="Payment" body={paymentMethodTemplate} style={{ minWidth: '120px' }} />
                    <Column field="totalAmount" header="Total Amount" body={amountTemplate} sortable style={{ minWidth: '120px' }} />
                    <Column field="amountTendered" header="Tendered" body={(sale: TInventorySale) => `$${sale.amountTendered || '0.00'}`} style={{ minWidth: '100px' }} />
                    <Column field="changeAmount" header="Change" body={(sale: TInventorySale) => `$${sale.changeAmount || '0.00'}`} style={{ minWidth: '100px' }} />
                    <Column field="createdBy" header="Cashier" style={{ minWidth: '120px' }} />
                    <Column header="Actions" body={actionsTemplate} style={{ minWidth: '140px' }} />
                </DataTable>
            </Dialog>
            <Dialog onHide={() => setShowSaleItemsDialog(false)} visible={showSalesItemsDialog} header="Sales Items" style={{ width: '90vw', maxWidth: '1200px' }} modal maximized>
                <div className="flex justify-content-end mb-3">
                    <Button label="Print Drugs" icon="pi pi-print" severity="info" size="small" onClick={handlePrintDrugs} disabled={saleItems.length === 0} />
                </div>
                <div className="col-12">
                    <div className="grid font-bold text-xl">
                        <div className="col-3">Drug</div>
                        <div className="col-1">Qty</div>
                        <div className="col-2">Price</div>
                        <div className="col-2">Subtotal</div>
                        <div className="col-2">Discount</div>
                        <div className="col-2">Final Price</div>
                    </div>
                </div>
                <DataView value={saleItems} paginator rows={10} className="p-datatable-sm" itemTemplate={viewSaleItemsTemplate} />
                <div style={{ display: 'none' }}>
                    <PrintableDrugList ref={drugPrintRef} items={saleItems} />
                </div>
            </Dialog>
        </>
    );
};
export default SalesList;
