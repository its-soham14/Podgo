import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const client = new Client({
    webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
    debug: (str) => console.log(str),
    onConnect: () => {
        console.log("CONNECTED!");
        client.deactivate();
    },
    onStompError: (frame) => {
        console.log("ERROR", frame);
    },
    onWebSocketError: (evt) => {
        console.log("WS ERROR", evt);
    }
});

client.activate();
