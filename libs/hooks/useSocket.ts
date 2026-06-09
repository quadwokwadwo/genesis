'use client';

/**
 * Module 17 — typed Socket.IO client hook.
 *
 * The Socket.IO server lives on the Express API (port 5000) and authenticates
 * the handshake via the JWT access token. Browsers must connect to it
 * directly (the Next.js BFF is HTTP-only), so this hook reads
 * `NEXT_PUBLIC_SOCKET_URL` and falls back to `http://localhost:5000`.
 *
 * The connection refreshes whenever the in-memory access token rotates
 * (handled by polling the tokenStore — tokenStore does not expose a
 * subscribe API yet).
 */
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getAccessToken } from '@/libs/auth/tokenStore';

export interface AppointmentCreatedPayload {
    appointmentId: number;
    patientId: number;
    doctorId: number;
    startTime: string;
}
export interface AppointmentUpdatedPayload {
    appointmentId: number;
    status: string;
    doctorId?: number;
    patientId?: number;
    startTime?: string;
}
export interface AppointmentCancelledPayload {
    appointmentId: number;
    cancelledBy: number | null;
    reason: string | null;
    doctorId?: number;
    patientId?: number;
}
export interface BillCreatedPayload {
    billId: number;
    patientId: number;
    visitId: number;
    totalAmount: number;
}
export interface InventoryLowStockPayload {
    itemId: number;
    itemName: string;
    currentQty: number;
    threshold: number;
}

export interface RealtimeEventMap {
    'appointment.created': AppointmentCreatedPayload;
    'appointment.updated': AppointmentUpdatedPayload;
    'appointment.cancelled': AppointmentCancelledPayload;
    'bill.created': BillCreatedPayload;
    'inventory.lowStock': InventoryLowStockPayload;
}

export type RealtimeEvent = keyof RealtimeEventMap;

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';

export interface UseSocketResult {
    socket: Socket | null;
    connected: boolean;
}

/**
 * Connect to the Socket.IO server using the current access token.
 * Disconnects on unmount. Reconnects automatically when the token changes
 * (token rotation) or when the window regains focus.
 */
export function useSocket(): UseSocketResult {
    const [connected, setConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const tokenRef = useRef<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const connect = () => {
            const token = getAccessToken();
            if (!token) return;
            tokenRef.current = token;

            const socket = io(SOCKET_URL, {
                auth: { token },
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000
            });

            socket.on('connect', () => {
                if (!cancelled) setConnected(true);
            });
            socket.on('disconnect', () => {
                if (!cancelled) setConnected(false);
            });
            socket.on('connect_error', () => {
                if (!cancelled) setConnected(false);
            });

            socketRef.current = socket;
        };

        connect();

        // Re-connect when the token rotates. tokenStore has no subscribe API
        // today, so poll the in-memory value cheaply.
        const tokenPoll = setInterval(() => {
            const current = getAccessToken();
            if (current && current !== tokenRef.current) {
                socketRef.current?.disconnect();
                socketRef.current = null;
                connect();
            }
        }, 5000);

        // Also reconnect on window focus if we got disconnected.
        const onFocus = () => {
            if (socketRef.current && !socketRef.current.connected) {
                socketRef.current.connect();
            } else if (!socketRef.current) {
                connect();
            }
        };
        window.addEventListener('focus', onFocus);

        return () => {
            cancelled = true;
            clearInterval(tokenPoll);
            window.removeEventListener('focus', onFocus);
            socketRef.current?.disconnect();
            socketRef.current = null;
        };
    }, []);

    return { socket: socketRef.current, connected };
}

/** Typed subscription helper: registers a handler and returns an unsubscribe fn. */
export function onSocketEvent<E extends RealtimeEvent>(socket: Socket | null, event: E, handler: (payload: RealtimeEventMap[E]) => void): () => void {
    if (!socket) return () => undefined;
    socket.on(event as string, handler as (...args: any[]) => void);
    return () => {
        socket.off(event as string, handler as (...args: any[]) => void);
    };
}
