import { Server } from "socket.io";
import { handleUpdateTable } from "./apiSocket.js";
import { verifySocketToken } from "../middleware/JWT_Action.js";
import * as chatService from "../service/chatService.js";
import { createNotification } from "../service/notificationService.js";

let io;

const initSocket = (server) => {
	io = new Server(server, {
		cors: {
			origin: [`${process.env.CLIENT_URL}`],
			methods: ["GET", "POST"],
			credentials: true,
		},
	});

	console.log("Socket server initialized and listening for connections");

	io.use(verifySocketToken);

	io.on("connection", (socket) => {
		// Join a room based on user ID
		if (socket.user && socket.user.id) {
			const userRoom = socket.user.id.toString();
			socket.join(userRoom);
			console.log(`User ${socket.user.id} joined room ${userRoom}`);
		}

		// Track current active conversation for each socket
		socket.activeConversation = null;

		socket.on("joinConversation", (conversationId) => {
			socket.join(`conversation_${conversationId}`);
			socket.activeConversation = conversationId;
		});

		socket.on("leaveConversation", () => {
			if (socket.activeConversation) {
				socket.leave(`conversation_${socket.activeConversation}`);
				socket.activeConversation = null;
			}
		});

		socket.on("sendMessage", async (data) => {
			try {
				const { recipientId, content, conversationId } = data;

				const message = await chatService.sendMessage({
					sender_id: socket.user.id,
					receiver_id: recipientId,
					content: content,
				});

				const messageData = message.toJSON();

				// Emit to recipient
				io.to(recipientId.toString()).emit("receiveMessage", messageData);

				// Emit back to sender (to sync multiple tabs)
				socket.emit("receiveMessage", messageData);

				// Only notify recipient if they are NOT actively viewing this specific conversation
				const recipientSockets = await io.in(recipientId.toString()).fetchSockets();
				const isViewing = recipientSockets.some(s => s.activeConversation == message.conversation_id);

				if (!isViewing) {
					await createNotification({
						receiver_id: recipientId,
						sender_id: socket.user.id,
						type: "NEW_MESSAGE",
						content: `Bạn có tin nhắn mới từ ${socket.user.name || "một người dùng"}.`,
						reference_id: socket.user.id.toString(),
						send_email: false,
					});
				}
			} catch (error) {
				console.error("Error in socket sendMessage:", error);
			}
		});

		socket.on("markAsRead", async (data) => {
			try {
				const { conversationId } = data;
				await chatService.markAsRead(conversationId, socket.user.id);
				
				// Get new total unread count
				const totalUnread = await chatService.getTotalUnreadMessages(socket.user.id);
				socket.emit("unreadCountUpdate", { totalUnread });
			} catch (error) {
				console.error("Error in socket markAsRead:", error);
			}
		});

		socket.on("updatePost", (updatedPost) => {
			io.emit("postUpdated", updatedPost);
		});

		socket.on("deletePost", (postToDelete) => {
			io.emit("postDeleted", postToDelete);
		});

		socket.on("sendFriendRequest", ({ data, toUserId, friendshipStatus }) => {
			io.emit("friendRequestReceived", { data, toUserId, friendshipStatus });
		});

		socket.on("notification", ({ userId }) => {
			io.emit("notificationReceived", { userId });
		});

		// =============== WebRTC signaling events ===============
		// Client A initiates a call to userId 'to'
		socket.on("call:init", ({ to, callType }) => {
			if (!to) return;
			const fromId = socket.user?.id;
			if (!fromId) return;
			console.log(`Call init from ${fromId} to ${to} type=${callType}`);
			io.to(to.toString()).emit("call:incoming", {
				from: fromId,
				callType: callType || "video",
				caller: {
					id: fromId,
					name:
						socket.user?.fullName ||
						socket.user?.name ||
						socket.user?.email ||
						`${fromId}`,
					avatar: socket.user?.profilePicture || null,
				},
			});
		});

		// Exchange SDP / ICE candidates
		socket.on("call:signal", ({ to, signal }) => {
			if (!to || !signal) return;
			const fromId = socket.user?.id;
			io.to(to.toString()).emit("call:signal", { from: fromId, signal });
		});

		socket.on("call:mode-change", ({ to, mode }) => {
			io.to(to.toString()).emit("call:mode-change", { mode });
		});

		// Mic toggle notification
		socket.on("call:mic-toggle", ({ to, muted }) => {
			if (!to) return;
			io.to(to.toString()).emit("call:mic-toggle", { muted });
		});

		// Video toggle notification
		socket.on("call:video-toggle", ({ to, videoOff }) => {
			if (!to) return;
			io.to(to.toString()).emit("call:video-toggle", { videoOff });
		});

		// Callee accepts
		socket.on("call:accept", ({ to, callType }) => {
			if (!to) return;
			const fromId = socket.user?.id;
			console.log(`Call accepted by ${fromId} for ${to}`);
			io.to(to.toString()).emit("call:accepted", {
				from: fromId,
				callType: callType || "video",
			});
		});

		// Callee rejects
		socket.on("call:reject", ({ to }) => {
			if (!to) return;
			const fromId = socket.user?.id;
			console.log(`Call rejected by ${fromId} for ${to}`);
			io.to(to.toString()).emit("call:rejected", { from: fromId });
		});

		// Either party ends call
		socket.on("call:end", ({ to }) => {
			if (!to) return;
			const fromId = socket.user?.id;
			console.log(`Call end from ${fromId} to ${to}`);
			io.to(to.toString()).emit("call:ended", { from: fromId });
		});
		// ========================================================

		socket.on("joinRoom", (roomId) => {
			socket.join(roomId);
			console.log(`User joined room ${roomId}`);
		});

		socket.on("room:send-message", (data) => {
			const { roomId, message, senderName, senderAvatar, timestamp } = data;
			io.to(roomId).emit("room:receive-message", {
				id: Date.now() + "_" + Math.random().toString(36).substring(2, 7),
				message,
				senderName,
				senderAvatar,
				timestamp: timestamp || new Date().toISOString(),
				senderId: socket.user?.id,
			});
		});

		socket.on("room:screen-share", (data) => {
			const { roomId, userId, isSharing } = data;
			io.to(roomId).emit("room:screen-share-changed", { userId, isSharing });
		});

		socket.on("room:mic-toggle", (data) => {
			const { roomId, userId, muted } = data;
			io.to(roomId).emit("room:mic-toggle-changed", { userId, muted });
		});

		socket.on("room:video-toggle", (data) => {
			const { roomId, userId, videoOff } = data;
			io.to(roomId).emit("room:video-toggle-changed", { userId, videoOff });
		});

		socket.on("disconnect", (reason) => {
			// console.log(`Client disconnected: ${socket.id}, Reason: ${reason}`);
		});

		socket.on("editMessage", ({ messageId, newContent, recipientId }) => {
			console.log(
				`Message ${messageId} edited by ${socket.user.id}, notifying ${recipientId}`,
			);
			io.to(recipientId.toString()).emit("messageEdited", {
				messageId,
				newContent,
				senderId: socket.user.id,
			});
		});
	});
};

const getIO = () => {
	if (!io) throw new Error("Socket has not been initialized!");
	return io;
};

export { initSocket, getIO };
