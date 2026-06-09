import React, { useEffect, useRef, useState } from 'react';
import { Card } from 'primereact/card';
import { Panel } from 'primereact/panel';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
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

    // Module 16: lightweight HTML canvas signature pad. We push a PNG data URL
    // into context (state.informedConsent.signatureDataUrl) on every stroke
    // end; the consultation page converts it to a Blob and posts to
    // /api/uploads with purpose='consent-signature' on submit.
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [drawing, setDrawing] = useState(false);
    const [isEmpty, setIsEmpty] = useState(true);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#0f172a';
    }, []);

    const getPoint = (evt: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current!;
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in evt ? evt.touches[0]?.clientX ?? 0 : (evt as React.MouseEvent).clientX;
        const clientY = 'touches' in evt ? evt.touches[0]?.clientY ?? 0 : (evt as React.MouseEvent).clientY;
        return {
            x: ((clientX - rect.left) * canvas.width) / rect.width,
            y: ((clientY - rect.top) * canvas.height) / rect.height
        };
    };

    const handleStart = (evt: React.MouseEvent | React.TouchEvent) => {
        evt.preventDefault();
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        const p = getPoint(evt);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        setDrawing(true);
    };

    const handleMove = (evt: React.MouseEvent | React.TouchEvent) => {
        if (!drawing) return;
        evt.preventDefault();
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        const p = getPoint(evt);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        setIsEmpty(false);
    };

    const handleEnd = () => {
        if (!drawing) return;
        setDrawing(false);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dataUrl = canvas.toDataURL('image/png');
        updateInformedConsent({ signatureDataUrl: dataUrl });
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        setIsEmpty(true);
        updateInformedConsent({ signatureDataUrl: null });
    };

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

                        <div className="field col-12">
                            <Panel header="Patient Signature Capture" className="mt-3">
                                <p className="text-600 mb-2">Have the patient sign below. The image is uploaded securely on submit.</p>
                                <div className="border-1 border-300 border-round" style={{ background: '#fafafa', width: '100%' }}>
                                    <canvas
                                        ref={canvasRef}
                                        width={600}
                                        height={180}
                                        style={{ width: '100%', height: 180, touchAction: 'none', display: 'block' }}
                                        onMouseDown={handleStart}
                                        onMouseMove={handleMove}
                                        onMouseUp={handleEnd}
                                        onMouseLeave={handleEnd}
                                        onTouchStart={handleStart}
                                        onTouchMove={handleMove}
                                        onTouchEnd={handleEnd}
                                    />
                                </div>
                                <div className="flex justify-content-between align-items-center mt-2">
                                    <small className="text-500">{isEmpty ? 'Signature not captured yet.' : 'Signature captured.'}</small>
                                    <Button type="button" label="Clear" icon="pi pi-eraser" className="p-button-text p-button-sm" onClick={clearSignature} />
                                </div>
                            </Panel>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default InformedConsent;
