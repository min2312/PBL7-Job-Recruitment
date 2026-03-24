import adminService from "../service/adminService";
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
	if (userdata && userdata.DT && userdata.DT.access_token) {
		res.cookie("jwt2", userdata.DT.access_token, {
			httpOnly: true,
			maxAge: process.env.maxAgeCookie,
			secure: true,
			sameSite: "none",
		});
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
		res.clearCookie("jwt2");
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
			fullName: req.admin.fullName,
			email: req.admin.email,
			role: req.admin.role,
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
