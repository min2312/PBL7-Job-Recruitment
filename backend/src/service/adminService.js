import db from "../models/index";
import { Op } from "sequelize";
import { CreateJWT, CreateRefreshJWT } from "../middleware/JWT_Action";
import { 
	syncSingleUser, 
	deleteUserNode, 
	syncSingleJob, 
	deleteJobNode 
} from "./syncToNeo4jService";
require("dotenv").config();

let HandleAdminLogin = (email, password) => {
	return new Promise(async (resolve, reject) => {
		try {
			let userData = {};
			let isExist = await CheckAdminEmail(email);
			if (isExist) {
				let user = await db.Admin.findOne({
					where: { email: email },
					raw: true,
				});
				if (user) {
					let check = password === user.password;
					if (check) {
						let payload = {
							id: user.id,
							email: user.email,
							name: user.email,
							role: "ADMIN",
						};
						let accessToken = CreateJWT(payload);
						let refreshToken = CreateRefreshJWT(payload);
						userData.errCode = 0;
						userData.errMessage = `OK`;
						delete user.password;
						userData.user = {
							...user,
							name: user.email,
							role: "ADMIN",
						};
						userData.DT = {
							access_token: accessToken,
							refresh_token: refreshToken,
						};
					} else {
						userData.errCode = 3;
						userData.errMessage = `Your Email or Password is incorrect!`;
					}
				} else {
					userData.errCode = 2;
					userData.errMessage = `Admin not found`;
				}
			} else {
				userData.errCode = 1;
				userData.errMessage = `Your Email or Password is incorrect!`;
			}
			resolve(userData);
		} catch (e) {
			reject(e);
		}
	});
};

