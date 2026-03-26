import { Button } from 'primereact/button';
import { Fieldset } from 'primereact/fieldset';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { formatCurrency } from '@/libs/utils';
import { Divider } from 'primereact/divider';
import React from 'react';
import { useBillingContext } from '@/libs/contextProviders/AppContexts';
import { Investigation } from '@/types/hospital';
import { Checkbox } from 'primereact/checkbox';
import { useReactToPrint } from 'react-to-print';

const BillingInvestigations = () => {
    const { state, setStateValue, investigationPrintRef } = useBillingContext();

    const handlePrintInvestigationThermal = useReactToPrint({
        contentRef: investigationPrintRef,
        ignoreGlobalStyles: true,
        documentTitle: `Investigation_${state.selectedPatient?.recordNumber}_${new Date().toISOString()}`,
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
    const toggleInvestigation = (investigation: Investigation, source: 'internal' | 'external') => {
        const updatedInvestigation = { ...investigation, selected: !investigation.selected };

        if (source === 'internal') {
            setStateValue({ internalInvestigations: state.internalInvestigations.map((i) => (i.investigationId === investigation.investigationId ? updatedInvestigation : i)) });
        } else {
            setStateValue({ externalInvestigations: state.externalInvestigations.map((i) => (i.investigationId === investigation.investigationId ? updatedInvestigation : i)) });
        }

        if (updatedInvestigation.selected) {
            setStateValue({ selectedInvestigations: [...state.selectedInvestigations, updatedInvestigation] });
        } else {
            setStateValue({ selectedInvestigations: state.selectedInvestigations.filter((i) => i.investigationId !== investigation.investigationId) });
        }
    };
    const investigationActionTemplate = (investigation: Investigation) => {
        const source = investigation.source === 'Internal' ? 'internal' : 'external';
        return <Checkbox checked={investigation.selected} onChange={() => toggleInvestigation(investigation, source)} />;
    };
    const investigationPriceTemplate = (investigation: Investigation) => {
        return investigation.source === 'Internal' ? `${formatCurrency(investigation.price, state.generalSettings.country)}` : 'N/A';
    };

    return (
        <>
            <div className="grid">
                <div className="col-12">
                    <div className="flex justify-content-end mb-3 gap-2">
                        <Button label="Add Investigation" icon="pi pi-plus" size="small" onClick={() => setStateValue({ showAddInvestigationDialog: true })} />
                        <Button label="Print Investigation Request" icon="pi pi-print" size="small" severity="success" onClick={handlePrintInvestigationThermal} disabled={state.selectedInvestigations.filter((i) => i.selected).length === 0} />
                    </div>
                </div>

                {/* Internal Investigations */}
                <div className="col-12 lg:col-6">
                    <Fieldset legend="Internal Investigations" toggleable>
                        <DataTable value={state.internalInvestigations} className="p-datatable-sm">
                            <Column field="testName" header="Test Name" />
                            <Column field="category" header="Category" />
                            <Column field="price" header="Price" body={investigationPriceTemplate} style={{ width: '100px' }} />
                            <Column header="Select" body={investigationActionTemplate} style={{ width: '80px' }} />
                        </DataTable>
                    </Fieldset>
                </div>

                {/* External Investigations */}
                <div className="col-12 lg:col-6">
                    <Fieldset legend="External Investigations" toggleable>
                        <DataTable value={state.externalInvestigations} className="p-datatable-sm">
                            <Column field="testName" header="Test Name" />
                            <Column field="category" header="Category" />
                            <Column header="Select" body={investigationActionTemplate} style={{ width: '80px' }} />
                        </DataTable>
                    </Fieldset>
                </div>

                {/* Summary */}
                <div className="col-12">
                    <Card title="Selected Investigations Summary">
                        <div className="grid">
                            <div className="col-12 md:col-6">
                                <h5>Internal Investigations</h5>
                                {state.selectedInvestigations
                                    .filter((i) => i.source === 'Internal' && i.selected)
                                    .map((inv) => (
                                        <div key={inv.investigationId} className="flex justify-content-between mb-2">
                                            <span>{inv.testName}</span>
                                            <strong>{formatCurrency(inv.price, state.generalSettings.country)}</strong>
                                        </div>
                                    ))}
                                {state.selectedInvestigations.filter((i) => i.source === 'Internal' && i.selected).length === 0 && <p className="text-500">No internal investigations selected</p>}
                            </div>
                            <div className="col-12 md:col-6">
                                <h5>External Investigations</h5>
                                {state.selectedInvestigations
                                    .filter((i) => i.source === 'External' && i.selected)
                                    .map((inv) => (
                                        <div key={inv.investigationId} className="mb-2">
                                            <span>{inv.testName}</span>
                                        </div>
                                    ))}
                                {state.selectedInvestigations.filter((i) => i.source === 'External' && i.selected).length === 0 && <p className="text-500">No external investigations selected</p>}
                            </div>
                        </div>

                        <Divider />

                        <div className="flex justify-content-between align-items-center">
                            <div>
                                <strong>Total Internal Investigations Cost: </strong>
                                <span className="text-primary text-xl ml-2">
                                    {formatCurrency(
                                        state.selectedInvestigations.filter((i) => i.source === 'Internal' && i.selected).reduce((sum, i) => sum + i.price, 0),
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
export default BillingInvestigations;
