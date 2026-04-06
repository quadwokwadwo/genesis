'use client';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import { Checkbox } from 'primereact/checkbox';
import { Badge } from 'primereact/badge';
import { ProgressBar } from 'primereact/progressbar';
import { Toast } from 'primereact/toast';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { useEffect, useRef, useState } from 'react';
import LocalDatabase from '@/libs/blue_prints/LocalDatabase';
import {
    Assessment,
    CurrentSymptoms,
    FollowUpLabResults,
    FollowUpState,
    InvestigationRecord,
    Measurements,
    TFollowupRecord,
    TInventoryItem,
    TPatient,
    TPatientFollowupVisit,
    TPreviousVisit,
    TreatmentCompliance,
    TreatmentPlan,
    VitalSigns
} from '@/types/hospital';
import VisitFollowupPatients from '@/app/(main)/hospital/visit/followup/components/VisitFollowupPatients';
import VisitFollowupPreviousVisit from '@/app/(main)/hospital/visit/followup/components/VisitFollowupPreviousVisit';
import SymptomsAndCompliance from '@/app/(main)/hospital/visit/followup/components/SymptomsAndCompliance';
import ClinicalAssessment from '@/app/(main)/hospital/visit/followup/components/ClinicalAssessment';
import { FollowupContext } from '@/libs/contextProviders/AppContexts';
import VisitFollowup from '@/libs/blue_prints/VisitFollowup';
import { AppointmentType, CRUDTYPE } from '@/types/enums/enums';
import { changeDateFormat, defaultSelected, displayMessage, getPatientPreviousVisits } from '@/libs/utils';
import { DataView } from 'primereact/dataview';
import { Avatar } from 'primereact/avatar';
import PatientVisitationModel from '@/libs/blue_prints/PatientVisitationModel';
import { GeneralPageProps } from '@/libs/utilityComponents';
import inventoryItems from '@/libs/blue_prints/InventoryItems';
import InvestigationsModel from '@/libs/blue_prints/InvestigationsModel';
import OrdersAndReview from '@/app/(main)/hospital/visit/visitation/components/OrdersAndReview';
import useUserData from '@/libs/hooks/useUserData';
import { useRouter } from 'next/navigation';
import SettingService from '@/libs/blue_prints/SettingService';
import { formatDate } from 'date-fns/format';
import UsersModel from '@/libs/blue_prints/UsersModel';

const INITIAL_CURRENT_SYMPTOMS: CurrentSymptoms = {
    presenting: '',
    duration: '',
    severity: 5,
    improvement: '',
    newSymptoms: '',
    sideEffects: ''
};

const INITIAL_COMPLIANCE: TreatmentCompliance = {
    medicationCompliance: '',
    missedDoses: 0,
    reasonForNonCompliance: '',
    procedureCompliance: '',
    lifestyleChanges: []
};

const INITIAL_VITAL_SIGNS: VitalSigns & Measurements = {
    weight: null,
    height: null,
    bmi: null,
    bloodPressure: '',
    heartRate: null,
    temperature: null,
    respiratoryRate: null
};

const INITIAL_ASSESSMENT: Assessment = {
    clinicalImprovement: '',
    treatmentResponse: '',
    sideEffectsPresent: false,
    additionalConcerns: '',
    riskFactors: []
};

const INITIAL_TREATMENT_PLAN: TreatmentPlan = {
    continueCurrentTreatment: true,
    medicationChanges: '',
    newMedications: [],
    dosageAdjustments: '',
    specialistReferral: ''
};

