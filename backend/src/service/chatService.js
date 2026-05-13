import db from "../models";
import { Op, Sequelize } from "sequelize";

const getConversations = async (userId) => {
	try {
		const conversations = await db.Conversation.findAll({
			where: {
				[Op.or]: [{ user_id_1: userId }, { user_id_2: userId }],
			},
			order: [["last_message_at", "DESC"]],
			include: [
				{ model: db.User, as: "user1", attributes: ["id", "name", "profile_picture"] },
				{ model: db.User, as: "user2", attributes: ["id", "name", "profile_picture"] },
			],
		});

		return conversations.map((conv) => {
			const isUser1 = conv.user_id_1 === userId;
			const partner = isUser1 ? conv.user2 : conv.user1;
			const unread_count = isUser1 ? conv.unread_count_1 : conv.unread_count_2;

			return {
				id: conv.id,
				partner,
				last_message: conv.last_message,
				last_message_at: conv.last_message_at,
				unread_count,
			};
		});
	} catch (error) {
		console.error(error);
		throw error;
	}
};

const getMessages = async (userId, partnerId) => {
	try {
		// Find conversation first
		const conversation = await db.Conversation.findOne({
			where: {
				[Op.or]: [
					{ user_id_1: userId, user_id_2: partnerId },
					{ user_id_1: partnerId, user_id_2: userId },
				],
			},
		});

		if (!conversation) return [];

		// Mark as read when fetching messages
		await markAsRead(conversation.id, userId);

		return await db.Message.findAll({
			where: { conversation_id: conversation.id },
			order: [["createdAt", "ASC"]],
		});
	} catch (error) {
		console.error(error);
		throw error;
	}
};

const sendMessage = async (data) => {
	try {
		const { sender_id, receiver_id, content } = data;

		// 1. Find or Create Conversation
		const user_id_1 = sender_id < receiver_id ? sender_id : receiver_id;
		const user_id_2 = sender_id < receiver_id ? receiver_id : sender_id;

		let [conversation, created] = await db.Conversation.findOrCreate({
			where: { user_id_1, user_id_2 },
			defaults: {
				user_id_1,
				user_id_2,
				last_message: content,
				last_message_at: new Date(),
			},
		});

		// 2. Create Message
		const message = await db.Message.create({
			sender_id,
			receiver_id,
			conversation_id: conversation.id,
			content,
		});

		// 3. Update Conversation (if not just created)
		if (!created) {
			const updateData = {
				last_message: content,
				last_message_at: new Date(),
			};

			// Increment unread count for the receiver
			if (conversation.user_id_1 === receiver_id) {
				updateData.unread_count_1 = (conversation.unread_count_1 || 0) + 1;
			} else {
				updateData.unread_count_2 = (conversation.unread_count_2 || 0) + 1;
			}

			await conversation.update(updateData);
		} else {
			// If created, the unread count for receiver is already 0 in defaults, 
			// but it should be 1 now since a message was sent.
			if (conversation.user_id_1 === receiver_id) {
				await conversation.update({ unread_count_1: 1 });
			} else {
				await conversation.update({ unread_count_2: 1 });
			}
		}

		return message;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

const markAsRead = async (conversationId, userId) => {
	try {
		const conversation = await db.Conversation.findByPk(conversationId);
		if (!conversation) return;

		if (conversation.user_id_1 === userId) {
			await conversation.update({ unread_count_1: 0 });
		} else if (conversation.user_id_2 === userId) {
			await conversation.update({ unread_count_2: 0 });
		}
	} catch (error) {
		console.error("Error in markAsRead:", error);
	}
};

const findOrCreateConversation = async (candidateId, employerId, currentUserId) => {
	const user_id_1 = candidateId < employerId ? candidateId : employerId;
	const user_id_2 = candidateId < employerId ? employerId : candidateId;

	const [conversation] = await db.Conversation.findOrCreate({
		where: { user_id_1, user_id_2 },
		defaults: {
			user_id_1,
			user_id_2,
		},
	});

	const partnerId = currentUserId == candidateId ? employerId : candidateId;
	const partner = await db.User.findByPk(partnerId, {
		attributes: ["id", "name", "profile_picture"],
	});

	return {
		id: conversation.id,
		partner,
		last_message: conversation.last_message,
		last_message_at: conversation.last_message_at,
		unread_count: currentUserId == conversation.user_id_1 ? conversation.unread_count_1 : conversation.unread_count_2,
	};
};

const getTotalUnreadMessages = async (userId) => {
	try {
		const result = await db.Conversation.findAll({
			where: {
				[Op.or]: [
					{ user_id_1: userId, unread_count_1: { [Op.gt]: 0 } },
					{ user_id_2: userId, unread_count_2: { [Op.gt]: 0 } },
				],
			},
			attributes: [
				[
					Sequelize.fn(
						"SUM",
						Sequelize.literal(
							`CASE WHEN user_id_1 = ${userId} THEN unread_count_1 ELSE unread_count_2 END`,
						),
					),
					"totalUnread",
				],
			],
			raw: true,
		});
		return parseInt(result[0].totalUnread) || 0;
	} catch (error) {
		console.error(error);
		return 0;
	}
};

export { getConversations, getMessages, sendMessage, findOrCreateConversation, markAsRead, getTotalUnreadMessages };

