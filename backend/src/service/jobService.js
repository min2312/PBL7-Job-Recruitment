const db = require("../models");
const { syncSingleJob, deleteJobNode } = require("./syncToNeo4jService");
const { Op } = db.Sequelize;
const crypto = require("crypto");

const addSavedStatusToJobs = async (jobs, userId) => {
	if (!userId || !jobs || jobs.length === 0) {
		return jobs.map((job) => {
			const j = job.get ? job.get({ plain: true }) : job;
			return { ...j, isSaved: false };
		});
	}
	const jobIds = jobs.map((j) => j.id);
	const savedJobs = await db.SavedJob.findAll({
		where: {
			userId,
			jobId: { [Op.in]: jobIds },
		},
	});
	const savedJobIds = new Set(savedJobs.map((sj) => sj.jobId));
	return jobs.map((job) => {
		const j = job.get ? job.get({ plain: true }) : job;
		return { ...j, isSaved: savedJobIds.has(j.id) };
	});
};

const addApplicationStatusToJobs = async (jobs, userId) => {
	if (!userId || !jobs || jobs.length === 0) {
		return jobs.map((job) => {
			const j = job.get ? job.get({ plain: true }) : job;
			return { ...j, isApplied: false };
		});
	}
	const jobIds = jobs.map((j) => j.id);
	const applications = await db.Application.findAll({
		where: {
			userId,
			jobId: { [Op.in]: jobIds },
		},
	});
	const appliedJobIds = new Set(applications.map((a) => a.jobId));
	return jobs.map((job) => {
		const j = job.get ? job.get({ plain: true }) : job;
		return { ...j, isApplied: appliedJobIds.has(j.id) };
	});
};

