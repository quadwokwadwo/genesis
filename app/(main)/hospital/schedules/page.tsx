'use client';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { Steps } from 'primereact/steps';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Badge } from 'primereact/badge';
import { useEffect, useRef, useState } from 'react';
import { Appointment, AppointmentSlot, Doctor, Measurements, PreVisitInfo, SchedulingState, TTodaysAppointments, VitalSigns } from '@/types/hospital';
import PatientSelection from '@/app/(main)/hospital/schedules/components/PatientSelection';
import DoctorSelection from '@/app/(main)/hospital/schedules/components/DoctorSelection';
import AppointmentSchedule from '@/app/(main)/hospital/schedules/components/AppointmentSchedule';
import PreVisitInformation from '@/app/(main)/hospital/schedules/components/PreVisitInformation';
import ScheduleConfirmation from '@/app/(main)/hospital/schedules/components/ScheduleConfirmation';
import { PatientScheduleContext } from '@/libs/contextProviders/AppContexts';
import { MenuItem } from 'primereact/menuitem';
import NavigationButtons from '@/app/(main)/hospital/schedules/components/NavigationButtons';
import PatientsModel from '@/libs/blue_prints/Patients';
import UsersModel from '@/libs/blue_prints/UsersModel';
import Patients from '@/app/(main)/hospital/patients/page';
import { Button } from 'primereact/button';
import { changeDateFormat, defaultSelected, displayMessage, getAppointmentTypes, pageDataValidation } from '@/libs/utils';
import Appointments from '@/libs/blue_prints/Appointments';
import { validateAppointment } from '@/libs/joiValidations';
import { AppointmentType, CRUDTYPE } from '@/types/enums/enums';
import { GeneralPageProps } from '@/libs/utilityComponents';

// \TypeScript
type OperationStatus = 1 | 2 | 3; // 1: created, 2: updated, 3: exists
const INITIAL_VITAL_SIGNS: VitalSigns = {
    temperature: 0,
    heartRate: 0,
    respiratoryRate: 0,
    bloodPressureSystolic: 0,
    bloodPressureDiastolic: 0,
    oxygenSaturation: 0,
    painScale: 0
};

const INITIAL_MEASUREMENTS: Measurements = {
    height: 0,
    weight: 0,
    bmi: 0,
    headCircumference: 0,
    waistCircumference: 0
};

const INITIAL_PRE_VISIT_INFO: PreVisitInfo = {
    chiefComplaint: '',
    symptoms: [],
    medicationsCurrently: '',
    allergies: '',
    emergencyContact: '',
    emergencyPhone: '',
    insuranceInfo: '',
    specialInstructions: ''
};

const INITIAL_STATE: SchedulingState = {
    currentStep: 0,
    selectedPatient: null,
    searchQuery: '',
    patients: [],
    doctors: [],
    selectedDoctor: null,
    selectedDate: null,
    availableSlots: [],
    selectedSlot: null,
    appointment: {
        appointmentId: 0,
        appointmentDate: null,
        appointmentTime: '',
        appointmentType: AppointmentType.initialConsultation,
        status: 'Scheduled',
        vitalSigns: { ...INITIAL_VITAL_SIGNS },
        measurements: { ...INITIAL_MEASUREMENTS },
        notes: '',
        estimatedDuration: 60,
        priority: 'Routine',
        patientId: null,
        doctorId: null
    },
    showPatientDialog: false,
    showVitalSignsDialog: false,
    appointmentTypes: [],
    selectedAppointmentType: defaultSelected(),
    symptoms: ['Irregular periods', 'Pelvic pain', 'Fertility concerns', 'Abnormal bleeding', 'Nausea/Vomiting', 'Headache', 'Fatigue', 'Abdominal pain', 'Breast tenderness', 'Mood changes'],
    todaysAppointments: [],
    crudType: CRUDTYPE.save,
    showAppointmentsToday: false,
    isLoading: true,
    searchableAppointmentDate: new Date(),
    savedTodayAppointments: []
};

