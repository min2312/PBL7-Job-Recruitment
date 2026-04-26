const { error } = require("neo4j-driver");
const db = require("../models");

const getAllCompanies = async ({ page = 1, limit = 10, search = "" }) => {
	const pageNum = Math.max(1, parseInt(page || "1"));
	const pageSize = Math.max(1, parseInt(limit || "10"));
	try {
		const where = {};
		if (search) {
			where.name = { [db.Sequelize.Op.like]: `%${search}%` };
		}
		const { count, rows } = await db.Company.findAndCountAll({
			where,
			offset: (pageNum - 1) * pageSize,
			limit: pageSize,
		});
		return {
			errorCode: 0,
			errorMessage: "OK",
			total: count,
			companies: rows,
			page: pageNum,
			pageSize: pageSize,
		};
	} catch (error) {
		throw error;
	}
};

const getCompanyById = async (id) => {
	try {
		const company = await db.Company.findByPk(id);
		return company;
	} catch (error) {
		throw error;
	}
};

module.exports = {
	getAllCompanies,
	getCompanyById,
};
