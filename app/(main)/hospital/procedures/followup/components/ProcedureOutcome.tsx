import React from 'react';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Rating } from 'primereact/rating';
import { Tag } from 'primereact/tag';
import { Panel } from 'primereact/panel';
import { useFollowUpContext } from '@/app/(main)/hospital/procedures/followup/components/FollowUpProvider';

const ProcedureOutcome: React.FC = () => {
    const { state, updateProcedureOutcome } = useFollowUpContext();

    const yesNoOptions = [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' }
    ];

    const outcomeStatusOptions = [
        { label: 'Successful', value: 'Successful' },
        { label: 'Partially Successful', value: 'Partially Successful' },
        { label: 'Failed', value: 'Failed' },
        { label: 'Pending', value: 'Pending' }
    ];

    const getOutcomeColor = (status: string | null) => {
        switch (status) {
            case 'Successful':
                return 'success';
            case 'Partially Successful':
                return 'warning';
            case 'Failed':
                return 'danger';
            case 'Pending':
                return 'info';
            default:
                return 'info';
        }
    };

    const getSatisfactionLabel = (rating: number | null) => {
        if (!rating) return '';
        if (rating <= 2) return 'Poor';
        if (rating === 3) return 'Fair';
        if (rating === 4) return 'Good';
        return 'Excellent';
    };

    return (
        <div className="grid">
            <div className="col-12">
                <Card className="shadow-2">
                    <div className="flex align-items-center mb-4">
                        <i className="pi pi-chart-bar text-primary text-2xl mr-3" />
                        <div>
                            <h4 className="m-0 text-primary">Procedure Outcome Assessment</h4>
                            <p className="text-600 m-0">Evaluate the success and results of the procedure</p>
                        </div>
                    </div>

                    <div className="formgrid grid">
                        <div className="field col-12">
                            <Panel header="Overall Outcome" className="mb-4">
                                <div className="formgrid grid">
                                    <div className="field col-12 md:col-6">
                                        <label className="font-semibold mb-2 block">Overall Procedure Outcome *</label>
                                        <Dropdown
                                            value={state.procedureOutcome.overallOutcome}
                                            onChange={(e) => updateProcedureOutcome({ overallOutcome: e.value })}
                                            options={outcomeStatusOptions}
                                            placeholder="Select outcome status"
                                            className="w-full"
                                        />
                                        {state.procedureOutcome.overallOutcome && <Tag value={state.procedureOutcome.overallOutcome} severity={getOutcomeColor(state.procedureOutcome.overallOutcome)} className="mt-2" />}
                                    </div>

                                    <div className="field col-12 md:col-6">
                                        <label className="font-semibold mb-2 block">Patient Satisfaction</label>
                                        <div className="flex align-items-center gap-3">
                                            <Rating value={state.procedureOutcome.patientSatisfaction} onChange={(e) => updateProcedureOutcome({ patientSatisfaction: e.value })} cancel={false} className="text-yellow-500" />
                                            {state.procedureOutcome.patientSatisfaction && (
                                                <Tag
                                                    value={getSatisfactionLabel(state.procedureOutcome.patientSatisfaction)}
                                                    severity={state.procedureOutcome.patientSatisfaction >= 4 ? 'success' : state.procedureOutcome.patientSatisfaction >= 3 ? 'warning' : 'danger'}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Panel>
                        </div>

                        <div className="field col-12">
                            <label className="font-semibold mb-2 block">Success Criteria</label>
                            <InputTextarea
                                rows={3}
                                value={state.procedureOutcome.successCriteria}
                                onChange={(e) => updateProcedureOutcome({ successCriteria: e.target.value })}
                                placeholder="Define what constitutes success for this procedure..."
                                className="w-full"
                            />
                        </div>

                        <div className="field col-12">
                            <label className="font-semibold mb-2 block">Objective Results</label>
                            <InputTextarea
                                rows={4}
                                value={state.procedureOutcome.objectiveResults}
                                onChange={(e) => updateProcedureOutcome({ objectiveResults: e.target.value })}
                                placeholder="Measurable outcomes, test results, imaging findings, quantitative measures..."
                                className="w-full"
                            />
                        </div>

                        <div className="field col-12 md:col-6">
                            <label className="font-semibold mb-2 block">Functional Improvement</label>
                            <Dropdown value={state.procedureOutcome.functionalImprovement} onChange={(e) => updateProcedureOutcome({ functionalImprovement: e.value })} options={yesNoOptions} placeholder="Select" className="w-full" />
                        </div>

                        <div className="field col-12 md:col-6">
                            <label className="font-semibold mb-2 block">Quality of Life Improvement</label>
                            <Dropdown value={state.procedureOutcome.qualityOfLifeImprovement} onChange={(e) => updateProcedureOutcome({ qualityOfLifeImprovement: e.value })} options={yesNoOptions} placeholder="Select" className="w-full" />
                        </div>

                        {state.procedureOutcome.functionalImprovement === 'Yes' && (
                            <div className="field col-12">
                                <label className="font-semibold mb-2 block">Functional Improvement Details</label>
                                <InputTextarea
                                    rows={3}
                                    value={state.procedureOutcome.functionalDetails}
                                    onChange={(e) => updateProcedureOutcome({ functionalDetails: e.target.value })}
                                    placeholder="Describe specific functional improvements observed..."
                                    className="w-full"
                                />
                            </div>
                        )}

                        {state.procedureOutcome.qualityOfLifeImprovement === 'Yes' && (
                            <div className="field col-12">
                                <label className="font-semibold mb-2 block">Quality of Life Improvement Details</label>
                                <InputTextarea
                                    rows={3}
                                    value={state.procedureOutcome.qualityOfLifeDetails}
                                    onChange={(e) => updateProcedureOutcome({ qualityOfLifeDetails: e.target.value })}
                                    placeholder="Describe improvements in quality of life, daily activities, symptoms..."
                                    className="w-full"
                                />
                            </div>
                        )}

                        <div className="field col-12">
                            <label className="font-semibold mb-2 block">Expected vs Actual Results</label>
                            <InputTextarea
                                rows={4}
                                value={state.procedureOutcome.expectedVsActualResults}
                                onChange={(e) => updateProcedureOutcome({ expectedVsActualResults: e.target.value })}
                                placeholder="Compare the expected outcomes with the actual results achieved..."
                                className="w-full"
                            />
                        </div>

                        <div className="field col-12 md:col-6">
                            <label className="font-semibold mb-2 block">Additional Interventions Needed</label>
                            <Dropdown value={state.procedureOutcome.additionalInterventionsNeeded} onChange={(e) => updateProcedureOutcome({ additionalInterventionsNeeded: e.value })} options={yesNoOptions} placeholder="Select" className="w-full" />
                        </div>

                        {state.procedureOutcome.additionalInterventionsNeeded === 'Yes' && (
                            <div className="field col-12 md:col-6">
                                <label className="font-semibold mb-2 block">Intervention Details</label>
                                <InputTextarea
                                    rows={3}
                                    value={state.procedureOutcome.interventionDetails}
                                    onChange={(e) => updateProcedureOutcome({ interventionDetails: e.target.value })}
                                    placeholder="Describe additional interventions required..."
                                    className="w-full"
                                />
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ProcedureOutcome;
