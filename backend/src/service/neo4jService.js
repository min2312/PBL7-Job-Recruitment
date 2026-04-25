import neo4j from "neo4j-driver";
import {
	waitForNeo4j,
	getReadSession as createReadSession,
	getWriteSession as createWriteSession,
} from "../config/connectNeo4j";

const getSession = async () => {
	await waitForNeo4j();
	return createReadSession();
};

const getWriteSession = async () => {
	await waitForNeo4j();
	return createWriteSession();
};

export const parseSalary = (salaryRaw) => {
	if (!salaryRaw) return { min: null, max: null, formatted: null };
	const text = salaryRaw.trim().toLowerCase();
	if (/tho[aà] ?thu[aâ]n|thoa ?thuan|negotiation/.test(text)) {
		return { min: null, max: null, formatted: "Thỏa thuận" };
	}

	// +/- triệu, vnđ, usd
	const currency = /tri[eê]u|v[nú]d|usd/.exec(text)?.[0] || "";
	const numbers = Array.from(text.matchAll(/\d+(?:[.,]\d+)?/g), (m) =>
		parseFloat(m[0].replace(",", ".")),
	);
	if (numbers.length === 0) {
		return { min: null, max: null, formatted: salaryRaw };
	}

	let [min, max] = numbers;
	if (numbers.length === 1) {
		max = min;
	}

	if (min > max) [min, max] = [max, min];

	return {
		min,
		max,
		formatted:
			`${min}${max && max !== min ? ` - ${max}` : ""}${currency ? ` ${currency}` : ""}`.trim(),
	};
};

export const buildHeatmap = async (days = 30) => {
	const session = await getSession();
	try {
		const result = await session.run(
			`MATCH (c:Company)-[:POSTED]->(j:Job)-[:BELONGS_TO]->(cat:Category),
             (j)-[:LOCATED_IN]->(loc:Location)
       WHERE j.createdAt IS NOT NULL AND j.createdAt >= datetime() - duration({days: $days})
       WITH cat.name AS category, loc.name AS location, count(j) AS newJobs
       RETURN category, location, newJobs
       ORDER BY newJobs DESC`,
			{ days: neo4j.int(days) },
		);

		const rows = result.records.map((rec) => ({
			category: rec.get("category"),
			location: rec.get("location"),
			newJobs: rec.get("newJobs").toNumber
				? rec.get("newJobs").toNumber()
				: rec.get("newJobs"),
		}));

		const totalNew = rows.reduce((acc, r) => acc + r.newJobs, 0);
		return { totalNew, rows };
	} finally {
		await session.close();
	}
};

export const getMarketDemandSummary = async ({
	category,
	location,
	sinceDays = 30,
}) => {
	const session = await getSession();
	try {
		if (!category || !location) {
			throw new Error("category and location are required parameters");
		}

		const params = {
			category,
			location,
			sinceDays: neo4j.int(sinceDays),
		};

		// 1. Active jobs in category/location
		const activeJobsResult = await session.run(
			`MATCH (j:Job)-[:BELONGS_TO]->(cat:Category), (j)-[:LOCATED_IN]->(loc:Location)
			WHERE cat.name = $category AND loc.name = $location
			  AND ((j.status IS NOT NULL AND toLower(j.status) IN ['open','active','available']) OR j.status IS NULL)
			RETURN count(DISTINCT j) AS activeJobs`,
			params,
		);

		// 2. Total applications (active candidates)
		const applicationsResult = await session.run(
			`MATCH (u:User)-[:APPLIED_FOR]->(j:Job)-[:BELONGS_TO]->(cat:Category), (j)-[:LOCATED_IN]->(loc:Location)
			WHERE cat.name = $category AND loc.name = $location
			  AND ((j.status IS NOT NULL AND toLower(j.status) IN ['open','active','available']) OR j.status IS NULL)
			RETURN count(u) AS applications`,
			params,
		);

		const activeJobs = activeJobsResult.records[0]?.get("activeJobs")?.toNumber
			? activeJobsResult.records[0].get("activeJobs").toNumber()
			: activeJobsResult.records[0]?.get("activeJobs") || 0;

		const applications = applicationsResult.records[0]?.get("applications")
			?.toNumber
			? applicationsResult.records[0].get("applications").toNumber()
			: applicationsResult.records[0]?.get("applications") || 0;

		const competitionRatio =
			activeJobs > 0 ? Number((applications / activeJobs).toFixed(2)) : 0;

		let competitionLevel = "Unknown";
		if (competitionRatio >= 10) competitionLevel = "High";
		else if (competitionRatio >= 5) competitionLevel = "Medium";
		else if (competitionRatio > 0) competitionLevel = "Low";
		else competitionLevel = "Very Low";

		return {
			category,
			location,
			market_demand: activeJobs,
			active_candidates: applications,
			competition_ratio: competitionRatio,
			competition_level: competitionLevel,
		};
	} finally {
		await session.close();
	}
};

