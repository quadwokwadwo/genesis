import { useState, useEffect } from 'react';

interface UseUserDataReturn<T> {
    user: T | null;
    setUser: (newUser: T | null) => void;
    isLoaded: boolean;
}

function useUserData<T = any>(key = 'user'): UseUserDataReturn<T> {
    const [user, setUserState] = useState<T | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Initialize user data on client-side only
    useEffect(() => {
        try {
            if (typeof window !== 'undefined') {
                const storedUser = localStorage.getItem(key);
                setUserState(storedUser ? JSON.parse(storedUser) : null);
                setIsLoaded(true);
            }
        } catch (error) {
            console.error('Failed to parse user from localStorage:', error);
            setUserState(null);
            setIsLoaded(true);
        }
    }, [key]);

    const setUser = (newUser: T | null) => {
        try {
            if (typeof window !== 'undefined') {
                if (newUser === null) {
                    localStorage.removeItem(key);
                    setUserState(null);
                } else {
                    const userString = JSON.stringify(newUser);
                    localStorage.setItem(key, userString);
                    setUserState(newUser);
                }
            }
        } catch (error) {
            console.error('Failed to set user in localStorage:', error);
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const handleStorageChange = () => {
                try {
                    const storedUser = localStorage.getItem(key);
                    setUserState(storedUser ? JSON.parse(storedUser) : null);
                } catch (error) {
                    console.error('Failed to sync user from localStorage:', error);
                }
            };

            window.addEventListener('storage', handleStorageChange);
            return () => window.removeEventListener('storage', handleStorageChange);
        }
    }, [key]);

    return { user, setUser, isLoaded };
}

export default useUserData;
