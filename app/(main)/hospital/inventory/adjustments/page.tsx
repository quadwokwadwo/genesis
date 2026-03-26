'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Toolbar } from 'primereact/toolbar';
import { TabView, TabPanel } from 'primereact/tabview';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { GeneralPageProps } from '@/libs/utilityComponents';
import InventoryItems from '@/libs/blue_prints/InventoryItems';
import { TAdjustmentPageState } from '@/types/hospital';
import InventoryAdjustments from '@/libs/blue_prints/InventoryAdjustments';
import NewAdjustment from '@/app/(main)/hospital/inventory/adjustments/components/NewAdjustment';
import AdjustmentsList from '@/app/(main)/hospital/inventory/adjustments/components/AdjustmentsList';
import LowStock from '@/app/(main)/hospital/inventory/adjustments/components/LowStock';
import HistoryDetails from '@/app/(main)/hospital/inventory/adjustments/components/HistoryDetails';
import { AdjustmentsContext } from '@/libs/contextProviders/AppContexts';

const INITIAL_STATE: TAdjustmentPageState = {
    inventoryItems: [],
    adjustmentHistory: [],
    loading: false,
    showAdjustmentDialog: false,
    showHistoryDialog: false,
    adjustment: {
        adjustmentType: 'IN',
        reason: '',
        performedBy: '',
        adjustmentItems: []
    },
    selectedHistoryDetails: [],
    selectedItem: null,
    filteredItems: [],
    singleAdjustment: { quantity: 0, remarks: '' }
};
const inventory = new InventoryItems();
const inventoryAdjustmentObject = new InventoryAdjustments();
const StockAdjustments: React.FC = () => {
    const [state, setState] = useState<TAdjustmentPageState>(INITIAL_STATE);
    const toast = useRef(null);

    // Tab state
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        Promise.all([fetchInventoryItems(), fetchAdjustmentHistory()]).finally(() => setStateValue({ loading: false }));
    }, []);
    const setStateValue = (stateValues: Partial<TAdjustmentPageState>) => {
        setState((prev) => ({ ...prev, ...stateValues }));
    };
    const fetchInventoryItems = async () => {
        try {
            const response = await inventory.getItems();
            setStateValue({ inventoryItems: response.operatedData || [] });
        } catch (error) {
            console.error('Error fetching inventory items:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to load inventory items'
            });
        }
    };

    const fetchAdjustmentHistory = async () => {
        try {
            const response = await inventoryAdjustmentObject.getAdjustmentsList();
            setStateValue({ adjustmentHistory: response.operatedData || [] });
        } catch (error) {
            console.error('Error fetching adjustment history:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to load adjustment history'
            });
        }
    };

    const submitAdjustment = async () => {
        if (!state.adjustment.reason.trim()) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Warning',
                detail: 'Please enter a reason for the adjustment'
            });
            return;
        }

        if (!state.adjustment.performedBy.trim()) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Warning',
                detail: 'Please enter who performed the adjustment'
            });
            return;
        }

        if (state.adjustment.adjustmentItems.length === 0) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Warning',
                detail: 'Please add at least one item to adjust'
            });
            return;
        }

        setStateValue({ loading: true });
        try {
            const response = await inventoryAdjustmentObject.addNewAdjustment(state.adjustment);

            if (response.status === 200 && response.operatedData !== undefined) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Stock adjustment completed successfully'
                });

                setStateValue({ showAdjustmentDialog: false });
                await Promise.all([fetchInventoryItems(), fetchAdjustmentHistory()]);
            }
        } catch (error) {
            console.error('Error submitting adjustment:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to process stock adjustment'
            });
        } finally {
            setStateValue({ loading: false });
        }
    };

    // Templates

    const openAdjustmentDialog = () => {
        setStateValue({ singleAdjustment: { quantity: 0, remarks: '' } });

        setStateValue({ showAdjustmentDialog: true, adjustment: { ...state.adjustment, adjustmentType: 'IN', reason: '', performedBy: '', adjustmentItems: [] }, selectedItem: null });
    };
    const leftToolbarTemplate = () => (
        <div className="flex flex-wrap gap-2">
            {!state.showAdjustmentDialog && <Button label="New Adjustment" icon="pi pi-plus" severity="success" onClick={openAdjustmentDialog} />}
            {state.showAdjustmentDialog && <Button label="Adjustments List" icon="pi pi-list" severity="warning" onClick={() => setStateValue({ showAdjustmentDialog: false })} />}
        </div>
    );

    const adjustmentDialogFooter = (
        <div className="flex gap-3 mt-2">
            <Button label="Cancel" icon="pi pi-times" outlined onClick={() => setStateValue({ showAdjustmentDialog: false })} />
            <Button label="Submit Adjustment" icon="pi pi-check" loading={state.loading} onClick={submitAdjustment} disabled={state.adjustment.adjustmentItems.length === 0} />
        </div>
    );

    return (
        <div className="grid">
            <AdjustmentsContext.Provider value={{ state, setStateValue, toast }}>
                <div className="col-12">
                    <Card title="Stock Adjustments" className="mb-4">
                        <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                            <TabPanel header="Adjustment History" leftIcon="pi pi-history">
                                <Toolbar className="mb-4" left={leftToolbarTemplate} />
                                {!state.showAdjustmentDialog ? (
                                    <AdjustmentsList />
                                ) : (
                                    <>
                                        <NewAdjustment />
                                        {adjustmentDialogFooter}
                                    </>
                                )}
                            </TabPanel>

                            <TabPanel header="Low Stock Items" leftIcon="pi pi-exclamation-triangle">
                                <LowStock />
                            </TabPanel>
                        </TabView>
                    </Card>
                </div>

                {/* History Details Dialog */}
                <HistoryDetails />
            </AdjustmentsContext.Provider>
            <GeneralPageProps toastRef={toast} />
            <ConfirmDialog />
        </div>
    );
};

export default StockAdjustments;