async function fetchRandomJobsByLocation({
	location = "all",
	page = 1,
	limit = 10,
	seed = null,
	salary = null,
	experience = null,
	employmentType = null,
	categoryId = null,
	userId = null,
}) {
	const loc = (location || "all").toString().toLowerCase();
	const pageNum = Math.max(1, parseInt(page || "1"));
	const pageSize = Math.max(1, parseInt(limit || "10"));
	const offset = (pageNum - 1) * pageSize;

	const HANOI_KEYS = ["hà nội", "ha noi", "hanoi"];
	const HCM_KEYS = [
		"hồ chí minh",
		"ho chi minh",
		"thành phố hồ chí minh",
		"tp hcm",
		"hcm",
		"sài gòn",
		"saigon",
	];
	const MIENBAC_KEYS = [
		"hà nội",
		"hải phòng",
		"quảng ninh",
		"thái bình",
		"nam định",
		"ninh bình",
		"hải dương",
		"hưng yên",
		"phú thọ",
		"bắc ninh",
		"bắc giang",
		"vĩnh phúc",
		"thái nguyên",
		"lạng sơn",
		"cao bằng",
		"bắc kạn",
		"hà giang",
	];
	const MIENNAM_KEYS = [
		"hồ chí minh",
		"can tho",
		"an giang",
		"bac lieu",
		"ben tre",
		"cà mau",
		"dong thap",
		"long an",
		"tien giang",
		"bình dương",
		"đồng nai",
		"bà rịa",
		"kiên giang",
		"tây ninh",
		"vĩnh long",
		"hau giang",
		"sóc trăng",
		"bình thuận",
		"ninh thuận",
		"khánh hòa",
	];

	// Build a case-insensitive location filter compatible with MySQL/MariaDB
	// Use LOWER(column) LIKE lowerValue to avoid relying on Postgres-only ILIKE
	let locationFilter = null;
	if (loc !== "all") {
		let keys = [];
		if (loc.includes("hanoi") || loc.includes("ha") || loc.includes("hà nội"))
			keys = HANOI_KEYS;
		else if (
			loc.includes("hcm") ||
			loc.includes("chi minh") ||
			loc.includes("sài gòn") ||
			loc.includes("saigon")
		)
			keys = HCM_KEYS;
		else if (loc.includes("mien") && loc.includes("bac")) keys = MIENBAC_KEYS;
		else if (loc.includes("mien") && loc.includes("nam")) keys = MIENNAM_KEYS;
		else keys = [loc];

		const orConditions = keys.map((k) => ({
			name: { [Op.like]: `%${k}%` },
		}));

		locationFilter = { [Op.or]: orConditions };
	}

	const include = [
		{
			model: db.Location,
			as: "locations",
			through: { attributes: [] },
			required: !!locationFilter,
			where: locationFilter || undefined,
		},
		{
			model: db.Category,
			as: "categories",
			through: { attributes: [] },
			required: !!categoryId,
			where: categoryId ? { id: categoryId } : undefined,
		},
		{
			model: db.Company,
			as: "Company",
			required: false,
		},
	];

	// Helpers to convert label inputs into ranges before building DB where
	const salaryLabelToRange = (label) => {
		if (!label) return null;
		const l = label.toString().trim().toLowerCase();
		if (l === "tất cả" || l === "tat ca" || l === "all") return null;
		// If user selected 'thỏa thuận' or similar, return a text filter marker so we apply a DB substring WHERE
		if (
			l.includes("thỏa") ||
			l.includes("thoa") ||
			l.includes("thương lượng") ||
			l.includes("thuong luong")
		)
			return { text: "thỏa" };
		// If label contains numeric information, try to parse it
		const parsed = parseSalaryRange(label);
		if (parsed)
			return [parsed.min, parsed.max === Infinity ? Infinity : parsed.max];

		// Common UI buckets (fallback)
		const map = {
			"dưới 10 triệu": [0, 10],
			"10 - 15 triệu": [10, 15],
			"15 - 20 triệu": [15, 20],
			"20 - 25 triệu": [20, 25],
			"25 - 30 triệu": [25, 30],
			"30 - 50 triệu": [30, 50],
			"trên 50 triệu": [50, Infinity],
		};
		return map[l] || null;
	};

	const experienceLabelToRange = (label) => {
		if (!label) return null;
		const l = label.toString().trim().toLowerCase();
		if (
			l === "tất cả" ||
			l === "tat ca" ||
			l === "all" ||
			l.includes("không yêu cầu")
		)
			return null;
		if (l.includes("chưa")) return [0, 0];
		const parsed = parseExperienceRange(label);
		if (parsed)
			return [parsed.min, parsed.max === Infinity ? Infinity : parsed.max];

		const map = {
			"1 năm": [1, 1],
			"2 năm": [2, 2],
			"3 năm": [3, 3],
			"4 - 5 năm": [4, 5],
			"trên 5 năm": [5, Infinity],
		};
		return map[l] || null;
	};

	// Job-level filters where clause
	const jobWhere = { status: "open" };

	const parseSalaryRange = (salaryStr) => {
		if (!salaryStr) return null;
		try {
			const sRaw = salaryStr.toString().toLowerCase();

			// Normalize thousands separators but preserve decimal points when appropriate
			let s = sRaw.replace(/\u00A0/g, " ");
			// detect unit hints
			const unit = s.includes("triệu")
				? "million"
				: s.includes("usd")
					? "usd"
					: "vnd";

			// remove common words
			s = s.replace(/mức lương:|mức thu nhập|thu nhập|vnd|đ|vnđ|usd/gi, " ");

			// Remove thousand separators like 12,000,000 or 12.000.000 -> keep decimal dots
			s = s.replace(/(\d)[,](?=\d{3})/g, "$1");
			s = s.replace(/(\d)\.(?=\d{3})/g, "$1");

			const nums = Array.from(s.matchAll(/(\d+(?:[\.,]\d+)?)/g)).map((m) =>
				parseFloat(m[1].replace(",", ".")),
			);

			const toMillion = (n) => {
				if (unit === "million") return n;
				if (unit === "usd") return n * 25; // approximate: 1 USDk ~= 25 million VND scaling (approx)
				if (n > 1000) return n / 1000000; // raw VND -> million
				return n; // assume already in millions
			};

			if (nums.length >= 2) {
				const a = toMillion(nums[0]);
				const b = toMillion(nums[1]);
				return { min: Math.min(a, b), max: Math.max(a, b) };
			}

			if (nums.length === 1) {
				const n = toMillion(nums[0]);
				if (s.includes("dưới") || s.includes("under") || s.includes("tới"))
					return { min: 0, max: n };
				if (
					s.includes("trên") ||
					s.includes(">") ||
					s.includes("from") ||
					s.includes("từ")
				)
					return { min: n, max: Infinity };
				return { min: n, max: n };
			}

			return null;
		} catch (e) {
			return null;
		}
	};

	const parseExperienceRange = (expStr) => {
		if (!expStr) return null;
		try {
			const s = expStr.toString().toLowerCase();
			if (
				s.includes("không yêu cầu") ||
				s.includes("khong yeu cau") ||
				s.includes("no experience") ||
				s.includes("not required")
			)
				return null;
			if (s.includes("chưa") || s.includes("chưa có kinh nghiệm"))
				return { min: 0, max: 0 };
			const nums = Array.from(s.matchAll(/(\d+(?:[\.,]\d+)?)/g)).map((m) =>
				parseFloat(m[1].replace(",", ".")),
			);
			if (nums.length >= 2)
				return {
					min: Math.min(nums[0], nums[1]),
					max: Math.max(nums[0], nums[1]),
				};
			if (nums.length === 1) {
				const n = nums[0];
				if (s.includes("trên") || s.includes(">") || s.includes("from"))
					return { min: n, max: Infinity };
				if (s.includes("dưới") || s.includes("tối đa") || s.includes("under"))
					return { min: 0, max: n };
				return { min: n, max: n };
			}
			return null;
		} catch (e) {
			return null;
		}
	};

	// If salary/experience filters require numeric comparison, perform in-memory filtering
	let salaryRangeRaw = salary ? salaryLabelToRange(salary) : null;
	let salaryTextFilter = null;
	if (
		salaryRangeRaw &&
		typeof salaryRangeRaw === "object" &&
		salaryRangeRaw.text
	) {
		salaryTextFilter = salaryRangeRaw.text;
		salaryRangeRaw = null;
	}
	const salaryRange = Array.isArray(salaryRangeRaw) ? salaryRangeRaw : null;
	const experienceRange = experience
		? experienceLabelToRange(experience)
		: null;

	if (salaryRange)
		console.debug("[jobService] parsed salary filter range", {
			salary,
			salaryRange,
		});
	if (experienceRange)
		console.debug("[jobService] parsed experience filter range", {
			experience,
			experienceRange,
		});

	// If we've mapped UI labels to numeric ranges, avoid adding substring WHEREs on the DB
	if (salaryRange) delete jobWhere.salary;
	if (experienceRange) delete jobWhere.experience;

	// If the user requested a textual salary filter like 'thỏa', apply a DB WHERE on salary containing that text
	if (salaryTextFilter) {
		jobWhere[Op.and] = jobWhere[Op.and] || [];
		jobWhere[Op.and].push(
			db.sequelize.where(
				db.sequelize.fn("LOWER", db.sequelize.col("Job.salary")),
				Op.like,
				`%${salaryTextFilter}%`,
			),
		);
	}

	if (salaryRange || experienceRange) {
		// Fetch all matching rows for other filters (no salary/experience in DB where)
		const allRows = await db.Job.findAll({
			where: jobWhere,
			include,
			distinct: true,
		});

		// Sort deterministically if seed provided, otherwise shuffle
		let ordered = allRows.slice();
		if (seed) {
			ordered.sort((a, b) => {
				const ha = crypto
					.createHash("md5")
					.update(String(a.id) + seed)
					.digest("hex");
				const hb = crypto
					.createHash("md5")
					.update(String(b.id) + seed)
					.digest("hex");
				return ha.localeCompare(hb);
			});
		} else {
			// simple shuffle
			for (let i = ordered.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[ordered[i], ordered[j]] = [ordered[j], ordered[i]];
			}
		}

		// Filter by salary/experience ranges in JS (range overlap)
		const filtered = ordered.filter((job) => {
			try {
				if (salaryRange) {
					const jobRange = parseSalaryRange(job.salary);
					if (!jobRange) return false;
					const fMin = salaryRange[0];
					const fMax = salaryRange[1] === Infinity ? Infinity : salaryRange[1];
					const jMin = jobRange.min;
					const jMax = jobRange.max === Infinity ? Infinity : jobRange.max;
					// overlap test
					if (jMax < fMin || jMin > fMax) return false;
				}
				if (experienceRange) {
					const jobRange = parseExperienceRange(job.experience);
					if (!jobRange) return false;
					const fMinE = experienceRange[0];
					const fMaxE =
						experienceRange[1] === Infinity ? Infinity : experienceRange[1];
					const jMinE = jobRange.min;
					const jMaxE = jobRange.max === Infinity ? Infinity : jobRange.max;
					if (jMaxE < fMinE || jMinE > fMaxE) return false;
				}
				return true;
			} catch (e) {
				return false;
			}
		});

		const totalFiltered = filtered.length;
		const start = offset;
		const pageRows = filtered.slice(start, start + pageSize);

		// Build a faux result object
		const result = {
			count: totalFiltered,
			rows: pageRows,
		};

		// Debug logging
		try {
			console.debug(
				"[jobService] fetchRandomJobsByLocation (in-memory filter)",
				{
					location: loc,
					salaryRange,
					experienceRange,
					totalFiltered,
					returned: pageRows.length,
				},
			);
		} catch (e) {}

		const returnedSeed =
			seed || (pageNum === 1 ? Math.random().toString(36).slice(2, 10) : null);

		const jobsWithSavedStatus = await addSavedStatusToJobs(result.rows, userId);
		const jobsWithAllStatus = await addApplicationStatusToJobs(jobsWithSavedStatus, userId);

		return {
			total: result.count,
			page: pageNum,
			pageSize,
			jobs: jobsWithAllStatus,
			seed: returnedSeed,
		};
	}

	// Determine ordering: deterministic by seed if provided, else random
	let orderOption;
	if (seed) {
		// Use MD5(CONCAT(CAST(Job.id AS CHAR), seed)) for MySQL deterministic ordering
		orderOption = [
			[
				db.sequelize.literal(
					`MD5(CONCAT(CAST(\`Job\`.\`id\` AS CHAR), '${seed}'))`,
				),
				"ASC",
			],
		];
	} else {
		orderOption = db.sequelize.random();
	}

	const result = await db.Job.findAndCountAll({
		where: jobWhere,
		include,
		distinct: true,
		limit: pageSize,
		offset,
		order: orderOption,
	});

	// If no seed provided and pageNum === 1, generate a seed to return to client
	const returnedSeed =
		seed || (pageNum === 1 ? Math.random().toString(36).slice(2, 10) : null);

	const jobsWithSavedStatus = await addSavedStatusToJobs(result.rows, userId);
	const jobsWithAllStatus = await addApplicationStatusToJobs(jobsWithSavedStatus, userId);

	return {
		total: result.count,
		page: pageNum,
		pageSize,
		jobs: jobsWithAllStatus,
		seed: returnedSeed,
	};
}
const getJobByCompanyId = async ({
	companyId,
	page = 1,
	limit = 10,
	search = "",
	location = "",
	status = "all",
	userId = null,
}) => {
	try {
		const pageNum = Math.max(1, parseInt(page || "1"));
		const pageSize = Math.max(1, parseInt(limit || "10"));
		const offset = (pageNum - 1) * pageSize;

		const where = { companyId };
		if (search) {
			where.title = { [Op.like]: `%${search}%` };
		}
		if (status && status !== "all") {
			where.status = status;
		}

		const includeLocation = {
			model: db.Location,
			as: "locations",
			through: { attributes: [] },
		};

		if (location && location !== "Tất cả tỉnh/thành phố") {
			includeLocation.required = true;
			includeLocation.where = {
				name: { [Op.like]: `%${location}%` },
			};
		}

		const { count, rows } = await db.Job.findAndCountAll({
			where,
			limit: pageSize,
			offset,
			attributes: {
				include: [
					[
						db.sequelize.literal(`(
							SELECT COUNT(*)
							FROM applications AS app
							WHERE app.job_id = Job.id
						)`),
						"applicantCount"
					]
				]
			},
			include: [
				includeLocation,
				{
					model: db.Category,
					as: "categories",
					through: { attributes: [] },
				},
				{
					model: db.Company,
					as: "Company",
				},
			],
			distinct: true,
		});

		const jobsWithSavedStatus = await addSavedStatusToJobs(rows, userId);
		const jobsWithAllStatus = await addApplicationStatusToJobs(jobsWithSavedStatus, userId);
		return {
			total: count,
			page: pageNum,
			limit: pageSize,
			jobs: jobsWithAllStatus,
		};
	} catch (error) {
		throw error;
	}
};

