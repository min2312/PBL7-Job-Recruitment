const locationService = require("../service/locationService");

const getAllLocations = async (req, res) => {
	try {
		const result = await locationService.getAllLocations();
		return res.status(200).json(result);
	} catch (error) {
		return res.status(500).json({ errCode: -1, errMessage: error.message });
	}
};

module.exports = {
	getAllLocations,
};
