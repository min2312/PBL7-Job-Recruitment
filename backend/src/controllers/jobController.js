const jobService = require("../service/jobService");

/**
 * GET /api/jobs/random
 * Query params:
 * - location: 'hanoi' | 'hcm' | 'mienbac' | 'miennam' | 'all' (default 'all')
 * - page: page number (1-based)
 * - limit: items per page (default 10)
 */
const getRandomJobsByLocation = async (req, res) => {
	try {
		const {
			location,
			page,
			limit,
			seed,
			salary,
			experience,
			employmentType,
			categoryId,
		} = req.query || {};
		const userId = req.query.userId || req.user?.id;
		const data = await jobService.fetchRandomJobsByLocation({
			location,
			page,
			limit,
			seed,
			salary,
			experience,
			employmentType,
			categoryId,
			userId,
		});
		return res.status(200).json({ errCode: 0, errMessage: "OK", jobs: data });
	} catch (error) {
		console.error("Error in getRandomJobsByLocation", error);
		return res
			.status(500)
			.json({ errCode: -1, errMessage: "Internal server error" });
	}
};

const searchJobs = async (req, res) => {
	try {
		const {
			location,
			page,
			limit,
			search,
			salary,
			experience,
			employmentType,
			categoryId,
		} = req.query || {};
		const userId = req.query.userId || req.user?.id;
		const data = await jobService.searchJobs({
			location,
			page,
			limit,
			search,
			salary,
			experience,
			employmentType,
			categoryId,
			userId,
		});
		return res.status(200).json({ errCode: 0, errMessage: "OK", jobs: data });
	} catch (error) {
		console.error("Error in searchJobs", error);
		return res
			.status(500)
			.json({ errCode: -1, errMessage: "Internal server error" });
	}
};

const getJobByCompanyId = async (req, res) => {
	try {
		const companyId = req.params.id;
		const { page, limit, search, location, status, userId: queryUserId } = req.query || {};
		const userId = queryUserId || req.user?.id;
		const data = await jobService.getJobByCompanyId({
			companyId,
			page,
			limit,
			search,
			location,
			status,
			userId,
		});
		return res.status(200).json({ errCode: 0, errMessage: "OK", data: data });
	} catch (error) {
		console.error("Error in getJobByCompanyId", error);
		return res
			.status(500)
			.json({ errCode: -1, errMessage: "Internal server error" });
	}
};

const getJobById = async (req, res) => {
	try {
		const jobId = req.params.id;
		const userId = req.query.userId || req.user?.id;
		const data = await jobService.getJobById(jobId, userId);
		if (!data) {
			return res
				.status(404)
				.json({ errCode: 1, errMessage: "Job not found", data: null });
		}
		return res.status(200).json({ errCode: 0, errMessage: "OK", data: data });
	} catch (error) {
		console.error("Error in getJobById", error);
		return res
			.status(500)
			.json({ errCode: -1, errMessage: "Internal server error" });
	}
};

const saveOrUnsaveJob = async (req, res) => {
	try {
		const { jobId, userId: bodyUserId } = req.body;
		const userId = bodyUserId || req.user?.id;
		
		if (!userId) {
			return res.status(401).json({
				errCode: 1,
				errMessage: "User ID is required",
			});
		}
		
		const result = await jobService.saveOrUnsaveJob(userId, jobId);
		return res.status(200).json({
			errCode: result.errCode,
			errMessage: result.errMessage,
		});
	} catch (error) {
		console.error("Error in saveOrUnsaveJob", error);
		return res
			.status(500)
			.json({ errCode: -1, errMessage: "Internal server error" });
	}
};

const getSavedJobs = async (req, res) => {
	try {
		const { page, limit, userId: queryUserId } = req.query || {};
		const userId = queryUserId || req.user?.id;

		if (!userId) {
			return res.status(401).json({
				errCode: 1,
				errMessage: "User ID is required",
			});
		}

		const data = await jobService.getSavedJobs(userId, page, limit);
		return res.status(200).json({ errCode: 0, errMessage: "OK", data });
	} catch (error) {
		console.error("Error in getSavedJobs", error);
		return res
			.status(500)
			.json({ errCode: -1, errMessage: "Internal server error" });
	}
};

const HandleCreateJob = async (req, res) => {
	try {
		const data = req.body;
		// Ensure employer is posting for their own company
		if (req.user.role !== "EMPLOYER") {
			return res.status(403).json({ errCode: 1, errMessage: "Only employers can post jobs" });
		}
		data.companyId = req.user.companyId;

		const result = await jobService.createJob(data);
		return res.status(200).json(result);
	} catch (error) {
		console.error("Error in HandleCreateJob", error);
		return res.status(500).json({ errCode: -1, errMessage: "Internal server error" });
	}
};

const HandleGetEmployerJobs = async (req, res) => {
	try {
		const companyId = req.user?.companyId;
		if (!companyId) {
			return res.status(403).json({ errCode: 1, errMessage: "Only employers with a company can view jobs" });
		}
		
		const { page, limit, search, location, status } = req.query;
		const data = await jobService.getJobByCompanyId({
			companyId,
			page,
			limit,
			search,
			location,
			status,
			userId: req.user.id
		});
		return res.status(200).json({ errCode: 0, errMessage: "OK", data: data });
	} catch (error) {
		console.error("Error in HandleGetEmployerJobs", error);
		return res.status(500).json({ errCode: -1, errMessage: "Internal server error" });
	}
};

module.exports = {
	getRandomJobsByLocation,
	searchJobs,
	getJobByCompanyId,
	getJobById,
	saveOrUnsaveJob,
	getSavedJobs,
	HandleCreateJob,
	HandleGetEmployerJobs,
};
