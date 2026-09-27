const jwt = require("jsonwebtoken");
const User = require("../models/User");

function setupSocket(server) {
  const { Server } = require("socket.io");

  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Store multiple socket connections for each user.
  const onlineUsers = new Map();

  // ============================================================
  // SOCKET AUTHENTICATION
  // ============================================================

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("Authentication required"));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      socket.userId = decoded.userId;

      if (!socket.userId) {
        return next(new Error("Invalid authentication token"));
      }
      next();
    } catch (error) {
      console.error("Socket authentication failed:", error.message);
      next(new Error("Invalid authentication token"));
    }
  });

  // ============================================================
  // CONNECTION
  // ============================================================

  io.on("connection", (socket) => {
    console.log("New authenticated client connected:", socket.id);
    console.log(`User: ${socket.userId}`);

    // ============================================================
    // REGISTER USER / ONLINE STATUS
    // ============================================================

    const userId = socket.userId;

    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }

    onlineUsers.get(userId).add(socket.id);

    console.log(`User ${userId} registered with socket ${socket.id}`);

    console.log(`Online users: ${onlineUsers.size}`);

    // Send list of currently online users to this socket.
    const currentlyOnline = Array.from(onlineUsers.keys()).filter(
      (id) => id !== userId,
    );

    socket.emit("currently-online", currentlyOnline);

    // Only tell everyone else that this user came online
    // if this is their first active connection.
    if (onlineUsers.get(userId).size === 1) {
      socket.broadcast.emit("friend-online", {
        userId,
      });
    }

    // ============================================================
    // NUDGE
    // ============================================================

    socket.on("nudge", async (data) => {
      const { toUserId, message } = data;

      if (!toUserId) {
        return;
      }

      console.log(`Nudge from ${socket.userId} to ${toUserId}: ${message}`);

      const recipientSockets = onlineUsers.get(toUserId);

      if (!recipientSockets || recipientSockets.size === 0) {
        console.log(` User ${toUserId} is offline`);
        return;
      }

      try {
        const sender = await User.findById(socket.userId);

        const notification = {
          fromUserId: socket.userId,
          fromName: sender?.name || "Someone",
          message: message || "You received a nudge!",
          timestamp: new Date(),
        };

        // Send to all of the recipient's active connections.
        for (const socketId of recipientSockets) {
          io.to(socketId).emit("receive-nudge", notification);
        }
      } catch (error) {
        console.error("Error fetching sender name:", error);

        const notification = {
          fromUserId: socket.userId,
          fromName: "Someone",
          message: message || "You received a nudge!",
          timestamp: new Date(),
        };

        for (const socketId of recipientSockets) {
          io.to(socketId).emit("receive-nudge", notification);
        }
      }
    });

    // ============================================================
    // JOIN STUDY SESSION
    // ============================================================
    // Join a study session room
    socket.on("join-session", (sessionId) => {
      if (socket.sessionId) {
        socket.leave(`session-${socket.sessionId}`);
      }
      socket.join(`session-${sessionId}`);
      socket.sessionId = sessionId;
      console.log(`Socket ${socket.id} joined session ${sessionId}`);

      //  Only notify people INSIDE the session
      socket.to(`session-${sessionId}`).emit("participant-joined", {
        userId: socket.userId,
        sessionId: sessionId,
        timestamp: new Date(),
      });
    });

    // Leave a study session
    socket.on("leave-session", () => {
      if (socket.sessionId) {
        const sessionId = socket.sessionId;
        socket.leave(`session-${sessionId}`);
        console.log(` Socket ${socket.id} left session ${sessionId}`);

        // Notify people in the session only
        socket.to(`session-${sessionId}`).emit("participant-left", {
          userId: socket.userId,
          sessionId: sessionId,
          timestamp: new Date(),
        });

        socket.sessionId = null;
      }
    });

    // Session ended
    socket.on("session-ended", (data) => {
      const { sessionId, duration } = data;
      if (sessionId) {
        io.to(`session-${sessionId}`).emit("session-ended", {
          duration,
          endedBy: socket.userId,
          timestamp: new Date(),
        });

        // Only broadcast once when ended
        io.emit("session-ended-global", { sessionId });

        io.in(`session-${sessionId}`).socketsLeave(sessionId);
      }
    });

    //  task updated event
    socket.on("task-updated", (data) => {
      const { sessionId, task } = data;
      if (sessionId) {
        socket.to(`session-${sessionId}`).emit("task-updated", {
          sessionId,
          task,
          updatedBy: socket.userId,
          timestamp: new Date(),
        });
      }
    });
    // ============================================================
    // LEAVE STUDY SESSION
    // ============================================================

    socket.on("leave-session", () => {
      if (!socket.sessionId) {
        return;
      }

      const sessionId = socket.sessionId;

      socket.leave(`session-${sessionId}`);

      console.log(` Socket ${socket.id} left session ${sessionId}`);

      socket.to(`session-${sessionId}`).emit("participant-left", {
        userId: socket.userId,
        sessionId,
        timestamp: new Date(),
      });

      io.emit("session-updated", {
        sessionId,
      });

      socket.sessionId = null;
    });

    // ============================================================
    // TIMER STARTED
    // ============================================================

    socket.on("timer-started", (data) => {
      const { sessionId, timerElapsed, timerRunning, timerStartedAt } = data;

      if (!sessionId) {
        return;
      }

      socket.to(`session-${sessionId}`).emit("timer-updated", {
        sessionId,
        timerElapsed,
        timerRunning,
        timerStartedAt,
        updatedBy: socket.userId,
        timestamp: new Date(),
      });
    });

    // ============================================================
    // TIMER PAUSED
    // ============================================================

    socket.on("timer-paused", (data) => {
      const { sessionId, timerElapsed, timerRunning, timerStartedAt } = data;

      if (!sessionId) {
        return;
      }

      socket.to(`session-${sessionId}`).emit("timer-updated", {
        sessionId,
        timerElapsed,
        timerRunning,
        timerStartedAt,
        updatedBy: socket.userId,
        timestamp: new Date(),
      });
    });

    // ============================================================
    // TASK UPDATED
    // ============================================================

    socket.on("task-updated", (data) => {
      const { sessionId } = data;

      if (!sessionId) {
        return;
      }

      socket.to(`session-${sessionId}`).emit("task-updated", {
        sessionId,
        updatedBy: socket.userId,
        timestamp: new Date(),
      });
    });

    // ============================================================
    // SESSION ENDED
    // ============================================================

    socket.on("session-ended", (data) => {
      const { sessionId, duration } = data;

      if (!sessionId) {
        return;
      }

      io.to(`session-${sessionId}`).emit("session-ended", {
        duration,
        endedBy: socket.userId,
        timestamp: new Date(),
      });

      io.emit("session-updated", {
        sessionId,
      });

      // Remove everyone from the Socket.IO room.
      io.in(`session-${sessionId}`).socketsLeave(`session-${sessionId}`);
    });

    // ============================================================
    // DISCONNECT
    // ============================================================

    socket.on("disconnect", () => {
      console.log(" Client disconnected:", socket.id);

      const userSockets = onlineUsers.get(socket.userId);

      if (userSockets) {
        userSockets.delete(socket.id);

        // User is only considered offline when
        // ALL their sockets have disconnected.
        if (userSockets.size === 0) {
          onlineUsers.delete(socket.userId);

          socket.broadcast.emit("friend-offline", {
            userId: socket.userId,
          });
        }
      }

      console.log(`Online users: ${onlineUsers.size}`);

      // Leave study session if the socket was in one.
      if (socket.sessionId) {
        const sessionId = socket.sessionId;

        socket.to(`session-${sessionId}`).emit("participant-left", {
          userId: socket.userId,
          sessionId,
          timestamp: new Date(),
        });

        io.emit("session-updated", {
          sessionId,
        });

        socket.leave(`session-${sessionId}`);
      }
    });
  });

  return io;
}

module.exports = setupSocket;
