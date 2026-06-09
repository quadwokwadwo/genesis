import { useState, useEffect } from 'react';

interface UseUserDataReturn<T> {
    user: T | null;
    setUser: (newUser: T | null) => void;
    isLoaded: boolean;
}

// Belt-and-braces: even if a caller hands us a raw row from the server, never persist
// password material to localStorage.
const SENSITIVE_KEYS = ['password', 'hashpassword', 'hashedpassword', 'passwordhash', 'passwordsalt'];
function stripSensitive<T>(value: T): T {
    if (!value || typeof value !== 'object') return value;
    const cloned: any = Array.isArray(value) ? [...(value as any)] : { ...(value as any) };
    for (const k of Object.keys(cloned)) {
        if (SENSITIVE_KEYS.includes(k.toLowerCase())) {
            delete cloned[k];
        }
    }
    return cloned as T;
}

function useUserData<T = any>(key = 'user'): UseUserDataReturn<T> {
    const [user, setUserState] = useState<T | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

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
                    const safe = stripSensitive(newUser);
                    localStorage.setItem(key, JSON.stringify(safe));
                    setUserState(safe);
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
