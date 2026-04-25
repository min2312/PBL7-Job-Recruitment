import neo4j from "neo4j-driver";
import dotenv from "dotenv";

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

const waitForNeo4j = async (delayMs = 5000) => {
	while (true) {
		try {
			await driver.verifyConnectivity();
			console.log("Connected to Neo4j successfully.");
			return;
		} catch (error) {
			console.warn(`Neo4j unavailable, retrying in ${delayMs / 1000}s...`, error.message || error);
			await sleep(delayMs);
			recreateDriver();
		}
	}
};

const getReadSession = () => driver.session({ defaultAccessMode: neo4j.session.READ });
const getWriteSession = () => driver.session({ defaultAccessMode: neo4j.session.WRITE });

export default waitForNeo4j;
export { waitForNeo4j, getReadSession, getWriteSession, driver };

