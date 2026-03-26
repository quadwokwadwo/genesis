import { Card } from 'primereact/card';
import { Toolbar } from 'primereact/toolbar';
import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { TStockReportItem } from '@/types/hospital';
import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { useStockReportContext } from '@/libs/contextProviders/AppContexts';
import { FilterMatchMode } from 'primereact/api';
import { displayMessage, formatCurrency } from '@/libs/utils';
import { Tag } from 'primereact/tag';
import { useReactToPrint } from 'react-to-print';

const StockReportTable = () => {
    const { state, setStateValue, loadStockReport, printRef, toast, viewItemHistory } = useStockReportContext();
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [filters, setFilters] = useState<DataTableFilterMeta>({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    });
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        ignoreGlobalStyles: true,
        documentTitle: `Stock-Report-${new Date().toISOString().split('T')[0]}`,
        onAfterPrint: () => {
            displayMessage({
                header: 'Success',
                message: 'Report sent to printer successfully',
                life: 3000,
                toastComponent: toast,
                infoType: 'success'
            });
        },
        pageStyle: `
            @page {
                size: A4;
                margin: 0.5in;
            }
            @media print {
                body { -webkit-print-color-adjust: exact; }
                table { page-break-inside: avoid; }
                tr { page-break-inside: avoid; }
            }
        `
    });

    // Template functions
    const stockStatusTemplate = (item: TStockReportItem) => {
        const severityMap = {
            'Out of Stock': 'danger',
            Low: 'warning',
            Normal: 'success',
            Overstock: 'info'
        };
        return <Tag value={item.stockStatus} severity={severityMap[item.stockStatus] as any} />;
    };
    const quantityTemplate = (item: TStockReportItem) => {
        const isLow = item.quantityInStock <= item.reorderLevel;
        const isOut = item.quantityInStock === 0;

        return <span className={`font-bold ${isOut ? 'text-red-600' : isLow ? 'text-orange-600' : 'text-green-600'}`}>{item.quantityInStock}</span>;
    };

    const actionTemplate = (item: TStockReportItem) => {
        return <Button icon="pi pi-history" className="p-button-rounded p-button-text p-button-info" onClick={() => viewItemHistory(item)} tooltip="View History" />;
    };

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let _filters = { ...filters };
        (_filters['global'] as any).value = value;
        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const renderHeader = () => {
        return (
            <div className="flex justify-content-end">
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Search items..." />
                </span>
            </div>
        );
    };

    const toolbarStart = (
        <div className="flex gap-2">
            <Button label="Refresh" icon="pi pi-refresh" onClick={loadStockReport} loading={state.loading} className="p-button-outlined" />
            <Button label="Print Report" icon="pi pi-print" onClick={handlePrint} className="p-button-outlined p-button-help" disabled={state.items.length === 0} />
        </div>
    );
    return (
        <div className="col-12">
            <Card className="shadow-2">
                <Toolbar start={toolbarStart} className="mb-4" />

                <DataTable
                    value={state.items}
                    loading={state.loading}
                    paginator
                    rows={20}
                    rowsPerPageOptions={[10, 20, 50, 100]}
                    dataKey="itemId"
                    filters={filters}
                    globalFilterFields={['itemName', 'categoryName', 'brandName', 'stockStatus']}
                    header={renderHeader()}
                    emptyMessage="No items found"
                    className="p-datatable-sm"
                    responsiveLayout="scroll"
                    stripedRows
                    showGridlines
                >
                    <Column field="itemName" header="Item Name" sortable style={{ minWidth: '200px' }} />
                    <Column field="categoryName" header="Category" sortable style={{ minWidth: '120px' }} />
                    <Column field="brandName" header="Brand" sortable style={{ minWidth: '120px' }} />
                    <Column field="quantityInStock" header="Current Stock" body={quantityTemplate} sortable style={{ minWidth: '120px' }} />
                    <Column field="reorderLevel" header="Reorder Level" sortable style={{ minWidth: '120px' }} />
                    <Column field="stockStatus" header="Status" body={stockStatusTemplate} style={{ minWidth: '120px' }} />
                    <Column field="totalSold" header="Total Sold" sortable style={{ minWidth: '100px' }} />
                    <Column field="daysSinceLastSale" header="Days Since Last Sale" sortable style={{ minWidth: '140px' }} />
                    <Column field="unitPrice" header="Unit Price" sortable style={{ minWidth: '120px' }} body={(item: TStockReportItem) => `${formatCurrency(item.unitPrice)}`} />
                    <Column header="Actions" body={actionTemplate} style={{ minWidth: '80px' }} />
                </DataTable>
            </Card>
        </div>
    );
};
export default StockReportTable;
