import * as neo4jService from "../service/neo4jService";

export const HandleGetJobHeatmap = async (req, res) => {
	try {
		const days = Number(req.query.days) || 30;
		const data = await neo4jService.buildHeatmap(days);
		const top = data.rows[0] || null;

		let message = "Không đủ dữ liệu để xác định bản đồ nhiệt";
		if (top) {
			const share =
				data.totalNew > 0
					? ((top.newJobs / data.totalNew) * 100).toFixed(1)
					: "0";
			message = `Tháng này, ngành '${top.category}' tại '${top.location}' đang có nhu cầu tuyển dụng cao nhất với ${top.newJobs} việc làm mới, chiếm ${share}% toàn thị trường.`;
		}

		return res.status(200).json({
			errCode: 0,
			errMessage: "OK",
			data: { totalNew: data.totalNew, rows: data.rows, message },
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			errCode: -1,
			errMessage: "Error from server",
			error: error.message,
		});
	}
};

export const HandleGetCategoryCompetition = async (req, res) => {
	try {
		const data = await neo4jService.buildCompetition();
		const top = data[0] || null;
		let message = "Không đủ dữ liệu để xác định tỷ lệ cạnh tranh";
		if (top) {
			message = `Ngành '${top.category}' đang có tỷ lệ cạnh tranh khốc liệt nhất: Trung bình 1 vị trí có tới ${Number(top.ratio).toFixed(1)} ứng viên nộp CV (Tỷ lệ chọi 1:${Number(top.ratio).toFixed(0)}).`;
		}

		return res
			.status(200)
			.json({ errCode: 0, errMessage: "OK", data: { rows: data, message } });
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			errCode: -1,
			errMessage: "Error from server",
			error: error.message,
		});
	}
};

export const HandleGetMarketDemand = async (req, res) => {
	try {
		const category = req.query.category;
		const location = req.query.location;
		if (!category || !location) {
			return res.status(400).json({
				errCode: 1,
				errMessage: "category and location query parameters are required",
			});
		}

		const summary = await neo4jService.getMarketDemandSummary({
			category,
			location,
			sinceDays: Number(req.query.days) || 30,
		});

		return res.status(200).json({
			errCode: 0,
			errMessage: "OK",
			data: {
				market_demand: summary.market_demand,
				active_candidates: summary.active_candidates,
				competition_ratio: summary.competition_ratio,
				competition_level: summary.competition_level,
				category: summary.category,
				location: summary.location,
			},
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			errCode: -1,
			errMessage: "Error from server",
			error: error.message,
		});
	}
};

export const HandleGetHiringCriteria = async (req, res) => {
	try {
		const categoryName = req.query.category || "";
		const locationName = req.query.location || "";

		const rows = await neo4jService.buildHiringCriteria(categoryName, locationName, 20);
		const top = rows[0] || null;
		let message =
			"Không đủ dữ liệu để xây dựng bức tranh tiêu chuẩn tuyển dụng";

		if (top && top.experience && top.education) {
			const total = rows.reduce((sum, r) => sum + r.count, 0);
			const percent = total > 0 ? ((top.count / total) * 100).toFixed(0) : 0;
			
			let locationText = locationName ? ` tại '${locationName}'` : "";
			let categoryText = categoryName ? ` ngành '${categoryName}'` : "";
			let contextText = (!categoryName && !locationName) ? " trên toàn thị trường" : `${categoryText}${locationText}`;
			
			message = `Đối với vị trí '${top.level || "Trưởng/Phó phòng"}'${contextText}, ${percent}% các công ty yêu cầu kinh nghiệm '${top.experience}' và bằng '${top.education}'.`;
		}

		return res
			.status(200)
			.json({ errCode: 0, errMessage: "OK", data: { rows, message } });
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			errCode: -1,
			errMessage: "Error from server",
			error: error.message,
		});
	}
};

export const HandleGetSalaryTrend = async (req, res) => {
	try {
		const { category, location, experience, days } = req.query;
		const trend = await neo4jService.buildSalaryTrend({
			categoryName: category,
			locationName: location,
			experience,
			sinceDays: Number(days) || 90,
		});

		if (!trend) {
			return res.status(200).json({
				errCode: 0,
				errMessage: "OK",
				data: null,
				message: "Không đủ dữ liệu lương",
			});
		}

		const message = `Mức lương trung bình cho nhân sự kinh nghiệm '${experience || ""}' ngành '${category || ""}' tại '${location || ""}' đang dao động từ ${trend.avgMin} - ${trend.avgMax} triệu đồng.`;

		return res
			.status(200)
			.json({ errCode: 0, errMessage: "OK", data: { trend, message } });
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			errCode: -1,
			errMessage: "Error from server",
			error: error.message,
		});
	}
};

export const HandleGetSalaryByIndustry = async (req, res) => {
	try {
		const categoryName = req.query.category || "";
		const locationName = req.query.location || "";
		
		const data = await neo4jService.buildSalaryByIndustry(categoryName, locationName);
		
		let locationText = locationName ? ` tại '${locationName}'` : "";
		let categoryText = categoryName ? `ngành '${categoryName}'` : "các nhóm ngành có nhu cầu tuyển dụng cao nhất";
		let message = `Thống kê phổ lương trung bình của ${categoryText}${locationText}.`;
		
		return res.status(200).json({ errCode: 0, errMessage: "OK", data: { rows: data, message } });
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			errCode: -1,
			errMessage: "Error from server",
			error: error.message,
		});
	}
};

export const HandleBuildTrainingDataset = async (req, res) => {
	try {
		const days = req.query.days ? Number(req.query.days) : null;
		const rows = await neo4jService.buildTrainingDataset(days);
		return res.status(200).json({ errCode: 0, errMessage: "OK", data: rows });
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			errCode: -1,
			errMessage: "Error from server",
			error: error.message,
		});
	}
};

export const HandleBackfillSalary = async (req, res) => {
	try {
		const result = await neo4jService.backfillSalaryParsedFields();
		return res.status(200).json({ errCode: 0, errMessage: "OK", data: result });
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			errCode: -1,
			errMessage: "Error from server",
			error: error.message,
		});
	}
};

export const HandleGetCategoriesPaginated = async (req, res) => {
	try {
		const page = Number(req.query.page) || 1;
		const limit = Number(req.query.limit) || 6;
		const data = await neo4jService.getCategoriesWithJobCount(page, limit);
		return res.status(200).json({
			errCode: 0,
			errMessage: "OK",
			data,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			errCode: -1,
			errMessage: "Error from server",
			error: error.message,
		});
	}
};

export const HandleGetMarketSummary = async (req, res) => {
	try {
		const data = await neo4jService.getMarketSummary();
		return res.status(200).json({
			errCode: 0,
			errMessage: "OK",
			data,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			errCode: -1,
			errMessage: "Error from server",
			error: error.message,
		});
	}
};
