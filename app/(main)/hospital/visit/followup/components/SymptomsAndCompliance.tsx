import { TabPanel, TabView } from 'primereact/tabview';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Rating } from 'primereact/rating';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { RadioButton } from 'primereact/radiobutton';
import { Checkbox } from 'primereact/checkbox';
import { Card } from 'primereact/card';
import { useFollowupContext } from '@/libs/contextProviders/AppContexts';

const SymptomsAndCompliance = () => {
    const { state, setStateValue } = useFollowupContext();
    const getImprovementSeverity = (improvement: string) => {
        switch (improvement) {
            case 'Much Better':
                return 'success';
            case 'Better':
                return 'success';
            case 'Same':
                return 'info';
            case 'Worse':
                return 'warning';
            case 'Much Worse':
                return 'danger';
            default:
                return 'info';
        }
    };
    return (
        <>
            <Card className="shadow-2">
                <div className="flex align-items-center mb-4">
                    <i className="pi pi-comments text-primary text-2xl mr-3" />
                    <div>
                        <h4 className="m-0 text-primary">Current Symptoms & Treatment Compliance</h4>
                        <p className="text-600 m-0">Assess current status and treatment response</p>
                    </div>
                </div>

                <TabView>
                    <TabPanel header="Current Symptoms" leftIcon="pi pi-comments">
                        <div className="formgrid grid">
                            <div className="field col-12">
                                <label className="font-semibold mb-2 block">Presenting Complaint Today</label>
                                <InputTextarea
                                    value={state.currentSymptoms.presenting}
                                    onChange={(e) =>
                                        setStateValue({
                                            currentSymptoms: { ...state.currentSymptoms, presenting: e.target.value }
                                        })
                                    }
                                    rows={3}
                                    placeholder="What brings the patient back today? Any ongoing or new complaints..."
                                    className="w-full"
                                />
                            </div>

                            <div className="field col-12 md:col-6">
                                <label className="font-semibold mb-2 block">Duration of Current Symptoms</label>
                                <InputText
                                    value={state.currentSymptoms.duration}
                                    onChange={(e) =>
                                        setStateValue({
                                            currentSymptoms: { ...state.currentSymptoms, duration: e.target.value }
                                        })
                                    }
                                    placeholder="e.g., 2 weeks, since last visit, ongoing..."
                                    className="w-full"
                                />
                            </div>

                            <div className="field col-12 md:col-6">
                                <label className="font-semibold mb-2 block">Symptom Severity (1-10 scale)</label>
                                <div className="flex align-items-center gap-3">
                                    <InputNumber
                                        value={state.currentSymptoms.severity}
                                        onValueChange={(e) =>
                                            setStateValue({
                                                currentSymptoms: { ...state.currentSymptoms, severity: e.value || 5 }
                                            })
                                        }
                                        min={1}
                                        max={10}
                                        className="w-fit"
                                    />
                                    <Rating
                                        value={state.currentSymptoms.severity}
                                        onChange={(e) =>
                                            setStateValue({
                                                currentSymptoms: { ...state.currentSymptoms, severity: e.value || 5 }
                                            })
                                        }
                                        stars={10}
                                        cancel={false}
                                    />
                                </div>
                                <small className="text-500">1 = Minimal, 10 = Severe</small>
                            </div>

                            <div className="field col-12 md:col-6">
                                <label className="font-semibold mb-2 block">Overall Improvement Since Last Visit</label>
                                <Dropdown
                                    value={state.currentSymptoms.improvement}
                                    onChange={(e) =>
                                        setStateValue({
                                            currentSymptoms: { ...state.currentSymptoms, improvement: e.value }
                                        })
                                    }
                                    options={[
                                        { label: 'Much Better', value: 'Much Better' },
                                        { label: 'Better', value: 'Better' },
                                        { label: 'Same', value: 'Same' },
                                        { label: 'Worse', value: 'Worse' },
                                        { label: 'Much Worse', value: 'Much Worse' }
                                    ]}
                                    placeholder="Select improvement level"
                                    className="w-full"
                                />
                                {state.currentSymptoms.improvement && <Tag value={state.currentSymptoms.improvement} severity={getImprovementSeverity(state.currentSymptoms.improvement)} className="mt-2" />}
                            </div>

                            <div className="field col-12 md:col-6">
                                <label className="font-semibold mb-2 block">New Symptoms</label>
                                <InputTextarea
                                    value={state.currentSymptoms.newSymptoms}
                                    onChange={(e) =>
                                        setStateValue({
                                            currentSymptoms: { ...state.currentSymptoms, newSymptoms: e.target.value }
                                        })
                                    }
                                    rows={3}
                                    placeholder="Any new symptoms since last visit..."
                                    className="w-full"
                                />
                            </div>

                            <div className="field col-12">
                                <label className="font-semibold mb-2 block">Side Effects or Adverse Reactions</label>
                                <InputTextarea
                                    value={state.currentSymptoms.sideEffects}
                                    onChange={(e) =>
                                        setStateValue({
                                            currentSymptoms: { ...state.currentSymptoms, sideEffects: e.target.value }
                                        })
                                    }
                                    rows={2}
                                    placeholder="Any side effects from medications or treatments..."
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </TabPanel>

                    <TabPanel header="Treatment Compliance" leftIcon="pi pi-check">
                        <div className="formgrid grid">
                            <div className="field col-12 md:col-6">
                                <label className="font-semibold mb-2 block">Medication Compliance</label>
                                <Dropdown
                                    value={state.treatmentCompliance.medicationCompliance}
                                    onChange={(e) =>
                                        setStateValue({
                                            treatmentCompliance: { ...state.treatmentCompliance, medicationCompliance: e.value }
                                        })
                                    }
                                    options={[
                                        { label: 'Excellent (95-100%)', value: 'Excellent' },
                                        { label: 'Good (80-94%)', value: 'Good' },
                                        { label: 'Fair (60-79%)', value: 'Fair' },
                                        { label: 'Poor (<60%)', value: 'Poor' }
                                    ]}
                                    placeholder="Select compliance level"
                                    className="w-full"
                                />
                            </div>

                            <div className="field col-12 md:col-6">
                                <label className="font-semibold mb-2 block">Missed Doses (per week)</label>
                                <InputNumber
                                    value={state.treatmentCompliance.missedDoses}
                                    onValueChange={(e) =>
                                        setStateValue({
                                            treatmentCompliance: { ...state.treatmentCompliance, missedDoses: e.value || 0 }
                                        })
                                    }
                                    min={0}
                                    max={21}
                                    placeholder="Number of missed doses"
                                    className="w-full"
                                />
                            </div>

                            <div className="field col-12">
                                <label className="font-semibold mb-2 block">Reason for Non-compliance</label>
                                <InputTextarea
                                    value={state.treatmentCompliance.reasonForNonCompliance}
                                    onChange={(e) =>
                                        setStateValue({
                                            treatmentCompliance: { ...state.treatmentCompliance, reasonForNonCompliance: e.target.value }
                                        })
                                    }
                                    rows={2}
                                    placeholder="If applicable, explain reasons for missing medications..."
                                    className="w-full"
                                />
                            </div>

                            <div className="field col-12 md:col-6">
                                <label className="font-semibold mb-2 block">Procedure Compliance</label>
                                <div className="flex flex-wrap gap-3">
                                    {['Yes', 'No', 'Partial'].map((option) => (
                                        <div key={option} className="flex align-items-center">
                                            <RadioButton
                                                inputId={`proc-${option}`}
                                                name="procedureCompliance"
                                                value={option}
                                                onChange={(e) =>
                                                    setStateValue({
                                                        treatmentCompliance: { ...state.treatmentCompliance, procedureCompliance: e.value }
                                                    })
                                                }
                                                checked={state.treatmentCompliance.procedureCompliance === option}
                                            />
                                            <label htmlFor={`proc-${option}`} className="ml-2">
                                                {option}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                <small className="text-500">Following prescribed procedures (diet, exercise, monitoring)</small>
                            </div>

                            <div className="field col-12">
                                <label className="font-semibold mb-3 block">Lifestyle Changes Implemented</label>
                                <div className="grid">
                                    {['Diet modifications', 'Regular exercise', 'Weight management', 'Stress reduction', 'Smoking cessation', 'Alcohol reduction', 'Sleep improvement', 'Supplement intake'].map((change, index) => (
                                        <div key={index} className="col-6 md:col-4">
                                            <div className="flex align-items-center">
                                                <Checkbox
                                                    inputId={`lifestyle-${index}`}
                                                    checked={state.treatmentCompliance.lifestyleChanges.includes(change)}
                                                    onChange={(e) => {
                                                        const changes = e.checked ? [...state.treatmentCompliance.lifestyleChanges, change] : state.treatmentCompliance.lifestyleChanges.filter((c) => c !== change);
                                                        setStateValue({
                                                            treatmentCompliance: { ...state.treatmentCompliance, lifestyleChanges: changes }
                                                        });
                                                    }}
                                                />
                                                <label htmlFor={`lifestyle-${index}`} className="ml-2 text-sm">
                                                    {change}
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </TabPanel>

                    <TabPanel header="Vital Signs" leftIcon="pi pi-heart">
                        <div className="formgrid grid">
                            <div className="field col-6 md:col-3">
                                <label className="font-semibold mb-2 block">Weight (kg)</label>
                                <InputNumber
                                    value={state.vitalSigns.weight}
                                    onValueChange={(e) =>
                                        setStateValue({
                                            vitalSigns: { ...state.vitalSigns, weight: e.value }
                                        })
                                    }
                                    minFractionDigits={1}
                                    maxFractionDigits={1}
                                    min={20}
                                    max={300}
                                    placeholder="0.0"
                                />
                            </div>

                            <div className="field col-6 md:col-3">
                                <label className="font-semibold mb-2 block">Height (cm)</label>
                                <InputNumber
                                    value={state.vitalSigns.height}
                                    onValueChange={(e) =>
                                        setStateValue({
                                            vitalSigns: { ...state.vitalSigns, height: e.value }
                                        })
                                    }
                                    minFractionDigits={1}
                                    maxFractionDigits={1}
                                    min={100}
                                    max={220}
                                    placeholder="0.0"
                                />
                            </div>

                            <div className="field col-6 md:col-3">
                                <label className="font-semibold mb-2 block">BMI</label>
                                <div className="flex align-items-center gap-2">
                                    <InputNumber value={state.vitalSigns.bmi} disabled minFractionDigits={1} maxFractionDigits={1} />
                                    {state.vitalSigns.bmi && (
                                        <Tag
                                            value={state.vitalSigns.bmi < 18.5 ? 'Underweight' : state.vitalSigns.bmi < 25 ? 'Normal' : state.vitalSigns.bmi < 30 ? 'Overweight' : 'Obese'}
                                            severity={state.vitalSigns.bmi < 18.5 ? 'info' : state.vitalSigns.bmi < 25 ? 'success' : state.vitalSigns.bmi < 30 ? 'warning' : 'danger'}
                                        />
                                    )}
                                </div>
                                <small className="text-500">Auto-calculated</small>
                            </div>

                            <div className="field col-6 md:col-3">
                                <label className="font-semibold mb-2 block">Blood Pressure</label>
                                <InputText
                                    value={state.vitalSigns.bloodPressure}
                                    onChange={(e) =>
                                        setStateValue({
                                            vitalSigns: { ...state.vitalSigns, bloodPressure: e.target.value }
                                        })
                                    }
                                    placeholder="120/80"
                                />
                            </div>

                            <div className="field col-6 md:col-3">
                                <label className="font-semibold mb-2 block">Pulse (bpm)</label>
                                <InputNumber
                                    value={state.vitalSigns.heartRate}
                                    onValueChange={(e) =>
                                        setStateValue({
                                            vitalSigns: { ...state.vitalSigns, heartRate: e.value }
                                        })
                                    }
                                    min={40}
                                    max={200}
                                    placeholder="72"
                                />
                            </div>

                            <div className="field col-6 md:col-3">
                                <label className="font-semibold mb-2 block">Temperature (°C)</label>
                                <InputNumber
                                    value={state.vitalSigns.temperature}
                                    onValueChange={(e) =>
                                        setStateValue({
                                            vitalSigns: { ...state.vitalSigns, temperature: e.value }
                                        })
                                    }
                                    minFractionDigits={1}
                                    maxFractionDigits={1}
                                    min={35}
                                    max={42}
                                    placeholder="36.5"
                                />
                            </div>

                            <div className="field col-6 md:col-3">
                                <label className="font-semibold mb-2 block">Respiratory Rate (/min)</label>
                                <InputNumber
                                    value={state.vitalSigns.respiratoryRate}
                                    onValueChange={(e) =>
                                        setStateValue({
                                            vitalSigns: { ...state.vitalSigns, respiratoryRate: e.value }
                                        })
                                    }
                                    min={8}
                                    max={40}
                                    placeholder="16"
                                />
                            </div>
                        </div>
                    </TabPanel>
                </TabView>
            </Card>
        </>
    );
};
export default SymptomsAndCompliance;
