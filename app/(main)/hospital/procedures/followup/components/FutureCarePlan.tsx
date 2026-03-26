import React from 'react';
import { Card } from 'primereact/card';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputText } from 'primereact/inputtext';
import { useFollowUpContext } from '@/app/(main)/hospital/procedures/followup/components/FollowUpProvider';

const FutureCarePlan: React.FC = () => {
    const { state, updateFutureCarePlan } = useFollowUpContext();

    const yesNoOptions = [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' }
    ];

    const followUpTypeOptions = [
        { label: 'Post-Procedure Review', value: 'Post-Procedure Review' },
        { label: 'Complication Assessment', value: 'Complication Assessment' },
        { label: 'Recovery Check', value: 'Recovery Check' },
        { label: 'Result Discussion', value: 'Result Discussion' },
        { label: 'Treatment Planning', value: 'Treatment Planning' },
        { label: 'Routine Follow-up', value: 'Routine Follow-up' }
    ];

    return (
        <div className="grid">
            <div className="col-12">
                <Card className="shadow-2">
                    <div className="flex align-items-center mb-4">
                        <i className="pi pi-calendar-plus text-primary text-2xl mr-3" />
                        <div>
                            <h4 className="m-0 text-primary">Future Care Plan</h4>
                            <p className="text-600 m-0">Plan ongoing care and follow-up requirements</p>
                        </div>
                    </div>

                    <Accordion multiple activeIndex={[0, 1, 2, 3]}>
                        <AccordionTab header="Follow-up Scheduling">
                            <div className="formgrid grid">
                                <div className="field col-12 md:col-6">
                                    <label className="font-semibold mb-2 block">Next Appointment Date</label>
                                    <Calendar
                                        value={state.futureCarePlan.nextAppointmentDate}
                                        onChange={(e) => updateFutureCarePlan({ nextAppointmentDate: e.value as Date })}
                                        showIcon
                                        dateFormat="dd M yy"
                                        minDate={new Date()}
                                        placeholder="Select next appointment date"
                                    />
                                </div>

                                <div className="field col-12 md:col-6">
                                    <label className="font-semibold mb-2 block">Next Appointment Type</label>
                                    <Dropdown
                                        value={state.futureCarePlan.nextAppointmentType}
                                        onChange={(e) => updateFutureCarePlan({ nextAppointmentType: e.value })}
                                        options={followUpTypeOptions}
                                        placeholder="Select appointment type"
                                        className="w-full"
                                    />
                                </div>

                                <div className="field col-12">
                                    <label className="font-semibold mb-2 block">Monitoring Frequency</label>
                                    <InputText value={state.futureCarePlan.monitoringFrequency} onChange={(e) => updateFutureCarePlan({ monitoringFrequency: e.target.value })} placeholder="e.g., Weekly for 4 weeks, then monthly" className="w-full" />
                                </div>

                                <div className="field col-12">
                                    <label className="font-semibold mb-2 block">Expected Recovery Milestones</label>
                                    <InputTextarea
                                        rows={4}
                                        value={state.futureCarePlan.expectedMilestones}
                                        onChange={(e) => updateFutureCarePlan({ expectedMilestones: e.target.value })}
                                        placeholder="Timeline of expected recovery milestones and key indicators to monitor..."
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </AccordionTab>

                        <AccordionTab header="PatientExtra Education & Instructions">
                            <div className="formgrid grid">
                                <div className="field col-12">
                                    <label className="font-semibold mb-2 block">Warning Signs Education *</label>
                                    <InputTextarea
                                        rows={4}
                                        value={state.futureCarePlan.warningSignsEducation}
                                        onChange={(e) => updateFutureCarePlan({ warningSignsEducation: e.target.value })}
                                        placeholder="Signs and symptoms that require immediate medical attention..."
                                        className="w-full"
                                    />
                                </div>

                                <div className="field col-12">
                                    <label className="font-semibold mb-2 block">Lifestyle Recommendations</label>
                                    <InputTextarea
                                        rows={4}
                                        value={state.futureCarePlan.lifestyleRecommendations}
                                        onChange={(e) => updateFutureCarePlan({ lifestyleRecommendations: e.target.value })}
                                        placeholder="Diet, exercise, activity restrictions, work limitations..."
                                        className="w-full"
                                    />
                                </div>

                                <div className="field col-12">
                                    <label className="font-semibold mb-2 block">PatientExtra Education Provided</label>
                                    <InputTextarea
                                        rows={3}
                                        value={state.futureCarePlan.patientEducationProvided}
                                        onChange={(e) => updateFutureCarePlan({ patientEducationProvided: e.target.value })}
                                        placeholder="Educational materials provided, topics discussed, patient understanding confirmed..."
                                        className="w-full"
                                    />
                                </div>

                                <div className="field col-12">
                                    <label className="font-semibold mb-2 block">Emergency Contact Instructions *</label>
                                    <InputTextarea
                                        rows={3}
                                        value={state.futureCarePlan.emergencyContactInstructions}
                                        onChange={(e) => updateFutureCarePlan({ emergencyContactInstructions: e.target.value })}
                                        placeholder="When to call, who to contact, emergency numbers, after-hours procedures..."
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </AccordionTab>

                        <AccordionTab header="Medication & Treatment Changes">
                            <div className="formgrid grid">
                                <div className="field col-12">
                                    <label className="font-semibold mb-2 block">Medication Changes</label>
                                    <InputTextarea
                                        rows={4}
                                        value={state.futureCarePlan.medicationChanges}
                                        onChange={(e) => updateFutureCarePlan({ medicationChanges: e.target.value })}
                                        placeholder="New medications prescribed, dosage changes, medications discontinued..."
                                        className="w-full"
                                    />
                                </div>

                                <div className="field col-12 md:col-6">
                                    <label className="font-semibold mb-2 block">Additional Tests Required</label>
                                    <Dropdown value={state.futureCarePlan.additionalTestsRequired} onChange={(e) => updateFutureCarePlan({ additionalTestsRequired: e.value })} options={yesNoOptions} placeholder="Select" className="w-full" />
                                </div>

                                <div className="field col-12 md:col-6">
                                    <label className="font-semibold mb-2 block">Referrals Required</label>
                                    <Dropdown value={state.futureCarePlan.referralsRequired} onChange={(e) => updateFutureCarePlan({ referralsRequired: e.value })} options={yesNoOptions} placeholder="Select" className="w-full" />
                                </div>

                                {state.futureCarePlan.additionalTestsRequired === 'Yes' && (
                                    <div className="field col-12">
                                        <label className="font-semibold mb-2 block">Test Details</label>
                                        <InputTextarea
                                            rows={3}
                                            value={state.futureCarePlan.testsDetails}
                                            onChange={(e) => updateFutureCarePlan({ testsDetails: e.target.value })}
                                            placeholder="Specific tests required, timeline, special instructions..."
                                            className="w-full"
                                        />
                                    </div>
                                )}

                                {state.futureCarePlan.referralsRequired === 'Yes' && (
                                    <div className="field col-12">
                                        <label className="font-semibold mb-2 block">Referral Details</label>
                                        <InputTextarea
                                            rows={3}
                                            value={state.futureCarePlan.referralDetails}
                                            onChange={(e) => updateFutureCarePlan({ referralDetails: e.target.value })}
                                            placeholder="Specialist referrals, other departments, external consultations..."
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

export default FutureCarePlan;
