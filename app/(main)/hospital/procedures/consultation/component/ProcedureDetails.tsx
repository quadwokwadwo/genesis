import React from 'react';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Tag } from 'primereact/tag';
import { useProcedureContext } from '@/app/(main)/hospital/procedures/consultation/ProcedureConsultationContext';

const ProcedureDetails: React.FC = () => {
    const { state, updateProcedureDetails } = useProcedureContext();

    const procedureOptions = [
        { label: 'In Vitro Fertilization (IVF)', value: 'IVF' },
        { label: 'Intrauterine Insemination (IUI)', value: 'IUI' },
        { label: 'Intracytoplasmic Sperm Injection (ICSI)', value: 'ICSI' },
        { label: 'Egg Retrieval (Oocyte Collection)', value: 'Egg Retrieval' },
        { label: 'Embryo Transfer', value: 'Embryo Transfer' },
        { label: 'Hysteroscopy', value: 'Hysteroscopy' },
        { label: 'Laparoscopy', value: 'Laparoscopy' },
        { label: 'Hysterosalpingography (HSG)', value: 'HSG' },
        { label: 'Ovarian Drilling', value: 'Ovarian Drilling' },
        { label: 'Myomectomy', value: 'Myomectomy' },
        { label: 'Salpingectomy', value: 'Salpingectomy' }
    ];

    const riskLevelOptions = [
        { label: 'Low Risk', value: 'Low' },
        { label: 'Moderate Risk', value: 'Moderate' },
        { label: 'High Risk', value: 'High' }
    ];

    const anesthesiaOptions = [
        { label: 'Local Anesthesia', value: 'Local' },
        { label: 'Conscious Sedation', value: 'Conscious Sedation' },
        { label: 'General Anesthesia', value: 'General' },
        { label: 'Spinal/Epidural', value: 'Spinal' }
    ];

    const getRiskColor = (risk: string | null) => {
        switch (risk) {
            case 'Low':
                return 'success';
            case 'Moderate':
                return 'warning';
            case 'High':
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
                        <i className="pi pi-cog text-primary text-2xl mr-3" />
                        <div>
                            <h4 className="m-0 text-primary">Procedure Details</h4>
                            <p className="text-600 m-0">Define the procedure type and requirements</p>
                        </div>
                    </div>

                    <div className="formgrid grid">
                        <div className="field col-12 md:col-6">
                            <label className="font-semibold mb-2 block">
                                <i className="pi pi-cog mr-2 text-primary" />
                                Procedure Type *
                            </label>
                            <Dropdown value={state.procedureDetails.procedureType} onChange={(e) => updateProcedureDetails({ procedureType: e.value })} options={procedureOptions} placeholder="Select procedure type" className="w-full" filter />
                        </div>

                        <div className="field col-12 md:col-6">
                            <label className="font-semibold mb-2 block">
                                <i className="pi pi-exclamation-triangle mr-2 text-orange-500" />
                                Risk Level
                            </label>
                            <Dropdown value={state.procedureDetails.riskLevel} onChange={(e) => updateProcedureDetails({ riskLevel: e.value })} options={riskLevelOptions} placeholder="Select risk level" className="w-full" />
                            {state.procedureDetails.riskLevel && <Tag value={state.procedureDetails.riskLevel} severity={getRiskColor(state.procedureDetails.riskLevel)} className="mt-2" />}
                        </div>

                        <div className="field col-12">
                            <label className="font-semibold mb-2 block">
                                <i className="pi pi-file-edit mr-2 text-blue-500" />
                                Medical Indication *
                            </label>
                            <InputTextarea
                                rows={4}
                                value={state.procedureDetails.indication}
                                onChange={(e) => updateProcedureDetails({ indication: e.target.value })}
                                placeholder="Detailed medical indication for the procedure, patient's condition, previous treatments..."
                                className="w-full"
                            />
                        </div>

                        <div className="field col-12 md:col-4">
                            <label className="font-semibold mb-2 block">Scheduled Date</label>
                            <Calendar value={state.procedureDetails.scheduledDate} onChange={(e) => updateProcedureDetails({ scheduledDate: e.value as Date })} showIcon dateFormat="dd M yy" minDate={new Date()} placeholder="Select procedure date" />
                        </div>

                        <div className="field col-12 md:col-4">
                            <label className="font-semibold mb-2 block">Estimated Duration (minutes)</label>
                            <InputNumber value={state.procedureDetails.estimatedDuration} onValueChange={(e) => updateProcedureDetails({ estimatedDuration: e.value })} min={15} max={480} placeholder="Duration in minutes" />
                        </div>

                        <div className="field col-12 md:col-4">
                            <label className="font-semibold mb-2 block">Anesthesia Type</label>
                            <Dropdown value={state.procedureDetails.anesthesiaType} onChange={(e) => updateProcedureDetails({ anesthesiaType: e.value })} options={anesthesiaOptions} placeholder="Select anesthesia type" />
                        </div>

                        <div className="field col-12 md:col-6">
                            <label className="font-semibold mb-2 block">Performing Surgeon</label>
                            <InputText value={state.procedureDetails.surgeonName} onChange={(e) => updateProcedureDetails({ surgeonName: e.target.value })} placeholder="Dr. Name, Specialty" />
                        </div>

                        <div className="field col-12">
                            <label className="font-semibold mb-2 block">Special Instructions</label>
                            <InputTextarea
                                rows={3}
                                value={state.procedureDetails.specialInstructions}
                                onChange={(e) => updateProcedureDetails({ specialInstructions: e.target.value })}
                                placeholder="Any special considerations, equipment needed, patient positioning..."
                            />
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ProcedureDetails;
