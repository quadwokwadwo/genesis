'use client';

import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from 'primereact/card';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { validateResetPassword } from '@/libs/joiValidations';
import { pageDataValidation } from '@/libs/utils';

const ResetPasswordPage = () => {
    const router = useRouter();
    const params = useSearchParams();
    const toastRef = useRef<any>(null);
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    useEffect(() => {
        const t = params?.get('token') ?? '';
        setToken(t);
    }, [params]);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pageDataValidation(validateResetPassword, { token, newPassword, confirmPassword }, toastRef)) return;
        try {
            setSubmitting(true);
            await axios.post('/api/auth/reset-password', { token, newPassword }, { withCredentials: true });
            setDone(true);
        } catch (err: any) {
            const msg = err?.response?.data?.error?.message || 'Reset link is invalid or expired.';
            toastRef.current?.show({ severity: 'error', summary: 'Reset failed', detail: msg, life: 4000 });
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
                    <h2 className="text-center mb-4">Reset Password</h2>

                    {done ? (
                        <div className="text-center">
                            <i className="pi pi-check-circle text-green-500 text-5xl mb-3" />
                            <p>Your password has been updated.</p>
                            <Button label="Go to login" className="mt-3" onClick={() => router.push('/auth/login')} />
                        </div>
                    ) : (
                        <form onSubmit={onSubmit} className="flex flex-column gap-3">
                            {!token && <small className="text-red-500">Missing reset token in the URL.</small>}
                            <span className="p-float-label">
                                <Password
                                    inputId="newPassword"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    toggleMask
                                    feedback={false}
                                    className="w-full"
                                    inputClassName="w-full"
                                />
                                <label htmlFor="newPassword">New password</label>
                            </span>
                            <span className="p-float-label">
                                <Password
                                    inputId="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    toggleMask
                                    feedback={false}
                                    className="w-full"
                                    inputClassName="w-full"
                                />
                                <label htmlFor="confirmPassword">Confirm password</label>
                            </span>
                            <Button type="submit" label={submitting ? 'Updating…' : 'Update password'} disabled={submitting || !token} loading={submitting} />
                            <Button type="button" label="Back to login" className="p-button-text" onClick={() => router.push('/auth/login')} />
                        </form>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default ResetPasswordPage;
