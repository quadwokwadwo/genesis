'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import { Badge } from 'primereact/badge';
import { Panel } from 'primereact/panel';
import { Toolbar } from 'primereact/toolbar';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import { IModifiableItems, ISaleUpdateMeta, TInventorySale, TSalesItem, TSalesPageState } from '@/types/hospital/hospital';
import InventoryItems from '@/libs/blue_prints/InventoryItems';
import PatientsModel from '@/libs/blue_prints/Patients';
import { changeDateFormat, defaultSelected, displayMessage, getDecreasedOrIncreaseQuantity, getPaymentOptions, getRemovedOrAddedItems } from '@/libs/utils';
import InventorySalesService from '@/libs/blue_prints/InventorySalesService';
import { InventorySalesContext } from '@/libs/contextProviders/AppContexts';
import PatientSearch from '@/app/(main)/hospital/inventory/sales/components/PatientSearch';
import ItemSelection from '@/app/(main)/hospital/inventory/sales/components/ItemSelection';
import CartItems from '@/app/(main)/hospital/inventory/sales/components/CartItems';
import SideSummary from '@/app/(main)/hospital/inventory/sales/components/SideSummary';
import SalesList from '@/app/(main)/hospital/inventory/sales/components/SalesList';
import ThermalReceipt from '@/app/(main)/hospital/inventory/sales/components/ThermalReceipt';
import useUserData from '@/libs/hooks/useUserData';
import { CRUDTYPE } from '@/types/enums/enums';

const INITIAL_SALE_STATE: TInventorySale = {
    patientId: 0,
    totalAmount: 0,
    paymentMethod: 'Cash',
    createdBy: '',
    remarks: '',
    items: [],
    amountTendered: 0,
    changeAmount: 0
};

const INITIAL_STATE: TSalesPageState = {
    saleData: INITIAL_SALE_STATE,
    inventoryItems: [],
    filteredItems: [],
    selectedItem: null,
    searchPatient: '',
    patients: [],
    filteredPatients: [],
    selectedPatient: null,
    isLoading: true,
    editingItemIndex: null,
    showReceiptDialog: false,
    lastCompletedSale: null,
    itemQuantity: 1,
    itemDiscount: 0,
    salesList: [],
    showSalesDialog: false,
    paymentMethods: getPaymentOptions(),
    selectedPaymentMethod: defaultSelected(),
    soldToday: 0,
    crudType: CRUDTYPE.save
};

