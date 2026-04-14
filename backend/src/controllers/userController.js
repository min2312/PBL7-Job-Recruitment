import userService from "../service/userService";
// import apiService from "../service/apiService";
import {
	verifyRefreshToken,
	CreateJWT,
	CreateRefreshJWT,
} from "../middleware/JWT_Action";
import {
	clearAuthCookies,
	setAccessCookie,
	setAuthCookies,
} from "../helpers/authCookies";
require("dotenv").config();

let HandleLogin = async (req, res) => {
	let email = req.body.email;
	let pass = req.body.password;
	if (!email || !pass) {
		return res.status(500).json({
			errcode: 1,
			message: "Missing inputs parameter!",
		});
	}

	let userdata = await userService.HandleUserLogin(email, pass);
	if (
		userdata &&
		userdata.DT &&
		userdata.DT.access_token &&
		userdata.DT.refresh_token
	) {
		clearAuthCookies(res, "admin");
		setAuthCookies(
			res,
			"user",
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

let HandleGetAllUser = async (req, res) => {
	let id = req.query.id;
	if (!id) {
		return res.status(200).json({
			errCode: 1,
			errMessage: "Missing required parameter",
			user: [],
		});
	}
	let user = await userService.getAllUser(id);
	return res.status(200).json({
		errCode: 0,
		errMessage: "OK",
		user: user,
	});
};
let HandleCreateNewUser = async (req, res) => {
	let message = await userService.CreateNewUser(req.body);
	return res.status(200).json(message);
};
let HandleEditUser = async (req, res) => {
	let data = req.body;
	let message = await userService.updateUser(data);
	if (message && message.DT && message.DT.access_token) {
		setAccessCookie(res, "user", message.DT.access_token);
	}
	return res.status(200).json(message);
};

let HandleUpdateProfile = async (req, res) => {
	try {
		let data = req.body;
		let fileImage = req.file;
		let urlImage = data.url_image;
		// Validate that user ID is provided (either from request body or authenticated user)
		if (!data.id && !req.user?.id) {
			if (fileImage) {
				await cloudinary.uploader.destroy(fileImage.filename);
			}
			return res.status(400).json({
				errCode: 1,
				errMessage: "Missing user ID parameter!",
			});
		}

		// Use authenticated user's ID if not provided in body
		if (!data.id && req.user?.id) {
			data.id = req.user.id;
		}
		if (urlImage) {
			const uploadResponse = await cloudinary.uploader.upload(urlImage, {
				folder: "SocialMedia",
			});
			data.image = uploadResponse.secure_url;
		}
		let message = await userService.updateUserProfile(data, fileImage);

		if (message && message.DT && message.DT.access_token) {
			setAccessCookie(res, "user", message.DT.access_token);
		}

		return res.status(200).json(message);
	} catch (error) {
		console.error("Error in HandleUpdateProfile:", error);
		return res.status(500).json({
			errCode: -1,
			errMessage: "Internal server error",
		});
	}
};

// let HandleDeleteUser = async (req, res) => {
// 	if (!req.body.id) {
// 		return res.status(200).json({
// 			errCode: 1,
// 			errMessage: "Missing required parameters!",
// 		});
// 	}
// 	let car = await apiService.GetAllCar(`${req.body.id}`);
// 	car.forEach(async (cars) => {
// 		let ticket = await apiService.DeleteTicket(cars.id_car);
// 	});
// 	let result = await apiService.DeleteCar(req.body.id);
// 	let message = await userService.DeleteUser(req.body.id);
// 	return res.status(200).json({
// 		...message,
// 	});
// };
const getUserAccount = async (req, res) => {
	if (!req.user) {
		return res.status(401).json({
			errCode: -2,
			errMessage: "Not Authenticated the user",
		});
	}
	return res.status(200).json({
		errCode: 0,
		errMessage: "Ok!",
		DT: {
			access_token: req.token,
			id: req.user.id,
			fullName: req.user.fullName,
			email: req.user.email,
			name: req.user.name,
			role: req.user.role,
			bio: req.user.bio,
			isPremium: req.user.isPremium,
			profilePicture: req.user.profilePicture,
			createdAt: req.user.createdAt,
		},
	});
};
const HandleLogOut = (req, res) => {
	try {
		clearAuthCookies(res, "user");
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

const HandleRefreshToken = (req, res) => {
	const refreshToken = req.cookies?.refreshJwt || req.body?.refresh_token;
	if (!refreshToken) {
		return res.status(401).json({
			errCode: -2,
			errMessage: "Refresh token is missing",
		});
	}

	const decoded = verifyRefreshToken(refreshToken);
	if (!decoded || decoded.error === "TokenExpiredError") {
		clearAuthCookies(res, "user");
		return res.status(401).json({
			errCode: -2,
			errMessage:
				decoded?.error === "TokenExpiredError"
					? "Refresh token has expired. Please log in again."
					: "Invalid refresh token.",
		});
	}

	const { iat, exp, ...payload } = decoded;
	const accessToken = CreateJWT(payload);
	const newRefreshToken = CreateRefreshJWT(payload);
	setAuthCookies(res, "user", accessToken, newRefreshToken);

	return res.status(200).json({
		errCode: 0,
		errMessage: "Token refreshed successfully",
		DT: {
			access_token: accessToken,
			refresh_token: newRefreshToken,
		},
	});
};

let HandleGetInfoCar = async (req, res) => {
	let id = req.query.id;
	if (!id) {
		return res.status(200).json({
			errCode: 1,
			errMessage: "Missing required parameter",
			user: [],
		});
	}
	let user = await userService.getInfoCar(id);
	return res.status(200).json({
		errCode: 0,
		errMessage: "OK",
		user: user,
	});
};

let HandleDeleteUser = async (req, res) => {
	if (!req.body.id) {
		return res.status(200).json({
			errCode: 1,
			errMessage: "Missing required parameters!",
		});
	}
	let message = await userService.DeleteUser(req.body.id);
	return res.status(200).json({
		...message,
	});
};

module.exports = {
	HandleLogin: HandleLogin,
	HandleGetAllUser: HandleGetAllUser,
	HandleCreateNewUser: HandleCreateNewUser,
	HandleEditUser: HandleEditUser,
	HandleUpdateProfile: HandleUpdateProfile,
	HandleDeleteUser: HandleDeleteUser,
	getUserAccount,
	HandleLogOut: HandleLogOut,
	HandleRefreshToken: HandleRefreshToken,
	HandleGetInfoCar: HandleGetInfoCar,
};
