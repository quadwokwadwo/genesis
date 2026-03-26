'use client';
import React, { forwardRef } from 'react';
import { differenceInYears } from 'date-fns';
import { changeDateFormat } from '@/libs/utils';
import { IBlastocystImage, TIVFAssessmentData } from '@/types/ivf/ivf';
import { TPatient } from '@/types/hospital';
import { Image } from 'primereact/image';

type Props = {
    data: TIVFAssessmentData;
    patientsList: TPatient[];
    selectedPatient?: TPatient | null;
};

// Use shared resolver to ensure correct host for production-served images
const { resolveEmbryoImageSrc } = require('@/libs/utils');
const resolveImageSrc = (imageUrl: string): string => resolveEmbryoImageSrc(imageUrl);

const IVFEmbryoPrint = forwardRef<HTMLDivElement, Props>(({ data, patientsList, selectedPatient }, ref) => {
    const getPatientById = (patientId?: number | null): TPatient | null => {
        if (!patientId) return null;
        const p = patientsList.find((px) => px.patientId === patientId);
        return p ?? null;
    };

    const p = selectedPatient ?? getPatientById(data?.patientId as any);
    const age = p?.dateOfBirth ? differenceInYears(new Date(), new Date(p.dateOfBirth)) : undefined;

    const typeOfIVFCycle = Array.isArray(data?.typeOfIVFCycle)
        ? data.typeOfIVFCycle
        : typeof data?.typeOfIVFCycle === 'string' && data.typeOfIVFCycle
        ? (() => {
              try {
                  return JSON.parse(data.typeOfIVFCycle as any);
              } catch {
                  return [] as string[];
              }
          })()
        : [];

    const zygotes = data?.fertilizationAssessment?.zygoteInfo || [];
    const blastocysts = data?.blastoCystAssessment?.blastocysts || [];
    const images = (data?.blastoCystAssessment?.images || []) as any[];

    return (
        <div ref={ref as any} style={{ width: '210mm', padding: '16mm', background: '#fff', color: '#000', fontFamily: 'sans-serif' }}>
            <h2 style={{ margin: 0, padding: 0, textAlign: 'center' }}>IVF Embryo Assessment Report</h2>
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
                </div>
            </div>

            <div style={{ marginTop: 16 }}>
                <h3 style={{ margin: '8px 0' }}>Cycle Information</h3>
                <div style={{ fontSize: 14 }}>
                    <div>
                        <strong>Date of Cycle:</strong> {data?.dateOfCycle ? changeDateFormat(new Date(data.dateOfCycle)) : '—'}
                    </div>
                    <div>
                        <strong>Type of IVF Cycle:</strong> {typeOfIVFCycle.join(', ') || '—'}
                    </div>
                    <div>
                        <strong>Oocytes Retrieved:</strong> {data?.numberOfOocytesRetrieved ?? '—'}
                    </div>
                </div>
            </div>

            <div style={{ marginTop: 16 }}>
                <h3 style={{ margin: '8px 0' }}>Fertilization Assessment</h3>
                <div style={{ fontSize: 14, marginBottom: 8 }}>
                    <div>
                        <strong>Embryologist Notes:</strong> {data?.fertilizationAssessment?.embryologistNotes || '—'}
                    </div>
                </div>
                {zygotes.length > 0 && (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                            <tr>
                                <th style={{ border: '1px solid #ccc', padding: 6, textAlign: 'left' }}>Zygote #</th>
                                <th style={{ border: '1px solid #ccc', padding: 6, textAlign: 'left' }}>Date & Time</th>
                                <th style={{ border: '1px solid #ccc', padding: 6, textAlign: 'left' }}>Pronuclei</th>
                                <th style={{ border: '1px solid #ccc', padding: 6, textAlign: 'left' }}>Polar Bodies</th>
                            </tr>
                        </thead>
                        <tbody>
                            {zygotes.map((z: any, i: number) => (
                                <tr key={i}>
                                    <td style={{ border: '1px solid #eee', padding: 6 }}>{z.zygoteNumber || '—'}</td>
                                    <td style={{ border: '1px solid #eee', padding: 6 }}>{z.time ? changeDateFormat(new Date(z.time)) : '—'}</td>
                                    <td style={{ border: '1px solid #eee', padding: 6 }}>{z.pronuclei || '—'}</td>
                                    <td style={{ border: '1px solid #eee', padding: 6 }}>{z.polarBodies || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div style={{ marginTop: 16 }}>
                <h3 style={{ margin: '8px 0' }}>Blastocyst Assessment</h3>
                <div style={{ fontSize: 14, marginBottom: 8 }}>
                    <div>
                        <strong>Embryologist Notes:</strong> {data?.blastoCystAssessment?.embryologistNotes || '—'}
                    </div>
                </div>
                {blastocysts.length > 0 && (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 8 }}>
                        <thead>
                            <tr>
                                <th style={{ border: '1px solid #ccc', padding: 6, textAlign: 'left' }}>Blastocyst #</th>
                                <th style={{ border: '1px solid #ccc', padding: 6, textAlign: 'left' }}>Day</th>
                                <th style={{ border: '1px solid #ccc', padding: 6, textAlign: 'left' }}>Date & Time</th>
                                <th style={{ border: '1px solid #ccc', padding: 6, textAlign: 'left' }}>Gardner Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {blastocysts.map((b: any, i: number) => (
                                <tr key={i}>
                                    <td style={{ border: '1px solid #eee', padding: 6 }}>{b.blastocystNumber || '—'}</td>
                                    <td style={{ border: '1px solid #eee', padding: 6 }}>{b.day || '—'}</td>
                                    <td style={{ border: '1px solid #eee', padding: 6 }}>{b.time ? changeDateFormat(new Date(b.time)) : '—'}</td>
                                    <td style={{ border: '1px solid #eee', padding: 6 }}>{b.gardnerGrade || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Images grid */}
                {images.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 8 }}>
                        {images.map((img: any, idx: number) => {
                            const imageObj: IBlastocystImage = typeof img === 'string' ? { imageUrl: img, gardnerGrade: '' } : (img as IBlastocystImage);
                            return (
                                <div key={idx} style={{ border: '1px solid #ddd', padding: 8 }}>
                                    <Image
                                        src={resolveImageSrc(imageObj.imageUrl)}
                                        alt={`Blastocyst ${idx + 1}`}
                                        style={{
                                            width: '100%',
                                            height: '180px',
                                            maxHeight: '180px',
                                            objectFit: 'contain',
                                            display: 'block'
                                        }}
                                    />
                                    {imageObj.gardnerGrade && (
                                        <div style={{ fontSize: 12, marginTop: 4 }}>
                                            <strong>Gardner Grade:</strong> {imageObj.gardnerGrade}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div style={{ marginTop: 16 }}>
                <h3 style={{ margin: '8px 0' }}>Embryo Transfer</h3>
                <div style={{ fontSize: 14 }}>
                    <div>
                        <strong>Transfer Date:</strong> {data?.embryoTransfer?.transferDate ? changeDateFormat(new Date(data.embryoTransfer.transferDate)) : '—'}
                    </div>
                    <div>
                        <strong>Day of Transfer:</strong> {data?.embryoTransfer?.dateOfTransfer || '—'}
                    </div>
                    <div>
                        <strong>Number Transferred:</strong> {data?.embryoTransfer?.numberTransferred ?? '—'}
                    </div>
                    <div>
                        <strong>Notes:</strong> {data?.embryoTransfer?.notes || '—'}
                    </div>
                </div>
            </div>

            <div style={{ marginTop: 16 }}>
                <h3 style={{ margin: '8px 0' }}>Cryopreservation</h3>
                <div style={{ fontSize: 14 }}>
                    <div>
                        <strong>Date:</strong> {data?.cryoPreservation?.cryoDate ? changeDateFormat(new Date(data.cryoPreservation.cryoDate)) : '—'}
                    </div>
                    <div>
                        <strong>Day of Cryo:</strong> {data?.cryoPreservation?.dayOfCryo || '—'}
                    </div>
                    <div>
                        <strong>Embryo IDs:</strong> {data?.cryoPreservation?.embryoIds || '—'}
                    </div>
                    <div>
                        <strong>Method:</strong> {data?.cryoPreservation?.method || '—'}
                    </div>
                    <div>
                        <strong>Number Preserved:</strong> {data?.cryoPreservation?.numberPreserved ?? '—'}
                    </div>
                    <div>
                        <strong>Storage Location:</strong> {data?.cryoPreservation?.storageLocation || '—'}
                    </div>
                </div>
            </div>
        </div>
    );
});

IVFEmbryoPrint.displayName = 'IVFEmbryoPrint';

export default IVFEmbryoPrint;
