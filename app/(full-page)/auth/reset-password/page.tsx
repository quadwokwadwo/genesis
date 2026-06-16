'use client';

import React, { Suspense, useRef, useState } from 'react';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';

const GRADIENT = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
const INPUT_STYLE: React.CSSProperties = { border: '2px solid #e5e7eb', transition: 'all 0.3s ease', width: '100%' };

const ResetPasswordInner = () => {
    const router = useRouter();
    const params = useSearchParams();
    const toast = useRef<Toast>(null);
    const [username, setUsername] = useState(params.get('username') ?? '');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim()) return toast.current?.show({ severity: 'warn', summary: 'Username required', detail: 'Enter your username' });
        if (!/^\d{6}$/.test(otp.trim())) return toast.current?.show({ severity: 'warn', summary: 'Invalid code', detail: 'Enter the 6-digit code sent to you' });
        if (newPassword.length < 8) return toast.current?.show({ severity: 'warn', summary: 'Weak password', detail: 'Password must be at least 8 characters' });
        if (newPassword !== confirm) return toast.current?.show({ severity: 'warn', summary: 'Mismatch', detail: 'Passwords do not match' });

        setLoading(true);
        try {
            await axios.post('/api/auth/reset-password', { username: username.trim(), otp: otp.trim(), newPassword });
            toast.current?.show({ severity: 'success', summary: 'Password reset', detail: 'You can now sign in with your new password.', life: 3000 });
            setTimeout(() => router.push('/auth/login'), 1500);
        } catch (err: any) {
            const detail = err?.response?.data?.message || 'Invalid or expired code. Request a new one and try again.';
            toast.current?.show({ severity: 'error', summary: 'Reset failed', detail });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Toast ref={toast} />
            <div className="flex justify-content-center align-items-center relative overflow-hidden" style={{ background: GRADIENT, minHeight: '100vh', width: '100%' }}>
                <div className="absolute bg-white-alpha-10 border-circle" style={{ top: '12%', right: '12%', width: 110, height: 110, animation: 'float 6s ease-in-out infinite' }} />
                <div className="absolute bg-white-alpha-10 border-circle" style={{ top: '22%', left: '14%', width: 60, height: 60, animation: 'float 4s ease-in-out infinite 2s' }} />
                <div className="absolute bg-white-alpha-10 border-circle" style={{ bottom: '12%', right: '18%', width: 80, height: 80, animation: 'float 5s ease-in-out infinite 1s' }} />

                <Card
                    className="w-full lg:w-4 xl:w-3 mx-3 lg:mx-0 shadow-8 border-round-2xl"
                    style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.3)' }}
                >
                    <div className="p-3">
                        <div className="text-center mb-4">
                            <div className="inline-flex align-items-center justify-content-center w-3rem h-3rem mb-2 border-round-xl shadow-3" style={{ background: GRADIENT }}>
                                <i className="pi pi-key text-white text-xl" />
                            </div>
                            <h2 className="text-xl font-bold text-900 m-0 mb-1">Reset password</h2>
                            <p className="text-600 text-xs line-height-3 m-0">Enter the 6-digit code sent to your phone and email, then choose a new password.</p>
                        </div>

                        <form onSubmit={submit} className="flex flex-column gap-3">
                            <div className="field m-0">
                                <label htmlFor="username" className="block text-xs font-medium text-700 mb-1">Username</label>
                                <span className="p-input-icon-left w-full">
                                    <i className="pi pi-user text-500" />
                                    <InputText id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="p-2 border-round-lg pl-4 w-full text-sm" style={INPUT_STYLE} />
                                </span>
                            </div>

                            <div className="field m-0">
                                <label htmlFor="otp" className="block text-xs font-medium text-700 mb-1">Verification code</label>
                                <InputText
                                    id="otp"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="••••••"
                                    inputMode="numeric"
                                    className="border-round-lg w-full text-center font-bold"
                                    style={{ ...INPUT_STYLE, letterSpacing: '0.6em', fontSize: '1.4rem', padding: '0.6rem' }}
                                />
                            </div>

                            <div className="field m-0">
                                <label htmlFor="newPassword" className="block text-xs font-medium text-700 mb-1">New password</label>
                                <Password inputId="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 8 characters" toggleMask className="w-full" inputClassName="p-2 border-round-lg text-sm" inputStyle={INPUT_STYLE} />
                            </div>

                            <div className="field m-0">
                                <label htmlFor="confirm" className="block text-xs font-medium text-700 mb-1">Confirm new password</label>
                                <Password inputId="confirm" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter password" feedback={false} toggleMask className="w-full" inputClassName="p-2 border-round-lg text-sm" inputStyle={INPUT_STYLE} />
                            </div>

                            <Button type="submit" label="Reset password" icon="pi pi-check" loading={loading} className="w-full border-round-lg border-none p-2 text-sm font-semibold" style={{ background: GRADIENT }} />

                            <div className="flex justify-content-between align-items-center text-sm">
                                <button type="button" onClick={() => router.push('/auth/forgot-password')} className="p-link text-600 hover:text-900" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <i className="pi pi-refresh mr-1" /> Resend code
                                </button>
                                <button type="button" onClick={() => router.push('/auth/login')} className="p-link text-600 hover:text-900" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <i className="pi pi-arrow-left mr-1" /> Back to login
                                </button>
                            </div>
                        </form>
                    </div>
                </Card>
            </div>

            <style>{`@keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }`}</style>
        </>
    );
};

const ResetPasswordPage = () => (
    <Suspense fallback={<div className="flex align-items-center justify-content-center min-h-screen" style={{ background: GRADIENT }}><span className="text-white">Loading…</span></div>}>
        <ResetPasswordInner />
    </Suspense>
);

export default ResetPasswordPage;
