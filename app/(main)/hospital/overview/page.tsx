// app/(main)/hospital/reports/overall/page.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card } from 'primereact/card';
import { TabView, TabPanel } from 'primereact/tabview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { DropdownChangeEvent } from 'primereact/dropdown';
import { Chart } from 'primereact/chart';
import { Tag } from 'primereact/tag';
import { ProgressBar } from 'primereact/progressbar';
import { Toast } from 'primereact/toast';
import { Panel } from 'primereact/panel';
import { Divider } from 'primereact/divider';
import Overview from '@/libs/Overview';
import { changeDateFormat, defaultSelected, formatCurrency } from '@/libs/utils';
import SettingService from '@/libs/blue_prints/SettingService';
import { BillingCategorySummary, DailyRevenue, DateRange, DropdownOption, ExpenditureSummary, FinancialSummary, IGeneralSettings, InventoryItem, PaymentMethodSummary } from '@/types/hospital';
import { FilterSelect } from '@/libs/components/UtilComponents';
import PagePrinter from '@/app/(main)/hospital/overview/components/PagePrinter';

// Types

const OverallReportsPage = () => {
    const toast = useRef<Toast>(null);
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [time, setTime] = useState('');
    // Date filters
    const [dateRange, setDateRange] = useState<DateRange>({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
        endDate: new Date()
    });
    const [reportPeriod, setReportPeriod] = useState('monthly');
    const [selectedReportPeriod, setSelectedReportPeriod] = useState<DropdownOption>(defaultSelected());
    // Financial data
    const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
        totalRevenue: 0,
        totalExpenditure: 0,
        netProfit: 0,
        profitMargin: 0,
        totalBillings: 0,
        averageBillValue: 0,
        outstandingBalance: 0,
        collectionRate: 0,
        totalFromSales: 0,
        patientsPayments: 0
    });

    const [billingCategories, setBillingCategories] = useState<BillingCategorySummary[]>([]);

    const [expenditures, setExpenditures] = useState<ExpenditureSummary[]>([]);

    const [topSellingItems, setTopSellingItems] = useState<InventoryItem[]>([]);

    const [lowMovingItems, setLowMovingItems] = useState<InventoryItem[]>([]);

    const [generalSettings, setGeneralSettings] = useState<IGeneralSettings>(null);

    const [paymentMethods, setPaymentMethods] = useState<PaymentMethodSummary[]>([]);

    // Chart data
    const [revenueExpenseProfitTrend, setRevenueExpenseProfitTrend] = useState<DailyRevenue[]>([]);
    const [revenueChartData, setRevenueChartData] = useState<any>(null);
    const [billingCategoryChartData, setBillingCategoryChartData] = useState<any>(null);
    const [expenditureChartData, setExpenditureChartData] = useState<any>(null);
    const [inventoryChartData, setInventoryChartData] = useState<any>(null);
    const [chartOptions, setChartOptions] = useState<any>(null);

    // Report periods
    const reportPeriods = [
        { name: 'Daily', code: 'daily' },
        { name: 'Weekly', code: 'weekly' },
        { name: 'Monthly', code: 'monthly' },
        { name: 'Quarterly', code: 'quarterly' },
        { name: 'Yearly', code: 'yearly' }
    ];

    useEffect(() => {
        loadReportData();
    }, [dateRange, reportPeriod]);

    const loadReportData = async () => {
        setLoading(true);
        try {
            const hospitalSettings = await SettingService.getHospitalSetting();
            const settings = hospitalSettings.operatedData;
            setGeneralSettings(typeof settings.general === 'string' ? JSON.parse(settings.general) : settings.general);
            const response = await Overview.getPageData(changeDateFormat(dateRange.startDate), changeDateFormat(dateRange.endDate));
            const summary = response.operatedData;
            const expendituresData = typeof summary.expenditureSummary === 'string' ? JSON.parse(summary.expenditureSummary) : summary.expenditureSummary;
            setBillingCategories(summary.billingCategoriesSummary);

            setRevenueExpenseProfitTrend(summary.revenueExpenseProfitTrend);
            setFinancialSummary(typeof summary.financialSummary === 'string' ? JSON.parse(summary.financialSummary) : summary.financialSummary);
            setExpenditures(expendituresData ?? []);
            setTopSellingItems(summary.topSellingItems);

            setLowMovingItems(summary.slowMovingItems);
            setPaymentMethods(summary.paymentMethodDistribution);
            setTime(new Date().toLocaleTimeString());
            const revenueExpenseProfit = summary.revenueExpenseProfitTrend;

            initializeCharts({
                billingCategoriesSummary: summary.billingCategoriesSummary,
                topSellingItems: summary.topSellingItems,
                expendituresData: expendituresData ?? [],
                revenueExpenseProfit
            });

            toast.current?.show({
                severity: 'success',
                summary: 'Data Loaded',
                detail: 'Report data loaded successfully',
                life: 3000
            });
        } catch (error) {
            console.log(error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to load report data',
                life: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    const initializeCharts = (summary: any) => {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        // Revenue vs Expenditure Chart
        setBillingCategoryChartData({
            labels: summary.billingCategoriesSummary.map((c) => c.category),
            datasets: [
                {
                    data: summary.billingCategoriesSummary.map((c) => c.totalAmount),
                    backgroundColor: ['#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']
                }
            ]
        });

        setExpenditureChartData({
            labels: summary.expendituresData.map((e) => e.category),
            datasets: [
                {
                    label: 'Expenditure',
                    data: summary.expendituresData.map((e) => e.amount),
                    backgroundColor: '#EF4444'
                }
            ]
        });
        setInventoryChartData({
            labels: summary.topSellingItems.slice(0, 10).map((i) => i.itemName.substring(0, 15) + '...'),
            datasets: [
                {
                    label: 'Quantity Sold',
                    data: topSellingItems.slice(0, 10).map((i) => i.quantitySold),
                    backgroundColor: 'rgba(34, 197, 94, 0.5)'
                },
                {
                    label: 'Current Stock',
                    data: summary.topSellingItems.slice(0, 10).map((i) => i.currentStock),
                    backgroundColor: 'rgba(59, 130, 246, 0.5)'
                }
            ]
        });
        setRevenueChartData({
            labels: summary.revenueExpenseProfit.map((r, index) => `Week ${index + 1}`),
            datasets: [
                {
                    label: 'Revenue',
                    data: summary.revenueExpenseProfit.map((r) => r.revenue),
                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                    borderColor: '#22C55E',
                    tension: 0.4
                },
                {
                    label: 'Expenditure',
                    data: summary.revenueExpenseProfit.map((r) => r.expenditure),
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    borderColor: '#EF4444',
                    tension: 0.4
                },
                {
                    label: 'Profit',
                    data: summary.revenueExpenseProfit.map((r) => r.profit),
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderColor: '#3B82F6',
                    tension: 0.4
                }
            ]
        });

        setChartOptions({
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder
                    }
                },
                y: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder
                    }
                }
            }
        });
    };

    const exportToExcel = () => {
        // Implementation for Excel export
        toast.current?.show({
            severity: 'info',
            summary: 'Exporting',
            detail: 'Generating Excel report...',
            life: 3000
        });
    };

    const statusBodyTemplate = (rowData: InventoryItem) => {
        const severity = rowData.stockStatus === 'Good' ? 'success' : rowData.stockStatus === 'Low' ? 'warning' : 'danger';
        return <Tag value={rowData.stockStatus} severity={severity} />;
    };

    const revenueBodyTemplate = (rowData: any) => {
        return formatCurrency(rowData.revenue);
    };

    const turnoverTemplate = (rowData: InventoryItem) => {
        const color = rowData.turnoverRate > 3 ? 'green' : rowData.turnoverRate > 1 ? 'orange' : 'red';
        return (
            <div className="flex align-items-center gap-2">
                <span style={{ color }}>{rowData.turnoverRate}x</span>
                <ProgressBar value={Math.min(rowData.turnoverRate * 10, 100)} showValue={false} style={{ height: '6px', width: '100px' }} />
            </div>
        );
    };

    const StatCard = ({ title, value, icon, color, percentage, trend }: any) => (
        <Card className="h-full">
            <div className="flex justify-content-between align-items-start mb-3">
                <div>
                    <p className="text-500 text-sm m-0">{title}</p>
                    <h2 className="m-0 mt-2">{value}</h2>
                </div>
                <div className={`flex align-items-center justify-content-center bg-${color}-100 border-round`} style={{ width: '3rem', height: '3rem' }}>
                    <i className={`pi ${icon} text-${color}-500 text-xl`}></i>
                </div>
            </div>
            {/*{percentage !== undefined && (*/}
            {/*    <div className="flex align-items-center gap-2">*/}
            {/*        <Tag value={`${trend === 'up' ? '+' : ''}${percentage}%`}*/}
            {/*             severity={trend === 'up' ? 'success' : 'danger'} icon={`pi pi-arrow-${trend}`} />*/}
            {/*        <span className="text-500 text-sm">vs last period</span>*/}
            {/*    </div>*/}
            {/*)}*/}
        </Card>
    );
    const onReportPeriodChange = (e: DropdownChangeEvent) => {
        setReportPeriod(e.value.name);
        setSelectedReportPeriod(e.value);
    };
    const PrintReportButton = ({ settings }: { settings: IGeneralSettings }) => {
        console.log(settings);
        return (
            <PagePrinter
                printedTime={time}
                financialSummary={financialSummary}
                billingCategories={billingCategories}
                expenditures={expenditures}
                topSellingItems={topSellingItems}
                lowMovingItems={lowMovingItems}
                paymentMethods={paymentMethods}
                revenueExpenseProfitTrend={revenueExpenseProfitTrend}
                dateRange={dateRange}
                reportPeriod={reportPeriod}
                generalSettings={settings}
            />
        );
    };
    return (
        <div className="grid">
            <Toast ref={toast} />

            {/* Header */}
            <div className="col-12">
                <Card>
                    <div className="flex justify-content-between align-items-center">
                        <div>
                            <h2 className="m-0">Overall Activities Report</h2>
                            <p className="text-500 mt-1">Comprehensive analysis of hospital operations</p>
                        </div>
                        <div className="flex gap-2 align-items-center">
                            <Calendar value={dateRange.startDate} onChange={(e) => setDateRange({ ...dateRange, startDate: e.value as Date })} dateFormat="dd/mm/yy" showIcon placeholder="Start Date" />
                            <span>to</span>
                            <Calendar value={dateRange.endDate} onChange={(e) => setDateRange({ ...dateRange, endDate: e.value as Date })} dateFormat="dd/mm/yy" showIcon placeholder="End Date" />
                            <FilterSelect selectedOption={selectedReportPeriod} selectableOptions={reportPeriods} onSelectChange={onReportPeriodChange} elementId="reportPeriod" defaultValue="Select Period" showLabel={false} />
                            <Button icon="pi pi-refresh" onClick={loadReportData} loading={loading} />
                            {/*<Button icon="pi pi-print" onClick={handlePrint} severity="secondary" />*/}
                            {generalSettings !== null && <PrintReportButton settings={generalSettings} />}
                            <Button icon="pi pi-file-excel" onClick={exportToExcel} severity="success" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Key Metrics */}
            <div className="col-12 md:col-6 lg:col-3">
                <StatCard title="Total Revenue" value={formatCurrency(financialSummary.totalRevenue, generalSettings?.country)} icon="pi-dollar" color="green" percentage={12.5} trend="up" />
            </div>
            <div className="col-12 md:col-6 lg:col-3">
                <StatCard title="Total Expenditure" value={formatCurrency(financialSummary.totalExpenditure, generalSettings?.country)} icon="pi-shopping-cart" color="red" percentage={8.2} trend="up" />
            </div>
            <div className="col-12 md:col-6 lg:col-3">
                <StatCard title="Net Profit" value={formatCurrency(financialSummary.netProfit, generalSettings?.country)} icon="pi-chart-line" color="blue" percentage={15.3} trend="up" />
            </div>
            <div className="col-12 md:col-6 lg:col-3">
                <StatCard title="Profit Margin" value={`${financialSummary.profitMargin}%`} icon="pi-percentage" color="purple" percentage={2.1} trend="up" />
            </div>

            {/* Main Content - Tabs */}
            <div className="col-12">
                <Card>
                    <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                        {/* Financial Overview Tab */}
                        <TabPanel header="Financial Overview" leftIcon="pi pi-dollar">
                            <div className="grid">
                                {/* Revenue Trend Chart */}
                                <div className="col-12 lg:col-8">
                                    <Panel header="Revenue [From Billing] vs Expenditure Trend">
                                        <Chart type="line" data={revenueChartData} options={chartOptions} height="300px" />
                                    </Panel>
                                </div>

                                {/* Financial Summary */}
                                <div className="col-12 lg:col-4">
                                    <Panel header="Financial Summary">
                                        <div className="flex flex-column gap-3">
                                            <div className="flex justify-content-between">
                                                <span className="text-500">Total Billings:</span>
                                                <strong>{formatCurrency(financialSummary.totalBillings, generalSettings?.country)}</strong>
                                            </div>
                                            <div className="flex justify-content-between">
                                                <span className="text-500">Avg Bill Value:</span>
                                                <strong>{formatCurrency(financialSummary.averageBillValue, generalSettings?.country)}</strong>
                                            </div>
                                            <div className="flex justify-content-between">
                                                <span className="text-500">Sale From Buys:</span>
                                                <strong className="text-orange-500">{formatCurrency(financialSummary.totalFromSales, generalSettings?.country)}</strong>
                                            </div>
                                            <div className="flex justify-content-between">
                                                <span className="text-500">Patients Payments:</span>
                                                <strong className="text-orange-500">{formatCurrency(financialSummary.patientsPayments, generalSettings?.country)}</strong>
                                            </div>
                                            <div className="flex justify-content-between">
                                                <span className="text-500">Outstanding:</span>
                                                <strong className="text-orange-500">{formatCurrency(financialSummary.outstandingBalance, generalSettings?.country)}</strong>
                                            </div>
                                            <div className="flex justify-content-between">
                                                <span className="text-500">Collection Rate:</span>
                                                <strong className="text-green-500">{financialSummary.collectionRate}%</strong>
                                            </div>
                                            <Divider />
                                            <h4>Payment Methods</h4>
                                            {paymentMethods.map((method, index) => (
                                                <div key={index} className="mb-2">
                                                    <div className="flex justify-content-between mb-1">
                                                        <span className="text-sm">{method.method}</span>
                                                        <span className="text-sm">{formatCurrency(method.amount)}</span>
                                                    </div>
                                                    <ProgressBar value={method.percentage} showValue={false} style={{ height: '8px' }} />
                                                </div>
                                            ))}
                                        </div>
                                    </Panel>
                                </div>

                                {/* Billing Categories */}
                                <div className="col-12 lg:col-6">
                                    <Panel header="Billing Categories Distribution">
                                        <Chart type="doughnut" data={billingCategoryChartData} options={chartOptions} height="300px" />
                                    </Panel>
                                </div>

                                {/* Billing Categories Table */}
                                <div className="col-12 lg:col-6">
                                    <Panel header="Billing Categories Details">
                                        <DataTable value={billingCategories} className="p-datatable-sm">
                                            <Column field="category" header="Category" />
                                            <Column field="count" header="Count" />
                                            <Column field="totalAmount" header="Total Amount" body={(rowData) => formatCurrency(rowData.totalAmount)} />
                                            <Column field="percentage" header="%" body={(rowData) => <ProgressBar value={rowData.percentage} style={{ height: '20px' }} />} />
                                        </DataTable>
                                    </Panel>
                                </div>
                            </div>
                        </TabPanel>

                        {/* Expenditure Analysis Tab */}
                        <TabPanel header="Expenditure Analysis" leftIcon="pi pi-shopping-cart">
                            <div className="grid">
                                <div className="col-12 lg:col-8">
                                    <Panel header="Expenditure by Category">
                                        <Chart type="bar" data={expenditureChartData} options={chartOptions} height="300px" />
                                    </Panel>
                                </div>

                                <div className="col-12 lg:col-4">
                                    <Panel header="Expenditure Summary">
                                        <DataTable value={expenditures} className="p-datatable-sm">
                                            <Column field="category" header="Category" />
                                            <Column field="amount" header="Amount" body={(rowData) => formatCurrency(rowData.amount)} />
                                            <Column field="count" header="Txns" />
                                            <Column field="percentage" header="%" body={(rowData) => `${rowData.percentage}%`} />
                                        </DataTable>
                                    </Panel>
                                </div>
                            </div>
                        </TabPanel>

                        {/* Inventory Analysis Tab */}
                        <TabPanel header="Inventory Analysis" leftIcon="pi pi-box">
                            <div className="grid">
                                {/* Inventory Turnover Chart */}
                                <div className="col-12">
                                    <Panel header="Inventory Turnover Analysis">
                                        <Chart type="bar" data={inventoryChartData} options={chartOptions} height="250px" />
                                    </Panel>
                                </div>

                                {/* Top Selling Items */}
                                <div className="col-12 lg:col-6">
                                    <Panel header="Top Selling Items">
                                        <DataTable value={topSellingItems} className="p-datatable-sm" scrollable scrollHeight="400px">
                                            <Column field="itemName" header="Item" />
                                            <Column field="category" header="Category" />
                                            <Column field="quantitySold" header="Qty Sold" />
                                            <Column field="revenue" header="Revenue" body={revenueBodyTemplate} />
                                            <Column field="currentStock" header="Stock" />
                                            <Column field="stockStatus" header="Status" body={statusBodyTemplate} />
                                            <Column field="turnoverRate" header="Turnover" body={turnoverTemplate} />
                                        </DataTable>
                                    </Panel>
                                </div>

                                {/* Low Moving Items */}
                                <div className="col-12 lg:col-6">
                                    <Panel header="Low Moving Items (Action Required)">
                                        <DataTable value={lowMovingItems} className="p-datatable-sm" scrollable scrollHeight="400px">
                                            <Column field="itemName" header="Item" />
                                            <Column field="category" header="Category" />
                                            <Column field="quantitySold" header="Qty Sold" />
                                            <Column field="currentStock" header="Stock" />
                                            <Column field="stockStatus" header="Status" body={statusBodyTemplate} />
                                            <Column header="Action" body={() => <Button icon="pi pi-exclamation-triangle" size="small" severity="warning" text />} />
                                        </DataTable>
                                    </Panel>
                                </div>
                            </div>
                        </TabPanel>

                        {/* Summary Report Tab */}
                        <TabPanel header="Summary Report" leftIcon="pi pi-chart-bar">
                            <div className="print-content">
                                <div className="grid">
                                    {/* Report Header (for print) */}
                                    <div className="col-12 hidden-print">
                                        <div className="text-center mb-4">
                                            <h2>{generalSettings?.hospitalName}</h2>
                                            <h3>Overall Activities Report</h3>
                                            <p>
                                                Period: {dateRange.startDate?.toLocaleDateString()} - {dateRange.endDate?.toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Executive Summary */}
                                    <div className="col-12">
                                        <Panel header="Executive Summary">
                                            <div className="grid">
                                                <div className="col-12 md:col-3">
                                                    <div className="text-center">
                                                        <h3 className="text-green-500">{formatCurrency(financialSummary.totalRevenue, generalSettings?.country)}</h3>
                                                        <p className="text-500">Total Revenue</p>
                                                    </div>
                                                </div>
                                                <div className="col-12 md:col-3">
                                                    <div className="text-center">
                                                        <h3 className="text-red-500">{formatCurrency(financialSummary.totalExpenditure, generalSettings?.country)}</h3>
                                                        <p className="text-500">Total Expenditure</p>
                                                    </div>
                                                </div>
                                                <div className="col-12 md:col-3">
                                                    <div className="text-center">
                                                        <h3 className="text-blue-500">{formatCurrency(financialSummary.netProfit, generalSettings?.country)}</h3>
                                                        <p className="text-500">Net Profit</p>
                                                    </div>
                                                </div>
                                                <div className="col-12 md:col-3">
                                                    <div className="text-center">
                                                        <h3 className="text-purple-500">{financialSummary.profitMargin}%</h3>
                                                        <p className="text-500">Profit Margin</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </Panel>
                                    </div>
                                </div>
                            </div>
                        </TabPanel>
                    </TabView>
                </Card>
            </div>
        </div>
    );
};

export default OverallReportsPage;
