'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import IntegrationService, { IntegrationRow } from '@/libs/blue_prints/IntegrationService';

type MnotifyForm = { apiKey: string; apiKeySet?: boolean; senderId: string; baseUrl: string };
type SmtpForm = { host: string; port: number; secure: boolean; user: string; pass: string; passSet?: boolean; fromName: string; fromEmail: string };

const IntegrationSettings = () => {
    const toast = useRef<Toast>(null);
    const [loading, setLoading] = useState(true);
    const [savingMnotify, setSavingMnotify] = useState(false);
    const [savingSmtp, setSavingSmtp] = useState(false);
    const [testing, setTesting] = useState<'mnotify' | 'smtp' | null>(null);

    const [mnotifyActive, setMnotifyActive] = useState(false);
    const [mnotify, setMnotify] = useState<MnotifyForm>({ apiKey: '', senderId: '', baseUrl: 'https://api.mnotify.com/api/sms/quick' });
    const [smsTestTo, setSmsTestTo] = useState('');

    const [smtpActive, setSmtpActive] = useState(false);
    const [smtp, setSmtp] = useState<SmtpForm>({ host: '', port: 465, secure: true, user: '', pass: '', fromName: '', fromEmail: '' });
    const [mailTestTo, setMailTestTo] = useState('');

    const hydrate = (rows: IntegrationRow[]) => {
        const m = rows.find((r) => r.provider === 'mnotify');
        const s = rows.find((r) => r.provider === 'smtp');
        if (m) {
            setMnotifyActive(m.isActive);
            setMnotify({ apiKey: '', apiKeySet: m.config.apiKeySet, senderId: m.config.senderId ?? '', baseUrl: m.config.baseUrl ?? 'https://api.mnotify.com/api/sms/quick' });
        }
        if (s) {
            setSmtpActive(s.isActive);
            setSmtp({ host: s.config.host ?? '', port: Number(s.config.port ?? 465), secure: Boolean(s.config.secure), user: s.config.user ?? '', pass: '', passSet: s.config.passSet, fromName: s.config.fromName ?? '', fromEmail: s.config.fromEmail ?? '' });
        }
    };

    useEffect(() => {
        IntegrationService.getIntegrations()
            .then(hydrate)
            .catch(() => toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to load integrations' }))
            .finally(() => setLoading(false));
    }, []);

    const saveMnotify = async () => {
        setSavingMnotify(true);
        try {
            // Leave apiKey blank to keep the stored value.
            const config: Record<string, any> = { senderId: mnotify.senderId, baseUrl: mnotify.baseUrl };
            if (mnotify.apiKey) config.apiKey = mnotify.apiKey;
            const rows = await IntegrationService.updateIntegration('mnotify', config, mnotifyActive);
            hydrate(rows);
            toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'mNotify settings saved' });
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to save mNotify settings' });
        } finally {
            setSavingMnotify(false);
        }
    };

    const saveSmtp = async () => {
        setSavingSmtp(true);
        try {
            const config: Record<string, any> = { host: smtp.host, port: smtp.port, secure: smtp.secure, user: smtp.user, fromName: smtp.fromName, fromEmail: smtp.fromEmail };
            if (smtp.pass) config.pass = smtp.pass;
            const rows = await IntegrationService.updateIntegration('smtp', config, smtpActive);
            hydrate(rows);
            toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'SMTP settings saved' });
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to save SMTP settings' });
        } finally {
            setSavingSmtp(false);
        }
    };

    const runTest = async (provider: 'mnotify' | 'smtp', to: string) => {
        if (!to) {
            toast.current?.show({ severity: 'warn', summary: 'Recipient required', detail: provider === 'mnotify' ? 'Enter a test phone number' : 'Enter a test email' });
            return;
        }
        setTesting(provider);
        try {
            await IntegrationService.testIntegration(provider, to);
            toast.current?.show({ severity: 'success', summary: 'Sent', detail: `Test ${provider === 'mnotify' ? 'SMS' : 'email'} sent` });
        } catch (e: any) {
            const detail = e?.response?.data?.message || 'Test failed — check your settings';
            toast.current?.show({ severity: 'error', summary: 'Test failed', detail });
        } finally {
            setTesting(null);
        }
    };

    if (loading) return <div className="p-4">Loading integrations…</div>;

    return (
        <div className="grid">
            <Toast ref={toast} />

            {/* mNotify SMS */}
            <div className="col-12 lg:col-6">
                <Card>
                    <div className="flex align-items-center justify-content-between mb-3">
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-comment text-primary text-xl" />
                            <span className="font-bold text-lg">mNotify SMS</span>
                        </div>
                        <div className="flex align-items-center gap-2">
                            <span className="text-sm text-600">Enabled</span>
                            <InputSwitch checked={mnotifyActive} onChange={(e) => setMnotifyActive(e.value as boolean)} />
                        </div>
                    </div>
                    <div className="field">
                        <label className="block text-sm font-medium mb-1">API Key {mnotify.apiKeySet && <span className="text-green-600 text-xs">(configured)</span>}</label>
                        <InputText value={mnotify.apiKey} onChange={(e) => setMnotify({ ...mnotify, apiKey: e.target.value })} placeholder={mnotify.apiKeySet ? '•••••••• (leave blank to keep)' : 'Enter mNotify API key'} className="w-full" />
                    </div>
                    <div className="field">
                        <label className="block text-sm font-medium mb-1">Sender ID</label>
                        <InputText value={mnotify.senderId} onChange={(e) => setMnotify({ ...mnotify, senderId: e.target.value })} placeholder="e.g. GENESIS" className="w-full" />
                    </div>
                    <div className="field">
                        <label className="block text-sm font-medium mb-1">Base URL</label>
                        <InputText value={mnotify.baseUrl} onChange={(e) => setMnotify({ ...mnotify, baseUrl: e.target.value })} className="w-full" />
                    </div>
                    <Button label="Save" icon="pi pi-save" onClick={saveMnotify} loading={savingMnotify} className="mt-2" />

                    <Divider />
                    <label className="block text-sm font-medium mb-1">Send test SMS to</label>
                    <div className="flex gap-2">
                        <InputText value={smsTestTo} onChange={(e) => setSmsTestTo(e.target.value)} placeholder="e.g. 0241234567" className="flex-1" />
                        <Button label="Test" icon="pi pi-send" outlined loading={testing === 'mnotify'} onClick={() => runTest('mnotify', smsTestTo)} />
                    </div>
                </Card>
            </div>

            {/* Google SMTP */}
            <div className="col-12 lg:col-6">
                <Card>
                    <div className="flex align-items-center justify-content-between mb-3">
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-envelope text-primary text-xl" />
                            <span className="font-bold text-lg">Email (Google SMTP)</span>
                        </div>
                        <div className="flex align-items-center gap-2">
                            <span className="text-sm text-600">Enabled</span>
                            <InputSwitch checked={smtpActive} onChange={(e) => setSmtpActive(e.value as boolean)} />
                        </div>
                    </div>
                    <div className="formgrid grid">
                        <div className="field col-8">
                            <label className="block text-sm font-medium mb-1">Host</label>
                            <InputText value={smtp.host} onChange={(e) => setSmtp({ ...smtp, host: e.target.value })} placeholder="smtp.gmail.com" className="w-full" />
                        </div>
                        <div className="field col-4">
                            <label className="block text-sm font-medium mb-1">Port</label>
                            <InputNumber value={smtp.port} onValueChange={(e) => setSmtp({ ...smtp, port: (e.value as number) ?? 465 })} useGrouping={false} className="w-full" />
                        </div>
                    </div>
                    <div className="field">
                        <label className="block text-sm font-medium mb-1">Username (Gmail address)</label>
                        <InputText value={smtp.user} onChange={(e) => setSmtp({ ...smtp, user: e.target.value })} placeholder="you@gmail.com" className="w-full" />
                    </div>
                    <div className="field">
                        <label className="block text-sm font-medium mb-1">Password / App Password {smtp.passSet && <span className="text-green-600 text-xs">(configured)</span>}</label>
                        <Password value={smtp.pass} onChange={(e) => setSmtp({ ...smtp, pass: e.target.value })} placeholder={smtp.passSet ? '•••••••• (leave blank to keep)' : 'Gmail App Password'} feedback={false} toggleMask inputClassName="w-full" className="w-full" />
                    </div>
                    <div className="formgrid grid">
                        <div className="field col-6">
                            <label className="block text-sm font-medium mb-1">From name</label>
                            <InputText value={smtp.fromName} onChange={(e) => setSmtp({ ...smtp, fromName: e.target.value })} placeholder="Genesis Hospital" className="w-full" />
                        </div>
                        <div className="field col-6">
                            <label className="block text-sm font-medium mb-1">From email</label>
                            <InputText value={smtp.fromEmail} onChange={(e) => setSmtp({ ...smtp, fromEmail: e.target.value })} placeholder="defaults to username" className="w-full" />
                        </div>
                    </div>
                    <div className="flex align-items-center gap-2 mb-2">
                        <InputSwitch checked={smtp.secure} onChange={(e) => setSmtp({ ...smtp, secure: e.value as boolean })} />
                        <span className="text-sm text-600">Use TLS/SSL (recommended for port 465)</span>
                    </div>
                    <Button label="Save" icon="pi pi-save" onClick={saveSmtp} loading={savingSmtp} className="mt-1" />

                    <Divider />
                    <label className="block text-sm font-medium mb-1">Send test email to</label>
                    <div className="flex gap-2">
                        <InputText value={mailTestTo} onChange={(e) => setMailTestTo(e.target.value)} placeholder="someone@example.com" className="flex-1" />
                        <Button label="Test" icon="pi pi-send" outlined loading={testing === 'smtp'} onClick={() => runTest('smtp', mailTestTo)} />
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default IntegrationSettings;
