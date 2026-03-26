import { usePatientVisitContext } from '@/libs/contextProviders/AppContexts';
import { Card } from 'primereact/card';
import { InputTextarea } from 'primereact/inputtextarea';
import { Panel } from 'primereact/panel';
import { Checkbox } from 'primereact/checkbox';

const ChiefComplaint = () => {
    const { state, setStateValue } = usePatientVisitContext();

    return (
        <>
            <div className="grid">
                <div className="col-12">
                    <Card className="shadow-2">
                        <div className="flex align-items-center mb-4">
                            <i className="pi pi-comments text-primary text-2xl mr-3" />
                            <div>
                                <h4 className="m-0 text-primary">Chief Complaint</h4>
                                <p className="text-600 m-0">What brings the patient to the clinic today?</p>
                            </div>
                        </div>

                        <div className="formgrid grid">
                            <div className="field col-12 md:col-6">
                                <Panel header="Common Complaints" className="h-full">
                                    <div className="flex flex-column gap-3">
                                        <div className="flex align-items-center">
                                            <Checkbox
                                                inputId="infertility"
                                                checked={state.chiefComplaintChecks.infertility}
                                                onChange={(e) =>
                                                    setStateValue({
                                                        chiefComplaintChecks: {
                                                            ...state.chiefComplaintChecks,
                                                            infertility: e.checked || false
                                                        }
                                                    })
                                                }
                                            />
                                            <label htmlFor="infertility" className="ml-2 text-lg">
                                                <i className="pi pi-heart mr-2 text-pink-500" />
                                                Infertility
                                            </label>
                                        </div>

                                        <div className="flex align-items-center">
                                            <Checkbox
                                                inputId="anc"
                                                checked={state.chiefComplaintChecks.anc}
                                                onChange={(e) =>
                                                    setStateValue({
                                                        chiefComplaintChecks: {
                                                            ...state.chiefComplaintChecks,
                                                            anc: e.checked || false
                                                        }
                                                    })
                                                }
                                            />
                                            <label htmlFor="anc" className="ml-2 text-lg">
                                                <i className="pi pi-user mr-2 text-green-500" />
                                                ANC (Antenatal Care)
                                            </label>
                                        </div>
                                    </div>
                                </Panel>
                            </div>

                            <div className="field col-12 md:col-6">
                                <Panel header="Additional Details" className="h-full">
                                    <label htmlFor="chiefComplaint" className="font-semibold mb-2 block">
                                        Detailed Description
                                    </label>
                                    <InputTextarea
                                        id="chiefComplaint"
                                        rows={6}
                                        value={state.chiefComplaintChecks.chiefComplaint}
                                        onChange={(e) =>
                                            setStateValue({
                                                chiefComplaintChecks: { ...state.chiefComplaintChecks, chiefComplaint: e.target.value }
                                            })
                                        }
                                        placeholder="Describe symptoms, duration, severity, associated factors..."
                                        className="w-full"
                                    />
                                </Panel>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </>
    );
};
export default ChiefComplaint;
