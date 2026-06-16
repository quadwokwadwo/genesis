'use client';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { ProgressBar } from 'primereact/progressbar';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { useEffect, useRef, useState } from 'react';
import { GeneralPageProps } from '@/libs/utilityComponents';
import { PatientVisitContext } from '@/libs/contextProviders/AppContexts';
import PatientSelection from './components/PatientSelection';
import { Appointment, EnhancedVisitState, InvestigationRecord, TFollowupRecord, TPatient, TPatientVisitRecord, TVisitRecord, User } from '@/types/hospital/hospital';
import MedicalHistory from '@/app/(main)/hospital/visit/visitation/components/MedicalHistory';
import ChiefComplaint from '@/app/(main)/hospital/visit/visitation/components/ChiefComplaint';
import PatientExamination from '@/app/(main)/hospital/visit/visitation/components/PatientExamination';
import Assessment from '@/app/(main)/hospital/visit/visitation/components/Assessment';
import OrdersAndReview from '@/app/(main)/hospital/visit/visitation/components/OrdersAndReview';
import PreVisitInformationDisplay from '@/app/(main)/hospital/enhanced/components/PrevisitInformation';
import PreviousVisitsHistory from '@/app/(main)/hospital/enhanced/components/PreviousVisit';
import Appointments from '@/libs/blue_prints/Appointments';
import { changeDateFormat, defaultSelected, displayMessage, getICD11Codes, getPatientPreviousVisits, remakeDropdown } from '@/libs/utils';
import InvestigationsModel from '@/libs/blue_prints/InvestigationsModel';
import PatientVisitationModel from '@/libs/blue_prints/PatientVisitationModel';
import { AppointmentType, CRUDTYPE, INVESTIGATION_STATUS } from '@/types/enums/enums';
import { DataView } from 'primereact/dataview';
import { Avatar } from 'primereact/avatar';
import { Calendar } from 'primereact/calendar';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import { useRouter } from 'next/navigation';
import LocalDatabase from '@/libs/blue_prints/LocalDatabase';
import inventoryItems from '@/libs/blue_prints/InventoryItems';
import useUserData from '@/libs/hooks/useUserData';
import SettingService from '@/libs/blue_prints/SettingService';
import userService from '@/libs/blue_prints/UserService';
import UsersModel from '@/libs/blue_prints/UsersModel';

const INITIAL_STATE: EnhancedVisitState = {
    currentStep: -1, // Start with patient selection

    // Patient Selection
    selectedPatient: null,
    searchQuery: '',

    // Scheduling Data
    scheduledAppointmentData: null,
    showSchedulingDataDialog: false,

    // Previous Visits
    previousVisits: [],
    showPreviousVisitsDialog: false,
    selectedPreviousVisit: null,

    // Enhanced UI State
    patientAge: null,
    isLoading: true,

    // Original Visit State

    menstrualHistory: {
        lmp: null,
        cycleRegular: null,
        cycleLength: null,
        dysmenorrhea: null,
        dyspareunia: null,
        pms: ''
    },
    contraceptiveHistory: {
        everUsed: null,
        currentMethod: '',
        durationMonths: null,
        reasonDiscontinued: ''
    },
    obstetricHistory: {
        gravida: null,
        paraTerm: null,
        paraPreterm: null,
        paraAbortions: null,
        paraLiving: null,
        miscarriages: null,
        stillbirths: null,
        ectopicPregnancy: null
    },
    fertilityInvestigations: [],
    artCycles: [],
    chronicIllnesses: [],
    surgeries: [],
    physicalExam: {
        weightKg: null,
        heightCm: null,
        bmi: null,
        hirsutism: null,
        thyroid: null,
        bpSystolic: null,
        bpDiastolic: null,
        pulse: null,
        breastFindings: '',
        abdomenFindings: '',
        uterineSize: '',
        ultraSound: ''
    },
    diagnoses: [],
    treatmentPlan: {
        planText: ''
    },
    investigations: [],
    partnerInvestigations: [],
    prescriptions: [],
    review: {
        nextAppointment: new Date(),
        reviewType: '',
        reviewNotes: '',
        assistingDoctor: ''
    },
    showVisitsToday: false,
    uploadingFor: '',
    chiefComplaintChecks: {
        infertility: false,
        anc: false,
        chiefComplaint: ''
    },
    appointments: [],
    selectedAppointment: null,
    ICD11Codes: [],
    crudType: CRUDTYPE.save,
    visitType: '',
    patientsVisits: [],
    visitSearchedDate: changeDateFormat(new Date()),
    drugs: [],
    filteredDrugs: [],
    selectedDrug: null,
    visitId: 0,
    selectedAppointmentType: defaultSelected(),
    queuedPatients: [],
    immutableQueuedPatients: [],
    accountsInfo: {
        chargeConsultation: true,
        chargeHospitalCard: true,
        consultationFee: 0,
        hospitalCardFee: 0,
        discountGiven: 0
    },
    determinedFees: null,
    generalSettings: null,
    searchedVisitsDate: new Date(),
    users: []
};

