import { io } from 'socket.io-client';

const socket = io('https://connectsphere-backend-cssq.onrender.com', {
  transports: ['websocket'],
});

export default socket;
