'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Chart } from 'primereact/chart';
import { Badge } from 'primereact/badge';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Calendar } from 'primereact/calendar';
import { TabPanel, TabView } from 'primereact/tabview';
import { ChartData, ChartOptions } from 'chart.js';
import { useRouter } from 'next/navigation';
import { differenceInDays, format } from 'date-fns';
import { TSemenAnalysis } from '@/types/semen/semen';
import { TEmbryoCryoPreservation, TIVFAssessmentData } from '@/types/ivf/ivf';
import { changeDateFormat } from '@/libs/utils';
import { Divider } from 'primereact/divider';
import { ProgressBar } from 'primereact/progressbar';
import { Timeline } from 'primereact/timeline';
import useUserData from '@/libs/hooks/useUserData';
import { User } from '@/types/hospital';
import { TEmbryologistDashboardData, TEmbryologistStats } from '@/types/embryologist/embryologist';
import embryologistService from '@/libs/blue_prints/EmbryologistService';

interface RecentActivity {
    time: string;
    activity: string;
    icon: string;
    color: string;
    type: 'semen' | 'ivf' | 'cryo' | 'other';
}

interface CryoAlert {
    tankId: number;
    tankName: string;
    alertType: 'temperature' | 'capacity' | 'maintenance';
    severity: 'low' | 'medium' | 'high';
    message: string;
    daysUntilAction: number;
}

interface LabWorkload {
    date: string;
    semenAnalyses: number;
    ivfAssessments: number;
    cryoOperations: number;
}

