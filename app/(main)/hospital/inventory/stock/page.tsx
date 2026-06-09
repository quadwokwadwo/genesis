'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import { Panel } from 'primereact/panel';
import { Toast } from 'primereact/toast';
import { TStockReportItem, TStockReportState, TCategory, TBrand, TStockSummary } from '@/types/hospital/hospital';
import StockReportService from '@/libs/blue_prints/StockReportService';
import InventoryItems from '@/libs/blue_prints/InventoryItems';
import { displayMessage } from '@/libs/utils';
import PrintableStockReport from '@/app/(main)/hospital/inventory/stock/components/PrintableStockReport';
import SummaryCards from '@/app/(main)/hospital/inventory/stock/components/SummaryCards';
import { StockReportContext } from '@/libs/contextProviders/AppContexts';
import ReportFilters from '@/app/(main)/hospital/inventory/stock/components/ReportFilters';
import ItemHistory from '@/app/(main)/hospital/inventory/stock/components/ItemHistory';
import StockReportTable from '@/app/(main)/hospital/inventory/stock/components/StockReportTable';

const INITIAL_STATE: TStockReportState = {
    items: [],
    filteredItems: [],
    selectedItem: null,
    showItemHistory: false,
    itemHistory: null,
    loading: false,
    reportCriteria: {
        category: 'all',
        brand: 'all',
        stockStatus: 'all',
        dateFrom: null,
        dateTo: null
    },
    categories: [],
    brands: [],
    summaryData: { totalItems: 0, outOfStock: 0, lowStock: 0, normalStock: 0, overstock: 0 }
};

// Printable Report Component