export const buildCompetition = async () => {
	const session = await getSession();
	try {
		const result = await session.run(
			`MATCH (u:User)-[:APPLIED_FOR]->(j:Job)-[:BELONGS_TO]->(cat:Category)
			 WHERE (j.status IS NOT NULL AND toLower(j.status) IN ['open','active','available']) OR j.status IS NULL
			 WITH cat.name AS category, count(*) AS applications, count(DISTINCT j) AS openJobs
			 WHERE openJobs > 0
			 RETURN category, applications, openJobs, toFloat(applications)/toFloat(openJobs) AS ratio
			 ORDER BY ratio DESC`,
		);

		return result.records.map((rec) => ({
			category: rec.get("category"),
			applications: rec.get("applications").toNumber
				? rec.get("applications").toNumber()
				: rec.get("applications"),
			openJobs: rec.get("openJobs").toNumber
				? rec.get("openJobs").toNumber()
				: rec.get("openJobs"),
			ratio: rec.get("ratio").toNumber
				? rec.get("ratio").toNumber()
				: rec.get("ratio"),
			competitionText: `1:${rec.get("ratio").toNumber ? rec.get("ratio").toNumber().toFixed(1) : parseFloat(rec.get("ratio")).toFixed(1)}`,
		}));
	} finally {
		await session.close();
	}
};

export const buildHiringCriteria = async (categoryName, limit = 10) => {
	const session = await getSession();
	try {
		const query = `
      MATCH (j:Job)-[:BELONGS_TO]->(cat:Category)
      WHERE cat.name = $categoryName
      WITH j.level AS level, j.experience AS experience, j.education AS education, count(*) AS count
      ORDER BY count DESC
      LIMIT $limit
      RETURN level, experience, education, count`;
		const result = await session.run(query, {
			categoryName,
			limit: neo4j.int(limit),
		});

		const rows = result.records.map((rec) => ({
			level: rec.get("level"),
			experience: rec.get("experience"),
			education: rec.get("education"),
			count: rec.get("count").toNumber
				? rec.get("count").toNumber()
				: rec.get("count"),
		}));

		return rows;
	} finally {
		await session.close();
	}
};

export const buildSalaryTrend = async ({
	categoryName,
	locationName,
	experience,
	sinceDays = 90,
}) => {
	const session = await getSession();
	try {
		const filters = [];
		const params = { sinceDays: neo4j.int(sinceDays) };

		if (categoryName) {
			filters.push("cat.name = $categoryName");
			params.categoryName = categoryName;
		}
		if (locationName) {
			filters.push("loc.name = $locationName");
			params.locationName = locationName;
		}
		if (experience) {
			filters.push("j.experience = $experience");
			params.experience = experience;
		}

		const whereClause = filters.length ? `AND ${filters.join(" AND ")}` : "";

		const query = `
      MATCH (c:Company)-[:POSTED]->(j:Job)-[:BELONGS_TO]->(cat:Category), (j)-[:LOCATED_IN]->(loc:Location)
      WHERE j.createdAt >= datetime() - duration({days: $sinceDays}) ${whereClause}
      AND j.salary IS NOT NULL
      RETURN j.salary AS salaryStr
    `;

		const result = await session.run(query, params);
		if (!result.records.length) return null;

		const parsed = result.records
			.map((rec) => parseSalary(rec.get("salaryStr")))
			.filter((p) => p.min != null && p.max != null);

		if (!parsed.length) return null;

		const avgMin = parsed.reduce((acc, p) => acc + p.min, 0) / parsed.length;
		const avgMax = parsed.reduce((acc, p) => acc + p.max, 0) / parsed.length;

		return {
			avgMin: Number(avgMin.toFixed(2)),
			avgMax: Number(avgMax.toFixed(2)),
			sampleSize: parsed.length,
		};
	} finally {
		await session.close();
	}
};

const toFloatOrNull = (value) => {
	if (value === null || value === undefined) return null;
	const n = Number(value);
	return Number.isFinite(n) ? n : null;
};

const normalizeExperienceYears = (experience) => {
	if (!experience) return 0;
	const text = String(experience).toLowerCase();
	if (
		text.includes("dưới 1") ||
		text.includes("dưới 1 năm") ||
		text.includes("<1")
	)
		return 0.5;
	if (text.includes("1 năm")) return 1;
	if (
		text.includes("không yêu cầu") ||
		text.includes("no requirement") ||
		text.includes("none")
	)
		return 0;
	const matched = text.match(/(\d+(?:[.,]\d+)?)\s*năm/);
	if (matched) return Number(matched[1].replace(",", "."));
	const numeric = Number(text.replace(/[^\d.,]/g, "").replace(",", "."));
	if (Number.isFinite(numeric)) return numeric;
	return 0;
};

