import React from 'react';
import { Card } from 'primereact/card';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { Tag } from 'primereact/tag';
import { useFollowUpContext } from '@/app/(main)/hospital/procedures/followup/components/FollowUpProvider';

const RecoveryAssessment: React.FC = () => {
    const { state, updateRecoveryAssessment } = useFollowUpContext();

    const yesNoOptions = [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' }
    ];

    const recoveryStatusOptions = [
        { label: 'Excellent', value: 'Excellent' },
        { label: 'Good', value: 'Good' },
        { label: 'Fair', value: 'Fair' },
        { label: 'Poor', value: 'Poor' },
        { label: 'Concerning', value: 'Concerning' }
    ];

    const mobilityOptions = [
        { label: 'Normal', value: 'Normal' },
        { label: 'Limited', value: 'Limited' },
        { label: 'Restricted', value: 'Restricted' },
        { label: 'Bed Rest', value: 'Bed Rest' }
    ];

    const appetiteOptions = [
        { label: 'Normal', value: 'Normal' },
        { label: 'Reduced', value: 'Reduced' },
        { label: 'Poor', value: 'Poor' },
        { label: 'None', value: 'None' }
    ];

    const sleepQualityOptions = [
        { label: 'Good', value: 'Good' },
        { label: 'Fair', value: 'Fair' },
        { label: 'Poor', value: 'Poor' },
        { label: 'Very Poor', value: 'Very Poor' }
    ];

    const energyLevelOptions = [
        { label: 'High', value: 'High' },
        { label: 'Normal', value: 'Normal' },
        { label: 'Low', value: 'Low' },
        { label: 'Very Low', value: 'Very Low' }
    ];

    const getRecoveryStatusColor = (status: string | null) => {
        switch (status) {
            case 'Excellent':
                return 'success';
            case 'Good':
                return 'info';
            case 'Fair':
                return 'warning';
            case 'Poor':
            case 'Concerning':
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
                        <i className="pi pi-chart-line text-primary text-2xl mr-3" />
                        <div>
                            <h4 className="m-0 text-primary">Recovery Assessment</h4>
                            <p className="text-600 m-0">Evaluate patient`&apos;`s recovery progress and functional status</p>
                        </div>
                    </div>

                    <Accordion multiple activeIndex={[0, 1, 2]}>
                        <AccordionTab header="Overall Recovery Status">
                            <div className="formgrid grid">
                                <div className="field col-12 md:col-6">
                                    <label className="font-semibold mb-2 block">Overall Recovery Status *</label>
                                    <Dropdown
                                        value={state.recoveryAssessment.overallRecovery}
                                        onChange={(e) => updateRecoveryAssessment({ overallRecovery: e.value })}
                                        options={recoveryStatusOptions}
                                        placeholder="Select recovery status"
                                        className="w-full"
                                    />
                                    {state.recoveryAssessment.overallRecovery && <Tag value={state.recoveryAssessment.overallRecovery} severity={getRecoveryStatusColor(state.recoveryAssessment.overallRecovery)} className="mt-2" />}
                                </div>

                                <div className="field col-12 md:col-6">
                                    <label className="font-semibold mb-2 block">Mobility Level</label>
                                    <Dropdown value={state.recoveryAssessment.mobilityLevel} onChange={(e) => updateRecoveryAssessment({ mobilityLevel: e.value })} options={mobilityOptions} placeholder="Select mobility level" className="w-full" />
                                </div>

                                <div className="field col-12">
                                    <label className="font-semibold mb-2 block">Activity Restrictions</label>
                                    <InputTextarea
                                        rows={3}
                                        value={state.recoveryAssessment.activityRestrictions}
                                        onChange={(e) => updateRecoveryAssessment({ activityRestrictions: e.target.value })}
                                        placeholder="Current activity restrictions or limitations..."
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </AccordionTab>

                        <AccordionTab header="Functional Assessment">
                            <div className="formgrid grid">
                                <div className="field col-12 md:col-4">
                                    <label className="font-semibold mb-2 block">Appetite Level</label>
                                    <Dropdown value={state.recoveryAssessment.appetiteLevel} onChange={(e) => updateRecoveryAssessment({ appetiteLevel: e.value })} options={appetiteOptions} placeholder="Select appetite level" className="w-full" />
                                </div>

                                <div className="field col-12 md:col-4">
                                    <label className="font-semibold mb-2 block">Sleep Quality</label>
                                    <Dropdown value={state.recoveryAssessment.sleepQuality} onChange={(e) => updateRecoveryAssessment({ sleepQuality: e.value })} options={sleepQualityOptions} placeholder="Select sleep quality" className="w-full" />
                                </div>

                                <div className="field col-12 md:col-4">
                                    <label className="font-semibold mb-2 block">Energy Level</label>
                                    <Dropdown value={state.recoveryAssessment.energyLevel} onChange={(e) => updateRecoveryAssessment({ energyLevel: e.value })} options={energyLevelOptions} placeholder="Select energy level" className="w-full" />
                                </div>

                                <div className="field col-12 md:col-6">
                                    <label className="font-semibold mb-2 block">Returned to Work</label>
                                    <Dropdown value={state.recoveryAssessment.returnToWork} onChange={(e) => updateRecoveryAssessment({ returnToWork: e.value })} options={yesNoOptions} placeholder="Select" className="w-full" />
                                </div>

                                {state.recoveryAssessment.returnToWork === 'Yes' && (
                                    <div className="field col-12 md:col-6">
                                        <label className="font-semibold mb-2 block">Return to Work Date</label>
                                        <Calendar value={state.recoveryAssessment.returnToWorkDate} onChange={(e) => updateRecoveryAssessment({ returnToWorkDate: e.value as Date })} showIcon dateFormat="dd M yy" placeholder="Select date" />
                                    </div>
                                )}
                            </div>
                        </AccordionTab>

                        <AccordionTab header="Medication & Therapy">
                            <div className="formgrid grid">
                                <div className="field col-12 md:col-6">
                                    <label className="font-semibold mb-2 block">Medication Compliance *</label>
                                    <Dropdown value={state.recoveryAssessment.medicationCompliance} onChange={(e) => updateRecoveryAssessment({ medicationCompliance: e.value })} options={yesNoOptions} placeholder="Select" className="w-full" />
                                </div>

                                <div className="field col-12 md:col-6">
                                    <label className="font-semibold mb-2 block">Physical Therapy Required</label>
                                    <Dropdown value={state.recoveryAssessment.physicalTherapy} onChange={(e) => updateRecoveryAssessment({ physicalTherapy: e.value })} options={yesNoOptions} placeholder="Select" className="w-full" />
                                </div>

                                {state.recoveryAssessment.medicationCompliance === 'No' && (
                                    <div className="field col-12">
                                        <label className="font-semibold mb-2 block">Medication Issues</label>
                                        <InputTextarea
                                            rows={3}
                                            value={state.recoveryAssessment.medicationIssues}
                                            onChange={(e) => updateRecoveryAssessment({ medicationIssues: e.target.value })}
                                            placeholder="Describe medication compliance issues, side effects, or concerns..."
                                            className="w-full"
                                        />
                                    </div>
                                )}

                                {state.recoveryAssessment.physicalTherapy === 'Yes' && (
                                    <div className="field col-12">
                                        <label className="font-semibold mb-2 block">Physiotherapy Notes</label>
                                        <InputTextarea
                                            rows={3}
                                            value={state.recoveryAssessment.physiotherapyNotes}
                                            onChange={(e) => updateRecoveryAssessment({ physiotherapyNotes: e.target.value })}
                                            placeholder="Physical therapy requirements, progress, or recommendations..."
                                            className="w-full"
                                        />
                                    </div>
                                )}
                            </div>
                        </AccordionTab>
                    </Accordion>
                </Card>
            </div>
        </div>
    );
};

export default RecoveryAssessment;
