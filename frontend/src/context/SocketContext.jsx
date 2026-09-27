import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [onlineFriends, setOnlineFriends] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Don't connect if not logged in
    if (!token) {
      return;
    }

    let userId = null;
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const decoded = JSON.parse(atob(base64));
      userId = decoded.userId;
    } catch (error) {
      console.error("Failed to decode authentication token:", error);
      return;
    }

    console.log("Connecting to socket...");

    //  Send the token in the handshake
    const newSocket = io(API_URL, {
      auth: { token }
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log(" Connected to server");
      setIsConnected(true);
    });

    newSocket.on("connect_error", (err) => {
      console.error(" Socket connection error:", err.message);
    });

    newSocket.on("disconnect", () => {
      console.log(" Disconnected from server");
      setIsConnected(false);
    });

    newSocket.on("currently-online", (users) => {
      console.log(" Currently online:", users);
      setOnlineFriends(users);
    });

    newSocket.on("friend-online", (data) => {
      console.log(" Friend online:", data);
      setOnlineFriends((prev) =>
        prev.includes(data.userId) ? prev : [...prev, data.userId]
      );
    });

    newSocket.on("friend-offline", (data) => {
      console.log(" Friend offline:", data);
      setOnlineFriends((prev) => prev.filter((id) => id !== data.userId));
    });

    newSocket.on("receive-nudge", (data) => {
      console.log("Received nudge:", data);
      setNotifications((prev) => [
        {
          id: Date.now(),
          message: `${data.fromName || "Someone"} sent you a nudge!`,
          ...data
        },
        ...prev
      ]);
    });

    return () => {
      newSocket.close();
      setSocket(null);
      setIsConnected(false);
    };
  }, [API_URL]);

  const sendNudge = (toUserId, message = "") => {
    if (!socket || !isConnected) return false;
    socket.emit("nudge", { toUserId, message });
    return true;
  };

  const clearNotification = (id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        notifications,
        onlineFriends,
        sendNudge,
        clearNotification
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;