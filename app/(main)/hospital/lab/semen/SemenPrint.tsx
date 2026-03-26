'use client';
import React, { forwardRef } from 'react';
import { TSemenAnalysis } from '@/types/semen/semen';
import { TPatient } from '@/types/hospital';
import { differenceInYears } from 'date-fns';

type Props = {
    data: TSemenAnalysis;
    patientsList: TPatient[];
    selectedPatient?: TPatient | null;
};

const fmtDate = (v: any) => {
    if (!v) return '—';
    try {
        const d = typeof v === 'string' ? new Date(v) : v;
        if (!d || isNaN(d.getTime())) return '—';
        return d.toLocaleString();
    } catch {
        return '—';
    }
};

const safe = (val: any) => (val === null || val === undefined || val === '' ? '—' : String(val));

const SemenPrint = forwardRef<HTMLDivElement, Props>(({ data, patientsList, selectedPatient }, ref) => {
    const getPatientById = (patientId?: number | null): TPatient | null => {
        if (!patientId) return null;
        const p = patientsList.find((px) => px.patientId === patientId);
        return p ?? null;
    };

    const p = selectedPatient ?? getPatientById(data?.patientId as any);
    const age = p?.dateOfBirth ? differenceInYears(new Date(), new Date(p.dateOfBirth)) : undefined;

    const physical = typeof (data as any)?.physicalExamination === 'string' ? JSON.parse((data as any).physicalExamination) : data?.physicalExamination;
    const microscopic = typeof (data as any)?.microscopicExamination === 'string' ? JSON.parse((data as any).microscopicExamination) : data?.microscopicExamination;
    const motility = typeof (data as any)?.motilityCategories === 'string' ? JSON.parse((data as any).motilityCategories) : data?.motilityCategories;
    const addCells = typeof (data as any)?.additionalCells === 'string' ? JSON.parse((data as any).additionalCells) : data?.additionalCells;
    const findings = typeof (data as any)?.clinicalFindings === 'string' ? JSON.parse((data as any).clinicalFindings) : data?.clinicalFindings;

    return (
        <div ref={ref as any} style={{ width: '210mm', padding: '16mm', background: '#fff', color: '#000', fontFamily: 'sans-serif' }}>
            <h2 style={{ margin: 0, padding: 0, textAlign: 'center' }}>Semen Analysis Report</h2>

            {/* Patient Bio Data */}
            <div style={{ marginTop: 8, borderTop: '1px solid #ccc', paddingTop: 8 }}>
                <h3 style={{ margin: '8px 0' }}>Patient Bio Data</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 14 }}>
                    <div>
                        <strong>Name:</strong> {p ? `${p.firstName} ${p.lastName}` : '—'}
                    </div>
                    <div>
                        <strong>Record No:</strong> {p?.recordNumber ?? '—'}
                    </div>
                    <div>
                        <strong>Age:</strong> {age !== undefined ? `${age} yrs` : '—'}
                    </div>
                    <div>
                        <strong>Patient ID:</strong> {p?.patientId ?? '—'}
                    </div>
                </div>
            </div>

            {/* General Info */}
            <div style={{ marginTop: 16 }}>
                <h3 style={{ margin: '8px 0' }}>General Information</h3>
                <div style={{ fontSize: 14, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
                    <div>
                        <strong>Lab ID:</strong> {safe(data?.labId)}
                    </div>
                    <div>
                        <strong>Collection Method:</strong> {safe(data?.collectionMethod)}
                    </div>
                    <div>
                        <strong>Location:</strong> {safe(data?.location)}
                    </div>
                    <div>
                        <strong>Abstinence (days):</strong> {safe(data?.abstinence)}
                    </div>
                    <div>
                        <strong>Sample Completed:</strong> {data?.sampleCompleted ? 'Yes' : 'No'}
                    </div>
                    <div>
                        <strong>Status:</strong> {safe(data?.status)}
                    </div>
                </div>
            </div>

            {/* Dates */}
            <div style={{ marginTop: 16 }}>
                <h3 style={{ margin: '8px 0' }}>Dates</h3>
                <div style={{ fontSize: 14, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
                    <div>
                        <strong>Collection Date:</strong> {fmtDate(data?.collectionDate)}
                    </div>
                    <div>
                        <strong>Analysis Date:</strong> {fmtDate(data?.analysisDate)}
                    </div>
                    <div>
                        <strong>Report Date:</strong> {fmtDate(data?.reportDate)}
                    </div>
                </div>
            </div>

            {/* Physical Examination */}
            <div style={{ marginTop: 16 }}>
                <h3 style={{ margin: '8px 0' }}>Physical Examination</h3>
                <div style={{ fontSize: 14, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
                    <div>
                        <strong>Volume (ml):</strong> {safe(physical?.volume)}
                    </div>
                    <div>
                        <strong>Color:</strong> {safe(physical?.color)}
                    </div>
                    <div>
                        <strong>Liquefaction:</strong> {safe(physical?.liquefaction)}
                    </div>
                    <div>
                        <strong>pH:</strong> {safe(physical?.ph)}
                    </div>
                    <div>
                        <strong>Viscosity:</strong> {safe(physical?.viscosity)}
                    </div>
                    <div>
                        <strong>Odor:</strong> {safe(physical?.odor)}
                    </div>
                </div>
            </div>

            {/* Microscopic Examination */}
            <div style={{ marginTop: 16 }}>
                <h3 style={{ margin: '8px 0' }}>Microscopic Examination</h3>
                <div style={{ fontSize: 14, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
                    <div>
                        <strong>Concentration (million/ml):</strong> {safe(microscopic?.concentration)}
                    </div>
                    <div>
                        <strong>Progressive Motility (%):</strong> {safe(microscopic?.progressiveMotility)}
                    </div>
                    <div>
                        <strong>Normal Morphology (%):</strong> {safe(microscopic?.normalMorPhology)}
                    </div>
                    <div>
                        <strong>Total Motility (%):</strong> {safe(microscopic?.totalMotility)}
                    </div>
                    <div>
                        <strong>Vitality (%):</strong> {safe(microscopic?.vitality)}
                    </div>
                    <div>
                        <strong>Aggregation:</strong> {safe(microscopic?.aggregation)}
                    </div>
                    <div>
                        <strong>Total Sperm Count (million):</strong> {safe(microscopic?.totalSpermCount)}
                    </div>
                    <div>
                        <strong>Total Motile Sperm (million):</strong> {safe(microscopic?.totalMotileSperm)}
                    </div>
                    <div>
                        <strong>Progressive Motile Sperm (million):</strong> {safe(microscopic?.progressiveMotileSperm)}
                    </div>
                </div>
            </div>

            {/* Motility Categories */}
            <div style={{ marginTop: 16 }}>
                <h3 style={{ margin: '8px 0' }}>Motility Categories</h3>
                <div style={{ fontSize: 14, display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8 }}>
                    <div>
                        <strong>Category A:</strong> {safe(motility?.categoryA)}
                    </div>
                    <div>
                        <strong>Category B:</strong> {safe(motility?.categoryB)}
                    </div>
                    <div>
                        <strong>Category C:</strong> {safe(motility?.categoryC)}
                    </div>
                    <div>
                        <strong>Category D:</strong> {safe(motility?.categoryD)}
                    </div>
                </div>
            </div>

            {/* Additional Cells */}
            <div style={{ marginTop: 16 }}>
                <h3 style={{ margin: '8px 0' }}>Additional Cellular Components</h3>
                <div style={{ fontSize: 14, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
                    <div>
                        <strong>Peroxidase Positive Leukocytes:</strong> {safe(addCells?.peroxidasePositiveLeukocytes)}
                    </div>
                    <div>
                        <strong>Immature Cell:</strong> {safe(addCells?.immatureCell)}
                    </div>
                    <div>
                        <strong>Epithelial Cell:</strong> {safe(addCells?.epithelialCell)}
                    </div>
                    <div>
                        <strong>Erythrocyte:</strong> {safe(addCells?.erythrocyte)}
                    </div>
                </div>
            </div>

            {/* Clinical Findings */}
            <div style={{ marginTop: 16 }}>
                <h3 style={{ margin: '8px 0' }}>Clinical Findings & Recommendations</h3>
                <div style={{ fontSize: 14, display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
                    <div>
                        <strong>Interpretation:</strong> {safe(findings?.interpretation)}
                    </div>
                    <div>
                        <strong>Recommendation:</strong> {safe(findings?.recommendation)}
                    </div>
                    <div>
                        <strong>Technical Comments:</strong> {safe(findings?.technicalComments)}
                    </div>
                </div>
            </div>
        </div>
    );
});

SemenPrint.displayName = 'SemenPrint';

export default SemenPrint;
