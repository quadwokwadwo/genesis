import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { DataView, DataViewLayoutOptions, DataViewLayoutOptionsChangeEvent } from 'primereact/dataview';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Timeline } from 'primereact/timeline';
import { Avatar } from 'primereact/avatar';
import { Panel } from 'primereact/panel';
import { Divider } from 'primereact/divider';
import { Badge } from 'primereact/badge';
import { ScrollPanel } from 'primereact/scrollpanel';
import { Tooltip } from 'primereact/tooltip';
import { TPreviousVisit, TPatientVisitRecord, TFollowupRecord, TVisitRecord, TPatientFollowupVisit, PrescriptionRecord, DiagnosisRecord, InvestigationRecord } from '@/types/hospital';
import { changeDateFormat } from '@/libs/utils';
import { useFollowupContext } from '@/libs/contextProviders/AppContexts';

interface PreviousVisitsDisplayProps {
    visits: TPreviousVisit[];
    loading?: boolean;
    showPatientInfo?: boolean;
    onVisitSelect?: (visit: TPreviousVisit) => void;
    clickToViewLabs?: () => void;
    className?: string;
}

const PreviousVisitsDisplay: React.FC<PreviousVisitsDisplayProps> = ({ visits, loading = false, showPatientInfo = true, onVisitSelect, className = '', clickToViewLabs }) => {
    const [layout, setLayout] = useState<'list' | 'grid'>('list');
    const [selectedVisit, setSelectedVisit] = useState<TPreviousVisit | null>(null);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

    // Helper function to determine if visit data is a regular visit or followup
    const isFollowupVisit = (visitType: string): boolean => {
        return visitType?.toLowerCase().includes('followup') || visitType?.toLowerCase().includes('follow-up');
    };

    // Helper function to get visit recordings based on type
    const getVisitRecordings = (visit: TPreviousVisit): TVisitRecord | TPatientFollowupVisit => {
        const { visitData } = visit;

        if (typeof visitData.visitRecordings === 'string') {
            try {
                return JSON.parse(visitData.visitRecordings);
            } catch {
                return {} as any;
            }
        }
        return visitData.visitRecordings;
    };

    // Helper function to get patient info
    const getPatientInfo = (visitData: TPatientVisitRecord | TFollowupRecord) => {
        if (visitData.patient && typeof visitData.patient !== 'string') {
            return visitData.patient;
        }
        return {
            firstName: visitData.patientName?.split(' ')[0] || 'Unknown',
            lastName: visitData.patientName?.split(' ').slice(1).join(' ') || 'Patient'
        };
    };

    // Helper function to format visit date
    const formatVisitDate = (date: Date | string | undefined): string => {
        if (!date) return 'Unknown Date';
        const visitDate = typeof date === 'string' ? new Date(date) : date;
        return changeDateFormat(visitDate);
    };

    // Helper function to get visit status color
    const getStatusSeverity = (status?: string): 'success' | 'info' | 'warning' | 'danger' => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'success';
            case 'Consultation':
                return 'warning';
            case 'Accounts':
                return 'danger';
            default:
                return 'info';
        }
    };

    // Helper function to toggle card expansion
    const toggleCardExpansion = (visitId: number) => {
        const newExpanded = new Set(expandedCards);
        if (newExpanded.has(visitId)) {
            newExpanded.delete(visitId);
        } else {
            newExpanded.add(visitId);
        }
        setExpandedCards(newExpanded);
    };

    // Render regular visit content
    const renderRegularVisitContent = (recordings: TVisitRecord, isExpanded: boolean) => {
        if (!isExpanded) return null;

        return (
            <div className="mt-3">
                <div className="grid">
                    {/* Chief Complaint */}
                    {recordings.chiefComplaintChecks && (
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="font-semibold text-sm">Chief Complaint:</label>
                                <div className="mt-1">
                                    {recordings.chiefComplaintChecks.infertility && <Tag value="Infertility" severity="info" className="mr-1 mb-1" />}
                                    {recordings.chiefComplaintChecks.anc && <Tag value="ANC" severity="success" className="mr-1 mb-1" />}
                                    {recordings.chiefComplaintChecks.chiefComplaint && <p className="text-sm mt-2">{recordings.chiefComplaintChecks.chiefComplaint}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Diagnoses */}
                    {recordings.diagnoses && recordings.diagnoses.length > 0 && (
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="font-semibold text-sm">Diagnoses:</label>
                                <div className="mt-1">
                                    {recordings.diagnoses.slice(0, 3).map((diagnosis: DiagnosisRecord, index) => (
                                        <Tag key={index} value={diagnosis.description} severity="warning" className="mr-1 mb-1" />
                                    ))}
                                    {recordings.diagnoses.length > 3 && <Badge value={`+${recordings.diagnoses.length - 3}`} severity="info" />}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Prescriptions */}
                    {recordings.prescriptions && recordings.prescriptions.length > 0 && (
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="font-semibold text-sm">Medications:</label>
                                <div className="mt-1">
                                    {recordings.prescriptions.slice(0, 3).map((prescription: PrescriptionRecord, index) => (
                                        <Tag key={index} value={prescription.medicationName || 'Medication'} severity="success" className="mr-1 mb-1" />
                                    ))}
                                    {recordings.prescriptions.length > 3 && <Badge value={`+${recordings.prescriptions.length - 3}`} severity="success" />}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Investigations */}
                    {recordings.investigations && recordings.investigations.length > 0 && (
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="font-semibold text-sm">Investigations:</label>
                                <div className="mt-1">
                                    {recordings.investigations.slice(0, 3).map((investigation: InvestigationRecord, index) => (
                                        <Tag key={index} value={investigation.testName} severity="info" className="mr-1 mb-1" />
                                    ))}
                                    {recordings.investigations.length > 3 && <Badge value={`+${recordings.investigations.length - 3}`} severity="info" />}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Physical Examination */}
                    {recordings.physicalExam && (
                        <div className="col-12">
                            <Divider />
                            <div className="field">
                                <label className="font-semibold text-sm">Physical Examination:</label>
                                <div className="grid mt-2 text-sm">
                                    {recordings.physicalExam.weightKg && (
                                        <div className="col-6 md:col-3">
                                            <strong>Weight:</strong> {recordings.physicalExam.weightKg} kg
                                        </div>
                                    )}
                                    {recordings.physicalExam.heightCm && (
                                        <div className="col-6 md:col-3">
                                            <strong>Height:</strong> {recordings.physicalExam.heightCm} cm
                                        </div>
                                    )}
                                    {recordings.physicalExam.bmi && (
                                        <div className="col-6 md:col-3">
                                            <strong>BMI:</strong> {recordings.physicalExam.bmi}
                                        </div>
                                    )}
                                    {recordings.physicalExam.bpSystolic && recordings.physicalExam.bpDiastolic && (
                                        <div className="col-6 md:col-3">
                                            <strong>BP:</strong> {recordings.physicalExam.bpSystolic}/{recordings.physicalExam.bpDiastolic} mmHg
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Render followup visit content
    const renderFollowupVisitContent = (recordings: TPatientFollowupVisit, isExpanded: boolean) => {
        if (!isExpanded) return null;

        return (
            <div className="mt-3">
                <div className="grid">
                    {/* Current Symptoms */}
                    {recordings.currentSymptoms && (
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="font-semibold text-sm">Current Symptoms:</label>
                                <div className="mt-1 text-sm">
                                    {recordings.currentSymptoms.presenting && (
                                        <p>
                                            <strong>Presenting:</strong> {recordings.currentSymptoms.presenting}
                                        </p>
                                    )}
                                    {recordings.currentSymptoms.duration && (
                                        <p>
                                            <strong>Duration:</strong> {recordings.currentSymptoms.duration}
                                        </p>
                                    )}
                                    {recordings.currentSymptoms.improvement && <Tag value={recordings.currentSymptoms.improvement} severity={recordings.currentSymptoms.improvement.includes('Better') ? 'success' : 'warning'} className="mt-1" />}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Treatment Compliance */}
                    {recordings.treatmentCompliance && (
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="font-semibold text-sm">Treatment Compliance:</label>
                                <div className="mt-1 text-sm">
                                    {recordings.treatmentCompliance.medicationCompliance && (
                                        <Tag value={recordings.treatmentCompliance.medicationCompliance} severity={recordings.treatmentCompliance.medicationCompliance === 'Excellent' ? 'success' : 'warning'} className="mr-1" />
                                    )}
                                    {recordings.treatmentCompliance.missedDoses > 0 && (
                                        <p className="mt-1">
                                            <strong>Missed Doses:</strong> {recordings.treatmentCompliance.missedDoses}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Assessment */}
                    {recordings.assessment && (
                        <div className="col-12">
                            <Divider />
                            <div className="field">
                                <label className="font-semibold text-sm">Assessment:</label>
                                <div className="grid mt-2 text-sm">
                                    {recordings.assessment.clinicalImprovement && (
                                        <div className="col-12 md:col-6">
                                            <strong>Clinical Improvement:</strong>
                                            <Tag value={recordings.assessment.clinicalImprovement} severity={recordings.assessment.clinicalImprovement.includes('Significant') ? 'success' : 'info'} className="ml-2" />
                                        </div>
                                    )}
                                    {recordings.assessment.treatmentResponse && (
                                        <div className="col-12 md:col-6">
                                            <strong>Treatment Response:</strong>
                                            <Tag value={recordings.assessment.treatmentResponse} severity={recordings.assessment.treatmentResponse === 'Excellent' ? 'success' : 'warning'} className="ml-2" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Vital Signs */}
                    {recordings.vitalSigns && (
                        <div className="col-12">
                            <Divider />
                            <div className="field">
                                <label className="font-semibold text-sm">Vital Signs:</label>
                                <div className="grid mt-2 text-sm">
                                    {recordings.vitalSigns.weight && (
                                        <div className="col-6 md:col-3">
                                            <strong>Weight:</strong> {recordings.vitalSigns.weight} kg
                                        </div>
                                    )}
                                    {recordings.vitalSigns.height && (
                                        <div className="col-6 md:col-3">
                                            <strong>Height:</strong> {recordings.vitalSigns.height} cm
                                        </div>
                                    )}
                                    {recordings.vitalSigns.bloodPressure && (
                                        <div className="col-6 md:col-3">
                                            <strong>BP:</strong> {recordings.vitalSigns.bloodPressure}
                                        </div>
                                    )}
                                    {recordings.vitalSigns.heartRate && (
                                        <div className="col-6 md:col-3">
                                            <strong>HR:</strong> {recordings.vitalSigns.heartRate} bpm
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Render individual visit card
    const RenderVisitCard = ({ visit }: { visit: TPreviousVisit }) => {
        const { visitType, visitData } = visit;
        const patientInfo = getPatientInfo(visitData);
        const recordings = getVisitRecordings(visit);
        const isFollowup = isFollowupVisit(visitType);
        const visitId = visitData.visitId || Math.random();
        const isExpanded = expandedCards.has(visitId);

        return (
            <div className="grid p-fluid mr-2">
                <Card key={visitId} className="mb-3 shadow-2 hover:shadow-4 transition-all duration-200">
                    <div className="flex justify-content-between align-items-start mb-3">
                        <div className="flex align-items-center gap-3">
                            <Avatar label={`${patientInfo.firstName?.charAt(0) || 'U'}${patientInfo.lastName?.charAt(0) || 'P'}`} shape="circle" size="large" className={isFollowup ? 'bg-orange-500' : 'bg-blue-500'} />
                            <div>
                                <h6 className="m-0 text-primary font-semibold">{visitType}</h6>
                                <p className="text-600 text-sm m-0 mb-1">
                                    {formatVisitDate(visitData.visitDate)} • Dr. {visitData.doctorName || 'Unknown'}
                                </p>
                                {showPatientInfo && (
                                    <p className="text-800 text-sm m-0 font-medium">
                                        {patientInfo.firstName} {patientInfo.lastName}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex align-items-center gap-2">
                            {visitData.status && <Tag value={visitData.status} severity={getStatusSeverity(visitData.status)} />}
                            <Button icon={isExpanded ? 'pi pi-chevron-up' : 'pi pi-chevron-down'} className="p-button-text p-button-sm" onClick={() => toggleCardExpansion(visitId)} tooltip={isExpanded ? 'Collapse' : 'Expand'} />
                            <Button
                                icon="pi pi-eye"
                                className="p-button-text p-button-sm"
                                onClick={() => {
                                    setSelectedVisit(visit);
                                    setShowDetailDialog(true);
                                }}
                                tooltip="View Details"
                            />
                            {onVisitSelect && <Button icon="pi pi-check" className="p-button-text p-button-sm" onClick={() => onVisitSelect(visit)} tooltip="Select Visit" />}
                        </div>
                    </div>

                    {/* Visit Type Badge */}
                    <div className="mb-3">
                        <Tag icon={isFollowup ? 'pi pi-refresh' : 'pi pi-user-plus'} value={isFollowup ? 'Follow-up Visit' : 'Regular Visit'} severity={isFollowup ? 'warning' : 'info'} />
                    </div>

                    {/* Render visit content based on type */}
                    {isFollowup ? renderFollowupVisitContent(recordings as TPatientFollowupVisit, isExpanded) : renderRegularVisitContent(recordings as TVisitRecord, isExpanded)}
                </Card>
            </div>
        );
    };

    // Render list layout
    const renderListLayout = (visit: TPreviousVisit) => {
        return (
            <div>
                <RenderVisitCard visit={visit} />
            </div>
        );
    };

    // Render grid layout
    const renderGridLayout = (visit: TPreviousVisit) => {
        return (
            <div className="grid">
                <RenderVisitCard visit={visit} />
            </div>
        );
    };

    // Render detailed view dialog
    const renderDetailDialog = () => {
        if (!selectedVisit) return null;

        const { visitType, visitData } = selectedVisit;
        const patientInfo = getPatientInfo(visitData);
        const recordings = getVisitRecordings(selectedVisit);
        const isFollowup = isFollowupVisit(visitType);
        return (
            <Dialog
                header={
                    <div className="flex align-items-center gap-2">
                        <i className={isFollowup ? 'pi pi-refresh' : 'pi pi-user-plus'} />
                        <span>{visitType} - Detailed View</span>
                    </div>
                }
                visible={showDetailDialog}
                style={{ width: '90vw', maxWidth: '1000px' }}
                modal
                onHide={() => setShowDetailDialog(false)}
                maximizable
            >
                <div className="grid">
                    <div className="col-12 md:col-4">
                        <Card className="h-full">
                            <h6 className="text-primary mb-3">Patient Information</h6>
                            <div className="flex align-items-center gap-3 mb-3">
                                <Avatar label={`${patientInfo.firstName?.charAt(0) || 'U'}${patientInfo.lastName?.charAt(0) || 'P'}`} shape="circle" size="xlarge" className={isFollowup ? 'bg-orange-500' : 'bg-blue-500'} />
                                <div>
                                    <h6 className="m-0">
                                        {patientInfo.firstName} {patientInfo.lastName}
                                    </h6>
                                    <p className="text-600 text-sm m-0">{visitData.patientId && `ID: ${visitData.patientId}`}</p>
                                </div>
                            </div>
                            <div className="field">
                                <label className="font-semibold text-sm">Visit Date:</label>
                                <p className="m-0 text-sm">{formatVisitDate(visitData.visitDate)}</p>
                            </div>
                            <div className="field">
                                <label className="font-semibold text-sm">Doctor:</label>
                                <p className="m-0 text-sm">Dr. {visitData.doctorName || 'Unknown'}</p>
                            </div>
                            {visitData.status && (
                                <div className="field">
                                    <label className="font-semibold text-sm">Status:</label>
                                    <div className="mt-1">
                                        <Tag value={visitData.status} severity={getStatusSeverity(visitData.status)} />
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>

                    <div className="col-12 md:col-8">
                        <Card className="h-full">
                            <h6 className="text-primary mb-3">Visit Details</h6>
                            <ScrollPanel style={{ width: '100%', height: '400px' }}>{isFollowup ? renderFollowupVisitContent(recordings as TPatientFollowupVisit, true) : renderRegularVisitContent(recordings as TVisitRecord, true)}</ScrollPanel>
                        </Card>
                    </div>
                </div>
            </Dialog>
        );
    };

    // Empty state
    if (!visits || visits.length === 0) {
        return (
            <Card className={`text-center ${className}`}>
                <div className="py-6">
                    <i className="pi pi-history text-6xl text-400 mb-3" />
                    <h5 className="text-600 mb-2">No Previous Visits</h5>
                    <p className="text-500 text-sm">No visit history available for this patient.</p>
                </div>
            </Card>
        );
    }
    const onLayoutViewChange = (e: DataViewLayoutOptionsChangeEvent) => {
        setLayout(e.value === 'grid' ? 'grid' : 'list');
    };
    return (
        <div className={className}>
            <div className="flex justify-content-between align-items-center mb-4">
                <div className="flex align-items-center gap-2">
                    <i className="pi pi-history text-primary text-xl" />
                    <h5 className="text-primary m-0">Previous Visits ({visits.length})</h5>
                </div>
                <Button className="p-button-link" label="View Labs" onClick={clickToViewLabs} />
                <DataViewLayoutOptions layout={layout} onChange={onLayoutViewChange} />
            </div>

            <DataView value={visits} layout={layout} itemTemplate={layout === 'list' ? renderListLayout : renderGridLayout} loading={loading} emptyMessage="No visits found" className="custom-dataview"></DataView>

            {renderDetailDialog()}

            <Tooltip target=".p-button" />
        </div>
    );
};

export default PreviousVisitsDisplay;
