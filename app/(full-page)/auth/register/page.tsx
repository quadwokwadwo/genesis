'use client';

import React, { useContext, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { useRouter } from 'next/navigation';
import { Checkbox } from 'primereact/checkbox';
import { Page } from '../../../../types/layout';
import { classNames } from 'primereact/utils';
import { LayoutContext } from '../../../../layout/context/layoutcontext';

const Register: Page = () => {
    const [confirmed, setConfirmed] = useState(false);

    const { layoutConfig } = useContext(LayoutContext);
    const router = useRouter();

    const goHome = () => {
        router.push('/');
    };

    return (
        <>
            <div
                className={classNames('login-body', 'flex', 'min-h-screen', {
                    'layout-light': layoutConfig.colorScheme === 'light',
                    'layout-dark': layoutConfig.colorScheme === 'dark'
                })}
            >
                <div className="login-image w-6 h-screen hidden md:block" style={{ maxWidth: '490px' }}>
                    <img src={`/layout/images/pages/register-${layoutConfig.colorScheme === 'dark' ? 'ondark' : 'onlight'}.png`} alt="atlantis" className="h-screen w-full" />
                </div>
                <div className="w-full" style={{ background: 'var(--surface-ground)' }}>
                    <div
                        className={classNames(
                            'p-fluid',
                            'min-h-screen',
                            'bg-auto',
                            'md:bg-contain',
                            'bg-no-repeat',
                            'text-center',
                            'w-full',
                            'flex',
                            'align-items-center',
                            'md:align-items-start',
                            'justify-content-center',
                            'flex-column',
                            'bg-auto',
                            'md:bg-contain',
                            'bg-no-repeat'
                        )}
                        style={{
                            padding: '20% 10% 20% 10%',
                            background: 'var(--exception-pages-image)'
                        }}
                    >
                        <div className="flex flex-column">
                            <div className="flex align-items-center mb-6 logo-container">
                                <img src={`/layout/images/logo/logo-${layoutConfig.colorScheme === 'light' ? 'dark' : 'light'}.png`} className="login-logo" style={{ width: '45px' }} alt="logo" />
                                <img src={`/layout/images/logo/appname-${layoutConfig.colorScheme === 'light' ? 'dark' : 'light'}.png`} className="login-appname ml-3" style={{ width: '100px' }} alt="appname" />
                            </div>
                            <div className="form-container text-left" style={{ maxWidth: '320px', minWidth: '270px' }}>
                                <h4 className="m-0 mb-2">Register</h4>
                                <span className="block text-600 font-medium mb-4">Let&lsquo;s get started</span>
                                <span className="p-input-icon-left">
                                    <i className="pi pi-user"></i>
                                    <InputText type="text" autoComplete="off" placeholder="username" className="block mb-3" style={{ maxWidth: '320px', minWidth: '270px' }} />
                                </span>
                                <span className="p-input-icon-left">
                                    <i className="pi pi-envelope"></i>
                                    <InputText type="email" autoComplete="off" placeholder="email" className="block mb-3" style={{ maxWidth: '320px', minWidth: '270px' }} />
                                </span>
                                <span className="p-input-icon-left">
                                    <i className="pi pi-key"></i>
                                    <InputText type="password" autoComplete="off" placeholder="Password" className="block mb-3" style={{ maxWidth: '320px', minWidth: '270px' }} />
                                </span>
                                <div className="mt-2 flex flex-wrap">
                                    <Checkbox type="checkbox" id="confirmed" checked={confirmed} onChange={() => setConfirmed(!confirmed)} className="mr-2" />{' '}
                                    <label htmlFor="confirmed" className="text-900 font-medium mr-2">
                                        I have read the
                                    </label>
                                    <a className="text-600 cursor-pointer hover:text-primary cursor-pointer">Terms and Conditions</a>
                                </div>
                            </div>
                            <div className="button-container mt-4 text-left" style={{ maxWidth: '320px', minWidth: '270px' }}>
                                <div className="buttons flex align-items-center gap-3">
                                    <Button type="button" onClick={goHome} className="block p-button-danger p-button-outlined" style={{ maxWidth: '320px', marginBottom: '32px' }}>
                                        Cancel
                                    </Button>
                                    <Button type="button" className="block" style={{ maxWidth: '320px', marginBottom: '32px' }}>
                                        Submit
                                    </Button>
                                </div>
                                <span className="font-medium text-600">
                                    Already have an account? <a className="font-semibold cursor-pointer text-900 hover:text-primary transition-colors transition-duration-300">Login</a>
                                </span>
                            </div>
                        </div>
                        <div className="login-footer flex align-items-center absolute" style={{ bottom: '75px' }}>
                            <div className="flex align-items-center login-footer-logo-container pr-4 mr-4 border-right-1 surface-border">
                                <img src="/layout/images/logo/logo-gray.png" className="login-footer-logo" style={{ width: '22px' }} alt="logo" />
                                <img src="/layout/images/logo/appname-gray.png" className="login-footer-appname ml-2" style={{ width: '45px' }} alt="appname" />
                            </div>
                            <span className="text-sm text-color-secondary mr-3">Copyright 2023</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Register;
