import { Card } from 'primereact/card';
import React from 'react';
import { useStockReportContext } from '@/libs/contextProviders/AppContexts';

const SummaryCards = () => {
    const { state, setStateValue } = useStockReportContext();
    return (
        <>
            <div className="grid mb-4">
                <div className="col-12 md:col-3">
                    <Card className="bg-blue-100 border-blue-300">
                        <div className="flex align-items-center">
                            <div className="flex-1">
                                <div className="text-blue-600 font-bold text-xl">{state.summaryData.totalItems}</div>
                                <div className="text-blue-800 font-semibold">Total Items</div>
                            </div>
                            <i className="pi pi-box text-blue-600 text-3xl" />
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-3">
                    <Card className="bg-red-100 border-red-300">
                        <div className="flex align-items-center">
                            <div className="flex-1">
                                <div className="text-red-600 font-bold text-xl">{state.summaryData.outOfStock}</div>
                                <div className="text-red-800 font-semibold">Out of Stock</div>
                            </div>
                            <i className="pi pi-exclamation-triangle text-red-600 text-3xl" />
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-3">
                    <Card className="bg-orange-100 border-orange-300">
                        <div className="flex align-items-center">
                            <div className="flex-1">
                                <div className="text-orange-600 font-bold text-xl">{state.summaryData.lowStock}</div>
                                <div className="text-orange-800 font-semibold">Low Stock</div>
                            </div>
                            <i className="pi pi-exclamation-circle text-orange-600 text-3xl" />
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-3">
                    <Card className="bg-green-100 border-green-300">
                        <div className="flex align-items-center">
                            <div className="flex-1">
                                <div className="text-green-600 font-bold text-xl">{state.summaryData.normalStock}</div>
                                <div className="text-green-800 font-semibold">Normal Stock</div>
                            </div>
                            <i className="pi pi-check-circle text-green-600 text-3xl" />
                        </div>
                    </Card>
                </div>
            </div>
        </>
    );
};
export default SummaryCards;
