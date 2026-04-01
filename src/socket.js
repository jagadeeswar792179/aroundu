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

  if (!socket.connected) {
    socket.auth = { userId }; // 🔥 IMPORTANT
    socket.connect();

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);

      // your backend expects this
      socket.emit("join", userId);
    });
  }

  return socket;
};

export const getSocket = () => socket;
