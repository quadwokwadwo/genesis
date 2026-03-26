import { usePatientVisitContext } from '@/libs/contextProviders/AppContexts';
import { Card } from 'primereact/card';
import { TabPanel, TabView } from 'primereact/tabview';
import { Calendar } from 'primereact/calendar';
import { RadioButton } from 'primereact/radiobutton';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Tooltip } from 'primereact/tooltip';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Button } from 'primereact/button';
import { Panel } from 'primereact/panel';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { MenstrualCycleType, YesNo } from '@/types/enums/enums';
import { Divider } from 'primereact/divider';

const MedicalHistory = () => {
    const { state, setStateValue, addNewItem, removeItem } = usePatientVisitContext();
    return (
        <>
            <div className="grid">
                <div className="col-12">
                    <Card className="shadow-2">
                        <div className="flex align-items-center mb-4">
                            <i className="pi pi-clock text-primary text-2xl mr-3" />
                            <h4 className="m-0 text-primary">Medical History</h4>
                        </div>

                        <TabView>
                            <TabPanel header="Menstrual History" leftIcon="pi pi-calendar">
                                <div className="formgrid grid">
                                    <div className="field col-12 md:col-4">
                                        <label className="font-semibold mb-2 block">Last Menstrual Period</label>
                                        <Calendar
                                            value={state.menstrualHistory.lmp}
                                            onChange={(e) =>
                                                setStateValue({
                                                    menstrualHistory: { ...state.menstrualHistory, lmp: e.value as Date }
                                                })
                                            }
                                            showIcon
                                            dateFormat="dd M yy"
                                            placeholder="Select LMP date"
                                            maxDate={new Date()}
                                            className="w-full"
                                        />
                                    </div>

                                    <div className="field col-12 md:col-4">
                                        <label className="font-semibold mb-2 block">Cycle Pattern</label>
                                        <div className="flex flex-wrap gap-3">
                                            <div className="flex align-items-center">
                                                <RadioButton
                                                    inputId="regular"
                                                    name="cyclePattern"
                                                    value="Regular"
                                                    onChange={(e) =>
                                                        setStateValue({
                                                            menstrualHistory: { ...state.menstrualHistory, cycleRegular: e.value }
                                                        })
                                                    }
                                                    checked={state.menstrualHistory.cycleRegular === MenstrualCycleType.regular}
                                                />
                                                <label htmlFor="regular" className="ml-2">
                                                    Regular
                                                </label>
                                            </div>
                                            <div className="flex align-items-center">
                                                <RadioButton
                                                    inputId="irregular"
                                                    name="cyclePattern"
                                                    value="Irregular"
                                                    onChange={(e) =>
                                                        setStateValue({
                                                            menstrualHistory: { ...state.menstrualHistory, cycleRegular: e.value }
                                                        })
                                                    }
                                                    checked={state.menstrualHistory.cycleRegular === MenstrualCycleType.irregular}
                                                />
                                                <label htmlFor="irregular" className="ml-2">
                                                    Irregular
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="field col-12 md:col-4">
                                        <label className="font-semibold mb-2 block">Cycle Length (days)</label>
                                        <InputNumber
                                            value={state.menstrualHistory.cycleLength}
                                            onValueChange={(e) =>
                                                setStateValue({
                                                    menstrualHistory: { ...state.menstrualHistory, cycleLength: e.value }
                                                })
                                            }
                                            min={20}
                                            max={45}
                                            placeholder="e.g., 28"
                                            className="w-full"
                                        />
                                        <small className="text-500">Normal: 21-35 days</small>
                                    </div>
                                    <Divider className="hidden lg:block" />
                                    <div className="field col-12 md:col-6">
                                        <label className="font-semibold mb-2 block">Dysmenorrhea (Painful periods)</label>
                                        <div className="flex flex-wrap gap-3">
                                            <div className="flex align-items-center">
                                                <RadioButton
                                                    inputId="dysmenorrheaYes"
                                                    name="dysmenorrhea"
                                                    value="Yes"
                                                    onChange={(e) =>
                                                        setStateValue({
                                                            menstrualHistory: { ...state.menstrualHistory, dysmenorrhea: e.value }
                                                        })
                                                    }
                                                    checked={state.menstrualHistory.dysmenorrhea === 'Yes'}
                                                />
                                                <label htmlFor="dysmenorrheaYes" className="ml-2">
                                                    Yes
                                                </label>
                                            </div>
                                            <div className="flex align-items-center">
                                                <RadioButton
                                                    inputId="dysmenorrheaNo"
                                                    name="dysmenorrhea"
                                                    value="No"
                                                    onChange={(e) =>
                                                        setStateValue({
                                                            menstrualHistory: { ...state.menstrualHistory, dysmenorrhea: e.value }
                                                        })
                                                    }
                                                    checked={state.menstrualHistory.dysmenorrhea === YesNo.no}
                                                />
                                                <label htmlFor="dysmenorrheaNo" className="ml-2">
                                                    No
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="field col-12 md:col-6">
                                        <label className="font-semibold mb-2 block">Dyspareunia (Painful intercourse)</label>
                                        <div className="flex flex-wrap gap-3">
                                            <div className="flex align-items-center">
                                                <RadioButton
                                                    inputId="dyspareuniaYes"
                                                    name="dyspareunia"
                                                    value="Yes"
                                                    onChange={(e) =>
                                                        setStateValue({
                                                            menstrualHistory: { ...state.menstrualHistory, dyspareunia: e.value }
                                                        })
                                                    }
                                                    checked={state.menstrualHistory.dyspareunia === YesNo.yes}
                                                />
                                                <label htmlFor="dyspareuniaYes" className="ml-2">
                                                    Yes
                                                </label>
                                            </div>
                                            <div className="flex align-items-center">
                                                <RadioButton
                                                    inputId="dyspareuniaNo"
                                                    name="dyspareunia"
                                                    value="No"
                                                    onChange={(e) =>
                                                        setStateValue({
                                                            menstrualHistory: { ...state.menstrualHistory, dyspareunia: e.value }
                                                        })
                                                    }
                                                    checked={state.menstrualHistory.dyspareunia === YesNo.no}
                                                />
                                                <label htmlFor="dyspareuniaNo" className="ml-2">
                                                    No
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="field col-12">
                                        <label className="font-semibold mb-2 block">PMS Symptoms</label>
                                        <InputTextarea
                                            rows={2}
                                            value={state.menstrualHistory.pms}
                                            onChange={(e) =>
                                                setStateValue({
                                                    menstrualHistory: { ...state.menstrualHistory, pms: e.target.value }
                                                })
                                            }
                                            placeholder="Describe premenstrual symptoms..."
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            </TabPanel>
                            <TabPanel header="Contraceptive History">
                                <div className="p-fluid formgrid grid">
                                    <div className="field col-12">
                                        <label>Ever used contraceptives?</label>
                                        <div className="flex flex-wrap gap-3">
                                            <div className="flex align-items-center">
                                                <RadioButton
                                                    inputId="contraceptiveYes"
                                                    name="contraceptiveUse"
                                                    value="Yes"
                                                    onChange={(e) =>
                                                        setStateValue({
                                                            contraceptiveHistory: { ...state.contraceptiveHistory, everUsed: e.value }
                                                        })
                                                    }
                                                    checked={state.contraceptiveHistory.everUsed === 'Yes'}
                                                />
                                                <label htmlFor="contraceptiveYes" className="ml-2">
                                                    Yes
                                                </label>
                                            </div>
                                            <div className="flex align-items-center">
                                                <RadioButton
                                                    inputId="contraceptiveNo"
                                                    name="contraceptiveUse"
                                                    value="No"
                                                    onChange={(e) =>
                                                        setStateValue({
                                                            contraceptiveHistory: { ...state.contraceptiveHistory, everUsed: e.value }
                                                        })
                                                    }
                                                    checked={state.contraceptiveHistory.everUsed === 'No'}
                                                />
                                                <label htmlFor="contraceptiveNo" className="ml-2">
                                                    No
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {state.contraceptiveHistory.everUsed === 'Yes' && (
                                        <>
                                            <div className="field col-12 md:col-6">
                                                <label htmlFor="currentMethod">Current/Last Method</label>
                                                <InputText
                                                    id="currentMethod"
                                                    value={state.contraceptiveHistory.currentMethod}
                                                    onChange={(e) =>
                                                        setStateValue({
                                                            contraceptiveHistory: { ...state.contraceptiveHistory, currentMethod: e.target.value }
                                                        })
                                                    }
                                                    placeholder="e.g., Pills, IUD, Condoms"
                                                />
                                            </div>

                                            <div className="field col-12 md:col-6">
                                                <label htmlFor="duration">Duration (months)</label>
                                                <InputNumber
                                                    id="duration"
                                                    value={state.contraceptiveHistory.durationMonths}
                                                    onValueChange={(e) =>
                                                        setStateValue({
                                                            contraceptiveHistory: { ...state.contraceptiveHistory, durationMonths: e.value }
                                                        })
                                                    }
                                                    min={0}
                                                />
                                            </div>

                                            <div className="field col-12">
                                                <label htmlFor="reasonDiscontinued">Reason for discontinuation</label>
                                                <InputTextarea
                                                    id="reasonDiscontinued"
                                                    rows={2}
                                                    value={state.contraceptiveHistory.reasonDiscontinued}
                                                    onChange={(e) =>
                                                        setStateValue({
                                                            contraceptiveHistory: { ...state.contraceptiveHistory, reasonDiscontinued: e.target.value }
                                                        })
                                                    }
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </TabPanel>
                            <TabPanel header="Obstetric History" leftIcon="pi pi-user">
                                <div className="mb-4">
                                    <h6 className="text-primary">G.T.P.A.L. (Gravidity, Term, Preterm, Abortions, Living)</h6>
                                    <p className="text-600 text-sm">Complete obstetric history using standard notation</p>
                                </div>

                                <div className="formgrid grid p-fluid">
                                    <div className="field col-6 md:col-2">
                                        <label className="font-semibold mb-2 block">
                                            <Tooltip target=".gravida-tooltip" />
                                            <span className="gravida-tooltip" data-pr-tooltip="Total number of pregnancies">
                                                Gravida <i className="pi pi-info-circle text-primary ml-1" />
                                            </span>
                                        </label>
                                        <InputNumber
                                            value={state.obstetricHistory.gravida}
                                            onValueChange={(e) =>
                                                setStateValue({
                                                    obstetricHistory: { ...state.obstetricHistory, gravida: e.value }
                                                })
                                            }
                                            min={0}
                                            max={20}
                                        />
                                    </div>

                                    <div className="field col-6 md:col-2">
                                        <label className="font-semibold mb-2 block">
                                            <Tooltip target=".term-tooltip" />
                                            <span className="term-tooltip" data-pr-tooltip="Full-term deliveries (≥37 weeks)">
                                                Term <i className="pi pi-info-circle text-primary ml-1" />
                                            </span>
                                        </label>
                                        <InputNumber
                                            value={state.obstetricHistory.paraTerm}
                                            onValueChange={(e) =>
                                                setStateValue({
                                                    obstetricHistory: { ...state.obstetricHistory, paraTerm: e.value }
                                                })
                                            }
                                            min={0}
                                            className="w-full"
                                        />
                                    </div>

                                    <div className="field col-6 md:col-2">
                                        <label className="font-semibold mb-2 block">
                                            <Tooltip target=".preterm-tooltip" />
                                            <span className="preterm-tooltip" data-pr-tooltip="Preterm deliveries (<37 weeks)">
                                                Preterm <i className="pi pi-info-circle text-primary ml-1" />
                                            </span>
                                        </label>
                                        <InputNumber
                                            value={state.obstetricHistory.paraPreterm}
                                            onValueChange={(e) =>
                                                setStateValue({
                                                    obstetricHistory: { ...state.obstetricHistory, paraPreterm: e.value }
                                                })
                                            }
                                            min={0}
                                        />
                                    </div>

                                    <div className="field col-6 md:col-2">
                                        <label className="font-semibold mb-2 block">
                                            <Tooltip target=".abortion-tooltip" />
                                            <span className="abortion-tooltip" data-pr-tooltip="Pregnancy losses <20 weeks">
                                                Abortions <i className="pi pi-info-circle text-primary ml-1" />
                                            </span>
                                        </label>
                                        <InputNumber
                                            value={state.obstetricHistory.paraAbortions}
                                            onValueChange={(e) =>
                                                setStateValue({
                                                    obstetricHistory: { ...state.obstetricHistory, paraAbortions: e.value }
                                                })
                                            }
                                            min={0}
                                        />
                                    </div>

                                    <div className="field col-6 md:col-2">
                                        <label className="font-semibold mb-2 block">
                                            <Tooltip target=".living-tooltip" />
                                            <span className="living-tooltip" data-pr-tooltip="Currently living children">
                                                Living <i className="pi pi-info-circle text-primary ml-1" />
                                            </span>
                                        </label>
                                        <InputNumber
                                            value={state.obstetricHistory.paraLiving}
                                            onValueChange={(e) =>
                                                setStateValue({
                                                    obstetricHistory: { ...state.obstetricHistory, paraLiving: e.value }
                                                })
                                            }
                                            min={0}
                                        />
                                    </div>

                                    <div className="field col-6 md:col-2">
                                        <label className="font-semibold mb-2 block">Miscarriages</label>
                                        <InputNumber
                                            value={state.obstetricHistory.miscarriages}
                                            onValueChange={(e) =>
                                                setStateValue({
                                                    obstetricHistory: { ...state.obstetricHistory, miscarriages: e.value }
                                                })
                                            }
                                            min={0}
                                        />
                                    </div>

                                    <div className="field col-12 md:col-6">
                                        <label className="font-semibold mb-2 block">History of Ectopic Pregnancy</label>
                                        <div className="flex flex-wrap gap-3">
                                            <div className="flex align-items-center">
                                                <RadioButton
                                                    inputId="ectopicYes"
                                                    name="ectopic"
                                                    value="Yes"
                                                    onChange={(e) =>
                                                        setStateValue({
                                                            obstetricHistory: { ...state.obstetricHistory, ectopicPregnancy: e.value }
                                                        })
                                                    }
                                                    checked={state.obstetricHistory.ectopicPregnancy === YesNo.yes}
                                                />
                                                <label htmlFor="ectopicYes" className="ml-2">
                                                    Yes
                                                </label>
                                            </div>
                                            <div className="flex align-items-center">
                                                <RadioButton
                                                    inputId="ectopicNo"
                                                    name="ectopic"
                                                    value="No"
                                                    onChange={(e) =>
                                                        setStateValue({
                                                            obstetricHistory: { ...state.obstetricHistory, ectopicPregnancy: e.value }
                                                        })
                                                    }
                                                    checked={state.obstetricHistory.ectopicPregnancy === YesNo.no}
                                                />
                                                <label htmlFor="ectopicNo" className="ml-2">
                                                    No
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabPanel>

                            <TabPanel header="Past Medical History" leftIcon="pi pi-history">
                                <Accordion multiple activeIndex={[0]}>
                                    <AccordionTab header="Chronic Illnesses">
                                        <div className="mb-3">
                                            <Button
                                                label="Add Chronic Illness"
                                                icon="pi pi-plus"
                                                onClick={() =>
                                                    addNewItem('chronicIllnesses', {
                                                        illnessName: '',
                                                        notes: ''
                                                    })
                                                }
                                                className="p-button-outlined p-button-sm"
                                            />
                                        </div>

                                        {state.chronicIllnesses.map((illness, index) => (
                                            <Panel key={index} header={`Illness ${index + 1}`} className="mb-2" toggleable>
                                                <div className="formgrid grid p-fluid">
                                                    <div className="field col-12 md:col-6 ">
                                                        <label>Illness Name</label>
                                                        <Dropdown
                                                            value={illness.illnessName}
                                                            onChange={(e) => {
                                                                const updated = [...state.chronicIllnesses];
                                                                updated[index].illnessName = e.value;
                                                                setStateValue({ chronicIllnesses: updated });
                                                            }}
                                                            options={[
                                                                { label: 'Hypertension', value: 'Hypertension' },
                                                                { label: 'Diabetes Mellitus', value: 'Diabetes Mellitus' },
                                                                { label: 'Sickle Cell Disease', value: 'Sickle Cell Disease' },
                                                                { label: 'Thyroid Disease', value: 'Thyroid Disease' },
                                                                { label: 'PCOS', value: 'PCOS' },
                                                                { label: 'Endometriosis', value: 'Endometriosis' },
                                                                { label: 'Other', value: 'Other' }
                                                            ]}
                                                            placeholder="Select illness"
                                                            filter
                                                            editable
                                                        />
                                                    </div>
                                                    <div className="field col-12 md:col-6">
                                                        <label>Notes</label>
                                                        <InputText
                                                            value={illness.notes}
                                                            onChange={(e) => {
                                                                const updated = [...state.chronicIllnesses];
                                                                updated[index].notes = e.target.value;
                                                                setStateValue({ chronicIllnesses: updated });
                                                            }}
                                                            placeholder="Additional details..."
                                                        />
                                                    </div>
                                                    <div className="field col-12">
                                                        <Button icon="pi pi-trash" className="p-button-danger p-button-outlined p-button-sm w-fit" onClick={() => removeItem('chronicIllnesses', index)} label="Remove" />
                                                    </div>
                                                </div>
                                            </Panel>
                                        ))}
                                    </AccordionTab>

                                    <AccordionTab header="Surgical History">
                                        <div className="mb-3">
                                            <Button
                                                label="Add Surgery"
                                                icon="pi pi-plus"
                                                onClick={() =>
                                                    addNewItem('surgeries', {
                                                        type: null,
                                                        datePerformed: null,
                                                        notes: ''
                                                    })
                                                }
                                                className="p-button-outlined p-button-sm"
                                            />
                                        </div>

                                        {state.surgeries.map((surgery, index) => (
                                            <Panel key={index} header={`Surgery ${index + 1}`} className="mb-2" toggleable>
                                                <div className="formgrid grid p-fluid">
                                                    <div className="field col-12 md:col-4">
                                                        <label>Surgery Type</label>
                                                        <Dropdown
                                                            value={surgery.type}
                                                            onChange={(e) => {
                                                                const updated = [...state.surgeries];
                                                                updated[index].type = e.value;
                                                                setStateValue({ surgeries: updated });
                                                            }}
                                                            options={[
                                                                { label: 'Myomectomy', value: 'Myomectomy' },
                                                                { label: 'Salpingectomy', value: 'Salpingectomy' },
                                                                { label: 'Salpingostomy', value: 'Salpingostomy' },
                                                                { label: 'Cesarean Section', value: 'CesareanSection' },
                                                                { label: 'Ovarian Cystectomy', value: 'OvarianCystectomy' },
                                                                { label: 'Hysteroscopy', value: 'Hysteroscopy' },
                                                                { label: 'Other', value: 'Other' }
                                                            ]}
                                                            placeholder="Select surgery type"
                                                        />
                                                    </div>
                                                    <div className="field col-12 md:col-4">
                                                        <label>Date Performed</label>
                                                        <Calendar
                                                            value={surgery.datePerformed}
                                                            onChange={(e) => {
                                                                const updated = [...state.surgeries];
                                                                updated[index].datePerformed = e.value as Date;
                                                                setStateValue({ surgeries: updated });
                                                            }}
                                                            showIcon
                                                            dateFormat="dd M yy"
                                                            maxDate={new Date()}
                                                        />
                                                    </div>
                                                    <div className="field col-12 md:col-4">
                                                        <label>Notes</label>
                                                        <InputText
                                                            value={surgery.notes}
                                                            onChange={(e) => {
                                                                const updated = [...state.surgeries];
                                                                updated[index].notes = e.target.value;
                                                                setStateValue({ surgeries: updated });
                                                            }}
                                                            placeholder="Surgery details..."
                                                        />
                                                    </div>
                                                    <div className="field col-12">
                                                        <Button icon="pi pi-trash" className="p-button-danger p-button-outlined p-button-sm w-fit" onClick={() => removeItem('surgeries', index)} label="Remove" />
                                                    </div>
                                                </div>
                                            </Panel>
                                        ))}
                                    </AccordionTab>
                                </Accordion>
                            </TabPanel>
                        </TabView>
                    </Card>
                </div>
            </div>
        </>
    );
};
export default MedicalHistory;
