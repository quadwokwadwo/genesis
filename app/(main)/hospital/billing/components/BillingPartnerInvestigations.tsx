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

const BillingPartnerInvestigations = () => {
    const { state, setStateValue } = useBillingContext();

    const togglePartnerInvestigation = (investigation: Investigation, source: 'internal' | 'external') => {
        const updatedInvestigation = { ...investigation, selected: !investigation.selected };

        if (source === 'internal') {
            setStateValue({ partnerInternalInvestigations: state.partnerInternalInvestigations.map((i) => (i.investigationId === investigation.investigationId ? updatedInvestigation : i)) });
        } else {
            setStateValue({ partnerExternalInvestigations: state.partnerExternalInvestigations.map((i) => (i.investigationId === investigation.investigationId ? updatedInvestigation : i)) });
        }

        if (updatedInvestigation.selected) {
            setStateValue({ partnerSelectedInvestigations: [...state.partnerSelectedInvestigations, updatedInvestigation] });
        } else {
            setStateValue({ partnerSelectedInvestigations: state.partnerSelectedInvestigations.filter((i) => i.investigationId !== investigation.investigationId) });
        }
    };

    const investigationActionTemplate = (investigation: Investigation) => {
        const source = investigation.source === 'Internal' ? 'internal' : 'external';
        return <Checkbox checked={investigation.selected} onChange={() => togglePartnerInvestigation(investigation, source)} />;
    };

    const investigationPriceTemplate = (investigation: Investigation) => {
        return investigation.source === 'Internal' ? `${formatCurrency(investigation.price, state.generalSettings.country)}` : 'N/A';
    };

    const hasPartnerInvestigations = state.partnerInternalInvestigations.length > 0 || state.partnerExternalInvestigations.length > 0;

    if (!hasPartnerInvestigations) {
        return (
            <div className="grid">
                <div className="col-12">
                    <Card>
                        <div className="text-center p-4 text-600">
                            <i className="pi pi-info-circle text-2xl mb-2" />
                            <p>No partner investigations were ordered for this visit.</p>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="grid">
                {/* Internal Investigations */}
                <div className="col-12 lg:col-6">
                    <Fieldset legend="Partner Internal Investigations" toggleable>
                        <DataTable value={state.partnerInternalInvestigations} className="p-datatable-sm">
                            <Column field="testName" header="Test Name" />
                            <Column field="category" header="Category" />
                            <Column field="price" header="Price" body={investigationPriceTemplate} style={{ width: '100px' }} />
                            <Column header="Select" body={investigationActionTemplate} style={{ width: '80px' }} />
                        </DataTable>
                    </Fieldset>
                </div>

                {/* External Investigations */}
                <div className="col-12 lg:col-6">
                    <Fieldset legend="Partner External Investigations" toggleable>
                        <DataTable value={state.partnerExternalInvestigations} className="p-datatable-sm">
                            <Column field="testName" header="Test Name" />
                            <Column field="category" header="Category" />
                            <Column header="Select" body={investigationActionTemplate} style={{ width: '80px' }} />
                        </DataTable>
                    </Fieldset>
                </div>

                {/* Summary */}
                <div className="col-12">
                    <Card title="Partner Selected Investigations Summary">
                        <div className="grid">
                            <div className="col-12 md:col-6">
                                <h5>Internal Investigations</h5>
                                {state.partnerSelectedInvestigations
                                    .filter((i) => i.source === 'Internal' && i.selected)
                                    .map((inv) => (
                                        <div key={inv.investigationId} className="flex justify-content-between mb-2">
                                            <span>{inv.testName}</span>
                                            <strong>{formatCurrency(inv.price, state.generalSettings.country)}</strong>
                                        </div>
                                    ))}
                                {state.partnerSelectedInvestigations.filter((i) => i.source === 'Internal' && i.selected).length === 0 && <p className="text-500">No internal investigations selected</p>}
                            </div>
                            <div className="col-12 md:col-6">
                                <h5>External Investigations</h5>
                                {state.partnerSelectedInvestigations
                                    .filter((i) => i.source === 'External' && i.selected)
                                    .map((inv) => (
                                        <div key={inv.investigationId} className="mb-2">
                                            <span>{inv.testName}</span>
                                        </div>
                                    ))}
                                {state.partnerSelectedInvestigations.filter((i) => i.source === 'External' && i.selected).length === 0 && <p className="text-500">No external investigations selected</p>}
                            </div>
                        </div>

                        <Divider />

                        <div className="flex justify-content-between align-items-center">
                            <div>
                                <strong>Total Partner Internal Investigations Cost: </strong>
                                <span className="text-primary text-xl ml-2">
                                    {formatCurrency(
                                        state.partnerSelectedInvestigations.filter((i) => i.source === 'Internal' && i.selected).reduce((sum, i) => sum + i.price, 0),
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
export default BillingPartnerInvestigations;
