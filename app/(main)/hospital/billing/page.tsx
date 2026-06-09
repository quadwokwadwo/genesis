// app/(main)/hospital/billing/verification/page.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { TabPanel, TabView } from 'primereact/tabview';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { changeDateFormat, defaultSelected, formatCurrency, frequencyOptions, showPageTitle } from '@/libs/utils';
import { BillingItem, BillingSummary, Investigation, PrescriptionRecord, TBillPageState, TodayPatient, TPatient, TPatientVisitRecord, User } from '@/types/hospital';
import PatientsModel from '@/libs/blue_prints/Patients';
import { AppointmentType, BillPrintingDisplayType } from '@/types/enums/enums';
import SettingService from '@/libs/blue_prints/SettingService';
import useUserData from '@/libs/hooks/useUserData';
import { BillingContext } from '@/libs/contextProviders/AppContexts';
import TodayVisits from '@/app/(main)/hospital/billing/components/TodayVisits';
import PatientBill from '@/app/(main)/hospital/billing/components/PatientBill';
import BillingPrescriptions from '@/app/(main)/hospital/billing/components/BillingPrescriptions';
import BillingInvestigations from '@/app/(main)/hospital/billing/components/BillingInvestigations';
import BillingPartnerInvestigations from '@/app/(main)/hospital/billing/components/BillingPartnerInvestigations';
import { AddInvestigation, CustomerCharge, PrescriptionItemView } from '@/app/(main)/hospital/billing/components/Popups';
import BillsList from '@/app/(main)/hospital/billing/components/BillsList';
import BillService from '@/libs/blue_prints/BillService';
import { Dialog } from 'primereact/dialog';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Calendar } from 'primereact/calendar';

// Types

