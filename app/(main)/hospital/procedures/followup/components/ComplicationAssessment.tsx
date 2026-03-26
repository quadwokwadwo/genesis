import React from 'react';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { Tag } from 'primereact/tag';
import { Panel } from 'primereact/panel';
import { useFollowUpContext } from '@/app/(main)/hospital/procedures/followup/components/FollowUpProvider';

const ComplicationAssessment: React.FC = () => {
    const { state, updateComplicationAssessment } = useFollowUpContext();

    const yesNoOptions = [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' }
    ];

    const severityOptions = [
        { label: 'None', value: 'None' },
        { label: 'Mild', value: 'Mild' },
        { label: 'Moderate', value: 'Moderate' },
        { label: 'Severe', value: 'Severe' }
    ];

    const getSeverityColor = (severity: string | null) => {
        switch (severity) {
            case 'None':
                return 'success';
            case 'Mild':
                return 'info';
            case 'Moderate':
                return 'warning';
            case 'Severe':
                return 'danger';
            default:
                return 'info';
        }
    };

    return (
        <div className="grid">
            <div className="col-12">
                <Card className="shadow-2">
                    <div className="flex align-items-center mb-4">
                        <i className="pi pi-exclamation-triangle text-primary text-2xl mr-3" />
                        <div>
                            <h4 className="m-0 text-primary">Complication Assessment</h4>
                            <p className="text-600 m-0">Screen for and document any post-procedure complications</p>
                        </div>
                    </div>

                    <div className="formgrid grid">
                        <div className="field col-12">
                            <Panel header="Complication Screening" className={`mb-4 ${state.complicationAssessment.hasComplications === 'Yes' ? 'border-orange-300' : ''}`}>
                                <div className="formgrid grid">
                                    <div className="field col-12 md:col-6">
                                        <label className="font-semibold mb-2 block">Any Complications Since Procedure? *</label>
                                        <Dropdown value={state.complicationAssessment.hasComplications} onChange={(e) => updateComplicationAssessment({ hasComplications: e.value })} options={yesNoOptions} placeholder="Select" className="w-full" />
                                    </div>

                                    {state.complicationAssessment.hasComplications === 'Yes' && (
                                        <div className="field col-12 md:col-6">
                                            <label className="font-semibold mb-2 block">Complication Severity</label>
                                            <Dropdown
                                                value={state.complicationAssessment.complicationSeverity}
                                                onChange={(e) => updateComplicationAssessment({ complicationSeverity: e.value })}
                                                options={severityOptions}
                                                placeholder="Select severity"
                                                className="w-full"
                                            />
                                            {state.complicationAssessment.complicationSeverity && (
                                                <Tag value={state.complicationAssessment.complicationSeverity} severity={getSeverityColor(state.complicationAssessment.complicationSeverity)} className="mt-2" />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </Panel>
                        </div>

                        {state.complicationAssessment.hasComplications === 'Yes' && (
                            <>
                                <div className="field col-12">
                                    <label className="font-semibold mb-2 block">Complication Details</label>
                                    <InputTextarea
                                        rows={4}
                                        value={state.complicationAssessment.complicationDetails}
                                        onChange={(e) => updateComplicationAssessment({ complicationDetails: e.target.value })}
                                        placeholder="Describe the complications in detail including timeline, symptoms, and progression..."
                                        className="w-full"
                                    />
                                </div>

                                <div className="field col-12 md:col-6">
                                    <label className="font-semibold mb-2 block">Treatment Required</label>
                                    <Dropdown value={state.complicationAssessment.treatmentRequired} onChange={(e) => updateComplicationAssessment({ treatmentRequired: e.value })} options={yesNoOptions} placeholder="Select" className="w-full" />
                                </div>

                                <div className="field col-12 md:col-6">
                                    <label className="font-semibold mb-2 block">Hospitalization Required</label>
                                    <Dropdown
                                        value={state.complicationAssessment.hospitalizationRequired}
                                        onChange={(e) => updateComplicationAssessment({ hospitalizationRequired: e.value })}
                                        options={yesNoOptions}
                                        placeholder="Select"
                                        className="w-full"
                                    />
                                </div>

                                {state.complicationAssessment.treatmentRequired === 'Yes' && (
                                    <div className="field col-12">
                                        <label className="font-semibold mb-2 block">Treatment Provided</label>
                                        <InputTextarea
                                            rows={3}
                                            value={state.complicationAssessment.treatmentProvided}
                                            onChange={(e) => updateComplicationAssessment({ treatmentProvided: e.target.value })}
                                            placeholder="Describe treatment provided, medications given, procedures performed..."
                                            className="w-full"
                                        />
                                    </div>
                                )}

                                <div className="field col-12 md:col-6">
                                    <label className="font-semibold mb-2 block">Additional Procedures Required</label>
                                    <Dropdown
                                        value={state.complicationAssessment.additionalProceduresRequired}
                                        onChange={(e) => updateComplicationAssessment({ additionalProceduresRequired: e.value })}
                                        options={yesNoOptions}
                                        placeholder="Select"
                                        className="w-full"
                                    />
                                </div>

                                <div className="field col-12 md:col-6">
                                    <label className="font-semibold mb-2 block">Resolution Date</label>
                                    <Calendar
                                        value={state.complicationAssessment.resolutionDate}
                                        onChange={(e) => updateComplicationAssessment({ resolutionDate: e.value as Date })}
                                        showIcon
                                        dateFormat="dd M yy"
                                        placeholder="When was complication resolved?"
                                    />
                                </div>

                                {state.complicationAssessment.additionalProceduresRequired === 'Yes' && (
                                    <div className="field col-12">
                                        <label className="font-semibold mb-2 block">Additional Procedure Details</label>
                                        <InputTextarea
                                            rows={3}
                                            value={state.complicationAssessment.additionalProcedureDetails}
                                            onChange={(e) => updateComplicationAssessment({ additionalProcedureDetails: e.target.value })}
                                            placeholder="Describe additional procedures required or planned..."
                                            className="w-full"
                                        />
                                    </div>
                                )}

                                <div className="field col-12">
                                    <label className="font-semibold mb-2 block">Preventive Measures for Future</label>
                                    <InputTextarea
                                        rows={3}
                                        value={state.complicationAssessment.preventiveMeasures}
                                        onChange={(e) => updateComplicationAssessment({ preventiveMeasures: e.target.value })}
                                        placeholder="Measures to prevent similar complications in the future..."
                                        className="w-full"
                                    />
                                </div>
                            </>
                        )}

                        {state.complicationAssessment.hasComplications === 'No' && (
                            <div className="field col-12">
                                <Panel className="border-green-300">
                                    <div className="flex align-items-center justify-content-center p-4">
                                        <i className="pi pi-check-circle text-green-500 text-3xl mr-3" />
                                        <div className="text-center">
                                            <h5 className="m-0 text-green-800">No Complications Reported</h5>
                                            <p className="text-600 m-0 mt-1">Patient recovery is progressing without complications</p>
                                        </div>
                                    </div>
                                </Panel>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ComplicationAssessment;
