import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { usePatientContext } from '@/libs/contextProviders/AppContexts';
import { ChangeEvent } from 'react';

const PatientPartnerExtra = () => {
    const { state, setStateValue } = usePatientContext();

    const onPartnerInput = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setStateValue({ partnerForm: { ...state.partnerForm, [id]: value } });
    };

    const onPartnerDOBChange = (value: Date | null) => {
        setStateValue({ partnerForm: { ...state.partnerForm, dateOfBirth: value } });
    };
    return (
        <>
            <div className="card">
                <div className="p-fluid formgrid grid">
                    <div className="field col-12">
                        <h6 className="m-0">Identity</h6>
                        <small className="text-500">Partner details (optional, if applicable).</small>
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="firstName">First Name</label>
                        <InputText id="firstName" placeholder="e.g. Jane" value={state.partnerForm.firstName} onChange={onPartnerInput} />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="lastName">Last Name</label>
                        <InputText id="lastName" placeholder="e.g. Doe" value={state.partnerForm.lastName} onChange={onPartnerInput} />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="dateOfBirth">Date of Birth</label>
                        <Calendar id="dateOfBirth" value={state.partnerForm.dateOfBirth as Date} onChange={(e) => onPartnerDOBChange(e.value as Date)} dateFormat="dd M yy" showIcon placeholder="Select date" />
                    </div>

                    <div className="field col-12">
                        <h6 className="m-0">Contact & Work</h6>
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="phone">Phone</label>
                        <InputText id="phone" placeholder="e.g. +1 555-0101" value={state.partnerForm.phone} onChange={onPartnerInput} />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="email">Email</label>
                        <InputText id="email" type="email" placeholder="e.g. jane@domain.com" value={state.partnerForm.email} onChange={onPartnerInput} />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="occupation">Occupation</label>
                        <InputText id="occupation" placeholder="e.g. Engineer" value={state.partnerForm.occupation} onChange={onPartnerInput} />
                    </div>
                </div>
            </div>
        </>
    );
};
export default PatientPartnerExtra;