const patient = new PatientsModel();
const doctor = new UsersModel();
const appointmentService = new Appointments();
const PatientScheduling = () => {
    const [state, setState] = useState<SchedulingState>(INITIAL_STATE);
    const toast = useRef(null);

    const steps: MenuItem[] = [
        { label: 'Patient', icon: 'pi pi-user' },
        { label: 'Doctor', icon: 'pi pi-users' },
        { label: 'Schedule', icon: 'pi pi-calendar' },
        { label: 'Pre-Visit', icon: 'pi pi-file-edit' },
        { label: 'Confirm', icon: 'pi pi-check' }
    ];

    useEffect(() => {
        document.title = 'Patient Scheduling';
        const initSchedules = async () => {
            const { doctors, patients, todaysAppointments } = await loadPatients();
            const parsedAppointments: TTodaysAppointments[] = todaysAppointments.map((appointment: TTodaysAppointments) => ({
                ...appointment,
                appointmentDetails: JSON.parse(appointment.appointmentDetails as string),
                doctor: JSON.parse(appointment.doctor as string),
                patient: JSON.parse(appointment.patient as string)
            }));

            setStateValue({
                patients,
                doctors: doctors.map((doctor: Doctor) => ({ ...doctor, available: true, rating: 5 })),
                appointmentTypes: getAppointmentTypes(),
                todaysAppointments: parsedAppointments,
                savedTodayAppointments: parsedAppointments,
                isLoading: false
            });
        };
        initSchedules().catch(console.error);
    }, []);

    // Auto-calculate BMI when height and weight change
    useEffect(() => {
        if (state.appointment.measurements.height && state.appointment.measurements.weight) {
            const heightM = state.appointment.measurements.height / 100;
            const bmi = Number((state.appointment.measurements.weight / (heightM * heightM)).toFixed(1));
            setState((prev) => ({
                ...prev,
                appointment: {
                    ...prev.appointment,
                    measurements: { ...prev.appointment.measurements, bmi }
                }
            }));
        }
    }, [state.appointment.measurements.height, state.appointment.measurements.weight]);

    const setStateValue = (updates: Partial<SchedulingState>) => {
        setState((prev) => ({ ...prev, ...updates }));
    };

    /**
     * Asynchronously generates a list of time slots for scheduling appointments
     * based on the selected doctor, date, and today's appointments.
     */
    const generateTimeSlots = (todaysAppointments: TTodaysAppointments[]) => {
        const bookedTimesToday = todaysAppointments.map((todayAppointment) => {
            const appointmentDetails = todayAppointment.appointmentDetails as Appointment;
            return appointmentDetails.appointmentTime;
        });

        const slots: AppointmentSlot[] = [];
        const startHour = 9; // 9 AM
        const endHour = 23; // 11 PM
        const endMinute = 30; // Last slot at 11:30 PM
        const slotDuration = 30; // 30 minutes

        for (let hour = startHour; hour <= endHour; hour++) {
            for (let minute = 0; minute < 60; minute += slotDuration) {
                if (hour === endHour && minute > endMinute) break;
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                slots.push({
                    slotId: `${hour}${minute}`,
                    time: timeString,
                    available: !bookedTimesToday.includes(timeString), // Simulate availability
                    duration: slotDuration
                });
            }
        }
        return slots;
    };
    const loadPatients = async () => {
        try {
            const response = await patient.getPatientsList();
            const doctorsResponse = await doctor.getDoctorListOnly();
            const appointments = await appointmentService.getAppointmentsList(changeDateFormat(new Date(state.searchableAppointmentDate)));
            return { patients: response.operatedData, doctors: doctorsResponse.operatedData, todaysAppointments: appointments.operatedData };
        } catch (error) {
            throw new Error(error);
        }
    };

    const getPatientAge = (dateOfBirth: Date) => {
        const today = new Date();
        let age = today.getFullYear() - dateOfBirth.getFullYear();
        const monthDiff = today.getMonth() - dateOfBirth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
            age--;
        }
        return age;
    };

    const renderStepContent = () => {
        switch (state.currentStep) {
            case 0: // PatientExtra Selection
                return <PatientSelection />;

            case 1: // Doctor Selection
                return <DoctorSelection />;

            case 2: // Schedule Selection
                return <AppointmentSchedule />;

            case 3: // Pre-Visit Information
                return <PreVisitInformation />;

            case 4: // Confirmation
                return <ScheduleConfirmation />;

            default:
                return null;
        }
    };
    const onAddNewPatientComplete = async () => {
        const response = await patient.getPatientsList();
        setStateValue({ showPatientDialog: false, patients: response.operatedData });
    };

    const scheduleAppointment = async () => {
        const { appointment, crudType, savedTodayAppointments } = state;

        // Early validation exit
        const isValid = pageDataValidation(validateAppointment, appointment, toast);
        if (!isValid) return;

        setStateValue({ isLoading: true });

        try {
            const response = await appointmentService.addNewAppointment(appointment, crudType);
            // If you must keep original `appointment.addNewAppointment`, keep the name:
            // const response = await appointment.addNewAppointment(appointment, crudType);

            const { status, operationalStatus, operatedData } = response as {
                status: number;
                operationalStatus: OperationStatus;
                operatedData?: TTodaysAppointments;
            };

            // Branch by operation: created vs updated
            if (operationalStatus === 1) {
                displayMessage({
                    header: 'Appointment Scheduled',
                    message: 'Appointment was successfully scheduled for selected patient for the chosen date!',
                    infoType: 'success',
                    life: 3000,
                    toastComponent: toast
                });
                const appointmentsList = [...savedTodayAppointments, { ...operatedData, appointmentDetails: JSON.parse(operatedData.appointmentDetails as string) }];
                setStateValue({
                    todaysAppointments: appointmentsList,
                    appointment, // keep latest form data if desired
                    currentStep: 0,
                    crudType: CRUDTYPE.save,
                    savedTodayAppointments: appointmentsList
                });
            } else if (operationalStatus === 2) {
                displayMessage({
                    header: 'Appointment Updated',
                    message: 'Appointment was successfully updated for selected patient for the chosen date!',
                    infoType: 'success',
                    life: 3000,
                    toastComponent: toast
                });
                const updatedAppointments = savedTodayAppointments.map((a: TTodaysAppointments) => (a.appointmentId === operatedData.appointmentId ? { ...operatedData, appointmentDetails: appointment as Appointment } : a));
                setStateValue({
                    todaysAppointments: updatedAppointments,
                    appointment,
                    currentStep: 0,
                    savedTodayAppointments: updatedAppointments
                });
            }

            // Reset form or navigate
            resetAppointment();
        } catch (err) {
            // Keep original error, avoid wrapping non-Error
            const error = err instanceof Error ? err : new Error(String(err));
            displayMessage({
                header: 'Error',
                message: 'An unexpected error occurred. Please try again.',
                infoType: 'error',
                life: 3000,
                toastComponent: toast
            });
        } finally {
            setStateValue({ isLoading: false });
        }
    };

    const executeAppointmentDelete = async (appointmentId: number) => {
        try {
            setStateValue({ isLoading: true });
            const deleteResponse = await appointmentService.deleteAppointment(appointmentId);
            if (deleteResponse.operatedData === 1) {
                displayMessage({ header: 'Appointment Deleted', message: 'Scheduled appointment was successfully deleted!', infoType: 'success', life: 3000, toastComponent: toast });
                setStateValue({ todaysAppointments: state.todaysAppointments.filter((appointment: TTodaysAppointments) => appointment.appointmentId !== appointmentId) });
            }
        } catch (error) {
            throw new Error(error);
        } finally {
            setStateValue({ isLoading: false });
        }
    };
    const onClickToEditAppointment = async (appointment: TTodaysAppointments) => {
        const availableSlots = generateTimeSlots(state.todaysAppointments);

        const appointmentDetails: Appointment = typeof appointment.appointmentDetails === 'string' ? JSON.parse(appointment.appointmentDetails) : (appointment.appointmentDetails as Appointment);

        setStateValue({
            appointment: { ...appointmentDetails, appointmentId: appointment.appointmentId, appointmentDate: new Date(appointmentDetails.appointmentDate), patientId: appointment.patientId, doctorId: appointment.doctorId },
            crudType: CRUDTYPE.update,
            selectedPatient: state.patients.find((patient) => patient.patientId === appointmentDetails.patientId),
            selectedAppointmentType: state.appointmentTypes.find((appointment) => appointment.name === appointmentDetails.appointmentType),
            selectedDate: new Date(appointmentDetails.appointmentDate),
            selectedSlot: availableSlots.find((slot) => slot.time === appointmentDetails.appointmentTime),
            selectedDoctor: state.doctors.find((doctor) => doctor.userId === appointmentDetails.doctorId),
            showAppointmentsToday: false,
            currentStep: 1
        });
    };
    const resetAppointment = () => {
        setStateValue({
            appointment: { ...INITIAL_STATE.appointment, appointmentId: 0, appointmentDate: new Date(), patientId: null, doctorId: null },
            crudType: CRUDTYPE.save,
            selectedPatient: null,
            selectedDoctor: null,
            currentStep: 0,
            selectedAppointmentType: defaultSelected(),
            selectedDate: new Date(),
            selectedSlot: null
        });
    };
    const onAppointmentDateChange = async (e: any) => {
        try {
            setStateValue({ isLoading: true });
            const dateAppointments = await appointmentService.getAppointmentsList(changeDateFormat(new Date(e.value)));
            setStateValue({
                todaysAppointments: dateAppointments.operatedData,
                searchableAppointmentDate: new Date(e.value)
            });
        } catch (error) {
            throw new Error(error);
        } finally {
            setStateValue({ isLoading: false });
        }
    };
    return (
        <div className="grid p-fluid">
            <GeneralPageProps toastRef={toast} toastPosition="top-right" />
            {/* Progress Header */}
            {state.showPatientDialog ? (
                <>
                    <Button label="Back to Appointments" onClick={onAddNewPatientComplete} className="w-fit mb-2" icon="pi pi-arrow-left" />
                    <Patients />
                </>
            ) : (
                <>
                    <div className="col-12">
                        <Card className="shadow-3">
                            <div className="flex align-items-center justify-content-between mb-4">
                                <div>
                                    <h3 className="m-0 text-primary">Patient Scheduling</h3>
                                    <p className="text-600 m-0">Schedule appointments with vital signs collection</p>
                                </div>
                                <Badge value={`${state.currentStep + 1}/${steps.length}`} size="large" />
                            </div>

                            <Steps model={steps} activeIndex={state.currentStep} onSelect={(e) => setStateValue({ currentStep: e.index })} readOnly={false} className="mb-4" />
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="col-12">
                        <PatientScheduleContext.Provider
                            value={{
                                state,
                                setStateValue,
                                getPatientAge,
                                steps,
                                scheduleAppointment,
                                removeAppointment: executeAppointmentDelete,
                                editAppointment: onClickToEditAppointment,
                                generateTimeSlots,
                                onAppointmentDateChange,
                                resetAppointment
                            }}
                        >
                            {renderStepContent()}
                            <Divider />
                            <NavigationButtons />
                        </PatientScheduleContext.Provider>
                    </div>
                </>
            )}
            <ConfirmDialog />
        </div>
    );
};

export default PatientScheduling;
