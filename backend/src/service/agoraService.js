import { RtcTokenBuilder, RtcRole } from "agora-token";
import dotenv from "dotenv";
dotenv.config();

/**
 * Sinh mã thông báo (RTC Token) bảo mật cho phòng phỏng vấn Agora
 * @param {string} channelName Tên phòng họp (ví dụ: interview_123)
 * @param {number|string} account UID của người dùng (nếu là số thì truyền số, nếu là chuỗi thì truyền chuỗi)
 * @param {string} role "publisher" hoặc "subscriber"
 * @param {number} expirationTimeInSeconds Thời hạn hiệu lực của token (mặc định 4 tiếng = 14400 giây)
 */
const generateRtcToken = (channelName, account, role = "publisher", expirationTimeInSeconds = 14400) => {
	const appId = process.env.AGORA_APP_ID;
	const appCertificate = process.env.AGORA_APP_CERTIFICATE;

	if (!appId || !appCertificate) {
		throw new Error("AGORA_APP_ID hoặc AGORA_APP_CERTIFICATE chưa được cấu hình trong file .env");
	}

	const currentTimestamp = Math.floor(Date.now() / 1000);
	const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

	const rtcRole = role === "publisher" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

	// Sử dụng buildTokenWithUid (hoặc buildTokenWithAccount tùy theo kiểu uid)
	// Để đơn giản và an toàn với cả integer và string UID, ta chuyển uid về dạng int hoặc 0 nếu không xác định
	const numericUid = Number(account) || 0;

	// Để hỗ trợ kiến trúc 2 client song song (Client chính phát Mic & Camera, Client phụ phát Screen Share),
	// ta sử dụng UID = 0 để tạo "Wildcard Token" hợp lệ cho cả UID chính (X) và UID phụ (X + 1000000).
	const token = RtcTokenBuilder.buildTokenWithUid(
		appId,
		appCertificate,
		channelName,
		0,
		rtcRole,
		expirationTimeInSeconds,
		privilegeExpiredTs
	);

	return {
		token,
		appId,
		channelName,
		uid: numericUid,
		privilegeExpiredTs,
	};
};

export { generateRtcToken };
