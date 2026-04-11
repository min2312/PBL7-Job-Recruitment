import neo4j from "neo4j-driver";
import dotenv from "dotenv";

dotenv.config();

const driver = neo4j.driver(
	process.env.NEO4J_URI,
	neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD),
);

// Khai báo hàm
const connectNeo4j = async () => {
	try {
		const serverInfo = await driver.getServerInfo();
		console.log("✅ Đã kết nối Neo4j thành công:", serverInfo.address);
	} catch (error) {
		console.error("❌ Lỗi kết nối Neo4j:", error);
	}
};

export default connectNeo4j;
export { driver };
