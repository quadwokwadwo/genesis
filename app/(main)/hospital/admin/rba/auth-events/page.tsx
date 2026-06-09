'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import RbaService from '@/libs/blue_prints/RbaService';
import { RbaAuthEvent } from '@/types/rba/rba';

const SEVERITY: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
    LOGIN_SUCCESS: 'success',
    TOKEN_REFRESH: 'info',
    LOGOUT: 'info',
    LOGIN_FAILURE: 'danger',
    PERMISSION_DENIED: 'warning',
    PASSWORD_RESET: 'warning'
};

const AuthEventsPage = () => {
    const [events, setEvents] = useState<RbaAuthEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const toast = useRef<Toast>(null);

    const fetchEvents = async () => {
        setLoading(true);
        const r = await RbaService.listAuthEvents(200);
        setEvents(Array.isArray(r.operatedData) ? r.operatedData : []);
        setLoading(false);
    };

    useEffect(() => {
        document.title = 'RBA · Auth Events';
        void fetchEvents();
    }, []);

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12">
                <Card
                    title="Authentication Events"
                    subTitle="Latest 200 events recorded by the RBA module."
                    pt={{
                        title: { className: 'flex justify-content-between align-items-center' }
                    }}
                >
                    <div className="flex justify-content-end mb-3">
                        <Button label="Refresh" icon="pi pi-refresh" outlined onClick={fetchEvents} />
                    </div>
                    <DataTable value={events} loading={loading} paginator rows={20} dataKey="eventId" stripedRows responsiveLayout="scroll" sortField="occurredAt" sortOrder={-1}>
                        <Column field="occurredAt" header="When" sortable />
                        <Column field="username" header="User" />
                        <Column
                            field="eventType"
                            header="Type"
                            body={(r: RbaAuthEvent) => <Tag severity={SEVERITY[r.eventType] ?? 'info'} value={r.eventType} />}
                            sortable
                        />
                        <Column field="ipAddress" header="IP" />
                        <Column field="userAgent" header="User Agent" body={(r: RbaAuthEvent) => <span title={r.userAgent ?? ''}>{(r.userAgent ?? '').slice(0, 40)}</span>} />
                        <Column field="details" header="Details" />
                    </DataTable>
                </Card>
            </div>
        </div>
    );
};

export default AuthEventsPage;