const INITIAL_STATE: TBillPageState = {
    activeIndex: 0,
    availableDrugs: [],
    billingItems: [],
    billingSummary: {
        balance: 0,
        discount: 0,
        amountPaid: 0,
        paymentMethod: 'Cash',
        selectedPaymentMethod: defaultSelected(),
        tax: 0,
        total: 0,
        subtotal: 0
    } as BillingSummary,
    customCharge: { amount: 0, description: '' },
    determinedFees: null,
    externalInvestigations: [],
    externalPrescriptions: [],
    generalSettings: null,
    internalInvestigations: [],
    newInvestigation: { price: 0, source: 'External', testName: '' },
    partnerInternalInvestigations: [],
    partnerExternalInvestigations: [],
    partnerSelectedInvestigations: [],
    paymentMethod: '',
    paymentMethods: [],
    printFormat: 'thermal',
    selectedExternalPrescriptions: [],
    selectedInvestigations: [],
    selectedPatient: null,
    selectedPaymentMethod: defaultSelected(),
    selectedTodayPatient: null,
    selectedVisit: null,
    showAddInvestigationDialog: false,
    showCustomChargeDialog: false,
    todayPatients: [],
    isLoading: false,
    user: null,
    selectedPrescription: null,
    showFullPrescriptionDialog: false,
    showCompletedBills: false,
    searchedBillDate: changeDateFormat(new Date()),
    completedPatients: [],
    printType: BillPrintingDisplayType.detailed
};
const BillingVerificationPage = () => {
    const [state, setState] = useState<TBillPageState>(INITIAL_STATE);
    const toast = useRef<Toast>(null);
    const OPRef = useRef<OverlayPanel | null>(null);
    const componentRef = useRef<HTMLDivElement>(null);
    const investigationPrintRef = useRef<HTMLDivElement>(null);
    const externalPrescriptionRef = useRef<HTMLDivElement>(null);

    const { user, isLoaded } = useUserData<User>();

    useEffect(() => {
        if (!isLoaded) return;
        // Run the functions immediately on mount
        showPageTitle('Billing');
        loadTodayPatients();

        // Set up interval to run every 30 seconds
        const intervalId = setInterval(() => {
            loadTodayPatients();
        }, 30000); // 30 seconds

        // Cleanup on unmount
        return () => clearInterval(intervalId);
    }, [isLoaded]);
    useEffect(() => {
        if (state.selectedPatient && state.selectedVisit) {
            generateBillingItems();
        }
    }, [state.selectedPatient, state.selectedVisit, state.selectedInvestigations, state.partnerSelectedInvestigations, state.availableDrugs, state.determinedFees]);
    useEffect(() => {
        const initPage = async () => {
            const hospitalSettings = await SettingService.getHospitalSetting();
            const settings = hospitalSettings.operatedData;
            setStateValue({
                generalSettings: typeof settings.general === 'string' ? JSON.parse(settings.general) : settings.general,
                determinedFees: typeof settings.fees === 'string' ? JSON.parse(settings.fees) : settings.fees,
                printType: typeof settings.fees === 'string' ? JSON.parse(settings.fees).billPrintType : BillPrintingDisplayType.detailed
            });
        };
        initPage().catch((e) => {
            console.log(e);
        });
    }, []);
    const setStateValue = (stateValues: Partial<TBillPageState>) => {
        setState((prevState) => ({ ...prevState, ...stateValues }));
    };
    const loadTodayPatients = async () => {
        setStateValue({ isLoading: true });
        try {
            const response = await PatientsModel.getTodayPatients();
            const visits = response.operatedData;
            const patientsToday: TodayPatient[] = getTodayPatients(visits);
            setStateValue({
                todayPatients: patientsToday,
                user
            });
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: "Failed to load today's patients",
                life: 3000
            });
        } finally {
            setStateValue({ isLoading: false });
        }
    };
    const getTodayPatients = (visits: TPatientVisitRecord[]) => {
        return visits.map((visit) => {
            const recordPatient: TPatient = typeof visit.patient === 'string' ? JSON.parse(visit.patient as string) : visit.patient;
            const visitDetails = typeof visit.visitRecordings === 'string' ? JSON.parse(visit.visitRecordings as string) : visit;
            const { patientId, firstName, lastName, recordNumber, phone, dateOfBirth } = recordPatient;
            const { visitId, doctorName, visitType, status } = visit;

            return {
                patientId,
                firstName,
                lastName,
                recordNumber,
                phone,
                visitId,
                doctorName,
                visitType: visitType as AppointmentType,
                status,
                visitTime: visit.visitDate,
                visitDetails,
                doctorId: visit.doctorId,
                dateOfBirth,
                visitDate: changeDateFormat(new Date(visit.visitDate)),
                gender: recordPatient.gender,
                email: recordPatient.email
            };
        });
    };
    const generateBillingItems = () => {
        if (!state.determinedFees) return;
        const items: BillingItem[] = [];

        // Add consultation fee based on visit type
        if (state.selectedVisit?.visitType === AppointmentType.initialConsultation && state.selectedVisit.accountInfo.chargeConsultation) {
            items.push({
                id: 'consultation',
                description: 'Consultation Fee',
                quantity: 1,
                unitPrice: state.selectedVisit.accountInfo.consultationFee,
                total: state.selectedVisit.accountInfo.consultationFee,
                category: 'Consultation',
                removable: false
            });
        } else if (state.selectedVisit?.visitType === AppointmentType.followupVisit && state.selectedVisit.accountInfo.chargeConsultation) {
            items.push({
                id: 'followup',
                description: 'Follow-up Consultation Fee',
                quantity: 1,
                unitPrice: state.selectedVisit.accountInfo.consultationFee,
                total: state.selectedVisit.accountInfo.consultationFee,
                category: 'Consultation',
                removable: false
            });
        } else if (state.selectedVisit?.visitType === AppointmentType.testResultsReview && state.selectedVisit.accountInfo.chargeConsultation) {
            items.push({
                id: 'Review',
                description: 'Review Fee',
                quantity: 1,
                unitPrice: state.selectedVisit.accountInfo.consultationFee,
                total: state.selectedVisit.accountInfo.consultationFee,
                category: 'Emergency',
                removable: false
            });
        }

        // Add hospital card fee if needed
        if (state.selectedPatient && !state.selectedPatient.hasHospitalCard && state.selectedVisit.accountInfo.chargeHospitalCard) {
            items.push({
                id: 'hospitalCard',
                description: 'Hospital Card Fee (New)',
                quantity: 1,
                unitPrice: state.determinedFees.hospitalCardFee,
                total: state.determinedFees.hospitalCardFee,
                category: 'Registration',
                removable: false
            });
        }

        // Add procedures (internal investigations total) with detailed breakdown
        const selectedInternalInvestigations = state.selectedInvestigations.filter((i) => i.source === 'Internal' && i.selected);
        const internalInvestigationsTotal = selectedInternalInvestigations.reduce((sum, i) => sum + i.price, 0);

        if (internalInvestigationsTotal > 0) {
            items.push({
                id: 'procedures',
                description: 'Procedures/Investigations',
                quantity: 1,
                unitPrice: internalInvestigationsTotal,
                total: internalInvestigationsTotal,
                category: 'Procedures',
                removable: false,
                items: selectedInternalInvestigations.map((inv) => ({
                    name: inv.testName,
                    price: inv.price
                }))
            });
        }

        // Add partner investigations (internal) with detailed breakdown
        const selectedPartnerInternalInvestigations = state.partnerSelectedInvestigations.filter((i) => i.source === 'Internal' && i.selected);
        const partnerInternalInvestigationsTotal = selectedPartnerInternalInvestigations.reduce((sum, i) => sum + i.price, 0);

        if (partnerInternalInvestigationsTotal > 0) {
            items.push({
                id: 'partner_procedures',
                description: 'Partner Procedures/Investigations',
                quantity: 1,
                unitPrice: partnerInternalInvestigationsTotal,
                total: partnerInternalInvestigationsTotal,
                category: 'Procedures',
                removable: false,
                items: selectedPartnerInternalInvestigations.map((inv) => ({
                    name: inv.testName,
                    price: inv.price
                }))
            });
        }

        // Add dispensary charges with detailed drug breakdown
        const availableSelectedDrugs = state.availableDrugs.filter((drug) => drug.selected);
        const dispensaryTotal = availableSelectedDrugs.reduce((sum, drug) => sum + drug.totalPrice, 0);

        if (dispensaryTotal > 0) {
            items.push({
                id: 'dispensary',
                description: 'Dispensary Charges',
                quantity: 1,
                unitPrice: dispensaryTotal,
                total: dispensaryTotal,
                category: 'Pharmacy',
                removable: false,
                items: availableSelectedDrugs.map((drug) => ({
                    name: `${drug.medicationName} (${drug.quantity} ${drug.frequency})`,
                    price: drug.totalPrice,
                    quantity: drug.quantity
                }))
            });
        }

        setStateValue({ billingItems: items });
        // Apply visit-level discount (accountsInfo.discountGiven) if available
        const visitDiscount = Number(state.selectedVisit?.accountInfo?.discountGiven ?? 0) || 0;
        calculateBillingSummary(items, visitDiscount);
    };

    const calculateBillingSummary = (items: BillingItem[], discountOverride?: number) => {
        const subtotal = items.reduce((sum, item) => sum + item.total, 0);
        const tax = (subtotal * state.determinedFees.taxRate) / 100;
        // Determine effective discount: prefer override when provided, else current state's discount
        const rawDiscount = typeof discountOverride === 'number' ? discountOverride : state.billingSummary.discount || 0;
        // Clamp discount to [0, subtotal]
        const discount = Math.max(0, Math.min(Number(rawDiscount) || 0, subtotal));
        const total = subtotal + tax - discount;
        const balance = total - state.billingSummary.amountPaid;
        setStateValue({
            billingSummary: {
                ...state.billingSummary,
                subtotal,
                tax,
                discount,
                total,
                balance: balance > 0 ? balance : 0
            }
        });
    };

    const addCustomCharge = () => {
        if (state.customCharge.description && state.customCharge.amount > 0) {
            const newItem: BillingItem = {
                id: `custom_${Date.now()}`,
                description: state.customCharge.description,
                quantity: 1,
                unitPrice: state.customCharge.amount,
                total: state.customCharge.amount,
                category: 'Custom',
                removable: true
            };

            const updatedItems = [...state.billingItems, newItem];
            calculateBillingSummary(updatedItems);
            setStateValue({
                showCustomChargeDialog: false,
                customCharge: { description: '', amount: 0 },
                billingItems: updatedItems
            });
            toast.current?.show({
                severity: 'success',
                summary: 'Added',
                detail: 'Custom charge added successfully',
                life: 3000
            });
        }
    };

    const addNewInvestigation = () => {
        if (state.newInvestigation.testName && state.newInvestigation.source) {
            const investigation: Investigation = {
                investigationId: Date.now(),
                testName: state.newInvestigation.testName!,
                source: state.newInvestigation.source as 'Internal' | 'External',
                price: state.newInvestigation.source === 'Internal' ? state.newInvestigation.price || 0 : 0,
                selected: true,
                category: 'Custom'
            };

            if (investigation.source === 'Internal') {
                setStateValue({ internalInvestigations: [...state.internalInvestigations, investigation] });
            } else {
                setStateValue({ externalInvestigations: [...state.externalInvestigations, investigation] });
            }

            setStateValue({
                selectedInvestigations: [...state.selectedInvestigations, investigation],
                showAddInvestigationDialog: false,
                newInvestigation: { testName: '', source: 'Internal', price: 0 }
            });
            toast.current?.show({
                severity: 'success',
                summary: 'Added',
                detail: 'Investigation added successfully',
                life: 3000
            });
        }
    };

    // Print Components
    const PrintComponent = React.forwardRef<HTMLDivElement, any>((props, ref) => {
        if (!state.selectedPatient || !state.selectedVisit) return null;

        if (state.printFormat === 'thermal') {
            // Thermal Receipt Format (80mm width)
            return (
                <div
                    ref={ref}
                    style={{
                        width: '80mm',
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        lineHeight: '1.2',
                        padding: '5mm',
                        color: '#000'
                    }}
                >
                    <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{state.generalSettings.hospitalName}</div>
                        <div style={{ fontSize: '10px' }}>{state.generalSettings.address}</div>
                        <div style={{ fontSize: '10px' }}>Tel: {state.generalSettings.phone}</div>
                        <div style={{ margin: '10px 0', borderBottom: '1px solid #000' }}></div>
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                        <div>BILL #{state.selectedVisit.visitId}</div>
                        <div>Date: {new Date().toLocaleDateString()}</div>
                        <div>Time: {new Date().toLocaleTimeString()}</div>
                        <div style={{ margin: '10px 0', borderBottom: '1px solid #000' }}></div>
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                        <div>
                            Patient: {state.selectedPatient.firstName} {state.selectedPatient.lastName}
                        </div>
                        <div>Record: {state.selectedPatient.recordNumber}</div>
                        <div>Doctor: {state.selectedVisit.doctorName}</div>
                        <div style={{ margin: '10px 0', borderBottom: '1px solid #000' }}></div>
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                        {state.billingItems.map((item, index) => (
                            <div key={index} style={{ marginBottom: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                    <span>{item.description}</span>
                                    <span>{formatCurrency(item.total, state.generalSettings.country)}</span>
                                </div>
                                {state.printType === BillPrintingDisplayType.detailed && item.items && item.items.length > 0 && (
                                    <div style={{ fontSize: '10px', marginLeft: '5px', color: '#555' }}>
                                        {item.items.map((subItem, subIndex) => (
                                            <div
                                                key={subIndex}
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    marginBottom: '2px'
                                                }}
                                            >
                                                <span>• {subItem.name}</span>
                                                <span>{formatCurrency(subItem.price, state.generalSettings.country)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div style={{ fontSize: '10px', color: '#666' }}>
                                    {item.quantity} x {formatCurrency(item.unitPrice, state.generalSettings.country)}
                                </div>
                            </div>
                        ))}
                        <div style={{ margin: '10px 0', borderBottom: '1px solid #000' }}></div>
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Subtotal:</span>
                            <span>{formatCurrency(state.billingSummary.subtotal, state.generalSettings.country)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Tax ({state.determinedFees.taxRate}%):</span>
                            <span>{formatCurrency(state.billingSummary.tax, state.generalSettings.country)}</span>
                        </div>
                        {state.billingSummary.discount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Discount:</span>
                                <span>-{formatCurrency(state.billingSummary.discount, state.generalSettings.country)}</span>
                            </div>
                        )}
                        <div style={{ margin: '10px 0', borderBottom: '1px solid #000' }}></div>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '14px',
                                fontWeight: 'bold'
                            }}
                        >
                            <span>TOTAL:</span>
                            <span>{formatCurrency(state.billingSummary.total, state.generalSettings.country)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Paid:</span>
                            <span>{formatCurrency(state.billingSummary.amountPaid, state.generalSettings.country)}</span>
                        </div>
                        {state.billingSummary.balance > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>{state.billingSummary.balance < 0 ? 'Change' : 'Balance'}:</span>
                                <span>{formatCurrency(Math.abs(state.billingSummary?.balance), state.generalSettings.country)}</span>
                            </div>
                        )}
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                        <div>Payment: {state.billingSummary.paymentMethod}</div>
                        <div style={{ margin: '10px 0', borderBottom: '1px solid #000' }}></div>
                    </div>

                    {/* Prescription Details Section */}
                    {state.availableDrugs && state.availableDrugs.filter((d) => d.selected).length > 0 && (
                        <>
                            <div style={{ marginBottom: '10px' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '5px' }}>DISPENSED MEDICATIONS:</div>
                                {state.availableDrugs
                                    .filter((d) => d.selected)
                                    .map((drug, index) => (
                                        <div key={index} style={{ marginBottom: '5px', fontSize: '10px' }}>
                                            <div style={{ fontWeight: 'bold' }}>
                                                {index + 1}. {drug.medicationName}
                                            </div>
                                            <div style={{ marginLeft: '5px' }}>
                                                Dosage: {drug.dosage} {frequencyOptions.find((frequency) => frequency.value === drug.frequency).label} for {drug.durationDays} Days.
                                            </div>

                                            {drug.instructions && <div style={{ marginLeft: '5px', fontStyle: 'italic' }}>Instructions: {drug.instructions}</div>}
                                        </div>
                                    ))}
                                <div style={{ margin: '10px 0', borderBottom: '1px solid #000' }}></div>
                            </div>
                        </>
                    )}

                    <div style={{ textAlign: 'center', fontSize: '10px', pageBreakAfter: 'always' }}>
                        <div>Thank you for choosing our services!</div>
                        <div>Get well soon!</div>
                    </div>
                </div>
            );
        } else {
            // A4 Format
            return (
                <div
                    ref={ref}
                    style={{
                        width: '210mm',
                        minHeight: '297mm',
                        padding: '5mm 10mm',
                        fontFamily: 'Arial, sans-serif',
                        fontSize: '11pt',
                        lineHeight: '1.4',
                        color: '#000',
                        backgroundColor: '#fff',
                        margin: '0 auto'
                    }}
                >
                    {/* Hospital Header */}
                    <div
                        style={{
                            textAlign: 'center',
                            marginBottom: '10mm',
                            borderBottom: '2px solid #000',
                            paddingBottom: '5mm'
                        }}
                    >
                        <h1
                            style={{
                                margin: '0 0 8px 0',
                                fontSize: '20pt',
                                fontWeight: 'bold',
                                color: '#000'
                            }}
                        >
                            {state.generalSettings.hospitalName}
                        </h1>
                        <p style={{ margin: '4px 0', fontSize: '10pt' }}>{state.generalSettings.address}</p>
                        <p style={{ margin: '4px 0', fontSize: '10pt' }}>Tel: {state.generalSettings.phone}</p>
                    </div>

                    {/* Bill Title */}
                    <div style={{ textAlign: 'center', marginBottom: '5mm' }}>
                        <h2
                            style={{
                                margin: '0',
                                fontSize: '16pt',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                letterSpacing: '2px'
                            }}
                        >
                            PATIENT BILL
                        </h2>
                    </div>

                    {/* Patient and Visit Information */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5mm' }}>
                        <div style={{ width: '48%' }}>
                            <h3
                                style={{
                                    margin: '0 0 8mm 0',
                                    fontSize: '12pt',
                                    fontWeight: 'bold',
                                    borderBottom: '1px solid #ccc',
                                    paddingBottom: '2mm'
                                }}
                            >
                                Patient Information
                            </h3>
                            <table style={{ width: '100%', borderSpacing: '0' }}>
                                <tbody>
                                    <tr>
                                        <td
                                            style={{
                                                padding: '2mm 0',
                                                fontSize: '10pt',
                                                fontWeight: 'bold',
                                                width: '35%'
                                            }}
                                        >
                                            Name:
                                        </td>
                                        <td style={{ padding: '2mm 0', fontSize: '10pt' }}>
                                            {state.selectedPatient.firstName} {state.selectedPatient.lastName}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '2mm 0', fontSize: '10pt', fontWeight: 'bold' }}>Record Number:</td>
                                        <td
                                            style={{
                                                padding: '2mm 0',
                                                fontSize: '10pt'
                                            }}
                                        >
                                            {state.selectedPatient.recordNumber}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '2mm 0', fontSize: '10pt', fontWeight: 'bold' }}>Phone:</td>
                                        <td
                                            style={{
                                                padding: '2mm 0',
                                                fontSize: '10pt'
                                            }}
                                        >
                                            {state.selectedPatient.phone}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '2mm 0', fontSize: '10pt', fontWeight: 'bold' }}>Gender:</td>
                                        <td
                                            style={{
                                                padding: '2mm 0',
                                                fontSize: '10pt'
                                            }}
                                        >
                                            {state.selectedPatient.gender}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div style={{ width: '48%' }}>
                            <h3
                                style={{
                                    margin: '0 0 8mm 0',
                                    fontSize: '12pt',
                                    fontWeight: 'bold',
                                    borderBottom: '1px solid #ccc',
                                    paddingBottom: '2mm'
                                }}
                            >
                                Visit Information
                            </h3>
                            <table style={{ width: '100%', borderSpacing: '0' }}>
                                <tbody>
                                    <tr>
                                        <td
                                            style={{
                                                padding: '2mm 0',
                                                fontSize: '10pt',
                                                fontWeight: 'bold',
                                                width: '35%'
                                            }}
                                        >
                                            Bill Number:
                                        </td>
                                        <td
                                            style={{
                                                padding: '2mm 0',
                                                fontSize: '10pt'
                                            }}
                                        >
                                            #{state.selectedVisit.visitId}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '2mm 0', fontSize: '10pt', fontWeight: 'bold' }}>Date:</td>
                                        <td
                                            style={{
                                                padding: '2mm 0',
                                                fontSize: '10pt'
                                            }}
                                        >
                                            {new Date().toLocaleDateString()}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '2mm 0', fontSize: '10pt', fontWeight: 'bold' }}>Visit Type:</td>
                                        <td
                                            style={{
                                                padding: '2mm 0',
                                                fontSize: '10pt'
                                            }}
                                        >
                                            {state.selectedVisit.visitType}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '2mm 0', fontSize: '10pt', fontWeight: 'bold' }}>Doctor:</td>
                                        <td
                                            style={{
                                                padding: '2mm 0',
                                                fontSize: '10pt'
                                            }}
                                        >
                                            {state.selectedVisit.doctorName}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Billing Items Table */}
                    <div style={{ marginBottom: '5mm' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f5f5f5' }}>
                                    <th
                                        style={{
                                            textAlign: 'left',
                                            padding: '8px 12px',
                                            fontSize: '10pt',
                                            fontWeight: 'bold',
                                            border: '1px solid #000',
                                            borderBottom: '2px solid #000'
                                        }}
                                    >
                                        Description
                                    </th>
                                    <th
                                        style={{
                                            textAlign: 'center',
                                            padding: '8px 12px',
                                            fontSize: '10pt',
                                            fontWeight: 'bold',
                                            border: '1px solid #000',
                                            borderBottom: '2px solid #000',
                                            width: '15%'
                                        }}
                                    >
                                        Qty
                                    </th>
                                    <th
                                        style={{
                                            textAlign: 'right',
                                            padding: '8px 12px',
                                            fontSize: '10pt',
                                            fontWeight: 'bold',
                                            border: '1px solid #000',
                                            borderBottom: '2px solid #000',
                                            width: '20%'
                                        }}
                                    >
                                        Unit Price
                                    </th>
                                    <th
                                        style={{
                                            textAlign: 'right',
                                            padding: '8px 12px',
                                            fontSize: '10pt',
                                            fontWeight: 'bold',
                                            border: '1px solid #000',
                                            borderBottom: '2px solid #000',
                                            width: '20%'
                                        }}
                                    >
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {state.billingItems.map((item, index) => (
                                    <React.Fragment key={index}>
                                        <tr>
                                            <td
                                                style={{
                                                    padding: '8px 12px',
                                                    fontSize: '10pt',
                                                    border: '1px solid #ddd',
                                                    verticalAlign: 'top'
                                                }}
                                            >
                                                {item.description}
                                            </td>
                                            <td
                                                style={{
                                                    textAlign: 'center',
                                                    padding: '8px 12px',
                                                    fontSize: '10pt',
                                                    border: '1px solid #ddd'
                                                }}
                                            >
                                                {item.quantity}
                                            </td>
                                            <td
                                                style={{
                                                    textAlign: 'right',
                                                    padding: '8px 12px',
                                                    fontSize: '10pt',
                                                    border: '1px solid #ddd'
                                                }}
                                            >
                                                {formatCurrency(item.unitPrice, state.generalSettings.country)}
                                            </td>
                                            <td
                                                style={{
                                                    textAlign: 'right',
                                                    padding: '8px 12px',
                                                    fontSize: '10pt',
                                                    border: '1px solid #ddd',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                {formatCurrency(item.total, state.generalSettings.country)}
                                            </td>
                                        </tr>
                                        {state.printType === BillPrintingDisplayType.detailed &&
                                            item.items &&
                                            item.items.length > 0 &&
                                            item.items.map((subItem, subIndex) => (
                                                <tr key={`${index}-${subIndex}`}>
                                                    <td
                                                        style={{
                                                            padding: '4px 12px 4px 24px',
                                                            fontSize: '9pt',
                                                            color: '#666',
                                                            border: '1px solid #eee',
                                                            fontStyle: 'italic'
                                                        }}
                                                    >
                                                        ↳ {subItem.name}
                                                    </td>
                                                    <td style={{ border: '1px solid #eee' }}></td>
                                                    <td
                                                        style={{
                                                            textAlign: 'right',
                                                            padding: '4px 12px',
                                                            fontSize: '9pt',
                                                            color: '#666',
                                                            border: '1px solid #eee'
                                                        }}
                                                    >
                                                        {formatCurrency(subItem.price, state.generalSettings.country)}
                                                    </td>
                                                    <td style={{ border: '1px solid #eee' }}></td>
                                                </tr>
                                            ))}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Bill Summary */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15mm' }}>
                        <div style={{ width: '60mm', border: '1px solid #000', padding: '8mm' }}>
                            <table style={{ width: '100%', borderSpacing: '0' }}>
                                <tbody>
                                    <tr>
                                        <td
                                            style={{
                                                padding: '2mm 0',
                                                fontSize: '10pt',
                                                borderBottom: '1px dotted #ccc'
                                            }}
                                        >
                                            Subtotal:
                                        </td>
                                        <td
                                            style={{
                                                textAlign: 'right',
                                                padding: '2mm 0',
                                                fontSize: '10pt',
                                                fontWeight: 'bold',
                                                borderBottom: '1px dotted #ccc'
                                            }}
                                        >
                                            {formatCurrency(state.billingSummary.subtotal, state.generalSettings.country)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td
                                            style={{
                                                padding: '2mm 0',
                                                fontSize: '10pt',
                                                borderBottom: '1px dotted #ccc'
                                            }}
                                        >
                                            Tax ({state.determinedFees.taxRate}%):
                                        </td>
                                        <td
                                            style={{
                                                textAlign: 'right',
                                                padding: '2mm 0',
                                                fontSize: '10pt',
                                                fontWeight: 'bold',
                                                borderBottom: '1px dotted #ccc'
                                            }}
                                        >
                                            {formatCurrency(state.billingSummary.tax, state.generalSettings.country)}
                                        </td>
                                    </tr>
                                    {state.billingSummary.discount > 0 && (
                                        <tr>
                                            <td
                                                style={{
                                                    padding: '2mm 0',
                                                    fontSize: '10pt',
                                                    borderBottom: '1px dotted #ccc'
                                                }}
                                            >
                                                Discount:
                                            </td>
                                            <td
                                                style={{
                                                    textAlign: 'right',
                                                    padding: '2mm 0',
                                                    fontSize: '10pt',
                                                    fontWeight: 'bold',
                                                    borderBottom: '1px dotted #ccc',
                                                    color: '#e74c3c'
                                                }}
                                            >
                                                -{formatCurrency(state.billingSummary.discount, state.generalSettings.country)}
                                            </td>
                                        </tr>
                                    )}
                                    <tr>
                                        <td
                                            style={{
                                                padding: '4mm 0',
                                                fontSize: '12pt',
                                                fontWeight: 'bold',
                                                borderTop: '2px solid #000',
                                                borderBottom: '2px solid #000'
                                            }}
                                        >
                                            TOTAL:
                                        </td>
                                        <td
                                            style={{
                                                textAlign: 'right',
                                                padding: '4mm 0',
                                                fontSize: '12pt',
                                                fontWeight: 'bold',
                                                borderTop: '2px solid #000',
                                                borderBottom: '2px solid #000'
                                            }}
                                        >
                                            {formatCurrency(state.billingSummary.total, state.generalSettings.country)}
                                        </td>
                                    </tr>
                                    {state.billingSummary.amountPaid > 0 && (
                                        <>
                                            <tr>
                                                <td style={{ padding: '2mm 0', fontSize: '10pt' }}>Amount Paid:</td>
                                                <td
                                                    style={{
                                                        textAlign: 'right',
                                                        padding: '2mm 0',
                                                        fontSize: '10pt',
                                                        fontWeight: 'bold',
                                                        color: '#27ae60'
                                                    }}
                                                >
                                                    {formatCurrency(state.billingSummary.amountPaid, state.generalSettings.country)}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td
                                                    style={{
                                                        padding: '2mm 0',
                                                        fontSize: '10pt',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    {state.billingSummary.balance < 0 ? 'Change' : 'Balance'}:
                                                </td>
                                                <td
                                                    style={{
                                                        textAlign: 'right',
                                                        padding: '2mm 0',
                                                        fontSize: '10pt',
                                                        fontWeight: 'bold',
                                                        color: state.billingSummary.balance > 0 ? '#e74c3c' : '#27ae60'
                                                    }}
                                                >
                                                    {formatCurrency(Math.abs(state.billingSummary.balance), state.generalSettings.country)}
                                                </td>
                                            </tr>
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Payment Information */}
                    <div
                        style={{
                            marginBottom: '5mm',
                            padding: '6mm',
                            border: '1px solid #ddd',
                            backgroundColor: '#f9f9f9'
                        }}
                    >
                        <p style={{ margin: '0', fontSize: '10pt' }}>
                            <strong>Payment Method:</strong> {state.billingSummary.paymentMethod}
                        </p>
                    </div>

                    {/* Prescription Details Section */}
                    {state.availableDrugs && state.availableDrugs.filter((d) => d.selected).length > 0 && (
                        <div
                            style={{
                                marginBottom: '10mm',
                                padding: '6mm',
                                border: '2px solid #000',
                                backgroundColor: '#fff'
                            }}
                        >
                            <h3
                                style={{
                                    margin: '0 0 5mm 0',
                                    fontSize: '12pt',
                                    fontWeight: 'bold',
                                    borderBottom: '2px solid #000',
                                    paddingBottom: '3mm'
                                }}
                            >
                                DISPENSED MEDICATIONS
                            </h3>
                            {state.availableDrugs
                                .filter((d) => d.selected)
                                .map((drug, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            marginBottom: '4mm',
                                            padding: '3mm',
                                            borderLeft: '3px solid #000',
                                            backgroundColor: '#f9f9f9'
                                        }}
                                    >
                                        <div style={{ fontSize: '11pt', fontWeight: 'bold', marginBottom: '2mm' }}>
                                            {index + 1}. {drug.medicationName}
                                        </div>
                                        <table style={{ width: '100%', borderSpacing: '0', fontSize: '10pt' }}>
                                            <tbody>
                                                <tr>
                                                    <td style={{ padding: '1mm 0', fontWeight: 'bold', width: '25%' }}>Quantity:</td>
                                                    <td style={{ padding: '1mm 0' }}>
                                                        {drug.quantity} {drug.frequency}
                                                    </td>
                                                </tr>
                                                {drug.durationDays && (
                                                    <tr>
                                                        <td style={{ padding: '1mm 0', fontWeight: 'bold' }}>Duration:</td>
                                                        <td style={{ padding: '1mm 0' }}>{drug.durationDays}</td>
                                                    </tr>
                                                )}
                                                {drug.instructions && (
                                                    <tr>
                                                        <td style={{ padding: '1mm 0', fontWeight: 'bold', verticalAlign: 'top' }}>Instructions:</td>
                                                        <td style={{ padding: '1mm 0', fontStyle: 'italic' }}>{drug.instructions}</td>
                                                    </tr>
                                                )}
                                                <tr>
                                                    <td style={{ padding: '1mm 0', fontWeight: 'bold' }}>Price:</td>
                                                    <td style={{ padding: '1mm 0' }}>{formatCurrency(drug.totalPrice, state.generalSettings.country)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                ))}
                            <div style={{ marginTop: '5mm', fontSize: '9pt', color: '#666', fontStyle: 'italic' }}>
                                <strong>Note:</strong> Please follow the prescribed dosage and instructions. Contact your doctor if you experience any adverse effects.
                            </div>
                        </div>
                    )}

                    {/* Signature Section */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginTop: '20mm',
                            pageBreakInside: 'avoid'
                        }}
                    >
                        <div style={{ width: '45%', textAlign: 'center' }}>
                            <div
                                style={{
                                    borderBottom: '1px solid #000',
                                    marginBottom: '5mm',
                                    height: '15mm'
                                }}
                            >
                                &nbsp;
                            </div>
                            <p style={{ margin: '0', fontSize: '10pt', fontWeight: 'bold' }}>Authorized Signature</p>
                            <p style={{ margin: '2mm 0 0 0', fontSize: '9pt', color: '#666' }}>Hospital Representative</p>
                        </div>
                        <div style={{ width: '45%', textAlign: 'center' }}>
                            <div
                                style={{
                                    borderBottom: '1px solid #000',
                                    marginBottom: '5mm',
                                    height: '15mm'
                                }}
                            >
                                &nbsp;
                            </div>
                            <p style={{ margin: '0', fontSize: '10pt', fontWeight: 'bold' }}>Date & Time</p>
                            <p style={{ margin: '2mm 0 0 0', fontSize: '9pt', color: '#666' }}>Payment Processing</p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '10mm',
                            left: '20mm',
                            right: '20mm',
                            textAlign: 'center',
                            fontSize: '9pt',
                            color: '#666',
                            borderTop: '1px solid #ddd',
                            paddingTop: '5mm'
                        }}
                    >
                        <p style={{ margin: '0', pageBreakAfter: 'always' }}>Thank you for choosing City General Hospital | Get well soon!</p>
                    </div>
                </div>
            );
        }
    });

    PrintComponent.displayName = 'PrintComponent';

    // Investigation Print Component (Thermal optimized)
    const InvestigationPrintComponent = React.forwardRef<HTMLDivElement, any>((props, ref) => {
        if (!state.selectedPatient || !state.selectedVisit) return null;

        return (
            <div
                ref={ref}
                style={{
                    width: '80mm',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    lineHeight: '1.3',
                    padding: '2mm',
                    color: '#000'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{state.generalSettings.hospitalName}</div>
                    <div style={{ fontSize: '9px' }}>INVESTIGATION REQUEST</div>
                    <div style={{ margin: '5px 0', borderBottom: '1px dashed #000' }}></div>
                </div>

                <div style={{ marginBottom: '8px', fontSize: '10px' }}>
                    <div>
                        <strong>Date:</strong> {new Date().toLocaleDateString()}
                    </div>
                    <div>
                        <strong>Patient:</strong> {state.selectedPatient.firstName} {state.selectedPatient.lastName}
                    </div>
                    <div>
                        <strong>ID:</strong> {state.selectedPatient.recordNumber}
                    </div>
                    <div>
                        <strong>Doctor:</strong> {state.selectedVisit.doctorName}
                    </div>
                    <div style={{ margin: '5px 0', borderBottom: '1px dashed #000' }}></div>
                </div>

                <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>INTERNAL INVESTIGATIONS:</div>
                    {state.selectedInvestigations
                        .filter((inv) => inv.source === 'Internal' && inv.selected)
                        .map((inv, index) => (
                            <div key={index} style={{ marginBottom: '3px', fontSize: '10px' }}>
                                <div>□ {inv.testName}</div>
                                <div style={{ marginLeft: '8px', fontSize: '9px', color: '#666' }}>
                                    Category: {inv.category} | {formatCurrency(inv.price, state.generalSettings.country)}
                                </div>
                            </div>
                        ))}
                </div>

                <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>EXTERNAL INVESTIGATIONS:</div>
                    {state.selectedInvestigations
                        .filter((inv) => inv.source === 'External' && inv.selected)
                        .map((inv, index) => (
                            <div key={index} style={{ marginBottom: '3px', fontSize: '10px' }}>
                                <div>□ {inv.testName}</div>
                                <div
                                    style={{
                                        marginLeft: '8px',
                                        fontSize: '9px',
                                        color: '#666'
                                    }}
                                >
                                    Category: {inv.category} | External Lab
                                </div>
                            </div>
                        ))}
                </div>

                <div style={{ margin: '8px 0', borderBottom: '1px dashed #000' }}></div>

                <div style={{ fontSize: '9px', textAlign: 'center' }}>
                    <div>Please complete investigations</div>
                    <div>and return results to doctor</div>
                </div>

                <div
                    style={{
                        marginTop: '10mm',
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '9px',
                        pageBreakAfter: 'always'
                    }}
                >
                    <div>
                        <div>_________________</div>
                        <div>Doctor Signature</div>
                    </div>
                    <div>
                        <div>_________________</div>
                        <div>Date & Time</div>
                    </div>
                </div>
            </div>
        );
    });

    InvestigationPrintComponent.displayName = 'InvestigationPrintComponent';

    const ExternalPrescriptionPrintComponent = React.forwardRef<HTMLDivElement, any>((props, ref) => {
        if (!state.selectedPatient || !state.selectedVisit) return null;

        return (
            <div
                ref={ref}
                style={{
                    width: '80mm',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    lineHeight: '1.3',
                    padding: '3mm',
                    color: '#000'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{state.generalSettings.hospitalName}</div>
                    <div style={{ fontSize: '9px' }}>{state.generalSettings.address}</div>
                    <div style={{ fontSize: '9px' }}>Tel: {state.generalSettings.phone}</div>
                    <div style={{ margin: '5px 0', borderBottom: '1px dashed #000' }}></div>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold' }}>EXTERNAL PRESCRIPTION</div>
                    <div style={{ margin: '5px 0', borderBottom: '1px dashed #000' }}></div>
                </div>

                <div style={{ marginBottom: '8px', fontSize: '10px' }}>
                    <div>
                        <strong>Date:</strong> {new Date().toLocaleDateString()}
                    </div>
                    <div>
                        <strong>Patient:</strong> {state.selectedPatient.firstName} {state.selectedPatient.lastName}
                    </div>
                    <div>
                        <strong>ID:</strong> {state.selectedPatient.recordNumber}
                    </div>
                    <div>
                        <strong>Phone:</strong> {state.selectedPatient.phone}
                    </div>
                    <div>
                        <strong>Doctor:</strong> {state.selectedVisit.doctorName}
                    </div>
                    <div style={{ margin: '5px 0', borderBottom: '1px dashed #000' }}></div>
                </div>

                <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '10px' }}>MEDICATIONS TO PURCHASE:</div>
                    <div style={{ fontSize: '9px', color: '#666', marginBottom: '4px' }}>Buy these from external pharmacy</div>

                    {state.selectedExternalPrescriptions
                        .filter((p) => p.selected)
                        .map((prescription, index) => (
                            <div key={index} style={{ marginBottom: '6px', borderBottom: '1px dotted #ccc', paddingBottom: '4px' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '10px' }}>
                                    {index + 1}. {prescription.medicationName}
                                </div>
                                <div style={{ fontSize: '9px', marginLeft: '8px' }}>
                                    Dose: {prescription.dosage} | {prescription.frequency}
                                </div>
                                <div
                                    style={{
                                        fontSize: '9px',
                                        marginLeft: '8px'
                                    }}
                                >
                                    Duration: {prescription.durationDays} days
                                </div>
                                {prescription.instructions && (
                                    <div
                                        style={{
                                            fontSize: '9px',
                                            marginLeft: '8px',
                                            fontStyle: 'italic'
                                        }}
                                    >
                                        Note: {prescription.instructions}
                                    </div>
                                )}
                            </div>
                        ))}
                </div>

                <div style={{ margin: '8px 0', borderBottom: '1px dashed #000' }}></div>

                <div style={{ marginBottom: '8px', fontSize: '9px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>IMPORTANT:</div>
                    <div style={{ marginBottom: '2px' }}>• Buy from licensed pharmacy</div>
                    <div style={{ marginBottom: '2px' }}>• Follow prescribed dosage</div>
                    <div style={{ marginBottom: '2px' }}>• Call hospital for questions</div>
                    <div style={{ marginBottom: '2px' }}>• Return for follow-up</div>
                </div>

                <div style={{ margin: '8px 0', borderBottom: '1px dashed #000' }}></div>

                <div style={{ fontSize: '9px', textAlign: 'center', marginBottom: '8px' }}>
                    <div>This prescription is valid for</div>
                    <div>external pharmacy purchase only</div>
                </div>

                <div
                    style={{
                        marginTop: '8mm',
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '9px',
                        pageBreakAfter: 'always'
                    }}
                >
                    <div style={{ textAlign: 'left' }}>
                        <div>_______________</div>
                        <div>Doctor Sign</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div>_______________</div>
                        <div>Date & Time</div>
                    </div>
                </div>
            </div>
        );
    });

    ExternalPrescriptionPrintComponent.displayName = 'ExternalPrescriptionPrintComponent';

    const viewPrescriptionItem = async (row: PrescriptionRecord) => {
        try {
            setStateValue({ isLoading: true });
            const response = await BillService.getPrescriptionFull(row.medicationId);
            setStateValue({ selectedPrescription: response.operatedData, showFullPrescriptionDialog: true });
        } catch (error) {
            console.log(error);
        } finally {
            setStateValue({ isLoading: false });
        }
    };
    const showBilledPatients = async () => {
        const response = await PatientsModel.getBilledPatientsToday(changeDateFormat(state.searchedBillDate as Date));
        const patients = getTodayPatients(response.operatedData);
        setStateValue({ completedPatients: patients.map((patient) => ({ ...patient, status: 'Accounts' })), showCompletedBills: true });
    };
    return (
        <BillingContext.Provider
            value={{
                state,
                setStateValue,
                toast,
                componentRef,
                calculateBillingSummary,
                externalPrescriptionRef,
                investigationPrintRef,
                addCustomCharge,
                addNewInvestigation,
                viewPrescriptionItem
            }}
        >
            <div className="grid">
                <Toast ref={toast} />
                <ConfirmDialog />
                {/* Header */}
                <div className="col-12">
                    <Card>
                        <div className="flex justify-content-between align-items-center">
                            <div>
                                <h2 className="m-0">Billing & Investigation Verification</h2>
                                <p className="text-500 mt-1">Verify and print patient bills for today completed visits</p>
                            </div>
                            <div className="flex gap-2">
                                <Button label="View Previous Bills" icon="pi pi-eye" severity="warning" onClick={(e) => OPRef.current?.toggle(e)} />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Outer TabView: Verify vs. Bills list */}
                <div className="col-12">
                    <TabView>
                        <TabPanel header="Verify Bills" leftIcon="pi pi-check-square">
                            <div className="grid">
                                {/* Today's Patients List */}
                                <div className="col-12">
                                    <Card title="Today's Completed Visits">
                                        <TodayVisits visitingPatients={state.todayPatients} />
                                    </Card>
                                </div>

                                {/* Billing, Prescriptions and Investigation Tabs - Only show when patient selected */}
                                {state.selectedPatient && state.selectedVisit && (
                                    <div className="col-12">
                                        <TabView activeIndex={state.activeIndex} onTabChange={(e) => setStateValue({ activeIndex: e.index })}>
                                            {/* Billing Tab */}
                                            <TabPanel header="Billing" leftIcon="pi pi-dollar">
                                                <PatientBill />
                                            </TabPanel>

                                            {/* Prescriptions Tab */}
                                            <TabPanel header="Prescriptions" leftIcon="pi pi-shopping-bag">
                                                <BillingPrescriptions />
                                            </TabPanel>
                                            {/* Investigations Tab */}
                                            <TabPanel header="Investigations" leftIcon="pi pi-file-medical">
                                                <BillingInvestigations />
                                            </TabPanel>
                                            {/* Partner Investigations Tab — only shown when patient has partner investigations */}
                                            {(state.partnerInternalInvestigations.length > 0 || state.partnerExternalInvestigations.length > 0) && (
                                                <TabPanel header="Partner Investigations" leftIcon="pi pi-users">
                                                    <BillingPartnerInvestigations />
                                                </TabPanel>
                                            )}
                                        </TabView>
                                    </div>
                                )}
                            </div>
                        </TabPanel>
                        <TabPanel header="Bills" leftIcon="pi pi-list">
                            <BillsList />
                        </TabPanel>
                    </TabView>
                </div>

                {/* Custom Charge Dialog */}
                <CustomerCharge />
                {/* Add Investigation Dialog */}
                <AddInvestigation />
                {/* Add Prescription view Dialog */}

                <Dialog header="More Drug Information" className="lg:w-4 w-full" visible={state.showFullPrescriptionDialog} onHide={() => setStateValue({ showFullPrescriptionDialog: false })}>
                    {state.selectedPrescription && state.showFullPrescriptionDialog ? <PrescriptionItemView /> : <h4>Item Not Loaded Yet</h4>}
                </Dialog>
                {/* Hidden print components */}
                <div style={{ display: 'none' }}>
                    <PrintComponent ref={componentRef} />
                    <InvestigationPrintComponent ref={investigationPrintRef} />
                    <ExternalPrescriptionPrintComponent ref={externalPrescriptionRef} />
                </div>
            </div>
            <OverlayPanel ref={OPRef} title="Search Bill Date" className="w-2" dismissable={false} showCloseIcon={true}>
                <div className="flex flex-column w-full p-fluid">
                    <div>
                        <div className="field">
                            <label htmlFor="billDate">Bill Date</label>
                            <Calendar selectionMode={'single'} value={new Date(state.searchedBillDate)} showIcon id="billDate" onChange={(e) => setStateValue({ searchedBillDate: e.value })} />
                        </div>
                    </div>
                    <div className="mt-3">
                        <Button icon="pi pi-search" label="Search Date" onClick={showBilledPatients} />
                    </div>
                </div>
            </OverlayPanel>
            <Dialog onHide={() => setStateValue({ showCompletedBills: false })} visible={state.showCompletedBills} className="lg:w-8 w-full" header="Completed Bills">
                <TodayVisits visitingPatients={state.completedPatients} />
            </Dialog>
        </BillingContext.Provider>
    );
};

export default BillingVerificationPage;
