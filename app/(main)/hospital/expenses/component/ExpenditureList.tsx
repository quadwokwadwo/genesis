import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import React, { useState } from 'react';
import { useExpenditureContext } from '@/libs/contextProviders/AppContexts';
import { HospitalExpenditure } from '@/types/hospital';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { CRUDTYPE } from '@/types/enums/enums';
import { FilterMatchMode } from 'primereact/api';

const ExpenditureList = () => {
    const { state, setStateValue, editExpenditure, deleteExpenditure, INITIAL_EXPENDITURE } = useExpenditureContext();
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    });
    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let _filters = { ...filters };
        _filters['global'].value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };
    // Template functions
    const statusBodyTemplate = (rowData: HospitalExpenditure) => {
        const getSeverity = (status: string) => {
            switch (status) {
                case 'Paid':
                    return 'success';
                case 'Approved':
                    return 'info';
                case 'Pending':
                    return 'warning';
                case 'Rejected':
                case 'Cancelled':
                    return 'danger';
                default:
                    return 'info';
            }
        };
        return <Tag value={rowData.status} severity={getSeverity(rowData.status)} />;
    };

    const priorityBodyTemplate = (rowData: HospitalExpenditure) => {
        const getSeverity = (priority: string) => {
            switch (priority) {
                case 'Critical':
                    return 'danger';
                case 'High':
                    return 'warning';
                case 'Medium':
                    return 'info';
                case 'Low':
                    return 'success';
                default:
                    return 'info';
            }
        };
        return <Tag value={rowData.priority} severity={getSeverity(rowData.priority)} />;
    };

    const amountBodyTemplate = (rowData: HospitalExpenditure) => {
        return `${rowData.totalAmount.toLocaleString()}`;
    };

    const dateBodyTemplate = (rowData: HospitalExpenditure) => {
        return rowData.expenseDate ? new Date(rowData.expenseDate).toLocaleDateString() : '';
    };

    const actionBodyTemplate = (rowData: HospitalExpenditure) => {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-eye" rounded outlined severity="info" size="small" tooltip="View Details" />
                <Button icon="pi pi-pencil" rounded outlined severity="warning" size="small" onClick={() => editExpenditure(rowData)} tooltip="Edit" />
                <Button icon="pi pi-trash" rounded outlined severity="danger" size="small" onClick={() => deleteExpenditure(rowData.expenditureId!)} tooltip="Delete" />
            </div>
        );
    };

    const renderHeader = () => {
        return (
            <div className="flex justify-content-between align-items-center">
                <h4 className="m-0">Hospital Expenditures</h4>
                <div className="flex gap-2">
                    <span className="p-input-icon-left">
                        <i className="pi pi-search" />
                        <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Search expenditures..." />
                    </span>
                    <Button
                        label="New Expenditure"
                        icon="pi pi-plus"
                        onClick={() =>
                            setStateValue({
                                showExpenditureDialog: true,
                                expenditure: { ...INITIAL_EXPENDITURE },
                                crudType: CRUDTYPE.save
                            })
                        }
                    />
                </div>
            </div>
        );
    };
    return (
        <Card>
            <DataTable
                value={state.expendituresList}
                loading={state.loading}
                paginator
                rows={10}
                filters={filters}
                globalFilterFields={['description', 'vendor', 'category', 'departmentName']}
                header={renderHeader()}
                emptyMessage="No expenditures found."
                className="p-datatable-striped"
            >
                <Column field="expenseDate" header="Date" body={dateBodyTemplate} sortable />
                <Column field="description" header="Description" sortable />
                <Column field="category" header="Category" sortable />
                <Column field="vendorName" header="Vendor" sortable />
                <Column field="department" header="Department" sortable />
                <Column field="totalAmount" header="Amount" body={amountBodyTemplate} sortable />
                <Column field="status" header="Status" body={statusBodyTemplate} sortable />
                <Column field="priority" header="Priority" body={priorityBodyTemplate} sortable />
                <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '200px' }} />
            </DataTable>
        </Card>
    );
};
export default ExpenditureList;
