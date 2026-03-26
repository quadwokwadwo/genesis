import { InputText } from 'primereact/inputtext';
import { FileUpload } from 'primereact/fileupload';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import React from 'react';
import { useHospitalSettingsContext } from '@/libs/contextProviders/AppContexts';
import { FilterSelect } from '@/libs/components/UtilComponents';

const GeneralSettings = () => {
    const { state: settings, setStateValue, updateSetting, setHasUnsavedChanges } = useHospitalSettingsContext();

    const dateFormatOptions = [
        { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
        { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
        { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' }
    ];

    const timeZoneOptions = [
        { label: 'Eastern Time (ET)', value: 'America/New_York' },
        { label: 'Central Time (CT)', value: 'America/Chicago' },
        { label: 'Mountain Time (MT)', value: 'America/Denver' },
        { label: 'Pacific Time (PT)', value: 'America/Los_Angeles' },
        { label: 'GMT', value: 'Europe/London' },
        { label: 'CET', value: 'Europe/Paris' },
        { label: 'IST', value: 'Asia/Kolkata' }
    ];

    const weekDays = [
        { label: 'Monday', value: 'Monday' },
        { label: 'Tuesday', value: 'Tuesday' },
        { label: 'Wednesday', value: 'Wednesday' },
        { label: 'Thursday', value: 'Thursday' },
        { label: 'Friday', value: 'Friday' },
        { label: 'Saturday', value: 'Saturday' },
        { label: 'Sunday', value: 'Sunday' }
    ];
    const onCurrencyCountryChange = (e: DropdownChangeEvent) => {
        const selectedCountry = settings.countries.find((country) => country.countryName === e.value.name);
        setHasUnsavedChanges(true);
        setStateValue({ selectedCountry: e.value, general: { ...settings.general, country: selectedCountry } });
    };
    return (
        <>
            <div className="grid">
                <div className="col-12 lg:col-6">
                    <h4>Hospital Information</h4>
                    <div className="field">
                        <label htmlFor="hospitalName">Hospital Name</label>
                        <InputText id="hospitalName" value={settings.general.hospitalName} onChange={(e) => updateSetting('general', 'hospitalName', e.target.value)} className="w-full" />
                    </div>

                    <div className="field">
                        <label htmlFor="logo">Hospital Logo</label>
                        <FileUpload mode="basic" accept="image/*" maxFileSize={1000000} chooseLabel="Choose Logo" />
                    </div>

                    <div className="field">
                        <label htmlFor="address">Address</label>
                        <InputTextarea id="address" value={settings.general.address} onChange={(e) => updateSetting('general', 'address', e.target.value)} rows={3} className="w-full" />
                    </div>

                    <div className="field">
                        <label htmlFor="phone">Phone Number</label>
                        <InputText id="phone" value={settings.general.phone} onChange={(e) => updateSetting('general', 'phone', e.target.value)} className="w-full" />
                    </div>

                    <div className="field">
                        <label htmlFor="email">Email</label>
                        <InputText id="email" type="email" value={settings.general.email} onChange={(e) => updateSetting('general', 'email', e.target.value)} className="w-full" />
                    </div>
                </div>

                <div className="col-12 lg:col-6">
                    <h4>System Preferences</h4>
                    <div className="field">
                        <label htmlFor="currency">Currency Country</label>
                        <FilterSelect selectedOption={settings.selectedCountry} selectableOptions={settings.selectableCountries} onSelectChange={onCurrencyCountryChange} elementId="countries" defaultValue="Select" showLabel={false} />
                    </div>

                    <div className="field">
                        <label htmlFor="timezone">Time Zone</label>
                        <Dropdown id="timezone" value={settings.general.timeZone} options={timeZoneOptions} onChange={(e) => updateSetting('general', 'timeZone', e.value)} className="w-full" />
                    </div>

                    <div className="field">
                        <label htmlFor="dateFormat">Date Format</label>
                        <Dropdown id="dateFormat" value={settings.general.dateFormat} options={dateFormatOptions} onChange={(e) => updateSetting('general', 'dateFormat', e.value)} className="w-full" />
                    </div>

                    <div className="field">
                        <label htmlFor="workingDays">Working Days</label>
                        <MultiSelect id="workingDays" value={settings.general.workingDays} options={weekDays} onChange={(e) => updateSetting('general', 'workingDays', e.value)} className="w-full" display="chip" />
                    </div>

                    <div className="grid">
                        <div className="col-6">
                            <div className="field">
                                <label htmlFor="openingTime">Opening Time</label>
                                <InputText id="openingTime" type="time" value={settings.general.openingTime} onChange={(e) => updateSetting('general', 'openingTime', e.target.value)} className="w-full" />
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="field">
                                <label htmlFor="closingTime">Closing Time</label>
                                <InputText id="closingTime" type="time" value={settings.general.closingTime} onChange={(e) => updateSetting('general', 'closingTime', e.target.value)} className="w-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
export default GeneralSettings;
