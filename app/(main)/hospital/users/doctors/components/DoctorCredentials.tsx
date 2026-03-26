import React from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Tag } from 'primereact/tag';
import { useDoctorContext } from '@/libs/contextProviders/AppContexts';
import { DoctorCredential } from '@/types/hospital';

const DoctorCredentials: React.FC = () => {
    const { state, setStateValue, addNewCredential, updateCredential, removeCredential } = useDoctorContext();

    const [credentialForm, setCredentialForm] = React.useState<DoctorCredential>({
        licenseNumber: '',
        licenseExpiry: null,
        qualification: '',
        institution: '',
        certificationDate: null
    });

    const handleAddCredential = () => {
        setCredentialForm({
            licenseNumber: '',
            licenseExpiry: null,
            qualification: '',
            institution: '',
            certificationDate: null
        });
        setStateValue({
            showCredentialDialog: true,
            editingCredentialIndex: -1
        });
    };

    const handleEditCredential = (credential: DoctorCredential, index: number) => {
        setCredentialForm({ ...credential });
        setStateValue({
            showCredentialDialog: true,
            editingCredentialIndex: index
        });
    };

    const handleSaveCredential = () => {
        if (!credentialForm.licenseNumber || !credentialForm.qualification) {
            return;
        }

        if (state.editingCredentialIndex === -1) {
            addNewCredential(credentialForm);
        } else {
            updateCredential(state.editingCredentialIndex, credentialForm);
        }

        setStateValue({ showCredentialDialog: false });
        setCredentialForm({
            licenseNumber: '',
            licenseExpiry: null,
            qualification: '',
            institution: '',
            certificationDate: null
        });
    };

    const getLicenseStatus = (expiry: Date | null) => {
        if (!expiry) return { severity: 'info', value: 'No Expiry' };

        const today = new Date();
        const expiryDate = new Date(expiry);
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

        if (daysUntilExpiry < 0) {
            return { severity: 'danger', value: 'Expired' };
        } else if (daysUntilExpiry <= 90) {
            return { severity: 'warning', value: `${daysUntilExpiry} days` };
        } else {
            return { severity: 'success', value: 'Valid' };
        }
    };

    const licenseExpiryTemplate = (rowData: DoctorCredential) => {
        if (!rowData.licenseExpiry) {
            return <Tag value="No Expiry" severity="info" />;
        }

        const status = getLicenseStatus(rowData.licenseExpiry);
        return (
            <div>
                <div>{new Date(rowData.licenseExpiry).toLocaleDateString()}</div>
                <Tag value={status.value} severity={status.severity as any} className="mt-1" />
            </div>
        );
    };

    const actionTemplate = (rowData: DoctorCredential, options: any) => {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-text p-button-sm" onClick={() => handleEditCredential(rowData, options.rowIndex)} tooltip="Edit credential" />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-text p-button-sm p-button-danger" onClick={() => removeCredential(options.rowIndex)} tooltip="Delete credential" />
            </div>
        );
    };

    const credentialDialogFooter = (
        <div className="flex justify-content-end gap-2">
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={() => setStateValue({ showCredentialDialog: false })} />
            <Button label="Save" icon="pi pi-check" onClick={handleSaveCredential} disabled={!credentialForm.licenseNumber || !credentialForm.qualification} />
        </div>
    );

    return (
        <div className="grid">
            <div className="col-12">
                <Card className="shadow-2">
                    <div className="flex align-items-center justify-content-between mb-4">
                        <div className="flex align-items-center">
                            <i className="pi pi-certificate text-primary text-2xl mr-3" />
                            <div>
                                <h4 className="m-0 text-primary">Medical Credentials</h4>
                                <p className="text-600 m-0">Add licenses, qualifications, and certifications</p>
                            </div>
                        </div>
                        <Button label="Add Credential" icon="pi pi-plus" onClick={handleAddCredential} className="p-button-outlined" />
                    </div>

                    <DataTable value={state.credentials} emptyMessage="No credentials added yet" responsiveLayout="scroll" className="p-datatable-sm">
                        <Column field="qualification" header="Qualification" style={{ minWidth: '200px' }} />
                        <Column field="institution" header="Institution" style={{ minWidth: '200px' }} />
                        <Column field="licenseNumber" header="License Number" style={{ minWidth: '150px' }} />
                        <Column field="licenseExpiry" header="License Expiry" body={licenseExpiryTemplate} style={{ minWidth: '150px' }} />
                        <Column field="certificationDate" header="Certification Date" body={(rowData) => (rowData.certificationDate ? new Date(rowData.certificationDate).toLocaleDateString() : '-')} style={{ minWidth: '150px' }} />
                        <Column header="Actions" body={actionTemplate} style={{ width: '120px' }} />
                    </DataTable>
                </Card>
            </div>

            {/* Credential Dialog */}
            <Dialog
                visible={state.showCredentialDialog}
                onHide={() => setStateValue({ showCredentialDialog: false })}
                header={state.editingCredentialIndex === -1 ? 'Add Credential' : 'Edit Credential'}
                modal
                style={{ width: '600px' }}
                footer={credentialDialogFooter}
            >
                <div className="formgrid grid p-fluid">
                    <div className="field col-12">
                        <label className="font-semibold mb-2 block">Qualification *</label>
                        <InputText
                            value={credentialForm.qualification}
                            onChange={(e) =>
                                setCredentialForm({
                                    ...credentialForm,
                                    qualification: e.target.value
                                })
                            }
                            placeholder="e.g., MBBS, MD, Fellowship in Reproductive Medicine"
                            maxLength={200}
                        />
                    </div>

                    <div className="field col-12">
                        <label className="font-semibold mb-2 block">Institution</label>
                        <InputText
                            value={credentialForm.institution}
                            onChange={(e) =>
                                setCredentialForm({
                                    ...credentialForm,
                                    institution: e.target.value
                                })
                            }
                            placeholder="Institution or University name"
                            maxLength={200}
                        />
                    </div>

                    <div className="field col-12">
                        <label className="font-semibold mb-2 block">License Number *</label>
                        <InputText
                            value={credentialForm.licenseNumber}
                            onChange={(e) =>
                                setCredentialForm({
                                    ...credentialForm,
                                    licenseNumber: e.target.value
                                })
                            }
                            placeholder="Medical license number"
                            maxLength={100}
                        />
                    </div>

                    <div className="field col-12 md:col-6">
                        <label className="font-semibold mb-2 block">Certification Date</label>
                        <Calendar
                            value={credentialForm.certificationDate}
                            onChange={(e) =>
                                setCredentialForm({
                                    ...credentialForm,
                                    certificationDate: e.value as Date
                                })
                            }
                            showIcon
                            dateFormat="dd M yy"
                            maxDate={new Date()}
                            placeholder="Select certification date"
                        />
                    </div>

                    <div className="field col-12 md:col-6">
                        <label className="font-semibold mb-2 block">License Expiry</label>
                        <Calendar
                            value={credentialForm.licenseExpiry}
                            onChange={(e) =>
                                setCredentialForm({
                                    ...credentialForm,
                                    licenseExpiry: e.value as Date
                                })
                            }
                            showIcon
                            dateFormat="dd M yy"
                            minDate={new Date()}
                            placeholder="Select expiry date (optional)"
                        />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default DoctorCredentials;