const getJobById = async (jobId, userId = null) => {
	try {
		const job = await db.Job.findByPk(jobId, {
			include: [
				{
					model: db.Location,
					as: "locations",
					through: { attributes: [] },
				},
				{
					model: db.Category,
					as: "categories",
					through: { attributes: [] },
				},
				{
					model: db.Company,
					as: "Company",
				},
			],
		});

		if (!job) return null;

		const jobsWithSavedStatus = await addSavedStatusToJobs([job], userId);
		const jobsWithAllStatus = await addApplicationStatusToJobs(jobsWithSavedStatus, userId);
		return jobsWithAllStatus[0];
	} catch (error) {
		throw error;
	}
};

async function searchJobs({
	location = "all",
	page = 1,
	limit = 10,
	search = null,
	salary = null,
	experience = null,
	employmentType = null,
	categoryId = null,
	userId = null,
}) {
	const loc = (location || "all").toString().toLowerCase();
	const pageNum = Math.max(1, parseInt(page || "1"));
	const pageSize = Math.max(1, parseInt(limit || "10"));
	const offset = (pageNum - 1) * pageSize;

	// Build location filter (same region-key mapping as fetchRandomJobsByLocation)
	const HANOI_KEYS = ["hà nội", "ha noi", "hanoi"];
	const HCM_KEYS = [
		"hồ chí minh",
		"ho chi minh",
		"thành phố hồ chí minh",
		"tp hcm",
		"hcm",
		"sài gòn",
		"saigon",
	];
	const MIENBAC_KEYS = [
		"hà nội",
		"hải phòng",
		"quảng ninh",
		"thái bình",
		"nam định",
		"ninh bình",
		"hải dương",
		"hưng yên",
		"phú thọ",
		"bắc ninh",
		"bắc giang",
		"vĩnh phúc",
		"thái nguyên",
		"lạng sơn",
		"cao bằng",
		"bắc kạn",
		"hà giang",
	];
	const MIENNAM_KEYS = [
		"hồ chí minh",
		"can tho",
		"an giang",
		"bac lieu",
		"ben tre",
		"cà mau",
		"dong thap",
		"long an",
		"tien giang",
		"bình dương",
		"đồng nai",
		"bà rịa",
		"kiên giang",
		"tây ninh",
		"vĩnh long",
		"hau giang",
		"sóc trăng",
		"bình thuận",
		"ninh thuận",
		"khánh hòa",
	];

	let locationFilter = null;
	if (loc !== "all") {
		let keys = [];
		if (loc.includes("hanoi") || loc.includes("hà nội")) keys = HANOI_KEYS;
		else if (
			loc.includes("hcm") ||
			loc.includes("chi minh") ||
			loc.includes("sài gòn") ||
			loc.includes("saigon")
		)
			keys = HCM_KEYS;
		else if (loc.includes("mien") && loc.includes("bac")) keys = MIENBAC_KEYS;
		else if (loc.includes("mien") && loc.includes("nam")) keys = MIENNAM_KEYS;
		else keys = [loc];

		const orConditions = keys.map((k) => ({
			name: { [Op.like]: `%${k}%` },
		}));
		locationFilter = { [Op.or]: orConditions };
	}

	const include = [
		{
			model: db.Location,
			as: "locations",
			through: { attributes: [] },
			required: !!locationFilter,
			where: locationFilter || undefined,
		},
		{
			model: db.Category,
			as: "categories",
			through: { attributes: [] },
			required: !!categoryId,
			where: categoryId ? { id: categoryId } : undefined,
		},
		{
			model: db.Company,
			as: "Company",
			required: false,
		},
	];

	// --- Salary / Experience range parsing helpers ---
	const parseSalaryRange = (salaryStr) => {
		if (!salaryStr) return null;
		try {
			const sRaw = salaryStr.toString().toLowerCase();
			let s = sRaw.replace(/\u00A0/g, " ");
			const unit = s.includes("triệu")
				? "million"
				: s.includes("usd")
					? "usd"
					: "vnd";
			s = s.replace(/mức lương:|mức thu nhập|thu nhập|vnd|đ|vnđ|usd/gi, " ");
			s = s.replace(/(\d)[,](?=\d{3})/g, "$1");
			s = s.replace(/(\d)\.(?=\d{3})/g, "$1");
			const nums = Array.from(s.matchAll(/(\d+(?:[\.,]\d+)?)/g)).map((m) =>
				parseFloat(m[1].replace(",", ".")),
			);
			const toMillion = (n) => {
				if (unit === "million") return n;
				if (unit === "usd") return n * 25;
				if (n > 1000) return n / 1000000;
				return n;
			};
			if (nums.length >= 2) {
				const a = toMillion(nums[0]);
				const b = toMillion(nums[1]);
				return { min: Math.min(a, b), max: Math.max(a, b) };
			}
			if (nums.length === 1) {
				const n = toMillion(nums[0]);
				if (s.includes("dưới") || s.includes("under") || s.includes("tới"))
					return { min: 0, max: n };
				if (
					s.includes("trên") ||
					s.includes(">") ||
					s.includes("from") ||
					s.includes("từ")
				)
					return { min: n, max: Infinity };
				return { min: n, max: n };
			}
			return null;
		} catch (e) {
			return null;
		}
	};

	const parseExperienceRange = (expStr) => {
		if (!expStr) return null;
		try {
			const s = expStr.toString().toLowerCase();
			if (s.includes("không yêu cầu") || s.includes("no experience"))
				return null;
			if (s.includes("chưa")) return { min: 0, max: 0 };
			const nums = Array.from(s.matchAll(/(\d+(?:[\.,]\d+)?)/g)).map((m) =>
				parseFloat(m[1].replace(",", ".")),
			);
			if (nums.length >= 2)
				return {
					min: Math.min(nums[0], nums[1]),
					max: Math.max(nums[0], nums[1]),
				};
			if (nums.length === 1) {
				const n = nums[0];
				if (s.includes("trên") || s.includes(">"))
					return { min: n, max: Infinity };
				if (s.includes("dưới") || s.includes("tối đa"))
					return { min: 0, max: n };
				return { min: n, max: n };
			}
			return null;
		} catch (e) {
			return null;
		}
	};

	const salaryLabelToRange = (label) => {
		if (!label) return null;
		const l = label.toString().trim().toLowerCase();
		if (l === "tất cả" || l === "all") return null;
		if (l.includes("thỏa") || l.includes("thoa")) return { text: "thỏa" };
		const parsed = parseSalaryRange(label);
		if (parsed)
			return [parsed.min, parsed.max === Infinity ? Infinity : parsed.max];
		const map = {
			"dưới 10 triệu": [0, 10],
			"từ 10-15 triệu": [10, 15],
			"từ 15-20 triệu": [15, 20],
			"từ 20-25 triệu": [20, 25],
			"từ 25-30 triệu": [25, 30],
			"trên 30-50 triệu": [30, 50],
			"trên 50 triệu": [50, Infinity],
		};
		return map[l] || null;
	};

	const experienceLabelToRange = (label) => {
		if (!label) return null;
		const l = label.toString().trim().toLowerCase();
		if (l === "tất cả" || l === "all") return null;
		if (l.includes("chưa")) return [0, 0];
		const parsed = parseExperienceRange(label);
		if (parsed)
			return [parsed.min, parsed.max === Infinity ? Infinity : parsed.max];
		const map = {
			"1 năm trở xuống": [0, 1],
			"1 năm": [1, 1],
			"2 năm": [2, 2],
			"3 năm": [3, 3],
			"từ 4-5 năm": [4, 5],
			"trên 5 năm": [5, Infinity],
		};
		return map[l] || null;
	};

	// --- Build where clause ---
	const jobWhere = { status: "open" };
	if (search && search.trim()) {
		jobWhere.title = { [Op.like]: `%${search.trim()}%` };
	}

	let salaryRangeRaw = salary ? salaryLabelToRange(salary) : null;
	let salaryTextFilter = null;
	if (
		salaryRangeRaw &&
		typeof salaryRangeRaw === "object" &&
		salaryRangeRaw.text
	) {
		salaryTextFilter = salaryRangeRaw.text;
		salaryRangeRaw = null;
	}
	const salaryRange = Array.isArray(salaryRangeRaw) ? salaryRangeRaw : null;
	const experienceRange = experience
		? experienceLabelToRange(experience)
		: null;

	if (salaryTextFilter) {
		jobWhere[Op.and] = jobWhere[Op.and] || [];
		jobWhere[Op.and].push(
			db.sequelize.where(
				db.sequelize.fn("LOWER", db.sequelize.col("Job.salary")),
				Op.like,
				`%${salaryTextFilter}%`,
			),
		);
	}

	// If we need in-memory salary/experience filtering
	if (salaryRange || experienceRange) {
		const allRows = await db.Job.findAll({
			where: jobWhere,
			include,
			distinct: true,
		});

		// Sort by newest first (deterministic)
		let ordered = allRows.slice();
		ordered.sort((a, b) => b.id - a.id);

		// Filter by salary/experience ranges in JS (range overlap)
		const filtered = ordered.filter((job) => {
			try {
				if (salaryRange) {
					const jobRange = parseSalaryRange(job.salary);
					if (!jobRange) return false;
					const fMin = salaryRange[0];
					const fMax = salaryRange[1] === Infinity ? Infinity : salaryRange[1];
					if (jobRange.max < fMin || jobRange.min > fMax) return false;
				}
				if (experienceRange) {
					const jobRange = parseExperienceRange(job.experience);
					if (!jobRange) return false;
					const fMinE = experienceRange[0];
					const fMaxE =
						experienceRange[1] === Infinity ? Infinity : experienceRange[1];
					if (jobRange.max < fMinE || jobRange.min > fMaxE) return false;
				}
				return true;
			} catch (e) {
				return false;
			}
		});

		const totalFiltered = filtered.length;
		const pageRows = filtered.slice(offset, offset + pageSize);
		const jobsWithSavedStatus = await addSavedStatusToJobs(pageRows, userId);
		const jobsWithAllStatus = await addApplicationStatusToJobs(jobsWithSavedStatus, userId);

		return {
			total: totalFiltered,
			page: pageNum,
			pageSize,
			jobs: jobsWithAllStatus,
		};
	}

	// No in-memory filtering needed – query DB directly with deterministic order
	const result = await db.Job.findAndCountAll({
		where: jobWhere,
		include,
		distinct: true,
		limit: pageSize,
		offset,
		order: [["id", "DESC"]],
	});

	const jobsWithSavedStatus = await addSavedStatusToJobs(result.rows, userId);
	const jobsWithAllStatus = await addApplicationStatusToJobs(jobsWithSavedStatus, userId);

	return {
		total: result.count,
		page: pageNum,
		pageSize,
		jobs: jobsWithAllStatus,
	};
}

