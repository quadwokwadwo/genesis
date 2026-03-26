import React from 'react';
import { Card } from 'primereact/card';
import { Panel } from 'primereact/panel';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { useProcedureContext } from '@/app/(main)/hospital/procedures/consultation/ProcedureConsultationContext';

const InformedConsent: React.FC = () => {
    const { state, updateInformedConsent } = useProcedureContext();

    const consentStatusOptions = [
        { label: 'Pending', value: 'Pending' },
        { label: 'Obtained', value: 'Obtained' },
        { label: 'Declined', value: 'Declined' }
    ];

    const yesNoOptions = [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' }
    ];

    return (
        <div className="grid">
            <div className="col-12">
                <Card className="shadow-2">
                    <div className="flex align-items-center mb-4">
                        <i className="pi pi-verified text-primary text-2xl mr-3" />
                        <div>
                            <h4 className="m-0 text-primary">Informed Consent</h4>
                            <p className="text-600 m-0">Document the consent process and patient understanding</p>
                        </div>
                    </div>

                    <div className="formgrid grid">
                        <div className="field col-12">
                            <Panel header="Consent Process Checklist" className="mb-4">
                                <div className="flex flex-column gap-3">
                                    <div className="flex align-items-center">
                                        <label className="font-medium">Procedure Explained to Patient:</label>
                                        <div className="ml-3">
                                            <Dropdown value={state.informedConsent.procedureExplained} onChange={(e) => updateInformedConsent({ procedureExplained: e.value })} options={yesNoOptions} placeholder="Select" className="w-auto" />
                                        </div>
                                    </div>

                                    <div className="flex align-items-center">
                                        <label className="font-medium">Risks and Complications Discussed:</label>
                                        <div className="ml-3">
                                            <Dropdown value={state.informedConsent.risksDiscussed} onChange={(e) => updateInformedConsent({ risksDiscussed: e.value })} options={yesNoOptions} placeholder="Select" className="w-auto" />
                                        </div>
                                    </div>

                                    <div className="flex align-items-center">
                                        <label className="font-medium">Alternative Treatments Discussed:</label>
                                        <div className="ml-3">
                                            <Dropdown value={state.informedConsent.alternativesDiscussed} onChange={(e) => updateInformedConsent({ alternativesDiscussed: e.value })} options={yesNoOptions} placeholder="Select" className="w-auto" />
                                        </div>
                                    </div>
                                </div>
                            </Panel>
                        </div>

                        <div className="field col-12">
                            <label className="font-semibold mb-2 block">Patient Questions & Concerns</label>
                            <InputTextarea
                                rows={4}
                                value={state.informedConsent.patientQuestions}
                                onChange={(e) => updateInformedConsent({ patientQuestions: e.target.value })}
                                placeholder="Document all questions asked by patient and answers provided..."
                                className="w-full"
                            />
                        </div>

                        <div className="field col-12 md:col-4">
                            <label className="font-semibold mb-2 block">Consent Status *</label>
                            <Dropdown value={state.informedConsent.consentStatus} onChange={(e) => updateInformedConsent({ consentStatus: e.value })} options={consentStatusOptions} placeholder="Select status" className="w-full" />
                        </div>

                        <div className="field col-12 md:col-4">
                            <label className="font-semibold mb-2 block">Consent Date</label>
                            <Calendar value={state.informedConsent.consentDate} onChange={(e) => updateInformedConsent({ consentDate: e.value as Date })} showIcon dateFormat="dd M yy" maxDate={new Date()} placeholder="Consent obtained on" />
                        </div>

                        <div className="field col-12 md:col-4">
                            <label className="font-semibold mb-2 block">Witness Name</label>
                            <InputText value={state.informedConsent.witnessName} onChange={(e) => updateInformedConsent({ witnessName: e.target.value })} placeholder="Witness to consent process" />
                        </div>

                        <div className="field col-12 md:col-6">
                            <label className="font-medium mb-2 block">Patient Signature:</label>
                            <Dropdown value={state.informedConsent.patientSignature} onChange={(e) => updateInformedConsent({ patientSignature: e.value })} options={yesNoOptions} placeholder="Select" className="w-full" />
                        </div>

                        <div className="field col-12 md:col-6">
                            <label className="font-medium mb-2 block">Doctor Signature:</label>
                            <Dropdown value={state.informedConsent.doctorSignature} onChange={(e) => updateInformedConsent({ doctorSignature: e.value })} options={yesNoOptions} placeholder="Select" className="w-full" />
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default InformedConsent;
