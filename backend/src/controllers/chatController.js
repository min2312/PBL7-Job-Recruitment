import * as chatService from "../service/chatService";

const handleGetConversations = async (req, res) => {
	try {
		const userId = req.user.id;
		const data = await chatService.getConversations(userId);
		return res.status(200).json({
			errCode: 0,
			data,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			errCode: 1,
			message: "Error from server",
		});
	}
};

const handleGetMessages = async (req, res) => {
	try {
		const userId = req.user.id;
		const partnerId = req.params.id; // partnerId passed as id
		const data = await chatService.getMessages(userId, partnerId);
		return res.status(200).json({
			errCode: 0,
			data,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			errCode: 1,
			message: "Error from server",
		});
	}
};

const handleStartConversation = async (req, res) => {
	try {
		const { candidate_id, employer_id } = req.body;
		const data = await chatService.findOrCreateConversation(candidate_id, employer_id, req.user.id);
		return res.status(200).json({
			errCode: 0,
			data,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			errCode: 1,
			message: "Error from server",
		});
	}
};

const handleGetUnreadCount = async (req, res) => {
	try {
		const userId = req.user.id;
		const data = await chatService.getTotalUnreadMessages(userId);
		return res.status(200).json({
			errCode: 0,
			data,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			errCode: 1,
			message: "Error from server",
		});
	}
};

export { handleGetConversations, handleGetMessages, handleStartConversation, handleGetUnreadCount };
