'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { FileUpload } from 'primereact/fileupload';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { HospitalExpenditure, ExpenseItem, ExpenditureState } from '@/types/hospital';
import { CRUDTYPE } from '@/types/enums/enums';
import { ExpenditureContext } from '@/libs/contextProviders/AppContexts';
import ExpenditureList from '@/app/(main)/hospital/expenses/component/ExpenditureList';
import NewExpenditure from '@/app/(main)/hospital/expenses/component/NewExpenditure';
import NewExpenseItem from '@/app/(main)/hospital/expenses/component/NewExpenseItem';
import { changeDateFormat, defaultSelected, getPaymentOptions, pageDataValidation } from '@/libs/utils';
import Expenditure from '@/libs/blue_prints/Expenditure';
import useUserData from '@/libs/hooks/useUserData';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { validateExpenditure } from '@/libs/joiValidations';

const INITIAL_EXPENDITURE: HospitalExpenditure = {
    expenseDate: changeDateFormat(new Date()),
    category: '',
    subCategory: '',
    description: '',
    vendor: { vendor: '', contactPerson: '', contactPhone: '', contactEmail: '' },
    totalAmount: 0,
    paymentMethod: null,
    paymentDate: changeDateFormat(new Date()),
    status: 'Pending',
    priority: 'Medium',
    department: '',
    userId: 0,
    receiptNumber: '',
    invoiceNumber: '',
    taxAmount: 0,
    discountAmount: 0,
    items: []
};

const INITIAL_ITEM: ExpenseItem = {
    description: '',
    quantity: 1,
    unitPrice: 0,
    totalPrice: 0,
    category: '',
    notes: ''
};

const INITIAL_STATE: ExpenditureState = {
    expenditure: { ...INITIAL_EXPENDITURE },
    expendituresList: [],
    categories: [
        { name: 'Medical Equipment', code: 'Medical Equipment' },
        { name: 'Pharmaceuticals', code: 'Pharmaceuticals' },
        { name: 'Medical Supplies', code: 'Medical Supplies' },
        { name: 'Utilities', code: 'Utilities' },
        { name: 'Staff Salaries', code: 'Staff Salaries' },
        { name: 'Building Maintenance', code: 'Building Maintenance' },
        { name: 'Insurance', code: 'Insurance' },
        { name: 'Professional Services', code: 'Professional Services' },
        { name: 'Technology', code: 'Technology' },
        { name: 'Training & Education', code: 'Training & Education' },
        { name: 'Administrative', code: 'Administrative' },
        { name: 'Marketing', code: 'Marketing' },
        { name: 'Other', code: 'Other' }
    ],
    subCategories: [],
    departments: [
        { name: 'Surgery', code: 'Surgery' },
        { name: 'Radiology', code: 'Radiology' },
        { name: 'Laboratory', code: 'Laboratory' },
        { name: 'Pharmacy', code: 'Pharmacy' },
        { name: 'Administration', code: 'Administration' },
        { name: 'IT', code: 'IT' },
        { name: 'Maintenance', code: 'Maintenance' }
    ],
    paymentMethods: getPaymentOptions(),
    statusOptions: [
        { name: 'Pending', code: 'Pending' },
        { name: 'Approved', code: 'Approved' },
        { name: 'Paid', code: 'Paid' },
        { name: 'Rejected', code: 'Rejected' },
        { name: 'Cancelled', code: 'Cancelled' }
    ],
    priorityOptions: [
        { name: 'Low', code: 'Low' },
        { name: 'Medium', code: 'Medium' },
        { name: 'High', code: 'High' },
        { name: 'Critical', code: 'Critical' }
    ],
    currencies: [
        { name: 'USD', code: 'USD' },
        { name: 'EUR', code: 'EUR' },
        { name: 'GHS', code: 'GHS' }
    ],
    showExpenditureDialog: false,
    showItemDialog: false,
    showAttachmentDialog: false,
    crudType: CRUDTYPE.save,
    loading: false,
    selectedExpenditure: null,
    editingItemIndex: null,
    newItem: { ...INITIAL_ITEM },
    filterCriteria: {
        category: '',
        status: '',
        department: '',
        dateFrom: null,
        dateTo: null,
        amountFrom: null,
        amountTo: null
    },
    selectedCategory: defaultSelected(),
    selectedDepartment: defaultSelected(),
    selectedPaymentMethod: defaultSelected(),
    selectedSubCategory: defaultSelected()
};