const EmbryologistDashboard = () => {
    const router = useRouter();
    const toast = useRef<Toast>(null);
    const { user } = useUserData<User>();
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [activeTab, setActiveTab] = useState(0);

    // Dashboard state
    const [stats, setStats] = useState<TEmbryologistStats>({
        totalAssessmentsToday: 8,
        completedSemenAnalyses: 5,
        pendingIVFAssessments: 3,
        totalCryopreservedSamples: 127,
        activeEmbryoTanks: 4,
        averageAssessmentTime: 45,
        successRate: 87
    });
    const [dashboardData, setDashboardData] = useState<TEmbryologistDashboardData>({} as TEmbryologistDashboardData);
    const [recentSemenAnalyses, setRecentSemenAnalyses] = useState<Partial<TSemenAnalysis>[]>([]);
    const [pendingIVFAssessments, setPendingIVFAssessments] = useState<Partial<TIVFAssessmentData>[]>([]);
    const [cryoAlerts, setCryoAlerts] = useState<CryoAlert[]>([]);
    const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
    const [weeklyWorkload, setWeeklyWorkload] = useState<ChartData>();
    const [assessmentDistribution, setAssessmentDistribution] = useState<ChartData>();
    const [chartOptions, setChartOptions] = useState<ChartOptions>();

    useEffect(() => {
        document.title = 'Embryologist Dashboard';
        loadDashboardData();
        initializeCharts();
    }, [selectedDate]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const dashboardStats = await embryologistService.getEmbryologists();
            console.log(dashboardStats);

            setDashboardData(typeof dashboardStats.data.operatedData.stats === 'string' ? JSON.parse(dashboardStats.data.operatedData.stats) : dashboardStats.data.operatedData.stats);

            // Mock data - replace with actual API calls
            setRecentSemenAnalyses([
                {
                    semenAnalysisId: 1,
                    patientId: 101,
                    labId: 'SA-2024-001',
                    collectionDate: new Date().toISOString(),
                    status: 'Completed',
                    microscopicExamination: { concentration: '20M/ml', progressiveMotility: '45%' } as any
                },
                {
                    semenAnalysisId: 2,
                    patientId: 102,
                    labId: 'SA-2024-002',
                    collectionDate: new Date().toISOString(),
                    status: 'In-Progress',
                    microscopicExamination: { concentration: '15M/ml', progressiveMotility: '38%' } as any
                }
            ]);

            setPendingIVFAssessments([
                {
                    ivfEmbryoAssessmentId: 1,
                    patientId: 201,
                    dateOfCycle: new Date().toISOString(),
                    typeOfIVFCycle: ['ICSI'],
                    numberOfOocytesRetrieved: 12
                },
                {
                    ivfEmbryoAssessmentId: 2,
                    patientId: 202,
                    dateOfCycle: new Date().toISOString(),
                    typeOfIVFCycle: ['Standard IVF'],
                    numberOfOocytesRetrieved: 8
                }
            ]);

            setCryoAlerts([
                {
                    tankId: 1,
                    tankName: 'Embryo Tank A',
                    alertType: 'capacity',
                    severity: 'medium',
                    message: 'Tank at 85% capacity',
                    daysUntilAction: 14
                },
                {
                    tankId: 2,
                    tankName: 'Sperm Tank B',
                    alertType: 'maintenance',
                    severity: 'low',
                    message: 'Scheduled maintenance due',
                    daysUntilAction: 7
                }
            ]);

            setRecentActivities([
                { time: '10:30 AM', activity: 'Completed semen analysis SA-2024-001', icon: 'pi-check-circle', color: '#22C55E', type: 'semen' },
                { time: '11:15 AM', activity: 'Started IVF embryo assessment for patient P-202', icon: 'pi-circle', color: '#3B82F6', type: 'ivf' },
                { time: '12:00 PM', activity: 'Cryopreserved 5 embryos in Tank A', icon: 'pi-box', color: '#8B5CF6', type: 'cryo' },
                { time: '2:30 PM', activity: 'Updated blastocyst grading for assessment #145', icon: 'pi-pencil', color: '#F59E0B', type: 'ivf' }
            ]);
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

        // Weekly workload chart
        setWeeklyWorkload({
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                {
                    label: 'Semen Analyses',
                    data: [4, 6, 5, 7, 8, 3, 2],
                    backgroundColor: 'rgba(34, 197, 94, 0.6)',
                    borderColor: '#22C55E',
                    borderWidth: 1
                },
                {
                    label: 'IVF Assessments',
                    data: [2, 3, 4, 3, 5, 2, 1],
                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                    borderColor: '#3B82F6',
                    borderWidth: 1
                },
                {
                    label: 'Cryo Operations',
                    data: [1, 2, 1, 3, 2, 1, 0],
                    backgroundColor: 'rgba(139, 92, 246, 0.6)',
                    borderColor: '#8B5CF6',
                    borderWidth: 1
                }
            ]
        });

        // Assessment type distribution
        setAssessmentDistribution({
            labels: ['Semen Analysis', 'IVF Embryo', 'Cryopreservation', 'Sperm Tank', 'Embryo Tank'],
            datasets: [
                {
                    data: [45, 30, 15, 5, 5],
                    backgroundColor: ['#22C55E', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'],
                    hoverBackgroundColor: ['#16A34A', '#2563EB', '#7C3AED', '#D97706', '#DC2626']
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

    // Template functions
    const statusBodyTemplate = (rowData: any) => {
        const getSeverity = (status: string): 'success' | 'warning' | 'info' | 'danger' => {
            switch (status) {
                case 'Completed':
                    return 'success';
                case 'In-Progress':
                    return 'warning';
                case 'Pending':
                    return 'info';
                case 'Cancelled':
                    return 'danger';
                default:
                    return 'info';
            }
        };
        return <Tag value={rowData.status} severity={getSeverity(rowData.status)} />;
    };

    const dateBodyTemplate = (rowData: any, field: string) => {
        const date = rowData[field];
        return date ? changeDateFormat(new Date(date)) : '-';
    };

    const actionsBodyTemplate = (rowData: any, type: 'semen' | 'ivf' | 'cryo') => {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-eye" size="small" rounded text severity="info" tooltip="View Details" onClick={() => handleViewDetails(rowData, type)} />
                <Button icon="pi pi-pencil" size="small" rounded text severity="warning" tooltip="Edit" onClick={() => handleEdit(rowData, type)} />
                <Button icon="pi pi-file-pdf" size="small" rounded text severity="help" tooltip="Export Report" onClick={() => handleExport(rowData, type)} />
            </div>
        );
    };

    const handleViewDetails = (rowData: any, type: string) => {
        console.log('View details:', rowData, type);
    };

    const handleEdit = (rowData: any, type: string) => {
        switch (type) {
            case 'semen':
                router.push(`/hospital/lab/semen`);
                break;
            case 'ivf':
                router.push(`/hospital/lab/ivf-embryo`);
                break;
            case 'cryo':
                router.push(`/hospital/lab/embryo-cryopreservation`);
                break;
        }
    };

    const handleExport = (rowData: any, type: string) => {
        toast.current?.show({
            severity: 'info',
            summary: 'Export',
            detail: 'Generating report...',
            life: 2000
        });
    };

    const alertSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high':
                return 'danger';
            case 'medium':
                return 'warning';
            case 'low':
                return 'info';
            default:
                return 'info';
        }
    };

    const quickStats = [
        { label: "Today's Tasks", value: stats.totalAssessmentsToday, icon: 'pi-clipboard', color: 'blue', trend: '+12%' },
        { label: 'Completed Analyses', value: stats.completedSemenAnalyses, icon: 'pi-check-circle', color: 'green', trend: '+8%' },
        { label: 'Pending IVF', value: stats.pendingIVFAssessments, icon: 'pi-clock', color: 'orange', trend: '-5%' },
        { label: 'Cryo Samples', value: stats.totalCryopreservedSamples, icon: 'pi-box', color: 'purple', trend: '+15%' },
        { label: 'Active Tanks', value: stats.activeEmbryoTanks, icon: 'pi-database', color: 'cyan', trend: '0%' },
        { label: 'Success Rate', value: `${stats.successRate}%`, icon: 'pi-star-fill', color: 'yellow', trend: '+3%' }
    ];

    const quickActions = [
        { label: 'New Semen Analysis', icon: 'pi-plus', route: '/hospital/lab/semen', color: 'success' },
        { label: 'IVF Assessment', icon: 'pi-circle', route: '/hospital/lab/ivf-embryo', color: 'info' },
        { label: 'Embryo Cryo', icon: 'pi-box', route: '/hospital/lab/embryo-cryopreservation', color: 'help' },
        { label: 'Sperm Preservation', icon: 'pi-database', route: '/hospital/lab/sperm-preservation', color: 'warning' },
        { label: 'Lab Review', icon: 'pi-file', route: '/hospital/lab/review', color: 'secondary' },
        { label: 'Reports', icon: 'pi-chart-bar', route: '/hospital/lab/entry', color: 'primary' }
    ];

    return (
        <div className="grid">
            <Toast ref={toast} />

            {/* Header */}
            <div className="col-12">
                <Card className="mb-0 bg-gradient-to-r from-blue-500 to-purple-600">
                    <div className="flex align-items-center justify-content-between">
                        <div>
                            <h2 className="m-0">Embryology Lab Dashboard</h2>
                            <p className="mt-2 mb-0 text-blue-50">
                                Welcome back, {user?.firstName || 'Embryologist'} • {format(new Date(), 'EEEE, MMMM dd, yyyy')}
                            </p>
                        </div>
                        <div className="flex align-items-center gap-3">
                            <Calendar value={selectedDate} onChange={(e) => setSelectedDate(e.value as Date)} dateFormat="dd M yy" showIcon className="bg-white" />
                            <Button label="Refresh" icon="pi pi-refresh" className="p-button-outlined border-white text-white hover:bg-white-alpha-20" onClick={loadDashboardData} />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Quick Stats */}
            {quickStats.map((stat, index) => (
                <div key={index} className="col-12 md:col-6 lg:col-4 xl:col-2">
                    <Card className="mb-0 hover:shadow-4 transition-duration-200">
                        <div className="flex justify-content-between mb-3">
                            <div className="flex-1">
                                <span className="block text-500 font-medium mb-2">{stat.label}</span>
                                <div className="text-900 font-bold text-2xl">{stat.value}</div>
                                <small className={`text-${stat.trend.startsWith('+') ? 'green' : stat.trend.startsWith('-') ? 'red' : 'gray'}-600`}>{stat.trend} from last week</small>
                            </div>
                            <div className={`flex align-items-center justify-content-center bg-${stat.color}-100 border-round-lg`} style={{ width: '3rem', height: '3rem' }}>
                                <i className={`pi ${stat.icon} text-${stat.color}-500 text-2xl`}></i>
                            </div>
                        </div>
                    </Card>
                </div>
            ))}

            {/* Main Content - Two Column Layout */}
            {/*<div className="col-12 lg:col-8">*/}
            {/*    <Card>*/}
            {/*        <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>*/}
            {/*            /!* Today's Semen Analyses *!/*/}
            {/*            <TabPanel header="Semen Analyses" leftIcon="pi pi-check-circle mr-2">*/}
            {/*                <div className="flex justify-content-between align-items-center mb-3">*/}
            {/*                    <h4 className="m-0">Recent Analyses</h4>*/}
            {/*                    <Button*/}
            {/*                        label="New Analysis"*/}
            {/*                        icon="pi pi-plus"*/}
            {/*                        size="small"*/}
            {/*                        onClick={() => router.push('/hospital/lab/semen')}*/}
            {/*                    />*/}
            {/*                </div>*/}
            {/*                <DataTable*/}
            {/*                    value={recentSemenAnalyses}*/}
            {/*                    loading={loading}*/}
            {/*                    paginator*/}
            {/*                    rows={5}*/}
            {/*                    emptyMessage="No semen analyses found"*/}
            {/*                    className="p-datatable-sm"*/}
            {/*                >*/}
            {/*                    <Column field="labId" header="Lab ID" style={{ width: '15%' }} />*/}
            {/*                    <Column field="patientId" header="Patient ID" style={{ width: '10%' }} />*/}
            {/*                    <Column*/}
            {/*                        field="collectionDate"*/}
            {/*                        header="Collection Date"*/}
            {/*                        body={(rowData) => dateBodyTemplate(rowData, 'collectionDate')}*/}
            {/*                        style={{ width: '15%' }}*/}
            {/*                    />*/}
            {/*                    <Column*/}
            {/*                        field="microscopicExamination.concentration"*/}
            {/*                        header="Concentration"*/}
            {/*                        body={(rowData) => rowData.microscopicExamination?.concentration || '-'}*/}
            {/*                        style={{ width: '15%' }}*/}
            {/*                    />*/}
            {/*                    <Column*/}
            {/*                        field="microscopicExamination.progressiveMotility"*/}
            {/*                        header="Motility"*/}
            {/*                        body={(rowData) => rowData.microscopicExamination?.progressiveMotility || '-'}*/}
            {/*                        style={{ width: '10%' }}*/}
            {/*                    />*/}
            {/*                    <Column field="status" header="Status" body={statusBodyTemplate} style={{ width: '12%' }} />*/}
            {/*                    <Column*/}
            {/*                        header="Actions"*/}
            {/*                        body={(rowData) => actionsBodyTemplate(rowData, 'semen')}*/}
            {/*                        style={{ width: '15%' }}*/}
            {/*                    />*/}
            {/*                </DataTable>*/}
            {/*            </TabPanel>*/}

            {/*            /!* Pending IVF Assessments *!/*/}
            {/*            <TabPanel header="IVF Assessments" leftIcon="pi pi-circle mr-2">*/}
            {/*                <div className="flex justify-content-between align-items-center mb-3">*/}
            {/*                    <h4 className="m-0">Active IVF Cycles</h4>*/}
            {/*                    <Button*/}
            {/*                        label="New Assessment"*/}
            {/*                        icon="pi pi-plus"*/}
            {/*                        size="small"*/}
            {/*                        onClick={() => router.push('/hospital/lab/ivf-embryo')}*/}
            {/*                    />*/}
            {/*                </div>*/}
            {/*                <DataTable*/}
            {/*                    value={pendingIVFAssessments}*/}
            {/*                    loading={loading}*/}
            {/*                    paginator*/}
            {/*                    rows={5}*/}
            {/*                    emptyMessage="No pending IVF assessments"*/}
            {/*                    className="p-datatable-sm"*/}
            {/*                >*/}
            {/*                    <Column field="ivfEmbryoAssessmentId" header="Assessment ID" style={{ width: '15%' }} />*/}
            {/*                    <Column field="patientId" header="Patient ID" style={{ width: '12%' }} />*/}
            {/*                    <Column*/}
            {/*                        field="dateOfCycle"*/}
            {/*                        header="Cycle Date"*/}
            {/*                        body={(rowData) => dateBodyTemplate(rowData, 'dateOfCycle')}*/}
            {/*                        style={{ width: '15%' }}*/}
            {/*                    />*/}
            {/*                    <Column*/}
            {/*                        field="typeOfIVFCycle"*/}
            {/*                        header="Type"*/}
            {/*                        body={(rowData) => rowData.typeOfIVFCycle?.join(', ') || '-'}*/}
            {/*                        style={{ width: '15%' }}*/}
            {/*                    />*/}
            {/*                    <Column field="numberOfOocytesRetrieved" header="Oocytes" style={{ width: '10%' }} />*/}
            {/*                    <Column*/}
            {/*                        header="Actions"*/}
            {/*                        body={(rowData) => actionsBodyTemplate(rowData, 'ivf')}*/}
            {/*                        style={{ width: '15%' }}*/}
            {/*                    />*/}
            {/*                </DataTable>*/}
            {/*            </TabPanel>*/}

            {/*            /!* Cryopreservation Status *!/*/}
            {/*            <TabPanel header="Cryopreservation" leftIcon="pi pi-box mr-2">*/}
            {/*                <div className="flex justify-content-between align-items-center mb-3">*/}
            {/*                    <h4 className="m-0">Tank Alerts & Monitoring</h4>*/}
            {/*                    <Button*/}
            {/*                        label="Manage Tanks"*/}
            {/*                        icon="pi pi-cog"*/}
            {/*                        size="small"*/}
            {/*                        onClick={() => router.push('/hospital/lab/embryo-cryopreservation')}*/}
            {/*                    />*/}
            {/*                </div>*/}

            {/*                {cryoAlerts.length > 0 ? (*/}
            {/*                    <div className="grid">*/}
            {/*                        {cryoAlerts.map((alert) => (*/}
            {/*                            <div key={alert.tankId} className="col-12">*/}
            {/*                                <Card className="mb-2 border-left-3" style={{ borderLeftColor: alert.severity === 'high' ? '#EF4444' : alert.severity === 'medium' ? '#F59E0B' : '#3B82F6' }}>*/}
            {/*                                    <div className="flex justify-content-between align-items-start">*/}
            {/*                                        <div className="flex-1">*/}
            {/*                                            <div className="flex align-items-center gap-2 mb-2">*/}
            {/*                                                <i className={`pi pi-exclamation-triangle text-${alertSeverityColor(alert.severity)}-500`}></i>*/}
            {/*                                                <span className="font-semibold text-lg">{alert.tankName}</span>*/}
            {/*                                                <Tag value={alert.alertType} severity={alertSeverityColor(alert.severity) as any} />*/}
            {/*                                            </div>*/}
            {/*                                            <p className="text-600 mb-2">{alert.message}</p>*/}
            {/*                                            <small className="text-500">Action required in {alert.daysUntilAction} days</small>*/}
            {/*                                        </div>*/}
            {/*                                        <Button*/}
            {/*                                            label="Resolve"*/}
            {/*                                            size="small"*/}
            {/*                                            outlined*/}
            {/*                                            onClick={() => {*/}
            {/*                                                toast.current?.show({*/}
            {/*                                                    severity: 'info',*/}
            {/*                                                    summary: 'Alert',*/}
            {/*                                                    detail: 'Resolving alert...',*/}
            {/*                                                    life: 2000*/}
            {/*                                                });*/}
            {/*                                            }}*/}
            {/*                                        />*/}
            {/*                                    </div>*/}
            {/*                                </Card>*/}
            {/*                            </div>*/}
            {/*                        ))}*/}
            {/*                    </div>*/}
            {/*                ) : (*/}
            {/*                    <div className="text-center p-5">*/}
            {/*                        <i className="pi pi-check-circle text-green-500 text-5xl mb-3"></i>*/}
            {/*                        <p className="text-600">All tanks operating normally</p>*/}
            {/*                    </div>*/}
            {/*                )}*/}

            {/*                <Divider />*/}

            {/*                <div className="grid">*/}
            {/*                    <div className="col-12 md:col-6">*/}
            {/*                        <div className="p-3 surface-100 border-round">*/}
            {/*                            <span className="text-600 font-medium">Embryo Tanks</span>*/}
            {/*                            <div className="text-2xl font-bold text-blue-600 mt-2">4 Active</div>*/}
            {/*                            <ProgressBar value={75} showValue={false} className="mt-2" style={{ height: '6px' }} />*/}
            {/*                            <small className="text-500">75% capacity</small>*/}
            {/*                        </div>*/}
            {/*                    </div>*/}
            {/*                    <div className="col-12 md:col-6">*/}
            {/*                        <div className="p-3 surface-100 border-round">*/}
            {/*                            <span className="text-600 font-medium">Sperm Tanks</span>*/}
            {/*                            <div className="text-2xl font-bold text-purple-600 mt-2">3 Active</div>*/}
            {/*                            <ProgressBar value={60} showValue={false} className="mt-2" style={{ height: '6px' }} color="#8B5CF6" />*/}
            {/*                            <small className="text-500">60% capacity</small>*/}
            {/*                        </div>*/}
            {/*                    </div>*/}
            {/*                </div>*/}
            {/*            </TabPanel>*/}
            {/*        </TabView>*/}
            {/*    </Card>*/}
            {/*</div>*/}

            {/* Right Sidebar */}
            {/*<div className="col-12 lg:col-4">*/}
            {/*    /!* Recent Activities Timeline *!/*/}
            {/*    <Card title="Today's Activity" className="mb-3">*/}
            {/*        <Timeline*/}
            {/*            value={recentActivities}*/}
            {/*            content={(item) => (*/}
            {/*                <div className="flex flex-column">*/}
            {/*                    <div className="flex align-items-center gap-2">*/}
            {/*                        <i className={`pi ${item.icon}`} style={{ color: item.color }}></i>*/}
            {/*                        <span className="text-sm font-medium">{item.activity}</span>*/}
            {/*                    </div>*/}
            {/*                    <small className="text-500 mt-1">{item.time}</small>*/}
            {/*                </div>*/}
            {/*            )}*/}
            {/*            marker={(item) => (*/}
            {/*                <span*/}
            {/*                    className="flex align-items-center justify-content-center border-circle border-2"*/}
            {/*                    style={{*/}
            {/*                        width: '2rem',*/}
            {/*                        height: '2rem',*/}
            {/*                        backgroundColor: item.color,*/}
            {/*                        borderColor: item.color*/}
            {/*                    }}*/}
            {/*                >*/}
            {/*                    <i className={`pi ${item.icon} text-white text-sm`}></i>*/}
            {/*                </span>*/}
            {/*            )}*/}
            {/*            className="customized-timeline"*/}
            {/*        />*/}
            {/*        <Button*/}
            {/*            label="View All Activities"*/}
            {/*            icon="pi pi-arrow-right"*/}
            {/*            iconPos="right"*/}
            {/*            className="w-full mt-3"*/}
            {/*            outlined*/}
            {/*            size="small"*/}
            {/*        />*/}
            {/*    </Card>*/}

            {/*    /!* Quick Stats Card *!/*/}
            {/*    <Card title="Quality Metrics" className="mb-3">*/}
            {/*        <div className="flex flex-column gap-3">*/}
            {/*            <div>*/}
            {/*                <div className="flex justify-content-between align-items-center mb-2">*/}
            {/*                    <span className="text-600">Fertilization Rate</span>*/}
            {/*                    <span className="font-bold text-green-600">87%</span>*/}
            {/*                </div>*/}
            {/*                <ProgressBar value={87} showValue={false} color="#22C55E" style={{ height: '8px' }} />*/}
            {/*            </div>*/}
            {/*            <div>*/}
            {/*                <div className="flex justify-content-between align-items-center mb-2">*/}
            {/*                    <span className="text-600">Blastocyst Development</span>*/}
            {/*                    <span className="font-bold text-blue-600">72%</span>*/}
            {/*                </div>*/}
            {/*                <ProgressBar value={72} showValue={false} color="#3B82F6" style={{ height: '8px' }} />*/}
            {/*            </div>*/}
            {/*            <div>*/}
            {/*                <div className="flex justify-content-between align-items-center mb-2">*/}
            {/*                    <span className="text-600">Cryopreservation Success</span>*/}
            {/*                    <span className="font-bold text-purple-600">95%</span>*/}
            {/*                </div>*/}
            {/*                <ProgressBar value={95} showValue={false} color="#8B5CF6" style={{ height: '8px' }} />*/}
            {/*            </div>*/}
            {/*            <div>*/}
            {/*                <div className="flex justify-content-between align-items-center mb-2">*/}
            {/*                    <span className="text-600">Sperm Quality (Normal)</span>*/}
            {/*                    <span className="font-bold text-orange-600">68%</span>*/}
            {/*                </div>*/}
            {/*                <ProgressBar value={68} showValue={false} color="#F59E0B" style={{ height: '8px' }} />*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*    </Card>*/}
            {/*</div>*/}

            {/* Charts Row */}
            {/*<div className="col-12 lg:col-7">*/}
            {/*    <Card title="Weekly Lab Workload">*/}
            {/*        <Chart type="bar" data={weeklyWorkload} options={chartOptions} height="300px" />*/}
            {/*    </Card>*/}
            {/*</div>*/}

            {/*<div className="col-12 lg:col-5">*/}
            {/*    <Card title="Assessment Distribution">*/}
            {/*        <Chart type="doughnut" data={assessmentDistribution} options={chartOptions} height="300px" />*/}
            {/*    </Card>*/}
            {/*</div>*/}

            {/* Quick Actions */}
            <div className="col-12">
                <Card>
                    <h4 className="mt-0 mb-3">Quick Actions</h4>
                    <div className="grid">
                        {quickActions.map((action, index) => (
                            <div key={index} className="col-12 md:col-6 lg:col-4 xl:col-2">
                                <Button label={action.label} icon={action.icon} className={`w-full p-button-${action.color}`} onClick={() => router.push(action.route)} />
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default EmbryologistDashboard;
