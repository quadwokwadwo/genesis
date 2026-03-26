import React, { useState } from 'react';
import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FilterMatchMode } from 'primereact/api';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { formattedDateStringWithAt } from '@/libs/utils';

interface ColumnDefinition {
    field?: string;
    header: string;
    body?: (rowData: any) => JSX.Element;
    sortable?: boolean;
}

interface SimpleTableWithMenuProps {
    tableKey: string;
    columnsDef: ColumnDefinition[];
    tableData: any[] | undefined;
    showTableLines?: boolean;
    tableMinWidth?: number;
    tableTitle?: string;
    lastTableUpdate?: number;
    numberOfRows?: number;
    searchValues?: string[];
    searchFieldPlaceHolder?: string;
    pageRows?: number[];
    loadingStatus?:boolean
}

const SimpleTable = ({
    tableKey,
    columnsDef,
    tableData,
    showTableLines = true,
    tableMinWidth = 80,
    tableTitle = 'Table Data',
    numberOfRows = 10,
    pageRows = [10, 25, 50],
    lastTableUpdate,
    searchFieldPlaceHolder = '',
    searchValues = [],
    loadingStatus
}: SimpleTableWithMenuProps) => {
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [filters, setFilters] = useState<DataTableFilterMeta>({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    });

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let _filters = { ...filters };

        // @ts-ignore
        _filters['global'].value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };
    const renderHeader = () => {
        return (
            <div className="flex justify-content-end">
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder={searchFieldPlaceHolder} autoComplete="off" />
                </span>
            </div>
        );
    };
    return (
        <React.Fragment>
            <Card className="shadow-2">
                <DataTable
                    id={'simpleTable'}
                    style={{ zIndex: 10 }}
                    value={tableData}
                    paginator
                    paginatorTemplate={'RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink'}
                    rows={numberOfRows}
                    scrollable
                    showGridlines={showTableLines}
                    dataKey={tableKey}
                    rowsPerPageOptions={pageRows}
                    tableStyle={{ minWidth: `${tableMinWidth}rem` }}
                    stripedRows
                    header={renderHeader()}
                    globalFilterFields={searchValues}
                    filters={filters}
                    currentPageReportTemplate="{first} to {last} of {totalRecords} Records"
                    loading={loadingStatus}
                >
                    {columnsDef.length > 0 && columnsDef.map((columnDef, index) => <Column key={index} field={columnDef.field} header={columnDef.header} body={columnDef.body} sortable={columnDef.sortable}/>)}
                </DataTable>
                {lastTableUpdate && <span className="smal">{`${formattedDateStringWithAt(new Date(lastTableUpdate!))}`}</span>}
                {/*<Tag value={`${new Date(lastTableUpdate!)}`} severity="success" className="mt-3" icon="pi pi-refresh"/>*/}
            </Card>
        </React.Fragment>
    );
};

export default React.memo(SimpleTable);
