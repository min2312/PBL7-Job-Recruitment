import * as interviewService from "../service/interviewService";

const handleCreateInterview = async (req, res) => {
	try {
		const data = {
			...req.body,
			employer_id: req.user.id,
		};
		const interview = await interviewService.createInterview(data);
		return res.status(200).json({
			errCode: 0,
			data: interview,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			errCode: 1,
			message: "Error from server",
		});
	}
};

const handleUpdateStatus = async (req, res) => {
	try {
		const { id, status, note } = req.body;
		const userId = req.user.id;
		const interview = await interviewService.updateInterviewStatus(
			id,
			status,
			note,
			userId,
		);
		return res.status(200).json({
			errCode: 0,
			data: interview,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			errCode: 1,
			message: "Error from server",
		});
	}
};

const handleUpdateInterview = async (req, res) => {
	try {
		const { id, ...data } = req.body;
		const interview = await interviewService.updateInterview(id, data);
		return res.status(200).json({
			errCode: 0,
			data: interview,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			errCode: 1,
			message: error.message || "Error from server",
		});
	}
};

const handleDeleteInterview = async (req, res) => {
	try {
		const { id } = req.params;
		await interviewService.deleteInterview(id);
		return res.status(200).json({
			errCode: 0,
			message: "Deleted successfully",
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			errCode: 1,
			message: "Error from server",
		});
	}
};

const handleGetInterviews = async (req, res) => {
	try {
		const userId = req.user.id;
		const role = req.user.role;
		const { page, limit, status, date } = req.query;
		const result = await interviewService.getInterviewsByUser(userId, role, {
			page,
			limit,
			status,
			date,
		});
		return res.status(200).json({
			errCode: 0,
			data: result.interviews,
			pagination: {
				total: result.total,
				currentPage: result.currentPage,
				totalPages: result.totalPages,
			},
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			errCode: 1,
			message: "Error from server",
		});
	}
};

const handleGetAgoraToken = async (req, res) => {
	try {
		const interviewId = req.params.id;
		const userId = req.user.id;
		const result = await interviewService.getInterviewAgoraToken(interviewId, userId);
		return res.status(200).json({
			errCode: 0,
			data: result,
		});
	} catch (error) {
		console.error("Error in handleGetAgoraToken:", error);
		const status = error.statusCode || 500;
		return res.status(status).json({
			errCode: status === 403 ? 2 : 1,
			message: error.message || "Lỗi máy chủ",
		});
	}
};

export {
	handleCreateInterview,
	handleUpdateStatus,
	handleGetInterviews,
	handleUpdateInterview,
	handleDeleteInterview,
	handleGetAgoraToken,
};
