// app/(main)/hospital/doctor/dashboard/page.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Chart } from 'primereact/chart';
import { Badge } from 'primereact/badge';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Calendar } from 'primereact/calendar';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { TabPanel, TabView } from 'primereact/tabview';
import { ChartData, ChartOptions } from 'chart.js';
import { useRouter } from 'next/navigation';
import userService from '@/libs/blue_prints/UserService';
import useUserData from '@/libs/hooks/useUserData';
import { AppointmentType, USER_ROLES } from '@/types/enums/enums';
import { User } from '@/types/hospital';
import { changeDateFormat } from '@/libs/utils';
import { useSocket, onSocketEvent } from '@/libs/hooks/useSocket';

interface DoctorStats {
    totalPatientsToday: number;
    completedAppointments: number;
    pendingAppointments: number;
    totalPatientsThisMonth: number;
    averageVisitDuration: number;
    patientSatisfactionRate: number;
}

interface Appointment {
    appointmentId: number;
    patientId: number;
    patientName: string;
    patientAge: number;
    recordNumber: string;
    appointmentTime: string;
    appointmentType: string;
    status: string;
    priority: string;
    reason?: string;
    vitalSigns?: any;
}

interface PatientVisit {
    visitId: number;
    patientId: number;
    patientName: string;
    visitDate: string;
    diagnosis: string;
    treatment: string;
    nextAppointment?: string;
    investigations?: string[];
    prescriptions?: string[];
}
interface IRecentActivities {
    time: string;
    activity: string;
    icon: string;
    color: string;
}
interface UpcomingReview {
    reviewId: number;
    patientName: string;
    lastVisitDate: Date | string;
    nextAppointment: Date | string;
    reviewType: string;
    daysTillAppointment: number;
}