const saveOrUnsaveJob = async (userId, jobId) => {
	if (!userId || !jobId) {
		return {
			errCode: -1,
			errMessage: "Invalid user or job ID",
		};
	}
	try {
		const existing = await db.SavedJob.findOne({
			where: { userId, jobId },
		});
		if (existing) {
			await db.SavedJob.destroy({
				where: { userId, jobId },
			});
			return {
				errCode: 0,
				errMessage: "Job unsaved successfully",
			};
		} else {
			await db.SavedJob.create({
				userId,
				jobId,
			});
			return {
				errCode: 0,
				errMessage: "Job saved successfully",
			};
		}
	} catch (error) {
		return {
			errCode: -1,
			errMessage: "Failed to save the job",
		};
	}
};

const getSavedJobs = async (userId, page = 1, limit = 10) => {
	try {
		const pageNum = Math.max(1, parseInt(page || "1"));
		const pageSize = Math.max(1, parseInt(limit || "10"));
		const offset = (pageNum - 1) * pageSize;

		const { count, rows } = await db.SavedJob.findAndCountAll({
			where: { userId },
			limit: pageSize,
			offset,
			include: [
				{
					model: db.Job,
					as: "Job",
					include: [
						{
							model: db.Location,
							as: "locations",
							through: { attributes: [] },
						},
						{
							model: db.Category,
							as: "categories",
							through: { attributes: [] },
						},
						{
							model: db.Company,
							as: "Company",
						},
					],
				},
			],
			order: [["createdAt", "DESC"]],
			distinct: true,
		});

		const jobs = rows.map((sj) => {
			const jobData = sj.Job.get({ plain: true });
			return {
				...jobData,
				isSaved: true,
				savedDate: sj.createdAt,
			};
		});

		const jobsWithAppliedStatus = await addApplicationStatusToJobs(jobs, userId);

		return {
			total: count,
			page: pageNum,
			limit: pageSize,
			jobs: jobsWithAppliedStatus,
		};
	} catch (error) {
		throw error;
	}
};

