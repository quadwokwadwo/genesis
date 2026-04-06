import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { RadioButton } from 'primereact/radiobutton';
import { FilterSelect } from '@/libs/components/UtilComponents';
import { Divider } from 'primereact/divider';
import { defaultSelected, formatCurrency } from '@/libs/utils';
import { InputNumber } from 'primereact/inputnumber';
import React from 'react';
import { useBillingContext } from '@/libs/contextProviders/AppContexts';
import { BillingItem } from '@/types/hospital';
import BillService from '@/libs/blue_prints/BillService';
import { undefined } from 'zod';
import { confirmDialog } from 'primereact/confirmdialog';
import { useReactToPrint } from 'react-to-print';

const PatientBill = () => {
    const { state, setStateValue, toast, componentRef, calculateBillingSummary } = useBillingContext();

    // Print handlers using react-to-print
    const handlePrintA4 = useReactToPrint({
        contentRef: componentRef,
        ignoreGlobalStyles: true,
        documentTitle: `Bill_${state.selectedPatient?.recordNumber}_${new Date().toISOString()}`,
        pageStyle: `
      @page {
        size: A4;
        margin: 20mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
        }
      }
    `
    });

    const handlePrintThermal = useReactToPrint({
        contentRef: componentRef,
        ignoreGlobalStyles: true,
        documentTitle: `Receipt_${state.selectedPatient?.recordNumber}_${new Date().toISOString()}`,
        pageStyle: `
      @page {
        size: 80mm 297mm;
        margin: 0;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
        }
      }
    `
    });
    const resetBill = () => {
        setStateValue({
            selectedPatient: null,
            selectedVisit: null,
            selectedInvestigations: [],
            selectedExternalPrescriptions: [],
            determinedFees: null,
            internalInvestigations: [],
            externalInvestigations: [],
            partnerInternalInvestigations: [],
            partnerExternalInvestigations: [],
            partnerSelectedInvestigations: [],
            billingItems: [],
            billingSummary: {
                subtotal: 0,
                tax: 0,
                discount: 0,
                total: 0,
                amountPaid: 0,
                balance: 0,
                paymentMethod: 'Cash',
                selectedPaymentMethod: defaultSelected()
            },
            availableDrugs: [],
            externalPrescriptions: []
        });
    };
    const priceTemplate = (rowData: BillingItem) => {
        return formatCurrency(rowData.unitPrice, state.generalSettings.country);
    };

    const totalTemplate = (rowData: BillingItem) => {
        return formatCurrency(rowData.total, state.generalSettings.country);
    };
    const payBill = async () => {
        setStateValue({ isLoading: true });
        const bill = {
            ...state.billingSummary,
            patientId: state.selectedTodayPatient.patientId,
            visitId: state.selectedTodayPatient.visitId,
            billingItems: state.billingItems,
            modifier: state.user.userId,
            // Only include drugs that were selected by the billing clerk AND have a valid inventory ID.
            // medicationId === 0 means a prescription row was saved without a drug being picked from
            // inventory; sending it to newVisitBill would violate the inventory FK constraint.
            dispensaryItems: state.availableDrugs
                .filter((drug) => drug.selected && drug.medicationId > 0)
                .map((drug) => ({ itemId: drug.medicationId, quantity: drug.quantity, unitPrice: drug.price, totalPrice: drug.totalPrice, discount: 0, finalPrice: drug.totalPrice }))
        };
        try {
            const response = await BillService.createBill(bill);

            if (response.status === 200 && response.operatedData !== undefined) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Payment Processed',
                    detail: 'Payment has been recorded successfully',
                    life: 3000
                });

                // Trigger print based on format
                if (state.printFormat === 'a4') {
                    handlePrintA4();
                } else {
                    handlePrintThermal();
                }
                resetBill();
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Payment Failed',
                detail: 'Failed to process payment',
                life: 3000
            });
        } finally {
            setStateValue({ isLoading: false });
        }
    };
    const processPayment = () => {
        confirmDialog({
            message: 'Process payment and generate receipt?',
            header: 'Confirm Payment',
            icon: 'pi pi-dollar',
            accept: payBill
        });
    };

    const billingItemsActionTemplate = (rowData: BillingItem) => {
        if (!rowData.removable) return null;

        return <Button icon="pi pi-trash" size="small" rounded text severity="danger" onClick={() => removeCustomCharge(rowData.id)} />;
    };
    const removeCustomCharge = (itemId: string) => {
        confirmDialog({
            message: 'Are you sure you want to remove this charge?',
            header: 'Confirm Removal',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const updatedItems = state.billingItems.filter((item) => item.id !== itemId);
                setStateValue({ billingItems: updatedItems });
                calculateBillingSummary(updatedItems);

                toast.current?.show({
                    severity: 'info',
                    summary: 'Removed',
                    detail: 'Charge removed successfully',
                    life: 3000
                });
            }
        });
    };

    return (
        <>
            <div className="grid">
                <div className="col-12 lg:col-8">
                    <Card title="Billing Items">
                        <div className="mb-3 flex justify-content-between">
                            <div>
                                <span className="text-lg font-semibold">
                                    {state.selectedPatient.firstName} {state.selectedPatient.lastName} - {state.selectedPatient.recordNumber}
                                </span>
                            </div>
                            <Button label="Add Custom Charge" icon="pi pi-plus" size="small" onClick={() => setStateValue({ showCustomChargeDialog: true })} />
                        </div>
                        <DataTable value={state.billingItems} className="p-datatable-sm">
                            <Column field="description" header="Description" />
                            <Column field="category" header="Category" />
                            <Column field="quantity" header="Qty" style={{ width: '80px' }} />
                            <Column field="unitPrice" header="Unit Price" body={priceTemplate} style={{ width: '120px' }} />
                            <Column field="total" header="Total" body={totalTemplate} style={{ width: '120px' }} />
                            <Column header="Action" body={billingItemsActionTemplate} style={{ width: '80px' }} />
                        </DataTable>
                    </Card>
                </div>

                <div className="col-12 lg:col-4">
                    <Card title="Billing Summary">
                        <div className="field">
                            <label>Print Format</label>
                            <div className="flex gap-3 mb-3">
                                <div className="flex align-items-center">
                                    <RadioButton inputId="a4" value="a4" checked={state.printFormat === 'a4'} onChange={(e) => setStateValue({ printFormat: e.value })} />
                                    <label htmlFor="a4" className="ml-2">
                                        A4
                                    </label>
                                </div>
                                <div className="flex align-items-center">
                                    <RadioButton inputId="thermal" value="thermal" checked={state.printFormat === 'thermal'} onChange={(e) => setStateValue({ printFormat: e.value })} />
                                    <label htmlFor="thermal" className="ml-2">
                                        Thermal
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="field">
                            <label>Payment Method</label>
                            <FilterSelect
                                showLabel={false}
                                selectedOption={state.billingSummary.selectedPaymentMethod}
                                selectableOptions={state.paymentMethods}
                                onSelectChange={(e) => setStateValue({ billingSummary: { ...state.billingSummary, paymentMethod: e.value.name, selectedPaymentMethod: e.value } })}
                                elementId="billPayment"
                                defaultValue="Select Payment Method"
                            />
                        </div>

                        <Divider />

                        <div className="flex justify-content-between mb-2">
                            <span>Subtotal:</span>
                            <strong>{formatCurrency(state.billingSummary.subtotal, state.generalSettings.country)}</strong>
                        </div>
                        <div className="flex justify-content-between mb-2">
                            <span>Tax ({state.determinedFees.taxRate}%):</span>
                            <strong>{formatCurrency(state.billingSummary.tax, state.generalSettings.country)}</strong>
                        </div>
                        <div className="flex justify-content-between mb-2">
                            <span>Discount:</span>
                            <InputNumber
                                value={state.billingSummary.discount}
                                onValueChange={(e) => {
                                    setStateValue({ billingSummary: { ...state.billingSummary, discount: e.value || 0 } });
                                    calculateBillingSummary(state.billingItems);
                                }}
                                inputClassName="text-right"
                                min={0}
                                max={state.billingSummary.subtotal}
                            />
                        </div>

                        <Divider />

                        <div className="flex justify-content-between mb-2 text-xl font-bold">
                            <span>Total:</span>
                            <span className="text-primary">{formatCurrency(state.billingSummary.total, state.generalSettings.country)}</span>
                        </div>

                        <div className="flex justify-content-between mb-2">
                            <span>Amount Paid:</span>
                            <InputNumber
                                value={state.billingSummary.amountPaid}
                                onValueChange={(e) => {
                                    const paid = e.value || 0;
                                    setStateValue({ billingSummary: { ...state.billingSummary, amountPaid: paid, balance: state.billingSummary.total - paid } });
                                }}
                                inputClassName="text-right"
                                min={0}
                            />
                        </div>

                        <div className="flex justify-content-between mb-3 text-lg">
                            <span>{state.billingSummary.balance < 0 ? 'Change' : 'Balance'}:</span>
                            <strong className={state.billingSummary.balance > 0 ? 'text-red-500' : 'text-green-500'}>{formatCurrency(Math.abs(state.billingSummary.balance), state.generalSettings.country)}</strong>
                        </div>

                        <div className="flex flex-column gap-2">
                            <Button label="Process Payment" icon="pi pi-check" className="w-full" onClick={processPayment} disabled={state.billingSummary.total === 0} loading={state.isLoading} />
                            <Button
                                label={`Print ${state.printFormat === 'a4' ? 'A4' : 'Thermal'} Bill`}
                                icon="pi pi-print"
                                className="w-full"
                                severity="secondary"
                                onClick={state.printFormat === 'a4' ? handlePrintA4 : handlePrintThermal}
                                disabled={state.billingSummary.total === 0}
                            />
                        </div>
                    </Card>
                </div>
            </div>
        </>
    );
};
export default PatientBill;
