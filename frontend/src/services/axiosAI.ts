import axios from "axios";

const aiApiBaseUrl =
	import.meta.env.VITE_AI_BASE_URL || "http://127.0.0.1:5000";

const axiosAI = axios.create({
	baseURL: aiApiBaseUrl,
	headers: {
		"Content-Type": "application/json",
	},
});

export default axiosAI;
