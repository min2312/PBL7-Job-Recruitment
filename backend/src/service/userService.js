import { raw } from "mysql2";
import db from "../models/index";
import bcrypt from "bcryptjs";
import { where } from "sequelize";
import { response } from "express";
import { CreateJWT } from "../middleware/JWT_Action";
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const salt = bcrypt.genSaltSync(10);
let HandleUserLogin = (email, password) => {
	return new Promise(async (resolve, reject) => {
		try {
			let userData = {};
			let isExist = await CheckUserEmail(email);
			if (isExist) {
				let user = await db.User.findOne({
					where: { email: email },
					raw: true,
				});
				if (user) {
					let check = await bcrypt.compareSync(password, user.passwordHash);
					if (check) {
						let payload = {
							id: user.id,
							email: user.email,
							fullName: user.fullName,
							phone: user.phone,
							gender: user.gender,
							bio: user.bio,
							createdAt: user.createdAt,
							profilePicture: user.profilePicture,
							isPremium: user.isPremium,
						};
						let token = CreateJWT(payload);
						userData.errCode = 0;
						userData.errMessage = `OK`;
						delete user.passwordHash;
						userData.user = user;
						userData.DT = {
							access_token: token,
						};
					} else {
						userData.errCode = 3;
						userData.errMessage = `Yours's Email or Password is incorrect!`;
					}
				} else {
					userData.errCode = 2;
					userData.errMessage = `User's not found`;
				}
			} else {
				userData.errCode = 1;
				userData.errMessage = `Yours's Email or Password is incorrect!`;
			}
			resolve(userData);
		} catch (e) {
			reject(e);
		}
	});
};

let CheckUserEmail = (userEmail) => {
	return new Promise(async (resolve, reject) => {
		try {
			let user = await db.User.findOne({
				where: { email: userEmail },
			});
			if (user) {
				resolve(true);
			} else {
				resolve(false);
			}
		} catch (e) {
			reject(e);
		}
	});
};

let getAllUser = (userId) => {
	return new Promise(async (resolve, reject) => {
		try {
			let users = "";
			if (userId === "ALL") {
				users = await db.User.findAll({
					attributes: {
						exclude: ["passwordHash"],
					},
				});
			}
			if (userId && userId !== "ALL") {
				users = await db.User.findOne({
					where: { id: userId },
					attributes: {
						exclude: ["passwordHash"],
					},
				});
			}
			resolve(users);
		} catch (e) {
			reject(e);
		}
	});
};
let getInfoCar = (userId) => {
	return new Promise(async (resolve, reject) => {
		try {
			let users = "";
			let car = "";
			if (userId === "ALL") {
				users = await db.User.findAll({
					attributes: {
						exclude: ["password"],
					},
				});
			}
			if (userId && userId !== "ALL") {
				users = await db.User.findOne({
					where: { id: userId },
					attributes: {
						exclude: ["password"],
					},
				});
			}
			resolve(users);
		} catch (e) {
			reject(e);
		}
	});
};

let CreateNewUser = (data) => {
	return new Promise(async (resolve, reject) => {
		try {
			let check = await CheckUserEmail(data.email);
			if (check === true) {
				resolve({
					errCode: 1,
					errMessage: "Your email has exist",
				});
			} else {
				let hashPasswordFromBcrypt = await hashUserPassword(data.password);
				let new_user = await db.User.create({
					//(value my sql): (value name-html)
					email: data.email,
					passwordHash: hashPasswordFromBcrypt,
					fullName: data.fullName,
					phone: data.phone,
				});
				resolve({
					errCode: 0,
					message: "Create success",
					user: new_user,
				});
			}
		} catch (e) {
			reject(e);
		}
	});
};
let DeleteUser = (User_id) => {
	return new Promise(async (resolve, reject) => {
		try {
			let user = await db.User.findOne({
				where: { id: User_id },
			});
			if (user) {
				await db.User.destroy({
					where: { id: User_id },
				});
				resolve({
					errCode: 0,
					message: `The User is deleted`,
				});
			} else {
				resolve({
					errCode: 2,
					errMessage: `The user isn't exist`,
				});
			}
		} catch (e) {
			reject(e);
		}
	});
};
let updateUser = (data) => {
	return new Promise(async (resolve, reject) => {
		try {
			if (!data.id) {
				resolve({
					errCode: 2,
					errMessage: "Missing required parameter!",
				});
			}
			let user = await db.User.findOne({
				where: { id: data.id },
			});
			if (user) {
				let hashPasswordFromBcrypt = await hashUserPassword(data.password);
				await db.User.update(
					{
						fullName: data.fullName,
						email: data.email,
						passwordHash: hashPasswordFromBcrypt,
						phone: data.phone,
						gender: data.gender,
					},
					{
						where: { id: data.id },
					}
				);
				let newUser = await db.User.findOne({
					where: { id: data.id },
				});
				let payload = {
					id: newUser.id,
					email: newUser.email,
					fullName: newUser.fullName,
				};
				let token = CreateJWT(payload);
				delete user.password;
				delete newUser.password;
				resolve({
					errCode: 0,
					message: "Update User Success!",
					user: newUser,
					DT: {
						access_token: token,
					},
				});
			} else {
				resolve({
					errCode: 1,
					errMessage: "User Not Found!",
				});
			}
		} catch (e) {
			reject(e);
		}
	});
};

