'use client';

import React, { useRef, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';

const GRADIENT = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

const ForgotPasswordPage = () => {
    const router = useRouter();
    const toast = useRef<Toast>(null);
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);

    const goToReset = () => router.push(`/auth/reset-password?username=${encodeURIComponent(username.trim())}`);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim()) {
            toast.current?.show({ severity: 'warn', summary: 'Username required', detail: 'Enter your username to continue' });
            return;
        }
        setLoading(true);
        try {
            const res = await axios.post('/api/auth/forgot-password', { username: username.trim() });
            const channels = res.data?.data?.channels ?? res.data?.operatedData?.channels ?? {};
            const where = [channels.sms && `SMS to ${channels.sms}`, channels.email && `email to ${channels.email}`].filter(Boolean).join(' and ');
            toast.current?.show({
                severity: 'success',
                summary: 'Code sent',
                detail: where ? `A 6-digit code was sent via ${where}.` : 'If an account exists, a 6-digit code has been sent to your registered phone and email.',
                life: 4000
            });
            setTimeout(goToReset, 1200);
        } catch {
            toast.current?.show({ severity: 'success', summary: 'Code sent', detail: 'If an account exists, a 6-digit code has been sent to your registered phone and email.', life: 4000 });
            setTimeout(goToReset, 1200);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Toast ref={toast} />
            <div className="flex justify-content-center align-items-center relative overflow-hidden" style={{ background: GRADIENT, minHeight: '100vh', width: '100%' }}>
                {/* Floating accents */}
                <div className="absolute bg-white-alpha-10 border-circle" style={{ top: '10%', left: '10%', width: 100, height: 100, animation: 'float 6s ease-in-out infinite' }} />
                <div className="absolute bg-white-alpha-10 border-circle" style={{ top: '18%', right: '14%', width: 60, height: 60, animation: 'float 4s ease-in-out infinite 2s' }} />
                <div className="absolute bg-white-alpha-10 border-circle" style={{ bottom: '14%', left: '18%', width: 80, height: 80, animation: 'float 5s ease-in-out infinite 1s' }} />

                <Card
                    className="w-full lg:w-4 xl:w-3 mx-3 lg:mx-0 shadow-8 border-round-2xl"
                    style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.3)' }}
                >
                    <div className="p-3">
                        <div className="text-center mb-4">
                            <div className="inline-flex align-items-center justify-content-center w-3rem h-3rem mb-2 border-round-xl shadow-3" style={{ background: GRADIENT }}>
                                <i className="pi pi-lock text-white text-xl" />
                            </div>
                            <h2 className="text-xl font-bold text-900 m-0 mb-1">Genesis</h2>
                            <h3 className="text-lg font-semibold text-700 m-0 mb-1">Forgot your password?</h3>
                            <p className="text-600 text-xs line-height-3 m-0">Enter your username and we&apos;ll send a one-time code to your phone and email.</p>
                        </div>

                        <form onSubmit={submit} className="flex flex-column gap-3">
                            <div className="field m-0">
                                <label htmlFor="username" className="block text-xs font-medium text-700 mb-1">Username</label>
                                <span className="p-input-icon-left w-full">
                                    <i className="pi pi-user text-500" />
                                    <InputText
                                        id="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Enter your username"
                                        className="p-2 border-round-lg pl-4 w-full text-sm"
                                        style={{ border: '2px solid #e5e7eb', transition: 'all 0.3s ease' }}
                                        autoFocus
                                    />
                                </span>
                            </div>

                            <Button
                                type="submit"
                                label="Send reset code"
                                icon="pi pi-send"
                                loading={loading}
                                className="w-full border-round-lg border-none p-2 text-sm font-semibold"
                                style={{ background: GRADIENT }}
                            />
                            <button type="button" onClick={() => router.push('/auth/login')} className="p-link text-center text-sm text-600 hover:text-900" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <i className="pi pi-arrow-left mr-1" /> Back to login
                            </button>
                        </form>
                    </div>
                </Card>
            </div>

            <style>{`@keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }`}</style>
        </>
    );
};

export default ForgotPasswordPage;
