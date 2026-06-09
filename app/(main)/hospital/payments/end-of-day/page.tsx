'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card } from 'primereact/card';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { useReactToPrint } from 'react-to-print';
import useUserData from '@/libs/hooks/useUserData';
import Payments, { DailyReportResponse, DailyReportRow } from '@/libs/blue_prints/Payments';
import UsersModel from '@/libs/blue_prints/UsersModel';
import { User } from '@/types/hospital/hospital';

const usersModel = new UsersModel();

const formatDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const currency = (n: any) => `$${Number(n ?? 0).toFixed(2)}`;

const EndOfDayPage: React.FC = () => {
    const toast = useRef<Toast>(null);
    const printRef = useRef<HTMLDivElement>(null);
    const { user } = useUserData<{ userId: number; role: string; username: string }>();
    const isAdmin = user?.role === 'admin';

    const [date, setDate] = useState<Date>(new Date());
    const [cashierId, setCashierId] = useState<number | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState<DailyReportResponse | null>(null);

    const loadUsers = useCallback(async () => {
        if (!isAdmin) return;
        try {
            const resp = await usersModel.getUserList();
            if (resp.status === 200 && Array.isArray(resp.operatedData)) {
                setUsers(resp.operatedData as User[]);
            }
        } catch (err) {
            // non-fatal
            console.error('Failed to load users', err);
        }
    }, [isAdmin]);

    const fetchReport = useCallback(
        async (selectedDate: Date, selectedCashier: number | null) => {
            try {
                setLoading(true);
                const opts: { date?: string; cashierId?: number } = { date: formatDate(selectedDate) };
                if (selectedCashier) opts.cashierId = selectedCashier;
                const resp = await Payments.getDailyReport(opts);
                if (resp.status === 200 && resp.operatedData) {
                    setReport(resp.operatedData);
                } else {
                    toast.current?.show({ severity: 'warn', summary: 'Daily Report', detail: resp.message || 'No data', life: 3000 });
                    setReport(null);
                }
            } catch (err: any) {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: err?.response?.data?.message || err?.message || 'Failed to load report', life: 4000 });
            } finally {
                setLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    useEffect(() => {
        fetchReport(date, cashierId);
    }, [date, cashierId, fetchReport]);

    const handlePrint = useReactToPrint({ contentRef: printRef, documentTitle: `EOD-${formatDate(date)}` });

    const cashierOptions = useMemo(
        () => [{ label: 'All cashiers', value: null as number | null }, ...users.map((u) => ({ label: u.username || `User #${u.userId}`, value: u.userId }))],
        [users]
    );

    const grandTotal = useMemo(() => (report?.totalsByMethod ?? []).reduce((sum, r) => sum + Number(r.total ?? 0), 0), [report]);
    const receiptCount = report?.receipts?.length ?? 0;

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12">
                <Card title="End of Day Reconciliation">
                    <div className="grid align-items-end">
                        <div className="col-12 md:col-4">
                            <label htmlFor="eod-date" className="block font-medium mb-2">
                                Date
                            </label>
                            <Calendar id="eod-date" value={date} onChange={(e) => e.value && setDate(e.value as Date)} dateFormat="yy-mm-dd" showIcon className="w-full" maxDate={new Date()} />
                        </div>
                        {isAdmin && (
                            <div className="col-12 md:col-4">
                                <label htmlFor="eod-cashier" className="block font-medium mb-2">
                                    Cashier
                                </label>
                                <Dropdown id="eod-cashier" value={cashierId} options={cashierOptions} onChange={(e) => setCashierId(e.value)} placeholder="All cashiers" className="w-full" showClear />
                            </div>
                        )}
                        <div className="col-12 md:col-4 flex gap-2 justify-content-end">
                            <Button label="Refresh" icon="pi pi-refresh" outlined loading={loading} onClick={() => fetchReport(date, cashierId)} />
                            <Button label="Print" icon="pi pi-print" onClick={() => handlePrint()} disabled={!report} />
                        </div>
                    </div>
                </Card>
            </div>

            <div ref={printRef} className="col-12">
                <div className="grid">
                    <div className="col-12 md:col-4">
                        <Card title="Summary">
                            <div className="flex flex-column gap-2">
                                <div className="flex justify-content-between">
                                    <span className="text-color-secondary">Date</span>
                                    <span className="font-semibold">{report?.date || formatDate(date)}</span>
                                </div>
                                <div className="flex justify-content-between">
                                    <span className="text-color-secondary">Receipts</span>
                                    <span className="font-semibold">{receiptCount}</span>
                                </div>
                                <div className="flex justify-content-between">
                                    <span className="text-color-secondary">Grand Total</span>
                                    <span className="font-bold text-green-600">{currency(grandTotal)}</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                    <div className="col-12 md:col-4">
                        <Card title="By Payment Method">
                            <DataTable value={report?.totalsByMethod ?? []} className="p-datatable-sm" emptyMessage="No payments" loading={loading}>
                                <Column field="method" header="Method" />
                                <Column field="count" header="Count" />
                                <Column field="total" header="Total" body={(row: DailyReportRow) => currency(row.total)} />
                            </DataTable>
                        </Card>
                    </div>
                    <div className="col-12 md:col-4">
                        <Card title="By Cashier">
                            <DataTable value={report?.totalsByCashier ?? []} className="p-datatable-sm" emptyMessage="No payments" loading={loading}>
                                <Column field="cashierName" header="Cashier" />
                                <Column field="count" header="Count" />
                                <Column field="total" header="Total" body={(row: DailyReportRow) => currency(row.total)} />
                            </DataTable>
                        </Card>
                    </div>
                    <div className="col-12">
                        <Card title="By Hour">
                            <DataTable value={report?.totalsByHour ?? []} className="p-datatable-sm" emptyMessage="No payments" loading={loading}>
                                <Column field="hour" header="Hour" body={(row: DailyReportRow) => `${String(row.hour ?? 0).padStart(2, '0')}:00`} />
                                <Column field="count" header="Count" />
                                <Column field="total" header="Total" body={(row: DailyReportRow) => currency(row.total)} />
                            </DataTable>
                        </Card>
                    </div>
                    <div className="col-12">
                        <Card title="Receipts">
                            <DataTable value={report?.receipts ?? []} paginator rows={20} className="p-datatable-sm" emptyMessage="No receipts" loading={loading}>
                                <Column field="paymentId" header="ID" />
                                <Column field="receiptNumber" header="Receipt #" />
                                <Column field="patientId" header="Patient ID" />
                                <Column field="paymentMethod" header="Method" />
                                <Column field="amountPaid" header="Amount" body={(row: any) => currency(row.amountPaid)} />
                                <Column field="paymentStatus" header="Status" />
                                <Column field="username" header="Cashier" />
                                <Column field="dateCreated" header="When" body={(row: any) => new Date(row.dateCreated).toLocaleString()} />
                            </DataTable>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EndOfDayPage;
