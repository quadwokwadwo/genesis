import { Card } from 'primereact/card';
import { TabPanel, TabView } from 'primereact/tabview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Checkbox } from 'primereact/checkbox';
import { Tag } from 'primereact/tag';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Panel } from 'primereact/panel';
import { Button } from 'primereact/button';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primereact/autocomplete';
import React from 'react';
import { FollowUpState, PrescriptionRecord, TInventoryItem } from '@/types/hospital';
import { FilterSelect } from '@/libs/components/UtilComponents';
import { formatCurrency, frequencyOptions, getAppointmentTypes } from '@/libs/utils';
import { EnhancedVisitState } from '@/types/hospital/hospital';
import { INVESTIGATION_STATUS } from '@/types/enums/enums';

type SharedVisitState = EnhancedVisitState | FollowUpState;
interface OrdersAndReviewProps {
    state: SharedVisitState; // Use your specific state type
    setStateValue: (updates: any) => void;
    addNewItem: (arrayKey: string, newItem: any) => void;
    removeItem: (arrayKey: string, index: number) => void;
    contextSource?: 'visit' | 'followup'; // Optional flag to handle differences
}

const OrdersAndReview: React.FC<OrdersAndReviewProps> = ({ state, setStateValue, addNewItem, removeItem }) => {
    const getTotalInvestigationCost = () => {
        return state.investigations.filter((inv) => inv.selected).reduce((total, inv) => total + (inv.price || 0), 0);
    };

    const getSelectedInvestigationsCount = () => {
        return state.investigations.filter((inv) => inv.selected).length;
    };

    const hasPartnerInvestigations = 'partnerInvestigations' in state && Array.isArray((state as any).partnerInvestigations);
    const partnerInvestigations = hasPartnerInvestigations ? (state as any).partnerInvestigations : [];

    const getTotalPartnerInvestigationCost = () => {
        return partnerInvestigations.filter((inv: any) => inv.selected).reduce((total: number, inv: any) => total + (inv.price || 0), 0);
    };

    const getSelectedPartnerInvestigationsCount = () => {
        return partnerInvestigations.filter((inv: any) => inv.selected).length;
    };
    const getTotalPrescriptionCost = () => {
        try {
            return state.prescriptions.reduce((sum, p) => sum + (p.totalPrice || 0), 0);
        } catch (e) {
            return 0;
        }
    };
    const getActiveFeesTotal = () => {
        const ai = state.accountsInfo as any;
        const consultOn = Boolean(ai?.chargeConsultation);
        const cardOn = Boolean(ai?.chargeHospitalCard);
        const consultFee = Number(state?.accountsInfo.consultationFee || 0);
        const cardFee = Number(state?.accountsInfo.hospitalCardFee || 0);
        return (consultOn ? consultFee : 0) + (cardOn ? cardFee : 0);
    };
    // Pre-discount subtotal (sum of all billables before discount)
    const getPreDiscountSubtotal = () => getTotalInvestigationCost() + getTotalPartnerInvestigationCost() + getTotalPrescriptionCost() + getActiveFeesTotal();
    const getEffectiveDiscount = () => {
        const subtotal = getPreDiscountSubtotal();
        const raw = Number(state.accountsInfo?.discountGiven || 0);
        if (!isFinite(raw) || raw <= 0) return 0;
        return Math.max(0, Math.min(raw, subtotal));
    };
    // Final subtotal (after discount)
    const getSubTotal = () => {
        const pre = getPreDiscountSubtotal();
        const discount = getEffectiveDiscount();
        const net = pre - discount;
        return net < 0 ? 0 : net;
    };
    const getGrandTotal = () => getSubTotal();
    const searchDrugs = (event: AutoCompleteCompleteEvent) => {
        const searchedDrugs = state.drugs.filter((drug) => drug.itemName.toLowerCase().includes(event.query.toLowerCase()));
        setStateValue({ filteredDrugs: searchedDrugs });
    };
    const onPrescriptionDrugSelect = (inventoryItem: TInventoryItem, itemIndex: number) => {
        try {
            const prescribedDrug = state.prescriptions[itemIndex];
            const { itemName, itemId, unitPrice, unitsPerBlister } = inventoryItem;

            const { totalPrice, totalQuantity, drugCount } = computeDrugCost(prescribedDrug.dosage, getFrequencyValue(prescribedDrug.frequency), prescribedDrug.durationDays, unitsPerBlister ?? 1, unitPrice);

            const updatedPrescription: PrescriptionRecord = {
                ...prescribedDrug,
                selectedItem: inventoryItem,
                medicationName: itemName,
                medicationId: itemId,
                price: unitPrice,
                totalPrice,
                quantity: totalQuantity,
                drugCount,
                unitsPerBlister: unitsPerBlister ?? 1
            };

            setStateValue({ prescriptions: getUpdatedPrescriptions(updatedPrescription, itemIndex), selectedDrug: inventoryItem });
        } catch (error) {
            console.log(error);
        }
    };
    const computeDrugCost = (dosage: number, frequency: number, duration: number, unitsPerBlister: number, unitPrice: number) => {
        try {
            const totalQuantity = dosage * frequency * duration;

            // const totalQuantity = Math.ceil(drugCount / unitsPerBlister);

            return { totalQuantity, totalPrice: totalQuantity * unitPrice, drugCount: totalQuantity };
        } catch (error) {
            console.log(error);
        }
    };
    const onDosageChange = (dosage: number, index: number) => {
        try {
            const prescribedDrug = state.prescriptions[index];

            const { durationDays, unitsPerBlister, price, frequency } = prescribedDrug;

            const { totalPrice, totalQuantity, drugCount } = computeDrugCost(dosage, getFrequencyValue(frequency), durationDays, unitsPerBlister ?? 1, price);

            const updatedPrescription = { ...prescribedDrug, totalPrice, quantity: totalQuantity, drugCount, dosage };

            setStateValue({ prescriptions: getUpdatedPrescriptions(updatedPrescription, index) });
        } catch (error) {
            console.log(error);
        }
    };

    const onFrequencyChange = (frequency: string, index: number) => {
        try {
            const prescribedDrug = state.prescriptions[index];

            const { durationDays, unitsPerBlister, price, dosage } = prescribedDrug;

            const { totalPrice, totalQuantity, drugCount } = computeDrugCost(dosage, getFrequencyValue(frequency), durationDays, unitsPerBlister ?? 1, price);

            const updatedPrescription = { ...prescribedDrug, totalPrice, quantity: totalQuantity, drugCount, frequency };

            setStateValue({ prescriptions: getUpdatedPrescriptions(updatedPrescription, index) });
        } catch (error) {
            console.log(error);
        }
    };
    const getFrequencyValue = (frequency: string): number => {
        return frequency === 'OD' ? 1 : frequency === 'BD' ? 2 : frequency === 'TDS' ? 3 : frequency === 'QDS' ? 4 : 0;
    };
    const getUpdatedPrescriptions = (updatedPrescription: PrescriptionRecord, itemIndex: number) => {
        return state.prescriptions.map((item, index) => (index === itemIndex ? updatedPrescription : item));
    };
    const onDurationDaysChange = (duration: number, index: number) => {
        try {
            const prescribedDrug = state.prescriptions[index];

            const { unitsPerBlister, price, frequency, dosage } = prescribedDrug;

            const { totalPrice, totalQuantity, drugCount } = computeDrugCost(dosage, getFrequencyValue(frequency), duration ?? 0, unitsPerBlister ?? 1, price);

            const updatedPrescription: PrescriptionRecord = { ...prescribedDrug, totalPrice, quantity: totalQuantity, drugCount, durationDays: duration ?? 0 };

            setStateValue({ prescriptions: getUpdatedPrescriptions(updatedPrescription, index) });
        } catch (error) {
            console.log(error);
        }
    };
    const onAppointmentTypeChange = (e: DropdownChangeEvent) => {
        setStateValue({ selectedAppointmentType: e.value, review: { ...state.review, reviewType: e.value.name } });
    };

    return (
        <>
            <div className="grid p-fluid">
                <div className="col-12">
                    <Card className="shadow-2">
                        <div className="flex align-items-center mb-4">
                            <i className="pi pi-check-circle text-primary text-2xl mr-3" />
                            <h4 className="m-0 text-primary">Orders & Follow-up</h4>
                        </div>

                        <TabView>
                            <TabPanel header={`Investigations (${getSelectedInvestigationsCount()} selected)`} leftIcon="pi pi-search">
                                <div className="flex justify-content-between align-items-center mb-3">
                                    <div>
                                        <h6 className="m-0">Laboratory & Diagnostic Tests</h6>
                                        <p className="text-600 text-sm m-0">Select required investigations</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-lg text-primary">Total: {formatCurrency(getTotalInvestigationCost(), state.generalSettings.country)}</div>
                                        <small className="text-500">{getSelectedInvestigationsCount()} tests selected</small>
                                    </div>
                                </div>

                                <DataTable value={state.investigations} dataKey="investigationId" scrollable scrollHeight="400px" className="p-datatable-sm">
                                    <Column
                                        field="selected"
                                        header="Select"
                                        body={(rowData, { rowIndex }) => (
                                            <Checkbox
                                                checked={rowData.selected}
                                                onChange={(e) => {
                                                    // Use stable identity to update selection to avoid mismatch after sorting/reordering
                                                    const updated = [...state.investigations];
                                                    const id = (rowData as any).investigationId;
                                                    const idx = updated.findIndex((inv: any) => inv.investigationId === id);
                                                    if (idx !== -1) {
                                                        updated[idx] = {
                                                            ...updated[idx],
                                                            selected: !!e.checked,
                                                            status: INVESTIGATION_STATUS.pending
                                                        };
                                                        setStateValue({ investigations: updated });
                                                    }
                                                }}
                                            />
                                        )}
                                        style={{ width: '60px' }}
                                    />
                                    <Column field="testName" header="Test Name" sortable />
                                    <Column
                                        field="source"
                                        header="Source"
                                        body={(rowData) => <Tag value={rowData.source} severity={rowData.source === 'Internal' ? 'success' : 'info'} icon={rowData.source === 'Internal' ? 'pi pi-home' : 'pi pi-building'} />}
                                    />
                                    <Column field="price" header="Price" body={(rowData) => <span className="font-semibold">{formatCurrency(rowData.price, state.generalSettings.country)}</span>} sortable />
                                </DataTable>
                            </TabPanel>

                            {hasPartnerInvestigations && (
                                <TabPanel header={`Partner Investigations (${getSelectedPartnerInvestigationsCount()} selected)`} leftIcon="pi pi-users">
                                    <div className="flex justify-content-between align-items-center mb-3">
                                        <div>
                                            <h6 className="m-0">Partner Laboratory & Diagnostic Tests</h6>
                                            <p className="text-600 text-sm m-0">Select required investigations for partner</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-lg text-primary">Total: {formatCurrency(getTotalPartnerInvestigationCost(), state.generalSettings.country)}</div>
                                            <small className="text-500">{getSelectedPartnerInvestigationsCount()} tests selected</small>
                                        </div>
                                    </div>

                                    <DataTable value={partnerInvestigations} dataKey="investigationId" scrollable scrollHeight="400px" className="p-datatable-sm">
                                        <Column
                                            field="selected"
                                            header="Select"
                                            body={(rowData, { rowIndex }) => (
                                                <Checkbox
                                                    checked={rowData.selected}
                                                    onChange={(e) => {
                                                        const updated = [...partnerInvestigations];
                                                        const id = (rowData as any).investigationId;
                                                        const idx = updated.findIndex((inv: any) => inv.investigationId === id);
                                                        if (idx !== -1) {
                                                            updated[idx] = {
                                                                ...updated[idx],
                                                                selected: !!e.checked,
                                                                status: INVESTIGATION_STATUS.pending
                                                            };
                                                            setStateValue({ partnerInvestigations: updated });
                                                        }
                                                    }}
                                                />
                                            )}
                                            style={{ width: '60px' }}
                                        />
                                        <Column field="testName" header="Test Name" sortable />
                                        <Column
                                            field="source"
                                            header="Source"
                                            body={(rowData) => <Tag value={rowData.source} severity={rowData.source === 'Internal' ? 'success' : 'info'} icon={rowData.source === 'Internal' ? 'pi pi-home' : 'pi pi-building'} />}
                                        />
                                        <Column field="price" header="Price" body={(rowData) => <span className="font-semibold">{formatCurrency(rowData.price, state.generalSettings.country)}</span>} sortable />
                                    </DataTable>
                                </TabPanel>
                            )}

                            <TabPanel header="Prescriptions" leftIcon="pi pi-shopping-bag">
                                <div className="mb-3">
                                    <Button
                                        label="Add Prescription"
                                        icon="pi pi-plus"
                                        onClick={() =>
                                            addNewItem('prescriptions', {
                                                medicationId: 0,
                                                medicationName: '',
                                                dosage: 1,
                                                route: 'Oral',
                                                frequency: 'OD',
                                                durationDays: 1,
                                                quantity: 1,
                                                price: 0,
                                                totalPrice: 0,
                                                drugCount: 0,
                                                unitsPerBlister: 0
                                            })
                                        }
                                        className="p-button-outlined w-fit"
                                    />
                                </div>

                                {state.prescriptions.map((prescription, index) => (
                                    <Panel key={index} header={`Prescription ${index + 1}`} className="mb-2" toggleable>
                                        <div className="formgrid grid">
                                            <div className="field col-12 md:col-4">
                                                <label>Medication</label>
                                                <AutoComplete
                                                    id="drugs"
                                                    value={prescription.selectedItem}
                                                    suggestions={state.filteredDrugs}
                                                    completeMethod={searchDrugs}
                                                    field="itemName"
                                                    onChange={(e) => onPrescriptionDrugSelect(e.value, index)}
                                                    dropdown
                                                    className="w-full"
                                                    placeholder="Search for medication"
                                                    itemTemplate={(item) => (
                                                        <div>
                                                            <div className="font-medium">{item.itemName}</div>
                                                            <div className="text-sm text-600">
                                                                Stock: {item.quantityInStock} | Category: {item.categoryName} | U/P Pack: {item.unitsPerBlister ?? 'N/A'}
                                                            </div>
                                                        </div>
                                                    )}
                                                />
                                            </div>

                                            <div className="field col-12 md:col-1">
                                                <label>Dosage</label>
                                                <InputNumber value={prescription.dosage} onChange={(e) => onDosageChange(e.value, index)} placeholder="e.g., 1 tablet" onFocus={(e) => e.target.select()} />
                                            </div>

                                            <div className="field col-12 md:col-2">
                                                <label>Route</label>
                                                <Dropdown
                                                    value={prescription.route}
                                                    onChange={(e) => {
                                                        const updated = [...state.prescriptions];
                                                        updated[index].route = e.value;
                                                        setStateValue({ prescriptions: updated });
                                                    }}
                                                    options={[
                                                        { label: 'Oral', value: 'Oral' },
                                                        { label: 'IV Bolus', value: 'IV Bolus' },
                                                        { label: 'IV Drip', value: 'IV Drip' },
                                                        { label: 'SC', value: 'SC' },
                                                        { label: 'IM', value: 'IM' },
                                                        { label: 'Topical', value: 'Topical' },
                                                        { label: 'Vaginal', value: 'Vaginal' }
                                                    ]}
                                                />
                                            </div>

                                            <div className="field col-12 md:col-2">
                                                <label>Frequency</label>
                                                <Dropdown value={prescription.frequency} onChange={(e) => onFrequencyChange(e.value, index)} options={frequencyOptions} placeholder="Select or type frequency" />
                                            </div>

                                            <div className="field col-12 md:col-2">
                                                <label>Duration (days)</label>
                                                <InputNumber value={prescription.durationDays} onChange={(e) => onDurationDaysChange(e.value, index)} min={1} max={365} onFocus={(e) => e.target.select()} />
                                            </div>

                                            <div className="field col-12 md:col-1 mt-5">
                                                <Button icon="pi pi-trash" className="p-button-danger p-button-outlined" onClick={() => removeItem('prescriptions', index)} size="small" />
                                            </div>
                                            <div className="flex justify-content-between align-items-center mt-2 gap-3">
                                                <div className="font-bold text-lg text-primary">Unit Price: {formatCurrency(prescription.price, state.generalSettings.country)}</div>||
                                                <div className="font-bold text-lg text-primary">Cost: {formatCurrency(prescription.totalPrice, state.generalSettings.country)}</div>||
                                                <div className="font-bold text-lg text-primary">Qty: {prescription.quantity}</div>||
                                                <div className="font-bold text-lg text-primary">Units of Drug Required: {prescription.drugCount}</div>||
                                                <div className="font-bold text-lg text-primary">Units Per Pack: {prescription.unitsPerBlister}</div>||
                                            </div>
                                        </div>
                                    </Panel>
                                ))}

                                {state.prescriptions.length === 0 && (
                                    <div className="text-center p-4 text-600">
                                        <i className="pi pi-info-circle text-2xl mb-2" />
                                        <p>No prescriptions added yet.</p>
                                    </div>
                                )}
                            </TabPanel>

                            <TabPanel header="Follow-up" leftIcon="pi pi-calendar-plus">
                                <div className="formgrid grid">
                                    <div className="field col-12 md:col-4">
                                        <label className="font-semibold mb-2 block">Next Appointment Date</label>
                                        <Calendar
                                            value={state.review.nextAppointment}
                                            onChange={(e) =>
                                                setStateValue({
                                                    review: { ...state.review, nextAppointment: e.value as Date }
                                                })
                                            }
                                            showIcon
                                            dateFormat="dd M yy"
                                            minDate={new Date()}
                                            placeholder="Select date"
                                        />
                                    </div>

                                    <div className="field col-12 md:col-4">
                                        <label className="font-semibold mb-2 block">Review Type</label>
                                        <FilterSelect
                                            selectedOption={state.selectedAppointmentType}
                                            selectableOptions={getAppointmentTypes()}
                                            onSelectChange={onAppointmentTypeChange}
                                            elementId="appointmentType"
                                            defaultValue="Review Type"
                                            showLabel={false}
                                        />
                                    </div>

                                    <div className="field col-12 md:col-4">
                                        <label className="font-semibold mb-2 block">Assistant</label>
                                        <Dropdown
                                            value={state.review.assistingDoctor || ''}
                                            onChange={(e) =>
                                                setStateValue({
                                                    review: { ...state.review, assistingDoctor: e.value }
                                                })
                                            }
                                            options={
                                                state.users?.map((user) => ({
                                                    label: `${user.firstName} ${user.lastName}${user.specialization ? ` - ${user.specialization}` : ''}`,
                                                    value: `${user.firstName} ${user.lastName}`
                                                })) || []
                                            }
                                            placeholder="Select assisting personnel"
                                            className="w-full"
                                            filter
                                            showClear
                                        />
                                    </div>

                                    <div className="field col-12">
                                        <label className="font-semibold mb-2 block">Review Notes & Instructions</label>
                                        <InputTextarea
                                            rows={6}
                                            value={state.review.reviewNotes?.toString() || ''}
                                            onChange={(e) =>
                                                setStateValue({
                                                    review: { ...state.review, reviewNotes: e.target.value }
                                                })
                                            }
                                            placeholder="Special instructions for next visit, patient education notes, warning signs to watch for..."
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            </TabPanel>

                            <TabPanel header="Accounts Info" leftIcon="pi pi-wallet">
                                <div className="formgrid grid">
                                    <div className="col-12 md:col-6">
                                        <Panel header="Summary" className="mb-3">
                                            <div className="flex justify-content-between mb-2">
                                                <span>Investigations Total</span>
                                                <span className="font-semibold">{getTotalInvestigationCost().toFixed(2)}</span>
                                            </div>
                                            {hasPartnerInvestigations && getSelectedPartnerInvestigationsCount() > 0 && (
                                                <div className="flex justify-content-between mb-2">
                                                    <span>Partner Investigations Total</span>
                                                    <span className="font-semibold">{getTotalPartnerInvestigationCost().toFixed(2)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-content-between mb-2">
                                                <span>Prescriptions Total</span>
                                                <span className="font-semibold">{getTotalPrescriptionCost().toFixed(2)}</span>
                                            </div>
                                            {Boolean(state.accountsInfo?.chargeConsultation) && (
                                                <div className="flex justify-content-between mb-2">
                                                    <span>Consultation Fee</span>
                                                    <span className="font-semibold">{Number(state.accountsInfo?.consultationFee || 0).toFixed(2)}</span>
                                                </div>
                                            )}
                                            {Boolean(state.accountsInfo?.chargeHospitalCard) && (
                                                <div className="flex justify-content-between mb-2">
                                                    <span>Hospital Card Fee</span>
                                                    <span className="font-semibold">{Number(state.accountsInfo?.hospitalCardFee || 0).toFixed(2)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-content-between mt-2">
                                                <span>Discount</span>
                                                <span className="font-semibold text-orange-600">- {getEffectiveDiscount().toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-content-between border-top pt-2">
                                                <span>Sub‑Total</span>
                                                <span className="font-bold text-primary">{formatCurrency(getSubTotal(), state.generalSettings.country)}</span>
                                            </div>
                                        </Panel>
                                    </div>
                                    <div className="col-12 md:col-6">
                                        <Panel header="Adjustments" className="mb-3">
                                            <div className="formgrid grid">
                                                <div className="field col-12">
                                                    <label className="font-semibold mb-2 block">Discount</label>
                                                    <InputNumber
                                                        value={state.accountsInfo?.discountGiven || 0}
                                                        onValueChange={(e) => {
                                                            const val = typeof e.value === 'number' ? e.value : state.accountsInfo?.discountGiven || 0;
                                                            const max = getPreDiscountSubtotal();
                                                            const clamped = Math.max(0, Math.min(val, max));
                                                            setStateValue({ accountsInfo: { ...state.accountsInfo, discountGiven: clamped } });
                                                        }}
                                                        min={0}
                                                        max={getPreDiscountSubtotal()}
                                                        mode="decimal"
                                                        showButtons
                                                        className="w-full"
                                                        onFocus={(e) => e.target.select()}
                                                    />
                                                </div>
                                                <div className="field col-12">
                                                    <div className="flex align-items-center gap-3">
                                                        <Checkbox
                                                            inputId="chargeConsultation"
                                                            checked={Boolean(state.accountsInfo?.chargeConsultation)}
                                                            onChange={(e) => setStateValue({ accountsInfo: { ...state.accountsInfo, chargeConsultation: e.checked ?? false } })}
                                                        />
                                                        <label htmlFor="chargeConsultation">Charge consultation</label>
                                                    </div>
                                                    {Boolean(state.accountsInfo?.chargeConsultation) && (
                                                        <div className="mt-2">
                                                            <label htmlFor="consultationFee" className="font-semibold mb-2 block">
                                                                Consultation Fee
                                                            </label>
                                                            <InputNumber
                                                                id="consultationFee"
                                                                value={Number(state.accountsInfo?.consultationFee || 0)}
                                                                onValueChange={(e) => {
                                                                    const val = typeof e.value === 'number' ? e.value : Number(state.accountsInfo?.consultationFee || 0);
                                                                    const clamped = Math.max(0, val);
                                                                    setStateValue({ accountsInfo: { ...state.accountsInfo, consultationFee: clamped } });
                                                                }}
                                                                min={0}
                                                                mode="decimal"
                                                                showButtons
                                                                className="w-full"
                                                                onFocus={(e) => e.target.select()}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="field col-12">
                                                    <div className="flex align-items-center gap-3">
                                                        <Checkbox
                                                            inputId="chargeHospitalCard"
                                                            checked={Boolean(state.accountsInfo?.chargeHospitalCard)}
                                                            onChange={(e) => setStateValue({ accountsInfo: { ...state.accountsInfo, chargeHospitalCard: e.checked ?? false } })}
                                                        />
                                                        <label htmlFor="chargeHospitalCard">Charge hospital card</label>
                                                    </div>
                                                    {Boolean(state.accountsInfo?.chargeHospitalCard) && (
                                                        <div className="mt-2">
                                                            <label htmlFor="hospitalCardFee" className="font-semibold mb-2 block">
                                                                Hospital Card Fee
                                                            </label>
                                                            <InputNumber
                                                                id="hospitalCardFee"
                                                                value={Number(state.accountsInfo?.hospitalCardFee || 0)}
                                                                onValueChange={(e) => {
                                                                    const val = typeof e.value === 'number' ? e.value : Number(state.accountsInfo?.hospitalCardFee || 0);
                                                                    const clamped = Math.max(0, val);
                                                                    setStateValue({ accountsInfo: { ...state.accountsInfo, hospitalCardFee: clamped } });
                                                                }}
                                                                min={0}
                                                                mode="decimal"
                                                                showButtons
                                                                className="w-full"
                                                                onFocus={(e) => e.target.select()}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Panel>
                                    </div>

                                    <div className="col-12">
                                        <Panel header="Amount Due" className="mb-0">
                                            <div className="flex justify-content-between">
                                                <span className="text-700">Grand Total</span>
                                                <span className="font-bold text-primary text-lg">{formatCurrency(getGrandTotal())}</span>
                                            </div>
                                        </Panel>
                                    </div>
                                </div>
                            </TabPanel>
                        </TabView>
                    </Card>
                </div>
            </div>
        </>
    );
};
export default OrdersAndReview;
