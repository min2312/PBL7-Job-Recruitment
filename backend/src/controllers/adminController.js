import adminService from "../service/adminService";
import {
	verifyRefreshToken,
	CreateJWT,
	CreateRefreshJWT,
} from "../middleware/JWT_Action";
import {
	clearAuthCookies,
	setAuthCookies,
} from "../helpers/authCookies";
require("dotenv").config();

let HandleLoginAdmin = async (req, res) => {
	let email = req.body.email;
	let pass = req.body.password;
	if (!email || !pass) {
		return res.status(500).json({
			errcode: 1,
			message: "Missing inputs parameter!",
		});
	}

	let userdata = await adminService.HandleAdminLogin(email, pass);
	if (
		userdata &&
		userdata.DT &&
		userdata.DT.access_token &&
		userdata.DT.refresh_token
	) {
		clearAuthCookies(res, "user");
		setAuthCookies(
			res,
			"admin",
			userdata.DT.access_token,
			userdata.DT.refresh_token,
		);
	}
	return res.status(200).json({
		errcode: userdata.errCode,
		message: userdata.errMessage,
		user: userdata.user ? userdata.user : {},
		DT: userdata.DT,
	});
};

const HandleLogOut = (req, res) => {
	try {
		clearAuthCookies(res, "admin");
		return res.status(200).json({
			errCode: 0,
			errMessage: "Clear cookie done",
		});
	} catch (e) {
		console.log(e);
		return res.status(500).json({
			errCode: -1,
			errMessage: "Error from server",
		});
	}
};

const HandleRefreshAdminToken = (req, res) => {
	const refreshToken = req.cookies?.refreshJwt2 || req.body?.refresh_token;
	if (!refreshToken) {
		return res.status(401).json({
			errCode: -2,
			errMessage: "Admin refresh token is missing",
		});
	}

	const decoded = verifyRefreshToken(refreshToken);
	if (!decoded || decoded.error === "TokenExpiredError") {
		clearAuthCookies(res, "admin");
		return res.status(401).json({
			errCode: -2,
			errMessage:
				decoded?.error === "TokenExpiredError"
					? "Refresh token has expired. Please log in again."
					: "Invalid admin refresh token.",
		});
	}

	const { iat, exp, ...payload } = decoded;
	const accessToken = CreateJWT(payload);
	const newRefreshToken = CreateRefreshJWT(payload);
	setAuthCookies(res, "admin", accessToken, newRefreshToken);

	return res.status(200).json({
		errCode: 0,
		errMessage: "Admin token refreshed successfully",
		DT: {
			access_token: accessToken,
			refresh_token: newRefreshToken,
		},
	});
};

const getAdminAccount = async (req, res) => {
	if (!req.admin) {
		return res.status(401).json({
			errCode: -1,
			errMessage: "Not Authenticated the admin",
		});
	}
	return res.status(200).json({
		errCode: 0,
		errMessage: "Ok!",
		DT: {
			access_token: req.adminToken,
			id: req.admin.id,
			name: req.admin.name || req.admin.fullName || req.admin.email,
			email: req.admin.email,
			role: req.admin.role || "ADMIN",
		},
	});
};

//DASHBOARD ADMIN CONTROLLERS
// DASHBOARD ADMIN CONTROLLERS
const HandleGetAllUsers = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const search = req.query.search || "";
		const role = req.query.role || "ALL";

		const data = await adminService.getAllUsersPaginated(page, limit, search, role);
		return res.status(200).json({
			errCode: 0,
			errMessage: "OK",
			data,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({ errCode: -1, errMessage: "Error from server" });
	}
};

const HandleGetAllJobs = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const search = req.query.search || "";
		const status = req.query.status || "ALL";

		const data = await adminService.getAllJobsPaginated(page, limit, search, status);
		return res.status(200).json({
			errCode: 0,
			errMessage: "OK",
			data,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({ errCode: -1, errMessage: "Error from server" });
	}
};

