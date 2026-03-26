import { useHospitalSettingsContext } from '@/libs/contextProviders/AppContexts';
import { InputSwitch } from 'primereact/inputswitch';
import { InputText } from 'primereact/inputtext';

const NotificationSettings = () => {
    const { state: settings, updateSetting } = useHospitalSettingsContext();
    return (
        <>
            <div className="grid">
                <div className="col-12 lg:col-6">
                    <h4>Notification Channels</h4>

                    <div className="field">
                        <label>Email Notifications</label>
                        <div className="flex align-items-center">
                            <InputSwitch checked={settings.notifications.emailNotifications} onChange={(e) => updateSetting('notifications', 'emailNotifications', e.value)} />
                            <span className="ml-2">{settings.notifications.emailNotifications ? 'Enabled' : 'Disabled'}</span>
                        </div>
                    </div>

                    <div className="field">
                        <label>SMS Notifications</label>
                        <div className="flex align-items-center">
                            <InputSwitch checked={settings.notifications.smsNotifications} onChange={(e) => updateSetting('notifications', 'smsNotifications', e.value)} />
                            <span className="ml-2">{settings.notifications.smsNotifications ? 'Enabled' : 'Disabled'}</span>
                        </div>
                    </div>

                    <div className="field">
                        <label htmlFor="notificationEmail">Notification Email</label>
                        <InputText id="notificationEmail" type="email" value={settings.notifications.notificationEmail} onChange={(e) => updateSetting('notifications', 'notificationEmail', e.target.value)} className="w-full" />
                    </div>

                    <div className="field">
                        <label htmlFor="notificationPhone">Notification Phone</label>
                        <InputText id="notificationPhone" value={settings.notifications.notificationPhone} onChange={(e) => updateSetting('notifications', 'notificationPhone', e.target.value)} className="w-full" />
                    </div>
                </div>

                <div className="col-12 lg:col-6">
                    <h4>Notification Types</h4>

                    <div className="field">
                        <label>Appointment Reminders</label>
                        <div className="flex align-items-center">
                            <InputSwitch checked={settings.notifications.appointmentReminders} onChange={(e) => updateSetting('notifications', 'appointmentReminders', e.value)} />
                            <span className="ml-2">{settings.notifications.appointmentReminders ? 'Enabled' : 'Disabled'}</span>
                        </div>
                    </div>

                    <div className="field">
                        <label>Inventory Alerts</label>
                        <div className="flex align-items-center">
                            <InputSwitch checked={settings.notifications.inventoryAlerts} onChange={(e) => updateSetting('notifications', 'inventoryAlerts', e.value)} />
                            <span className="ml-2">{settings.notifications.inventoryAlerts ? 'Enabled' : 'Disabled'}</span>
                        </div>
                    </div>

                    <div className="field">
                        <label>Payment Reminders</label>
                        <div className="flex align-items-center">
                            <InputSwitch checked={settings.notifications.paymentReminders} onChange={(e) => updateSetting('notifications', 'paymentReminders', e.value)} />
                            <span className="ml-2">{settings.notifications.paymentReminders ? 'Enabled' : 'Disabled'}</span>
                        </div>
                    </div>

                    <div className="field">
                        <label>Critical System Alerts</label>
                        <div className="flex align-items-center">
                            <InputSwitch checked={settings.notifications.criticalAlerts} onChange={(e) => updateSetting('notifications', 'criticalAlerts', e.value)} />
                            <span className="ml-2">{settings.notifications.criticalAlerts ? 'Enabled' : 'Disabled'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
export default NotificationSettings;
