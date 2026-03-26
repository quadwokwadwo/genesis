import { Card } from 'primereact/card';
import { Timeline } from 'primereact/timeline';
import { Tag } from 'primereact/tag';
import React from 'react';
import { useStockReportContext } from '@/libs/contextProviders/AppContexts';

const ItemHistory = () => {
    const { setStateValue, state } = useStockReportContext();
    return (
        <div className="grid">
            <div className="col-12">
                <Card className="mb-4">
                    <div className="grid">
                        <div className="col-12 md:col-3">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-primary">{state.selectedItem?.quantityInStock}</div>
                                <div className="text-600">Current Stock</div>
                            </div>
                        </div>
                        <div className="col-12 md:col-3">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">{state.selectedItem?.totalSold || 0}</div>
                                <div className="text-600">Total Sold</div>
                            </div>
                        </div>
                        <div className="col-12 md:col-3">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">{state.selectedItem?.totalAdjustments || 0}</div>
                                <div className="text-600">Total Adjustments</div>
                            </div>
                        </div>
                        <div className="col-12 md:col-3">
                            <div className="text-center">
                                <div className="text-2xl font-bold">{state.selectedItem?.reorderLevel}</div>
                                <div className="text-600">Reorder Level</div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="col-12">
                <Card>
                    <h6>Stock Movement History</h6>
                    {state.itemHistory.history.length > 0 ? (
                        <Timeline
                            value={state.itemHistory.history}
                            align="alternate"
                            className="customized-timeline"
                            marker={(item) => (
                                <span
                                    className={`flex w-2rem h-2rem align-items-center justify-content-center text-white border-circle z-1 shadow-1`}
                                    style={{
                                        backgroundColor: item.type === 'Sale' ? '#e74c3c' : '#3498db'
                                    }}
                                >
                                    <i className={item.type === 'Sale' ? 'pi pi-shopping-cart' : 'pi pi-cog'} />
                                </span>
                            )}
                            content={(item) => (
                                <Card className="shadow-1">
                                    <div className="flex justify-content-between align-items-start mb-2">
                                        <div>
                                            <div className="font-bold text-primary">{item.reference}</div>
                                            <div className="text-600 text-sm">{new Date(item.date).toLocaleString()}</div>
                                        </div>
                                        <Tag value={item.type} severity={item.type === 'Sale' ? 'danger' : 'info'} />
                                    </div>
                                    <div className="mb-2">
                                        <span className={`font-bold ${item.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {item.quantity > 0 ? '+' : ''}
                                            {item.quantity}
                                        </span>
                                        <span className="text-600 ml-2">units</span>
                                    </div>
                                    {item.previousStock !== null && item.newStock !== null && (
                                        <div className="text-sm text-600 mb-2">
                                            Stock: {item.previousStock} → {item.newStock}
                                        </div>
                                    )}
                                    {item.performedBy && <div className="text-sm text-600 mb-2">By: {item.performedBy}</div>}
                                    {item.remarks && <div className="text-sm text-700 italic">{item.remarks}</div>}
                                </Card>
                            )}
                        />
                    ) : (
                        <div className="text-center p-5">
                            <i className="pi pi-info-circle text-4xl text-400 mb-3" />
                            <div className="text-900 font-bold mb-2">No History Available</div>
                            <div className="text-600">No stock movements recorded for this item.</div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};
export default ItemHistory;
