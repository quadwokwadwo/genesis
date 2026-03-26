import React from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from 'primereact/button';
import { BillingCategorySummary, DailyRevenue, DateRange, ExpenditureSummary, FinancialSummary, IGeneralSettings, InventoryItem, PaymentMethodSummary } from '@/types/hospital';
import { changeDateFormat, formatCurrency } from '@/libs/utils';

interface PrintableOverallReportProps {
    financialSummary: FinancialSummary;
    billingCategories: BillingCategorySummary[];
    expenditures: ExpenditureSummary[];
    topSellingItems: InventoryItem[];
    lowMovingItems: InventoryItem[];
    paymentMethods: PaymentMethodSummary[];
    revenueExpenseProfitTrend: DailyRevenue[];
    dateRange: DateRange;
    reportPeriod: string;
    generalSettings: IGeneralSettings;
    onPrint?: () => void;
    printedTime: string;
}

// Printable component (to be rendered in print)
const PrintableOverallReportContent = React.forwardRef<HTMLDivElement, Omit<PrintableOverallReportProps, 'onPrint'>>((props, ref) => {
    const { financialSummary, billingCategories, expenditures, topSellingItems, lowMovingItems, paymentMethods, revenueExpenseProfitTrend, dateRange, reportPeriod, generalSettings, printedTime } = props;

    const formatDate = (date: Date | null) => {
        return date ? date.toLocaleDateString() : 'N/A';
    };

    return (
        <div
            ref={ref}
            style={{
                padding: '10px',
                fontFamily: 'Arial, sans-serif',
                fontSize: '12px',
                color: '#000',
                backgroundColor: '#fff',
                minHeight: '100vh'
            }}
        >
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '40px', borderBottom: '3px solid #2c3e50', paddingBottom: '20px' }}>
                <h1 style={{ margin: '0 0 10px 0', fontSize: '28px', color: '#2c3e50', fontWeight: 'bold' }}>{generalSettings?.hospitalName || 'HOSPITAL MANAGEMENT SYSTEM'}</h1>
                <h2 style={{ margin: '0 0 15px 0', fontSize: '20px', color: '#34495e' }}>Overall Activities Report</h2>
                <div style={{ fontSize: '14px', color: '#7f8c8d' }}>
                    <p style={{ margin: '5px 0' }}>
                        <strong>Report Period:</strong> {reportPeriod} | <strong>Date Range:</strong> {formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}
                    </p>
                    <p style={{ margin: '5px 0' }}>
                        Generated on: {printedTime} at {printedTime}
                    </p>
                </div>
            </div>

            {/* Executive Summary */}
            <div style={{ marginBottom: '40px' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>Executive Summary</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', textAlign: 'center' }}>
                    <div style={{ padding: '20px', backgroundColor: '#e8f5e8', borderRadius: '8px', border: '1px solid #27ae60' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#27ae60', marginBottom: '5px' }}>{formatCurrency(financialSummary.totalRevenue, generalSettings.country)}</div>
                        <div style={{ fontSize: '14px', color: '#2c3e50' }}>Total Revenue</div>
                    </div>
                    <div style={{ padding: '20px', backgroundColor: '#ffebee', borderRadius: '8px', border: '1px solid #e74c3c' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e74c3c', marginBottom: '5px' }}>{formatCurrency(financialSummary.totalExpenditure, generalSettings.country)}</div>
                        <div style={{ fontSize: '14px', color: '#2c3e50' }}>Total Expenditure</div>
                    </div>
                    <div style={{ padding: '20px', backgroundColor: '#e3f2fd', borderRadius: '8px', border: '1px solid #3498db' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3498db', marginBottom: '5px' }}>{formatCurrency(financialSummary.netProfit, generalSettings.country)}</div>
                        <div style={{ fontSize: '14px', color: '#2c3e50' }}>Net Profit</div>
                    </div>
                    <div style={{ padding: '20px', backgroundColor: '#f3e5f5', borderRadius: '8px', border: '1px solid #9b59b6' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9b59b6', marginBottom: '5px' }}>{financialSummary.profitMargin}%</div>
                        <div style={{ fontSize: '14px', color: '#2c3e50' }}>Profit Margin</div>
                    </div>
                </div>
            </div>

            {/* Financial Details */}
            <div style={{ marginBottom: '40px' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>Financial Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '30px' }}>
                    <div>
                        <h4 style={{ margin: '0 0 15px 0', color: '#34495e' }}>Billing Information</h4>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                            <tbody>
                                <tr style={{ borderBottom: '1px solid #ddd' }}>
                                    <td style={{ padding: '8px 0', color: '#7f8c8d' }}>Total Billings:</td>
                                    <td style={{ padding: '8px 0', fontWeight: 'bold' }}>{formatCurrency(financialSummary.totalBillings, generalSettings.country)}</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid #ddd' }}>
                                    <td style={{ padding: '8px 0', color: '#7f8c8d' }}>Average Bill Value:</td>
                                    <td style={{ padding: '8px 0', fontWeight: 'bold' }}>{formatCurrency(financialSummary.averageBillValue, generalSettings.country)}</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid #ddd' }}>
                                    <td style={{ padding: '8px 0', color: '#7f8c8d' }}>Sales from Walk-ins:</td>
                                    <td style={{ padding: '8px 0', fontWeight: 'bold', color: '#e67e22' }}>{formatCurrency(financialSummary.totalFromSales, generalSettings.country)}</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid #ddd' }}>
                                    <td style={{ padding: '8px 0', color: '#7f8c8d' }}>Patient Payments:</td>
                                    <td style={{ padding: '8px 0', fontWeight: 'bold', color: '#e67e22' }}>{formatCurrency(financialSummary.patientsPayments, generalSettings.country)}</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid #ddd' }}>
                                    <td style={{ padding: '8px 0', color: '#7f8c8d' }}>Outstanding Balance:</td>
                                    <td style={{ padding: '8px 0', fontWeight: 'bold', color: '#e74c3c' }}>{formatCurrency(financialSummary.outstandingBalance, generalSettings.country)}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '8px 0', color: '#7f8c8d' }}>Collection Rate:</td>
                                    <td style={{ padding: '8px 0', fontWeight: 'bold', color: '#27ae60' }}>{financialSummary.collectionRate}%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div>
                        <h4 style={{ margin: '0 0 15px 0', color: '#34495e' }}>Payment Methods Distribution</h4>
                        {paymentMethods.map((method, index) => (
                            <div key={index} style={{ marginBottom: '15px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <span style={{ fontSize: '12px', color: '#2c3e50' }}>{method.method}</span>
                                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
                                        {formatCurrency(method.amount)} ({method.percentage}%)
                                    </span>
                                </div>
                                <div
                                    style={{
                                        width: '100%',
                                        height: '8px',
                                        backgroundColor: '#ecf0f1',
                                        borderRadius: '4px',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <div
                                        style={{
                                            width: `${method.percentage}%`,
                                            height: '100%',
                                            backgroundColor: '#3498db',
                                            borderRadius: '4px'
                                        }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Billing Categories */}
            <div style={{ marginBottom: '40px' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>Billing Categories Analysis</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#34495e', color: 'white' }}>
                            <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Category</th>
                            <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>Count</th>
                            <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right' }}>Total Amount</th>
                            <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>Percentage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {billingCategories.map((category, index) => (
                            <tr
                                key={index}
                                style={{
                                    backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                                    borderBottom: '1px solid #ddd'
                                }}
                            >
                                <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: '500' }}>{category.category}</td>
                                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{category.count}</td>
                                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(category.totalAmount)}</td>
                                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{category.percentage}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Expenditure Analysis */}
            <div style={{ marginBottom: '40px' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>Expenditure Analysis</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#e74c3c', color: 'white' }}>
                            <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Category</th>
                            <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right' }}>Amount</th>
                            <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>Transactions</th>
                            <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>Percentage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenditures.map((expenditure, index) => (
                            <tr
                                key={index}
                                style={{
                                    backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                                    borderBottom: '1px solid #ddd'
                                }}
                            >
                                <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: '500' }}>{expenditure.category}</td>
                                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(expenditure.amount)}</td>
                                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{expenditure.count}</td>
                                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{expenditure.percentage}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Top Performing Items */}
            <div style={{ marginBottom: '40px' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>Top Performing Items ({topSellingItems.length} items)</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#27ae60', color: 'white' }}>
                            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Item Name</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Category</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>Qty Sold</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>Revenue</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>Stock</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>Status</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>Turnover</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topSellingItems.slice(0, 10).map((item, index) => (
                            <tr
                                key={item.itemId}
                                style={{
                                    backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                                    borderBottom: '1px solid #ddd'
                                }}
                            >
                                <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: '500' }}>{item.itemName.substring(0, 30)}...</td>
                                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.category}</td>
                                <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold' }}>{item.quantitySold}</td>
                                <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(item.revenue)}</td>
                                <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>{item.currentStock}</td>
                                <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                                    <span
                                        style={{
                                            padding: '2px 6px',
                                            borderRadius: '3px',
                                            fontSize: '9px',
                                            fontWeight: 'bold',
                                            backgroundColor: item.stockStatus === 'Good' ? '#e8f5e8' : item.stockStatus === 'Low' ? '#fff3e0' : '#ffebee',
                                            color: item.stockStatus === 'Good' ? '#27ae60' : item.stockStatus === 'Low' ? '#e67e22' : '#e74c3c'
                                        }}
                                    >
                                        {item.stockStatus}
                                    </span>
                                </td>
                                <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>{item.turnoverRate}x</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Revenue Trend Summary */}
            <div style={{ marginBottom: '40px' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>Revenue Trend Summary</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#3498db', color: 'white' }}>
                            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>Period</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>Revenue</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>Expenditure</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>Profit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {revenueExpenseProfitTrend.slice(0, 10).map((trend, index) => (
                            <tr
                                key={index}
                                style={{
                                    backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                                    borderBottom: '1px solid #ddd'
                                }}
                            >
                                <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                                    {/*Period {index + 1}*/}
                                    {`${changeDateFormat(new Date(trend.weekStart))} - ${changeDateFormat(new Date(trend.weekEnd))}`}
                                </td>
                                <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right', color: '#27ae60', fontWeight: 'bold' }}>{formatCurrency(trend.revenue)}</td>
                                <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right', color: '#e74c3c', fontWeight: 'bold' }}>{formatCurrency(trend.expenditure)}</td>
                                <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right', color: '#3498db', fontWeight: 'bold' }}>{formatCurrency(trend.profit)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Low Moving Items Alert */}
            {lowMovingItems.length > 0 && (
                <div style={{ marginBottom: '40px' }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#e74c3c', borderBottom: '2px solid #e74c3c', paddingBottom: '10px' }}>⚠️ Low Moving Items - Requires Attention ({lowMovingItems.length} items)</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#e74c3c', color: 'white' }}>
                                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Item Name</th>
                                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Category</th>
                                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>Current Stock</th>
                                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>Qty Sold</th>
                                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>Stock Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lowMovingItems.slice(0, 10).map((item, index) => (
                                <tr
                                    key={item.itemId}
                                    style={{
                                        backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                                        borderBottom: '1px solid #ddd'
                                    }}
                                >
                                    <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: '500' }}>{item.itemName.substring(0, 30)}...</td>
                                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.category}</td>
                                    <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold' }}>{item.currentStock}</td>
                                    <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>{item.quantitySold}</td>
                                    <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                                        <span
                                            style={{
                                                padding: '2px 6px',
                                                borderRadius: '3px',
                                                fontSize: '9px',
                                                fontWeight: 'bold',
                                                backgroundColor: '#ffebee',
                                                color: '#e74c3c'
                                            }}
                                        >
                                            {item.stockStatus}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Footer */}
            <div
                style={{
                    marginTop: '50px',
                    paddingTop: '20px',
                    borderTop: '2px solid #bdc3c7',
                    textAlign: 'center',
                    fontSize: '10px',
                    color: '#7f8c8d'
                }}
            >
                <p>This report is generated by the Hospital Management System</p>
                <p>
                    For queries contact: {generalSettings?.email || 'admin@hospital.com'} | {generalSettings?.phone || 'N/A'}
                </p>
                <p style={{ marginTop: '10px' }}>
                    <strong>Confidential Document</strong> - This report contains sensitive financial and operational data
                </p>
            </div>
        </div>
    );
});

PrintableOverallReportContent.displayName = 'PrintableOverallReportContent';

// Main component with print functionality
const PrintableOverallReport: React.FC<PrintableOverallReportProps> = (props) => {
    const printRef = React.useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Hospital_Overall_Report_${new Date().toISOString().split('T')[0]}`,
        pageStyle: `
            @page {
                size: A4;
                margin: 15mm;
            }
            @media print {
                body {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                .no-print {
                    display: none !important;
                }
            }
        `,
        onAfterPrint: props.onPrint
    });

    return (
        <div>
            {/* Print Button */}
            <div className="no-print">
                <Button icon="pi pi-print" size="small" onClick={handlePrint} className="p-button-info" />
            </div>

            {/* Printable Content */}
            <div className="hidden">
                <PrintableOverallReportContent ref={printRef} {...props} />
            </div>
        </div>
    );
};

export default PrintableOverallReport;
