import { Card } from 'primereact/card';
import { Panel } from 'primereact/panel';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { usePatientVisitContext } from '@/libs/contextProviders/AppContexts';
import { FilterSelect } from '@/libs/components/UtilComponents';

const Assessment = () => {
    const { state, setStateValue, addNewItem, removeItem } = usePatientVisitContext();
    return (
        <>
            <div className="grid p-fluid">
                <div className="col-12">
                    <Card className="shadow-2">
                        <div className="flex align-items-center mb-4">
                            <i className="pi pi-file-edit text-primary text-2xl mr-3" />
                            <h4 className="m-0 text-primary">Clinical Assessment</h4>
                        </div>

                        <div className="formgrid grid">
                            <div className="field col-12">
                                <Panel header="Diagnoses" className="mb-4">
                                    <div className="mb-3">
                                        <Button
                                            label="Add Diagnosis"
                                            icon="pi pi-plus"
                                            onClick={() =>
                                                addNewItem('diagnoses', {
                                                    code: '',
                                                    description: '',
                                                    type: 'Primary' as const
                                                })
                                            }
                                            className="p-button-outlined w-fit"
                                        />
                                    </div>

                                    {state.diagnoses.map((diagnosis, index) => (
                                        <Panel key={index} header={`Diagnosis ${index + 1}`} className="mb-2" toggleable>
                                            <div className="formgrid grid">
                                                <div className="field col-12 md:col-3">
                                                    <label>Type</label>
                                                    <Dropdown
                                                        value={diagnosis.type}
                                                        onChange={(e) => {
                                                            const updated = [...state.diagnoses];
                                                            updated[index].type = e.value;
                                                            setStateValue({ diagnoses: updated });
                                                        }}
                                                        options={[
                                                            { label: 'Primary', value: 'Primary' },
                                                            { label: 'Secondary', value: 'Secondary' },
                                                            { label: 'Differential', value: 'Differential' }
                                                        ]}
                                                    />
                                                </div>
                                                <div className="field col12 md:col-3">
                                                    <FilterSelect
                                                        selectableOptions={state.ICD11Codes}
                                                        onSelectChange={(e) => {
                                                            const updated = [...state.diagnoses];
                                                            updated[index].code = e.value.name;
                                                            setStateValue({ diagnoses: updated });
                                                        }}
                                                        elementId="icdCodes"
                                                        defaultValue="Select Diagnosis"
                                                        selectedOption={{ name: diagnosis.code, code: diagnosis.code }}
                                                    />
                                                </div>
                                                <div className="field col-12 md:col-6">
                                                    <label>Description</label>
                                                    <InputTextarea
                                                        rows={2}
                                                        value={diagnosis.description}
                                                        onChange={(e) => {
                                                            const updated = [...state.diagnoses];
                                                            updated[index].description = e.target.value;
                                                            setStateValue({ diagnoses: updated });
                                                        }}
                                                        placeholder="Detailed diagnosis description..."
                                                    />
                                                </div>
                                                <div className="field col-12">
                                                    <Button icon="pi pi-trash" className="p-button-danger p-button-outlined p-button-sm w-fit" onClick={() => removeItem('diagnoses', index)} label="Remove" />
                                                </div>
                                            </div>
                                        </Panel>
                                    ))}

                                    {state.diagnoses.length === 0 && (
                                        <div className="text-center p-4 text-600">
                                            <i className="pi pi-info-circle text-2xl mb-2" />
                                            <p>No diagnoses added yet. Click to Add Diagnosis to start.</p>
                                        </div>
                                    )}
                                </Panel>
                            </div>

                            <div className="field col-12">
                                <Panel header="Treatment Plan">
                                    <label className="font-semibold mb-2 block">Comprehensive Treatment Plan</label>
                                    <InputTextarea
                                        rows={8}
                                        value={state.treatmentPlan.planText}
                                        onChange={(e) =>
                                            setStateValue({
                                                treatmentPlan: { ...state.treatmentPlan, planText: e.target.value }
                                            })
                                        }
                                        placeholder="Detailed treatment plan including:&#10;- Medications&#10;- Procedures&#10;- Lifestyle modifications&#10;- PatientExtra education&#10;- Follow-up schedule..."
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
export default Assessment;
