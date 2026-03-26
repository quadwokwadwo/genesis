import { useHospitalSettingsContext } from '@/libs/contextProviders/AppContexts';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';

const SecuritySettings = () => {
    const { state: settings, updateSetting } = useHospitalSettingsContext();
    const backupFrequencies = [
        { label: 'Daily', value: 'Daily' },
        { label: 'Weekly', value: 'Weekly' },
        { label: 'Monthly', value: 'Monthly' }
    ];
    return (
        <>
            <div className="grid">
                <div className="col-12 lg:col-6">
                    <h4>Session & Password</h4>

                    <div className="field">
                        <label htmlFor="sessionTimeout">Session Timeout (minutes)</label>
                        <InputNumber id="sessionTimeout" value={settings.security.sessionTimeout} onValueChange={(e) => updateSetting('security', 'sessionTimeout', e.value)} suffix=" min" min={5} max={120} className="w-full" />
                    </div>

                    <div className="field">
                        <label htmlFor="passwordExpiry">Password Expiry (days)</label>
                        <InputNumber id="passwordExpiry" value={settings.security.passwordExpiry} onValueChange={(e) => updateSetting('security', 'passwordExpiry', e.value)} suffix=" days" min={30} max={365} className="w-full" />
                    </div>

                    <div className="field">
                        <label htmlFor="minPassword">Minimum Password Length</label>
                        <InputNumber id="minPassword" value={settings.security.minPasswordLength} onValueChange={(e) => updateSetting('security', 'minPasswordLength', e.value)} min={6} max={20} className="w-full" />
                    </div>

                    <div className="field">
                        <label htmlFor="maxLoginAttempts">Maximum Login Attempts</label>
                        <InputNumber id="maxLoginAttempts" value={settings.security.maxLoginAttempts} onValueChange={(e) => updateSetting('security', 'maxLoginAttempts', e.value)} min={3} max={10} className="w-full" />
                    </div>

                    <div className="field">
                        <label>Require Two-Factor Authentication</label>
                        <div className="flex align-items-center">
                            <InputSwitch checked={settings.security.requireTwoFactor} onChange={(e) => updateSetting('security', 'requireTwoFactor', e.value)} />
                            <span className="ml-2">{settings.security.requireTwoFactor ? 'Required' : 'Optional'}</span>
                        </div>
                    </div>
                </div>

                <div className="col-12 lg:col-6">
                    <h4>Data Management</h4>

                    <div className="field">
                        <label htmlFor="auditLogRetention">Audit Log Retention (days)</label>
                        <InputNumber id="auditLogRetention" value={settings.security.auditLogRetention} onValueChange={(e) => updateSetting('security', 'auditLogRetention', e.value)} suffix=" days" min={30} max={3650} className="w-full" />
                    </div>

                    <div className="field">
                        <label>Enable Automatic Backup</label>
                        <div className="flex align-items-center">
                            <InputSwitch checked={settings.security.enableBackup} onChange={(e) => updateSetting('security', 'enableBackup', e.value)} />
                            <span className="ml-2">{settings.security.enableBackup ? 'Enabled' : 'Disabled'}</span>
                        </div>
                    </div>

                    {settings.security.enableBackup && (
                        <div className="field">
                            <label htmlFor="backupFrequency">Backup Frequency</label>
                            <Dropdown id="backupFrequency" value={settings.security.backupFrequency} options={backupFrequencies} onChange={(e) => updateSetting('security', 'backupFrequency', e.value)} className="w-full" />
                        </div>
                    )}

                    <div className="field">
                        <label htmlFor="dataRetention">Data Retention Period (days)</label>
                        <InputNumber id="dataRetention" value={settings.security.dataRetentionDays} onValueChange={(e) => updateSetting('security', 'dataRetentionDays', e.value)} suffix=" days" min={365} max={7300} className="w-full" />
                    </div>
                </div>
            </div>
        </>
    );
};
export default SecuritySettings;
