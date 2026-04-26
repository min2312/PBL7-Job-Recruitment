const db = require("../models");

const getAllLocations = async () => {
	try {
		const locations = await db.Location.findAll({
			order: [["name", "ASC"]],
		});
		return {
			errCode: 0,
			errMessage: "OK",
			data: locations,
		};
	} catch (error) {
		throw error;
	}
};

module.exports = {
	getAllLocations,
};
