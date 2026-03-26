import React, { useEffect, useRef, useState } from 'react';
import { TBrand, TCategory, TStockReportItem, TStockReportState } from '@/types/hospital';
import { DataTableFilterMeta } from 'primereact/datatable';
import { FilterMatchMode } from 'primereact/api';
import { Toast } from 'primereact/toast';
import StockReportService from '@/libs/blue_prints/StockReportService';
import InventoryItems from '@/libs/blue_prints/InventoryItems';
import { useReactToPrint } from 'react-to-print';
import { displayMessage, formatCurrency } from '@/libs/utils';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';

const PrintableStockReport = React.forwardRef<
    HTMLDivElement,
    {
        items: TStockReportItem[];
        criteria: any;
        summary: any;
    }
>((props, ref) => {
    const { items, criteria, summary } = props;

    return (
        <div
            ref={ref}
            style={{
                padding: '20px',
                fontFamily: 'Arial, sans-serif',
                fontSize: '12px',
                color: '#000'
            }}
        >
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #333', paddingBottom: '20px' }}>
                <h1 style={{ margin: '0 0 10px 0', fontSize: '24px', color: '#2c3e50' }}>HOSPITAL PHARMACY</h1>
                <h2 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#34495e' }}>Stock Inventory Report</h2>
                <p style={{ margin: '5px 0', fontSize: '12px', color: '#7f8c8d' }}>{/*Generated on: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}*/}</p>
            </div>

            {/* Report Criteria */}
            <div style={{ marginBottom: '30px', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '5px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#2c3e50' }}>Report Filters Applied:</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    {criteria.category !== 'all' && (
                        <div>
                            <strong>Category:</strong> {criteria.category}
                        </div>
                    )}
                    {criteria.brand !== 'all' && (
                        <div>
                            <strong>Brand:</strong> {criteria.brand}
                        </div>
                    )}
                    {criteria.stockStatus !== 'all' && (
                        <div>
                            <strong>Stock Status:</strong> {criteria.stockStatus.replace('-', ' ')}
                        </div>
                    )}
                    {criteria.dateFrom && criteria.dateTo && (
                        <div>
                            <strong>Date Range:</strong> {criteria.dateFrom} to {criteria.dateTo}
                        </div>
                    )}
                </div>
            </div>

            {/* Summary Section */}
            <div style={{ marginBottom: '30px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#2c3e50' }}>Inventory Summary</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', textAlign: 'center' }}>
                    <div style={{ padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '5px' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1976d2' }}>{summary.totalItems}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Total Items</div>
                    </div>
                    <div style={{ padding: '10px', backgroundColor: '#ffebee', borderRadius: '5px' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#d32f2f' }}>{summary.outOfStock}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Out of Stock</div>
                    </div>
                    <div style={{ padding: '10px', backgroundColor: '#fff3e0', borderRadius: '5px' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f57c00' }}>{summary.lowStock}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Low Stock</div>
                    </div>
                    <div style={{ padding: '10px', backgroundColor: '#e8f5e8', borderRadius: '5px' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#388e3c' }}>{summary.normalStock}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Normal Stock</div>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#2c3e50' }}>Detailed Stock Information ({items.length} items)</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#34495e', color: 'white' }}>
                            <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Item Name</th>
                            <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Category</th>
                            <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Brand</th>
                            <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>Current Stock</th>
                            <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>Reorder Level</th>
                            <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>Status</th>
                            <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>Unit Price</th>
                            <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>Total Sold</th>
                            <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>Days Since Sale</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr
                                key={item.itemId}
                                style={{
                                    backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                                    borderBottom: '1px solid #ddd'
                                }}
                            >
                                <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: '500' }}>{item.itemName}</td>
                                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.categoryName}</td>
                                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.brandName}</td>
                                <td
                                    style={{
                                        padding: '8px',
                                        border: '1px solid #ddd',
                                        textAlign: 'center',
                                        color: item.stockStatus === 'Out of Stock' ? '#d32f2f' : item.stockStatus === 'Low' ? '#f57c00' : '#388e3c',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {item.quantityInStock}
                                </td>
                                <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>{item.reorderLevel}</td>
                                <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                                    <span
                                        style={{
                                            padding: '3px 8px',
                                            borderRadius: '3px',
                                            fontSize: '9px',
                                            fontWeight: 'bold',
                                            backgroundColor: item.stockStatus === 'Out of Stock' ? '#ffebee' : item.stockStatus === 'Low' ? '#fff3e0' : item.stockStatus === 'Normal' ? '#e8f5e8' : '#e3f2fd',
                                            color: item.stockStatus === 'Out of Stock' ? '#d32f2f' : item.stockStatus === 'Low' ? '#f57c00' : item.stockStatus === 'Normal' ? '#388e3c' : '#1976d2'
                                        }}
                                    >
                                        {item.stockStatus}
                                    </span>
                                </td>
                                <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>{formatCurrency(item.unitPrice)}</td>
                                <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>{item.totalSold || 0}</td>
                                <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>{item.daysSinceLastSale || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div
                style={{
                    marginTop: '40px',
                    paddingTop: '20px',
                    borderTop: '2px solid #333',
                    textAlign: 'center',
                    fontSize: '10px',
                    color: '#666'
                }}
            >
                <p>This report contains confidential information. Please handle accordingly.</p>
                <p>For any discrepancies, please contact the Inventory Management Department.</p>
                <p style={{ marginTop: '20px' }}>Generated by Hospital Inventory Management System - Page 1 of 1</p>
            </div>
        </div>
    );
});
PrintableStockReport.displayName = 'PrintableStockReport';
export default PrintableStockReport;
