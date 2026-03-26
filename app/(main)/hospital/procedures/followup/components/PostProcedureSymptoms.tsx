import React from 'react';
import { Card } from 'primereact/card';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { Slider } from 'primereact/slider';
import { Tag } from 'primereact/tag';
import { useFollowUpContext } from '@/app/(main)/hospital/procedures/followup/components/FollowUpProvider';

const PostProcedureSymptoms: React.FC = () => {
    const { state, updatePostProcedureSymptoms } = useFollowUpContext();

    const yesNoOptions = [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' }
    ];

    const bleedingAmountOptions = [
        { label: 'None', value: 'None' },
        { label: 'Minimal (spotting)', value: 'Minimal' },
        { label: 'Light', value: 'Light' },
        { label: 'Moderate', value: 'Moderate' },
        { label: 'Heavy', value: 'Heavy' }
    ];

    const getPainLevelDescription = (level: number | null) => {
        if (level === null) return '';
        if (level === 0) return 'No Pain';
        if (level <= 3) return 'Mild Pain';
        if (level <= 6) return 'Moderate Pain';
        if (level <= 8) return 'Severe Pain';
        return 'Very Severe Pain';
    };

    const getPainLevelColor = (level: number | null) => {
        if (level === null || level === 0) return 'success';
        if (level <= 3) return 'info';
        if (level <= 6) return 'warning';
        return 'danger';
    };

    return (
        <div className="grid">
            <div className="col-12">
                <Card className="shadow-2">
                    <div className="flex align-items-center mb-4">
                        <i className="pi pi-heart text-primary text-2xl mr-3" />
                        <div>
                            <h4 className="m-0 text-primary">Post-Procedure Symptoms</h4>
                            <p className="text-600 m-0">Assess current symptoms and recovery status</p>
                        </div>
                    </div>

                    <Accordion multiple activeIndex={[0, 1]}>
                        <AccordionTab header="Pain Assessment">
                            <div className="formgrid grid">
                                <div className="field col-12 md:col-8">
                                    <label className="font-semibold mb-2 block">Current Pain Level (0-10 scale) *</label>
                                    <div className="p-4 border-1 border-300 border-round">
                                        <Slider value={state.postProcedureSymptoms.pain || 0} onChange={(e) => updatePostProcedureSymptoms({ pain: e.value as any })} min={0} max={10} step={1} className="w-full mb-3" />
                                        <div className="flex justify-content-between align-items-center">
                                            <span className="text-sm text-500">No Pain (0)</span>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold">{state.postProcedureSymptoms.pain || 0}</div>
                                                <Tag value={getPainLevelDescription(state.postProcedureSymptoms.pain)} severity={getPainLevelColor(state.postProcedureSymptoms.pain)} />
                                            </div>
                                            <span className="text-sm text-500">Worst Pain (10)</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="field col-12 md:col-4">
                                    <label className="font-semibold mb-2 block">Pain Location</label>
                                    <InputText value={state.postProcedureSymptoms.painLocation} onChange={(e) => updatePostProcedureSymptoms({ painLocation: e.target.value })} placeholder="e.g., Lower abdomen, incision site" />
                                </div>
                            </div>
                        </AccordionTab>

                        <AccordionTab header="Physical Symptoms">
                            <div className="formgrid grid">
                                <div className="field col-12 md:col-4">
                                    <label className="font-semibold mb-2 block">Bleeding</label>
                                    <Dropdown value={state.postProcedureSymptoms.bleeding} onChange={(e) => updatePostProcedureSymptoms({ bleeding: e.value })} options={yesNoOptions} placeholder="Select" className="w-full" />
                                </div>

                                {state.postProcedureSymptoms.bleeding === 'Yes' && (
                                    <div className="field col-12 md:col-4">
                                        <label className="font-semibold mb-2 block">Bleeding Amount</label>
                                        <Dropdown
                                            value={state.postProcedureSymptoms.bleedingAmount}
                                            onChange={(e) => updatePostProcedureSymptoms({ bleedingAmount: e.value })}
                                            options={bleedingAmountOptions}
                                            placeholder="Select amount"
                                            className="w-full"
                                        />
                                    </div>
                                )}

                                <div className="field col-12 md:col-4">
                                    <label className="font-semibold mb-2 block">Nausea</label>
                                    <Dropdown value={state.postProcedureSymptoms.nausea} onChange={(e) => updatePostProcedureSymptoms({ nausea: e.value })} options={yesNoOptions} placeholder="Select" className="w-full" />
                                </div>

                                <div className="field col-12 md:col-4">
                                    <label className="font-semibold mb-2 block">Vomiting</label>
                                    <Dropdown value={state.postProcedureSymptoms.vomiting} onChange={(e) => updatePostProcedureSymptoms({ vomiting: e.value })} options={yesNoOptions} placeholder="Select" className="w-full" />
                                </div>

                                <div className="field col-12 md:col-4">
                                    <label className="font-semibold mb-2 block">Fever</label>
                                    <Dropdown value={state.postProcedureSymptoms.fever} onChange={(e) => updatePostProcedureSymptoms({ fever: e.value })} options={yesNoOptions} placeholder="Select" className="w-full" />
                                </div>

                                <div className="field col-12 md:col-4">
                                    <label className="font-semibold mb-2 block">Dizziness</label>
                                    <Dropdown value={state.postProcedureSymptoms.dizziness} onChange={(e) => updatePostProcedureSymptoms({ dizziness: e.value })} options={yesNoOptions} placeholder="Select" className="w-full" />
                                </div>

                                <div className="field col-12 md:col-4">
                                    <label className="font-semibold mb-2 block">Swelling</label>
                                    <Dropdown value={state.postProcedureSymptoms.swelling} onChange={(e) => updatePostProcedureSymptoms({ swelling: e.value })} options={yesNoOptions} placeholder="Select" className="w-full" />
                                </div>

                                <div className="field col-12 md:col-4">
                                    <label className="font-semibold mb-2 block">Unusual Discharge</label>
                                    <Dropdown value={state.postProcedureSymptoms.discharge} onChange={(e) => updatePostProcedureSymptoms({ discharge: e.value })} options={yesNoOptions} placeholder="Select" className="w-full" />
                                </div>

                                {state.postProcedureSymptoms.discharge === 'Yes' && (
                                    <div className="field col-12 md:col-8">
                                        <label className="font-semibold mb-2 block">Discharge Description</label>
                                        <InputText value={state.postProcedureSymptoms.dischargeType} onChange={(e) => updatePostProcedureSymptoms({ dischargeType: e.target.value })} placeholder="Color, consistency, odor, amount" className="w-full" />
                                    </div>
                                )}
                            </div>
                        </AccordionTab>

                        <AccordionTab header="Additional Information">
                            <div className="formgrid grid">
                                <div className="field col-12">
                                    <label className="font-semibold mb-2 block">Other Symptoms</label>
                                    <InputTextarea
                                        rows={3}
                                        value={state.postProcedureSymptoms.otherSymptoms}
                                        onChange={(e) => updatePostProcedureSymptoms({ otherSymptoms: e.target.value })}
                                        placeholder="Any other symptoms not mentioned above..."
                                        className="w-full"
                                    />
                                </div>

                                <div className="field col-12 md:col-6">
                                    <label className="font-semibold mb-2 block">Symptoms Onset Date</label>
                                    <Calendar value={state.postProcedureSymptoms.symptomsOnset} onChange={(e) => updatePostProcedureSymptoms({ symptomsOnset: e.value as Date })} showIcon dateFormat="dd M yy" placeholder="When did symptoms start?" />
                                </div>

                                <div className="field col-12 md:col-6">
                                    <label className="font-semibold mb-2 block">Symptoms Resolution Date</label>
                                    <Calendar
                                        value={state.postProcedureSymptoms.symptomsResolution}
                                        onChange={(e) => updatePostProcedureSymptoms({ symptomsResolution: e.value as Date })}
                                        showIcon
                                        dateFormat="dd M yy"
                                        placeholder="When did symptoms resolve?"
                                    />
                                </div>
                            </div>
                        </AccordionTab>
                    </Accordion>
                </Card>
            </div>
        </div>
    );
};

export default PostProcedureSymptoms;