export const buildTrainingDataset = async () => {
	const session = await getSession();
	try {
		const salaryAgg = await session.run(`
      MATCH (j:Job)-[:BELONGS_TO]->(cat:Category), (j)-[:LOCATED_IN]->(loc:Location)
      WHERE j.salary_min IS NOT NULL AND j.salary_max IS NOT NULL
      WITH cat.name AS category, loc.name AS location,
           coalesce(j.level,'Nhân viên') AS level,
           coalesce(j.education,'Không rõ') AS education,
           coalesce(j.experience,'Không yêu cầu') AS experience,
           avg(toFloat(j.salary_min)) AS avgMin,
           avg(toFloat(j.salary_max)) AS avgMax,
           count(*) AS jobsCount
      RETURN category, location, level, education, experience, avgMin, avgMax, (avgMin + avgMax) / 2 AS target_salary, jobsCount
      ORDER BY category, location, level, education, experience
    `);

		const competitionRows = await session.run(`
      MATCH (u:User)-[:APPLIED_FOR]->(j:Job)-[:BELONGS_TO]->(cat:Category)
      WHERE (j.status IS NOT NULL AND toLower(j.status) IN ['open','active','available']) OR j.status IS NULL
      WITH cat.name AS category, count(*) AS applications, count(DISTINCT j) AS openJobs
      WHERE openJobs > 0
      RETURN category, applications, openJobs, toFloat(applications)/toFloat(openJobs) AS competitionRatio
    `);

		const heatmapRows = await session.run(`
      MATCH (c:Company)-[:POSTED]->(j:Job)-[:BELONGS_TO]->(cat:Category), (j)-[:LOCATED_IN]->(loc:Location)
      WITH cat.name AS category, loc.name AS location, count(j) AS newJobs
      RETURN category, location, newJobs
    `);

		const competitionMap = new Map();
		for (const rec of competitionRows.records) {
			const cat = rec.get("category");
			const app = rec.get("applications").toNumber
				? rec.get("applications").toNumber()
				: rec.get("applications");
			const openJobs = rec.get("openJobs").toNumber
				? rec.get("openJobs").toNumber()
				: rec.get("openJobs");
			const ratio = rec.get("competitionRatio").toNumber
				? rec.get("competitionRatio").toNumber()
				: rec.get("competitionRatio");
			competitionMap.set(cat, { applications: app, openJobs, ratio });
		}

		const heatmapMap = new Map();
		for (const rec of heatmapRows.records) {
			const cat = rec.get("category");
			const loc = rec.get("location");
			const newJobs = rec.get("newJobs").toNumber
				? rec.get("newJobs").toNumber()
				: rec.get("newJobs");
			heatmapMap.set(`${cat}||${loc}`, newJobs);
		}

		const rows = salaryAgg.records.map((rec) => {
			const category = rec.get("category");
			const location = rec.get("location");
			const level = rec.get("level");
			const education = rec.get("education");
			const experience = rec.get("experience");
			const avgMin = toFloatOrNull(rec.get("avgMin"));
			const avgMax = toFloatOrNull(rec.get("avgMax"));
			const targetSalary = toFloatOrNull(rec.get("target_salary"));
			const jobsCount = rec.get("jobsCount").toNumber
				? rec.get("jobsCount").toNumber()
				: rec.get("jobsCount");
			const expYears = normalizeExperienceYears(experience);
			const marketDemand = heatmapMap.get(`${category}||${location}`) || 0;
			const comp = competitionMap.get(category);
			const competitionIndex =
				comp && marketDemand > 0
					? (comp.ratio || comp.applications / comp.openJobs) / marketDemand
					: null;

			return {
				category,
				location,
				level,
				education,
				experience,
				experience_years: expYears,
				avgMin,
				avgMax,
				target_salary: targetSalary,
				jobsCount,
				market_demand: marketDemand,
				competition_applications: comp?.applications || 0,
				competition_openJobs: comp?.openJobs || 0,
				competition_ratio: comp?.ratio || null,
				competition_index: competitionIndex,
			};
		});

		return rows;
	} finally {
		await session.close();
	}
};

export const backfillSalaryParsedFields = async () => {
	const session = await getWriteSession();
	try {
		const select = await session.run(`
      MATCH (j:Job)
      WHERE j.salary IS NOT NULL AND (j.salary_min IS NULL OR j.salary_max IS NULL)
      RETURN ID(j) AS nodeId, j.salary AS salary
      LIMIT 1000
    `);

		const updates = [];
		for (const rec of select.records) {
			const nodeId = rec.get("nodeId").toNumber
				? rec.get("nodeId").toNumber()
				: rec.get("nodeId");
			const salary = rec.get("salary");
			const parsed = parseSalary(salary);
			if (parsed.min != null || parsed.max != null) {
				updates.push({ nodeId, ...parsed });
			}
		}

		for (const item of updates) {
			await session.run(
				`MATCH (j:Job)
         WHERE ID(j) = $nodeId
         SET j.salary_min = $min, j.salary_max = $max`,
				{
					nodeId: neo4j.int(item.nodeId),
					min: item.min === null ? null : neo4j.int(item.min),
					max: item.max === null ? null : neo4j.int(item.max),
				},
			);
		}

		return { updated: updates.length };
	} finally {
		await session.close();
	}
};