const StockReport = () => {
    const [state, setState] = useState<TStockReportState>(INITIAL_STATE);

    const toast = useRef<Toast>(null);
    const printRef = useRef<HTMLDivElement>(null);
    const stockReportService = new StockReportService();
    const inventoryService = new InventoryItems();

    const viewItemHistory = async (item: TStockReportItem) => {
        try {
            setStateValue({ loading: true, selectedItem: item });
            const response = await stockReportService.getItemStockHistory(item.itemId);
            if (response.status === 200) {
                setStateValue({
                    itemHistory: response.operatedData,
                    showItemHistory: true
                });
            }
        } catch (error) {
            displayMessage({
                header: 'Error',
                message: 'Failed to load item history',
                life: 3000,
                toastComponent: toast,
                infoType: 'error'
            });
        } finally {
            setStateValue({ loading: false });
        }
    };
    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        const initStockReportPage = async () => {
            await loadStockReport();
        };
        initStockReportPage().catch(console.error);
    }, [state.reportCriteria]);

    const setStateValue = (updates: Partial<TStockReportState>) => {
        setState((prev) => ({ ...prev, ...updates }));
    };

    const loadInitialData = async () => {
        try {
            setStateValue({ loading: true });
            const [categoriesResponse, brandsResponse] = await Promise.all([inventoryService.getCategories(), inventoryService.getBrands()]);

            const categoryOptions = [
                { label: 'All Categories', value: 'all' },
                ...categoriesResponse.operatedData.map((cat: TCategory) => ({
                    label: cat.categoryName,
                    value: cat.categoryName
                }))
            ];

            const brandOptions = [
                { label: 'All Brands', value: 'all' },
                ...brandsResponse.operatedData.map((brand: TBrand) => ({
                    label: brand.brandName,
                    value: brand.brandName
                }))
            ];

            setStateValue({
                categories: categoryOptions,
                brands: brandOptions
            });
        } catch (error) {
            displayMessage({
                header: 'Error',
                message: 'Failed to load initial data',
                life: 3000,
                toastComponent: toast,
                infoType: 'error'
            });
        } finally {
            setStateValue({ loading: false });
        }
    };

    const loadStockReport = async () => {
        try {
            setStateValue({ loading: true });
            if (state.reportCriteria.expiringOnly) {
                const days = state.reportCriteria.expiringDays ?? 30;
                const response: any = await stockReportService.getExpiringItems(days);
                if (response.status === 200) {
                    const rows: TStockReportItem[] = (response.operatedData ?? []).map((r: any) => ({
                        itemId: r.itemId,
                        itemName: r.itemName,
                        description: r.description ?? '',
                        categoryName: r.categoryName ?? '',
                        brandName: r.brandName ?? '',
                        unitPrice: r.unitPrice ?? 0,
                        quantityInStock: r.quantityInStock ?? 0,
                        reorderLevel: r.reorderLevel ?? 0,
                        packagingType: r.packagingType ?? '',
                        unitsPerBlister: r.unitsPerBlister ?? 0,
                        createdAt: r.createdAt,
                        updatedAt: r.updatedAt,
                        stockStatus: r.quantityInStock === 0 ? 'Out of Stock' : r.quantityInStock <= (r.reorderLevel ?? 0) ? 'Low' : 'Normal'
                    }));
                    setStateValue({ items: rows, filteredItems: rows, summaryData: getSummaryData(rows) });
                } else {
                    displayMessage({ header: 'Error', message: (response as any).error?.message ?? 'Failed to load expiring items', life: 3000, toastComponent: toast, infoType: 'error' });
                }
                return;
            }

            const filters = {
                category: state.reportCriteria.category !== 'all' ? state.reportCriteria.category : undefined,
                brand: state.reportCriteria.brand !== 'all' ? state.reportCriteria.brand : undefined,
                stockStatus: state.reportCriteria.stockStatus !== 'all' ? state.reportCriteria.stockStatus : undefined,
                dateFrom: state.reportCriteria.dateFrom?.toISOString().split('T')[0],
                dateTo: state.reportCriteria.dateTo?.toISOString().split('T')[0]
            };

            const response = await stockReportService.getStockReport(filters);
            const summaryData = getSummaryData(response.operatedData);
            setStateValue({ summaryData });
            if (response.status === 200) {
                setStateValue({
                    items: response.operatedData,
                    filteredItems: response.operatedData,
                    summaryData: summaryData
                });
            }
        } catch (error: any) {
            displayMessage({
                header: 'Error',
                message: error?.response?.data?.message ?? 'Failed to load stock report',
                life: 3000,
                toastComponent: toast,
                infoType: 'error'
            });
        } finally {
            setStateValue({ loading: false });
        }
    };

    const getSummaryData = (items: TStockReportItem[]): TStockSummary => ({
        totalItems: items.length,
        outOfStock: items.filter((item) => item.stockStatus === 'Out of Stock').length,
        lowStock: items.filter((item) => item.stockStatus === 'Low').length,
        normalStock: items.filter((item) => item.stockStatus === 'Normal').length,
        overstock: items.filter((item) => item.stockStatus === 'Overstock').length
    });
    return (
        <div className="grid">
            <Toast ref={toast} position="top-right" />

            <StockReportContext.Provider value={{ state, setStateValue, loadStockReport, toast, printRef, viewItemHistory }}>
                <div className="col-12">
                    <Card className="shadow-2">
                        <div className="flex align-items-center justify-content-between mb-4">
                            <div>
                                <h2 className="m-0 text-primary flex align-items-center gap-2">
                                    <i className="pi pi-chart-bar" />
                                    Stock Report
                                </h2>
                                <p className="text-600 m-0 mt-2">Comprehensive inventory stock analysis and reporting</p>
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="col-12">
                    <Panel header="Report Filters" className="mb-4">
                        {/* Filters */}
                        <ReportFilters />
                    </Panel>
                </div>
                {/* Summary Cards */}
                <div className="col-12">{<SummaryCards />}</div>
                {/* Stock Report Table */}
                <StockReportTable />
                {/* Hidden Printable Component */}
                <div style={{ display: 'none' }}>
                    <PrintableStockReport
                        ref={printRef}
                        items={state.items}
                        criteria={{
                            category: state.reportCriteria.category,
                            brand: state.reportCriteria.brand,
                            stockStatus: state.reportCriteria.stockStatus,
                            dateFrom: state.reportCriteria.dateFrom?.toLocaleDateString(),
                            dateTo: state.reportCriteria.dateTo?.toLocaleDateString()
                        }}
                        summary={state.summaryData}
                    />
                </div>
                {/* Item History Dialog */}
                <Dialog
                    header={`Stock History - ${state.selectedItem?.itemName}`}
                    visible={state.showItemHistory}
                    onHide={() => setStateValue({ showItemHistory: false, itemHistory: null })}
                    style={{ width: '80vw', maxWidth: '1000px' }}
                    modal
                    maximized
                >
                    {state.itemHistory && <ItemHistory />}
                </Dialog>
            </StockReportContext.Provider>
        </div>
    );
};

export default StockReport;