const HandleGetAllCompanies = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const search = req.query.search || "";

		const data = await adminService.getAllCompaniesPaginated(page, limit, search);
		return res.status(200).json({
			errCode: 0,
			errMessage: "OK",
			data,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({ errCode: -1, errMessage: "Error from server" });
	}
};

const HandleGetAllApplications = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;

		const data = await adminService.getAllApplicationsPaginated(page, limit);
		return res.status(200).json({
			errCode: 0,
			errMessage: "OK",
			data,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({ errCode: -1, errMessage: "Error from server" });
	}
};

const HandleSuspendUser = async (req, res) => {
	try {
		const { userId } = req.body;
		if (!userId) {
			return res.status(400).json({ errCode: 1, errMessage: "Missing required parameter: userId" });
		}
		const result = await adminService.suspendUser(userId);
		return res.status(200).json(result);
	} catch (error) {
		return res.status(500).json({ errCode: -1, errMessage: "Error from server" });
	}
};

const HandleActivateUser = async (req, res) => {
	try {
		const { userId } = req.body;
		if (!userId) {
			return res.status(400).json({ errCode: 1, errMessage: "Missing required parameter: userId" });
		}
		const result = await adminService.activateUser(userId);
		return res.status(200).json(result);
	} catch (error) {
		return res.status(500).json({ errCode: -1, errMessage: "Error from server" });
	}
};

const HandleDeleteUser = async (req, res) => {
	try {
		const { userId } = req.body;
		if (!userId) {
			return res.status(400).json({ errCode: 1, errMessage: "Missing required parameter: userId" });
		}
		const result = await adminService.deleteUser(userId);
		return res.status(200).json(result);
	} catch (error) {
		return res.status(500).json({ errCode: -1, errMessage: "Error from server" });
	}
};

const HandleUpdateJobStatus = async (req, res) => {
	try {
		const { jobId, status } = req.body;
		if (!jobId || !status) {
			return res.status(400).json({ errCode: 1, errMessage: "Missing required parameters" });
		}
		const result = await adminService.updateJobStatus(jobId, status);
		return res.status(200).json(result);
	} catch (error) {
		return res.status(500).json({ errCode: -1, errMessage: "Error from server" });
	}
};

const HandleDeleteJob = async (req, res) => {
	try {
		const { jobId } = req.body;
		if (!jobId) {
			return res.status(400).json({ errCode: 1, errMessage: "Missing required parameter: jobId" });
		}
		const result = await adminService.deleteJob(jobId);
		return res.status(200).json(result);
	} catch (error) {
		return res.status(500).json({ errCode: -1, errMessage: "Error from server" });
	}
};

const HandleGetStatistics = async (req, res) => {
	try {
		const stats = await adminService.getStatistics();
		return res.status(200).json({
			errCode: 0,
			errMessage: "OK",
			data: stats,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({ errCode: -1, errMessage: "Error from server" });
	}
};

const HandleGetCompanyDetail = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await adminService.getCompanyDetail(id);
		return res.status(200).json({
			errCode: 0,
			errMessage: "OK",
			data,
		});
	} catch (error) {
		return res.status(500).json({ errCode: -1, errMessage: "Error from server" });
	}
};

const HandleGetJobDetail = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await adminService.getJobDetail(id);
		return res.status(200).json({
			errCode: 0,
			errMessage: "OK",
			data,
		});
	} catch (error) {
		return res.status(500).json({ errCode: -1, errMessage: "Error from server" });
	}
};

module.exports = {
	HandleLoginAdmin,
	HandleLogOut,
	HandleRefreshAdminToken,
	getAdminAccount,

	HandleGetAllUsers,
	HandleSuspendUser,
	HandleActivateUser,
	HandleDeleteUser,
	HandleGetAllJobs,
	HandleUpdateJobStatus,
	HandleDeleteJob,
	HandleGetAllCompanies,
	HandleGetAllApplications,
	HandleGetStatistics,
	HandleGetCompanyDetail,
	HandleGetJobDetail,
};
