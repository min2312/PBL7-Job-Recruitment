import { raw } from "mysql2";
import db from "../models/index";
import bcrypt from "bcryptjs";
import { CreateJWT, CreateRefreshJWT } from "../middleware/JWT_Action";
import firebaseAdmin from "../config/firebase";
const cloudinary = require("cloudinary").v2;
const { uploadToAzure, deleteFromAzure } = require("./azureStorageService");
const streamifier = require("streamifier");
require("dotenv").config();
const salt = bcrypt.genSaltSync(10);

/**
 * Helper to upload buffer to Cloudinary
 */
const uploadBufferToCloudinary = (buffer, folder) => {
	return new Promise((resolve, reject) => {
		let stream = cloudinary.uploader.upload_stream(
			{ folder: folder },
			(error, result) => {
				if (result) resolve(result);
				else reject(error);
			}
		);
		streamifier.createReadStream(buffer).pipe(stream);
	});
};

/**
 * Helper to extract public_id from Cloudinary URL and delete
 */
const deleteCloudinaryImage = async (url) => {
	if (!url) return;
	try {
		// Example URL: https://res.cloudinary.com/dowe2swf5/image/upload/v1714213123/Job-Recruitment/filename.png
		const parts = url.split("/");
		const folderAndName = parts.slice(parts.indexOf("Job-Recruitment")).join("/"); // "Job-Recruitment/filename.png"
		const publicId = folderAndName.split(".")[0]; // "Job-Recruitment/filename"
		await cloudinary.uploader.destroy(publicId);
	} catch (error) {
		console.error("Error deleting from Cloudinary:", error);
	}
};
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
					let check = await bcrypt.compareSync(password, user.password);
					if (check) {
						if(user.role === "EMPLOYER"){
							let company = await db.Company.findOne({
								where: { id: user.companyId },
							});
							user.company = company;
						}
						let payload = {
							id: user.id,
							email: user.email,
							name: user.name,
							phone: user.phone,
							createdAt: user.createdAt,
							role: user.role,
							profilePicture: user.profilePicture,
							description: user.description,
							cv_file: user.cv_file,
							company: user.company,
						};
						let accessToken = CreateJWT(payload);
						let refreshToken = CreateRefreshJWT(payload);
						userData.errCode = 0;
						userData.errMessage = `OK`;
						delete user.password;
						userData.user = user;
						userData.DT = {
							access_token: accessToken,
							refresh_token: refreshToken,
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
				let new_company = null;
				if (data.role === "EMPLOYER") {
					let checkCompany = await db.Company.findOne({
						where: { name: data.companyName },
					});
					if (checkCompany) {
						resolve({
							errCode: 1,
							errMessage: "Company has exist",
						});
						return;
					}
					new_company = await db.Company.create({ name: data.companyName });
				}
				let hashPasswordFromBcrypt = await hashUserPassword(data.password);
				let new_user = await db.User.create({
					email: data.email,
					password: hashPasswordFromBcrypt,
					name: data.name,
					phone: data.phone,
					role: data.role,
					companyId: new_company ? new_company.id : null,
				});
				new_user = new_user.get({ plain: true });
				delete new_user.password;
				resolve({
					errCode: 0,
					message: "Create success",
					user: new_user,
					company: new_company,
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
let updateUser = (data, files) => {
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
			if (!user) {
				resolve({ errCode: 1, errMessage: "User Not Found!" });
				return;
			}

			let updateData = {
				name: data.name || user.name,
				email: data.email || user.email,
				phone: data.phone || user.phone,
				description: data.description || user.description,
			};

			if (data.password) {
				updateData.password = await hashUserPassword(data.password);
			}

			// 1. Handle Profile Picture (Cloudinary)
			if (files && files.profilePicture) {
				// Delete old one if exists
				if (user.profilePicture) {
					await deleteCloudinaryImage(user.profilePicture);
				}
				const result = await uploadBufferToCloudinary(
					files.profilePicture[0].buffer,
					"Job-Recruitment"
				);
				updateData.profilePicture = result.secure_url;
			}

			// 2. Handle CV File (Azure)
			if (files && files.cv_file) {
				// Delete old one if exists
				if (user.cv_file) {
					await deleteFromAzure(user.cv_file);
				}
				const cvUrl = await uploadToAzure(
					files.cv_file[0].buffer,
					files.cv_file[0].originalname,
					files.cv_file[0].mimetype
				);
				updateData.cv_file = cvUrl;
			}

			await db.User.update(updateData, { where: { id: data.id } });

			// 3. Handle Employer / Company update
			if (user.role === "EMPLOYER" && user.companyId) {
				const company = await db.Company.findByPk(user.companyId);
				let companyUpdateData = {
					name: data.companyName || undefined,
					description: data.companyDescription || undefined,
				};

				if (files && files.logo) {
					// Delete old logo if exists
					if (company && company.logo) {
						await deleteCloudinaryImage(company.logo);
					}
					const result = await uploadBufferToCloudinary(
						files.logo[0].buffer,
						"Job-Recruitment"
					);
					companyUpdateData.logo = result.secure_url;
				}

				// Clean undefined fields
				Object.keys(companyUpdateData).forEach(key => 
					companyUpdateData[key] === undefined && delete companyUpdateData[key]
				);

				if (Object.keys(companyUpdateData).length > 0) {
					await db.Company.update(companyUpdateData, {
						where: { id: user.companyId },
					});
				}
			}

			// Fetch updated user with company info
			let newUser = await db.User.findOne({
				where: { id: data.id },
				include: user.role === "EMPLOYER" ? [{ model: db.Company, as: "company" }] : [],
			});

			let payload = {
				id: newUser.id,
				email: newUser.email,
				name: newUser.name,
				role: newUser.role,
				description: newUser.description,
				cv_file: newUser.cv_file,
				profilePicture: newUser.profilePicture,
				company: newUser.company,
			};

			let token = CreateJWT(payload);
			resolve({
				errCode: 0,
				message: "Update User Success!",
				user: newUser,
				DT: { access_token: token },
			});
		} catch (e) {
			console.error("Error in updateUser service:", e);
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
						exclude: ["password"],
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
					{ password: hashPassword },
					{ where: { email } },
				);
				resolve({ errCode: 0, message: "Password reset successful" });
			}
		} catch (e) {
			reject(e);
		}
	});
};

