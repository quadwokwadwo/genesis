import { useState, useEffect } from 'react';
import useUserData from '@/libs/hooks/useUserData';
import { USER_ROLES } from '@/types/enums/enums'; // Adjust import path
import AppSubMenu from './AppSubMenu';
import { MenuModal } from '@/types';
import { adminAndDoctorsPages, lab_tech, nursesPages } from '@/libs/utils';

const AppMenu = () => {
    const { user, setUser, isLoaded } = useUserData();
    const [model, setModel] = useState<MenuModal[]>([]);

    useEffect(() => {
        // Only set model when user data is loaded and user exists
        if (isLoaded && user) {
            setModel(user.role === USER_ROLES.admin ? adminAndDoctorsPages() : user.role === USER_ROLES.nurse ? nursesPages() : lab_tech);
        }
    }, [user, isLoaded]);

    // Show loading state or empty menu while user data is being loaded
    if (!isLoaded) {
        return <div>Loading User Menu Items...</div>; // Or return a skeleton/spinner
    }

    // Show empty menu if no user is found
    if (!user) {
        return <AppSubMenu model={[]} />;
    }

    return <AppSubMenu model={model} />;
};

export default AppMenu;
