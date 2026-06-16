'use client';

import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { Checkbox } from 'primereact/checkbox';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { GeneralPageProps } from '@/libs/utilityComponents';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { displayMessage, pageDataValidation, showPageTitle } from '@/libs/utils';
import Joi from 'joi';
import { TLoginResponse, User } from '@/types/hospital';
import UserService from '@/libs/blue_prints/UserService';
import useUserData from '@/libs/hooks/useUserData';
import { USER_ROLES } from '@/types/enums/enums';

interface LoginCredentials {
    username: string;
    password: string;
}

// Extract constants

const ROUTES = {
    NURSES: '/hospital/users/nurse',
    HOME: '/hospital/users/doctors/dashboard',
    LABS: '/hospital/lab/dashboard'
};

const MESSAGE_DURATION = 3000;
const validateLogin = Joi.object({
    username: Joi.string().required().messages({ 'string.empty': 'Enter a valid username before proceeding!' }),
    password: Joi.string().required().messages({ 'string.empty': 'Enter a valid password before proceeding!' })
});
const userService = new UserService();
const Login = () => {
    const navigate = useRouter();
    const [credentials, setCredentials] = useState<LoginCredentials>({
        username: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const toastRef = useRef(null);
    const { user, setUser } = useUserData();

    useEffect(() => {
        showPageTitle('Login');
        // Check for saved credentials
        const savedUsername = localStorage.getItem('savedUsername');
        const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
        if (savedUsername && savedRememberMe) {
            setCredentials((prev) => ({ ...prev, username: savedUsername }));
            setRememberMe(true);
        }
    }, []);

    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCredentials((prev) => ({ ...prev, [name]: value }));
    };

    const isPageDataValid = () => pageDataValidation(validateLogin, credentials, toastRef);

    const handleSuccessfulLogin = async ({ user }: TLoginResponse) => {
        await handleUserRouting(user);
    };

    const handleUserRouting = async (user: User) => {
        console.log(user);
        if (user.role === USER_ROLES.admin || user.role === USER_ROLES.doctor) {
            await routeToAdminPages();
        } else if (user.role === USER_ROLES.nurse) {
            routeToUserPages();
        } else {
            routeTOLABPages();
        }
    };

    const routeToAdminPages = async () => {
        navigate.push(ROUTES.HOME);
    };

    const routeToUserPages = () => {
        navigate.push(ROUTES.NURSES);
    };
    const routeTOLABPages = () => {
        navigate.push(ROUTES.LABS);
    };
    const displayInvalidCredentialsMessage = () => {
        displayMessage({
            header: 'Invalid Credentials',
            message: 'Your details could not be verified on our platform. Contact Administrator!',
            life: MESSAGE_DURATION,
            infoType: 'error',
            toastComponent: toastRef
        });
    };

    const displayNoAccessMessage = () => {
        displayMessage({
            header: 'Unauthorised',
            message: 'You have not been assigned any access. Contact Administrator!',
            life: MESSAGE_DURATION,
            infoType: 'warn',
            toastComponent: toastRef
        });
    };

    const onStandardLogin = async () => {
        try {
            if (!isPageDataValid()) return;

            setIsLoading(true);

            const { username, password } = credentials;
            const result = await userService.performUserLogin(password, username);
            if (result.isUser && result.user) {
                setUser(result.user);
                await handleSuccessfulLogin({
                    isUser: result.isUser as boolean,
                    user: result.user as User
                });
            } else {
                if (result?.isUser) {
                    displayNoAccessMessage();
                    return;
                }
                displayInvalidCredentialsMessage();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const onFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onStandardLogin();
    };

    const onGotoPasswordReset = () => {
        navigate.push('/auth/forgot-password');
    };

    const getLocationPages = async (): Promise<[]> => {
        return [];
    };
    return (
        <>
            <GeneralPageProps toastRef={toastRef} />

            {/* Full height container with gradient background */}
            <div
                className="flex justify-content-center align-items-center relative overflow-hidden"
                style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    minHeight: '100vh',
                    width: '100%'
                }}
            >
                {/* Animated floating elements */}
                <div
                    className="absolute bg-white-alpha-10 border-circle"
                    style={{
                        top: '10%',
                        left: '10%',
                        width: '100px',
                        height: '100px',
                        animation: 'float 6s ease-in-out infinite'
                    }}
                />
                <div
                    className="absolute bg-white-alpha-10 border-circle"
                    style={{
                        top: '20%',
                        right: '15%',
                        width: '60px',
                        height: '60px',
                        animation: 'float 4s ease-in-out infinite 2s'
                    }}
                />
                <div
                    className="absolute bg-white-alpha-10 border-circle"
                    style={{
                        bottom: '15%',
                        left: '20%',
                        width: '80px',
                        height: '80px',
                        animation: 'float 5s ease-in-out infinite 1s'
                    }}
                />

                {/* Main login card - Reduced width and padding */}
                <Card
                    className="w-full lg:w-4 xl:w-3 mx-3 lg:mx-0 shadow-8 border-round-2xl"
                    style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.3)'
                    }}
                >
                    <div className="p-3">
                        {/* Brand section - Reduced margins */}
                        <div className="text-center mb-3">
                            <div
                                className="inline-flex align-items-center justify-content-center w-3rem h-3rem mb-2 border-round-xl shadow-3"
                                style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                }}
                            >
                                <i className="pi pi-lock text-white text-xl" />
                            </div>
                            <h2 className="text-xl font-bold text-900 m-0 mb-1">Genesis</h2>
                            <h3 className="text-lg font-semibold text-700 m-0 mb-1">Welcome Back!</h3>
                            <p className="text-600 text-xs line-height-3 m-0">Sign in to your account to continue</p>
                        </div>

                        <form onSubmit={onFormSubmit} className="flex flex-column gap-3">
                            {/* Email field - Reduced gap and padding */}
                            <div className="field">
                                <label htmlFor="email" className="block text-xs font-medium text-700 mb-1">
                                    Email Address
                                </label>
                                <span className="p-input-icon-left w-full">
                                    <i className="pi pi-user text-500 mr-2" />
                                    <InputText
                                        id="email"
                                        name="username"
                                        value={credentials.username}
                                        onChange={handleInputChange}
                                        placeholder="Enter Username"
                                        className="p-2 border-round-lg pl-4 w-full text-sm"
                                        autoComplete="email"
                                        style={{
                                            border: '2px solid #e5e7eb',
                                            transition: 'all 0.3s ease'
                                        }}
                                    />
                                </span>
                            </div>

                            {/* Password field - Reduced gap and padding */}
                            <div className="field">
                                <label htmlFor="password" className="block text-xs font-medium text-700 mb-1">
                                    Password
                                </label>
                                <span className="p-input-icon-left w-full">
                                    <i className="pi pi-lock text-500" />
                                    <Password
                                        inputId="password"
                                        name="password"
                                        value={credentials.password}
                                        onChange={handleInputChange}
                                        placeholder="Enter your password"
                                        className="w-full"
                                        inputClassName="p-2 border-round-lg pl-4 text-sm"
                                        toggleMask
                                        feedback={false}
                                        autoComplete="current-password"
                                        inputStyle={{
                                            border: '2px solid #e5e7eb',
                                            transition: 'all 0.3s ease',
                                            width: '100%'
                                        }}
                                    />
                                </span>
                            </div>

                            {/* Remember me and forgot password - Reduced margins */}
                            <div className="flex justify-content-between align-items-center mb-1">
                                <div className="flex align-items-center gap-1">
                                    <Checkbox inputId="rememberMe" checked={rememberMe} onChange={(e) => setRememberMe(e.checked || false)} className="text-primary" />
                                    <label htmlFor="rememberMe" className="text-xs text-600 cursor-pointer select-none">
                                        Remember me
                                    </label>
                                </div>
                                <Button type="button" label="Forgot password?" onClick={onGotoPasswordReset} className="p-button-text p-button-sm text-primary font-medium text-xs" style={{ padding: '0.2rem', textDecoration: 'none' }} />
                            </div>

                            {/* Sign in button - Reduced padding and margin */}
                            <Button
                                type="submit"
                                label="Sign In"
                                icon="pi pi-sign-in"
                                iconPos="right"
                                loading={isLoading}
                                className="w-full p-2 mb-2 border-round-lg font-semibold shadow-2 text-sm"
                                style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    border: 'none',
                                    transition: 'all 0.3s ease'
                                }}
                            />

                            {/* Divider - Reduced margins */}
                            <Divider align="center" className="my-2">
                                <span className="text-500 text-xs font-medium px-2">OR</span>
                            </Divider>

                            {/* Sign up link - Reduced margin */}
                            <div className="text-center mt-2">
                                <span className="text-600 text-xs">
                                    Dont have an account?{' '}
                                    <Button
                                        type="button"
                                        label="Sign up here"
                                        className="p-button-text p-button-sm text-primary font-medium text-xs"
                                        style={{ padding: '0.2rem', textDecoration: 'none' }}
                                        onClick={() => {
                                            console.log('Navigate to sign up');
                                        }}
                                    />
                                </span>
                            </div>
                        </form>

                        {/* Footer - Significantly reduced */}
                        <Divider className="mt-3 mb-2" />
                        <div className="text-center pt-2">
                            <div className="flex align-items-center justify-content-center gap-1 mb-1">
                                <div
                                    className="inline-flex align-items-center justify-content-center w-1rem h-1rem border-round"
                                    style={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                    }}
                                >
                                    <i className="pi pi-shield text-white text-xs" />
                                </div>
                                <span className="text-700 font-semibold text-xs">Easy Apps</span>
                            </div>
                            <span className="text-500" style={{ fontSize: '10px' }}>
                                Copyright © {new Date().getFullYear()} Easy Apps. All rights reserved.
                            </span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Animation keyframes */}
            <style>
                {`
                    @keyframes float {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(-20px); }
                    }
                `}
            </style>
        </>
    );
};
export default Login;
