import React from 'react';
import { Card } from 'primereact/card';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { useProcedureContext } from '@/app/(main)/hospital/procedures/consultation/ProcedureConsultationContext';

const PreProcedureAssessment: React.FC = () => {
    const { state, updatePreProcedureAssessment } = useProcedureContext();

    const yesNoOptions = [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' }
    ];

    const updateVitalSigns = (field: string, value: any) => {
        updatePreProcedureAssessment({
            vitalSigns: { ...state.preProcedureAssessment.vitalSigns, [field]: value }
        });
    };

    const updateLabResults = (field: string, value: any) => {
        updatePreProcedureAssessment({
            labResults: { ...state.preProcedureAssessment.labResults, [field]: value }
        });
    };

    return (
        <div className="grid">
            <div className="col-12">
                <Card className="shadow-2">
                    <div className="flex align-items-center mb-4">
                        <i className="pi pi-check-square text-primary text-2xl mr-3" />
                        <div>
                            <h4 className="m-0 text-primary">Pre-Procedure Assessment</h4>
                            <p className="text-600 m-0">Comprehensive medical evaluation before procedure</p>
                        </div>
                    </div>

                    <Accordion multiple activeIndex={[0, 1, 2]}>
                        <AccordionTab header="Medical History & Current Status">
                            <div className="formgrid grid">
                                <div className="field col-12 md:col-6">
                                    <label className="font-semibold mb-2 block">Relevant Medical History *</label>
                                    <InputTextarea
                                        rows={4}
                                        value={state.preProcedureAssessment.medicalHistory}
                                        onChange={(e) => updatePreProcedureAssessment({ medicalHistory: e.target.value })}
                                        placeholder="Previous medical conditions, chronic illnesses, fertility history..."
                                    />
                                </div>

                                <div className="field col-12 md:col-6">
                                    <label className="font-semibold mb-2 block">Current Medications</label>
                                    <InputTextarea
                                        rows={4}
                                        value={state.preProcedureAssessment.currentMedications}
                                        onChange={(e) => updatePreProcedureAssessment({ currentMedications: e.target.value })}
                                        placeholder="All current medications, supplements, hormonal treatments..."
                                    />
                                </div>

                                <div className="field col-12 md:col-6">
                                    <label className="font-semibold mb-2 block">Allergies</label>
                                    <InputTextarea
                                        rows={3}
                                        value={state.preProcedureAssessment.allergies}
                                        onChange={(e) => updatePreProcedureAssessment({ allergies: e.target.value })}
                                        placeholder="Drug allergies, latex, contrast agents, anesthesia reactions..."
                                    />
                                </div>

                                <div className="field col-12 md:col-6">
                                    <label className="font-semibold mb-2 block">Previous Surgeries</label>
                                    <InputTextarea
                                        rows={3}
                                        value={state.preProcedureAssessment.previousSurgeries}
                                        onChange={(e) => updatePreProcedureAssessment({ previousSurgeries: e.target.value })}
                                        placeholder="Previous surgeries with dates, complications..."
                                    />
                                </div>

                                <div className="field col-12 md:col-4">
                                    <label className="font-semibold mb-2 block">Last Menstrual Period</label>
                                    <Calendar
                                        value={state.preProcedureAssessment.lastMenstrualPeriod}
                                        onChange={(e) => updatePreProcedureAssessment({ lastMenstrualPeriod: e.value as Date })}
                                        showIcon
                                        dateFormat="dd M yy"
                                        maxDate={new Date()}
                                        placeholder="Select LMP date"
                                    />
                                </div>
                            </div>
                        </AccordionTab>

                        <AccordionTab header="Vital Signs & Physical Assessment">
                            <div className="formgrid grid">
                                <div className="field col-12 md:col-3">
                                    <label className="font-semibold mb-2 block">Blood Pressure</label>
                                    <InputText value={state.preProcedureAssessment.vitalSigns.bloodPressure} onChange={(e) => updateVitalSigns('bloodPressure', e.target.value)} placeholder="120/80 mmHg" />
                                </div>

                                <div className="field col-12 md:col-3">
                                    <label className="font-semibold mb-2 block">Heart Rate (bpm)</label>
                                    <InputNumber value={state.preProcedureAssessment.vitalSigns.heartRate} onValueChange={(e) => updateVitalSigns('heartRate', e.value)} min={40} max={200} placeholder="72" />
                                </div>

                                <div className="field col-12 md:col-3">
                                    <label className="font-semibold mb-2 block">Temperature (°C)</label>
                                    <InputNumber
                                        value={state.preProcedureAssessment.vitalSigns.temperature}
                                        onValueChange={(e) => updateVitalSigns('temperature', e.value)}
                                        min={35}
                                        max={42}
                                        minFractionDigits={1}
                                        maxFractionDigits={1}
                                        placeholder="36.5"
                                    />
                                </div>

                                <div className="field col-12 md:col-3">
                                    <label className="font-semibold mb-2 block">Weight (kg)</label>
                                    <InputNumber value={state.preProcedureAssessment.vitalSigns.weight} onValueChange={(e) => updateVitalSigns('weight', e.value)} min={30} max={200} minFractionDigits={1} maxFractionDigits={1} placeholder="65.0" />
                                </div>
                            </div>
                        </AccordionTab>

                        <AccordionTab header="Laboratory Results">
                            <div className="formgrid grid">
                                <div className="field col-12 md:col-4">
                                    <label className="font-semibold mb-2 block">Hemoglobin (g/dL)</label>
                                    <InputNumber
                                        value={state.preProcedureAssessment.labResults.hemoglobin}
                                        onValueChange={(e) => updateLabResults('hemoglobin', e.value)}
                                        min={5}
                                        max={20}
                                        minFractionDigits={1}
                                        maxFractionDigits={1}
                                        placeholder="12.5"
                                    />
                                </div>

                                <div className="field col-12 md:col-4">
                                    <label className="font-semibold mb-2 block">Platelets (×10³/μL)</label>
                                    <InputNumber value={state.preProcedureAssessment.labResults.platelets} onValueChange={(e) => updateLabResults('platelets', e.value)} min={50} max={1000} placeholder="250" />
                                </div>

                                <div className="field col-12 md:col-4">
                                    <label className="font-semibold mb-2 block">Blood Group</label>
                                    <InputText value={state.preProcedureAssessment.labResults.bloodGroup} onChange={(e) => updateLabResults('bloodGroup', e.target.value)} placeholder="A+, B-, O+, AB-" />
                                </div>

                                <div className="field col-12 md:col-3">
                                    <label className="font-semibold mb-2 block">Pregnancy Test</label>
                                    <Dropdown value={state.preProcedureAssessment.labResults.pregnancyTest} onChange={(e) => updateLabResults('pregnancyTest', e.value)} options={yesNoOptions} placeholder="Select result" />
                                </div>

                                <div className="field col-12 md:col-3">
                                    <label className="font-semibold mb-2 block">HIV Status</label>
                                    <Dropdown value={state.preProcedureAssessment.labResults.hiv} onChange={(e) => updateLabResults('hiv', e.value)} options={yesNoOptions} placeholder="Select result" />
                                </div>

                                <div className="field col-12 md:col-3">
                                    <label className="font-semibold mb-2 block">Hepatitis B</label>
                                    <Dropdown value={state.preProcedureAssessment.labResults.hepatitisB} onChange={(e) => updateLabResults('hepatitisB', e.value)} options={yesNoOptions} placeholder="Select result" />
                                </div>

                                <div className="field col-12 md:col-3">
                                    <label className="font-semibold mb-2 block">Hepatitis C</label>
                                    <Dropdown value={state.preProcedureAssessment.labResults.hepatitisC} onChange={(e) => updateLabResults('hepatitisC', e.value)} options={yesNoOptions} placeholder="Select result" />
                                </div>
                            </div>
                        </AccordionTab>
                    </Accordion>
                </Card>
            </div>
        </div>
    );
};

export default PreProcedureAssessment;