const INITIAL_STATE: FollowUpState = {
    currentStep: 0,
    selectedPatient: null,
    searchQuery: '',
    patients: [],
    previousVisits: [],
    currentSymptoms: { ...INITIAL_CURRENT_SYMPTOMS },
    treatmentCompliance: { ...INITIAL_COMPLIANCE },
    vitalSigns: { ...INITIAL_VITAL_SIGNS },
    labResults: [],
    assessment: { ...INITIAL_ASSESSMENT },
    treatmentPlan: { ...INITIAL_TREATMENT_PLAN },
    visitType: AppointmentType.followupVisit,
    showPatientSearch: false,
    showLabResults: false,
    crudType: CRUDTYPE.save,
    visitId: 0,
    isLoading: true,
    visitDate: new Date(),
    showFollowupsList: false,
    followupsVisitList: [],
    investigations: [],
    partnerInvestigations: [],
    prescriptions: [],
    drugs: [],
    selectedDrug: null,
    filteredDrugs: [],
    review: {
        nextAppointment: new Date(),
        reviewType: '',
        reviewNotes: '',
        assistingDoctor: ''
    },
    selectedAppointmentType: defaultSelected(),
    accountsInfo: { discountGiven: 0, chargeConsultation: true, chargeHospitalCard: true, consultationFee: 0, hospitalCardFee: 0 },
    determinedFees: null,
    generalSettings: null,
    users: []
};

// TODO : doctorId will be currently logged in user
// TODO : REMOVE PATIENT FROM LIST AFTER RECEIVING CONSULATION.
const localService = new LocalDatabase();
const followupService = new VisitFollowup();
const visits = new PatientVisitationModel();
const inventoryService = new inventoryItems();
const investigationService = new InvestigationsModel();
const userModel = new UsersModel();

