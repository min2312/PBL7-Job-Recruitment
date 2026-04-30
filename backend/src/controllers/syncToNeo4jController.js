import { syncAllToNeo4j, syncRecentToNeo4j } from "../service/syncToNeo4jService";

export const HandleSyncAllToNeo4j = async (req, res) => {
	try {
		const result = await syncAllToNeo4j();
		if (result.ok) {
			return res
				.status(200)
				.json({ errCode: 0, errMessage: "OK", data: result });
		} else {
			return res
				.status(500)
				.json({ errCode: -1, errMessage: result.error || "Sync error" });
		}
	} catch (error) {
		return res.status(500).json({ errCode: -1, errMessage: error.message });
	}
};
export const HandleSyncRecentToNeo4j = async (req, res) => {
	try {
		const days = req.query.days ? Number(req.query.days) : 1;
		const result = await syncRecentToNeo4j(days);
		if (result.ok) {
			return res
				.status(200)
				.json({ errCode: 0, errMessage: "OK", data: result });
		} else {
			return res
				.status(500)
				.json({ errCode: -1, errMessage: result.error || "Sync error" });
		}
	} catch (error) {
		return res.status(500).json({ errCode: -1, errMessage: error.message });
	}
};
