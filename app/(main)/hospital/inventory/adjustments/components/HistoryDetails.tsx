import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import React from 'react';
import { useAdjustmentsContext } from '@/libs/contextProviders/AppContexts';

const HistoryDetails = () => {
    const { state, setStateValue } = useAdjustmentsContext();
    return (
        <>
            <Dialog visible={state.showHistoryDialog} header="Adjustment Details" modal onHide={() => setStateValue({ showHistoryDialog: false })} position="top">
                <DataTable value={state.selectedHistoryDetails} emptyMessage="No details found.">
                    <Column field="itemName" header="Item Name" />
                    <Column field="categoryName" header="Category" />
                    <Column field="brandName" header="Brand" />
                    <Column field="previousQuantity" header="Previous Qty" />
                    <Column field="quantityAdjusted" header="Adjusted" />
                    <Column field="newQuantity" header="New Qty" />
                    <Column field="quantityInStock" header="Current Stock" />
                    <Column field="remarks" header="Remarks" />
                </DataTable>
            </Dialog>
        </>
    );
};
export default HistoryDetails;
