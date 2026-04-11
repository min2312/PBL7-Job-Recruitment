import db from "../models/index";
import neo4j from "neo4j-driver";
import { driver } from "../config/connectNeo4j";

const getSession = () =>
	driver.session({ defaultAccessMode: neo4j.session.WRITE });

export const syncAllToNeo4j = async () => {
	const session = getSession();
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
				{ id: u.id, email: u.email, fullName: u.fullName },
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
