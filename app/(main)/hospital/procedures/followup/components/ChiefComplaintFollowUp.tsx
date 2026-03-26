import React from 'react';
import { Card } from 'primereact/card';
import { Panel } from 'primereact/panel';
import { Checkbox } from 'primereact/checkbox';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { useFollowUpContext } from '@/app/(main)/hospital/procedures/followup/components/FollowUpProvider';

const ChiefComplaintFollowUp: React.FC = () => {
    const { state, setStateValue } = useFollowUpContext();

    const followUpTypeOptions = [
        { label: 'Post-Procedure Review', value: 'Post-Procedure Review' },
        { label: 'Complication Assessment', value: 'Complication Assessment' },
        { label: 'Recovery Check', value: 'Recovery Check' },
        { label: 'Result Discussion', value: 'Result Discussion' },
        { label: 'Treatment Planning', value: 'Treatment Planning' },
        { label: 'Routine Follow-up', value: 'Routine Follow-up' }
    ];

    const getDaysSinceProcedure = () => {
        const diffTime = Math.abs(new Date().getTime() - state.procedureReference.procedureDate.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date);
    };

    return (
        <div className="grid">
            <div className="col-12">
                <Card className="shadow-2">
                    <div className="flex align-items-center mb-4">
                        <i className="pi pi-history text-primary text-2xl mr-3" />
                        <div>
                            <h4 className="m-0 text-primary">Follow-up Visit Assessment</h4>
                            <p className="text-600 m-0">Post-procedure evaluation and patient concerns</p>
                        </div>
                    </div>

                    {/* Procedure Reference */}
                    <div className="mb-4">
                        <Panel header="Previous Procedure Information" className="mb-4">
                            <div className="grid">
                                <div className="col-12 md:col-6">
                                    <div className="flex flex-column gap-2">
                                        <div className="flex align-items-center gap-2">
                                            <strong>Procedure:</strong>
                                            <Tag value={state.procedureReference.procedureType} severity="info" />
                                        </div>
                                        <div>
                                            <strong>Date:</strong> {formatDate(state.procedureReference.procedureDate)}
                                        </div>
                                        <div>
                                            <strong>Surgeon:</strong> {state.procedureReference.surgeonName}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 md:col-6">
                                    <div className="flex flex-column gap-2">
                                        <div>
                                            <strong>Location:</strong> {state.procedureReference.procedureLocation}
                                        </div>
                                        <div className="flex align-items-center gap-2">
                                            <strong>Days Since Procedure:</strong>
                                            <Tag value={`${getDaysSinceProcedure()} days`} severity={getDaysSinceProcedure() <= 7 ? 'warning' : 'success'} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Panel>
                    </div>

                    <div className="formgrid grid">
                        <div className="field col-12 md:col-6">
                            <Panel header="Follow-up Purpose" className="h-full">
                                <div className="mb-3">
                                    <label className="font-semibold mb-2 block">Visit Type *</label>
                                    <Dropdown value={state.followUpType} onChange={(e) => setStateValue({ followUpType: e.value })} options={followUpTypeOptions} placeholder="Select visit type" className="w-full" />
                                </div>

                                <div className="flex flex-column gap-3">
                                    <div className="flex align-items-center">
                                        <Checkbox
                                            inputId="painManagement"
                                            checked={state.followUpChecks.painManagement}
                                            onChange={(e) =>
                                                setStateValue({
                                                    followUpChecks: {
                                                        ...state.followUpChecks,
                                                        painManagement: e.checked || false
                                                    }
                                                })
                                            }
                                        />
                                        <label htmlFor="painManagement" className="ml-2 text-lg">
                                            <i className="pi pi-heart mr-2 text-red-500" />
                                            Pain Management
                                        </label>
                                    </div>

                                    <div className="flex align-items-center">
                                        <Checkbox
                                            inputId="woundCare"
                                            checked={state.followUpChecks.woundCare}
                                            onChange={(e) =>
                                                setStateValue({
                                                    followUpChecks: {
                                                        ...state.followUpChecks,
                                                        woundCare: e.checked || false
                                                    }
                                                })
                                            }
                                        />
                                        <label htmlFor="woundCare" className="ml-2 text-lg">
                                            <i className="pi pi-shield mr-2 text-green-500" />
                                            Wound Care
                                        </label>
                                    </div>

                                    <div className="flex align-items-center">
                                        <Checkbox
                                            inputId="medicationReview"
                                            checked={state.followUpChecks.medicationReview}
                                            onChange={(e) =>
                                                setStateValue({
                                                    followUpChecks: {
                                                        ...state.followUpChecks,
                                                        medicationReview: e.checked || false
                                                    }
                                                })
                                            }
                                        />
                                        <label htmlFor="medicationReview" className="ml-2 text-lg">
                                            <i className="pi pi-tablet mr-2 text-blue-500" />
                                            Medication Review
                                        </label>
                                    </div>

                                    <div className="flex align-items-center">
                                        <Checkbox
                                            inputId="complicationScreen"
                                            checked={state.followUpChecks.complicationScreen}
                                            onChange={(e) =>
                                                setStateValue({
                                                    followUpChecks: {
                                                        ...state.followUpChecks,
                                                        complicationScreen: e.checked || false
                                                    }
                                                })
                                            }
                                        />
                                        <label htmlFor="complicationScreen" className="ml-2 text-lg">
                                            <i className="pi pi-exclamation-triangle mr-2 text-orange-500" />
                                            Complication Screening
                                        </label>
                                    </div>

                                    <div className="flex align-items-center">
                                        <Checkbox
                                            inputId="resultDiscussion"
                                            checked={state.followUpChecks.resultDiscussion}
                                            onChange={(e) =>
                                                setStateValue({
                                                    followUpChecks: {
                                                        ...state.followUpChecks,
                                                        resultDiscussion: e.checked || false
                                                    }
                                                })
                                            }
                                        />
                                        <label htmlFor="resultDiscussion" className="ml-2 text-lg">
                                            <i className="pi pi-chart-bar mr-2 text-purple-500" />
                                            Result Discussion
                                        </label>
                                    </div>
                                </div>
                            </Panel>
                        </div>

                        <div className="field col-12 md:col-6">
                            <Panel header="Current Concerns" className="h-full">
                                <label htmlFor="chiefComplaint" className="font-semibold mb-2 block">
                                    Patient Main Concerns Today *
                                </label>
                                <InputTextarea
                                    id="chiefComplaint"
                                    rows={8}
                                    value={state.chiefComplaint}
                                    onChange={(e) => setStateValue({ chiefComplaint: e.target.value })}
                                    placeholder="Describe current symptoms, concerns, recovery progress, questions about the procedure, pain levels, functional status..."
                                    className="w-full"
                                />
                                <small className="text-500 mt-2 block">Include timeline, severity, and any changes since the procedure</small>
                            </Panel>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ChiefComplaintFollowUp;