const FollowUpVisit = () => {
    const [state, setState] = useState<FollowUpState>(INITIAL_STATE);
    const navigate = useRouter();
    const toast = useRef(null);
    const { user } = useUserData();

    const steps = [
        { label: 'Patient', icon: 'pi pi-user', description: 'Select patient' },
        { label: 'Review', icon: 'pi pi-history', description: 'Previous visits' },
        { label: 'Symptoms', icon: 'pi pi-comments', description: 'Current status' },
        { label: 'Assessment', icon: 'pi pi-heart', description: 'Clinical review' },
        { label: 'Order And Review', icon: 'pi pi-check-circle', description: 'Complete Follow up' }
    ];

    useEffect(() => {
        document.title = 'Follow-up Visit';
        // Auto-calculate BMI
        if (state.vitalSigns.weight && state.vitalSigns.height) {
            const heightM = state.vitalSigns.height / 100;
            const bmi = Number((state.vitalSigns.weight / (heightM * heightM)).toFixed(1));
            setState((prev) => ({
                ...prev,
                vitalSigns: { ...prev.vitalSigns, bmi }
            }));
        }
    }, [state.vitalSigns.weight, state.vitalSigns.height]);

    useEffect(() => {
        //this will determine if doctor is coming to page from visitation after selecting a patient
        localService.getSelectedPatient().then(async (storeData) => {
            //if so, populate patient primary data and go to the next step.

            if (storeData?.selectedPatient) {
                await setPatientPrimaryData(storeData.selectedPatient);
            }
            const drugs = await inventoryService.getItems();
            const investigations = await investigationService.getInvestigationsList();
            const patientFollowupVisits = await visits.getFollowupVisitsList<TFollowupRecord>(changeDateFormat(new Date()), AppointmentType.followupVisit);
            const followupAppointments = await followupService.getFollowupAppointmentsOnly(changeDateFormat(new Date()));
            const patients = followupAppointments.operatedData.map((appointment) => {
                const patient: TPatient = typeof appointment.patient === 'string' ? JSON.parse(appointment.patient) : appointment.patient;
                return { ...patient, lastVisit: appointment.lastVisit };
            });
            const recordableInvestigation: InvestigationRecord[] = investigations.operatedData.map((investigation) => {
                return { ...investigation, selected: false, price: parseFloat(investigation.price.toString()) };
            });
            const partnerRecordableInvestigation: InvestigationRecord[] = investigations.operatedData.map((investigation) => {
                return { ...investigation, selected: false, price: parseFloat(investigation.price.toString()) };
            });
            const hospitalSettings = await SettingService.getHospitalSetting();
            const settings = hospitalSettings.operatedData;
            const parsedFees = typeof settings.fees === 'string' ? JSON.parse(settings.fees) : settings.fees;
            const users = await userModel.getUserList();
            setStateValue({
                isLoading: false,
                patients,
                followupsVisitList: patientFollowupVisits.operatedData.filter((visit) => visit.visitType === AppointmentType.followupVisit),
                drugs: drugs.operatedData,
                filteredDrugs: drugs.operatedData,
                investigations: recordableInvestigation,
                partnerInvestigations: partnerRecordableInvestigation,
                determinedFees: parsedFees,
                generalSettings: typeof settings.general === 'string' ? JSON.parse(settings.general) : settings.general,
                accountsInfo: { ...parsedFees, discountGiven: 0, chargeConsultation: true, chargeHospitalCard: false },
                crudType: storeData.crudType,
                users: users.operatedData
            });
            setTimeout(() => {
                if (storeData.crudType === CRUDTYPE.update) onEditFollowupVisit(storeData.visitRecordings, patients, drugs.operatedData, recordableInvestigation);
                localService.clearSelectedPatient();
            }, 2000);
        });
    }, []);

    const setPatientPrimaryData = async (patient: TPatient) => {
        await loadPreviousVisits(patient.patientId);
        loadLabResults(patient.patientId);
        selectPatient(patient);
    };
    const setStateValue = (updates: Partial<FollowUpState>) => {
        setState((prev) => ({ ...prev, ...updates }));
    };

    const loadPreviousVisits = async (patientId: number) => {
        try {
            setStateValue({ isLoading: true });

            const previousVisits = await visits.getPatientPreviousVisits(patientId);

            const patientVisits: TPreviousVisit[] = getPatientPreviousVisits(previousVisits.operatedData);

            setStateValue({ previousVisits: patientVisits });
        } catch (error) {
            console.log(error);
        } finally {
            setStateValue({ isLoading: false });
        }
    };

    const loadLabResults = (patientId: number) => {
        // Simulate loading lab results
        const results: FollowUpLabResults[] = [];
        setStateValue({ labResults: results });
    };

    const selectPatient = (patient: TPatient) => {
        setStateValue({
            selectedPatient: patient,
            showPatientSearch: false,
            currentStep: 1
        });
    };

    const nextStep = () => {
        if (state.currentStep < steps.length - 1) {
            setStateValue({ currentStep: state.currentStep + 1 });
        }
    };

    const prevStep = () => {
        if (state.currentStep > 0) {
            setStateValue({ currentStep: state.currentStep - 1 });
        }
    };

    const getStatusSeverity = (status: string) => {
        switch (status) {
            case 'Normal':
                return 'success';
            case 'Abnormal':
                return 'warning';
            case 'Critical':
                return 'danger';
            default:
                return 'info';
        }
    };

    const saveFollowUpVisit = async () => {
        try {
            const selectedInvestigations = state.investigations.filter((investigation) => investigation.selected);
            const selectedPartnerInvestigations = state.partnerInvestigations.filter((investigation) => investigation.selected);
            const { currentSymptoms, treatmentCompliance, vitalSigns, labResults, assessment, treatmentPlan, visitType, review, prescriptions } = state;
            // Validate required fields

            const stateValues: TFollowupRecord = {
                patientId: state.selectedPatient.patientId,
                visitId: state.visitId,
                doctorId: user.userId, // here add doctor details by current user doctor logged in
                visitDate: formatDate(state.visitDate, 'yyyy-MM-dd'),
                visitRecordings: {
                    currentSymptoms,
                    treatmentCompliance,
                    vitalSigns,
                    labResults,
                    assessment,
                    treatmentPlan,
                    visitType,
                    review,
                    prescriptions: prescriptions.map((prescription) => {
                        const { selectedItem, ...rest } = prescription;
                        return rest;
                    }),
                    investigations: selectedInvestigations,
                    partnerInvestigations: selectedPartnerInvestigations,
                    accountsInfo: state.accountsInfo
                }
            };

            setStateValue({ isLoading: true });
            const response = await followupService.addVisitFollowup(stateValues, state.crudType);

            if (response.status === 200 && response.operationalStatus === 1 && response.operatedData) {
                displayMessage({
                    header: 'Success',
                    infoType: 'success',
                    message: 'Follow-up Visit saved successfully',
                    life: 3000,
                    toastComponent: toast
                });
                setStateValue({ followupsVisitList: state.followupsVisitList.concat(response.operatedData) });
                setTimeout(() => {
                    navigate.push('/hospital/enhanced');
                }, 3000);
            }
            if (response.status === 200 && response.operationalStatus === 2 && response.operatedData) {
                displayMessage({
                    header: 'Success',
                    infoType: 'success',
                    message: 'Follow-up Visit updated successfully',
                    life: 3000,
                    toastComponent: toast
                });
                setStateValue({ followupsVisitList: state.followupsVisitList.map((visit) => (visit.visitId === response.operatedData.visitId ? response.operatedData : visit)) });
                setTimeout(() => {
                    navigate.push('/hospital/enhanced');
                }, 3000);
            }
            resetForm();
        } catch (error) {
            console.log(error);
        } finally {
            setStateValue({ isLoading: false });
        }
    };
    const addNewItem = <T extends keyof FollowUpState>(arrayKey: T, newItem: any) => {
        setState((prev) => ({
            ...prev,
            [arrayKey]: [...(prev[arrayKey] as any[]), newItem],
            selectedDrug: null,
            filteredDrugs: state.drugs
        }));
    };
    const removeItem = <T extends keyof FollowUpState>(arrayKey: T, index: number) => {
        setState((prev) => ({
            ...prev,
            [arrayKey]: (prev[arrayKey] as any[]).filter((_, i) => i !== index)
        }));
    };
    const resetForm = () => {
        const { currentSymptoms, treatmentCompliance, vitalSigns, labResults, assessment, treatmentPlan, visitType } = INITIAL_STATE;
        setStateValue({
            currentStep: 0,
            selectedPatient: null,
            searchQuery: '',
            previousVisits: [],
            currentSymptoms,
            treatmentCompliance,
            vitalSigns,
            labResults,
            assessment,
            treatmentPlan,
            visitType,
            crudType: CRUDTYPE.save,
            visitId: 0,
            isLoading: false,
            visitDate: new Date(),
            showFollowupsList: false
        });
    };
    const viewLabs = () => {
        setStateValue({ showLabResults: true });
    };
    const renderStepContent = () => {
        switch (state.currentStep) {
            case 0: // PatientExtra Selection
                return <VisitFollowupPatients />;

            case 1: // Previous Visits Review
                return <VisitFollowupPreviousVisit visits={state.previousVisits} showPatientInfo={true} loading={state.isLoading} clickToViewLabs={viewLabs} />;

            case 2: // Current Symptoms & Compliance
                return <SymptomsAndCompliance />;

            case 3: // Clinical Assessment
                return <ClinicalAssessment />;

            case 4: // Treatment Plan & Follow-up
                // return <FollowupTreatmentPlan />;
                return <OrdersAndReview state={state} setStateValue={setStateValue} addNewItem={addNewItem} removeItem={removeItem} />;
            default:
                return null;
        }
    };
    const onEditFollowupVisit = async (visit: TFollowupRecord, patientsList: TPatient[], stateDrugs: TInventoryItem[], stateInvestigations: InvestigationRecord[]) => {
        console.log(visit);
        console.log(state.investigations);
        try {
            const selectedPatient = patientsList.find((patient) => patient.patientId === visit.patientId);
            const visitRecordings: TPatientFollowupVisit = JSON.parse(visit.visitRecordings as string);
            const { investigations, partnerInvestigations: savedPartnerInvestigations, prescriptions, ...rest } = visitRecordings;

            const addedInvestigations = investigations.map((investigation) => investigation.testName);
            const addedPartnerInvestigations = (savedPartnerInvestigations || []).map((investigation) => investigation.testName);
            await setPatientPrimaryData(selectedPatient);
            setStateValue({
                selectedPatient,
                ...rest,
                prescriptions: prescriptions.map((prescription) => ({ ...prescription, selectedItem: stateDrugs.find((drug) => drug.itemId === prescription.medicationId) })),
                visitDate: visit.visitDate,
                investigations: stateInvestigations.map((investigation) => ({ ...investigation, selected: addedInvestigations.includes(investigation.testName) })),
                partnerInvestigations: stateInvestigations.map((investigation) => ({ ...investigation, selected: addedPartnerInvestigations.includes(investigation.testName) })),
                visitId: visit.visitId,
                crudType: CRUDTYPE.update,
                currentStep: 1,
                showFollowupsList: false,
                accountsInfo: visitRecordings.accountsInfo
            });
        } catch (error) {
            console.log(error);
        }
    };
    const onDeleteFollowupVisit = (visit: number) => {};
    const ViewFollowupsTodayList = (visit: TFollowupRecord) => {
        const details: TPatientFollowupVisit = JSON.parse(visit.visitRecordings as string);
        return (
            <>
                <Divider />
                <div className="grid p-fluid w-full">
                    <div className="col-12">
                        <div className="grid">
                            <div className="col-3">
                                <Avatar label={`${visit.patientName.charAt(0)}`} shape="circle" className="bg-primary" />
                                <span className="pl-2">{`${visit.patientName}`}</span>
                            </div>
                            <div className="col-2">{visit.doctorName}</div>
                            <div className="col-2">{details.visitType}</div>
                            <div className="col-3">{changeDateFormat(state.review.nextAppointment as Date)}</div>
                            <div className="col-2">
                                <Button icon="pi pi-pencil" className="p-button-outlined mr-2" onClick={() => onEditFollowupVisit(visit, state.patients, state.drugs, state.investigations)} />
                                <Button icon="pi pi-trash" className="p-button-danger p-button-outlined" onClick={() => onDeleteFollowupVisit(visit.visitId)} />
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    };
    const onCancelUpdate = () => {
        resetForm();
        navigate.back();
    };
    return (
        <>
            <GeneralPageProps toastRef={toast} toastPosition="top-right" />
            <div className="grid">
                <Toast ref={toast} />
                {/* Progress Header */}
                <div className="col-12">
                    <Card className="shadow-3">
                        <div className="flex align-items-center justify-content-between mb-4">
                            <div>
                                <h3 className="m-0 text-primary">
                                    Follow-up Visit Documentation - <span className="text-pink-600">{state.selectedPatient && `${state.selectedPatient.firstName} ${state.selectedPatient.lastName}`}</span>
                                </h3>
                                <p className="text-600 m-0">Track patient progress and adjust treatment plans</p>
                            </div>
                            <Badge value={`${state.currentStep + 1}/${steps.length}`} size="large" />
                        </div>

                        <div className="grid">
                            {steps.map((step, index) => (
                                <div key={index} className="col">
                                    <div
                                        className={`text-center p-3 border-round-md transition-colors transition-duration-300 cursor-pointer ${
                                            index === state.currentStep ? 'bg-primary text-white shadow-3' : index < state.currentStep ? 'bg-green-100 text-green-800 border-1 border-green-300' : 'bg-gray-50 text-600 border-1 border-gray-300'
                                        }`}
                                        onClick={() => setStateValue({ currentStep: index })}
                                    >
                                        <div className="flex flex-column align-items-center gap-2">
                                            <i className={`${step.icon} text-xl`} />
                                            <div>
                                                <div className="font-bold text-sm">{step.label}</div>
                                                <small className="opacity-80">{step.description}</small>
                                            </div>
                                            {index < state.currentStep && <i className="pi pi-check-circle" />}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <ProgressBar value={((state.currentStep + 1) / steps.length) * 100} className="mt-2" style={{ height: '12px' }} />
                    </Card>
                </div>

                {/* Main Content */}
                <div className="col-12">
                    <FollowupContext.Provider value={{ state, setStateValue, selectPatient }}>
                        <div style={{ maxHeight: 'calc(100vh - 450px)', overflowY: 'auto', overflowX: 'hidden', paddingBottom: '100px' }}>{renderStepContent()}</div>
                    </FollowupContext.Provider>

                    {/* Navigation */}
                    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-4 border-top-1 border-200 p-3 z-5" style={{ marginLeft: '0' }}>
                        <div className="flex justify-content-between align-items-center max-w-full mx-auto px-3">
                            <Button label="Previous" icon="pi pi-chevron-left" onClick={prevStep} disabled={state.currentStep === 0} className="p-button-outlined" size="large" />

                            <div className="flex gap-3">
                                <Button label="Save Draft" icon="pi pi-save" className="p-button-outlined" size="large" />
                                {state.crudType === CRUDTYPE.update && <Button className="p-button-danger" label="Cancel Update" onClick={onCancelUpdate} />}
                                {state.currentStep === steps.length - 1 ? (
                                    <Button
                                        label={state.crudType === CRUDTYPE.save ? 'Complete Follow-up Visit' : 'Update Follow-up Visit'}
                                        icon="pi pi-check"
                                        onClick={saveFollowUpVisit}
                                        className="p-button-success"
                                        size="large"
                                        loading={state.isLoading}
                                    />
                                ) : (
                                    <Button label="Next" icon="pi pi-chevron-right" iconPos="right" onClick={nextStep} size="large" disabled={state.currentStep === 0 && !state.selectedPatient} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lab Results Dialog */}
                <Dialog header="Recent Lab Results" visible={state.showLabResults} onHide={() => setStateValue({ showLabResults: false })} style={{ width: '70vw' }} modal>
                    <DataTable value={state.labResults} className="p-datatable-sm">
                        <Column field="testName" header="Test" sortable />
                        <Column field="result" header="Result" />
                        <Column field="referenceRange" header="Reference Range" />
                        <Column field="status" header="Status" body={(result: FollowUpLabResults) => <Tag value={result.status} severity={getStatusSeverity(result.status)} />} />
                        <Column field="date" header="Date" body={(result: FollowUpLabResults) => result.date.toLocaleDateString()} />
                        <Column
                            header="Reviewed"
                            body={(result: FollowUpLabResults, { rowIndex }) => (
                                <Checkbox
                                    checked={result.reviewed}
                                    onChange={(e) => {
                                        const updated = [...state.labResults];
                                        updated[rowIndex].reviewed = e.checked || false;
                                        setStateValue({ labResults: updated });
                                    }}
                                />
                            )}
                        />
                    </DataTable>
                </Dialog>
                <Dialog header="Followup Visits" visible={state.showFollowupsList} onHide={() => setStateValue({ showFollowupsList: false })} style={{ width: '70vw' }} modal>
                    <div className="grid font-bold text-xl">
                        <div className="col-3">Patient</div>
                        <div className="col-2">Doctor</div>
                        <div className="col-2">Visit Type</div>
                        <div className="col-3">Next Appointment</div>
                        <div className="col-2">Actions</div>
                    </div>
                    <DataView value={state.followupsVisitList} key="visitId" itemTemplate={ViewFollowupsTodayList} rows={10} paginator />
                </Dialog>
                <ConfirmDialog />
            </div>
        </>
    );
};

export default FollowUpVisit;
