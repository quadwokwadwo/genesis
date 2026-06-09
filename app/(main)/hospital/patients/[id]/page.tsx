'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TabView, TabPanel, TabViewTabChangeEvent } from 'primereact/tabview';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import PatientsModel from '@/libs/blue_prints/Patients';
import { TPatient, TPatientVisitRecord } from '@/types/hospital';
import { calcAgeFromDOB, changeDateFormat, formatCurrency } from '@/libs/utils';
import useUserData from '@/libs/hooks/useUserData';
import { USER_ROLES } from '@/types/enums/enums';

const service = new PatientsModel();

type DetailState = {
    loading: boolean;
    patient: TPatient | null;
    partner: any | null;
    visits: TPatientVisitRecord[];
    visitsLoaded: boolean;
    visitsLoading: boolean;
    tabIndex: number;
};

const INITIAL: DetailState = {
    loading: true,
    patient: null,
    partner: null,
    visits: [],
    visitsLoaded: false,
    visitsLoading: false,
    tabIndex: 0
};

const PatientDetailPage = () => {
    const params = useParams() as { id?: string };
    const id = Number(params?.id);
    const router = useRouter();
    const toast = useRef<Toast>(null);
    const [state, setState] = useState<DetailState>(INITIAL);
    const { user } = useUserData();
    const isAdmin = user?.role === USER_ROLES.admin;

    const setStateValue = (vals: Partial<DetailState>) => setState((prev) => ({ ...prev, ...vals }));

    useEffect(() => {
        const load = async () => {
            try {
                const data = await service.getPatientById(id);
                if (!data) {
                    toast.current?.show({ severity: 'warn', summary: 'Not found', detail: 'Patient does not exist' });
                    setStateValue({ loading: false });
                    return;
                }
                const partner = typeof data.partner === 'string' ? JSON.parse(data.partner as unknown as string) : data.partner;
                document.title = `${data.firstName} ${data.lastName}`;
                setStateValue({ patient: data, partner: partner || null, loading: false });
            } catch (error: any) {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: error?.message || 'Failed to load patient' });
                setStateValue({ loading: false });
            }
        };
        if (Number.isFinite(id) && id > 0) load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const loadVisitsLazy = async () => {
        if (state.visitsLoaded || state.visitsLoading) return;
        setStateValue({ visitsLoading: true });
        try {
            const rows = await service.getPatientVisits(id);
            setStateValue({ visits: rows, visitsLoaded: true, visitsLoading: false });
        } catch (error: any) {
            setStateValue({ visitsLoading: false });
            toast.current?.show({ severity: 'error', summary: 'Error', detail: error?.message || 'Failed to load visits' });
        }
    };

    const onTabChange = (e: TabViewTabChangeEvent) => {
        setStateValue({ tabIndex: e.index });
        if (e.index === 2) loadVisitsLazy();
    };

    const confirmDelete = () => {
        confirmDialog({
            message: 'Soft-delete this patient? They will be hidden from default lists but data is preserved.',
            header: 'Confirm Soft Delete',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            accept: async () => {
                try {
                    await service.deletePatient(id);
                    toast.current?.show({ severity: 'success', summary: 'Deleted', detail: 'Patient marked inactive' });
                    setTimeout(() => router.push('/hospital/patients'), 600);
                } catch (error: any) {
                    toast.current?.show({ severity: 'error', summary: 'Error', detail: error?.response?.data?.message || error?.message || 'Delete failed' });
                }
            }
        });
    };

    const counts = useMemo(() => {
        const p = state.patient as any;
        return {
            visits: p?.visitsCount ?? 0,
            investigations: p?.investigationsCount ?? 0,
            payments: p?.paymentsCount ?? 0,
            paymentsTotal: p?.paymentsTotal ?? 0
        };
    }, [state.patient]);

    if (!Number.isFinite(id) || id <= 0) {
        return <Card>Invalid patient id</Card>;
    }

    const p = state.patient;
    return (
        <>
            <Toast ref={toast} position={'bottom-right'} baseZIndex={9999} />
            <ConfirmDialog />
            <div className="grid">
                <div className="col-12">
                    <Card>
                        <div className="flex justify-content-between align-items-center mb-3">
                            <div>
                                <Button icon="pi pi-arrow-left" text label="Back to list" onClick={() => router.push('/hospital/patients')} />
                            </div>
                            <div className="flex gap-2">
                                {p?.isActive === 0 && <Tag severity="warning" value="Inactive" />}
                                {isAdmin && p?.isActive !== 0 && <Button icon="pi pi-trash" severity="danger" label="Soft Delete" onClick={confirmDelete} />}
                            </div>
                        </div>
                        {state.loading || !p ? (
                            <div>Loading…</div>
                        ) : (
                            <>
                                <h3 className="m-0">
                                    {p.firstName} {p.lastName}{' '}
                                    <small className="text-color-secondary">#{p.recordNumber}</small>
                                </h3>
                                <div className="grid mt-2 text-sm">
                                    <div className="col-6 md:col-3">
                                        <strong>Visits</strong>
                                        <div>{counts.visits}</div>
                                    </div>
                                    <div className="col-6 md:col-3">
                                        <strong>Investigations</strong>
                                        <div>{counts.investigations}</div>
                                    </div>
                                    <div className="col-6 md:col-3">
                                        <strong>Payments</strong>
                                        <div>{counts.payments}</div>
                                    </div>
                                    <div className="col-6 md:col-3">
                                        <strong>Total Paid</strong>
                                        <div>{formatCurrency(Number(counts.paymentsTotal || 0))}</div>
                                    </div>
                                </div>

                                <TabView activeIndex={state.tabIndex} onTabChange={onTabChange} className="mt-3">
                                    <TabPanel header="Profile">
                                        <div className="grid">
                                            <Field label="First Name" value={p.firstName} />
                                            <Field label="Last Name" value={p.lastName} />
                                            <Field label="Date of Birth" value={p.dateOfBirth ? `${changeDateFormat(new Date(p.dateOfBirth))} (${calcAgeFromDOB(new Date(p.dateOfBirth))} yrs)` : '—'} />
                                            <Field label="Gender" value={p.gender} />
                                            <Field label="Marital Status" value={p.maritalStatus} />
                                            <Field label="Nationality" value={p.nationality} />
                                            <Field label="Occupation" value={p.occupation} />
                                            <Field label="Religion" value={p.religion} />
                                            <Field label="Phone" value={p.phone} />
                                            <Field label="Email" value={p.email} />
                                            <Field label="Address" value={p.address} />
                                            <Field label="Next of Kin" value={`${p.nextOfKinName || '—'} (${p.nextOfKinPhone || '—'})`} />
                                        </div>
                                    </TabPanel>

                                    <TabPanel header="Partner">
                                        {!state.partner || !state.partner.firstName ? (
                                            <div>No partner record</div>
                                        ) : (
                                            <div className="grid">
                                                <Field label="First Name" value={state.partner.firstName} />
                                                <Field label="Last Name" value={state.partner.lastName} />
                                                <Field label="Gender" value={state.partner.gender} />
                                                <Field label="Date of Birth" value={state.partner.dateOfBirth ? changeDateFormat(new Date(state.partner.dateOfBirth)) : '—'} />
                                                <Field label="Occupation" value={state.partner.occupation} />
                                                <Field label="Phone" value={state.partner.phone} />
                                                <Field label="Email" value={state.partner.email} />
                                            </div>
                                        )}
                                    </TabPanel>

                                    <TabPanel header={`Visits (${counts.visits})`}>
                                        <DataTable value={state.visits} loading={state.visitsLoading} emptyMessage="No visits" dataKey="visitId" paginator rows={10}>
                                            <Column field="visitId" header="Visit ID" />
                                            <Column header="Date" body={(r: TPatientVisitRecord) => (r.visitDate ? changeDateFormat(new Date(r.visitDate as Date)) : '—')} />
                                            <Column field="visitType" header="Type" />
                                            <Column field="status" header="Status" />
                                        </DataTable>
                                    </TabPanel>

                                    <TabPanel header={`Investigations (${counts.investigations})`}>
                                        <div className="text-color-secondary">Detailed investigation history will be loaded on demand.</div>
                                    </TabPanel>

                                    <TabPanel header={`Payments (${counts.payments})`}>
                                        <div className="text-color-secondary">Payment history is summarized above. Detailed line items live in the Billing module.</div>
                                    </TabPanel>
                                </TabView>
                            </>
                        )}
                    </Card>
                </div>
            </div>
        </>
    );
};

const Field: React.FC<{ label: string; value: any }> = ({ label, value }) => (
    <div className="col-12 md:col-4">
        <div className="text-color-secondary text-sm">{label}</div>
        <div>{value || '—'}</div>
    </div>
);

export default PatientDetailPage;