interface Investigation {
    investigationId: number;
    testName: string;
    patientName: string;
    orderedDate: string;
    status: string;
    result?: string;
    source: string;
}
interface TVisitStats {
    totalPatientsToday: number;
    completedAppointments: number;
    pendingAppointments: number;
}
interface TMonthlyVisitStats {
    totalPatientsThisMonth: number;
    averageVisitDuration: number;
    patientSatisfactionRate: number;
}
interface IPatientTrends {
    totalVisits: number;
    weekNumber: number;
    visitType: AppointmentType;
    weekStart: string;
    weekend: string;
}
interface IAppointmentDistribution {
    appointmentType: string;
    appointmentCount: number;
}
interface IDashboardMeta {
    visitStatistics: TVisitStats;
    monthlyVisitStatistics: TMonthlyVisitStats;
    doctorTodayAppointment: Appointment[];
    patientRecentVisits: PatientVisit[];
    patientPendingInvestigations: Investigation[];
    doctorRecentActivities: IRecentActivities[];
    newPatientsTrend: IPatientTrends[];
    followupPatientsTrends: IPatientTrends[];
    appointmentDistribution: IAppointmentDistribution[];
    upcomingAppointments: UpcomingReview[];
}
const allowedRoles = [USER_ROLES.doctor, USER_ROLES.admin];
const DoctorDashboard = () => {
    const router = useRouter();
    const toast = useRef<Toast>(null);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [showPatientDialog, setShowPatientDialog] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Appointment | null>(null);
    const [notes, setNotes] = useState('');
    const { user, setUser, isLoaded } = useUserData<User>();

    // Dashboard state
    const [stats, setStats] = useState<DoctorStats>({
        totalPatientsToday: 12,
        completedAppointments: 5,
        pendingAppointments: 7,
        totalPatientsThisMonth: 156,
        averageVisitDuration: 23,
        patientSatisfactionRate: 92
    });

    const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
    const [recentVisits, setRecentVisits] = useState<PatientVisit[]>([]);
    const [upcomingReviews, setUpcomingReviews] = useState<UpcomingReview[]>([]);
    const [pendingInvestigations, setPendingInvestigations] = useState<Investigation[]>([]);
    const [monthlyPatientData, setMonthlyPatientData] = useState<ChartData>();
    const [appointmentTypeData, setAppointmentTypeData] = useState<ChartData>();
    const [chartOptions, setChartOptions] = useState<ChartOptions>();

    // Timeline events
    const [recentActivities, setRecentActivities] = useState<IRecentActivities[]>([]);

    useEffect(() => {
        if (!isLoaded) return;

        if (!user || !allowedRoles.includes(user.role)) router.push('/auth/login');
        loadDashboardData().catch(console.error);
    }, [selectedDate, isLoaded]);

    // Module 17 — refresh on realtime appointment events for this doctor.
    const { socket } = useSocket();
    useEffect(() => {
        if (!socket) return;
        const refresh = () => loadDashboardData().catch(console.error);
        const offCreated = onSocketEvent(socket, 'appointment.created', refresh);
        const offUpdated = onSocketEvent(socket, 'appointment.updated', refresh);
        const offCancelled = onSocketEvent(socket, 'appointment.cancelled', refresh);
        return () => {
            offCreated();
            offUpdated();
            offCancelled();
        };
    }, [socket]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // These would be actual API calls
            const dashboardMeta = (await userService.getDoctorDashboardData(changeDateFormat(selectedDate))) as IDashboardMeta;

            const patientsTrend = dashboardMeta.newPatientsTrend;
            const appointmentDistribution = dashboardMeta.appointmentDistribution;
            const newVisits = patientsTrend.filter((trend) => trend.visitType === AppointmentType.initialConsultation);
            const followupVisits = patientsTrend.filter((trend) => trend.visitType === AppointmentType.followupVisit);
            const appointments = dashboardMeta.doctorTodayAppointment;
            const visits = dashboardMeta.patientRecentVisits;
            const investigations = dashboardMeta.patientPendingInvestigations;
            const upcomingReviews = dashboardMeta.upcomingAppointments;

            setTodayAppointments(appointments);
            setRecentVisits(visits);
            setUpcomingReviews(upcomingReviews);
            setPendingInvestigations(investigations);
            initializeCharts(newVisits, followupVisits, appointmentDistribution);
            setStats({ ...dashboardMeta.visitStatistics, ...dashboardMeta.monthlyVisitStatistics });
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to load dashboard data',
                life: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    const initializeCharts = (newPatientsTrend: IPatientTrends[], followupPatientsTrends: IPatientTrends[], appointmentDistribution: IAppointmentDistribution[]) => {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        // Monthly patient trend
        setMonthlyPatientData({
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [
                {
                    label: 'New Patients',
                    data: newPatientsTrend.map((trend) => trend.totalVisits),
                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                    borderColor: '#22C55E',
                    tension: 0.4
                },
                {
                    label: 'Follow-ups',
                    data: followupPatientsTrends.map((trend) => trend.totalVisits),
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderColor: '#3B82F6',
                    tension: 0.4
                }
            ]
        });

        // Appointment types distribution
        setAppointmentTypeData({
            labels: appointmentDistribution.map((appointment) => appointment.appointmentType),
            datasets: [
                {
                    data: appointmentDistribution.map((distribution) => distribution.appointmentCount),
                    backgroundColor: ['#22C55E', '#3B82F6', '#EF4444', '#F59E0B', '#8B5CF6'],
                    hoverBackgroundColor: ['#16A34A', '#2563EB', '#DC2626', '#D97706', '#7C3AED']
                }
            ]
        });

        setChartOptions({
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        color: surfaceBorder
                    }
                },
                y: {
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        color: surfaceBorder
                    }
                }
            }
        });
    };

    // Mock data generators

    const generateMockReviews = (): UpcomingReview[] => [
        {
            reviewId: 1,
            patientName: 'Alice Brown',
            lastVisitDate: '2024-01-05',
            nextAppointment: '2024-01-25',
            reviewType: 'Routine Check',
            daysTillAppointment: 5
        },
        {
            reviewId: 2,
            patientName: 'David Wilson',
            lastVisitDate: '2024-01-10',
            nextAppointment: '2024-01-27',
            reviewType: 'Post-surgery',
            daysTillAppointment: 7
        }
    ];

    const generateMockInvestigations = (): Investigation[] => [
        {
            investigationId: 1,
            testName: 'Complete Blood Count',
            patientName: 'John Doe',
            orderedDate: '2024-01-20',
            status: 'Pending',
            source: 'Internal'
        },
        {
            investigationId: 2,
            testName: 'ECG',
            patientName: 'Jane Smith',
            orderedDate: '2024-01-20',
            status: 'Completed',
            result: 'Normal sinus rhythm',
            source: 'Internal'
        }
    ];

    // Template functions
    const statusBodyTemplate = (rowData: any) => {
        const getSeverity = (status: string) => {
            switch (status) {
                case 'Completed':
                    return 'success';
                case 'In Progress':
                    return 'warning';
                case 'Scheduled':
                    return 'info';
                case 'Cancelled':
                    return 'danger';
                default:
                    return 'info';
            }
        };
        return <Tag value={rowData.status} severity={getSeverity(rowData.status)} />;
    };

    const priorityBodyTemplate = (rowData: Appointment) => {
        const getSeverity = (priority: string) => {
            switch (priority) {
                case 'High':
                    return 'danger';
                case 'Normal':
                    return 'info';
                case 'Low':
                    return 'warning';
                default:
                    return 'info';
            }
        };
        return <Tag value={rowData.priority} severity={getSeverity(rowData.priority)} />;
    };

    const patientBodyTemplate = (rowData: Appointment) => {
        return (
            <div className="flex align-items-center gap-2">
                <Avatar
                    label={rowData.patientName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    size="normal"
                    shape="circle"
                    className="bg-primary"
                />
                <div>
                    <div className="font-semibold">{rowData.patientName}</div>
                    <div className="text-sm text-500">
                        {rowData.recordNumber} • Age: {rowData.patientAge}
                    </div>
                </div>
            </div>
        );
    };

    const actionBodyTemplate = (rowData: any) => {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-eye" size="small" rounded text severity="info" onClick={() => viewPatient(rowData)} tooltip="View Details" />
                <Button icon="pi pi-pencil" size="small" rounded text severity="warning" onClick={() => startConsultation(rowData)} tooltip="Start Consultation" />
                <Button icon="pi pi-file-pdf" size="small" rounded text severity="help" tooltip="View Records" />
            </div>
        );
    };

    const timelineTemplate = (item: any) => {
        return (
            <div className="flex align-items-center justify-content-between w-full">
                <div className="flex align-items-center gap-2">
                    <i className={item.icon} style={{ color: item.color }}></i>
                    <span className="text-sm">{item.activity}</span>
                </div>
                <small className="text-color-secondary">{item.time}</small>
            </div>
        );
    };

    const viewPatient = (patient: Appointment) => {
        setSelectedPatient(patient);
        setShowPatientDialog(true);
    };

    const startConsultation = (patient: Appointment) => {
        router.push(`/hospital/consultation/${patient.patientId}?appointmentId=${patient.appointmentId}`);
    };

    const quickStats = [
        { label: "Today's Patients", value: stats.totalPatientsToday, icon: 'pi-users', color: 'blue' },
        { label: 'Completed', value: stats.completedAppointments, icon: 'pi-check-circle', color: 'green' },
        { label: 'Pending', value: stats.pendingAppointments, icon: 'pi-clock', color: 'orange' },
        { label: 'This Month', value: stats.totalPatientsThisMonth, icon: 'pi-calendar', color: 'purple' },
        { label: 'Avg. Duration', value: `${stats.averageVisitDuration ?? 0} min`, icon: 'pi-stopwatch', color: 'cyan' },
        { label: 'Satisfaction', value: `${stats.patientSatisfactionRate ?? 0}%`, icon: 'pi-star-fill', color: 'yellow' }
    ];

    return (
        <div className="grid">
            <Toast ref={toast} />
            {/* Header */}
            <div className="col-12">
                <Card className="mb-0">
                    <div className="flex align-items-center justify-content-between">
                        <div>
                            <h2 className="m-0">Doctor Dashboard</h2>
                            <p className="text-500 mt-1">Welcome back, Dr. {`${user?.firstName} ${user?.lastName}`}</p>
                        </div>
                        <div className="flex align-items-center gap-3">
                            <Calendar value={selectedDate} onChange={(e) => setSelectedDate(e.value as Date)} dateFormat="dd MM yy" showIcon />
                            <Button label="New Appointment" icon="pi pi-plus" onClick={() => router.push('/hospital/schedules/')} />
                        </div>
                    </div>
                </Card>
            </div>
            {/* Quick Stats */}
            {quickStats.map((stat, index) => (
                <div key={index} className="col-12 md:col-6 lg:col-4 xl:col-2">
                    <Card className="mb-0">
                        <div className="flex justify-content-between mb-3">
                            <div>
                                <span className="block text-500 font-medium mb-3">{stat.label}</span>
                                <div className="text-900 font-medium text-xl">{stat.value}</div>
                            </div>
                            <div className={`flex align-items-center justify-content-center bg-${stat.color}-100 border-round`} style={{ width: '2.5rem', height: '2.5rem' }}>
                                <i className={`pi ${stat.icon} text-${stat.color}-500 text-xl`}></i>
                            </div>
                        </div>
                    </Card>
                </div>
            ))}
            {/* Main Content Tabs */}
            <div className="col-12 lg:col-8">
                <Card>
                    <TabView>
                        <TabPanel header="Today's Appointments" leftIcon="pi pi-calendar">
                            <DataTable value={todayAppointments} loading={loading} paginator rows={5} emptyMessage="No appointments scheduled" className="p-datatable-sm">
                                <Column field="appointmentTime" header="Time" style={{ width: '10%' }} />
                                <Column header="Patient" body={patientBodyTemplate} style={{ width: '30%' }} />
                                <Column field="appointmentType" header="Type" style={{ width: '20%' }} />
                                <Column field="reason" header="Reason" style={{ width: '20%' }} />
                                <Column field="priority" header="Priority" body={priorityBodyTemplate} style={{ width: '10%' }} />
                                <Column field="status" header="Status" body={statusBodyTemplate} style={{ width: '10%' }} />
                                <Column header="Actions" body={actionBodyTemplate} style={{ width: '15%' }} />
                            </DataTable>
                        </TabPanel>

                        <TabPanel header="Recent Visits" leftIcon="pi pi-history">
                            <DataTable value={recentVisits} loading={loading} paginator rows={5} className="p-datatable-sm">
                                <Column field="visitDate" header="Date" />
                                <Column field="patientName" header="Patient" />
                                <Column field="diagnosis" header="Diagnosis" />
                                <Column field="treatment" header="Treatment" />
                                <Column field="nextAppointment" header="Next Visit" />
                                <Column header="Actions" body={actionBodyTemplate} />
                            </DataTable>
                        </TabPanel>

                        <TabPanel header="Pending Investigations" leftIcon="pi pi-file">
                            <DataTable value={pendingInvestigations} loading={loading} className="p-datatable-sm">
                                <Column field="testName" header="Test" />
                                <Column field="patientName" header="Patient" />
                                <Column field="orderedDate" header="Ordered" />
                                <Column field="source" header="Source" />
                                <Column field="status" header="Status" body={statusBodyTemplate} />
                                <Column field="result" header="Result" />
                            </DataTable>
                        </TabPanel>
                    </TabView>
                </Card>
            </div>
            {/* Side Panel */}
            <div className="col-12 lg:col-4">
                {/* Upcoming Reviews */}
                <Card title="Upcoming Reviews">
                    {upcomingReviews.map((review, index) => (
                        <div key={`${review.patientName}${index}`} className="mb-3 p-3 surface-100 border-round">
                            <div className="flex justify-content-between align-items-center">
                                <div>
                                    <div className="font-semibold">{review.patientName}</div>
                                    <div className="text-sm text-500">{review.reviewType}</div>
                                </div>
                                <Badge value={`${review.daysTillAppointment}d`} severity="warning" />
                            </div>
                            <div className="text-sm mt-2">Next: {changeDateFormat(new Date(review.nextAppointment))}</div>
                        </div>
                    ))}
                </Card>
            </div>
            Charts
            <div className="grid"></div>
            <div className="col-12 lg:col-5">
                <Card title="Patient Trends">
                    <Chart type="line" data={monthlyPatientData} options={chartOptions} height="250px" />
                </Card>
            </div>
            <div className="col-12 lg:col-6">
                <Card title="Appointment Types Distribution">
                    <Chart type="doughnut" data={appointmentTypeData} options={chartOptions} height="250px" />
                </Card>
            </div>
            {/* Quick Actions */}
            <div className="col-12">
                <Card title="Quick Actions">
                    <div className="flex flex-wrap gap-2">
                        <Button label="View Schedule" icon="pi pi-calendar" className="p-button-info" onClick={() => router.push('/hospital/enhanced')} />
                        <Button label="Patient Records" icon="pi pi-users" onClick={() => router.push('/hospital/patients')} />
                        <Button label="Write Prescription" icon="pi pi-file-edit" className="p-button-success" onClick={() => router.push('/hospital/inventory/sales')} />
                        <Button label="Expenditures" icon="pi pi-dollar" className="p-button-warning" onClick={() => router.push('/hospital/expenses')} />
                        <Button label="Activity Summary" icon="pi pi-chart-bar" className="p-button-help" onClick={() => router.push('/hospital/overview')} />
                        <Button label="Settings" icon="pi pi-cog" className="p-button-danger" onClick={() => router.push('/hospital/settings')} />
                    </div>
                </Card>
            </div>
            {/* Patient Details Dialog */}
            <Dialog visible={showPatientDialog} onHide={() => setShowPatientDialog(false)} header="Patient Details" style={{ width: '50vw' }}>
                {selectedPatient && (
                    <div className="grid">
                        <div className="col-6">
                            <p>
                                <strong>Name:</strong> {selectedPatient.patientName}
                            </p>
                            <p>
                                <strong>Record Number:</strong> {selectedPatient.recordNumber}
                            </p>
                            <p>
                                <strong>Age:</strong> {selectedPatient.patientAge}
                            </p>
                        </div>
                        <div className="col-6">
                            <p>
                                <strong>Appointment Type:</strong> {selectedPatient.appointmentType}
                            </p>
                            <p>
                                <strong>Reason:</strong> {selectedPatient.reason}
                            </p>
                            <p>
                                <strong>Status:</strong> <Tag value={selectedPatient.status} />
                            </p>
                        </div>
                        {selectedPatient.vitalSigns && (
                            <div className="col-12">
                                <h4>Vital Signs</h4>
                                <p>
                                    BP: {selectedPatient.vitalSigns.bp}, Pulse: {selectedPatient.vitalSigns.pulse}, Temp: {selectedPatient.vitalSigns.temp}
                                </p>
                            </div>
                        )}
                        <div className="col-12">
                            <h4>Doctors Notes</h4>
                            <InputTextarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={5} className="w-full" placeholder="Add consultation notes..." />
                        </div>
                        <div className="col-12 flex justify-content-end gap-2 mt-3">
                            <Button label="Save Notes" icon="pi pi-save" />
                            <Button label="Start Consultation" icon="pi pi-user-edit" severity="success" onClick={() => startConsultation(selectedPatient)} />
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    );
};

export default DoctorDashboard;