const ExpenditurePage = () => {
    const [state, setState] = useState<ExpenditureState>(INITIAL_STATE);

    const toast = useRef<Toast>(null);
    const fileUploadRef = useRef<FileUpload>(null);
    const { user } = useUserData();

    useEffect(() => {
        loadExpenditures();
        loadSubCategories();
    }, []);
    useEffect(() => {
        calculateTotals();
    }, [state.expenditure.items]);
    const setStateValue = (updates: Partial<ExpenditureState>) => {
        setState((prev) => ({ ...prev, ...updates }));
    };

    const loadExpenditures = async () => {
        setStateValue({ loading: true });
        try {
            // Mock data - replace with actual API call
            const expenseList = await Expenditure.getExpenses();
            setStateValue({
                expendituresList: expenseList.operatedData.map((expense) => modifiedExpenditure(expense)),
                loading: false
            });
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to load expenditures',
                life: 3000
            });
            setStateValue({ loading: false });
        }
    };
    const modifiedExpenditure = (expense: HospitalExpenditure) => {
        const vendor = typeof expense.vendor === 'string' ? JSON.parse(expense.vendor) : expense.vendor;
        return {
            ...expense,
            paymentDate: changeDateFormat(new Date(expense.paymentDate)),
            expenseDate: changeDateFormat(new Date(expense.expenseDate)),
            vendor: vendor,
            items: typeof expense.items === 'string' ? JSON.parse(expense.items) : expense.items
        };
    };
    const loadSubCategories = () => {
        // Mock subcategories - in real app, this would be based on selected category
        const subCategories = [
            { name: 'Diagnostic Equipment', code: 'Diagnostic Equipment' },
            { name: 'Surgical Instruments', code: 'Surgical Instruments' },
            { name: 'Emergency Drugs', code: 'Emergency Drugs' },
            { name: 'General Medicines', code: 'General Medicines' },
            { name: 'Office Supplies', code: 'Office Supplies' },
            { name: 'Cleaning Supplies', code: 'Cleaning Supplies' }
        ];
        setStateValue({ subCategories });
    };

    const calculateTotals = () => {
        const subtotal = state.expenditure.items.reduce((sum, item) => sum + item.totalPrice, 0);
        const total = subtotal + (state.expenditure.taxAmount || 0) - (state.expenditure.discountAmount || 0);
        setStateValue({
            expenditure: {
                ...state.expenditure,
                totalAmount: total
            }
        });
    };

    const addExpenseItem = () => {
        if (state.editingItemIndex !== null) {
            // Update existing item
            const updatedItems = [...state.expenditure.items];
            updatedItems[state.editingItemIndex] = {
                ...state.newItem,
                totalPrice: state.newItem.quantity * state.newItem.unitPrice
            };
            setStateValue({
                expenditure: { ...state.expenditure, items: updatedItems },
                newItem: { ...INITIAL_ITEM },
                editingItemIndex: null,
                showItemDialog: false
            });
        } else {
            // Add new item
            const newItem = {
                ...state.newItem,
                itemId: Date.now(),
                totalPrice: state.newItem.quantity * state.newItem.unitPrice
            };

            setStateValue({
                expenditure: {
                    ...state.expenditure,
                    items: [...state.expenditure.items, newItem]
                },
                newItem: { ...INITIAL_ITEM },
                showItemDialog: false
            });
        }
    };

    const editExpenseItem = (index: number) => {
        setStateValue({
            newItem: { ...state.expenditure.items[index] },
            editingItemIndex: index,
            showItemDialog: true
        });
    };

    const removeExpenseItem = (index: number) => {
        confirmDialog({
            message: 'Are you sure you want to remove this item?',
            header: 'Confirm Removal',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const updatedItems = state.expenditure.items.filter((_, i) => i !== index);
                setStateValue({
                    expenditure: { ...state.expenditure, items: updatedItems }
                });
            }
        });
    };

    const saveExpenditure = async () => {
        if (!pageDataValidation(validateExpenditure, state.expenditure, toast as any)) return;

        setStateValue({ loading: true });

        try {
            const response = await Expenditure.createExpenses(
                {
                    ...state.expenditure,
                    category: state.selectedCategory.name,
                    userId: user.userId
                },
                state.crudType
            );

            if (response.status === 200 && response.operatedData !== undefined) {
                if (state.crudType === CRUDTYPE.save) {
                    setStateValue({
                        expendituresList: [...state.expendituresList, modifiedExpenditure(response.operatedData)]
                    });
                } else {
                    setStateValue({
                        expendituresList: state.expendituresList.map((exp) => (exp.expenditureId === response.operatedData.expenditureId ? modifiedExpenditure(response.operatedData) : exp))
                    });
                }
                toast.current?.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: `Expenditure ${state.crudType === CRUDTYPE.save ? 'created' : 'updated'} successfully`,
                    life: 3000
                });

                setStateValue({
                    showExpenditureDialog: false,
                    expenditure: { ...INITIAL_EXPENDITURE },
                    crudType: CRUDTYPE.save
                });
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to save expenditure',
                life: 3000
            });
        } finally {
            setStateValue({ loading: false });
        }
    };

    const editExpenditure = (expenditure: HospitalExpenditure) => {
        try {
            setStateValue({
                selectedCategory: state.categories.find((cat) => cat.name === expenditure.category),
                selectedDepartment: state.departments.find((dep) => dep.name === expenditure.department),
                selectedSubCategory: state.subCategories.find((sub) => sub.name === expenditure.subCategory),
                expenditure: {
                    ...expenditure,
                    expenseDate: changeDateFormat(new Date(expenditure.expenseDate)),
                    paymentDate: changeDateFormat(new Date(expenditure.paymentDate))
                },
                crudType: CRUDTYPE.update,
                showExpenditureDialog: true
            });
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to save expenditure',
                life: 3000
            });
        }
    };

    const deleteExpenditure = async (expenditureId: number) => {
        confirmDialog({
            message: 'Are you sure you want to delete this expenditure?',
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                const results = await Expenditure.deleteExpenditure(expenditureId);
                if (results.status === 200 && results.operatedData !== undefined) {
                    setStateValue({
                        expendituresList: state.expendituresList.filter((exp) => exp.expenditureId !== expenditureId)
                    });
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Expenditure deleted successfully',
                        life: 3000
                    });
                }
            }
        });
    };

    return (
        <>
            <ExpenditureContext.Provider
                value={{
                    state,
                    setStateValue,
                    deleteExpenditure,
                    editExpenditure,
                    saveExpenditure,
                    rejectExpenditure: () => {},
                    addExpenseItem,
                    removeExpenseItem,
                    editExpenseItem,
                    toast,
                    calculateTotals,
                    INITIAL_EXPENDITURE,
                    INITIAL_ITEM
                }}
            >
                <div className="grid">
                    <div className="col-12">
                        <ExpenditureList />
                    </div>
                    {/* Expenditure Dialog */}
                    {state.showExpenditureDialog === true && (
                        <Dialog
                            visible={state.showExpenditureDialog}
                            style={{ width: '80vw', maxWidth: '1000px' }}
                            header={`${state.crudType === CRUDTYPE.save ? 'Create' : 'Edit'} Expenditure`}
                            className="p-fluid"
                            onHide={() => setStateValue({ showExpenditureDialog: false })}
                        >
                            <NewExpenditure />
                            <div className="flex justify-content-end gap-2 mt-4">
                                <Button label="Cancel" icon="pi pi-times" outlined onClick={() => setStateValue({ showExpenditureDialog: false })} />
                                <Button label={state.crudType === CRUDTYPE.save ? 'Create' : 'Update'} icon="pi pi-check" loading={state.loading} onClick={saveExpenditure} />
                            </div>
                        </Dialog>
                    )}

                    {/* Item Dialog */}
                    <Dialog visible={state.showItemDialog} style={{ width: '500px' }} header={`${state.editingItemIndex !== null ? 'Edit' : 'Add'} Item`} modal className="p-fluid" onHide={() => setStateValue({ showItemDialog: false })}>
                        <NewExpenseItem />
                        <div className="flex justify-content-end gap-2">
                            <Button label="Cancel" icon="pi pi-times" outlined onClick={() => setStateValue({ showItemDialog: false })} />
                            <Button label={state.editingItemIndex !== null ? 'Update' : 'Add'} icon="pi pi-check" onClick={addExpenseItem} disabled={!state.newItem.description || state.newItem.quantity <= 0 || state.newItem.unitPrice <= 0} />
                        </div>
                    </Dialog>
                </div>
            </ExpenditureContext.Provider>
            <Toast ref={toast} />
            <ConfirmDialog />
        </>
    );
};

export default ExpenditurePage;
