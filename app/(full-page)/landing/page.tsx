'use client';

import React, { useContext, useEffect, useRef, useState } from 'react';
import { Ripple } from 'primereact/ripple';
import { InputText } from 'primereact/inputtext';
import { StyleClass } from 'primereact/styleclass';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { LayoutContext } from '../../../layout/context/layoutcontext';
import { PrimeReactContext } from 'primereact/api';
import type { ColorScheme, Page } from '@/types';

const LandingPage: Page = () => {
    const { layoutConfig, setLayoutConfig } = useContext(LayoutContext);
    const { changeTheme } = useContext(PrimeReactContext);
    const router = useRouter();

    const homeRef = useRef(null);
    const homeButtonRef = useRef(null);
    const timesRef = useRef(null);
    const menu = useRef(null);
    const meetButtonRef = useRef(null);
    const meetRef = useRef(null);
    const featuresRef = useRef(null);
    const pricingRef = useRef(null);
    const pricingButtonRef = useRef(null);
    const buyRef = useRef(null);
    const featuresButtonRef = useRef(null);

    const goHome = () => {
        router.push('/');
    };
    const scrollToElement = (el: React.MutableRefObject<any>) => {
        setTimeout(() => {
            el.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
                inline: 'nearest'
            });
        }, 200);
    };
    const changeColorScheme = (colorScheme: ColorScheme) => {
        changeTheme?.(layoutConfig.colorScheme, colorScheme, 'theme-link', () => {
            setLayoutConfig((prevState) => ({
                ...prevState,
                colorScheme,
                menuTheme: layoutConfig.colorScheme === 'dark' ? 'dark' : 'light'
            }));
        });
    };

    useEffect(() => {
        changeColorScheme('light');
        setLayoutConfig((prevState) => ({
            ...prevState,
            menuTheme: 'light'
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div ref={homeRef} className="landing-container" style={{ background: '#100e23' }}>
            <div id="header" className="landing-header flex flex-column w-full p-6" style={{ minHeight: '1000px', background: `url('/layout/images/landing/landing-header-2x.jpg') top left no-repeat`, backgroundSize: 'cover' }}>
                <div className="header-menu-container flex align-items-center justify-content-between">
                    <div className="header-left-elements flex align-items-center justify-content-between">
                        <div className="cursor-pointer layout-topbar-logo flex align-items-center" onClick={goHome}>
                            <img src="/layout/images/logo/logo-dark.png" alt="layout" className="logo" style={{ height: '32px' }} />
                            <img src="/layout/images/logo/appname-dark.png" alt="layout" className="appname ml-2" style={{ height: '12px' }} />
                        </div>

                        <ul
                            ref={menu}
                            id="menu"
                            style={{ top: '0px', right: '0%' }}
                            className="list-none  lg:flex lg:flex-row flex-column align-items-start bg-white absolute lg:relative h-screen lg:h-auto lg:surface-ground m-0 z-5 w-full sm:w-6 lg:w-full py-6 lg:py-0"
                        >
                            <StyleClass nodeRef={timesRef} selector="@parent" enterClassName="hidden" enterActiveClassName="px-scalein" leaveToClassName="hidden" leaveActiveClassName="px-fadeout">
                                <a ref={timesRef} className="p-ripple cursor-pointer block lg:hidden text-gray-800 font-medium line-height-3 hover:text-gray-800 absolute" style={{ top: '3rem', right: '2rem' }}>
                                    <i className="pi pi-times text-4xl"></i>
                                </a>
                            </StyleClass>

                            <li className="mt-5 lg:mt-0">
                                <StyleClass nodeRef={homeButtonRef} selector="@grandparent" enterClassName="hidden" enterActiveClassName="px-fadein" leaveToClassName="hidden">
                                    <a ref={homeButtonRef} onClick={() => scrollToElement(homeRef)} className="p-ripple flex m-0 lg:ml-5 lg:px-0 px-3 py-3 text-gray-800 font-medium line-height-3 hover:text-gray-800 cursor-pointer">
                                        <span>Home</span>
                                        <Ripple />
                                    </a>
                                </StyleClass>
                            </li>
                            <li>
                                <StyleClass nodeRef={meetButtonRef} selector="@grandparent" enterClassName="hidden" enterActiveClassName="px-fadein" leaveToClassName="hidden">
                                    <a ref={meetButtonRef} onClick={() => scrollToElement(meetRef)} className="p-ripple flex m-0 lg:ml-5 lg:px-0 px-3 py-3 text-gray-800 font-medium line-height-3 hover:text-gray-800 cursor-pointer">
                                        <span>Meet Atlantis</span>
                                        <Ripple />
                                    </a>
                                </StyleClass>
                            </li>
                            <li>
                                <StyleClass nodeRef={featuresButtonRef} selector="@grandparent" enterClassName="hidden" enterActiveClassName="px-fadein" leaveToClassName="hidden">
                                    <a ref={featuresButtonRef} onClick={() => scrollToElement(featuresRef)} className="p-ripple flex m-0 lg:ml-5 lg:px-0 px-3 py-3 text-gray-800 font-medium line-height-3 hover:text-gray-800 cursor-pointer">
                                        <span>Features</span>
                                        <Ripple />
                                    </a>
                                </StyleClass>
                            </li>
                            <li>
                                <StyleClass nodeRef={pricingButtonRef} selector="@grandparent" enterClassName="hidden" enterActiveClassName="px-fadein" leaveToClassName="hidden">
                                    <a ref={pricingButtonRef} onClick={() => scrollToElement(pricingRef)} className="p-ripple flex m-0 md:ml-5 md:px-0 px-3 py-3 text-gray-800 font-medium line-height-3 hover:text-gray-800 cursor-pointer">
                                        <span>Pricing</span>
                                        <Ripple />
                                    </a>
                                </StyleClass>
                            </li>
                            <li>
                                <StyleClass nodeRef={buyRef} selector="@grandparent" enterClassName="hidden" enterActiveClassName="px-fadein" leaveToClassName="hidden">
                                    <a ref={buyRef} className="p-ripple flex m-0 md:ml-5 md:px-0 px-3 py-3 text-gray-800 font-medium line-height-3 hover:text-gray-800 cursor-pointer">
                                        <span>Buy Now</span>
                                        <Ripple />
                                    </a>
                                </StyleClass>
                            </li>
                        </ul>
                    </div>

                    <div className="header-right-elements flex align-items-center justify-content-between">
                        <a className="font-medium text-gray-700 cursor-pointer">
                            <i className="pi pi-github text-gray-700 hover:text-gray-900 mr-3 text-xl"></i>
                        </a>

                        <a className="font-medium text-gray-700 cursor-pointer">
                            <i className="pi pi-twitter text-gray-700 hover:text-gray-900 mr-3 text-xl"></i>
                        </a>

                        <Button className="contact-button mr-3 p-button-outlined p-button-secondary p-button-text p-button p-component font-medium border-round text-gray-700" style={{ background: 'rgba(68, 72, 109, 0.05)' }}>
                            <span aria-hidden="true" className="p-button-label">
                                Contact
                            </span>
                        </Button>

                        <a className="p-ripple lg:hidden font-medium text-gray-700 cursor-pointer">
                            <i className="pi pi-bars fs-xlarge"></i>
                        </a>
                    </div>
                </div>

                <div className="header-text" style={{ padding: '100px 60px' }}>
                    <h1 className="mb-0 text-gray-800" style={{ fontSize: '80px', lineHeight: '95px' }}>
                        This is Atlantis
                    </h1>
                    <h2 className="mt-0 font-medium text-4xl text-gray-700">Modern, fresh and groovy</h2>
                    <a href="/" className="p-button text-gray-700 bg-cyan-500 border-cyan-500 font-bold border-round" style={{ mixBlendMode: 'multiply', padding: ' 0.858rem 1.142rem' }}>
                        <span className="p-button-text">Live Demo</span>
                    </a>
                </div>

                <div ref={featuresRef} className="header-features" style={{ padding: '100px 60px' }}>
                    <div className="grid flex">
                        <div className="col-12 md:col-6 lg:col-4 flex justify-content-center">
                            <div className="header-feature-box mr-3 mb-4 border-round-3xl p-5 text-white">
                                <span className="title mb-3 block text-2xl">Responsive Layout</span>
                                <span className="content">View it on the web and mobile device. Prime premium themes are aready for the all devices.</span>
                            </div>
                        </div>
                        <div className="col-12 md:col-6 lg:col-4 flex justify-content-center">
                            <div className="header-feature-box mr-3 mb-4 border-round-3xl p-5 text-white">
                                <span className="title mb-3 block text-2xl">Fresh</span>
                                <span className="content">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.</span>
                            </div>
                        </div>
                        <div className="col-12 md:col-6 lg:col-4 flex justify-content-center">
                            <div className="header-feature-box mr-3 mb-4 border-round-3xl p-5 text-white">
                                <span className="title mb-3 block text-2xl">Modern Design</span>
                                <span className="content">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.</span>
                            </div>
                        </div>
                        <div className="col-12 md:col-6 lg:col-4 flex justify-content-center">
                            <div className="header-feature-box mr-3 mb-4 border-round-3xl p-5 text-white">
                                <span className="title mb-3 block text-2xl">Clean code</span>
                                <span className="content">Our frontend is so easy to understand. If you want to modify the code it’s an easy job for you. Our code is clean and easy to read.</span>
                            </div>
                        </div>
                        <div className="col-12 md:col-6 lg:col-4 flex justify-content-center">
                            <div className="header-feature-box mr-3 mb-4 border-round-3xl p-5 text-white">
                                <span className="title mb-3 block text-2xl">Ready!</span>
                                <span className="content">We work hard to write down all aspects of prime themes to make sure that there is no unanswered questions left.</span>
                            </div>
                        </div>
                        <div className="col-12 md:col-6 lg:col-4 flex justify-content-center">
                            <div className="header-feature-box mr-3 mb-4 border-round-3xl p-5 text-white">
                                <span className="title mb-3 block text-2xl">Well documented</span>
                                <span className="content">We work hard to write down all aspects of prime themes to make sure that there is no unanswered questions left.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div ref={meetRef} id="meet-atlantis" className="flex justify-content-center w-full bg-gray-900 relative" style={{ minHeight: '620px', paddingTop: '65px' }}>
                <div className="ellipsis-1 absolute right-0" style={{ zIndex: '11' }}>
                    <img src="/layout/images/landing/ellipse-1.png" alt="atlantis" width="410" />
                </div>
                <div className="ellipsis-2 absolute left-0" style={{ zIndex: '11', bottom: '-100px' }}>
                    <img src="/layout/images/landing/ellipse-2.png" alt="atlantis" width="420" />
                </div>
                <div className="ellipsis-3 absolute" style={{ zIndex: '11', filter: 'blur(20px)', left: '130px', top: '40px' }}>
                    <img src="/layout/images/landing/ellipse-3.png" alt="atlantis" width="300" />
                </div>
                <div className="ellipsis-4 absolute bottom-0" style={{ zIndex: '9', right: '310px' }}>
                    <img src="/layout/images/landing/ellipse-4.png" alt="atlantis" width="125" />
                </div>

                <div className="atlantis-modes w-auto px-5" style={{ zIndex: '10' }}>
                    <img src="/layout/images/landing/atlantis-dark.png" alt="atlantis" className="w-full" style={{ maxWidth: '800px', borderRadius: '8px' }} />
                </div>
            </div>

            <div className="clip-background bg-gray-900 relative">
                <div className="landing-wrapper-back text-gray-50 px-6 absolute w-full">
                    <div id="features-back" className="pr-8" style={{ paddingLeft: '14rem' }}>
                        <h2 className="font-medium text-3xl text-center text-gray-800">Features</h2>
                        <div className="grid feature-boxes feature-boxes-1">
                            <div className="col-12 md:col-6">
                                <h3 className="font-medium text-3xl">Curabitur ullamcorper molesti</h3>
                                <p className="text-xl" style={{ maxWidth: '420px' }}>
                                    Ut eget ante id libero scelerisque sagittis. Aliquam porta quam at eros ornare, nec volutpat purus ornare. Curabitur vestibulum pharetra dui, feugiat venenatis augue accumsan in. Fusce ullamcorper efficitur dui
                                    vestibulum imperdiet. Morbi rhoncus commodo est, vel molestie sapien dapibus et. Nam a blandit urna. Maecenas porttitor et neque eu vehicula. Nunc dictum posuere elementum.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="landing-wrapper clip-path px-6 pb-8 absolute w-full" style={{ color: '#44486d', background: 'linear-gradient(180deg, #f4f8fb 17.13%, #eeeefa 65.89%)' }}>
                    <div id="features" className="pr-8 features" style={{ paddingLeft: '14rem' }}>
                        <h2 className="font-medium text-3xl text-center text-gray-800">Features</h2>
                        <div className="grid feature-boxes feature-boxes-1" style={{ marginBottom: '170px' }}>
                            <div className="col-12 md:col-6">
                                <h3 className="font-medium text-3xl">Curabitur ullamcorper molesti</h3>
                                <p className="text-xl" style={{ maxWidth: '420px' }}>
                                    Ut eget ante id libero scelerisque sagittis. Aliquam porta quam at eros ornare, nec volutpat purus ornare. Curabitur vestibulum pharetra dui, feugiat venenatis augue accumsan in. Fusce ullamcorper efficitur dui
                                    vestibulum imperdiet. Morbi rhoncus commodo est, vel molestie sapien dapibus et. Nam a blandit urna. Maecenas porttitor et neque eu vehicula. Nunc dictum posuere elementum.
                                </p>
                            </div>
                            <div className="col-12 md:col-6 flex flex-column">
                                <div className="widget-overview-box bg-white mb-5 border-round-xl p-3 relative" style={{ boxShadow: '0px 8px 30px rgba(59, 56, 109, 0.07)', maxWidth: '350px' }}>
                                    <span className="overview-title"> CONVERSATION RATE </span>
                                    <div className="flex justify-content-between">
                                        <div className="flex justify-content-between align-items-center">
                                            <div className="flex justify-content-center align-items-center h-2rem w-5rem border-round p-2 mr-3" style={{ backgroundColor: '#fc6161', boxShadow: '0px 6px 20px rgba(252, 97, 97, 0.3)' }}>
                                                <i className="pi pi-arrow-down w-2rem"></i>
                                                <span className="line-height-2">0.6%</span>
                                            </div>
                                            <div className="line-height-4 text-4xl">0.81%</div>
                                        </div>
                                    </div>
                                    <img className="absolute" style={{ bottom: '14px', right: '12px' }} src="/demo/images/ecommerce-dashboard/rate.svg" alt="absolute" />
                                </div>

                                <div className="widget-overview-box bg-white mb-5 border-round-xl p-3 relative" style={{ boxShadow: '0px 8px 30px rgba(59, 56, 109, 0.07)', maxWidth: '350px' }}>
                                    <span className="overview-title"> AVG. ORDER VALUE </span>
                                    <div className="flex justify-content-between">
                                        <div className="flex justify-content-between align-items-center">
                                            <div
                                                className="flex justify-content-center align-items-center h-2rem w-5rem border-round p-2 mr-3"
                                                style={{ marginRight: '12px', backgroundColor: '#0bd18a', boxShadow: '0px 6px 20px rgba(11, 209, 138, 0.3)' }}
                                            >
                                                <i className="pi pi-arrow-up w-2rem"></i>
                                                <span className="line-height-2">4,2%</span>
                                            </div>
                                            <div className="line-height-4 text-4xl">$306.2</div>
                                        </div>
                                    </div>
                                    <img className="absolute" style={{ bottom: '14px', right: '12px' }} src="/demo/images/ecommerce-dashboard/value.svg" alt="absolute" />
                                </div>

                                <div className="widget-overview-box bg-white mb-5 border-round-xl p-3 relative" style={{ boxShadow: '0px 8px 30px rgba(59, 56, 109, 0.07)', maxWidth: '350px' }}>
                                    <span className="overview-title"> ORDER QUANTITY </span>
                                    <div className="flex justify-content-between">
                                        <div className="flex justify-content-between align-items-center">
                                            <div className="flex justify-content-center align-items-center h-2rem w-5rem border-round p-2 mr-3" style={{ backgroundColor: '#00d0de', boxShadow: '0px 6px 20px rgba(0, 208, 222, 0.3)' }}>
                                                <i className="pi pi-minus w-2rem"></i>
                                                <span className="line-height-2">2,1%</span>
                                            </div>
                                            <div className="line-height-4 text-4xl">1,620</div>
                                        </div>
                                    </div>
                                    <img className="absolute" style={{ bottom: '14px', right: '12px' }} src="/demo/images/ecommerce-dashboard/quantity.svg" alt="quantity" />
                                </div>
                            </div>
                        </div>

                        <div className="grid flex justify-content-between feature-boxes feature-boxes-2" style={{ marginBottom: '140px', marginLeft: '-100px' }}>
                            <div className="col-12 md:col-6 flex flex-row-reverse">
                                <div className="card mr-3 customer-box text-center border-round bg-white" style={{ boxShadow: '0px 8px 30px rgba(68, 72, 109, 0.07)', maxWidth: '180px', maxHeight: '210px' }}>
                                    <div className="customer-item-content">
                                        <div className="mb-3">
                                            <img src="/demo/images/ecommerce-dashboard/beats.png" alt="beats" width="97" />
                                        </div>
                                        <div>
                                            <h4 className="p-m-1 font-medium text-xl white-space-nowrap">9,395 Users</h4>
                                            <h5 className="mt-0 font-medium text-xl text-gray-400">$7,927,105</h5>
                                        </div>
                                    </div>
                                </div>
                                <div className="card mr-3 customer-box text-center border-round bg-white" style={{ boxShadow: '0px 8px 30px rgba(68, 72, 109, 0.07)', maxWidth: '180px', maxHeight: '210px' }}>
                                    <div className="customer-item-content">
                                        <div className="mb-3">
                                            <img src="/demo/images/ecommerce-dashboard/nasa.png" alt="nasa" width="97" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-xl white-space-nowrap">9,673 Users</h4>
                                            <h5 className="mt-0 font-medium text-xl text-gray-400">$8,362,478</h5>
                                        </div>
                                    </div>
                                </div>
                                <div className="card mr-3 customer-box text-center border-round bg-white" style={{ boxShadow: '0px 8px 30px rgba(68, 72, 109, 0.07)', maxWidth: '180px', maxHeight: '210px', opacity: '0.5' }}>
                                    <div className="customer-item-content">
                                        <div className="mb-3">
                                            <img src="/demo/images/ecommerce-dashboard/north.png" alt="north-face" width="97" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-xl white-space-nowrap">7,613 Users</h4>
                                            <h5 className="mt-0 font-medium text-xl text-gray-400">$5,697,883</h5>
                                        </div>
                                    </div>
                                </div>
                                <div className="card mr-3 customer-box text-center border-round bg-white" style={{ boxShadow: '0px 8px 30px rgba(68, 72, 109, 0.07)', maxWidth: '180px', maxHeight: '210px', opacity: '0.3' }}>
                                    <div className="customer-item-content">
                                        <div className="mb-3">
                                            <img src="/demo/images/ecommerce-dashboard/gopro.png" alt="go-pro" width="97" height="97" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-xl white-space-nowrap">7,813 Users</h4>
                                            <h5 className="mt-0 font-medium text-xl text-gray-400">$6,471,594</h5>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 md:col-6">
                                <h3 className="text-gray-900">Curabitur ullamcorper molesti</h3>
                                <p>
                                    Proin maximus sem non congue ultricies. Aenean porttitor nulla suscipit, laoreet nunc eget, pharetra felis. Etiam ac velit sit amet metus tristique ultrices. Interdum et malesuada fames ac ante ipsum primis in
                                    faucibus. Vestibulum placerat nunc vitae ipsum bibendum pulvinar.
                                </p>
                            </div>
                        </div>

                        <div className="grid feature-boxes feature-boxes-3" style={{ marginBottom: '120px' }}>
                            <div className="col-12 md:col-6">
                                <h3 className="text-gray-900">Curabitur ullamcorper molesti</h3>
                                <ul className="pl-4">
                                    <li className="text-xl">Donec ac justo vitae lorem vehicula lobortis.</li>
                                    <li className="text-xl">Aenean nibh ante, auctor in faucibus id</li>
                                    <li className="text-xl">Orci varius natoque penatibus et magnis</li>
                                    <li className="text-xl">Ut et dapibus mauris.</li>
                                    <li className="text-xl">Fusce aliquet eget nisl sed imperdiet.</li>
                                </ul>
                            </div>
                            <div className="col-12 md:col-6 feature-widgets relative">
                                <img src="/layout/images/landing/chart-widget.png" alt="atlantis" className="chart-widget" style={{ maxHeight: '260px', opacity: '0.6' }} />
                                <img src="/layout/images/landing/progressbar-widget.png" alt="atlantis" className="progressbar-widget absolute right-0" style={{ top: '-45px', maxWidth: '350px' }} />
                            </div>
                        </div>
                    </div>

                    <div ref={pricingRef} id="pricing" className="flex pricing flex-column pr-8" style={{ paddingLeft: '14rem', marginBottom: '8.5rem' }}>
                        <h2 className="text-gray-900 font-medium text-3xl">Pricing</h2>
                        <p className="text-2xl" style={{ maxWidth: '650px', marginBottom: '4.5rem' }}>
                            Proin maximus sem non congue ultricies. Aenean porttitor nulla suscipit, laoreet nunc eget, pharetra felis. Etiam ac velit sit amet metus tristique ultrices. Interdum et malesuada fames ac ante ipsum primis in faucibus.
                        </p>

                        <div className="grid pricing-content w-full">
                            <div className="col-12 lg:col-4">
                                <div className="card p-0 mr-6 h-full bg-white w-full" style={{ borderRadius: '20px', boxShadow: '0px 10px 50px rgba(29, 15, 57, 0.13)' }}>
                                    <div className="flex flex-column align-items-center p-5">
                                        <span className="type font-medium text-3xl">Basic</span>
                                        <h1 className="font-medium" style={{ fontSize: '50px' }}>
                                            $5
                                        </h1>
                                    </div>
                                    <ul className="options py-0 px-5 mt-0">
                                        <li className="flex align-items-center justify-content-center text-xl p-2 text-center">Responsive Layout</li>
                                        <li className="flex align-items-center justify-content-center text-xl p-2 text-center">Unlimited Push Messages</li>
                                        <li className="flex align-items-center justify-content-center text-xl p-2 text-center">50 Support Ticket</li>
                                        <li className="flex align-items-center justify-content-center text-xl p-2 text-center">Free Shipping</li>
                                        <li className="flex align-items-center justify-content-center text-xl p-2 text-center">10GB Storage</li>
                                    </ul>
                                    <div className="flex align-items-center justify-content-center">
                                        <Button className="buy-button p-button-outlined p-button-secondary p-button-text p-button p-component bg-gray-50 text-gray-700 border-round font-semibold py-2">
                                            <span aria-hidden="true" className="p-button-label">
                                                Buy now
                                            </span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 lg:col-4">
                                <div className="card p-0 mr-6 h-full bg-white w-full" style={{ borderRadius: '20px', boxShadow: '0px 10px 50px rgba(29, 15, 57, 0.13)' }}>
                                    <div className="flex flex-column align-items-center p-5">
                                        <span className="type font-medium text-3xl">Standart</span>
                                        <h1 className="font-medium" style={{ fontSize: '50px' }}>
                                            $25
                                        </h1>
                                    </div>
                                    <ul className="options py-0 px-5 mt-0">
                                        <li className="flex align-items-center justify-content-center text-xl p-2 text-center">Responsive Layout</li>
                                        <li className="flex align-items-center justify-content-center text-xl p-2 text-center">Unlimited Push Messages</li>
                                        <li className="flex align-items-center justify-content-center text-xl p-2 text-center">50 Support Ticket</li>
                                        <li className="flex align-items-center justify-content-center text-xl p-2 text-center">Free Shipping</li>
                                        <li className="flex align-items-center justify-content-center text-xl p-2 text-center">10GB Storage</li>
                                    </ul>
                                    <div className="flex align-items-center justify-content-center">
                                        <Button className="active-buy-button p-button-outlined p-button-secondary p-button-text p-button p-component bg-cyan-500 text-white border-round py-2 font-semibold">
                                            <span aria-hidden="true" className="p-button-label">
                                                Buy now
                                            </span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 lg:col-4 pricing-box pricing-professional">
                                <div className="card p-0 mr-6 h-full bg-white w-full" style={{ borderRadius: '20px', boxShadow: '0px 10px 50px rgba(29, 15, 57, 0.13)' }}>
                                    <div className="flex flex-column align-items-center p-5">
                                        <span className="type font-medium text-3xl">Professional</span>
                                        <h1 className="font-medium" style={{ fontSize: '50px' }}>
                                            $50
                                        </h1>
                                    </div>
                                    <ul className="options py-0 px-5 mt-0 text-center">
                                        <li className="flex align-items-center justify-content-center text-xl p-2 text-center">Responsive Layout</li>
                                        <li className="flex align-items-center justify-content-center text-xl p-2 text-center">Unlimited Push Messages</li>
                                        <li className="flex align-items-center justify-content-center text-xl p-2 text-center">50 Support Ticket</li>
                                        <li className="flex align-items-center justify-content-center text-xl p-2 text-center">Free Shipping</li>
                                        <li className="flex align-items-center justify-content-center text-xl p-2 text-center">10GB Storage</li>
                                    </ul>
                                    <div className="flex align-items-center justify-content-center">
                                        <Button className="buy-button p-button-outlined p-button-secondary p-button-text p-button p-component bg-gray-50 text-gray-700 border-round font-semibold py-2">
                                            <span aria-hidden="true" className="p-button-label">
                                                Buy now
                                            </span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="footer" className="border-top-1 surface-border">
                        <div className="flex align-items-center justify-content-between py-4 border-bottom-2 surface-border" style={{ mixBlendMode: 'multiply' }}>
                            <div className="flex align-items-center justify-content-between">
                                <div className="flex align-items-center" onClick={goHome}>
                                    <img src="/layout/images/logo/logo-dark.png" alt="atlantis-layout" className="logo" style={{ height: '32px' }} />
                                    <img src="/layout/images/logo/appname-dark.png" alt="atlantis-layout" className="appname ml-2" style={{ height: '12px' }} />
                                    <span className="text-gray-700 opacity-70" style={{ marginLeft: '2.5rem' }}>
                                        Copyright - PrimeTek
                                    </span>
                                </div>
                            </div>
                            <div className="flex align-items-center justify-content-between">
                                <a className="cursor-pointer">
                                    <i className="pi pi-github text-gray-700 hover:text-gray-900 mr-3 text-xl"></i>
                                </a>

                                <a className="cursor-pointer">
                                    <i className="pi pi-twitter text-gray-700 hover:text-gray-900 mr-3 text-xl"></i>
                                </a>
                            </div>
                        </div>

                        <div className="flex align-items-center pt-5">
                            <div className="newsletter">
                                <span className="header font-medium text-xl opacity-60">Newsletter</span>
                                <p className="font-medium opacity-60">Join our newsletter to get notification about the new features</p>
                                <div className="p-inputgroup">
                                    <InputText type="text" className="p-component p-inputtext" placeholder="Enter your email adress" />
                                    <Button className="join-button p-button-outlined p-button-secondary p-button-text p-button p-component bg-bluegray-500" style={{ mixBlendMode: 'multiply', borderRadius: '0 8px 8px 0' }}>
                                        <span aria-hidden="true" className="p-button-label">
                                            Join
                                        </span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
