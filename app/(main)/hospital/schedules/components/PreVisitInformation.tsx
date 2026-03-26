import { usePatientScheduleContext } from '@/libs/contextProviders/AppContexts';
import { Card } from 'primereact/card';
import { TabPanel, TabView } from 'primereact/tabview';
import { Panel } from 'primereact/panel';
import { InputNumber } from 'primereact/inputnumber';
import { Tag } from 'primereact/tag';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { InputText } from 'primereact/inputtext';
import { RadioButton } from 'primereact/radiobutton';

const PreVisitInformation = () => {
    const { state, setStateValue } = usePatientScheduleContext();
    return (
        <>
            <Card className="shadow-2">
                <div className="flex align-items-center mb-4">
                    <i className="pi pi-file-edit text-primary text-2xl mr-3" />
                    <div>
                        <h4 className="m-0 text-primary">Pre-Visit Information</h4>
                        <p className="text-600 m-0">Collect vital signs and pre-visit details</p>
                    </div>
                </div>

                <TabView>
                    <TabPanel header="Vital Signs" leftIcon="pi pi-heart">
                        <div className="grid">
                            <div className="col-12 md:col-6">
                                <Panel header="Basic Vitals" className="h-full">
                                    <div className="formgrid grid">
                                        <div className="field col-6">
                                            <label>Temperature (°C)</label>
                                            <InputNumber
                                                value={state.appointment.vitalSigns.temperature}
                                                onValueChange={(e) =>
                                                    setStateValue({
                                                        appointment: {
                                                            ...state.appointment,
                                                            vitalSigns: { ...state.appointment.vitalSigns, temperature: e.value }
                                                        }
                                                    })
                                                }
                                                minFractionDigits={1}
                                                maxFractionDigits={1}
                                                min={35}
                                                max={42}
                                                placeholder="36.5"
                                            />
                                            <small className="text-500">Normal: 36.5-37.2°C</small>
                                        </div>

                                        <div className="field col-6">
                                            <label>Heart Rate (bpm)</label>
                                            <InputNumber
                                                value={state.appointment.vitalSigns.heartRate}
                                                onValueChange={(e) =>
                                                    setStateValue({
                                                        appointment: {
                                                            ...state.appointment,
                                                            vitalSigns: { ...state.appointment.vitalSigns, heartRate: e.value }
                                                        }
                                                    })
                                                }
                                                min={30}
                                                max={200}
                                                placeholder="72"
                                            />
                                            <small className="text-500">Normal: 60-100 bpm</small>
                                        </div>

                                        <div className="field col-6">
                                            <label>BP Systolic (mmHg)</label>
                                            <InputNumber
                                                value={state.appointment.vitalSigns.bloodPressureSystolic}
                                                onValueChange={(e) =>
                                                    setStateValue({
                                                        appointment: {
                                                            ...state.appointment,
                                                            vitalSigns: { ...state.appointment.vitalSigns, bloodPressureSystolic: e.value }
                                                        }
                                                    })
                                                }
                                                min={70}
                                                max={250}
                                                placeholder="120"
                                            />
                                        </div>

                                        <div className="field col-6">
                                            <label>BP Diastolic (mmHg)</label>
                                            <InputNumber
                                                value={state.appointment.vitalSigns.bloodPressureDiastolic}
                                                onValueChange={(e) =>
                                                    setStateValue({
                                                        appointment: {
                                                            ...state.appointment,
                                                            vitalSigns: { ...state.appointment.vitalSigns, bloodPressureDiastolic: e.value }
                                                        }
                                                    })
                                                }
                                                min={40}
                                                max={150}
                                                placeholder="80"
                                            />
                                        </div>

                                        <div className="field col-6">
                                            <label>Respiratory Rate (/min)</label>
                                            <InputNumber
                                                value={state.appointment.vitalSigns.respiratoryRate}
                                                onValueChange={(e) =>
                                                    setStateValue({
                                                        appointment: {
                                                            ...state.appointment,
                                                            vitalSigns: { ...state.appointment.vitalSigns, respiratoryRate: e.value }
                                                        }
                                                    })
                                                }
                                                min={8}
                                                max={40}
                                                placeholder="16"
                                            />
                                            <small className="text-500">Normal: 12-20 /min</small>
                                        </div>

                                        <div className="field col-6">
                                            <label>O2 Saturation (%)</label>
                                            <InputNumber
                                                value={state.appointment.vitalSigns.oxygenSaturation}
                                                onValueChange={(e) =>
                                                    setStateValue({
                                                        appointment: {
                                                            ...state.appointment,
                                                            vitalSigns: { ...state.appointment.vitalSigns, oxygenSaturation: e.value }
                                                        }
                                                    })
                                                }
                                                min={70}
                                                max={100}
                                                placeholder="98"
                                            />
                                            <small className="text-500">Normal: `&gt;`95%</small>
                                        </div>

                                        <div className="field col-12">
                                            <label>Pain Scale (0-10)</label>
                                            <div className="flex align-items-center gap-2">
                                                <InputNumber
                                                    value={state.appointment.vitalSigns.painScale}
                                                    onValueChange={(e) =>
                                                        setStateValue({
                                                            appointment: {
                                                                ...state.appointment,
                                                                vitalSigns: { ...state.appointment.vitalSigns, painScale: e.value }
                                                            }
                                                        })
                                                    }
                                                    min={0}
                                                    max={10}
                                                    placeholder="0"
                                                />
                                                <small className="text-500">0 = No pain, 10 = Severe pain</small>
                                            </div>
                                        </div>
                                    </div>
                                </Panel>
                            </div>

                            <div className="col-12 md:col-6">
                                <Panel header="Measurements" className="h-full">
                                    <div className="formgrid grid">
                                        <div className="field col-6">
                                            <label>Height (cm)</label>
                                            <InputNumber
                                                value={state.appointment.measurements.height}
                                                onValueChange={(e) =>
                                                    setStateValue({
                                                        appointment: {
                                                            ...state.appointment,
                                                            measurements: { ...state.appointment.measurements, height: e.value }
                                                        }
                                                    })
                                                }
                                                minFractionDigits={1}
                                                maxFractionDigits={1}
                                                min={100}
                                                max={220}
                                                placeholder="165.0"
                                            />
                                        </div>

                                        <div className="field col-6">
                                            <label>Weight (kg)</label>
                                            <InputNumber
                                                value={state.appointment.measurements.weight}
                                                onValueChange={(e) =>
                                                    setStateValue({
                                                        appointment: {
                                                            ...state.appointment,
                                                            measurements: { ...state.appointment.measurements, weight: e.value }
                                                        }
                                                    })
                                                }
                                                minFractionDigits={1}
                                                maxFractionDigits={1}
                                                min={20}
                                                max={300}
                                                placeholder="65.0"
                                            />
                                        </div>

                                        <div className="field col-12">
                                            <label>BMI</label>
                                            <div className="flex align-items-center gap-2">
                                                <InputNumber value={state.appointment.measurements.bmi} disabled minFractionDigits={1} maxFractionDigits={1} />
                                                {state.appointment.measurements.bmi && (
                                                    <Tag
                                                        value={state.appointment.measurements.bmi < 18.5 ? 'Underweight' : state.appointment.measurements.bmi < 25 ? 'Normal' : state.appointment.measurements.bmi < 30 ? 'Overweight' : 'Obese'}
                                                        severity={state.appointment.measurements.bmi < 18.5 ? 'info' : state.appointment.measurements.bmi < 25 ? 'success' : state.appointment.measurements.bmi < 30 ? 'warning' : 'danger'}
                                                    />
                                                )}
                                            </div>
                                            <small className="text-500">Auto-calculated from height and weight</small>
                                        </div>

                                        <div className="field col-12">
                                            <label>Waist Circumference (cm)</label>
                                            <InputNumber
                                                value={state.appointment.measurements.waistCircumference}
                                                onValueChange={(e) =>
                                                    setStateValue({
                                                        appointment: {
                                                            ...state.appointment,
                                                            measurements: { ...state.appointment.measurements, waistCircumference: e.value }
                                                        }
                                                    })
                                                }
                                                min={50}
                                                max={150}
                                                placeholder="80"
                                            />
                                            <small className="text-500">Optional measurement</small>
                                        </div>
                                    </div>
                                </Panel>
                            </div>
                        </div>
                    </TabPanel>
                </TabView>
            </Card>
        </>
    );
};
export default PreVisitInformation;
