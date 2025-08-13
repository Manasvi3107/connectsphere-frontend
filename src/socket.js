import { io } from 'socket.io-client';

const socket = io('https://connectsphere-backend-cssq.onrender.com', {
  transports: ['websocket'],
  path: '/socket.io/',
  withCredentials: true
});

export default socket;
