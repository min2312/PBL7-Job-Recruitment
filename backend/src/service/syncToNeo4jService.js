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
	try {
		// 1. Sync Companies
		const companies = await db.Company.findAll({ raw: true });
		await session.run(
			`UNWIND $batch AS data
			 MERGE (co:Company {id: data.id})
			 SET co.name = data.name, co.logo = data.logo, co.website = data.website`,
			{ batch: companies },
		);

		// 2. Sync Categories
		const categories = await db.Category.findAll({ raw: true });
		await session.run(
			`UNWIND $batch AS data
			 MERGE (cat:Category {id: data.id})
			 SET cat.name = data.name`,
			{ batch: categories },
		);

		// 3. Sync Locations
		const locations = await db.Location.findAll({ raw: true });
		await session.run(
			`UNWIND $batch AS data
			 MERGE (loc:Location {id: data.id})
			 SET loc.name = data.name`,
			{ batch: locations },
		);

		// 4. Sync Users
		const users = await db.User.findAll({ raw: true });
		await session.run(
			`UNWIND $batch AS data
			 MERGE (u:User {id: data.id})
			 SET u.email = data.email, u.fullName = data.fullName, u.role = data.role, u.status = data.status`,
			{ batch: users.map(u => ({ ...u, fullName: u.fullName || u.name })) },
		);

		// 5. Sync Jobs
		const jobs = await db.Job.findAll({ raw: true });
		await session.run(
			`UNWIND $batch AS data
			 MERGE (j:Job {id: data.id})
			 SET j.title = data.title, j.salary = data.salary, j.level = data.level, 
			     j.experience = data.experience, j.education = data.education, 
				 j.status = data.status, j.job_url = data.jobUrl,
				 j.createdAt = datetime(data.createdAtIso)`,
			{ 
				batch: jobs.map(j => ({ 
					...j, 
					createdAtIso: j.createdAt ? new Date(j.createdAt).toISOString() : null 
				})) 
			},
		);

		// 6. Sync Company-POSTED->Job
		await session.run(
			`UNWIND $batch AS data
			 MATCH (co:Company {id: data.companyId}), (j:Job {id: data.id})
			 MERGE (co)-[:POSTED]->(j)`,
			{ batch: jobs.filter(j => j.companyId) },
		);

		// 7. Sync Job-BELONGS_TO->Category
		const jobCats = await db.JobCategory.findAll({ raw: true });
		await session.run(
			`UNWIND $batch AS data
			 MATCH (j:Job {id: data.jobId}), (cat:Category {id: data.categoryId})
			 MERGE (j)-[:BELONGS_TO]->(cat)`,
			{ batch: jobCats },
		);

		// 8. Sync Job-LOCATED_IN->Location
		const jobLocs = await db.JobLocation.findAll({ raw: true });
		await session.run(
			`UNWIND $batch AS data
			 MATCH (j:Job {id: data.jobId}), (loc:Location {id: data.locationId})
			 MERGE (j)-[:LOCATED_IN]->(loc)`,
			{ batch: jobLocs },
		);

		// 9. Sync User-APPLIED_FOR->Job
		const apps = await db.Application.findAll({ raw: true });
		await session.run(
			`UNWIND $batch AS data
			 MATCH (u:User {id: data.userId}), (j:Job {id: data.jobId})
			 MERGE (u)-[r:APPLIED_FOR]->(j)
			 SET r.status = data.status, r.createdAt = datetime(data.createdAtIso)`,
			{ 
				batch: apps.map(a => ({ 
					...a, 
					createdAtIso: a.createdAt ? new Date(a.createdAt).toISOString() : null 
				})) 
			},
		);

		return { ok: true, message: "Full sync completed successfully" };
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
		const whereRecent = { updatedAt: { [Op.gte]: sinceDate } };

		// 1. Sync Companies
		const companies = await db.Company.findAll({ where: whereRecent, raw: true });
		if (companies.length > 0) {
			await session.run(
				`UNWIND $batch AS data
				 MERGE (co:Company {id: data.id})
				 SET co.name = data.name, co.logo = data.logo, co.website = data.website`,
				{ batch: companies },
			);
		}

		// 2. Sync Categories (Categories are usually few, sync all to ensure completeness)
		const categories = await db.Category.findAll({ raw: true });
		await session.run(
			`UNWIND $batch AS data
			 MERGE (cat:Category {id: data.id})
			 SET cat.name = data.name`,
			{ batch: categories },
		);

		// 3. Sync Locations (Locations are usually few, sync all)
		const locations = await db.Location.findAll({ raw: true });
		await session.run(
			`UNWIND $batch AS data
			 MERGE (loc:Location {id: data.id})
			 SET loc.name = data.name`,
			{ batch: locations },
		);

		// 4. Sync Users
		const users = await db.User.findAll({ where: whereRecent, raw: true });
		if (users.length > 0) {
			await session.run(
				`UNWIND $batch AS data
				 MERGE (u:User {id: data.id})
				 SET u.email = data.email, u.fullName = data.fullName, u.role = data.role, u.status = data.status`,
				{ batch: users.map(u => ({ ...u, fullName: u.fullName || u.name })) },
			);
		}

		// 5. Sync Jobs
		const jobs = await db.Job.findAll({ where: whereRecent, raw: true });
		if (jobs.length > 0) {
			await session.run(
				`UNWIND $batch AS data
				 MERGE (j:Job {id: data.id})
				 SET j.title = data.title, j.salary = data.salary, j.level = data.level, 
				     j.experience = data.experience, j.education = data.education, 
					 j.status = data.status, j.job_url = data.jobUrl,
					 j.createdAt = datetime(data.createdAtIso)`,
				{ 
					batch: jobs.map(j => ({ 
						...j, 
						createdAtIso: j.createdAt ? new Date(j.createdAt).toISOString() : null 
					})) 
				},
			);

			const jobIds = jobs.map(j => j.id);

			// 6. Sync Company-POSTED->Job
			await session.run(
				`UNWIND $batch AS data
				 MATCH (co:Company {id: data.companyId}), (j:Job {id: data.id})
				 MERGE (co)-[:POSTED]->(j)`,
				{ batch: jobs.filter(j => j.companyId) },
			);

			// 7. Sync Job-BELONGS_TO->Category
			const jobCats = await db.JobCategory.findAll({ 
				where: { jobId: { [Op.in]: jobIds } }, 
				raw: true 
			});
			if (jobCats.length > 0) {
				await session.run(
					`UNWIND $batch AS data
					 MATCH (j:Job {id: data.jobId}), (cat:Category {id: data.categoryId})
					 MERGE (j)-[:BELONGS_TO]->(cat)`,
					{ batch: jobCats },
				);
			}

			// 8. Sync Job-LOCATED_IN->Location
			const jobLocs = await db.JobLocation.findAll({ 
				where: { jobId: { [Op.in]: jobIds } }, 
				raw: true 
			});
			if (jobLocs.length > 0) {
				await session.run(
					`UNWIND $batch AS data
					 MATCH (j:Job {id: data.jobId}), (loc:Location {id: data.locationId})
					 MERGE (j)-[:LOCATED_IN]->(loc)`,
					{ batch: jobLocs },
				);
			}
		}

		// 9. Sync User-APPLIED_FOR->Job
		const apps = await db.Application.findAll({ where: whereRecent, raw: true });
		if (apps.length > 0) {
			await session.run(
				`UNWIND $batch AS data
				 MATCH (u:User {id: data.userId}), (j:Job {id: data.jobId})
				 MERGE (u)-[r:APPLIED_FOR]->(j)
				 SET r.status = data.status, r.createdAt = datetime(data.createdAtIso)`,
				{ 
					batch: apps.map(a => ({ 
						...a, 
						createdAtIso: a.createdAt ? new Date(a.createdAt).toISOString() : null 
					})) 
				},
			);
		}

		return { ok: true, message: `Incremental sync (last ${days} days) completed successfully` };
	} catch (err) {
		console.error("Neo4j incremental sync error:", err);
		return { ok: false, error: err.message };
	} finally {
		await session.close();
	}
};
export const syncSingleJob = async (jobId) => {
	const session = await getSession();
	try {
		const job = await db.Job.findByPk(jobId, {
			include: [
				{ model: db.Location, as: "locations" },
				{ model: db.Category, as: "categories" },
				{ model: db.Company, as: "Company" }
			]
		});
		if (!job) return { ok: false, error: "Job not found" };

		const j = job.get({ plain: true });

		// 1. Sync Job Node
		await session.run(
			`MERGE (j:Job {id: $id})
			 SET j.title = $title, j.salary = $salary, j.level = $level, 
			     j.experience = $experience, j.education = $education, 
				 j.status = $status, j.job_url = $job_url,
				 j.createdAt = datetime($createdAt)`,
			{
				id: j.id,
				title: j.title,
				salary: j.salary,
				level: j.level,
				experience: j.experience,
				education: j.education,
				status: j.status,
				job_url: j.jobUrl,
				createdAt: j.createdAt ? new Date(j.createdAt).toISOString() : null
			}
		);

		// 2. Sync Company Relation
		if (j.companyId) {
			await session.run(
				`MATCH (co:Company {id: $companyId}), (j:Job {id: $jobId})
				 MERGE (co)-[:POSTED]->(j)`,
				{ companyId: j.companyId, jobId: j.id }
			);
		}

		// 3. Sync Category Relations
		if (j.categories) {
			for (const cat of j.categories) {
				await session.run(
					`MATCH (j:Job {id: $jobId}), (cat:Category {id: $catId})
					 MERGE (j)-[:BELONGS_TO]->(cat)`,
					{ jobId: j.id, catId: cat.id }
				);
			}
		}

		// 4. Sync Location Relations
		if (j.locations) {
			for (const loc of j.locations) {
				await session.run(
					`MATCH (j:Job {id: $jobId}), (loc:Location {id: $locId})
					 MERGE (j)-[:LOCATED_IN]->(loc)`,
					{ jobId: j.id, locId: loc.id }
				);
			}
		}

		return { ok: true };
	} catch (err) {
		console.error("syncSingleJob error:", err);
		return { ok: false, error: err.message };
	} finally {
		await session.close();
	}
};

