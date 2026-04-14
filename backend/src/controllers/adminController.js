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
const HandleGetAllUsers = async (req, res) => {
	try {
		const users = await adminService.getAllUsers();
		return res.status(200).json({
			errCode: 0,
			errMessage: "OK",
			data: users,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			errCode: -1,
			errMessage: "Error from server",
		});
	}
};

const HandleSuspendUser = async (req, res) => {
	try {
		const { userId } = req.body;
		if (!userId) {
			return res.status(400).json({
				errCode: 1,
				errMessage: "Missing required parameter: userId",
			});
		}
		const result = await adminService.suspendUser(userId);
		return res.status(200).json(result);
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			errCode: -1,
			errMessage: "Error from server",
		});
	}
};

const HandleActivateUser = async (req, res) => {
	try {
		const { userId } = req.body;
		if (!userId) {
			return res.status(400).json({
				errCode: 1,
				errMessage: "Missing required parameter: userId",
			});
		}
		const result = await adminService.activateUser(userId);
		return res.status(200).json(result);
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			errCode: -1,
			errMessage: "Error from server",
		});
	}
};

const HandleDeleteUser = async (req, res) => {
	try {
		const { userId } = req.body;
		if (!userId) {
			return res.status(400).json({
				errCode: 1,
				errMessage: "Missing required parameter: userId",
			});
		}
		const result = await adminService.deleteUser(userId);
		return res.status(200).json(result);
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			errCode: -1,
			errMessage: "Error from server",
		});
	}
};

const HandleGetAllPosts = async (req, res) => {
	try {
		const posts = await adminService.getAllPosts();
		return res.status(200).json({
			errCode: 0,
			errMessage: "OK",
			data: posts,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			errCode: -1,
			errMessage: "Error from server",
		});
	}
};

const HandleBlockPost = async (req, res) => {
	try {
		const { postId } = req.body;
		if (!postId) {
			return res.status(400).json({
				errCode: 1,
				errMessage: "Missing required parameter: postId",
			});
		}
		const result = await adminService.blockPost(postId);
		return res.status(200).json(result);
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			errCode: -1,
			errMessage: "Error from server",
		});
	}
};

const HandleUnblockPost = async (req, res) => {
	try {
		const { postId } = req.body;
		if (!postId) {
			return res.status(400).json({
				errCode: 1,
				errMessage: "Missing required parameter: postId",
			});
		}
		const result = await adminService.unblockPost(postId);
		return res.status(200).json(result);
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			errCode: -1,
			errMessage: "Error from server",
		});
	}
};

const HandleDeletePost = async (req, res) => {
	try {
		const { postId } = req.body;
		if (!postId) {
			return res.status(400).json({
				errCode: 1,
				errMessage: "Missing required parameter: postId",
			});
		}
		const result = await adminService.deletePost(postId);
		return res.status(200).json(result);
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			errCode: -1,
			errMessage: "Error from server",
		});
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
		return res.status(500).json({
			errCode: -1,
			errMessage: "Error from server",
		});
	}
};

module.exports = {
	HandleLoginAdmin: HandleLoginAdmin,
	HandleLogOut: HandleLogOut,
	HandleRefreshAdminToken: HandleRefreshAdminToken,
	getAdminAccount: getAdminAccount,

	HandleGetAllUsers: HandleGetAllUsers,
	HandleSuspendUser: HandleSuspendUser,
	HandleActivateUser: HandleActivateUser,
	HandleDeleteUser: HandleDeleteUser,
	HandleGetAllPosts: HandleGetAllPosts,
	HandleBlockPost: HandleBlockPost,
	HandleUnblockPost: HandleUnblockPost,
	HandleDeletePost: HandleDeletePost,
	HandleGetStatistics: HandleGetStatistics,
};
