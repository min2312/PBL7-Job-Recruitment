const companyService = require("../service/companyService");

const getAllCompanies = async (req, res) => {
	try {
		const { page, limit, search } = req.query;
		const companies = await companyService.getAllCompanies({ page, limit, search });
		return res.status(200).json({
			errCode: companies.errorCode,
			errMessage: companies.errorMessage,
			data: companies,
		});
	} catch (error) {
		res.status(500).json({ errCode: -1, errMessage: error.message });
	}
};

const getCompanyById = async (req, res) => {
	try {
		const { id } = req.params;
		const company = await companyService.getCompanyById(id);
		if (!company) {
			return res.status(404).json({ errCode: 1, errMessage: "Company not found" });
		}
		return res.status(200).json({ errCode: 0, errMessage: "OK", data: company });
	} catch (error) {
		res.status(500).json({ errCode: -1, errMessage: error.message });
	}
};

module.exports = {
	getAllCompanies,
	getCompanyById,
};
