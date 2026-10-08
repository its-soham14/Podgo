import { useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { toast } from 'sonner';

export const useWebSocket = (userId) => {
    const [notifications, setNotifications] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const clientRef = useRef(null);

    useEffect(() => {
        console.log("WebSocket useEffect triggered. userId:", userId);
        if (!userId) {
            console.log("No userId provided, skipping WebSocket connection.");
            return;
        }

        const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:8080';
        const wsUrl = `${baseUrl}/ws`;
        console.log("Initializing STOMP with wsUrl:", wsUrl);

        try {
            const client = new Client({
                webSocketFactory: () => new SockJS(wsUrl),
                debug: (str) => console.log("[STOMP Debug]", str),
                reconnectDelay: 5000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
            });

            client.onConnect = () => {
                console.log("Connected to STOMP via SockJS");
                setIsConnected(true);
                
                // Subscribe to user-specific notifications
                client.subscribe(`/topic/notifications/${userId}`, (message) => {
                    const notification = JSON.parse(message.body);
                    setNotifications(prev => [notification, ...prev]);
                    toast(notification.title, { description: notification.message });
                });
            };
            
            client.onDisconnect = () => {
                console.log("Disconnected from STOMP");
                setIsConnected(false);
            };
            
            client.onWebSocketClose = () => {
                console.log("WebSocket closed");
                setIsConnected(false);
            };

            client.onWebSocketError = (event) => {
                console.error('WebSocket Error:', event);
            };

            client.onStompError = (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            };

            console.log("Calling client.activate()...");
            client.activate();
            clientRef.current = client;

            return () => {
                console.log("Cleaning up STOMP client...");
                if (clientRef.current) {
                    clientRef.current.deactivate();
                }
                setIsConnected(false);
            };
        } catch (error) {
            console.error("Error setting up STOMP client:", error);
        }
    }, [userId]);

    return { clientRef, isConnected, notifications };
};
