// app/(main)/hospital/settings/page.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card } from 'primereact/card';
import { TabPanel, TabView } from 'primereact/tabview';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { confirmDialog } from 'primereact/confirmdialog';
import { HospitalSettingsState, IAppointmentSettings, IFeeSettings, IGeneralSettings, INotificationSettings, IReportSettings, ISecuritySettings, TCountryData, TInventorySettings } from '@/types/hospital';
import { HospitalSettingsContext } from '@/libs/contextProviders/AppContexts';
import GeneralSettings from '@/app/(main)/hospital/settings/components/General';
import FeesAndBillings from '@/app/(main)/hospital/settings/components/FeesAndBillings';
import AppointmentSettings from '@/app/(main)/hospital/settings/components/AppointmentSettings';
import InventorySettings from '@/app/(main)/hospital/settings/components/InventorySettings';
import NotificationSettings from '@/app/(main)/hospital/settings/components/NotificationSettings';
import SecuritySettings from '@/app/(main)/hospital/settings/components/SecuritySettings';
import ReportSettings from '@/app/(main)/hospital/settings/components/ReportSettings';
import SettingService from '@/libs/blue_prints/SettingService';
import { defaultSelected, remakeDropdownSelects } from '@/libs/utils';
import { BillPrintingDisplayType } from '@/types/enums/enums';