let updateUserProfile = (data, fileImage) => {
	return new Promise(async (resolve, reject) => {
		try {
			if (!data.id) {
				resolve({
					errCode: 2,
					errMessage: "Missing required parameter!",
				});
				return;
			}

			let user = await db.User.findOne({
				where: { id: data.id },
			});

			if (user) {
				if (fileImage) {
					if (user.profilePicture) {
						const uploadPart = user.profilePicture.split("/upload/")[1];
						let parts = uploadPart.split("/");
						if (parts[0].startsWith("v")) {
							parts.shift();
						}
						const publicId = parts.join("/").split(".")[0];
						await cloudinary.uploader.destroy(publicId);
					}
				}
				// Prepare update object with only the fields we want to allow updating
				let updateFields = {};

				if (data.fullName !== undefined) {
					updateFields.fullName = data.fullName;
				}

				if (data.bio !== undefined) {
					updateFields.bio = data.bio;
				}
				if (fileImage) {
					updateFields.profilePicture = fileImage
						? fileImage.path
						: user.profilePicture;
				}

				// Update the user with only the specified fields
				await db.User.update(updateFields, {
					where: { id: data.id },
				});

				// Fetch the updated user data
				let updatedUser = await db.User.findOne({
					where: { id: data.id },
					attributes: {
						exclude: ["passwordHash"],
					},
				});

				// Create new JWT token with updated information
				let payload = {
					id: updatedUser.id,
					email: updatedUser.email,
					fullName: updatedUser.fullName,
					phone: updatedUser.phone,
					gender: updatedUser.gender,
					bio: updatedUser.bio,
					createdAt: updatedUser.createdAt,
					profilePicture: updatedUser.profilePicture,
					isPremium: updatedUser.isPremium,
				};
				let token = CreateJWT(payload);

				resolve({
					errCode: 0,
					user: updatedUser,
					DT: {
						access_token: token,
					},
				});
			} else {
				if (fileImage) {
					await cloudinary.uploader.destroy(fileImage.filename);
				}
				resolve({
					errCode: 1,
					errMessage: "User not found!",
				});
			}
		} catch (e) {
			if (fileImage) {
				await cloudinary.uploader.destroy(fileImage.filename);
			}
			reject(e);
		}
	});
};

let upsertUserSocial = async (typeAcc, dataRaw) => {
	try {
		let user = null;
		if (typeAcc) {
			user = await db.User.findOne({
				where: {
					email: dataRaw.email,
					type: typeAcc,
				},
			});
			if (!user) {
				user = await db.User.create({
					//(value my sql): (value name-html)
					email: dataRaw.email,
					fullName: dataRaw.fullName,
					type: typeAcc,
				});
			}
		}
		return user;
	} catch (err) {
		console.log(err);
	}
};

let hashUserPassword = (password) => {
	return new Promise(async (resolve, reject) => {
		try {
			let hashPassword = await bcrypt.hashSync(password, salt);
			resolve(hashPassword);
		} catch (e) {
			reject(e);
		}
	});
};

let resetPassword = (email, newPassword) => {
	return new Promise(async (resolve, reject) => {
		try {
			let user = await db.User.findOne({ where: { email } });
			if (!user) {
				resolve({ errCode: 1, errMessage: "User not found" });
			} else {
				let hashPassword = await bcrypt.hashSync(newPassword, salt);
				await db.User.update(
					{ passwordHash: hashPassword },
					{ where: { email } }
				);
				resolve({ errCode: 0, message: "Password reset successful" });
			}
		} catch (e) {
			reject(e);
		}
	});
};

module.exports = {
	HandleUserLogin: HandleUserLogin,
	getAllUser: getAllUser,
	CreateNewUser: CreateNewUser,
	DeleteUser: DeleteUser,
	updateUser: updateUser,
	updateUserProfile: updateUserProfile,
	getInfoCar: getInfoCar,
	upsertUserSocial: upsertUserSocial,
	resetPassword: resetPassword,
	CheckUserEmail: CheckUserEmail, // new export for service-level email checking
};
