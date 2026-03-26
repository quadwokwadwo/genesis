import { useHospitalSettingsContext } from '@/libs/contextProviders/AppContexts';
import { InputSwitch } from 'primereact/inputswitch';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';

const ReportSettings = () => {
    const { state: settings, updateSetting } = useHospitalSettingsContext();

    const reportFormats = [
        { label: 'PDF', value: 'PDF' },
        { label: 'Excel', value: 'Excel' },
        { label: 'CSV', value: 'CSV' },
        { label: 'HTML', value: 'HTML' }
    ];
    return (
        <>
            <div className="grid">
                <div className="col-12 lg:col-6">
                    <h4>Report Generation</h4>

                    <div className="field">
                        <label htmlFor="reportFormat">Default Report Format</label>
                        <Dropdown id="reportFormat" value={settings.reports.defaultReportFormat} options={reportFormats} onChange={(e) => updateSetting('reports', 'defaultReportFormat', e.value)} className="w-full" />
                    </div>

                    <div className="field">
                        <label>Include Hospital Header</label>
                        <div className="flex align-items-center">
                            <InputSwitch checked={settings.reports.includeHeader} onChange={(e) => updateSetting('reports', 'includeHeader', e.value)} />
                            <span className="ml-2">{settings.reports.includeHeader ? 'Yes' : 'No'}</span>
                        </div>
                    </div>

                    <div className="field">
                        <label>Include Logo in Reports</label>
                        <div className="flex align-items-center">
                            <InputSwitch checked={settings.reports.includeLogo} onChange={(e) => updateSetting('reports', 'includeLogo', e.value)} />
                            <span className="ml-2">{settings.reports.includeLogo ? 'Yes' : 'No'}</span>
                        </div>
                    </div>

                    <div className="field">
                        <label>Auto-Generate Reports</label>
                        <div className="flex align-items-center">
                            <InputSwitch checked={settings.reports.autoGenerateReports} onChange={(e) => updateSetting('reports', 'autoGenerateReports', e.value)} />
                            <span className="ml-2">{settings.reports.autoGenerateReports ? 'Enabled' : 'Disabled'}</span>
                        </div>
                    </div>

                    {settings.reports.autoGenerateReports && (
                        <div className="field">
                            <label htmlFor="reportTime">Report Generation Time</label>
                            <InputText id="reportTime" type="time" value={settings.reports.reportGenerationTime} onChange={(e) => updateSetting('reports', 'reportGenerationTime', e.target.value)} className="w-full" />
                        </div>
                    )}
                </div>

                <div className="col-12 lg:col-6">
                    <h4>Report Schedule</h4>

                    <div className="field">
                        <label>Monthly Reports</label>
                        <div className="flex align-items-center">
                            <InputSwitch checked={settings.reports.monthlyReports} onChange={(e) => updateSetting('reports', 'monthlyReports', e.value)} />
                            <span className="ml-2">{settings.reports.monthlyReports ? 'Enabled' : 'Disabled'}</span>
                        </div>
                    </div>

                    <div className="field">
                        <label>Quarterly Reports</label>
                        <div className="flex align-items-center">
                            <InputSwitch checked={settings.reports.quarterlyReports} onChange={(e) => updateSetting('reports', 'quarterlyReports', e.value)} />
                            <span className="ml-2">{settings.reports.quarterlyReports ? 'Enabled' : 'Disabled'}</span>
                        </div>
                    </div>

                    <div className="field">
                        <label>Yearly Reports</label>
                        <div className="flex align-items-center">
                            <InputSwitch checked={settings.reports.yearlyReports} onChange={(e) => updateSetting('reports', 'yearlyReports', e.value)} />
                            <span className="ml-2">{settings.reports.yearlyReports ? 'Enabled' : 'Disabled'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
export default ReportSettings;