const saleService = new InventorySalesService();
const InventorySales = () => {
    const [state, setState] = useState<TSalesPageState>(INITIAL_STATE);
    const toast = useRef<Toast>(null);
    const { user } = useUserData();
    const inventoryService = new InventoryItems();
    const patientService = new PatientsModel();

    useEffect(() => {
        loadInventoryItems();
        loadPatients();
    }, []);

    useEffect(() => {
        calculateTotal();
    }, [state.saleData.items]);
    useEffect(() => {
        setStateValues({ soldToday: calculateSalesToday() });
    }, [state.salesList]);
    useEffect(() => {
        // Calculate change when amount tendered changes
        const change = Math.max(0, state.saleData.amountTendered - state.saleData.totalAmount);
        setStateValues({ saleData: { ...state.saleData, changeAmount: change } });
    }, [state.saleData.amountTendered, state.saleData.totalAmount]);
    useEffect(() => {
        if (state.showSalesDialog) {
            loadSales().catch(console.error);
        }
    }, [state.showSalesDialog]);

    const setStateValues = (stateValue: Partial<TSalesPageState>) => {
        setState((prevState) => ({ ...prevState, ...stateValue }));
    };

    const loadInventoryItems = async () => {
        try {
            setStateValues({ isLoading: true });
            const response = await inventoryService.getItems();
            if (response.status === 200) {
                setStateValues({ inventoryItems: response.operatedData });
            }
        } catch (error) {
            displayMessage({
                header: 'Error',
                message: 'Failed to load inventory items',
                life: 3000,
                toastComponent: toast,
                infoType: 'error'
            });
        } finally {
            setStateValues({ isLoading: false });
        }
    };

    const loadPatients = async () => {
        try {
            const response = await patientService.getPatientsList({ pageSize: 200 });
            setStateValues({ patients: response.rows });
        } catch (error) {
            console.log(error);
        }
    };

    const calculateSalesToday = () => {
        return state.salesList
            .filter((sale) => changeDateFormat(new Date(sale.saleDate)) === changeDateFormat(new Date()))
            .reduce((previousValue, currentValue, currentIndex, array) => {
                return previousValue + parseFloat(currentValue.totalAmount.toString());
            }, 0);
    };

    const calculateTotal = () => {
        const total = state.saleData.items.reduce((sum, item) => sum + item.finalPrice, 0);
        setStateValues({ saleData: { ...state.saleData, totalAmount: total } });
    };

    const resetItemForm = () => {
        setStateValues({ selectedItem: null, itemQuantity: 1, itemDiscount: 0, editingItemIndex: null });
    };

    const completeSale = async () => {
        let updatesMeta = { increasedItems: [], decreasedItems: [], deletedItems: [], addedItems: [] };
        if (state.crudType === CRUDTYPE.update) {
            updatesMeta = getSaleEditMeta(state.saleData.saleId);
        }

        if (!state.selectedPatient) {
            displayMessage({
                header: 'Warning',
                message: 'Please select a patient',
                life: 3000,
                toastComponent: toast,
                infoType: 'warn'
            });
            return;
        }

        if (state.saleData.items.length === 0) {
            displayMessage({
                header: 'Warning',
                message: 'Please add at least one item to the sale',
                life: 3000,
                toastComponent: toast,
                infoType: 'warn'
            });
            return;
        }

        if (state.saleData.amountTendered < state.saleData.totalAmount) {
            displayMessage({
                header: 'Warning',
                message: 'Amount tendered is less than total amount',
                life: 3000,
                toastComponent: toast,
                infoType: 'warn'
            });
            return;
        }

        confirmDialog({
            message: `Complete sale of $${state.saleData.totalAmount.toFixed(2)} for ${state.selectedPatient.firstName} ${state.selectedPatient.lastName}?`,
            header: 'Confirm Sale',
            icon: 'pi pi-check-circle',
            accept: async () => {
                try {
                    setStateValues({ isLoading: true });

                    // Prepare sale data for API
                    const saleForAPI: TInventorySale = {
                        saleId: state.saleData.saleId,
                        patientId: state.selectedPatient.patientId,
                        totalAmount: state.saleData.totalAmount,
                        paymentMethod: state.saleData.paymentMethod,
                        createdBy: user.userId,
                        amountTendered: state.saleData.amountTendered,
                        changeAmount: state.saleData.changeAmount,
                        remarks: state.saleData.remarks,
                        items: state.saleData.items.map((item) => ({
                            itemId: item.itemId,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            totalPrice: item.totalPrice,
                            discount: item.discount,
                            finalPrice: item.finalPrice
                        })),
                        updates: updatesMeta,
                        crudType: state.crudType
                    };

                    // Here you would call your API
                    const response = await saleService.createSale(saleForAPI);

                    // Mock successful response
                    const saleId = `INV-${Date.now()}-${response.operatedData.saleId}`;

                    // // Store completed sale for receipt
                    setStateValues({
                        lastCompletedSale: {
                            saleData: {
                                ...response.operatedData,
                                items: typeof response.operatedData.items === 'string' ? JSON.parse(response.operatedData.items) : response.operatedData.items
                            },
                            patient: state.selectedPatient,
                            saleId: saleId,
                            date: new Date()
                        }
                    });

                    displayMessage({
                        header: 'Success',
                        message: 'Sale completed successfully',
                        life: 3000,
                        toastComponent: toast,
                        infoType: 'success'
                    });

                    // Show receipt dialog
                    setStateValues({ showReceiptDialog: true });

                    resetSale();
                } catch (error) {
                    displayMessage({
                        header: 'Error',
                        message: 'Failed to complete sale',
                        life: 3000,
                        toastComponent: toast,
                        infoType: 'error'
                    });
                } finally {
                    setStateValues({ isLoading: false });
                }
            }
        });
    };
    const getSaleEditMeta = (saleId: number): ISaleUpdateMeta => {
        const saleInList = state.salesList.find((sale) => sale.saleId === saleId).items;
        const saleInStateItems = state.saleData.items;
        const oldItems = typeof saleInList === 'string' ? JSON.parse(saleInList) : saleInList;

        const increasedItems = getDecreasedOrIncreaseQuantity(saleInStateItems, oldItems);
        const decreasedItems = getDecreasedOrIncreaseQuantity(oldItems, saleInStateItems);
        const deletedItems = getRemovedOrAddedItems(oldItems, saleInStateItems);
        const addedItems = getRemovedOrAddedItems(saleInStateItems, oldItems);
        return { increasedItems, decreasedItems, deletedItems, addedItems };
    };
    const resetSale = () => {
        setStateValues({ saleData: INITIAL_SALE_STATE, selectedPatient: null, searchPatient: '', crudType: CRUDTYPE.save });
        resetItemForm();
    };

    const toolbarStart = (
        <div className="flex align-items-center gap-3">
            <Badge value={`${state.saleData.items.length} items`} severity="info" size="large" className="w-fit" />
            <span className="text-600 w-fit">•</span>
            <span className="font-bold text-xl text-primary w-fit">Total: ${state.saleData.totalAmount.toFixed(2)}</span>
            <Button label="View Sales" icon="pi pi-list" className="p-button-outlined p-button-info w-fit" onClick={() => setStateValues({ showSalesDialog: true })} />
            <span className="text-600 w-fit">•</span>
            <span className="font-bold text-xl text-primary w-fit">Sales Today: ${state?.soldToday.toFixed(2)}</span>
        </div>
    );

    const toolbarEnd = (
        <div className="flex align-items-center gap-3">
            <Button label="Reset Sale" icon="pi pi-refresh" className="p-button-outlined p-button-primary w-fit" onClick={resetSale} disabled={state.isLoading} />
            <Button
                label={state.crudType === CRUDTYPE.save ? 'Complete Sale' : 'Update Sale'}
                icon="pi pi-check-circle"
                className="p-button-success w-fit"
                onClick={completeSale}
                disabled={state.saleData.items.length === 0 || !state.selectedPatient || state.isLoading}
                loading={state.isLoading}
            />
        </div>
    );
    const loadSales = async () => {
        try {
            setStateValues({ isLoading: true });
            const response = await saleService.getSales();
            if (response.status === 200) {
                setStateValues({ salesList: response.operatedData });
            }
        } catch (error) {
            displayMessage({
                header: 'Error',
                message: 'Failed to load sales',
                life: 3000,
                toastComponent: toast,
                infoType: 'error'
            });
        } finally {
            setStateValues({ isLoading: false });
        }
    };

    const handleDeleteSale = (saleId: number) => {
        confirmDialog({
            message: 'Are you sure you want to delete this sale? This action cannot be undone.',
            header: 'Confirm Delete Sale',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            accept: async () => {
                displayMessage({
                    header: 'Restricted',
                    message: 'Deleting sales is currently restricted. Contact an admin for the right intervention!',
                    life: 3000,
                    toastComponent: toast,
                    infoType: 'info'
                });
                return;
                try {
                    setStateValues({ isLoading: true });
                    const response = await saleService.deleteSale(saleId);
                    if (response.status === 200) {
                        setStateValues({ salesList: state.salesList.filter((sale) => sale.saleId !== saleId) });
                        displayMessage({
                            header: 'Success',
                            message: 'Sale deleted successfully',
                            life: 5000,
                            toastComponent: toast,
                            infoType: 'success'
                        });
                    }
                } catch (error) {
                    displayMessage({
                        header: 'Error',
                        message: 'Failed to delete sale',
                        life: 3000,
                        toastComponent: toast,
                        infoType: 'error'
                    });
                } finally {
                    setStateValues({ isLoading: false });
                }
            }
        });
    };

    return (
        <div className="grid p-fluid">
            <Toast ref={toast} position="top-right" />
            <ConfirmDialog />

            <div className="col-12">
                <Toolbar start={toolbarStart} end={toolbarEnd} className="mb-4" />
            </div>

            <InventorySalesContext.Provider
                value={{
                    state,
                    setStateValue: setStateValues,
                    completeSale,
                    toast,
                    resetItemForm,
                    deleteSale: handleDeleteSale,
                    loadSales,
                    user
                }}
                key={'ISC'}
            >
                <div className="col-12 lg:col-8">
                    <div className="grid">
                        {/* Patient & Payment Information - Priority Section */}
                        <div className="col-12">
                            <Panel header="Customer & Payment Information" className="mb-4">
                                <PatientSearch />
                            </Panel>
                        </div>

                        {/* Item Selection */}
                        <div className="col-12">
                            <Panel header="Add Items" className="mb-4">
                                <ItemSelection />
                            </Panel>
                        </div>

                        {/* Cart Items */}
                        <div className="col-12">
                            <Panel header={`Cart Items (${state.saleData.items.length})`}>
                                <CartItems />
                            </Panel>
                        </div>

                        {/* Additional Information */}
                        <div className="col-12">
                            <Panel header="Additional Information">
                                <div className="field">
                                    <label htmlFor="remarks" className="block mb-2 font-semibold">
                                        Remarks/Notes
                                    </label>
                                    <InputTextarea
                                        id="remarks"
                                        value={state.saleData.remarks}
                                        onChange={(e) =>
                                            setStateValues({
                                                saleData: {
                                                    ...state.saleData,
                                                    remarks: e.target.value
                                                }
                                            })
                                        }
                                        placeholder="Additional notes about the sale"
                                        rows={3}
                                        className="w-full"
                                    />
                                </div>
                            </Panel>
                        </div>
                    </div>
                </div>
                <SideSummary />
                <SalesList />
                <ThermalReceipt />
            </InventorySalesContext.Provider>
        </div>
    );
};

export default InventorySales;
