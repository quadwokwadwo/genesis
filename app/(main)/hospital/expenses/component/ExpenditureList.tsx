import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import React, { useState } from 'react';
import { useExpenditureContext } from '@/libs/contextProviders/AppContexts';
import { HospitalExpenditure } from '@/types/hospital';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { CRUDTYPE } from '@/types/enums/enums';
import { FilterMatchMode } from 'primereact/api';

const ExpenditureList = () => {
    const { state, setStateValue, editExpenditure, deleteExpenditure, approveExpenditure, rejectExpenditure, markExpenditurePaid, isAdmin, INITIAL_EXPENDITURE } = useExpenditureContext();
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [filters, setFilters] = useState({
        global: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS }
    });

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const _filters: any = { ...filters };
        _filters['global'].value = value;
        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const updateFilter = (patch: Partial<typeof state.filterCriteria>) => {
        setStateValue({
            filterCriteria: { ...state.filterCriteria, ...patch }
        });
    };

    const clearFilters = () => {
        setStateValue({
            filterCriteria: {
                category: '',
                status: '',
                department: '',
                dateFrom: null,
                dateTo: null,
                amountFrom: null,
                amountTo: null
            }
        });
    };

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
                case 'Draft':
                    return 'secondary';
                default:
                    return 'info';
            }
        };
        return <Tag value={rowData.status} severity={getSeverity(rowData.status) as any} />;
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
        const status = rowData.status;
        const canApprove = isAdmin && (status === 'Pending' || status === 'Draft');
        const canReject = isAdmin && (status === 'Pending' || status === 'Draft');
        const canPay = isAdmin && status === 'Approved';
        const canDelete = isAdmin;

        return (
            <div className="flex gap-2 flex-wrap">
                <Button icon="pi pi-eye" rounded outlined severity="info" size="small" tooltip="View Details" />
                <Button icon="pi pi-pencil" rounded outlined severity="warning" size="small" onClick={() => editExpenditure(rowData)} tooltip="Edit" />
                {canApprove && <Button icon="pi pi-check" rounded outlined severity="success" size="small" onClick={() => approveExpenditure(rowData.expenditureId!)} tooltip="Approve" />}
                {canReject && <Button icon="pi pi-times-circle" rounded outlined severity="danger" size="small" onClick={() => rejectExpenditure(rowData.expenditureId!, '')} tooltip="Reject" />}
                {canPay && <Button icon="pi pi-wallet" rounded outlined severity="help" size="small" onClick={() => markExpenditurePaid(rowData.expenditureId!)} tooltip="Mark Paid" />}
                {canDelete && <Button icon="pi pi-trash" rounded outlined severity="danger" size="small" onClick={() => deleteExpenditure(rowData.expenditureId!)} tooltip="Delete" />}
            </div>
        );
    };

    const renderFilterBar = () => {
        return (
            <div className="grid formgrid p-fluid mb-3">
                <div className="field col-12 md:col-3">
                    <label>Date From</label>
                    <Calendar value={state.filterCriteria.dateFrom ?? undefined} onChange={(e) => updateFilter({ dateFrom: (e.value as Date) ?? null })} showIcon dateFormat="yy-mm-dd" />
                </div>
                <div className="field col-12 md:col-3">
                    <label>Date To</label>
                    <Calendar value={state.filterCriteria.dateTo ?? undefined} onChange={(e) => updateFilter({ dateTo: (e.value as Date) ?? null })} showIcon dateFormat="yy-mm-dd" />
                </div>
                <div className="field col-12 md:col-3">
                    <label>Category</label>
                    <Dropdown value={state.filterCriteria.category} options={state.categories} optionLabel="name" optionValue="code" onChange={(e) => updateFilter({ category: e.value ?? '' })} placeholder="All" showClear />
                </div>
                <div className="field col-12 md:col-3">
                    <label>Status</label>
                    <Dropdown value={state.filterCriteria.status} options={state.statusOptions} optionLabel="name" optionValue="code" onChange={(e) => updateFilter({ status: e.value ?? '' })} placeholder="All" showClear />
                </div>
                <div className="col-12 flex justify-content-end">
                    <Button label="Clear Filters" icon="pi pi-filter-slash" outlined size="small" onClick={clearFilters} />
                </div>
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

    const filteredList = state.expendituresList.filter((row) => {
        const fc = state.filterCriteria;
        if (fc.category && row.category !== fc.category) return false;
        if (fc.status && row.status !== fc.status) return false;
        if (fc.dateFrom && row.expenseDate && new Date(row.expenseDate) < new Date(fc.dateFrom)) return false;
        if (fc.dateTo && row.expenseDate && new Date(row.expenseDate) > new Date(fc.dateTo)) return false;
        return true;
    });

    return (
        <Card>
            {renderFilterBar()}
            <DataTable
                value={filteredList}
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
                <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '260px' }} />
            </DataTable>
        </Card>
    );
};
export default ExpenditureList;
