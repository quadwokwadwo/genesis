'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import useUserData from '@/libs/hooks/useUserData';
import { USER_ROLES } from '@/types/enums/enums';

const Page: React.FC = () => {
    const { user, isLoaded } = useUserData();
    const router = useRouter();

    console.log(user);
    useEffect(() => {
        if (!isLoaded) return;

        if (!user) {
            router.push('/auth/login');
            return;
        }

        const { role } = user;

        if (role === USER_ROLES.doctor) {
            router.push('/hospital/users/doctors/dashboard');
        } else if (role === USER_ROLES.nurse) {
            router.push('/hospital/users/nurse');
        } else {
            router.push('/hospital/lab/dashboard');
        }
    }, [isLoaded, user, router]);

    return null; // Or a loader/spinner if desired
};

export default Page;
