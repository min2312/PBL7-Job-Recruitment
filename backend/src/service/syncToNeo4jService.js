import db from "../models/index";
import { Op } from "sequelize";
import neo4j from "neo4j-driver";
import { waitForNeo4j, getWriteSession } from "../config/connectNeo4j";

const getSession = async () => {
	await waitForNeo4j();
	return getWriteSession();
};

export const syncAllToNeo4j = async () => {
	const session = await getSession();
	let tx;
	try {
		// 1. Company
		const companies = await db.Company.findAll({ raw: true });
		for (const c of companies) {
			await session.run(`MERGE (co:Company {id: $id}) SET co.name = $name`, {
				id: c.id,
				name: c.name,
			});
		}

		// 2. Category
		const categories = await db.Category.findAll({ raw: true });
		for (const cat of categories) {
			await session.run(`MERGE (cat:Category {id: $id}) SET cat.name = $name`, {
				id: cat.id,
				name: cat.name,
			});
		}

		// 3. Location
		const locations = await db.Location.findAll({ raw: true });
		for (const loc of locations) {
			await session.run(`MERGE (loc:Location {id: $id}) SET loc.name = $name`, {
				id: loc.id,
				name: loc.name,
			});
		}

		// 4. User
		const users = await db.User.findAll({ raw: true });
		for (const u of users) {
			await session.run(
				`MERGE (u:User {id: $id}) SET u.email = $email, u.fullName = $fullName`,
				{ id: u.id, email: u.email, fullName: u.name },
			);
		}

		// 5. Job + rels
		const jobs = await db.Job.findAll({ raw: true });
		for (const j of jobs) {
			// Job node
			await session.run(
				`MERGE (j:Job {id: $id})
         SET j.title = $title, j.salary = $salary, j.level = $level, j.experience = $experience, j.education = $education, j.createdAt = datetime($createdAt)`,
				{
					id: j.id,
					title: j.title,
					salary: j.salary,
					level: j.level,
					experience: j.experience,
					education: j.education,
					createdAt: j.createdAt ? new Date(j.createdAt).toISOString() : null,
				},
			);
			// Company-POSTED->Job
			if (j.companyId) {
				await session.run(
					`MATCH (co:Company {id: $companyId}), (j:Job {id: $jobId})
           MERGE (co)-[:POSTED]->(j)`,
					{ companyId: j.companyId, jobId: j.id },
				);
			}
		}

		// 6. Job-Category (many-to-many)
		const jobCats = await db.JobCategory.findAll({ raw: true });
		for (const jc of jobCats) {
			await session.run(
				`MATCH (j:Job {id: $jobId}), (cat:Category {id: $catId})
         MERGE (j)-[:BELONGS_TO]->(cat)`,
				{ jobId: jc.jobId, catId: jc.categoryId },
			);
		}

		// 7. Job-Location (many-to-many)
		const jobLocs = await db.JobLocation.findAll({ raw: true });
		for (const jl of jobLocs) {
			await session.run(
				`MATCH (j:Job {id: $jobId}), (loc:Location {id: $locId})
         MERGE (j)-[:LOCATED_IN]->(loc)`,
				{ jobId: jl.jobId, locId: jl.locationId },
			);
		}

		// 8. User-APPLIED_FOR->Job (Application)
		const apps = await db.Application.findAll({ raw: true });
		for (const a of apps) {
			await session.run(
				`MATCH (u:User {id: $userId}), (j:Job {id: $jobId})
         MERGE (u)-[:APPLIED_FOR]->(j)`,
				{ userId: a.userId, jobId: a.jobId },
			);
		}

		return { ok: true };
	} catch (err) {
		console.error("Neo4j sync error:", err);
		return { ok: false, error: err.message };
	} finally {
		await session.close();
	}
};
export const syncRecentToNeo4j = async (days = 1) => {
	const session = await getSession();
	try {
		const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

		// 1. Get recent jobs
		const jobs = await db.Job.findAll({
			where: { createdAt: { [Op.gte]: sinceDate } },
			raw: true,
		});

		if (jobs.length === 0) return { ok: true, message: "No new jobs to sync" };

		// 2. Collect related IDs to sync only what's necessary
		const companyIds = [...new Set(jobs.map((j) => j.companyId).filter(Boolean))];
		const jobIds = jobs.map((j) => j.id);

		// Sync necessary Companies
		const companies = await db.Company.findAll({
			where: { id: { [Op.in]: companyIds } },
			raw: true,
		});
		for (const c of companies) {
			await session.run(`MERGE (co:Company {id: $id}) SET co.name = $name`, {
				id: c.id,
				name: c.name,
			});
		}

		// 3. Sync Jobs and Company-Job relations
		for (const j of jobs) {
			await session.run(
				`MERGE (j:Job {id: $id})
         SET j.title = $title, j.salary = $salary, j.level = $level, j.experience = $experience, j.education = $education, j.job_url = $job_url, j.createdAt = datetime($createdAt)`,
				{
					id: j.id,
					title: j.title,
					salary: j.salary,
					level: j.level,
					experience: j.experience,
					education: j.education,
					job_url: j.jobUrl || null, // Lưu ý: Sequelize dùng jobUrl (camelCase) cho field job_url
					createdAt: j.createdAt ? new Date(j.createdAt).toISOString() : null,
				},
			);
			if (j.companyId) {
				await session.run(
					`MATCH (co:Company {id: $companyId}), (j:Job {id: $jobId})
           MERGE (co)-[:POSTED]->(j)`,
					{ companyId: j.companyId, jobId: j.id },
				);
			}
		}

		// 4. Sync JobCategories + Categories
		const jobCats = await db.JobCategory.findAll({
			where: { jobId: { [Op.in]: jobIds } },
			raw: true,
		});
		const catIds = [...new Set(jobCats.map((jc) => jc.categoryId))];
		const categories = await db.Category.findAll({
			where: { id: { [Op.in]: catIds } },
			raw: true,
		});
		for (const cat of categories) {
			await session.run(`MERGE (cat:Category {id: $id}) SET cat.name = $name`, {
				id: cat.id,
				name: cat.name,
			});
		}
		for (const jc of jobCats) {
			await session.run(
				`MATCH (j:Job {id: $jobId}), (cat:Category {id: $catId})
         MERGE (j)-[:BELONGS_TO]->(cat)`,
				{ jobId: jc.jobId, catId: jc.categoryId },
			);
		}

		// 5. Sync JobLocations + Locations
		const jobLocs = await db.JobLocation.findAll({
			where: { jobId: { [Op.in]: jobIds } },
			raw: true,
		});
		const locIds = [...new Set(jobLocs.map((jl) => jl.locationId))];
		const locations = await db.Location.findAll({
			where: { id: { [Op.in]: locIds } },
			raw: true,
		});
		for (const loc of locations) {
			await session.run(`MERGE (loc:Location {id: $id}) SET loc.name = $name`, {
				id: loc.id,
				name: loc.name,
			});
		}
		for (const jl of jobLocs) {
			await session.run(
				`MATCH (j:Job {id: $jobId}), (loc:Location {id: $locId})
         MERGE (j)-[:LOCATED_IN]->(loc)`,
				{ jobId: jl.jobId, locId: jl.locationId },
			);
		}

		return { ok: true, count: jobs.length };
	} catch (err) {
		console.error("Neo4j incremental sync error:", err);
		return { ok: false, error: err.message };
	} finally {
		await session.close();
	}
};
