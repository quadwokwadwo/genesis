'use client';

import React, { useRef, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { validateForgotPassword } from '@/libs/joiValidations';
import { pageDataValidation } from '@/libs/utils';

const ForgotPasswordPage = () => {
    const router = useRouter();
    const toastRef = useRef(null);
    const [username, setUsername] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pageDataValidation(validateForgotPassword, { username }, toastRef)) return;
        try {
            setSubmitting(true);
            await axios.post('/api/auth/forgot-password', { username }, { withCredentials: true });
            setDone(true);
        } catch {
            // Endpoint deliberately returns 200 to avoid enumeration; only show on network error.
            setDone(true);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="flex justify-content-center align-items-center"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}
        >
            <Toast ref={toastRef} />
            <Card className="w-full lg:w-4 xl:w-3 mx-3 shadow-8 border-round-2xl">
                <div className="p-3">
                    <h2 className="text-center mb-2">Forgot Password</h2>
                    <p className="text-center text-color-secondary mb-4">Enter your username. If an account exists we will send a reset link.</p>

                    {done ? (
                        <div className="text-center">
                            <i className="pi pi-check-circle text-green-500 text-5xl mb-3" />
                            <p>If the username matches an account, a password reset link has been sent.</p>
                            <Button label="Back to login" className="mt-3" onClick={() => router.push('/auth/login')} />
                        </div>
                    ) : (
                        <form onSubmit={onSubmit} className="flex flex-column gap-3">
                            <span className="p-float-label">
                                <InputText id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full" />
                                <label htmlFor="username">Username</label>
                            </span>
                            <Button type="submit" label={submitting ? 'Sending…' : 'Send reset link'} disabled={submitting} loading={submitting} />
                            <Button type="button" label="Back to login" className="p-button-text" onClick={() => router.push('/auth/login')} />
                        </form>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default ForgotPasswordPage;
