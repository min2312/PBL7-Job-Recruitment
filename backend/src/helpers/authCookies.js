require("dotenv").config();

const cookieNames = {
	user: {
		access: "jwt",
		refresh: "refreshJwt",
	},
	admin: {
		access: "jwt2",
		refresh: "refreshJwt2",
	},
};

const getCookieSettings = (maxAge) => {
	const isProduction = process.env.NODE_ENV === "production";
	const secure = process.env.COOKIE_SECURE
		? process.env.COOKIE_SECURE === "true"
		: isProduction;
	const sameSite = process.env.COOKIE_SAME_SITE || (secure ? "none" : "lax");

	return {
		httpOnly: true,
		maxAge,
		secure,
		sameSite,
		path: "/",
	};
};

const getClearCookieSettings = () => {
	const isProduction = process.env.NODE_ENV === "production";
	const secure = process.env.COOKIE_SECURE
		? process.env.COOKIE_SECURE === "true"
		: isProduction;
	const sameSite = process.env.COOKIE_SAME_SITE || (secure ? "none" : "lax");

	return {
		httpOnly: true,
		secure,
		sameSite,
		path: "/",
	};
};

const getCookieMaxAge = (envKey, fallback) => {
	const value = Number(process.env[envKey]);
	return Number.isFinite(value) && value > 0 ? value : fallback;
};

const setAuthCookies = (res, scope, accessToken, refreshToken) => {
	const names = cookieNames[scope];
	if (!names) {
		return;
	}

	const accessMaxAge = getCookieMaxAge("maxAgeCookie", 30 * 60 * 1000);
	const refreshMaxAge = getCookieMaxAge(
		"maxAgeRefreshCookie",
		7 * 24 * 60 * 60 * 1000,
	);

	res.cookie(names.access, accessToken, getCookieSettings(accessMaxAge));
	res.cookie(names.refresh, refreshToken, getCookieSettings(refreshMaxAge));
};

const setAccessCookie = (res, scope, accessToken) => {
	const names = cookieNames[scope];
	if (!names) {
		return;
	}

	const accessMaxAge = getCookieMaxAge("maxAgeCookie", 30 * 60 * 1000);
	res.cookie(names.access, accessToken, getCookieSettings(accessMaxAge));
};

const clearAuthCookies = (res, scope = "all") => {
	const clearOptions = getClearCookieSettings();
	const namesToClear =
		scope === "all"
			? [cookieNames.user, cookieNames.admin]
			: [cookieNames[scope]].filter(Boolean);

	namesToClear.forEach((names) => {
		res.clearCookie(names.access, clearOptions);
		res.clearCookie(names.refresh, clearOptions);
	});
};

module.exports = {
	cookieNames,
	clearAuthCookies,
	getCookieSettings,
	setAccessCookie,
	setAuthCookies,
};