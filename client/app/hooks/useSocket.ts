"use client";

import { useEffect, useCallback } from "react";
import { useSocket } from "../providers/SocketProvider";

/**
 * Custom hook for socket interactions
 * @param eventName - Name of the event to listen for
 * @param callback - Function to execute when event is received
 */
export const useSocketEvent = (eventName: string, callback: (data: any) => void) => {
    const { socket } = useSocket();

    useEffect(() => {
        if (!socket) return;

        socket.on(eventName, callback);

        return () => {
            socket.off(eventName, callback);
        };
    }, [socket, eventName, callback]);
};

/**
 * Hook to get the socket instance and connection status
 */
export const useSocketClient = () => {
    const { socket, isConnected } = useSocket();

    const emit = useCallback((eventName: string, data: any, callback?: (response: any) => void) => {
        if (socket) {
            if (callback) {
                socket.emit(eventName, data, callback);
            } else {
                socket.emit(eventName, data);
            }
        } else {
            console.warn(`Cannot emit "${eventName}": Socket not initialized`);
        }
    }, [socket]);

    return { socket, isConnected, emit };
};
