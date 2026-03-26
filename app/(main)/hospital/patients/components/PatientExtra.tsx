import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { usePatientContext } from '@/libs/contextProviders/AppContexts';
import { ChangeEvent } from 'react';
import { GENDERS } from '@/types/enums/enums';
import { calcAgeFromDOB } from '@/libs/utils';

const PatientExtra = () => {
    const { state, setStateValue } = usePatientContext();
    const onGenderChange = (e: DropdownChangeEvent) => {
        setStateValue({
            selectedGender: e.value,
            patientForm: { ...state.patientForm, gender: e.value?.name || '' },
            partnerForm: { ...state.partnerForm, gender: e.value?.name === GENDERS.female ? GENDERS.male : GENDERS.female }
        });
    };

    const onMaritalStatusChange = (e: DropdownChangeEvent) => {
        setStateValue({
            patientForm: { ...state.patientForm, maritalStatus: e.value?.name || '' }
        });
    };
    const onDOBChange = (value: Date | null) => {
        setStateValue({ patientForm: { ...state.patientForm, dateOfBirth: value } });
    };

    const onPatientInput = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setStateValue({ patientForm: { ...state.patientForm, [id]: value } });
    };
    return (
        <>
            <div className="card">
                <div className="p-fluid formgrid grid">
                    <div className="field col-12">
                        <h6 className="m-0">Identity</h6>
                        <small className="text-500">Basic details of the patient.</small>
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="firstName">First Name *</label>
                        <InputText id="firstName" placeholder="e.g. John" value={state.patientForm.firstName} onChange={onPatientInput} />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="lastName">Last Name *</label>
                        <InputText id="lastName" placeholder="e.g. Doe" value={state.patientForm.lastName} onChange={onPatientInput} />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="recordNumber">Record Number *</label>
                        <InputText id="recordNumber" placeholder="Unique record number" value={state.patientForm.recordNumber} onChange={onPatientInput} />
                    </div>

                    <div className="field col-12 md:col-4">
                        <label htmlFor="dateOfBirth">Date of Birth *</label>
                        <Calendar id="dateOfBirth" value={new Date(state.patientForm.dateOfBirth)} onChange={(e) => onDOBChange(e.value as Date)} dateFormat="dd M yy" showIcon placeholder="Select date" />
                        <small className="text-500">Age: {state.patientForm.dateOfBirth ? calcAgeFromDOB(state.patientForm.dateOfBirth as Date) : '--'}</small>
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="gender">Gender *</label>
                        <Dropdown className="w-full" value={state.selectedGender} onChange={onGenderChange} options={state.genders} optionLabel="name" placeholder="Select gender" />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="maritalStatus">Marital Status</label>
                        <Dropdown
                            className="w-full"
                            value={state.patientForm.maritalStatus ? { name: state.patientForm.maritalStatus, code: state.patientForm.maritalStatus } : null}
                            onChange={onMaritalStatusChange}
                            options={state.maritalStatuses}
                            optionLabel="name"
                            placeholder="Select marital status"
                        />
                    </div>

                    <div className="field col-12">
                        <h6 className="m-0">Contact</h6>
                        <small className="text-500">How can we reach the patient?</small>
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="phone">Phone *</label>
                        <InputText id="phone" placeholder="e.g. +1 555-0100" value={state.patientForm.phone} onChange={onPatientInput} />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="email">Email</label>
                        <InputText id="email" type="email" placeholder="e.g. john@domain.com" value={state.patientForm.email} onChange={onPatientInput} />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="nationality">Nationality</label>
                        <InputText id="nationality" placeholder="e.g. Ghanaian" value={state.patientForm.nationality} onChange={onPatientInput} />
                    </div>

                    <div className="field col-12">
                        <h6 className="m-0">Additional</h6>
                        <small className="text-500">Background details.</small>
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="occupation">Occupation</label>
                        <InputText id="occupation" placeholder="e.g. Teacher" value={state.patientForm.occupation} onChange={onPatientInput} />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="religion">Religion</label>
                        <InputText id="religion" placeholder="e.g. Christian" value={state.patientForm.religion} onChange={onPatientInput} />
                    </div>
                    <div className="field col-12 md:col-12">
                        <label htmlFor="address">Address</label>
                        <InputTextarea id="address" rows={3} autoResize placeholder="Street, City, Country" value={state.patientForm.address} onChange={onPatientInput} />
                    </div>

                    <div className="field col-12">
                        <h6 className="m-0">Next of Kin</h6>
                        <small className="text-500">Emergency contact details.</small>
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="nextOfKinName">Name</label>
                        <InputText id="nextOfKinName" placeholder="Full name" value={state.patientForm.nextOfKinName} onChange={onPatientInput} />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="nextOfKinPhone">Phone</label>
                        <InputText id="nextOfKinPhone" placeholder="Phone number" value={state.patientForm.nextOfKinPhone} onChange={onPatientInput} />
                    </div>
                </div>
            </div>
        </>
    );
};
export default PatientExtra;