const investigationService = new InvestigationsModel();
const appointmentService = new Appointments();
const visitService = new PatientVisitationModel();
const localServices = new LocalDatabase();
const inventoryService = new inventoryItems();
const userModel = new UsersModel();
const PatientVisit = () => {
    const [state, setState] = useState<EnhancedVisitState>(INITIAL_STATE);
    const toast = useRef(null);
    const navigator = useRouter();
    const { user } = useUserData<User>();

    const steps = [
        { label: 'Select Patient', icon: 'pi pi-user', description: 'Choose patient' },
        { label: 'Chief Complaint', icon: 'pi pi-comments', description: 'Patient concerns' },
        { label: 'History', icon: 'pi pi-clock', description: 'Medical background' },
        { label: 'Examination', icon: 'pi pi-heart', description: 'Physical findings' },
        { label: 'Assessment', icon: 'pi pi-file-edit', description: 'Diagnosis & plan' },
        { label: 'Orders & Review', icon: 'pi pi-check-circle', description: 'Tests & follow-up' }
    ];

    useEffect(() => {
        document.title = 'Patient Visit Documentation';
        /**
         * Initializes the page by fetching and processing data from various services.
         * This function performs the following operations:
         * - Retrieves the list of appointments for the current date.
         * - Fetches the list of investigations.
         * - Retrieves the visits list based on the searched visit date and appointment type.
         * - Processes the fetched data, including formatting investigations data,
         *   mapping appointment details, and populating state variables for patient and visit information.
         *
         * The state is updated with the transformed data for use in rendering or other operations.
         *
         * Asynchronous function that handles multiple service calls and state updates.
         *
         * @function initPage
         * @async
         */
        const initPage = async () => {
            const users = await userModel.getUserList();
            const investigations = await investigationService.getInvestigationsList();
            const drugs = await inventoryService.getItems();
            const recordableInvestigation: InvestigationRecord[] = investigations.operatedData.map((investigation) => {
                return { ...investigation, selected: false, price: parseFloat(investigation.price.toString()) };
            });
            const partnerRecordableInvestigation: InvestigationRecord[] = investigations.operatedData.map((investigation) => {
                return { ...investigation, selected: false, price: parseFloat(investigation.price.toString()) };
            });
            const hospitalSettings = await SettingService.getHospitalSetting();
            const settings = hospitalSettings.operatedData;
            setStateValue({
                isLoading: false,
                ICD11Codes: remakeDropdown(getICD11Codes(), 'name', 'name'),
                investigations: recordableInvestigation,
                partnerInvestigations: partnerRecordableInvestigation,
                drugs: drugs.operatedData,
                filteredDrugs: drugs.operatedData,
                generalSettings: typeof settings.general === 'string' ? JSON.parse(settings.general) : settings.general,
                determinedFees: typeof settings.fees === 'string' ? JSON.parse(settings.fees) : settings.fees,
                users: users.operatedData
            });
        };
        initPage().catch(console.error);
    }, []);

    useEffect(() => {
        periodicalReloads().catch(console.error);
        // Set up interval to run every 30 seconds
        const intervalId = setInterval(() => {
            periodicalReloads();
        }, 30000); // 30 seconds

        // Cleanup on unmount
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        // Auto-calculate BMI when weight and height change
        if (state.physicalExam.weightKg && state.physicalExam.heightCm) {
            const heightM = state.physicalExam.heightCm / 100;
            const bmi = Number((state.physicalExam.weightKg / (heightM * heightM)).toFixed(1));
            setState((prev) => ({
                ...prev,
                physicalExam: { ...prev.physicalExam, bmi }
            }));
        }
    }, [state.physicalExam.weightKg, state.physicalExam.heightCm]);

    const periodicalReloads = async () => {
        try {
            setStateValue({ isLoading: true });
            //PATIENTS THAT HAS BEEN BOOKED FOR APPEARANCE TODAY
            const response = await appointmentService.getPendingAppointments(changeDateFormat(new Date()));

            //PATIENTS THAT HAVE GONE TO SEE DOCTOR ALREADY
            const visitsList = await visitService.getConsultationPatients<TPatientVisitRecord>();

            const consultedPatients = visitsList.operatedData.map((visit) => visit.patientId);

            const patientsBookForToday = response.operatedData.map((appointment) => {
                const appointmentDetails: Appointment = JSON.parse(appointment.appointmentDetails as string);
                const patient: TPatient = typeof appointment.patient === 'string' ? JSON.parse(appointment.patient) : appointment.patient;
                return { ...patient, lastVisit: appointment.lastVisit, appointmentType: appointmentDetails.appointmentType };
            });
            console.log(consultedPatients);
            console.log(patientsBookForToday);
            const queuedPatients = patientsBookForToday.filter((patient) => !consultedPatients.includes(patient.patientId));
            setStateValue({
                isLoading: false,
                appointments: response.operatedData,
                queuedPatients: queuedPatients,
                immutableQueuedPatients: queuedPatients
            });
        } catch (error) {
            console.log(error);
        } finally {
            setStateValue({ isLoading: false });
        }
    };

    const setStateValue = (updates: Partial<EnhancedVisitState>) => {
        setState((prev) => ({ ...prev, ...updates }));
    };

    const addNewItem = <T extends keyof EnhancedVisitState>(arrayKey: T, newItem: any) => {
        setState((prev) => ({
            ...prev,
            [arrayKey]: [...(prev[arrayKey] as any[]), newItem],
            selectedDrug: null,
            filteredDrugs: state.drugs
        }));
    };

    const removeItem = <T extends keyof EnhancedVisitState>(arrayKey: T, index: number) => {
        setState((prev) => ({
            ...prev,
            [arrayKey]: (prev[arrayKey] as any[]).filter((_, i) => i !== index)
        }));
    };

    const nextStep = () => {
        if (state.currentStep < steps.length - 1) {
            setStateValue({ currentStep: state.currentStep + 1 });
        }
    };

    const prevStep = () => {
        if (state.currentStep > -1) {
            setStateValue({ currentStep: state.currentStep - 1 });
        }
    };
    const getPatientAge = (dateOfBirth: Date | string) => {
        const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        return age;
    };

    const selectPatient = (patient: TPatient, appointmentType: string, crudType: CRUDTYPE, visitRecording: TFollowupRecord) => {
        setStateValue({ isLoading: true });
        const age = getPatientAge(patient.dateOfBirth || new Date());

        const nextLocation =
            appointmentType === AppointmentType.initialConsultation
                ? '/hospital/enhanced'
                : appointmentType === AppointmentType.followupVisit
                ? '/hospital/visit/followup'
                : appointmentType === AppointmentType.testResultsReview
                ? '/hospital/lab/review'
                : appointmentType === AppointmentType.procedureConsultation
                ? '/hospital/procedures/consultation'
                : appointmentType === AppointmentType.postProcedureCheck
                ? '/hospital/procedures/followup'
                : '/hospital/enhanced';

        if (appointmentType !== 'Initial Consultation') {
            localServices.setSelectedPatient(patient, crudType, visitRecording).then((data) => {
                navigator.push(nextLocation);
            });
        }
        setStateValue({
            selectedPatient: patient,
            patientAge: age,
            currentStep: -1, // Reset to first step after patient selection
            visitType: appointmentType,
            isLoading: false,
            accountsInfo: crudType === CRUDTYPE.save ? { ...state.accountsInfo, hospitalCardFee: state.determinedFees.hospitalCardFee, consultationFee: state.determinedFees.consultationFee } : state.accountsInfo
        });

        // Load patient's scheduling data and previous visits
        if (crudType === CRUDTYPE.save) {
            loadPatientData(patient.patientId, patient).catch(console.error);
        }

        loadPreviousData(patient.patientId).catch(console.error);
    };
    const loadPatientData = async (patientId: number, patient: TPatient) => {
        const patientAppointment = state.appointments.find((a) => a.patientId === patientId);
        const appointment: Appointment = JSON.parse(patientAppointment.appointmentDetails as string);
        try {
            const scheduledData = {
                patient: patient,
                selectPatient: patient,
                doctor: typeof patientAppointment.doctor === 'string' ? JSON.parse(patientAppointment.doctor) : patientAppointment.doctor,
                appointmentDate: new Date(patientAppointment.appointmentDate),
                appointmentTime: appointment.appointmentTime,
                appointmentType: appointment.appointmentType,
                status: appointment.status,
                vitalSigns: appointment.vitalSigns,
                measurements: appointment.measurements,
                notes: appointment.notes,
                estimatedDuration: appointment.estimatedDuration,
                priority: appointment.priority
            };
            setStateValue({
                selectedAppointment: patientAppointment,
                scheduledAppointmentData: scheduledData
            });
        } catch (error) {
            console.error('Error loading patient data:', error);
        }
    };
    const loadPreviousData = async (patientId: number) => {
        const visits = await visitService.getPatientPreviousVisits(patientId);
        const previousVisits = getPatientPreviousVisits(visits.operatedData);
        setStateValue({
            previousVisits: previousVisits
        });
    };
    const renderStepContent = () => {
        switch (state.currentStep) {
            case -1: // Patient Selection
                return <PatientSelection />;
            case 0: // Chief Complaint
                return <ChiefComplaint />;
            case 1: // History
                return <MedicalHistory />;
            case 2: // Examination
                return <PatientExamination />;
            case 3: // Assessment
                return <Assessment />;
            case 4: // Orders & Review
                return <OrdersAndReview state={state} setStateValue={setStateValue} addNewItem={addNewItem} removeItem={removeItem} />;
            default:
                return <PatientSelection />;
        }
    };

    const completeDiagnosis = async () => {
        try {
            const selectedInvestigations = state.investigations.filter((investigation) => investigation.selected);
            const selectedPartnerInvestigations = (state.partnerInvestigations || []).filter((investigation) => investigation.selected);
            const { artCycles, chiefComplaintChecks, chronicIllnesses, contraceptiveHistory, diagnoses, fertilityInvestigations, menstrualHistory, obstetricHistory, physicalExam, prescriptions, review, surgeries, treatmentPlan } = state;

            const stateValues: TPatientVisitRecord = {
                visitRecordings: {
                    artCycles,
                    chiefComplaintChecks,
                    chronicIllnesses,
                    contraceptiveHistory,
                    diagnoses,
                    fertilityInvestigations,
                    menstrualHistory,
                    obstetricHistory,
                    physicalExam,
                    prescriptions: prescriptions
                        .map((prescription) => {
                            const { selectedItem, ...rest } = prescription;
                            return rest;
                        })
                        .filter((prescription) => prescription.medicationName !== undefined),
                    review,
                    surgeries,
                    treatmentPlan,
                    investigations: selectedInvestigations,
                    partnerInvestigations: selectedPartnerInvestigations,
                    visitType: state.visitType,
                    accountsInfo: state.accountsInfo
                },
                patientId: state.selectedPatient.patientId,
                visitDate: changeDateFormat(new Date()),
                doctorId: user.userId,
                visitId: state.visitId,
                investigationStatus: selectedInvestigations.length > 0 ? INVESTIGATION_STATUS.pending : INVESTIGATION_STATUS.completed
            };

            setStateValue({ isLoading: true });

            const response = await visitService.addNewPatientVisit(stateValues, state.crudType);

            if (response.operationalStatus === 3) {
                displayMessage({ header: 'Record Exists', message: `A record exists for patient for today on the appointment type ${state.visitType}. You can edit such data for patient.`, life: 3000, toastComponent: toast, infoType: 'warn' });
                return;
            }
            if (response.status === 200 && response.operatedData !== undefined) {
                if (state.crudType === CRUDTYPE.save) {
                    // add newly saved to visited patients and remove patient from queue.
                    const currentQueuedPatients = state.immutableQueuedPatients.filter((patient) => patient.patientId !== response.operatedData.patientId);
                    setStateValue({ patientsVisits: [...state.patientsVisits, response.operatedData], queuedPatients: currentQueuedPatients, immutableQueuedPatients: currentQueuedPatients });
                } else {
                    // here patient was edited and definitely on queued list.
                    setStateValue({
                        patientsVisits: state.patientsVisits.map((visit) => {
                            if (visit.visitId === state.visitId) {
                                return { ...response.operatedData };
                            }
                            return visit;
                        })
                    });
                }
                displayMessage({ header: 'Success', message: 'Patient data was successfully saved', life: 3000, toastComponent: toast, infoType: 'success' });

                setTimeout(async () => {
                    resetState();
                    await localServices.clearSelectedPatient();
                }, 3000);
            }
        } catch (error) {
            console.log(error);
        }
    };
    const resetState = () => {
        const {
            artCycles,
            chiefComplaintChecks,
            chronicIllnesses,
            contraceptiveHistory,
            diagnoses,
            fertilityInvestigations,
            menstrualHistory,
            obstetricHistory,
            physicalExam,
            prescriptions,
            review,
            surgeries,
            treatmentPlan,
            visitId,
            selectedPatient,
            visitType,
            crudType,
            selectedAppointment,
            selectedPreviousVisit,
            previousVisits,
            partnerInvestigations
        } = INITIAL_STATE;
        setStateValue({
            artCycles,
            chiefComplaintChecks,
            chronicIllnesses,
            contraceptiveHistory,
            diagnoses,
            fertilityInvestigations,
            menstrualHistory,
            obstetricHistory,
            physicalExam,
            prescriptions,
            review,
            surgeries,
            treatmentPlan,
            visitId,
            selectedPatient,
            visitType,
            crudType,
            selectedAppointment,
            selectedPreviousVisit,
            previousVisits,
            partnerInvestigations,
            currentStep: -1,
            isLoading: false
        });
    };
    const getProgressPercentage = () => {
        if (state.currentStep === -1) return 0;
        return ((state.currentStep + 1) / (steps.length - 1)) * 100;
    };
    const onEditClick = (visit: TPatientVisitRecord) => {
        try {
            setStateValue({ isLoading: true });
            const patient = typeof visit.patient === 'string' ? JSON.parse(visit.patient as string) : visit.patient;
            const visitDetails: TVisitRecord = JSON.parse(visit.visitRecordings as string);

            const { investigations, prescriptions, partnerInvestigations: savedPartnerInvestigations, ...rest } = visitDetails;
            const selectedInvestigations = investigations.map((investigation) => investigation.testName);
            const selectedPartnerInvestigations = (savedPartnerInvestigations || []).map((investigation: any) => investigation.testName);

            // only set local if appointment type is initial consultation.
            if (visit.visitType === AppointmentType.initialConsultation) {
                setStateValue({
                    ...rest,
                    prescriptions: prescriptions.map((prescription) => ({ ...prescription, selectedItem: state.drugs.find((drug) => drug.itemId === prescription.medicationId) })),
                    review: { ...visitDetails.review, nextAppointment: new Date(visitDetails.review.nextAppointment) },
                    investigations: state.investigations.map((investigation) => ({ ...investigation, selected: selectedInvestigations.includes(investigation.testName) })),
                    partnerInvestigations: (state.partnerInvestigations || []).map((investigation) => ({ ...investigation, selected: selectedPartnerInvestigations.includes(investigation.testName) })),
                    showVisitsToday: false,
                    currentStep: 1,
                    crudType: CRUDTYPE.update,
                    visitId: visit.visitId
                });
            }

            setTimeout(() => {
                selectPatient(patient, visitDetails.visitType, CRUDTYPE.update, visit as unknown as TFollowupRecord);
            }, 1000);
        } catch (error) {
            console.log(error);
        } finally {
            setStateValue({ isLoading: false });
        }
    };

    const onChangeVisitsDate = async (e: any) => {
        try {
            const date = e.target.value;
            setStateValue({ isLoading: true });
            const dayVisits = await visitService.getVisitsList<TPatientVisitRecord>(changeDateFormat(new Date(date)), AppointmentType.initialConsultation);
            setStateValue({ patientsVisits: dayVisits.operatedData, searchedVisitsDate: date });
        } catch (error) {
            console.log(error);
        } finally {
            setStateValue({ isLoading: false });
        }
    };

    const deletePatientVisit = async (visitId: number) => {
        confirmDialog({
            message: 'Are you sure you want to delete this visit?',
            header: 'Confirm Visit Delete',
            icon: 'pi pi-exclamation-triangle',
            accept() {
                try {
                    setStateValue({ isLoading: true });
                    visitService.deletePatientVisit(visitId).then((data) => {
                        if (data.operatedData === 1) {
                            setStateValue({ patientsVisits: state.patientsVisits.filter((visit) => visit.visitId !== visitId) });
                        }
                    });
                } catch (error) {
                    console.log(error);
                } finally {
                    setStateValue({ isLoading: false });
                }
            }
        });
    };
    const ViewPatientsVisit = (visit: TPatientVisitRecord) => {
        const visitDetails: TVisitRecord = JSON.parse(visit.visitRecordings as string);
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
                            <div className="col-2">{visitDetails.visitType}</div>
                            <div className="col-3">{visitDetails?.diagnoses?.length ? visitDetails.diagnoses[0]?.code : ''}</div>
                            <div className="col-2">
                                <Button icon="pi pi-pencil" className="p-button-outlined mr-2" onClick={() => onEditClick(visit)} loading={state.isLoading} />
                                <Button icon="pi pi-trash" className="p-button-danger p-button-outlined" onClick={() => deletePatientVisit(visit.visitId)} />
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    };

    return (
        <div className="grid">
            <GeneralPageProps toastRef={toast} toastPosition="bottom-right" />
            <ConfirmDialog />
            {/* Progress Header */}
            <div className="col-12">
                <Card className="shadow-3">
                    <div className="flex align-items-center justify-content-between mb-4">
                        <div>
                            <h3 className="m-0 text-primary">
                                Patient Visit Documentation -{' '}
                                {state.selectedPatient && (
                                    <span className="text-pink-600">
                                        {state.selectedPatient.firstName} {state.selectedPatient.lastName}
                                    </span>
                                )}
                            </h3>
                            <p className="text-600 m-0">{state.selectedPatient ? `Complete clinical documentation for ${state.selectedPatient.firstName} ${state.selectedPatient.lastName}` : 'Select a patient to begin documentation'}</p>
                        </div>
                        <Tag value={state.currentStep === -1 ? 'Select Patient' : `Step ${state.currentStep + 1} of ${steps.length - 1}`} severity="info" className="text-lg" />
                    </div>

                    {state.selectedPatient && <ProgressBar value={getProgressPercentage()} className="mb-4" style={{ height: '14px' }} />}

                    <div className="grid">
                        {steps.map((step, index) => {
                            const adjustedIndex = index - 1; // Adjust for patient selection step
                            const isActive = index === 0 ? state.currentStep === -1 : state.currentStep === adjustedIndex;
                            const isCompleted = index === 0 ? state.selectedPatient !== null : state.currentStep > adjustedIndex;

                            return (
                                <div key={index} className="col-12 md:col-2">
                                    <div
                                        className={`text-center p-3 border-round-md transition-colors transition-duration-300 cursor-pointer ${
                                            isActive ? 'bg-primary text-white shadow-3' : isCompleted ? 'bg-green-100 text-green-800 border-1 border-green-300' : 'bg-gray-50 text-600 border-1 border-gray-300'
                                        }`}
                                        onClick={() => {
                                            if (index === 0) {
                                                setStateValue({ currentStep: -1 });
                                            } else if (state.selectedPatient) {
                                                setStateValue({ currentStep: adjustedIndex });
                                            }
                                        }}
                                    >
                                        <div className="flex flex-column align-items-center gap-2">
                                            <i className={`${step.icon} text-2xl`} />
                                            <div>
                                                <div className="font-bold text-sm">{step.label}</div>
                                                <small className="opacity-80">{step.description}</small>
                                            </div>
                                            {isCompleted && <i className="pi pi-check-circle text-lg" />}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>

            {/* Main Content */}
            <div className="col-12">
                <PatientVisitContext.Provider
                    value={{
                        state,
                        setStateValue,
                        addNewItem,
                        removeItem,
                        selectPatient,
                        getPatientAge
                    }}
                >
                    <div style={{ maxHeight: 'calc(100vh - 450px)', overflowY: 'auto', overflowX: 'hidden', paddingBottom: '100px' }}>{renderStepContent()}</div>

                    {/* Navigation only shows after patient selection */}
                    {state.selectedPatient && (
                        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-4 border-top-1 border-200 p-1 z-5" style={{ marginLeft: '0' }}>
                            <div className="flex justify-content-between align-items-center max-w-full mx-auto px-3">
                                <Button label="Previous" icon="pi pi-chevron-left" onClick={prevStep} disabled={state.currentStep <= -1} className="p-button-outlined" size="large" />

                                <div className="flex gap-3">
                                    <Button label="Save Draft" icon="pi pi-save" className="p-button-outlined" size="large" />
                                    {state.crudType === CRUDTYPE.update && <Button label="Cancel Update" icon="pi pi-times" className="p-button-danger" size="large" onClick={resetState} />}

                                    {state.currentStep === steps.length - 2 ? (
                                        <Button label={state.crudType === CRUDTYPE.save ? 'Complete Visit' : 'Update Visit'} icon="pi pi-check" className="p-button-success" size="large" onClick={completeDiagnosis} loading={state.isLoading} />
                                    ) : (
                                        <Button label="Next" icon="pi pi-chevron-right" iconPos="right" onClick={nextStep} size="large" disabled={state.currentStep >= steps.length - 2} />
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Dialogs */}
                    <PreVisitInformationDisplay />
                    <PreviousVisitsHistory />
                </PatientVisitContext.Provider>
            </div>

            {/* File Upload Dialog */}
            <Dialog onShow={() => onChangeVisitsDate({ target: { value: new Date() } })} header={`Patients Visits Today`} visible={state.showVisitsToday} onHide={() => setStateValue({ showVisitsToday: false })} maximized modal>
                <div className="flex flex-column p-fluid w-full">
                    <div className="flex justify-content-center align-items-center mb-4">
                        <div className="field">
                            <label htmlFor="appointmentDate" className="mb-2">
                                Select Appointment Date to Filter
                            </label>
                            <Calendar selectionMode={'single'} onChange={onChangeVisitsDate} showIcon value={state.searchedVisitsDate as Date} />
                        </div>
                    </div>
                    {state.patientsVisits.length > 0 ? (
                        <>
                            <div className="grid font-bold text-xl">
                                <div className="col-3">Patient</div>
                                <div className="col-2">Doctor</div>
                                <div className="col-2">Visit Type</div>
                                <div className="col-3">Treatment</div>
                                <div className="col-2">Actions</div>
                            </div>
                            <DataView value={state.patientsVisits} dataKey={'visitId'} rows={10} paginator itemTemplate={ViewPatientsVisit} />
                        </>
                    ) : (
                        <>
                            <div className="flex justify-content-center align-items-center">
                                <div className="text-center text-2xl">
                                    <h6>No Recorded Visit for the selected day!</h6>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </Dialog>
        </div>
    );
};

export default PatientVisit;
// /usr/bin/mariadb-dump -u myeapqrp_app_store_user -p myeapqrp_many_apps > /home/myeapqrp/appstoredata/db.sql
// /usr/bin/mariadb -u myeapqrp_app_store_user -p myeapqrp_many_apps < /home/myeapqrp/appstoredata/db.sql
// O]S0auncAymL
