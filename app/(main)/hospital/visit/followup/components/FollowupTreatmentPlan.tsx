import { Card } from 'primereact/card';
import { TabPanel, TabView } from 'primereact/tabview';
import { Checkbox } from 'primereact/checkbox';
import { useFollowupContext } from '@/libs/contextProviders/AppContexts';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputText } from 'primereact/inputtext';

const FollowupTreatmentPlan = () => {
    const { state, setStateValue } = useFollowupContext();
    return (
        <>
            <Card className="shadow-2">
                <div className="flex align-items-center mb-4">
                    <i className="pi pi-check-circle text-primary text-2xl mr-3" />
                    <div>
                        <h4 className="m-0 text-primary">Treatment Plan & Follow-up</h4>
                        <p className="text-600 m-0">Plan next steps and schedule follow-up</p>
                    </div>
                </div>

                <TabView>
                    <TabPanel header="Treatment Adjustments" leftIcon="pi pi-cog">
                        <div className="formgrid grid">
                            <div className="field col-12">
                                <div className="flex align-items-center gap-2 mb-3">
                                    <Checkbox
                                        inputId="continueTreatment"
                                        checked={state.treatmentPlan.continueCurrentTreatment}
                                        onChange={(e) =>
                                            setStateValue({
                                                treatmentPlan: { ...state.treatmentPlan, continueCurrentTreatment: e.checked || false }
                                            })
                                        }
                                    />
                                    <label htmlFor="continueTreatment" className="font-semibold">
                                        Continue Current Treatment Protocol
                                    </label>
                                </div>
                            </div>

                            <div className="field col-12">
                                <label className="font-semibold mb-2 block">Medication Changes</label>
                                <InputTextarea
                                    value={state.treatmentPlan.medicationChanges}
                                    onChange={(e) =>
                                        setStateValue({
                                            treatmentPlan: { ...state.treatmentPlan, medicationChanges: e.target.value }
                                        })
                                    }
                                    rows={3}
                                    placeholder="Document any changes to existing medications (dosage adjustments, discontinuations, etc.)"
                                    className="w-full"
                                />
                            </div>

                            <div className="field col-12">
                                <label className="font-semibold mb-2 block">Dosage Adjustments</label>
                                <InputTextarea
                                    value={state.treatmentPlan.dosageAdjustments}
                                    onChange={(e) =>
                                        setStateValue({
                                            treatmentPlan: { ...state.treatmentPlan, dosageAdjustments: e.target.value }
                                        })
                                    }
                                    rows={2}
                                    placeholder="Specific dosage adjustments and rationale..."
                                    className="w-full"
                                />
                            </div>

                            <div className="field col-12">
                                <label className="font-semibold mb-2 block">New Medications to Add</label>
                                <InputTextarea
                                    value={state.treatmentPlan.newMedications.join('\n')}
                                    onChange={(e) =>
                                        setStateValue({
                                            treatmentPlan: {
                                                ...state.treatmentPlan,
                                                newMedications: e.target.value.split('\n').filter((med) => med.trim())
                                            }
                                        })
                                    }
                                    rows={3}
                                    placeholder="List new medications (one per line)&#10;e.g., Clomiphene 50mg OD for 5 days&#10;Metformin 500mg BD"
                                    className="w-full"
                                />
                            </div>

                            <div className="field col-12">
                                <label className="font-semibold mb-2 block">Specialist Referral</label>
                                <InputText
                                    value={state.treatmentPlan.specialistReferral}
                                    onChange={(e) =>
                                        setStateValue({
                                            treatmentPlan: { ...state.treatmentPlan, specialistReferral: e.target.value }
                                        })
                                    }
                                    placeholder="e.g., Refer to Reproductive Endocrinologist, Counselor, Nutritionist"
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </TabPanel>
                </TabView>
            </Card>
        </>
    );
};
export default FollowupTreatmentPlan;