let CheckAdminEmail = (userEmail) => {
	return new Promise(async (resolve, reject) => {
		try {
			let user = await db.Admin.findOne({
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

// Admin dashboard services
const getAllUsersPaginated = async (page = 1, limit = 10, search = "", role = "ALL") => {
	try {
		const offset = (page - 1) * limit;
		const where = {};
		if (search) {
			where[Op.or] = [
				{ name: { [Op.like]: `%${search}%` } },
				{ email: { [Op.like]: `%${search}%` } },
			];
		}
		if (role !== "ALL") {
			where.role = role;
		}

		const { count, rows } = await db.User.findAndCountAll({
			where,
			attributes: ["id", "email", "name", "role", "phone", "profilePicture", "is_active", "createdAt"],
			order: [["createdAt", "DESC"]],
			limit,
			offset,
			raw: true,
		});

		return {
			totalItems: count,
			totalPages: Math.ceil(count / limit),
			currentPage: page,
			users: rows,
		};
	} catch (error) {
		console.log(error);
		throw error;
	}
};

const getAllJobsPaginated = async (page = 1, limit = 10, search = "", status = "ALL") => {
	try {
		const offset = (page - 1) * limit;
		const where = {};
		if (search) {
			where.title = { [Op.like]: `%${search}%` };
		}
		if (status !== "ALL") {
			where.status = status;
		}

		const { count, rows } = await db.Job.findAndCountAll({
			where,
			include: [
				{
					model: db.Company,
					attributes: ["name", "logo"],
					include: [{
						model: db.User,
						as: "users",
						where: { role: 'EMPLOYER' },
						attributes: ["is_active"],
						required: false
					}]
				}
			],
			order: [["createdAt", "DESC"]],
			limit,
			offset,
			raw: false,
			nest: true,
		});

		// Add a virtual field to indicate if the job is hidden due to blocked employer
		const jobs = rows.map(j => {
			const job = j.get({ plain: true });
			// A job is hidden if there are NO active employers for the company
			const activeEmployers = job.Company?.users?.filter(u => u.is_active) || [];
			job.isHiddenByBlockedEmployer = activeEmployers.length === 0;
			return job;
		});

		return {
			totalItems: count,
			totalPages: Math.ceil(count / limit),
			currentPage: page,
			jobs: jobs,
		};
	} catch (error) {
		console.log(error);
		throw error;
	}
};

const getAllCompaniesPaginated = async (page = 1, limit = 10, search = "") => {
	try {
		const offset = (page - 1) * limit;
		const where = {};
		if (search) {
			where.name = { [Op.like]: `%${search}%` };
		}

		const { count, rows } = await db.Company.findAndCountAll({
			where,
			include: [{
				model: db.User,
				as: "users",
				where: { role: 'EMPLOYER' },
				attributes: ["is_active"],
				required: false
			}],
			order: [["createdAt", "DESC"]],
			limit,
			offset,
			raw: false,
			nest: true,
		});

		const companies = rows.map(c => {
			const company = c.get({ plain: true });
			const activeEmployers = company.users?.filter(u => u.is_active) || [];
			company.isBlocked = activeEmployers.length === 0 && company.users?.length > 0;
			return company;
		});

		return {
			totalItems: count,
			totalPages: Math.ceil(count / limit),
			currentPage: page,
			companies: companies,
		};
	} catch (error) {
		console.log(error);
		throw error;
	}
};

const getAllApplicationsPaginated = async (page = 1, limit = 10) => {
	try {
		const offset = (page - 1) * limit;
		const { count, rows } = await db.Application.findAndCountAll({
			include: [
				{ model: db.User, attributes: ["name", "email"] },
				{ model: db.Job, attributes: ["title"] },
			],
			order: [["createdAt", "DESC"]],
			limit,
			offset,
			raw: true,
			nest: true,
		});

		return {
			totalItems: count,
			totalPages: Math.ceil(count / limit),
			currentPage: page,
			applications: rows,
		};
	} catch (error) {
		console.log(error);
		throw error;
	}
};

const getStatistics = async () => {
	try {
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		const [
			totalUsers,
			totalJobs,
			totalCompanies,
			totalApplications,
			prevUsers,
			prevJobs,
			prevCompanies,
		] = await Promise.all([
			db.User.count(),
			db.Job.count(),
			db.Company.count(),
			db.Application.count(),
			db.User.count({ where: { created_at: { [Op.lt]: thirtyDaysAgo } } }),
			db.Job.count({ where: { created_at: { [Op.lt]: thirtyDaysAgo } } }),
			db.Company.count({ where: { created_at: { [Op.lt]: thirtyDaysAgo } } }),
		]);

		const calculateTrend = (current, prev) => {
			if (prev === 0) return current > 0 ? "+100%" : "0%";
			const trend = ((current - prev) / prev) * 100;
			return (trend >= 0 ? "+" : "") + trend.toFixed(1) + "%";
		};

		const userByRole = await db.User.findAll({
			attributes: ["role", [db.sequelize.fn("COUNT", db.sequelize.col("role")), "count"]],
			group: ["role"],
			raw: true,
		});

		const applicationByStatus = await db.Application.findAll({
			attributes: ["status", [db.sequelize.fn("COUNT", db.sequelize.col("status")), "count"]],
			group: ["status"],
			raw: true,
		});

		return {
			totalUsers,
			totalJobs,
			totalCompanies,
			totalApplications,
			userByRole,
			applicationByStatus,
			trends: {
				users: calculateTrend(totalUsers, prevUsers),
				jobs: calculateTrend(totalJobs, prevJobs),
				companies: calculateTrend(totalCompanies, prevCompanies),
			},
		};
	} catch (error) {
		console.log(error);
		throw error;
	}
};

const getCompanyDetail = async (id) => {
	try {
		const company = await db.Company.findOne({
			where: { id },
			include: [
				{
					model: db.Job,
					limit: 5,
					order: [["createdAt", "DESC"]],
				},
				{
					model: db.User,
					as: "users",
					attributes: ["name", "email", "phone"],
					limit: 1,
				},
			],
		});
		return company;
	} catch (error) {
		console.log(error);
		throw error;
	}
};

const getJobDetail = async (id) => {
	try {
		const job = await db.Job.findOne({
			where: { id },
			include: [
				{ model: db.Company },
				{ model: db.Location, as: "locations", through: { attributes: [] } },
				{ model: db.Category, as: "categories", through: { attributes: [] } },
				{
					model: db.Application,
					include: [{ model: db.User, attributes: ["id", "name", "email", "profilePicture"] }],
				},
			],
		});
		return job;
	} catch (error) {
		console.log(error);
		throw error;
	}
};

const suspendUser = async (userId) => {
	try {
		await db.User.update({ is_active: false }, { where: { id: userId } });
		await syncSingleUser(userId);
		return { errCode: 0, errMessage: "User suspended" };
	} catch (e) {
		return { errCode: -1, errMessage: e.message };
	}
};

const activateUser = async (userId) => {
	try {
		await db.User.update({ is_active: true }, { where: { id: userId } });
		await syncSingleUser(userId);
		return { errCode: 0, errMessage: "User activated" };
	} catch (e) {
		return { errCode: -1, errMessage: e.message };
	}
};

const deleteUser = async (userId) => {
	try {
		await deleteUserNode(userId);
		await db.User.destroy({ where: { id: userId } });
		return { errCode: 0, errMessage: "User deleted" };
	} catch (e) {
		return { errCode: -1, errMessage: e.message };
	}
};

const updateJobStatus = async (jobId, status) => {
	try {
		await db.Job.update({ status }, { where: { id: jobId } });
		await syncSingleJob(jobId);
		return { errCode: 0, errMessage: `Job status updated to ${status}` };
	} catch (e) {
		return { errCode: -1, errMessage: e.message };
	}
};

const deleteJob = async (jobId) => {
	try {
		await deleteJobNode(jobId);
		await db.Job.destroy({ where: { id: jobId } });
		return { errCode: 0, errMessage: "Job deleted" };
	} catch (e) {
		return { errCode: -1, errMessage: e.message };
	}
};

module.exports = {
	HandleAdminLogin,
	getAllUsersPaginated,
	getAllJobsPaginated,
	getAllCompaniesPaginated,
	getAllApplicationsPaginated,
	getStatistics,
	suspendUser,
	activateUser,
	deleteUser,
	updateJobStatus,
	deleteJob,
	getCompanyDetail,
	getJobDetail,
};
