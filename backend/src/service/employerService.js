const db = require("../models/index");
const { Op, fn, col, literal } = require("sequelize");

const getEmployerStatistics = async (companyId) => {
	try {
		// 1. Get all jobs of the company to filter applications
		const jobs = await db.Job.findAll({
			where: { companyId: companyId },
			attributes: ["id"],
			raw: true,
		});
		const jobIds = jobs.map((j) => j.id);

		if (jobIds.length === 0) {
			return {
				errCode: 0,
				errMessage: "OK",
				data: {
					totalCandidates: 0,
					hiredCount: 0,
					conversionRate: 0,
					averageTimeToHire: 0,
					applicationsByMonth: [],
					conversionData: [
						{ stage: "Chờ duyệt", count: 0 },
						{ stage: "Phỏng vấn", count: 0 },
						{ stage: "Đã tuyển", count: 0 },
						{ stage: "Từ chối", count: 0 },
					],
				},
			};
		}

		// 2. Fetch KPI Stats
		const totalCandidates = await db.Application.count({
			where: { jobId: { [Op.in]: jobIds } },
		});

		const hiredCount = await db.Application.count({
			where: {
				jobId: { [Op.in]: jobIds },
				status: "approved",
			},
		});

		const conversionRate =
			totalCandidates > 0
				? ((hiredCount / totalCandidates) * 100).toFixed(1)
				: 0;

		// 3. Average Time to Hire (days)
		const hiredApplications = await db.Application.findAll({
			where: {
				jobId: { [Op.in]: jobIds },
				status: "approved",
			},
			attributes: ["createdAt", "updatedAt"],
			raw: true,
		});

		let averageTimeToHire = 0;
		if (hiredApplications.length > 0) {
			const totalDays = hiredApplications.reduce((acc, app) => {
				const created = new Date(app.createdAt);
				const updated = new Date(app.updatedAt);
				const diffTime = Math.abs(updated - created);
				const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
				return acc + diffDays;
			}, 0);
			averageTimeToHire = Math.round(totalDays / hiredApplications.length);
		}

		// 4. Applications & Hires by month (last 6 months)
		const sixMonthsAgo = new Date();
		sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
		sixMonthsAgo.setDate(1);
		sixMonthsAgo.setHours(0, 0, 0, 0);

		const appsByMonth = await db.Application.findAll({
			where: {
				jobId: { [Op.in]: jobIds },
				createdAt: { [Op.gte]: sixMonthsAgo },
			},
			attributes: [
				[fn("YEAR", col("created_at")), "year"],
				[fn("MONTH", col("created_at")), "month"],
				[fn("COUNT", col("id")), "applications"],
				[literal("COUNT(CASE WHEN status = 'approved' THEN 1 END)"), "hires"],
			],
			group: [fn("YEAR", col("created_at")), fn("MONTH", col("created_at"))],
			raw: true,
		});

		// Format month data for all 6 months
		const monthNames = [
			"T1",
			"T2",
			"T3",
			"T4",
			"T5",
			"T6",
			"T7",
			"T8",
			"T9",
			"T10",
			"T11",
			"T12",
		];
		const formattedMonthlyData = [];
		for (let i = 0; i < 6; i++) {
			const d = new Date();
			d.setMonth(d.getMonth() - 5 + i);
			const m = d.getMonth() + 1;
			const y = d.getFullYear();

			const existing = appsByMonth.find(
				(a) => parseInt(a.month) === m && parseInt(a.year) === y,
			);
			formattedMonthlyData.push({
				month: monthNames[m - 1],
				applications: existing ? parseInt(existing.applications) : 0,
				hires: existing ? parseInt(existing.hires) : 0,
			});
		}

		// 5. Funnel Data (Exactly matching the 4 DB statuses)
		const statusCounts = await db.Application.findAll({
			where: { jobId: { [Op.in]: jobIds } },
			attributes: ["status", [fn("COUNT", col("id")), "count"]],
			group: ["status"],
			raw: true,
		});

		const statusMap = {
			pending: "Chờ duyệt",
			interview: "Phỏng vấn",
			approved: "Đã tuyển",
			rejected: "Từ chối",
		};

		const conversionData = Object.keys(statusMap).map((key) => {
			const found = statusCounts.find((s) => s.status === key);
			return {
				stage: statusMap[key],
				count: found ? parseInt(found.count) : 0,
			};
		});

		return {
			errCode: 0,
			errMessage: "OK",
			data: {
				totalCandidates,
				hiredCount,
				conversionRate,
				averageTimeToHire,
				applicationsByMonth: formattedMonthlyData,
				conversionData,
			},
		};
	} catch (error) {
		console.error("Error in getEmployerStatistics service:", error);
		throw error;
	}
};

module.exports = {
	getEmployerStatistics,
};
