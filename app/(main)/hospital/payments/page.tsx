'use client';

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { AutoComplete } from 'primereact/autocomplete';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Divider } from 'primereact/divider';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { useReactToPrint } from 'react-to-print';
import { IGeneralSettings, IPayment, TPatient } from '@/types/hospital';
import Payments from '@/libs/blue_prints/Payments';
import { CRUDTYPE } from '@/types/enums/enums';
import { changeDateFormat, getPaymentOptions } from '@/libs/utils';
import PatientsModel from '@/libs/blue_prints/Patients';
import useUserData from '@/libs/hooks/useUserData';
import SettingService from '@/libs/blue_prints/SettingService';
import { Calendar } from 'primereact/calendar';

interface PaymentFormData {
    paymentId: number;
    patientId: number | null;
    amountPaid: number | null;
    paymentMethod: string;
    description: string;
    paymentDate?: string | Date;
    crudType?: CRUDTYPE;
    userId?: number;
}

interface ReceiptData {
    receiptNumber: string;
    patient: TPatient;
    payment: IPayment;
    timestamp: string;
    cashier: string;
    generalSettings: IGeneralSettings;
}

// Thermal Receipt Component for Printing
const ThermalReceipt = React.forwardRef<HTMLDivElement, { receiptData: ReceiptData }>((props, ref) => {
    const { receiptData } = props;

    return (
        <div ref={ref} className="thermal-receipt">
            <style jsx>{`
                .thermal-receipt {
                    width: 80mm;
                    font-family: 'Courier New', monospace;
                    font-size: 12px;
                    line-height: 1.3;
                    color: black;
                    background: white;
                    padding: 10px;
                    margin: 0;
                }
                .receipt-header {
                    text-align: center;
                    margin-bottom: 15px;
                }
                .receipt-header h1 {
                    font-size: 18px;
                    font-weight: bold;
                    margin: 0 0 8px 0;
                }
                .receipt-header p {
                    margin: 2px 0;
                    font-size: 11px;
                }
                .receipt-title {
                    text-align: center;
                    margin: 15px 0;
                    font-size: 16px;
                    font-weight: bold;
                }
                .receipt-row {
                    display: flex;
                    justify-content: space-between;
                    margin: 3px 0;
                }
                .receipt-row.total {
                    font-weight: bold;
                    font-size: 14px;
                    margin: 8px 0;
                    border-top: 1px dashed black;
                    padding-top: 5px;
                }
                .receipt-separator {
                    border-top: 1px dashed black;
                    margin: 10px 0;
                }
                .receipt-footer {
                    text-align: center;
                    margin-top: 15px;
                    font-size: 11px;
                }
                .receipt-footer p {
                    margin: 2px 0;
                }
                @media print {
                    .thermal-receipt {
                        width: 80mm;
                        margin: 0;
                        padding: 5mm;
                    }
                }
            `}</style>

            <div className="receipt-header">
                <h1>{receiptData.generalSettings.hospitalName}</h1>
                <p>{receiptData.generalSettings.address}</p>
                <p>{receiptData.generalSettings.phone}</p>
                <p>{receiptData.generalSettings.email}</p>
            </div>

            <div className="receipt-title">PAYMENT RECEIPT</div>

            <div className="receipt-details">
                <div className="receipt-row">
                    <span>Receipt No:</span>
                    <span>{receiptData.receiptNumber}</span>
                </div>
                <div className="receipt-row">
                    <span>Date:</span>
                    <span>{receiptData.timestamp}</span>
                </div>
                <div className="receipt-row">
                    <span>Cashier:</span>
                    <span>{receiptData.cashier}</span>
                </div>
            </div>

            <div className="receipt-separator"></div>

            <div className="patient-info">
                <div className="receipt-row">
                    <span>Patient:</span>
                    <span>
                        {receiptData.patient.firstName} {receiptData.patient.lastName}
                    </span>
                </div>
                <div className="receipt-row">
                    <span>Record No:</span>
                    <span>{receiptData.patient.recordNumber}</span>
                </div>
                <div className="receipt-row">
                    <span>Phone:</span>
                    <span>{receiptData.patient.phone || 'N/A'}</span>
                </div>
            </div>

            <div className="receipt-separator"></div>

            <div className="payment-info">
                <div className="receipt-row total">
                    <span>Amount Paid:</span>
                    <span>${receiptData.payment.amountPaid}</span>
                </div>
                <div className="receipt-row">
                    <span>Payment Method:</span>
                    <span>{receiptData.payment.paymentMethod}</span>
                </div>
                <div className="receipt-row">
                    <span>Description:</span>
                    <span>{receiptData.payment.description || 'Payment'}</span>
                </div>
            </div>

            <div className="receipt-separator"></div>

            <div className="receipt-footer" style={{ breakAfter: 'always' }}>
                <p>Thank you for your payment!</p>
                <p>Please keep this receipt for your records.</p>
                <p>Generated: {new Date().toLocaleString()}</p>
            </div>
        </div>
    );
});

