import { io } from "socket.io-client";

const API_BASE = process.env.REACT_APP_SERVER;

let socket = null;

export const initSocket = (userId) => {
  if (!socket) {
    socket = io(API_BASE, {
      transports: ["websocket"],
      autoConnect: false,
    });
  }

  // 🔥 Always update auth BEFORE connect
  socket.auth = { userId };

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
};

export const getSocket = () => socket;
