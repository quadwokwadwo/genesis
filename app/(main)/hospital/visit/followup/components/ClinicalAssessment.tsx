import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { InputTextarea } from 'primereact/inputtextarea';
import { Card } from 'primereact/card';
import { useFollowupContext } from '@/libs/contextProviders/AppContexts';

const ClinicalAssessment = () => {
    const { state, setStateValue } = useFollowupContext();
    return (
        <>
            <Card className="shadow-2">
                <div className="flex align-items-center mb-4">
                    <i className="pi pi-heart text-primary text-2xl mr-3" />
                    <div>
                        <h4 className="m-0 text-primary">Clinical Assessment</h4>
                        <p className="text-600 m-0">Evaluate patient progress and response to treatment</p>
                    </div>
                </div>

                <div className="formgrid grid">
                    <div className="field col-12 md:col-6">
                        <label className="font-semibold mb-2 block">Clinical Improvement</label>
                        <Dropdown
                            value={state.assessment.clinicalImprovement}
                            onChange={(e) =>
                                setStateValue({
                                    assessment: { ...state.assessment, clinicalImprovement: e.value }
                                })
                            }
                            options={[
                                { label: 'Significant Improvement', value: 'Significant' },
                                { label: 'Moderate Improvement', value: 'Moderate' },
                                { label: 'Minimal Improvement', value: 'Minimal' },
                                { label: 'No Change', value: 'None' },
                                { label: 'Deterioration', value: 'Deterioration' }
                            ]}
                            placeholder="Assess clinical improvement"
                            className="w-full"
                        />
                    </div>

                    <div className="field col-12 md:col-6">
                        <label className="font-semibold mb-2 block">Treatment Response</label>
                        <Dropdown
                            value={state.assessment.treatmentResponse}
                            onChange={(e) =>
                                setStateValue({
                                    assessment: { ...state.assessment, treatmentResponse: e.value }
                                })
                            }
                            options={[
                                { label: 'Excellent Response', value: 'Excellent' },
                                { label: 'Good Response', value: 'Good' },
                                { label: 'Fair Response', value: 'Fair' },
                                { label: 'Poor Response', value: 'Poor' }
                            ]}
                            placeholder="Evaluate treatment response"
                            className="w-full"
                        />
                    </div>

                    <div className="field col-12">
                        <div className="flex align-items-center gap-2 mb-2">
                            <Checkbox
                                inputId="sideEffects"
                                checked={state.assessment.sideEffectsPresent}
                                onChange={(e) =>
                                    setStateValue({
                                        assessment: { ...state.assessment, sideEffectsPresent: e.checked || false }
                                    })
                                }
                            />
                            <label htmlFor="sideEffects" className="font-semibold">
                                Significant Side Effects Present
                            </label>
                        </div>
                    </div>

                    <div className="field col-12">
                        <label className="font-semibold mb-3 block">Risk Factors Assessment</label>
                        <div className="grid">
                            {['Non-compliance', 'Drug interactions', 'Worsening symptoms', 'New complications', 'Psychosocial factors', 'Financial constraints', 'Co-morbid conditions'].map((risk, index) => (
                                <div key={index} className="col-6 md:col-4">
                                    <div className="flex align-items-center">
                                        <Checkbox
                                            inputId={`risk-${index}`}
                                            checked={state.assessment.riskFactors.includes(risk)}
                                            onChange={(e) => {
                                                const risks = e.checked ? [...state.assessment.riskFactors, risk] : state.assessment.riskFactors.filter((r) => r !== risk);
                                                setStateValue({
                                                    assessment: { ...state.assessment, riskFactors: risks }
                                                });
                                            }}
                                        />
                                        <label htmlFor={`risk-${index}`} className="ml-2 text-sm">
                                            {risk}
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="field col-12">
                        <label className="font-semibold mb-2 block">Additional Concerns or Observations</label>
                        <InputTextarea
                            value={state.assessment.additionalConcerns}
                            onChange={(e) =>
                                setStateValue({
                                    assessment: { ...state.assessment, additionalConcerns: e.target.value }
                                })
                            }
                            rows={4}
                            placeholder="Document any additional clinical observations, concerns, or notes about patient's condition..."
                            className="w-full"
                        />
                    </div>
                </div>
            </Card>
        </>
    );
};
export default ClinicalAssessment;
