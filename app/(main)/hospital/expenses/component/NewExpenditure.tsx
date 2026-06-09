import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import React, { useRef } from 'react';
import { useExpenditureContext } from '@/libs/contextProviders/AppContexts';
import { TabPanel, TabView } from 'primereact/tabview';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FileUpload, FileUploadHandlerEvent } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { changeDateFormat } from '@/libs/utils';
import { FilterSelect } from '@/libs/components/UtilComponents';
import { uploadFileMultipart } from '@/libs/blue_prints/IVFEmbryoService';

const NewExpenditure = () => {
    const { state, setStateValue, editExpenseItem, removeExpenseItem, INITIAL_ITEM } = useExpenditureContext();
    const toast = useRef<Toast>(null);
    const receiptUploadRef = useRef<FileUpload>(null);

    // Module 16: upload the chosen receipt through the central pipeline and
    // store only the returned fileId on the expenditure row.
    const handleReceiptUpload = async (event: FileUploadHandlerEvent) => {
        const file = event.files?.[0];
        if (!file) return;
        try {
            const meta = await uploadFileMultipart('expenditure-receipt', file);
            setStateValue({
                expenditure: { ...state.expenditure, receiptFileId: meta?.fileId ?? null }
            });
            toast.current?.show({ severity: 'success', summary: 'Receipt uploaded', detail: file.name });
        } catch (err: any) {
            toast.current?.show({ severity: 'error', summary: 'Upload failed', detail: err?.message || 'Could not upload receipt' });
        } finally {
            receiptUploadRef.current?.clear();
        }
    };

    return (
        <>
            <Toast ref={toast} />
            <TabView>
                <TabPanel header="Basic Information" leftIcon="pi pi-info-circle">
                    <div className="formgrid grid p-fluid">
                        <div className="field col-12 md:col-6">
                            <label htmlFor="expenseDate">Expense Date *</label>
                            <Calendar
                                id="expenseDate"
                                value={new Date(state.expenditure.expenseDate)}
                                onChange={(e) =>
                                    setStateValue({
                                        expenditure: { ...state.expenditure, expenseDate: changeDateFormat(e.value as Date) }
                                    })
                                }
                                showIcon
                                dateFormat="dd/mm/yy"
                            />
                        </div>
                        <div className="field col-12 md:col-6 lg:col-6">
                            <label htmlFor="category">Category *</label>
                            <FilterSelect
                                selectedOption={state.selectedCategory}
                                selectableOptions={state.categories}
                                onSelectChange={(e) => {
                                    setStateValue({
                                        selectedCategory: e.value,
                                        expenditure: { ...state.expenditure, category: e.value.name }
                                    });
                                }}
                                elementId="category"
                                defaultValue="Selected Category"
                                showLabel={false}
                            />
                        </div>
                        <div className="field col-12 md:col-6">
                            <label htmlFor="subCategory">Sub Category</label>
                            <FilterSelect
                                selectedOption={state.selectedSubCategory}
                                selectableOptions={state.subCategories}
                                onSelectChange={(e) => {
                                    setStateValue({
                                        selectedSubCategory: e.value,
                                        expenditure: { ...state.expenditure, subCategory: e.value.name }
                                    });
                                }}
                                elementId="expenditureId"
                                defaultValue="Select Subcategory"
                                showLabel={false}
                            />
                        </div>
                        <div className="field col-12 md:col-6">
                            <label htmlFor="department">Department *</label>
                            <FilterSelect
                                selectedOption={state.selectedDepartment}
                                selectableOptions={state.departments}
                                onSelectChange={(e) => {
                                    setStateValue({
                                        selectedDepartment: e.value,
                                        expenditure: { ...state.expenditure, department: e.value.name }
                                    });
                                }}
                                elementId="department"
                                defaultValue="Select Department"
                                showLabel={false}
                            />
                        </div>
                        <div className="field col-12">
                            <label htmlFor="description">Description *</label>
                            <InputTextarea
                                id="description"
                                value={state.expenditure.description}
                                onChange={(e) =>
                                    setStateValue({
                                        expenditure: { ...state.expenditure, description: e.target.value }
                                    })
                                }
                                rows={3}
                                placeholder="Enter detailed description"
                            />
                        </div>
                    </div>
                </TabPanel>

                <TabPanel header="Vendor Information" leftIcon="pi pi-building">
                    <div className="formgrid grid">
                        <div className="field col-12 md:col-6">
                            <label htmlFor="vendor">Vendor Name *</label>
                            <InputText
                                id="vendor"
                                value={state.expenditure.vendor.vendor}
                                onChange={(e) =>
                                    setStateValue({
                                        expenditure: { ...state.expenditure, vendor: { ...state.expenditure.vendor, vendor: e.target.value } }
                                    })
                                }
                                placeholder="Enter vendor name"
                            />
                        </div>
                        <div className="field col-12 md:col-6">
                            <label htmlFor="contactPerson">Contact Person</label>
                            <InputText
                                id="contactPerson"
                                value={state.expenditure.vendor.contactPerson}
                                onChange={(e) =>
                                    setStateValue({
                                        expenditure: { ...state.expenditure, vendor: { ...state.expenditure.vendor, contactPerson: e.target.value } }
                                    })
                                }
                                placeholder="Enter contact person"
                            />
                        </div>
                        <div className="field col-12 md:col-6">
                            <label htmlFor="contactPhone">Contact Phone</label>
                            <InputText
                                id="contactPhone"
                                value={state.expenditure.vendor.contactPhone}
                                onChange={(e) =>
                                    setStateValue({
                                        expenditure: { ...state.expenditure, vendor: { ...state.expenditure.vendor, contactPhone: e.target.value } }
                                    })
                                }
                                placeholder="Enter phone number"
                            />
                        </div>
                        <div className="field col-12 md:col-6">
                            <label htmlFor="contactEmail">Contact Email</label>
                            <InputText
                                id="contactEmail"
                                value={state.expenditure.vendor.contactEmail}
                                onChange={(e) =>
                                    setStateValue({
                                        expenditure: { ...state.expenditure, vendor: { ...state.expenditure.vendor, contactEmail: e.target.value } }
                                    })
                                }
                                placeholder="Enter email address"
                            />
                        </div>
                    </div>
                </TabPanel>

                <TabPanel header="Items & Pricing" leftIcon="pi pi-shopping-cart">
                    <div className="mb-4">
                        <Button
                            label="Add Item"
                            icon="pi pi-plus"
                            onClick={() =>
                                setStateValue({
                                    showItemDialog: true,
                                    newItem: { ...INITIAL_ITEM },
                                    editingItemIndex: null
                                })
                            }
                            className="mb-3"
                        />

                        <DataTable value={state.expenditure.items} emptyMessage="No items added">
                            <Column field="description" header="Description" />
                            <Column field="quantity" header="Quantity" />
                            <Column field="unitPrice" header="Unit Price" body={(rowData) => ` ${rowData.unitPrice}`} />
                            <Column field="totalPrice" header="Total" body={(rowData) => ` ${rowData.totalPrice}`} />
                            <Column
                                body={(rowData, { rowIndex }) => (
                                    <div className="flex gap-2">
                                        <Button icon="pi pi-pencil" size="small" outlined onClick={() => editExpenseItem(rowIndex)} />
                                        <Button icon="pi pi-trash" size="small" outlined severity="danger" onClick={() => removeExpenseItem(rowIndex)} />
                                    </div>
                                )}
                            />
                        </DataTable>
                    </div>

                    <div className="formgrid grid">
                        <div className="field col-12 md:col-4">
                            <label htmlFor="taxAmount">Tax Amount</label>
                            <InputNumber
                                id="taxAmount"
                                value={state.expenditure.taxAmount}
                                onChange={(e) =>
                                    setStateValue({
                                        expenditure: { ...state.expenditure, taxAmount: e.value || 0 }
                                    })
                                }
                            />
                        </div>
                        <div className="field col-12 md:col-4">
                            <label htmlFor="discountAmount">Discount Amount</label>
                            <InputNumber
                                id="discountAmount"
                                value={state.expenditure.discountAmount}
                                onChange={(e) =>
                                    setStateValue({
                                        expenditure: { ...state.expenditure, discountAmount: e.value || 0 }
                                    })
                                }
                            />
                        </div>
                        <div className="field col-12 md:col-4">
                            <label htmlFor="totalAmount">Total Amount</label>
                            <InputNumber id="totalAmount" value={state.expenditure.totalAmount} disabled />
                        </div>
                    </div>
                </TabPanel>

                <TabPanel header="Payment & Status" leftIcon="pi pi-credit-card">
                    <div className="formgrid grid">
                        <div className="field col-12 md:col-6">
                            <label htmlFor="status">Status</label>
                            <Dropdown
                                id="status"
                                value={state.expenditure.status}
                                options={state.statusOptions}
                                onChange={(e) =>
                                    setStateValue({
                                        expenditure: { ...state.expenditure, status: e.value }
                                    })
                                }
                                optionLabel="name"
                                optionValue="code"
                            />
                        </div>
                        <div className="field col-12 md:col-6">
                            <label htmlFor="priority">Priority</label>
                            <Dropdown
                                id="priority"
                                value={state.expenditure.priority}
                                options={state.priorityOptions}
                                onChange={(e) =>
                                    setStateValue({
                                        expenditure: { ...state.expenditure, priority: e.value }
                                    })
                                }
                                optionLabel="name"
                                optionValue="code"
                            />
                        </div>
                        <div className="field col-12 md:col-6">
                            <label htmlFor="paymentMethod">Payment Method</label>
                            <Dropdown
                                id="paymentMethod"
                                value={state.expenditure.paymentMethod}
                                options={state.paymentMethods}
                                onChange={(e) =>
                                    setStateValue({
                                        expenditure: { ...state.expenditure, paymentMethod: e.value }
                                    })
                                }
                                optionLabel="name"
                                optionValue="code"
                            />
                        </div>
                        <div className="field col-12 md:col-6">
                            <label htmlFor="paymentDate">Payment Date</label>
                            <Calendar
                                id="paymentDate"
                                value={new Date(state.expenditure.paymentDate)}
                                onChange={(e) =>
                                    setStateValue({
                                        expenditure: { ...state.expenditure, paymentDate: changeDateFormat(e.value as Date) }
                                    })
                                }
                                showIcon
                                dateFormat="dd/mm/yy"
                            />
                        </div>
                        <div className="field col-12 md:col-6">
                            <label htmlFor="receiptNumber">Receipt Number</label>
                            <InputText
                                id="receiptNumber"
                                value={state.expenditure.receiptNumber}
                                onChange={(e) =>
                                    setStateValue({
                                        expenditure: { ...state.expenditure, receiptNumber: e.target.value }
                                    })
                                }
                                placeholder="Enter receipt number"
                            />
                        </div>
                        <div className="field col-12 md:col-6">
                            <label htmlFor="invoiceNumber">Invoice Number</label>
                            <InputText
                                id="invoiceNumber"
                                value={state.expenditure.invoiceNumber}
                                onChange={(e) =>
                                    setStateValue({
                                        expenditure: { ...state.expenditure, invoiceNumber: e.target.value }
                                    })
                                }
                                placeholder="Enter invoice number"
                            />
                        </div>
                        <div className="field col-12">
                            <label htmlFor="receiptFile">Receipt / Invoice File</label>
                            <div className="flex align-items-center gap-3 flex-wrap">
                                <FileUpload
                                    ref={receiptUploadRef}
                                    mode="basic"
                                    name="receipt"
                                    accept="image/*,application/pdf"
                                    maxFileSize={25 * 1024 * 1024}
                                    auto
                                    customUpload
                                    uploadHandler={handleReceiptUpload}
                                    chooseLabel={state.expenditure.receiptFileId ? 'Replace Receipt' : 'Upload Receipt'}
                                    chooseOptions={{ icon: 'pi pi-upload' }}
                                />
                                {state.expenditure.receiptFileId && (
                                    <a href={`/api/files/${encodeURIComponent(state.expenditure.receiptFileId)}`} target="_blank" rel="noopener noreferrer" className="p-button p-button-text p-button-sm">
                                        <i className="pi pi-external-link mr-2" /> View receipt
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </TabPanel>
            </TabView>
        </>
    );
};
export default NewExpenditure;