export const deleteJobNode = async (jobId) => {
	const session = await getSession();
	try {
		await session.run(`MATCH (j:Job {id: $id}) DETACH DELETE j`, { id: parseInt(jobId) });
		return { ok: true };
	} catch (err) {
		console.error("deleteJobNode error:", err);
		return { ok: false, error: err.message };
	} finally {
		await session.close();
	}
};

export const syncSingleUser = async (userId) => {
	const session = await getSession();
	try {
		const user = await db.User.findByPk(userId);
		if (!user) return { ok: false, error: "User not found" };

		await session.run(
			`MERGE (u:User {id: $id})
			 SET u.email = $email, u.fullName = $fullName, u.role = $role, u.status = $status`,
			{
				id: user.id,
				email: user.email,
				fullName: user.fullName || user.name,
				role: user.role,
				status: user.status
			}
		);
		return { ok: true };
	} catch (err) {
		console.error("syncSingleUser error:", err);
		return { ok: false, error: err.message };
	} finally {
		await session.close();
	}
};

export const syncSingleApplication = async (applicationId) => {
	const session = await getSession();
	try {
		const app = await db.Application.findByPk(applicationId);
		if (!app) return { ok: false, error: "Application not found" };

		await session.run(
			`MATCH (u:User {id: $userId}), (j:Job {id: $jobId})
			 MERGE (u)-[r:APPLIED_FOR]->(j)
			 SET r.status = $status, r.createdAt = datetime($createdAt)`,
			{
				userId: app.userId,
				jobId: app.jobId,
				status: app.status,
				createdAt: app.createdAt ? new Date(app.createdAt).toISOString() : null
			}
		);
		return { ok: true };
	} catch (err) {
		console.error("syncSingleApplication error:", err);
		return { ok: false, error: err.message };
	} finally {
		await session.close();
	}
};

export const deleteApplicationRel = async (userId, jobId) => {
	const session = await getSession();
	try {
		await session.run(
			`MATCH (u:User {id: $userId})-[r:APPLIED_FOR]->(j:Job {id: $jobId})
			 DELETE r`,
			{ userId: parseInt(userId), jobId: parseInt(jobId) }
		);
		return { ok: true };
	} catch (err) {
		console.error("deleteApplicationRel error:", err);
		return { ok: false, error: err.message };
	} finally {
		await session.close();
	}
};
export const syncSingleCompany = async (companyId) => {
	const session = await getSession();
	try {
		const company = await db.Company.findByPk(companyId);
		if (!company) return { ok: false, error: "Company not found" };

		await session.run(
			`MERGE (co:Company {id: $id})
			 SET co.name = $name, co.logo = $logo, co.website = $website`,
			{
				id: company.id,
				name: company.name,
				logo: company.logo,
				website: company.website
			}
		);
		return { ok: true };
	} catch (err) {
		console.error("syncSingleCompany error:", err);
		return { ok: false, error: err.message };
	} finally {
		await session.close();
	}
};