ThermalReceipt.displayName = 'ThermalReceipt';

const patientService = new PatientsModel();

const PaymentCollectionForm: React.FC = () => {
    const toast = useRef<Toast>(null);
    const receiptRef = useRef<HTMLDivElement>(null);

    // Debounce timer ref
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Form state
    const [formData, setFormData] = useState<PaymentFormData>({
        paymentId: 0,
        patientId: null,
        amountPaid: null,
        paymentMethod: 'Cash',
        description: '',
        paymentDate: changeDateFormat(new Date()),
        userId: 0,
        crudType: CRUDTYPE.save
    });

    // UI state
    const [patients, setPatients] = useState<TPatient[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<TPatient | null>(null);
    const [patientSuggestions, setPatientSuggestions] = useState<TPatient[]>([]);
    const [patientQuery, setPatientQuery] = useState('');
    const [recentPayments, setRecentPayments] = useState<IPayment[]>([]);
    const [showRecentPayments, setShowRecentPayments] = useState(false);
    const [currentReceipt, setCurrentReceipt] = useState<ReceiptData | null>(null);
    const [showReceiptPreview, setShowReceiptPreview] = useState(false);
    const [generalSettings, setGeneralSettings] = useState<IGeneralSettings | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [paymentDate, setPaymentDate] = useState<Date | string>(changeDateFormat(new Date()));
    const [refundDialogVisible, setRefundDialogVisible] = useState(false);
    const [refundTarget, setRefundTarget] = useState<IPayment | null>(null);
    const [refundReason, setRefundReason] = useState('');
    const [refundSubmitting, setRefundSubmitting] = useState(false);
    const { user } = useUserData();
    const isAdmin = (user as any)?.role === 'admin';
    const paymentMethods = useMemo(() => getPaymentOptions(), []);

    useEffect(() => {
        const loadPageData = async () => {
            try {
                setLoading(true);
                const patientsList = await patientService.getPatientsList({ pageSize: 200 });
                const settings = await SettingService.getHospitalSetting();
                const generalSettings = typeof settings.operatedData.general === 'string' ? JSON.parse(settings.operatedData.general) : settings.operatedData.general;
                setPatients(patientsList.rows || []);
                setGeneralSettings(generalSettings);
            } catch (error) {
                console.error('Failed to load patients:', error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load patients data',
                    life: 3000
                });
            } finally {
                setLoading(false);
            }
        };
        loadPageData();
    }, []);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    // Print handler using react-to-print
    const handlePrint = useReactToPrint({
        contentRef: receiptRef,
        documentTitle: `Receipt-${currentReceipt?.receiptNumber}`,
        pageStyle: `
            @page {
                size: 80mm auto;
                margin: 0;
            }
            @media print {
                body { margin: 0; }
                .thermal-receipt {
                    width: 80mm;
                    margin: 0;
                    page-break-after: avoid;
                }
            }
        `
    });

    const processPayment = async (paymentData: PaymentFormData): Promise<IPayment> => {
        const receiptNumber = `RCP-${Date.now()}`;

        const modifiedPayment = { ...paymentData, userId: user.userId!, receiptNumber };

        const response = await Payments.addNewPayment(modifiedPayment);

        if (response.status === 200 && response.operatedData !== undefined) {
            return { ...response.operatedData, dateCreated: new Date(response.operatedData.dateCreated).toISOString(), dateModified: new Date(response.operatedData.dateModified).toISOString(), receiptNumber: receiptNumber };
        }

        return null;
    };

    const getRecentPayments = async (patientId: number): Promise<IPayment[]> => {
        try {
            const response = await Payments.getPatientRecentPayments(patientId);
            if (response.status === 200 && response.operatedData !== undefined) {
                return response.operatedData;
            }
            return [];
        } catch (err: any) {
            const detail = err?.response?.data?.message || err?.message || 'Failed to load payments';
            toast.current?.show({ severity: 'error', summary: 'Payments', detail, life: 4000 });
            return [];
        }
    };

    // Generate receipt data
    const generateReceiptData = useCallback((payment: IPayment, patient: TPatient): ReceiptData => {
        return {
            receiptNumber: payment.receiptNumber!,
            patient: patient,
            payment: payment,
            timestamp: new Date().toLocaleString(),
            cashier: payment.username, // Replace with actual user name
            generalSettings: generalSettings!
        };
    }, []);

    // FIXED: Debounced search function to prevent excessive API calls
    const handlePatientSearch = useCallback(
        (event: { query: string }) => {
            const query = event.query?.trim();

            // Clear previous timeout
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }

            // Don't search for very short queries
            if (!query || query.length < 2) {
                setPatientSuggestions([]);
                setSearchLoading(false);
                return;
            }

            setSearchLoading(true);

            // Debounce search by 300ms
            searchTimeoutRef.current = setTimeout(() => {
                try {
                    const results = patients.filter((patient) => {
                        if (!patient) return false;

                        const searchTerm = query.toLowerCase();
                        const fullName = `${patient.firstName || ''} ${patient.lastName || ''}`.toLowerCase();
                        const recordNumber = (patient.recordNumber || '').toLowerCase();
                        const phone = patient.phone || '';

                        return fullName.includes(searchTerm) || recordNumber.includes(searchTerm) || phone.includes(query);
                    });

                    // Limit results to prevent UI overload
                    const limitedResults = results.slice(0, 10);
                    setPatientSuggestions(limitedResults);
                } catch (error) {
                    console.error('Search error:', error);
                    setPatientSuggestions([]);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Search Error',
                        detail: 'Failed to search patients',
                        life: 3000
                    });
                } finally {
                    setSearchLoading(false);
                }
            }, 300);
        },
        [patients]
    );

    const handlePatientSelect = useCallback(async (patient: TPatient) => {
        if (!patient) return;
        setSelectedPatient(patient);
        setFormData((prev) => ({ ...prev, patientId: patient.patientId }));
        setPatientQuery(`${patient.firstName} ${patient.lastName}`);

        try {
            setIsLoading(true);
            const payments = await getRecentPayments(patient.patientId);
            setRecentPayments(payments.map((payment) => ({ ...payment, amountPaid: typeof payment.amountPaid === 'string' ? parseFloat(payment.amountPaid) : payment.amountPaid })));
            setIsLoading(false);
        } catch (error) {
            console.error('Failed to load recent payments:', error);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedPatient || !formData.amountPaid || formData.amountPaid <= 0) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Validation Error',
                detail: 'Please select a patient and enter a valid amount',
                life: 3000
            });
            return;
        }

        confirmDialog({
            message: `Collect $${formData.amountPaid.toFixed(2)} from ${selectedPatient.firstName} ${selectedPatient.lastName}?`,
            header: 'Confirm Payment',
            icon: 'pi pi-question-circle',
            acceptClassName: 'p-button-success',
            accept: async () => {
                setLoading(true);
                try {
                    const payment = await processPayment(formData);

                    toast.current?.show({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Payment collected successfully',
                        life: 3000
                    });

                    // Generate and show receipt
                    const receiptData = generateReceiptData(payment, selectedPatient);
                    setCurrentReceipt({ ...receiptData, generalSettings: generalSettings });
                    setShowReceiptPreview(true);

                    // Reset form
                    setFormData({
                        paymentId: 0,
                        patientId: null,
                        amountPaid: null,
                        paymentMethod: 'Cash',
                        description: '',
                        paymentDate: changeDateFormat(new Date()),
                        userId: 0,
                        crudType: CRUDTYPE.save
                    });
                    setSelectedPatient(null);
                    setPatientQuery('');

                    // Refresh recent payments
                    const payments = await getRecentPayments(selectedPatient.patientId);
                    setRecentPayments(payments);
                } catch (error) {
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to process payment',
                        life: 3000
                    });
                } finally {
                    setLoading(false);
                }
            }
        });
    };
    const handleEditPayment = (payment: IPayment) => {
        try {
            const { paymentId, patientId, amountPaid, paymentMethod, description, paymentDate } = payment;
            setFormData({
                paymentId: paymentId,
                patientId: patientId,
                amountPaid: amountPaid,
                paymentMethod: paymentMethod,
                description,
                paymentDate: changeDateFormat(paymentDate as Date),
                userId: user.userId,
                crudType: CRUDTYPE.update
            });
        } catch (error) {
            console.log(error);
        }
    };
    const handlePrintReceipt = useCallback(
        async (payment: IPayment) => {
            try {
                if (!selectedPatient) return;

                const receiptData = generateReceiptData(payment, selectedPatient);
                setCurrentReceipt({ ...receiptData, generalSettings });

                // Small delay to ensure receipt is rendered before printing
                setTimeout(() => {
                    handlePrint();
                }, 100);
            } catch (error) {
                console.log(error);
            }
        },
        [selectedPatient, generateReceiptData, handlePrint]
    );

    const clearForm = useCallback(() => {
        setFormData({
            paymentId: 0,
            patientId: null,
            amountPaid: null,
            paymentMethod: 'Cash',
            description: '',
            paymentDate: changeDateFormat(new Date()),
            userId: 0,
            crudType: CRUDTYPE.save
        });
        setSelectedPatient(null);
        setPatientQuery('');
        setRecentPayments([]);
        setPatientSuggestions([]);
    }, []);

    // FIXED: Memoized template functions to prevent unnecessary re-renders
    const patientItemTemplate = useCallback((patient: TPatient) => {
        if (!patient) return null;

        return (
            <div className="flex align-items-center gap-2 p-2">
                <Avatar label={`${patient.firstName?.[0] || ''}${patient.lastName?.[0] || ''}`} shape="circle" className="bg-primary text-white" />
                <div className="flex flex-column">
                    <span className="font-medium">
                        {patient.firstName} {patient.lastName}
                    </span>
                    <span className="text-sm text-color-secondary">
                        {patient.recordNumber} • {patient.phone}
                    </span>
                </div>
            </div>
        );
    }, []);

    const amountBodyTemplate = useCallback((payment: IPayment) => {
        return <span className="font-semibold text-green-600">${payment.amountPaid}</span>;
    }, []);

    const dateBodyTemplate = useCallback((payment: IPayment) => {
        return new Date(payment.dateCreated).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }, []);

    const actionBodyTemplate = useCallback(
        (payment: IPayment) => {
            const alreadyRefunded = payment.paymentStatus === 'refunded' || (payment.refundOfPaymentId ?? 0) > 0 || Number(payment.amountPaid) < 0;
            return (
                <>
                    <Button icon="pi pi-print" size="small" text rounded tooltip="Print Receipt" onClick={() => handlePrintReceipt(payment)} />
                    <Button icon="pi pi-pencil" size="small" text rounded tooltip="Edit Payment" onClick={() => handleEditPayment(payment)} />
                    {isAdmin && !alreadyRefunded && (
                        <Button
                            icon="pi pi-undo"
                            size="small"
                            text
                            rounded
                            severity="danger"
                            tooltip="Refund"
                            onClick={() => {
                                setRefundTarget(payment);
                                setRefundReason('');
                                setRefundDialogVisible(true);
                            }}
                        />
                    )}
                </>
            );
        },
        [handlePrintReceipt, isAdmin]
    );

    const submitRefund = async () => {
        if (!refundTarget) return;
        if (refundReason.trim().length < 10) {
            toast.current?.show({ severity: 'warn', summary: 'Validation', detail: 'Refund reason must be at least 10 characters', life: 3000 });
            return;
        }
        try {
            setRefundSubmitting(true);
            const resp = await Payments.refundPayment(refundTarget.paymentId, refundReason.trim());
            if (resp.status === 200 && resp.operatedData) {
                toast.current?.show({ severity: 'success', summary: 'Refund', detail: 'Payment refunded successfully', life: 3000 });
                setRefundDialogVisible(false);
                setRefundTarget(null);
                setRefundReason('');
                if (selectedPatient) {
                    const refreshed = await getRecentPayments(selectedPatient.patientId);
                    setRecentPayments(refreshed);
                }
            } else {
                toast.current?.show({ severity: 'error', summary: 'Refund Failed', detail: resp.message || 'Could not refund', life: 4000 });
            }
        } catch (err: any) {
            const detail = err?.response?.data?.message || err?.message || 'Refund failed';
            toast.current?.show({ severity: 'error', summary: 'Refund Failed', detail, life: 4000 });
        } finally {
            setRefundSubmitting(false);
        }
    };

    return (
        <div className="payment-collection-form">
            <Toast ref={toast} />
            <ConfirmDialog />

            {/* Hidden receipt component for printing */}
            <div style={{ display: 'none' }}>{currentReceipt && <ThermalReceipt ref={receiptRef} receiptData={currentReceipt} />}</div>

            <div className="grid">
                <div className="col-12 md:col-8">
                    <Card title="Collect Payment" className="h-full">
                        <form onSubmit={handleSubmit}>
                            {/* Patient Search */}
                            <div className="field">
                                <label htmlFor="patient-search" className="block font-medium mb-2">
                                    Search Patient *
                                </label>
                                <AutoComplete
                                    id="patient-search"
                                    value={patientQuery}
                                    suggestions={patientSuggestions}
                                    completeMethod={handlePatientSearch}
                                    field="firstName"
                                    itemTemplate={patientItemTemplate}
                                    onChange={(e) => setPatientQuery(e.value || '')}
                                    onSelect={(e) => handlePatientSelect(e.value)}
                                    onClear={() => {
                                        setSelectedPatient(null);
                                        setPatientQuery('');
                                        setPatientSuggestions([]);
                                        setFormData((prev) => ({ ...prev, patientId: null }));
                                    }}
                                    placeholder="Search by name, record number, or phone (min 2 characters)"
                                    className="w-full"
                                    minLength={2}
                                    delay={300}
                                    emptyMessage="No patients found. Try a different search term."
                                    dropdown
                                />
                            </div>

                            {/* Selected Patient Info */}
                            {selectedPatient && (
                                <div className="field">
                                    <Card className="bg-blue-50 border-blue-200">
                                        <div className="flex align-items-center gap-3">
                                            <Avatar label={`${selectedPatient.firstName[0]}${selectedPatient.lastName[0]}`} size="large" shape="circle" className="bg-blue-500 text-white" />
                                            <div className="flex-1">
                                                <h4 className="m-0 mb-1">
                                                    {selectedPatient.firstName} {selectedPatient.lastName}
                                                </h4>
                                                <div className="flex gap-3 text-sm text-color-secondary">
                                                    <span>Record: {selectedPatient.recordNumber}</span>
                                                    <span>Phone: {selectedPatient.phone}</span>
                                                    <Tag value={selectedPatient.gender} severity="info" />
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            )}

                            <Divider />

                            {/* Payment Details */}
                            <div className="grid">
                                <div className="col-12 md:col-6">
                                    <div className="field">
                                        <label htmlFor="amount" className="block font-medium mb-2">
                                            Amount to Collect *
                                        </label>
                                        <InputNumber
                                            id="amount"
                                            value={formData.amountPaid}
                                            onValueChange={(e) => setFormData((prev) => ({ ...prev, amountPaid: e.value }))}
                                            mode="currency"
                                            currency="USD"
                                            locale="en-US"
                                            className="w-full"
                                            placeholder="0.00"
                                            min={0}
                                            max={999999.99}
                                        />
                                    </div>
                                </div>

                                <div className="col-12 md:col-6">
                                    <div className="field">
                                        <label htmlFor="payment-method" className="block font-medium mb-2">
                                            Payment Method
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {paymentMethods.map((method) => (
                                                <Button
                                                    key={method.name}
                                                    label={method.name}
                                                    size="small"
                                                    outlined={formData.paymentMethod !== method.name}
                                                    severity={formData.paymentMethod === method.name ? 'success' : 'info'}
                                                    onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: method.name }))}
                                                    type="button"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="grid">
                                <div className="col-12 md:col-4">
                                    <div className="field w-full">
                                        <label htmlFor="paymentDate" className="block">
                                            Payment Date
                                        </label>
                                        <Calendar id="paymentDate" showIcon selectionMode="single" value={new Date(paymentDate)} onChange={(e) => setPaymentDate(changeDateFormat(e.value))} />
                                    </div>
                                </div>
                                <div className="col-12 md:col-8">
                                    <div className="field">
                                        <label htmlFor="description" className="block font-medium mb-2">
                                            Payment Description (Optional)
                                        </label>
                                        <InputText
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                            placeholder="e.g., Consultation fee, Medication, etc."
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 justify-content-end mt-4">
                                <Button type="button" label="Clear" icon="pi pi-times" outlined onClick={clearForm} />
                                <Button
                                    type="submit"
                                    label={formData.crudType === 'save' ? 'Collect Payment' : 'Update Payment'}
                                    icon="pi pi-dollar"
                                    className="p-button-success"
                                    loading={loading}
                                    disabled={!selectedPatient || !formData.amountPaid}
                                />
                            </div>
                        </form>
                    </Card>
                </div>

                <div className="col-12 md:col-4">
                    <Card title="Quick Actions" className="mb-3">
                        <div className="flex flex-column gap-2">
                            <Button label="Print Last Receipt" icon="pi pi-print" outlined className="w-full" onClick={() => currentReceipt && handlePrint()} disabled={!currentReceipt} />
                            <Button label="Patient Balance" icon="pi pi-chart-line" outlined className="w-full" disabled={!selectedPatient} />
                            <Button label="Payment History" icon="pi pi-history" outlined className="w-full" onClick={() => setShowRecentPayments(true)} disabled={!selectedPatient || recentPayments.length === 0} />
                        </div>
                    </Card>

                    {/* Recent Payments */}
                    {selectedPatient && recentPayments.length > 0 && (
                        <Card title="Recent Payments" className="mb-3">
                            <DataTable value={recentPayments.slice(0, 3)} className="p-datatable-sm">
                                <Column field="amountPaid" header="Amount" body={amountBodyTemplate} />
                                <Column field="dateCreated" header="Date" body={dateBodyTemplate} />
                                <Column header="Print" body={actionBodyTemplate} />
                            </DataTable>
                            {recentPayments.length > 3 && <Button label="View All" text size="small" onClick={() => setShowRecentPayments(true)} />}
                        </Card>
                    )}
                </div>
            </div>

            {/* Receipt Preview Dialog */}
            <Dialog
                header="Receipt Preview"
                visible={showReceiptPreview}
                style={{ width: '400px' }}
                onHide={() => setShowReceiptPreview(false)}
                footer={
                    <div className="flex gap-2">
                        <Button
                            label="Print Receipt"
                            icon="pi pi-print"
                            onClick={() => {
                                handlePrint();
                                setShowReceiptPreview(false);
                            }}
                        />
                        <Button label="Close" icon="pi pi-times" severity="secondary" outlined onClick={() => setShowReceiptPreview(false)} />
                    </div>
                }
            >
                {currentReceipt && (
                    <div
                        style={{
                            maxWidth: '300px',
                            margin: '0 auto',
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                        }}
                    >
                        <ThermalReceipt receiptData={currentReceipt} />
                    </div>
                )}
            </Dialog>

            {/* Payment History Dialog */}
            <Dialog header={`Payment History - ${selectedPatient?.firstName} ${selectedPatient?.lastName}`} visible={showRecentPayments} style={{ width: '800px' }} onHide={() => setShowRecentPayments(false)} maximizable>
                <DataTable value={recentPayments} paginator rows={10} className="p-datatable-sm" loading={isLoading}>
                    <Column field="paymentId" header="Payment ID" />
                    <Column field="receiptNumber" header="Receipt No" />
                    <Column field="amountPaid" header="Amount" body={amountBodyTemplate} />
                    <Column field="paymentMethod" header="Method" />
                    <Column field="paymentStatus" header="Status" />
                    <Column field="dateCreated" header="Date" body={dateBodyTemplate} />
                    <Column header="Actions" body={actionBodyTemplate} />
                </DataTable>
            </Dialog>

            {/* Refund Dialog (admin only) */}
            <Dialog
                header={refundTarget ? `Refund Payment #${refundTarget.paymentId}` : 'Refund Payment'}
                visible={refundDialogVisible}
                style={{ width: '480px' }}
                onHide={() => {
                    if (refundSubmitting) return;
                    setRefundDialogVisible(false);
                    setRefundTarget(null);
                    setRefundReason('');
                }}
                footer={
                    <div className="flex gap-2 justify-content-end">
                        <Button
                            label="Cancel"
                            icon="pi pi-times"
                            outlined
                            severity="secondary"
                            disabled={refundSubmitting}
                            onClick={() => {
                                setRefundDialogVisible(false);
                                setRefundTarget(null);
                                setRefundReason('');
                            }}
                        />
                        <Button label="Confirm Refund" icon="pi pi-undo" severity="danger" loading={refundSubmitting} onClick={submitRefund} disabled={refundReason.trim().length < 10} />
                    </div>
                }
            >
                {refundTarget && (
                    <div className="flex flex-column gap-3">
                        <div className="flex justify-content-between">
                            <span className="text-color-secondary">Receipt</span>
                            <span className="font-semibold">{refundTarget.receiptNumber}</span>
                        </div>
                        <div className="flex justify-content-between">
                            <span className="text-color-secondary">Amount</span>
                            <span className="font-bold text-red-600">${Number(refundTarget.amountPaid).toFixed(2)}</span>
                        </div>
                        <div className="field">
                            <label htmlFor="refund-reason" className="block font-medium mb-2">
                                Reason (min 10 characters) *
                            </label>
                            <InputTextarea id="refund-reason" rows={4} value={refundReason} onChange={(e) => setRefundReason(e.target.value)} className="w-full" autoResize />
                            <small className="text-color-secondary">{refundReason.trim().length}/500</small>
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    );
};

export default PaymentCollectionForm;