let HandleFirebaseLogin = (idToken) => {
	return new Promise(async (resolve, reject) => {
		try {
			let userData = {};
			if (!firebaseAdmin) {
				userData.errCode = -1;
				userData.errMessage = "Firebase Admin is not configured on the server.";
				return resolve(userData);
			}

			let decodedToken;
			try {
				decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
			} catch (error) {
				console.error("Firebase token verification failed:", error);
				userData.errCode = 1;
				userData.errMessage = "Invalid or expired Firebase ID token.";
				return resolve(userData);
			}

			const { email, name, picture } = decodedToken;
			if (!email) {
				userData.errCode = 2;
				userData.errMessage = "Email not found in Firebase token.";
				return resolve(userData);
			}

			let user = await db.User.findOne({
				where: { email: email },
				raw: true,
			});

			if (!user) {
				// Create new user
				const dummyPassword = Math.random().toString(36).slice(-10);
				const hashPassword = await bcrypt.hashSync(dummyPassword, salt);
				
				let newUser = await db.User.create({
					email: email,
					password: hashPassword,
					name: name || email.split('@')[0],
					role: "CANDIDATE", // Default role
					profilePicture: picture || null
				});
				
				user = newUser.get({ plain: true });
			}

			if (user.role === "EMPLOYER") {
				let company = await db.Company.findOne({
					where: { id: user.companyId },
				});
				user.company = company;
			}

			let payload = {
				id: user.id,
				email: user.email,
				name: user.name,
				phone: user.phone,
				createdAt: user.createdAt,
				role: user.role,
				profilePicture: user.profilePicture,
				description: user.description,
				cv_file: user.cv_file,
				company: user.company,
			};

			let accessToken = CreateJWT(payload);
			let refreshToken = CreateRefreshJWT(payload);

			userData.errCode = 0;
			userData.errMessage = `OK`;
			delete user.password;
			userData.user = user;
			userData.DT = {
				access_token: accessToken,
				refresh_token: refreshToken,
			};
			
			resolve(userData);
		} catch (e) {
			console.error("Error in HandleFirebaseLogin service:", e);
			reject(e);
		}
	});
};

module.exports = {
	HandleUserLogin: HandleUserLogin,
	HandleFirebaseLogin: HandleFirebaseLogin,
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
