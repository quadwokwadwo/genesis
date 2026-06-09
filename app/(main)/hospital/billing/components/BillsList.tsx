'use client';
import React, { useEffect, useRef, useState } from 'react';
import { DataTable, DataTablePageEvent, DataTableSortEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Tag } from 'primereact/tag';
import BillService from '@/libs/blue_prints/BillService';
import useUserData from '@/libs/hooks/useUserData';
import { TBilling, TBillingSnapshotItem, User } from '@/types/hospital';
import { formatCurrency, changeDateFormat, pageDataValidation } from '@/libs/utils';
import { validateVoidBill } from '@/libs/joiValidations';

const STATUS_OPTIONS = [
    { label: 'All', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Partial', value: 'PARTIAL' },
    { label: 'Paid', value: 'PAID' },
    { label: 'Voided', value: 'VOIDED' }
];

const statusSeverity = (s?: string): 'success' | 'info' | 'warning' | 'danger' => {
    switch (s) {
        case 'PAID':
            return 'success';
        case 'PARTIAL':
            return 'warning';
        case 'VOIDED':
            return 'danger';
        default:
            return 'info';
    }
};

type Filters = {
    patientId?: string;
    dateFrom: Date | null;
    dateTo: Date | null;
    status: string;
};

const BillsList: React.FC = () => {
    const toast = useRef(null);
    const { user } = useUserData<User>();
    const role = (user as any)?.role as string | undefined;
    const isAdmin = role === 'admin';

    const [rows, setRows] = useState<TBilling[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [sortBy, setSortBy] = useState('dateCreated');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState<Filters>({ dateFrom: null, dateTo: null, status: 'ALL' });

    const [viewDialog, setViewDialog] = useState(false);
    const [selected, setSelected] = useState<TBilling | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const [voidDialog, setVoidDialog] = useState(false);
    const [voidReason, setVoidReason] = useState('');
    const [voiding, setVoiding] = useState(false);

    const load = async () => {
        try {
            setLoading(true);
            const res = await BillService.getBillsList({
                page,
                pageSize,
                sortBy,
                sortDir,
                patientId: filters.patientId ? Number(filters.patientId) : undefined,
                dateFrom: filters.dateFrom ? changeDateFormat(filters.dateFrom) : undefined,
                dateTo: filters.dateTo ? changeDateFormat(filters.dateTo) : undefined,
                status: filters.status && filters.status !== 'ALL' ? filters.status : undefined
            });
            setRows(res.operatedData.rows || []);
            setTotal(res.operatedData.total || 0);
        } catch (e: any) {
            toast.current?.show({ severity: 'error', summary: 'Failed to load bills', detail: e?.message ?? '' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, pageSize, sortBy, sortDir]);

    const onPage = (e: DataTablePageEvent) => {
        setPage((e.page ?? 0) + 1);
        setPageSize(e.rows);
    };
    const onSort = (e: DataTableSortEvent) => {
        if (e.sortField) {
            setSortBy(e.sortField);
            setSortDir(e.sortOrder === 1 ? 'asc' : 'desc');
        }
    };

    const openView = async (row: TBilling) => {
        setSelected(row);
        setViewDialog(true);
        try {
            setDetailLoading(true);
            const res = await BillService.getBillById(row.billingId);
            if (res.operatedData) setSelected(res.operatedData);
        } catch (e: any) {
            toast.current?.show({ severity: 'error', summary: 'Failed to load bill', detail: e?.message ?? '' });
        } finally {
            setDetailLoading(false);
        }
    };

    const openVoid = (row: TBilling) => {
        setSelected(row);
        setVoidReason('');
        setVoidDialog(true);
    };

    const submitVoid = async () => {
        if (!selected) return;
        const ok = pageDataValidation(validateVoidBill, { reason: voidReason }, toast);
        if (!ok) return;
        try {
            setVoiding(true);
            const res = await BillService.voidBill(selected.billingId, voidReason);
            if ((res.body as any)?.status === 'ok') {
                toast.current?.show({ severity: 'success', summary: 'Bill voided' });
                setVoidDialog(false);
                load();
            } else {
                toast.current?.show({ severity: 'error', summary: 'Void failed', detail: (res.body as any)?.message ?? '' });
            }
        } catch (e: any) {
            toast.current?.show({ severity: 'error', summary: 'Void failed', detail: e?.response?.data?.message ?? e?.message ?? '' });
        } finally {
            setVoiding(false);
        }
    };

    const actionBody = (row: TBilling) => (
        <div className="flex gap-2">
            <Button icon="pi pi-eye" size="small" text onClick={() => openView(row)} tooltip="View" />
            {isAdmin && row.isVoided !== 1 && <Button icon="pi pi-ban" size="small" severity="danger" text onClick={() => openVoid(row)} tooltip="Void" />}
        </div>
    );

    const statusBody = (row: TBilling) => <Tag value={row.status} severity={statusSeverity(row.status)} />;

    const items: TBillingSnapshotItem[] = (selected?.items ?? selected?.billingItems ?? []) as TBillingSnapshotItem[];

    return (
        <div>
            <Toast ref={toast} />
            <div className="grid p-fluid mb-3">
                <div className="col-12 md:col-3">
                    <label>Patient ID</label>
                    <InputText value={filters.patientId ?? ''} onChange={(e) => setFilters({ ...filters, patientId: e.target.value })} placeholder="Patient ID" />
                </div>
                <div className="col-12 md:col-3">
                    <label>From</label>
                    <Calendar value={filters.dateFrom} onChange={(e) => setFilters({ ...filters, dateFrom: (e.value as Date) ?? null })} showIcon dateFormat="yy-mm-dd" />
                </div>
                <div className="col-12 md:col-3">
                    <label>To</label>
                    <Calendar value={filters.dateTo} onChange={(e) => setFilters({ ...filters, dateTo: (e.value as Date) ?? null })} showIcon dateFormat="yy-mm-dd" />
                </div>
                <div className="col-12 md:col-2">
                    <label>Status</label>
                    <Dropdown value={filters.status} options={STATUS_OPTIONS} onChange={(e) => setFilters({ ...filters, status: e.value })} />
                </div>
                <div className="col-12 md:col-1 flex align-items-end">
                    <Button label="Apply" icon="pi pi-filter" onClick={() => (page === 1 ? load() : setPage(1))} />
                </div>
            </div>

            <DataTable
                value={rows}
                lazy
                paginator
                rows={pageSize}
                totalRecords={total}
                first={(page - 1) * pageSize}
                onPage={onPage}
                onSort={onSort}
                sortField={sortBy}
                sortOrder={sortDir === 'asc' ? 1 : -1}
                loading={loading}
                dataKey="billingId"
                rowsPerPageOptions={[10, 20, 50, 100]}
                emptyMessage="No bills found"
            >
                <Column field="billingId" header="ID" sortable />
                <Column field="patientName" header="Patient" />
                <Column field="visitId" header="Visit" />
                <Column field="dateCreated" header="Date" sortable body={(r: TBilling) => changeDateFormat(r.dateCreated as any)} />
                <Column field="total" header="Total" sortable body={(r: TBilling) => formatCurrency(Number(r.total))} />
                <Column field="amountPaid" header="Paid" sortable body={(r: TBilling) => formatCurrency(Number(r.amountPaid))} />
                <Column field="balance" header="Balance" sortable body={(r: TBilling) => formatCurrency(Number(r.balance))} />
                <Column field="status" header="Status" body={statusBody} />
                <Column header="Actions" body={actionBody} />
            </DataTable>

            <Dialog header={`Bill #${selected?.billingId ?? ''}`} visible={viewDialog} onHide={() => setViewDialog(false)} className="lg:w-8 w-full">
                {detailLoading ? (
                    <div className="p-3">Loading…</div>
                ) : selected ? (
                    <div>
                        <div className="grid">
                            <div className="col-6">
                                <div><strong>Patient:</strong> {selected.patientName ?? selected.patientId}</div>
                                <div><strong>Visit:</strong> {selected.visitId}</div>
                                <div><strong>Date:</strong> {changeDateFormat(selected.dateCreated as any)}</div>
                            </div>
                            <div className="col-6">
                                <div><strong>Status:</strong> <Tag value={selected.status} severity={statusSeverity(selected.status)} /></div>
                                <div><strong>Payment:</strong> {selected.paymentMethod}</div>
                                {selected.isVoided === 1 && (
                                    <>
                                        <div><strong>Voided By:</strong> {selected.voidedByName ?? selected.voidedBy}</div>
                                        <div><strong>Voided At:</strong> {selected.voidedAt ? changeDateFormat(selected.voidedAt as any) : ''}</div>
                                        <div><strong>Reason:</strong> {selected.voidReason}</div>
                                    </>
                                )}
                            </div>
                        </div>
                        <h5 className="mt-3">Items (snapshot)</h5>
                        <DataTable value={items} emptyMessage="No items">
                            <Column header="Item" body={(it: TBillingSnapshotItem) => it.itemName ?? it.description ?? ''} />
                            <Column header="Category" field="category" />
                            <Column header="Qty" body={(it: TBillingSnapshotItem) => it.qty ?? it.quantity ?? ''} />
                            <Column header="Unit Price" body={(it: TBillingSnapshotItem) => formatCurrency(Number(it.unitPrice ?? 0))} />
                            <Column header="Line Total" body={(it: TBillingSnapshotItem) => formatCurrency(Number(it.lineTotal ?? it.total ?? 0))} />
                        </DataTable>
                        <div className="grid mt-3">
                            <div className="col-6 col-offset-6">
                                <div className="flex justify-content-between"><span>Subtotal</span><span>{formatCurrency(Number(selected.subtotal))}</span></div>
                                <div className="flex justify-content-between"><span>Tax</span><span>{formatCurrency(Number(selected.tax))}</span></div>
                                <div className="flex justify-content-between"><span>Discount</span><span>{formatCurrency(Number(selected.discount))}</span></div>
                                <div className="flex justify-content-between"><strong>Total</strong><strong>{formatCurrency(Number(selected.total))}</strong></div>
                                <div className="flex justify-content-between"><span>Paid</span><span>{formatCurrency(Number(selected.amountPaid))}</span></div>
                                <div className="flex justify-content-between"><strong>Balance</strong><strong>{formatCurrency(Number(selected.balance))}</strong></div>
                            </div>
                        </div>
                    </div>
                ) : null}
            </Dialog>

            <Dialog header={`Void Bill #${selected?.billingId ?? ''}`} visible={voidDialog} onHide={() => setVoidDialog(false)} className="md:w-6 w-full">
                <div className="p-fluid">
                    <label>Reason (min 10 chars)</label>
                    <InputTextarea rows={4} value={voidReason} onChange={(e) => setVoidReason(e.target.value)} />
                    <div className="flex justify-content-end gap-2 mt-3">
                        <Button label="Cancel" severity="secondary" onClick={() => setVoidDialog(false)} />
                        <Button label="Void Bill" icon="pi pi-ban" severity="danger" loading={voiding} onClick={submitVoid} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default BillsList;
