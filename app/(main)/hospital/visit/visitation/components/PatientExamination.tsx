import { Card } from 'primereact/card';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { InputNumber } from 'primereact/inputnumber';
import { Tag } from 'primereact/tag';
import { RadioButton } from 'primereact/radiobutton';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputText } from 'primereact/inputtext';
import { usePatientVisitContext } from '@/libs/contextProviders/AppContexts';
import { useEffect } from 'react';
import { Appointment } from '@/types/hospital';
import { CRUDTYPE } from '@/types/enums/enums';

const PatientExamination = () => {
    const { state, setStateValue } = usePatientVisitContext();
    useEffect(() => {
        /*
        just so as not to override already set physical data after doctor examination,
        only set physical data from appointment data when it is doctor's first time of assessing this data.
         */
        if (state.crudType === CRUDTYPE.save) {
            const appointmentDetails: Appointment = JSON.parse(state.selectedAppointment.appointmentDetails as string);
            const vitalSigns = appointmentDetails.vitalSigns;
            const measurements = appointmentDetails.measurements;
            setStateValue({
                physicalExam: {
                    ...state.physicalExam,
                    weightKg: measurements.weight,
                    heightCm: measurements.height,
                    bmi: measurements.bmi,
                    bpDiastolic: vitalSigns.bloodPressureDiastolic,
                    bpSystolic: vitalSigns.bloodPressureSystolic,
                    pulse: vitalSigns.heartRate
                }
            });
        }
    }, []);
    return (
        <>
            <div className="grid p-fluid">
                <div className="col-12">
                    <Card className="shadow-2">
                        <div className="flex align-items-center mb-4">
                            <i className="pi pi-heart text-primary text-2xl mr-3" />
                            <h4 className="m-0 text-primary">Physical Examination</h4>
                        </div>

                        <Accordion multiple activeIndex={[0, 1]}>
                            <AccordionTab header="Vital Signs & Measurements" headerClassName="font-bold">
                                <div className="formgrid grid">
                                    <div className="field col-6 md:col-3">
                                        <label className="font-semibold mb-2 block">Weight (kg)</label>
                                        <InputNumber
                                            value={state.physicalExam.weightKg}
                                            onValueChange={(e) =>
                                                setStateValue({
                                                    physicalExam: { ...state.physicalExam, weightKg: e.value }
                                                })
                                            }
                                            minFractionDigits={1}
                                            maxFractionDigits={1}
                                            min={30}
                                            max={200}
                                            placeholder="0.0"
                                        />
                                    </div>

                                    <div className="field col-6 md:col-3">
                                        <label className="font-semibold mb-2 block">Height (cm)</label>
                                        <InputNumber
                                            value={state.physicalExam.heightCm}
                                            onValueChange={(e) =>
                                                setStateValue({
                                                    physicalExam: { ...state.physicalExam, heightCm: e.value }
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
                                        <div className="flex align-items-center">
                                            <InputNumber value={state.physicalExam.bmi} disabled minFractionDigits={1} maxFractionDigits={1} className="flex-1" />
                                            {state.physicalExam.bmi && (
                                                <Tag
                                                    value={state.physicalExam.bmi < 18.5 ? 'Underweight' : state.physicalExam.bmi < 25 ? 'Normal' : state.physicalExam.bmi < 30 ? 'Overweight' : 'Obese'}
                                                    severity={state.physicalExam.bmi < 18.5 ? 'info' : state.physicalExam.bmi < 25 ? 'success' : state.physicalExam.bmi < 30 ? 'warning' : 'danger'}
                                                    className="ml-2"
                                                />
                                            )}
                                        </div>
                                        <small className="text-500">Auto-calculated</small>
                                    </div>

                                    <div className="field col-6 md:col-3">
                                        <label className="font-semibold mb-2 block">Pulse (bpm)</label>
                                        <InputNumber
                                            value={state.physicalExam.pulse}
                                            onValueChange={(e) =>
                                                setStateValue({
                                                    physicalExam: { ...state.physicalExam, pulse: e.value }
                                                })
                                            }
                                            min={40}
                                            max={200}
                                            placeholder="0"
                                        />
                                        <small className="text-500">Normal: 60-100 bpm</small>
                                    </div>

                                    <div className="field col-6 md:col-3">
                                        <label className="font-semibold mb-2 block">BP Systolic (mmHg)</label>
                                        <InputNumber
                                            value={state.physicalExam.bpSystolic}
                                            onValueChange={(e) =>
                                                setStateValue({
                                                    physicalExam: { ...state.physicalExam, bpSystolic: e.value }
                                                })
                                            }
                                            min={70}
                                            max={250}
                                            placeholder="0"
                                        />
                                    </div>

                                    <div className="field col-6 md:col-3">
                                        <label className="font-semibold mb-2 block">BP Diastolic (mmHg)</label>
                                        <InputNumber
                                            value={state.physicalExam.bpDiastolic}
                                            onValueChange={(e) =>
                                                setStateValue({
                                                    physicalExam: { ...state.physicalExam, bpDiastolic: e.value }
                                                })
                                            }
                                            min={40}
                                            max={150}
                                            placeholder="0"
                                        />
                                    </div>

                                    <div className="field col-6 md:col-3">
                                        <div className="flex align-items-center">
                                            <div>
                                                <span className="font-semibold">Blood Pressure: </span>
                                                <Tag
                                                    value={state.physicalExam.bpSystolic && state.physicalExam.bpDiastolic ? `${state.physicalExam.bpSystolic}/${state.physicalExam.bpDiastolic}` : '--/--'}
                                                    severity={state.physicalExam.bpSystolic && state.physicalExam.bpSystolic > 140 ? 'danger' : state.physicalExam.bpSystolic && state.physicalExam.bpSystolic > 130 ? 'warning' : 'success'}
                                                />
                                            </div>
                                        </div>
                                        <small className="text-500">Normal: 120/80 mmHg</small>
                                    </div>
                                </div>
                            </AccordionTab>

                            <AccordionTab header="System Examination" headerClassName="font-bold">
                                <div className="formgrid grid">
                                    <div className="field col-12 md:col-6">
                                        <label className="font-semibold mb-2 block">Hirsutism (Excess hair growth)</label>
                                        <div className="flex flex-wrap gap-3">
                                            <div className="flex align-items-center">
                                                <RadioButton
                                                    inputId="hirsutismYes"
                                                    name="hirsutism"
                                                    value="Yes"
                                                    onChange={(e) =>
                                                        setStateValue({
                                                            physicalExam: { ...state.physicalExam, hirsutism: e.value }
                                                        })
                                                    }
                                                    checked={state.physicalExam.hirsutism === 'Yes'}
                                                />
                                                <label htmlFor="hirsutismYes" className="ml-2">
                                                    Yes
                                                </label>
                                            </div>
                                            <div className="flex align-items-center">
                                                <RadioButton
                                                    inputId="hirsutismNo"
                                                    name="hirsutism"
                                                    value="No"
                                                    onChange={(e) =>
                                                        setStateValue({
                                                            physicalExam: { ...state.physicalExam, hirsutism: e.value }
                                                        })
                                                    }
                                                    checked={state.physicalExam.hirsutism === 'No'}
                                                />
                                                <label htmlFor="hirsutismNo" className="ml-2">
                                                    No
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="field col-12 md:col-6">
                                        <label className="font-semibold mb-2 block">Thyroid Status</label>
                                        <Dropdown
                                            value={state.physicalExam.thyroid}
                                            onChange={(e) =>
                                                setStateValue({
                                                    physicalExam: { ...state.physicalExam, thyroid: e.value }
                                                })
                                            }
                                            options={[
                                                { label: 'Normal', value: 'Normal' },
                                                { label: 'Enlarged', value: 'Enlarged' },
                                                { label: 'Nodular', value: 'Nodular' }
                                            ]}
                                            placeholder="Select thyroid status"
                                        />
                                    </div>

                                    <div className="field col-12 md:col-6">
                                        <label className="font-semibold mb-2 block">Breast Examination</label>
                                        <InputTextarea
                                            rows={3}
                                            value={state.physicalExam.breastFindings}
                                            onChange={(e) =>
                                                setStateValue({
                                                    physicalExam: { ...state.physicalExam, breastFindings: e.target.value }
                                                })
                                            }
                                            placeholder="Normal bilateral breasts / Describe any abnormal findings..."
                                        />
                                    </div>

                                    <div className="field col-12 md:col-6">
                                        <label className="font-semibold mb-2 block">Abdomen Examination</label>
                                        <InputTextarea
                                            rows={3}
                                            value={state.physicalExam.abdomenFindings}
                                            onChange={(e) =>
                                                setStateValue({
                                                    physicalExam: { ...state.physicalExam, abdomenFindings: e.target.value }
                                                })
                                            }
                                            placeholder="Soft, non-tender / Describe findings: distended, tender, masses..."
                                        />
                                    </div>

                                    <div className="field col-12 md:col-6">
                                        <label className="font-semibold mb-2 block">Uterine Size</label>
                                        <InputText
                                            value={state.physicalExam.uterineSize}
                                            onChange={(e) =>
                                                setStateValue({
                                                    physicalExam: { ...state.physicalExam, uterineSize: e.target.value }
                                                })
                                            }
                                            placeholder="e.g., Normal size, 8-week size, Bulky..."
                                        />
                                    </div>
                                    <div className="field col-12 md:col-6">
                                        <label className="font-semibold mb-2 block">Ultra Sound</label>
                                        <InputText
                                            value={state.physicalExam.ultraSound}
                                            onChange={(e) =>
                                                setStateValue({
                                                    physicalExam: { ...state.physicalExam, ultraSound: e.target.value }
                                                })
                                            }
                                            placeholder="e.g., Normal; No masses; Homogeneous appearance"
                                        />
                                    </div>
                                </div>
                            </AccordionTab>
                        </Accordion>
                    </Card>
                </div>
            </div>
        </>
    );
};
export default PatientExamination;
