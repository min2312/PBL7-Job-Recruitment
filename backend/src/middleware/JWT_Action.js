import jwt from "jsonwebtoken";
require("dotenv").config();

const nonSecurePaths = [
	"/api/login",
	"/api/firebase-login",
	"/api/register",
	"/api/logout",
	"/api/refresh-token",
	"/api/admin/login",
	"/api/admin/refresh-token",
	//JOB
	"/api/jobs/random",
	"/api/jobs/:id",
	"/api/jobs/company/:id",
	"/api/jobs/search",
	//COMPANY
	"/api/companies",
	//LOCATION
	"/api/locations",
	//CATEGORY
	"/api/categories",
	//OTHER
	"/api/createTime",
	"/payment",
	"/payment/ZaloPay",
	"/payment/ZaloPay/check",
	"/payment/ZaloPay/callback",
	"/api/updateSlot",
	"/api/checkTime",
	"/google/redirect",
	"/auth/google",
	"/api/reset-otp/send",
	"/api/reset-otp/verify",
	"/api/reset-password",
	//NEO4J
	"/api/neo4j/heatmap",
	"/api/neo4j/competition",
	"/api/neo4j/market-demand",
	"/api/neo4j/hiring-criteria",
	"/api/neo4j/salary-trend",
	"/api/neo4j/salary-by-industry",
	"/api/neo4j/categories-paginated",
	"/api/neo4j/market-summary",
	"/api/neo4j/sync-all",
	"/api/neo4j/sync-new",
	"/api/neo4j/training-dataset",
];

const createSignedToken = (payload, secretKey, expiresIn) => {
	let token = null;
	try {
		token = jwt.sign(payload, secretKey, { expiresIn });
	} catch (e) {
		console.log(e);
	}
	return token;
};

const CreateJWT = (payload) => {
	let key = process.env.JWT_Secrect;
	let expiresIn = process.env.JWT_Expires_In || "1h";
	return createSignedToken(payload, key, expiresIn);
};

const CreateRefreshJWT = (payload) => {
	let key = process.env.JWT_Refresh_Secrect || process.env.JWT_Secrect;
	let expiresIn = process.env.JWT_Refresh_Expires_In || "7d";
	return createSignedToken(payload, key, expiresIn);
};

const verifyToken = (token) => {
	let key = process.env.JWT_Secrect;
	let decoded = null;
	try {
		decoded = jwt.verify(token, key);
	} catch (e) {
		if (e.name === "TokenExpiredError") {
			return { error: "TokenExpiredError", message: "Token has expired" };
		}
		console.log(e);
	}
	return decoded;
};

const verifyRefreshToken = (token) => {
	let key = process.env.JWT_Refresh_Secrect || process.env.JWT_Secrect;
	let decoded = null;
	try {
		decoded = jwt.verify(token, key);
	} catch (e) {
		if (e.name === "TokenExpiredError") {
			return {
				error: "TokenExpiredError",
				message: "Refresh token has expired",
			};
		}
		console.log(e);
	}
	return decoded;
};

const checkUserJWT = (req, res, next) => {
	const isNgrokRequest =
		req.headers["x-forwarded-host"] &&
		req.headers["x-forwarded-host"].includes("ngrok.io");

	// Support simple pattern matching for non-secure paths that contain route params like "/api/jobs/company/:id"
	const isNonSecurePath = (path) => {
		if (!path) return false;
		for (const p of nonSecurePaths) {
			if (p.includes(":")) {
				const re = new RegExp("^" + p.replace(/:[^/]+/g, "[^/]+") + "$");
				if (re.test(path)) return true;
			} else if (p === path) {
				return true;
			}
		}
		return false;
	};

	let cookies = req.cookies;
	if (cookies && (cookies.jwt || cookies.jwt2)) {
		if (cookies.jwt) {
			let token = cookies.jwt;
			let decoded = verifyToken(token);
			if (decoded && decoded.error === "TokenExpiredError") {
				if (!isNonSecurePath(req.path)) {
					return res.status(401).json({
						errCode: -2,
						errMessage: "Token has expired. Please log in again.",
					});
				}
			} else if (decoded) {
				req.user = decoded;
				req.token = token;
			}
		}

		if (cookies.jwt2) {
			let token = cookies.jwt2;
			let decoded = verifyToken(token);
			if (decoded && decoded.error === "TokenExpiredError") {
				if (!isNonSecurePath(req.path)) {
					return res.status(401).json({
						errCode: -1,
						errMessage: "Token has expired. Please log in again.",
					});
				}
			} else if (decoded) {
				req.admin = decoded;
				req.adminToken = token;
			}
		}
	}

	if (isNonSecurePath(req.path) || isNgrokRequest) {
		return next();
	}

	if (req.user || req.admin) {
		return next();
	} else {
		return res.status(401).json({
			errCode: -2,
			errMessage: "Not Authenticated the user",
		});
	}
};

const verifySocketToken = (socket, next) => {
	// Bypass cho AI service
	if (
		socket.handshake.headers["user-agent"]?.includes("python") ||
		socket.handshake.headers["x-ai-service"] === "true"
	) {
		socket.user = { id: "ai-service", role: "AI", fullName: "AI Service" };
		return next();
	}

	// Support multiple ways to pass token from browser clients
	const headerToken = socket.handshake.headers.authorization?.split(" ")[1];
	const authToken = socket.handshake.auth?.token; // recommended for browser socket.io
	const queryToken = socket.handshake.query?.token; // fallback via query string
	const token = headerToken || authToken || queryToken;
	if (!token) {
		return next(new Error("Authentication error: Token is missing"));
	}

	const decoded = verifyToken(token);
	if (decoded && decoded.error === "TokenExpiredError") {
		return next(new Error("Authentication error: Token has expired"));
	}
	if (!decoded) {
		return next(new Error("Authentication error: Invalid token"));
	}

	socket.user = decoded;
	next();
};

module.exports = {
	CreateJWT,
	CreateRefreshJWT,
	verifyToken,
	verifyRefreshToken,
	checkUserJWT,
	verifySocketToken,
};
