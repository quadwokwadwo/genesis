import { Fieldset } from 'primereact/fieldset';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { formatCurrency } from '@/libs/utils';
import { Divider } from 'primereact/divider';
import React from 'react';
import { useBillingContext } from '@/libs/contextProviders/AppContexts';
import { PrescriptionRecord } from '@/types/hospital';
import { Checkbox } from 'primereact/checkbox';
import { useReactToPrint } from 'react-to-print';

const BillingPrescriptions = () => {
    const { state, setStateValue, externalPrescriptionRef, viewPrescriptionItem } = useBillingContext();
    const handlePrintExternalPrescription = useReactToPrint({
        contentRef: externalPrescriptionRef,
        ignoreGlobalStyles: true,
        documentTitle: `External_Prescription_${state.selectedPatient?.recordNumber}_${new Date().toISOString()}`,
        pageStyle: `
      @page {
        size: 80mm auto;
        margin: 2mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          font-family: monospace;
          font-size: 11px;
          line-height: 1.3;
        }
      }
    `
    });
    const toggleExternalPrescription = (prescription: PrescriptionRecord) => {
        const updatedPrescription = { ...prescription, selected: !prescription.selected };

        setStateValue({ externalPrescriptions: state.externalPrescriptions.map((p) => (p.medicationId === prescription.medicationId ? updatedPrescription : p)) });
        if (updatedPrescription.selected) {
            setStateValue({ selectedExternalPrescriptions: [...state.selectedExternalPrescriptions, updatedPrescription] });
        } else {
            setStateValue({ selectedExternalPrescriptions: state.selectedExternalPrescriptions.filter((p) => p.medicationId !== prescription.medicationId) });
        }
    };

    const toggleAvailableDrug = (drug: PrescriptionRecord) => {
        const updatedDrug = { ...drug, selected: !drug.selected };
        // Ensure we keep availableDrugs as an array, not an object
        setStateValue({ availableDrugs: state.availableDrugs.map((d) => (d.medicationId === drug.medicationId ? updatedDrug : d)) });
    };
    const drugActionTemplate = (drug: PrescriptionRecord) => {
        return <Checkbox checked={drug.selected} onChange={() => toggleAvailableDrug(drug)} />;
    };
    const viewFullDrugTemplate = (drug: PrescriptionRecord) => {
        return <Button icon="pi pi-eye" className="p-button-link" onClick={() => viewPrescriptionItem(drug)} />;
    };
    const externalPrescriptionActionTemplate = (prescription: PrescriptionRecord) => {
        return <Checkbox checked={prescription.selected} onChange={() => toggleExternalPrescription(prescription)} />;
    };

    const drugPriceTemplate = (drug: PrescriptionRecord) => {
        return formatCurrency(drug.totalPrice, state.generalSettings.country);
    };
    return (
        <>
            <div className="grid">
                {/* Available Hospital Drugs */}
                <div className="col-12 lg:col-6">
                    <Fieldset legend="Hospital Dispensary Drugs" toggleable>
                        <p className="text-sm text-500 mb-3">These drugs are available at our hospital dispensary and will be charged to the bill.</p>
                        <DataTable value={state.availableDrugs} className="p-datatable-sm">
                            <Column field="medicationName" header="Medication" />
                            <Column field="quantity" header="Qty" style={{ width: '60px' }} />
                            <Column field="frequency" header="Frequency" style={{ width: '80px' }} />
                            <Column field="totalPrice" header="Total" body={drugPriceTemplate} style={{ width: '100px' }} />
                            <Column header="Select" body={drugActionTemplate} style={{ width: '80px' }} />
                            <Column header="View" body={viewFullDrugTemplate} style={{ width: '80px' }} />
                        </DataTable>
                    </Fieldset>
                </div>

                {/* External Prescriptions */}
                <div className="col-12 lg:col-6">
                    <Fieldset legend="External Prescriptions" toggleable>
                        <p className="text-sm text-500 mb-3">These drugs are not available at our dispensary. Select items to generate external prescription.</p>
                        <DataTable value={state.externalPrescriptions} className="p-datatable-sm">
                            <Column field="medicationName" header="Medication" />
                            <Column field="quantity" header="Qty" style={{ width: '60px' }} />
                            <Column field="frequency" header="Frequency" style={{ width: '80px' }} />
                            <Column field="durationDays" header="Days" style={{ width: '60px' }} />
                            <Column header="Select" body={externalPrescriptionActionTemplate} style={{ width: '80px' }} />
                        </DataTable>
                        <div className="flex justify-content-end mt-3">
                            <Button label="Print External Prescription" icon="pi pi-print" size="small" severity="info" onClick={handlePrintExternalPrescription} disabled={state.selectedExternalPrescriptions.filter((p) => p.selected).length === 0} />
                        </div>
                    </Fieldset>
                </div>

                {/* Summary */}
                <div className="col-12">
                    <Card title="Prescription Summary">
                        <div className="grid">
                            <div className="col-12 md:col-6">
                                <h5>Hospital Dispensary Drugs</h5>
                                {state.availableDrugs
                                    ?.filter((drug) => drug.selected)
                                    .map((drug) => (
                                        <div key={drug.medicationId} className="flex justify-content-between mb-2 p-2 border-round surface-100">
                                            <span>
                                                {drug.medicationName} ({drug.quantity} {drug.frequency})
                                            </span>
                                            <strong>{formatCurrency(drug.totalPrice, state.generalSettings.country)}</strong>
                                        </div>
                                    ))}
                                {state.availableDrugs.filter((drug) => drug.selected).length === 0 && <p className="text-500">No hospital drugs selected</p>}
                            </div>
                            <div className="col-12 md:col-6">
                                <h5>External Prescriptions</h5>
                                {state.selectedExternalPrescriptions
                                    .filter((p) => p.selected)
                                    .map((prescription) => (
                                        <div key={prescription.medicationId} className="mb-2 p-2 border-round surface-100">
                                            <div className="font-semibold">{prescription.medicationName}</div>
                                            <div className="text-sm text-500">
                                                {prescription.quantity} units, {prescription.frequency} for {prescription.durationDays} days
                                            </div>
                                        </div>
                                    ))}
                                {state.selectedExternalPrescriptions.filter((p) => p.selected).length === 0 && <p className="text-500">No external prescriptions selected</p>}
                            </div>
                        </div>

                        <Divider />

                        <div className="flex justify-content-between align-items-center">
                            <div>
                                <strong>Total Hospital Dispensary Cost: </strong>
                                <span className="text-primary text-xl ml-2">
                                    {formatCurrency(
                                        state.availableDrugs.filter((drug) => drug.selected).reduce((sum, drug) => sum + drug.totalPrice, 0),
                                        state.generalSettings.country
                                    )}
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </>
    );
};
export default BillingPrescriptions;