const createJob = async (data) => {
	try {
		const {
			companyId,
			title,
			salary,
			level,
			experience,
			education,
			gender,
			age,
			employmentType,
			quantity,
			startDate,
			endDate,
			description,
			requirement,
			benefit,
			workLocation,
			workTime,
			categoryIds, // Array of IDs
			locationIds, // Array of IDs
		} = data;

		const job = await db.Job.create({
			companyId,
			title,
			salary,
			level,
			experience,
			education,
			gender,
			age,
			employmentType,
			quantity,
			startDate,
			endDate,
			description,
			requirement,
			benefit,
			workLocation,
			workTime,
			status: "open",
		});

		if (categoryIds && categoryIds.length > 0) {
			await job.setCategories(categoryIds);
		}
		if (locationIds && locationIds.length > 0) {
			await job.setLocations(locationIds);
		}

		// Sync to Neo4j
		await syncSingleJob(job.id);

		return {
			errCode: 0,
			errMessage: "Job created successfully",
			data: job,
		};
	} catch (error) {
		console.error("Error in createJob service:", error);
		throw error;
	}
};

const updateJob = async (id, data) => {
	try {
		const {
			title,
			salary,
			level,
			experience,
			education,
			gender,
			age,
			employmentType,
			quantity,
			startDate,
			endDate,
			description,
			requirement,
			benefit,
			workLocation,
			workTime,
			categoryIds,
			locationIds,
			status
		} = data;

		const job = await db.Job.findByPk(id);
		if (!job) {
			return { errCode: 1, errMessage: "Job not found" };
		}

		await job.update({
			title,
			salary,
			level,
			experience,
			education,
			gender,
			age,
			employmentType,
			quantity,
			startDate,
			endDate,
			description,
			requirement,
			benefit,
			workLocation,
			workTime,
			status: status || job.status
		});

		if (categoryIds) {
			await job.setCategories(categoryIds);
		}
		if (locationIds) {
			await job.setLocations(locationIds);
		}

		// Sync to Neo4j
		await syncSingleJob(id);

		return {
			errCode: 0,
			errMessage: "Job updated successfully",
			data: job,
		};
	} catch (error) {
		console.error("Error in updateJob service:", error);
		throw error;
	}
};

const deleteJob = async (id) => {
	try {
		const job = await db.Job.findByPk(id);
		if (!job) {
			return { errCode: 1, errMessage: "Job not found" };
		}
		await job.destroy();

		// Sync to Neo4j
		await deleteJobNode(id);

		return {
			errCode: 0,
			errMessage: "Job deleted successfully",
		};
	} catch (error) {
		console.error("Error in deleteJob service:", error);
		throw error;
	}
};

module.exports = {
	searchJobs,
	fetchRandomJobsByLocation,
	getJobByCompanyId,
	getJobById,
	saveOrUnsaveJob,
	getSavedJobs,
	createJob,
	updateJob,
	deleteJob,
};
