'use client';

import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { HrPayrollService } from '@/libs/blue_prints/HrService';
import { HrCountryConfig, HrTaxBand } from '@/types/hr/hr';

const CountryConfigPage = () => {
    const [configs, setConfigs] = useState<HrCountryConfig[]>([]);
    const [bands, setBands] = useState<HrTaxBand[]>([]);
    const [activeCfg, setActiveCfg] = useState<HrCountryConfig | null>(null);
    const [loading, setLoading] = useState(true);

    const load = async () => { setLoading(true); const r = await HrPayrollService.listCountryConfigs(); setConfigs(Array.isArray(r.operatedData) ? r.operatedData : []); setLoading(false); };
    useEffect(() => { document.title = 'Payroll · Country Config'; void load(); }, []);

    const showBands = async (c: HrCountryConfig) => {
        setActiveCfg(c);
        const r = await HrPayrollService.listTaxBands(c.configId);
        setBands(Array.isArray(r.operatedData) ? r.operatedData : []);
    };

    return (
        <div className="grid">
            <div className="col-12">
                <Card title="Country Configuration" subTitle="Statutory tax / PAYE settings per country">
                    <DataTable value={configs} loading={loading} dataKey="configId" stripedRows responsiveLayout="scroll">
                        <Column field="countryCode" header="Code" />
                        <Column field="countryName" header="Name" />
                        <Column field="currencyCode" header="Currency" />
                        <Column field="taxCalculationMethod" header="Method" />
                        <Column field="flatTaxRate" header="Flat Rate" body={(r: HrCountryConfig) => (r.flatTaxRate == null ? '—' : `${Number(r.flatTaxRate).toFixed(2)}%`)} />
                        <Column field="effectiveFrom" header="From" body={(r: HrCountryConfig) => new Date(r.effectiveFrom).toLocaleDateString()} />
                        <Column field="effectiveUntil" header="Until" body={(r: HrCountryConfig) => (r.effectiveUntil ? new Date(r.effectiveUntil).toLocaleDateString() : '—')} />
                        <Column field="bandCount" header="Bands" />
                        <Column header="Active" body={(r: HrCountryConfig) => <Tag severity={r.isActive ? 'success' : 'danger'} value={r.isActive ? 'Active' : 'Inactive'} />} />
                        <Column header="Tax Bands" body={(r: HrCountryConfig) => <Button label="View" icon="pi pi-list" size="small" outlined onClick={() => showBands(r)} />} />
                    </DataTable>
                </Card>
            </div>

            {activeCfg && (
                <div className="col-12">
                    <Card title={`Tax Bands — ${activeCfg.countryName}`} subTitle="Progressive PAYE brackets">
                        <DataTable value={bands} dataKey="bandId" stripedRows responsiveLayout="scroll">
                            <Column field="bandOrder" header="Order" />
                            <Column field="lowerLimit" header="From" body={(r: HrTaxBand) => Number(r.lowerLimit).toFixed(2)} />
                            <Column field="upperLimit" header="To" body={(r: HrTaxBand) => (r.upperLimit == null ? '∞' : Number(r.upperLimit).toFixed(2))} />
                            <Column field="rate" header="Rate" body={(r: HrTaxBand) => `${Number(r.rate).toFixed(2)}%`} />
                            <Column field="description" header="Description" />
                        </DataTable>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default CountryConfigPage;
