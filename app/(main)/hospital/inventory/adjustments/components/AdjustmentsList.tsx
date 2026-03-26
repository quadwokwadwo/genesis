import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import React from 'react';
import { useAdjustmentsContext } from '@/libs/contextProviders/AppContexts';
import { TAdjustmentHistory } from '@/types/hospital';
import { Tag } from 'primereact/tag';
import { format } from 'date-fns';
import { Button } from 'primereact/button';

const AdjustmentsList = () => {
    const { state, setStateValue, toast } = useAdjustmentsContext();
    const adjustmentTypeTemplate = (rowData: TAdjustmentHistory) => <Tag value={rowData.adjustmentType} severity={rowData.adjustmentType === 'IN' ? 'success' : 'danger'} />;

    const totalAdjustmentTemplate = (rowData: TAdjustmentHistory) => {
        const isPositive = rowData.totalAdjustment > 0;
        return (
            <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
                {isPositive ? '+' : ''}
                {rowData.totalAdjustment}
            </span>
        );
    };
    const viewAdjustmentDetails = async (adjustmentId: number) => {
        try {
            setStateValue({ loading: true });
            const response = state.adjustmentHistory.find((adj) => adj.adjustmentId === adjustmentId);
            const historyDetails = JSON.parse(response.adjustmentItems as string);
            setStateValue({ showHistoryDialog: true, selectedHistoryDetails: historyDetails });
        } catch (error) {
            console.error('Error fetching adjustment details:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to load adjustment details'
            });
        } finally {
            setStateValue({ loading: false });
        }
    };

    const dateTemplate = (rowData: TAdjustmentHistory) => <span>{format(new Date(rowData.adjustmentDate), 'MMM dd, yyyy HH:mm')}</span>;

    const actionsTemplate = (rowData: TAdjustmentHistory) => <Button icon="pi pi-eye" className="p-button-text" onClick={() => viewAdjustmentDetails(rowData.adjustmentId)} tooltip="View Details" />;

    return (
        <>
            <DataTable
                value={state.adjustmentHistory}
                dataKey="adjustmentId"
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25]}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} adjustments"
                emptyMessage="No adjustments found."
                loading={state.loading}
            >
                <Column field="adjustmentDate" header="Date" body={dateTemplate} sortable />
                <Column field="adjustmentType" header="Type" body={adjustmentTypeTemplate} sortable />
                <Column field="reason" header="Reason" sortable />
                <Column field="performedBy" header="Performed By" sortable />
                <Column field="itemCount" header="Items" sortable />
                <Column field="totalAdjustment" header="Total Adjustment" body={totalAdjustmentTemplate} sortable />
                <Column body={actionsTemplate} exportable={false} style={{ width: '8rem' }} />
            </DataTable>
        </>
    );
};
export default AdjustmentsList;
