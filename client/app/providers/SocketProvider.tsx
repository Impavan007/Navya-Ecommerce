"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") || "";

        if (!socketUrl) {
            console.warn("Socket URL not found. Real-time features might not work.");
            return;
        }

        const socketInstance = io(socketUrl, {
            auth: {
                token: token,
            },
            transports: ["websocket"],
            reconnectionAttempts: 5,
        });

        socketInstance.on("connect", () => {
            
            setIsConnected(true);
        });

        socketInstance.on("disconnect", () => {
            
            setIsConnected(false);
        });

        socketInstance.on("connect_error", (err) => {
            console.error("Socket connection error:", err);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