// Types for settings
const INITIAL_STATE: HospitalSettingsState = {
    selectableCountries: [],
    countries: [],
    selectedCountry: defaultSelected(),
    general: {
        hospitalName: 'City General Hospital',
        hospitalLogo: '',
        address: 'Enter Hospital Address',
        phone: 'Enter Phone Number',
        email: 'Hospital Email',
        website: 'website',
        registrationNumber: 'Business Registration Number',
        taxId: 'Tax Id',
        country: {} as TCountryData,
        timeZone: 'GMT',
        dateFormat: 'MM/DD/YYYY',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        openingTime: '08:00',
        closingTime: '20:00',
        emergencyContact: 'Emergency Contact'
    },
    fees: {
        consultationFee: 150,
        hospitalCardFee: 25,
        hospitalCardRenewalFee: 20,
        followUpConsultationFee: 100,
        taxRate: 8.5,
        enableAutoInvoicing: true,
        paymentMethods: ['Cash', 'Card', 'Insurance', 'Mobile Money'],
        defaultPaymentMethod: 'Cash',
        lateFeePercentage: 2,
        gracePeriodDays: 30,
        billPrintType: BillPrintingDisplayType.detailed
    },
    appointments: {
        defaultDuration: 30,
        bufferTime: 10,
        maxAdvanceBookingDays: 90,
        enableOnlineBooking: true,
        requireDeposit: false,
        depositAmount: 50,
        cancellationPeriod: 24,
        maxAppointmentsPerDay: 50,
        enableWaitlist: true,
        autoConfirmAppointments: false,
        reminderDays: 2,
        doubleBookingAllowed: false
    },
    inventory: {
        lowStockAlertPercentage: 20,
        autoReorderEnabled: true,
        defaultReorderQuantity: 100,
        expiryAlertDays: 90,
        enableBatchTracking: true,
        allowNegativeStock: false,
        defaultMarkup: 25,
        discountLimit: 30
    },
    notifications: {
        emailNotifications: true,
        smsNotifications: false,
        appointmentReminders: true,
        inventoryAlerts: true,
        paymentReminders: true,
        criticalAlerts: true,
        dailyReports: false,
        weeklyReports: true,
        notificationEmail: 'Default Notification mail',
        notificationPhone: 'Default Notification phone'
    },
    security: {
        sessionTimeout: 30,
        passwordExpiry: 90,
        minPasswordLength: 8,
        requireTwoFactor: false,
        maxLoginAttempts: 5,
        auditLogRetention: 365,
        enableBackup: true,
        backupFrequency: 'Daily',
        dataRetentionDays: 1825
    },
    reports: {
        defaultReportFormat: 'PDF',
        includeHeader: true,
        includeLogo: true,
        autoGenerateReports: true,
        reportGenerationTime: '06:00',
        reportRecipients: ['', ''],
        monthlyReports: true,
        quarterlyReports: true,
        yearlyReports: true
    }
};
const settingsService = new SettingService();
const SettingsPage = () => {
    const toast = useRef<Toast>(null);
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Settings state
    const [settings, setSettings] = useState<HospitalSettingsState>(INITIAL_STATE);
    useEffect(() => {
        loadSettings();
    }, []);

    const setStateValue = (stateValues: Partial<HospitalSettingsState>) => {
        setSettings((prevState) => ({ ...prevState, ...stateValues }));
    };
    const loadSettings = async () => {
        setLoading(true);
        try {
            const countriesData = await settingsService.getCurrencies();
            const countries = remakeDropdownSelects(countriesData, 'countryName', 'countryName');
            const response = await SettingService.getHospitalSetting();
            if (response.status === 200) {
                const returnedSettings: HospitalSettingsState = typeof response.operatedData === 'string' ? JSON.parse(response.operatedData) : response.operatedData;
                const general: IGeneralSettings = typeof returnedSettings.general === 'string' ? JSON.parse(returnedSettings.general) : returnedSettings.general;
                const fees: IFeeSettings = typeof returnedSettings.fees === 'string' ? JSON.parse(returnedSettings.fees) : returnedSettings.fees;
                const appointments: IAppointmentSettings = typeof returnedSettings.appointments === 'string' ? JSON.parse(returnedSettings.appointments) : returnedSettings.appointments;
                const inventory: TInventorySettings = typeof returnedSettings.inventory === 'string' ? JSON.parse(returnedSettings.inventory) : returnedSettings.inventory;
                const notifications: INotificationSettings = typeof returnedSettings.notifications === 'string' ? JSON.parse(returnedSettings.notifications) : returnedSettings.notifications;
                const security: ISecuritySettings = typeof returnedSettings.security === 'string' ? JSON.parse(returnedSettings.security) : returnedSettings.security;
                const reports: IReportSettings = typeof returnedSettings.reports === 'string' ? JSON.parse(returnedSettings.reports) : returnedSettings.reports;
                const selectedCountry = countries.find((country) => country.name === general.country.countryName);
                setStateValue({ ...settings, notifications, general, fees, appointments, inventory, security, reports, selectableCountries: countries, countries: countriesData, selectedCountry });
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to load settings',
                life: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async () => {
        setLoading(true);
        console.log(settings);
        const {} = settings;
        try {
            const response = await SettingService.updateSetting(settings);
            if (response.status === 200 && response.operatedData !== undefined) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Settings saved successfully',
                    life: 3000
                });
                setHasUnsavedChanges(false);
            } else {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to save settings',
                    life: 3000
                });
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to save settings',
                life: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    const resetSettings = () => {
        confirmDialog({
            message: 'Are you sure you want to reset all settings to default values?',
            header: 'Confirm Reset',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                loadSettings();
                toast.current?.show({
                    severity: 'info',
                    summary: 'Reset',
                    detail: 'Settings reset to default',
                    life: 3000
                });
            }
        });
    };

    const updateSetting = (category: keyof HospitalSettingsState, field: string, value: any) => {
        setSettings((prev) => ({
            ...prev,
            [category]: {
                ...prev[category],
                [field]: value
            }
        }));
        setHasUnsavedChanges(true);
    };
    return (
        <div className="grid">
            <Toast ref={toast} />

            {/* Header */}
            <div className="col-12">
                <Card>
                    <div className="flex justify-content-between align-items-center">
                        <div>
                            <h2 className="m-0">Hospital Settings</h2>
                            <p className="text-500 mt-1">Configure system-wide settings and preferences</p>
                        </div>
                        <div className="flex gap-2">
                            {hasUnsavedChanges && (
                                <span className="text-orange-500 flex align-items-center gap-2">
                                    <i className="pi pi-exclamation-circle"></i>
                                    Unsaved changes
                                </span>
                            )}
                            <Button label="Reset" icon="pi pi-refresh" severity="danger" outlined onClick={resetSettings} />
                            <Button label="Save Changes" icon="pi pi-save" loading={loading} onClick={saveSettings} disabled={!hasUnsavedChanges} />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Settings Tabs */}
            <div className="col-12">
                <Card>
                    <HospitalSettingsContext.Provider value={{ setStateValue, state: settings, updateSetting, saveSettings, toast, setHasUnsavedChanges }}>
                        <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                            {/* General Settings */}
                            <TabPanel header="General" leftIcon="pi pi-cog">
                                <GeneralSettings />
                            </TabPanel>

                            {/* Fee Settings */}
                            <TabPanel header="Fees & Billing" leftIcon="pi pi-dollar">
                                <FeesAndBillings />
                            </TabPanel>

                            {/* Appointment Settings */}
                            <TabPanel header="Appointments" leftIcon="pi pi-calendar">
                                <AppointmentSettings />
                            </TabPanel>

                            {/* Inventory Settings */}
                            <TabPanel header="Inventory" leftIcon="pi pi-box">
                                <InventorySettings />
                            </TabPanel>

                            {/* Notification Settings */}
                            <TabPanel header="Notifications" leftIcon="pi pi-bell">
                                <NotificationSettings />
                            </TabPanel>

                            {/* Security Settings */}
                            <TabPanel header="Security" leftIcon="pi pi-shield">
                                <SecuritySettings />
                            </TabPanel>

                            {/* Report Settings */}
                            <TabPanel header="Reports" leftIcon="pi pi-chart-bar">
                                <ReportSettings />
                            </TabPanel>
                        </TabView>
                    </HospitalSettingsContext.Provider>
                </Card>
            </div>
        </div>
    );
};

export default SettingsPage;
