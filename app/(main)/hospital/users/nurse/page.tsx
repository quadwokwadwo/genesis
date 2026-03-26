'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Chart } from 'primereact/chart';
import { ProgressBar } from 'primereact/progressbar';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { Timeline } from 'primereact/timeline';
import { InputText } from 'primereact/inputtext';
import { ChartData, ChartOptions } from 'chart.js';
import { useRouter } from 'next/navigation';
import userService from '@/libs/blue_prints/UserService';

interface DashboardStats {
    todayPatients: number;
    pendingAppointments: number;
    completedVisits: number;
    criticalInventory: number;
    activeInvestigations: number;
    todayRevenue: number;
}

interface Appointment {
    appointmentId: number;
    patientName: string;
    doctorName: string;
    appointmentTime: string;
    appointmentDate: string;
    status: string;
    priority: string;
}

interface Patient {
    patientId: number;
    firstName: string;
    lastName: string;
    recordNumber: string;
    lastVisit?: string;
    status: 'In Progress' | 'Waiting' | 'Completed';
    nextAppointment?: string;
}

interface InventoryAlert {
    itemId: number;
    itemName: string;
    currentStock: number;
    reorderLevel: number;
    category: string;
    urgency: 'Critical' | 'Low' | 'Warning';
}

interface Investigation {
    investigationId: number;
    testName: string;
    patientName: string;
    source: 'Internal' | 'External';
    status: 'Pending' | 'In Progress' | 'Completed';
    price: number;
}
interface IRecentActivities {
    time: string;
    activity: string;
    icon: string;
    color: string;
}
interface IDashboardMeta {
    incomingAppointments: Appointment[];
    investigationStatus: Investigation[];
    lowStockItems: InventoryAlert[];
    patientHourlyChart: any;
    pendingInvestigations: Investigation[];
    dashboardStatistics: DashboardStats | string;
    activePatients: Patient[];
    recentActivities: IRecentActivities[];
}
const NurseDashboard = () => {
    const router = useRouter();
    const toast = useRef<Toast>(null);
    const [loading, setLoading] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [selectedTimeRange, setSelectedTimeRange] = useState({ name: 'Today', code: 'today' });

    // Dashboard State
    const [stats, setStats] = useState<DashboardStats>({
        todayPatients: 24,
        pendingAppointments: 12,
        completedVisits: 8,
        criticalInventory: 5,
        activeInvestigations: 15,
        todayRevenue: 4567.89
    });

    const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
    const [activePatients, setActivePatients] = useState<Patient[]>([]);
    const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([]);
    const [pendingInvestigations, setPendingInvestigations] = useState<Investigation[]>([]);
    const [patientFlowData, setPatientFlowData] = useState<ChartData>();
    const [investigationChartData, setInvestigationChartData] = useState<ChartData>();
    const [chartOptions, setChartOptions] = useState<ChartOptions>();

    // Timeline events for recent activities
    const [recentActivities, setRecentActivities] = useState<IRecentActivities[]>([
        {
            time: '09:00 AM',
            activity: 'Patient John Doe checked in',
            icon: 'pi pi-user-plus',
            color: '#22C55E'
        }
    ]);

    const timeRangeOptions = [
        { name: 'Today', code: 'today' },
        { name: 'This Week', code: 'week' },
        { name: 'This Month', code: 'month' }
    ];

    useEffect(() => {
        loadDashboardData();
        initializeCharts();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        const dashboardData = (await userService.getNurseDashboardData()) as IDashboardMeta;
        const dashboardStats: DashboardStats = typeof dashboardData.dashboardStatistics === 'string' ? JSON.parse(dashboardData.dashboardStatistics) : dashboardData.dashboardStatistics;
        try {
            // Simulate API calls - replace with actual API integration
            const appointments = dashboardData.incomingAppointments;
            const patients = dashboardData.activePatients;
            const inventory = dashboardData.lowStockItems;
            const investigations = dashboardData.pendingInvestigations;
            const recentActivities = dashboardData.recentActivities;

            setTodayAppointments(appointments);
            setActivePatients(patients);
            setInventoryAlerts(inventory);
            setPendingInvestigations(investigations);
            setStats(dashboardStats);
            setRecentActivities(recentActivities);
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

    const initializeCharts = () => {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        // Patient Flow Chart
        setPatientFlowData({
            labels: ['8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM'],
            datasets: [
                {
                    label: 'Patients Attended',
                    data: [2, 4, 3, 5, 2, 3, 4, 6, 5, 3],
                    borderColor: '#22C55E',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Waiting',
                    data: [1, 2, 2, 3, 1, 2, 2, 3, 2, 1],
                    borderColor: '#F59E0B',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    fill: true,
                    tension: 0.4
                }
            ]
        });

        // Investigation Status Chart
        setInvestigationChartData({
            labels: ['Completed', 'In Progress', 'Pending'],
            datasets: [
                {
                    data: [45, 30, 25],
                    backgroundColor: ['#22C55E', '#3B82F6', '#F59E0B'],
                    hoverBackgroundColor: ['#16A34A', '#2563EB', '#D97706']
                }
            ]
        });

        setChartOptions({
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

    // Template functions for DataTable
    const statusBodyTemplate = (rowData: any) => {
        const getSeverity = (status: string) => {
            switch (status) {
                case 'Completed':
                case 'In Progress':
                    return 'success';
                case 'Scheduled':
                case 'Waiting':
                    return 'info';
                case 'Pending':
                    return 'warning';
                case 'Cancelled':
                    return 'danger';
                default:
                    return 'warning';
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

    const urgencyBodyTemplate = (rowData: InventoryAlert) => {
        const getSeverity = (urgency: string) => {
            switch (urgency) {
                case 'Critical':
                    return 'danger';
                case 'Warning':
                    return 'warning';
                case 'Low':
                    return 'info';
                default:
                    return 'warning';
            }
        };
        return <Tag value={rowData.urgency} severity={getSeverity(rowData.urgency)} />;
    };

    const stockLevelBodyTemplate = (rowData: InventoryAlert) => {
        const percentage = (rowData.currentStock / rowData.reorderLevel) * 100;
        const color = percentage <= 30 ? 'red' : percentage <= 60 ? 'orange' : 'green';

        return (
            <div className="flex align-items-center gap-2">
                <span>
                    {rowData.currentStock}/{rowData.reorderLevel}
                </span>
                <ProgressBar value={percentage} showValue={false} style={{ width: '100px', height: '6px' }} color={color} />
            </div>
        );
    };

    const patientNameBodyTemplate = (rowData: any) => {
        const initials = rowData.patientName
            ? rowData.patientName
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')
            : `${rowData.firstName?.[0] || ''}${rowData.lastName?.[0] || ''}`;

        return (
            <div className="flex align-items-center gap-2">
                <Avatar label={initials} shape="circle" className="bg-primary" />
                <span>{rowData.patientName || `${rowData.firstName} ${rowData.lastName}`}</span>
            </div>
        );
    };

    const actionBodyTemplate = (rowData: any) => {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-eye" size="small" rounded text severity="info" tooltip="View Details" />
                <Button icon="pi pi-check" size="small" rounded text severity="success" tooltip="Complete" />
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

    // Navigation handlers
    const navigateToAppointments = () => router.push('/hospital/schedules');
    const navigateToPatients = () => router.push('/hospital/patients');
    const navigateToInventory = () => router.push('/hospital/inventory/items');
    const navigateToBilling = () => router.push('/hospital/billing');

    const header = (
        <div className="flex flex-wrap align-items-center justify-content-between gap-2">
            <span className="text-xl text-900 font-bold">Nurse Dashboard</span>
            <div className="flex align-items-center gap-2">
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Search..." />
                </span>
                <Dropdown value={selectedTimeRange} onChange={(e) => setSelectedTimeRange(e.value)} options={timeRangeOptions} optionLabel="name" className="w-10rem" />
                <Button icon="pi pi-refresh" rounded text onClick={loadDashboardData} />
            </div>
        </div>
    );

    return (
        <div className="grid">
            <Toast ref={toast} />

            {/* Header */}
            <div className="col-12">
                <Card className="mb-0">{header}</Card>
            </div>

            {/* Statistics Cards */}
            <div className="col-12 md:col-6 lg:col-4 xl:col-2">
                <Card className="mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Today Patients</span>
                            <div className="text-900 font-medium text-xl">{stats.todayPatients}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-users text-blue-500 text-xl"></i>
                        </div>
                    </div>
                    <span className="text-500">Visiting today</span>
                </Card>
            </div>

            <div className="col-12 md:col-6 lg:col-4 xl:col-2">
                <Card className="mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Appointments</span>
                            <div className="text-900 font-medium text-xl">{stats.pendingAppointments}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-orange-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-calendar text-orange-500 text-xl"></i>
                        </div>
                    </div>
                    <span className="text-500">Pending today</span>
                </Card>
            </div>

            <div className="col-12 md:col-6 lg:col-4 xl:col-2">
                <Card className="mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Completed Visits</span>
                            <div className="text-900 font-medium text-xl">{stats.completedVisits}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-green-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-check-circle text-green-500 text-xl"></i>
                        </div>
                    </div>
                    <span className="text-500">completion rate</span>
                </Card>
            </div>

            <div className="col-12 md:col-6 lg:col-4 xl:col-2">
                <Card className="mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Critical Stock</span>
                            <div className="text-900 font-medium text-xl">{stats.criticalInventory}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-red-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-exclamation-triangle text-red-500 text-xl"></i>
                        </div>
                    </div>
                    <span className="text-red-500">Items low</span>
                </Card>
            </div>

            <div className="col-12 md:col-6 lg:col-4 xl:col-2">
                <Card className="mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Investigations</span>
                            <div className="text-900 font-medium text-xl">{stats.activeInvestigations}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-purple-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-chart-bar text-purple-500 text-xl"></i>
                        </div>
                    </div>
                    <span className="text-500">Active tests</span>
                </Card>
            </div>

            <div className="col-12 md:col-6 lg:col-4 xl:col-2">
                <Card className="mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Today Revenue</span>
                            <div className="text-900 font-medium text-xl">${stats.todayRevenue}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-cyan-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-dollar text-cyan-500 text-xl"></i>
                        </div>
                    </div>
                    <span className="text-500">increase</span>
                </Card>
            </div>

            {/* Today's Appointments */}
            <div className="col-12 lg:col-8">
                <Card title="Today's Appointments" className="h-full">
                    <DataTable value={todayAppointments} loading={loading} paginator rows={5} globalFilter={globalFilter} emptyMessage="No appointments scheduled" className="p-datatable-sm">
                        <Column field="appointmentTime" header="Time" sortable />
                        <Column field="patientName" header="Patient" body={patientNameBodyTemplate} />
                        <Column field="doctorName" header="Doctor" />
                        <Column field="priority" header="Priority" body={priorityBodyTemplate} />
                        <Column field="status" header="Status" body={statusBodyTemplate} />
                        <Column header="Actions" body={actionBodyTemplate} style={{ width: '8rem' }} />
                    </DataTable>
                    <div className="flex justify-content-end mt-3">
                        <Button label="View All Appointments" icon="pi pi-arrow-right" iconPos="right" text onClick={navigateToAppointments} />
                    </div>
                </Card>
            </div>

            {/* Recent Activities Timeline */}
            <div className="col-12 lg:col-4">
                <Card title="Recent Activities" className="h-full">
                    <Timeline value={recentActivities} content={timelineTemplate} className="customized-timeline" />
                </Card>
            </div>

            {/*/!* Patient Flow Chart *!/*/}
            {/*<div className="col-12 lg:col-6">*/}
            {/*    <Card title="Patient Flow Today">*/}
            {/*        <Chart type="line" data={patientFlowData} options={chartOptions} height="300px" />*/}
            {/*    </Card>*/}
            {/*</div>*/}

            {/*/!* Investigation Status *!/*/}
            {/*<div className="col-12 lg:col-6">*/}
            {/*    <Card title="Investigation Status">*/}
            {/*        <div className="flex align-items-center justify-content-center">*/}
            {/*            <Chart type="doughnut" data={investigationChartData} options={chartOptions} />*/}
            {/*        </div>*/}
            {/*        <div className="mt-3">*/}
            {/*            <DataTable value={pendingInvestigations} loading={loading} className="p-datatable-sm">*/}
            {/*                <Column field="testName" header="Test" />*/}
            {/*                <Column field="patientName" header="Patient" />*/}
            {/*                <Column field="source" header="Source" />*/}
            {/*                <Column field="status" header="Status" body={statusBodyTemplate} />*/}
            {/*            </DataTable>*/}
            {/*        </div>*/}
            {/*    </Card>*/}
            {/*</div>*/}

            {/* Active Patients */}
            <div className="col-12 lg:col-6">
                <Card title="Active Patients">
                    <DataTable value={activePatients} loading={loading} className="p-datatable-sm" globalFilter={globalFilter}>
                        <Column field="recordNumber" header="Record #" />
                        <Column header="Patient" body={patientNameBodyTemplate} />
                        <Column field="status" header="Status" body={statusBodyTemplate} />
                        <Column field="lastVisit" header="Last Visit" />
                        <Column header="Actions" body={actionBodyTemplate} />
                    </DataTable>
                    <div className="flex justify-content-end mt-3">
                        <Button label="View All Patients" icon="pi pi-arrow-right" iconPos="right" text onClick={navigateToPatients} />
                    </div>
                </Card>
            </div>

            {/* Inventory Alerts */}
            <div className="col-12 lg:col-6">
                <Card title="Inventory Alerts">
                    <DataTable value={inventoryAlerts} loading={loading} className="p-datatable-sm">
                        <Column field="itemName" header="Item" />
                        <Column field="category" header="Category" />
                        <Column header="Stock Level" body={stockLevelBodyTemplate} />
                        <Column field="urgency" header="Urgency" body={urgencyBodyTemplate} />
                    </DataTable>
                    <div className="flex justify-content-end mt-3">
                        <Button label="Manage Inventory" icon="pi pi-arrow-right" iconPos="right" text onClick={navigateToInventory} />
                    </div>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="col-12">
                <Card title="Quick Actions">
                    <div className="flex flex-wrap gap-2">
                        <Button label="Register Patient" icon="pi pi-user-plus" className="p-button-success" onClick={() => router.push('/hospital/patients')} />
                        <Button label="Expenditures" icon="pi pi-dollar" className="p-button-info" onClick={() => router.push('/hospital/expenses')} />
                        <Button label="Schedule Appointment" icon="pi pi-calendar-plus" onClick={() => router.push('/hospital/schedules')} />
                        <Button label="Dispense Medication" icon="pi pi-box" className="p-button-warning" onClick={() => router.push('/hospital/inventory/sales')} />
                        <Button label="Billing" icon="pi pi-money-bill" className="p-button-help" onClick={() => router.push('/hospital/billing')} />
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default NurseDashboard;
