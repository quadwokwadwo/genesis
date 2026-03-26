import React from 'react';
import { Card } from 'primereact/card';
import { Panel } from 'primereact/panel';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { useProcedureContext } from '@/app/(main)/hospital/procedures/consultation/ProcedureConsultationContext';

const PreProcedureInstructions: React.FC = () => {
    const { state, updatePreProcedureInstructions } = useProcedureContext();

    const yesNoOptions = [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' }
    ];

    return (
        <div className="grid">
            <div className="col-12">
                <Card className="shadow-2">
                    <div className="flex align-items-center mb-4">
                        <i className="pi pi-list text-primary text-2xl mr-3" />
                        <div>
                            <h4 className="m-0 text-primary">Pre-Procedure Instructions</h4>
                            <p className="text-600 m-0">Detailed instructions for procedure preparation</p>
                        </div>
                    </div>

                    <div className="formgrid grid">
                        <div className="field col-12">
                            <Panel header="Preparation Requirements" className="mb-4">
                                <div className="formgrid grid">
                                    <div className="field col-12 md:col-6">
                                        <label className="font-semibold mb-2 block">Fasting Required</label>
                                        <Dropdown value={state.preProcedureInstructions.fastingRequired} onChange={(e) => updatePreProcedureInstructions({ fastingRequired: e.value })} options={yesNoOptions} placeholder="Select" className="w-full" />

                                        {state.preProcedureInstructions.fastingRequired === 'Yes' && (
                                            <div className="mt-3">
                                                <label>Fasting Hours</label>
                                                <InputNumber
                                                    value={state.preProcedureInstructions.fastingHours}
                                                    onValueChange={(e) => updatePreProcedureInstructions({ fastingHours: e.value })}
                                                    min={4}
                                                    max={24}
                                                    placeholder="Hours"
                                                    className="w-full"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="field col-12 md:col-6">
                                        <label className="font-semibold mb-2 block">Companion/Driver Required</label>
                                        <Dropdown
                                            value={state.preProcedureInstructions.companionRequired}
                                            onChange={(e) => updatePreProcedureInstructions({ companionRequired: e.value })}
                                            options={yesNoOptions}
                                            placeholder="Select"
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            </Panel>
                        </div>

                        <div className="field col-12">
                            <label className="font-semibold mb-2 block">Medication Adjustments</label>
                            <InputTextarea
                                rows={4}
                                value={state.preProcedureInstructions.medicationAdjustments}
                                onChange={(e) => updatePreProcedureInstructions({ medicationAdjustments: e.target.value })}
                                placeholder="Instructions for current medications - continue, discontinue, adjust doses..."
                                className="w-full"
                            />
                        </div>

                        <div className="field col-12 md:col-6">
                            <label className="font-semibold mb-2 block">Arrival Time</label>
                            <Calendar value={state.preProcedureInstructions.arrivalTime} onChange={(e) => updatePreProcedureInstructions({ arrivalTime: e.value as Date })} showTime hourFormat="24" placeholder="Select arrival time" />
                        </div>

                        <div className="field col-12 md:col-6">
                            <label className="font-semibold mb-2 block">Emergency Contact *</label>
                            <InputText value={state.preProcedureInstructions.emergencyContact} onChange={(e) => updatePreProcedureInstructions({ emergencyContact: e.target.value })} placeholder="Name and phone number" />
                        </div>

                        <div className="field col-12">
                            <label className="font-semibold mb-2 block">Post-Procedure Care Instructions</label>
                            <InputTextarea
                                rows={5}
                                value={state.preProcedureInstructions.postProcedureCare}
                                onChange={(e) => updatePreProcedureInstructions({ postProcedureCare: e.target.value })}
                                placeholder="Detailed post-procedure care instructions, activity restrictions, medications to take..."
                                className="w-full"
                            />
                        </div>

                        <div className="field col-12">
                            <label className="font-semibold mb-2 block">Warning Signs to Watch For</label>
                            <InputTextarea
                                rows={4}
                                value={state.preProcedureInstructions.warningSignsToWatch}
                                onChange={(e) => updatePreProcedureInstructions({ warningSignsToWatch: e.target.value })}
                                placeholder="Signs and symptoms that require immediate medical attention..."
                                className="w-full"
                            />
                        </div>

                        <div className="field col-12">
                            <label className="font-semibold mb-2 block">Additional Notes</label>
                            <InputTextarea
                                rows={3}
                                value={state.preProcedureInstructions.additionalNotes}
                                onChange={(e) => updatePreProcedureInstructions({ additionalNotes: e.target.value })}
                                placeholder="Any additional instructions or information..."
                                className="w-full"
                            />
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default PreProcedureInstructions;
