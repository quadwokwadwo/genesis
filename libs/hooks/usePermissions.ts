'use client';
import { useEffect, useState, useCallback } from 'react';
import RbaService from '@/libs/blue_prints/RbaService';
import { RbaEffectiveRole } from '@/types/rba/rba';

const STORAGE_KEY = 'rba.permissions';

interface UsePermissionsReturn {
    permissions: string[];
    roles: RbaEffectiveRole[];
    isLoaded: boolean;
    /** True if the current user has at least one of the supplied permission codes. */
    hasPermission: (...codes: string[]) => boolean;
    /** True if user is admin (primary role). Admin bypasses all permission checks. */
    isAdmin: boolean;
    /** Force-refetch (e.g. after the user is granted a new role). */
    refresh: () => Promise<void>;
}

/**
 * Loads the current user's effective permissions from /api/rba/me/permissions
 * and caches them in localStorage. UI code can call `hasPermission(...)` to
 * conditionally render buttons/menu items.
 *
 * Server-side endpoints are the canonical authority — this hook only gates UI.
 */
function usePermissions(): UsePermissionsReturn {
    const [permissions, setPermissions] = useState<string[]>([]);
    const [roles, setRoles] = useState<RbaEffectiveRole[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const load = useCallback(async () => {
        try {
            const cached = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
            if (cached) {
                const parsed = JSON.parse(cached);
                setPermissions(parsed.permissions ?? []);
                setRoles(parsed.roles ?? []);
            }
            const r = await RbaService.getMyPermissions();
            const data = r.operatedData;
            setPermissions(data?.permissions ?? []);
            setRoles(data?.roles ?? []);
            if (typeof window !== 'undefined') {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({ permissions: data?.permissions ?? [], roles: data?.roles ?? [] }));
            }
        } catch {
            // Anonymous / unauthenticated — leave empty.
        } finally {
            setIsLoaded(true);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const isAdmin = roles.some((r) => r.roleCode === 'admin' && r.isPrimary === 1);
    const hasPermission = useCallback(
        (...codes: string[]) => {
            if (isAdmin) return true;
            return codes.some((c) => permissions.includes(c));
        },
        [permissions, isAdmin]
    );

    return { permissions, roles, isLoaded, hasPermission, isAdmin, refresh: load };
}

export default usePermissions;
