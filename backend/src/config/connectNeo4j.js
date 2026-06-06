import neo4j from "neo4j-driver";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const URI = process.env.NEO4J_URI;
const USERNAME = process.env.NEO4J_USERNAME;
const PASSWORD = process.env.NEO4J_PASSWORD;

let driver = neo4j.driver(
	URI,
	neo4j.auth.basic(USERNAME, PASSWORD),
	{
		disableLosslessIntegers: true,
		maxConnectionPoolSize: 50,
	},
);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const recreateDriver = () => {
	if (driver) {
		driver.close().catch(() => {});
	}
	driver = neo4j.driver(
		URI,
		neo4j.auth.basic(USERNAME, PASSWORD),
		{
			disableLosslessIntegers: true,
			maxConnectionPoolSize: 50,
		},
	);
	return driver;
};

let isResuming = false;

const resumeAuraInstance = async () => {
	const clientId = process.env.AURA_CLIENT_ID;
	const clientSecret = process.env.AURA_CLIENT_SECRET;
	const instanceId = process.env.AURA_INSTANCEID;

	if (!clientId || !clientSecret || !instanceId) {
		console.warn("Aura API credentials (AURA_CLIENT_ID, AURA_CLIENT_SECRET, AURA_INSTANCEID) are not set. Cannot auto-resume Neo4j Aura.");
		return;
	}

	if (isResuming) return;
	isResuming = true;

	console.log("Attempting to automatically resume Neo4j Aura instance...");
	try {
		const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
		const apiBase = process.env.AURA_API_URL;
		
		const tokenResponse = await axios.post(
			`${apiBase}/oauth/token`,
			"grant_type=client_credentials",
			{
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
					Authorization: `Basic ${authHeader}`,
				},
			}
		);

		const accessToken = tokenResponse.data.access_token;

		await axios.post(
			`${apiBase}/v1/instances/${instanceId}/resume`,
			{},
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
					"Content-Type": "application/json",
				},
			}
		);
		console.log("Successfully requested Neo4j Aura to resume.");
	} catch (error) {
		console.error("Failed to auto-resume Neo4j Aura:", error.response?.data || error.message);
		isResuming = false;
	}
};

const waitForNeo4j = async (delayMs = 5000) => {
	let attempt = 0;
	while (true) {
		try {
			await driver.verifyConnectivity();
			console.log("Connected to Neo4j successfully.");
			isResuming = false;
			return;
		} catch (error) {
			attempt++;
			console.warn(`Neo4j unavailable (attempt ${attempt}), retrying in ${delayMs / 1000}s...`, error.message || error);
			if (attempt === 1) {
				resumeAuraInstance().catch((err) => console.error("Error in background resumeAuraInstance:", err));
			}
			await sleep(delayMs);
			recreateDriver();
		}
	}
};

const getReadSession = () => driver.session({ defaultAccessMode: neo4j.session.READ });
const getWriteSession = () => driver.session({ defaultAccessMode: neo4j.session.WRITE });

export default waitForNeo4j;
export { waitForNeo4j, getReadSession, getWriteSession, driver };

