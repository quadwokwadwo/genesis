import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import React from 'react';
import { useHospitalSettingsContext } from '@/libs/contextProviders/AppContexts';

const AppointmentSettings = () => {
    const { state: settings, updateSetting } = useHospitalSettingsContext();
    return (
        <>
            <div className="grid">
                <div className="col-12 lg:col-6">
                    <h4>Scheduling Settings</h4>

                    <div className="field">
                        <label htmlFor="defaultDuration">Default Appointment Duration (minutes)</label>
                        <InputNumber id="defaultDuration" value={settings.appointments.defaultDuration} onValueChange={(e) => updateSetting('appointments', 'defaultDuration', e.value)} suffix=" min" min={15} max={120} step={15} className="w-full" />
                    </div>

                    <div className="field">
                        <label htmlFor="bufferTime">Buffer Time Between Appointments (minutes)</label>
                        <InputNumber id="bufferTime" value={settings.appointments.bufferTime} onValueChange={(e) => updateSetting('appointments', 'bufferTime', e.value)} suffix=" min" min={0} max={30} step={5} className="w-full" />
                    </div>

                    <div className="field">
                        <label htmlFor="maxAdvanceBooking">Maximum Advance Booking (days)</label>
                        <InputNumber
                            id="maxAdvanceBooking"
                            value={settings.appointments.maxAdvanceBookingDays}
                            onValueChange={(e) => updateSetting('appointments', 'maxAdvanceBookingDays', e.value)}
                            suffix=" days"
                            min={1}
                            max={365}
                            className="w-full"
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="maxPerDay">Maximum Appointments Per Day</label>
                        <InputNumber id="maxPerDay" value={settings.appointments.maxAppointmentsPerDay} onValueChange={(e) => updateSetting('appointments', 'maxAppointmentsPerDay', e.value)} min={1} max={200} className="w-full" />
                    </div>

                    <div className="field">
                        <label htmlFor="cancellationPeriod">Minimum Cancellation Period (hours)</label>
                        <InputNumber id="cancellationPeriod" value={settings.appointments.cancellationPeriod} onValueChange={(e) => updateSetting('appointments', 'cancellationPeriod', e.value)} suffix=" hours" min={0} max={72} className="w-full" />
                    </div>
                </div>

                <div className="col-12 lg:col-6">
                    <h4>Booking Preferences</h4>

                    <div className="field">
                        <label>Enable Online Booking</label>
                        <div className="flex align-items-center">
                            <InputSwitch checked={settings.appointments.enableOnlineBooking} onChange={(e) => updateSetting('appointments', 'enableOnlineBooking', e.value)} />
                            <span className="ml-2">{settings.appointments.enableOnlineBooking ? 'Enabled' : 'Disabled'}</span>
                        </div>
                    </div>

                    <div className="field">
                        <label>Require Deposit</label>
                        <div className="flex align-items-center">
                            <InputSwitch checked={settings.appointments.requireDeposit} onChange={(e) => updateSetting('appointments', 'requireDeposit', e.value)} />
                            <span className="ml-2">{settings.appointments.requireDeposit ? 'Required' : 'Not Required'}</span>
                        </div>
                    </div>

                    {settings.appointments.requireDeposit && (
                        <div className="field">
                            <label htmlFor="depositAmount">Deposit Amount</label>
                            <InputNumber id="depositAmount" value={settings.appointments.depositAmount} onValueChange={(e) => updateSetting('appointments', 'depositAmount', e.value)} mode="currency" currency="USD" className="w-full" />
                        </div>
                    )}

                    <div className="field">
                        <label>Enable Waitlist</label>
                        <div className="flex align-items-center">
                            <InputSwitch checked={settings.appointments.enableWaitlist} onChange={(e) => updateSetting('appointments', 'enableWaitlist', e.value)} />
                            <span className="ml-2">{settings.appointments.enableWaitlist ? 'Enabled' : 'Disabled'}</span>
                        </div>
                    </div>

                    <div className="field">
                        <label>Auto-Confirm Appointments</label>
                        <div className="flex align-items-center">
                            <InputSwitch checked={settings.appointments.autoConfirmAppointments} onChange={(e) => updateSetting('appointments', 'autoConfirmAppointments', e.value)} />
                            <span className="ml-2">{settings.appointments.autoConfirmAppointments ? 'Enabled' : 'Disabled'}</span>
                        </div>
                    </div>

                    <div className="field">
                        <label htmlFor="reminderDays">Send Reminder Before (days)</label>
                        <InputNumber id="reminderDays" value={settings.appointments.reminderDays} onValueChange={(e) => updateSetting('appointments', 'reminderDays', e.value)} suffix=" days" min={1} max={7} className="w-full" />
                    </div>
                </div>
            </div>
        </>
    );
};
export default AppointmentSettings;
