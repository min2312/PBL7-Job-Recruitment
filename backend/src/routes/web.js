import express from "express";
import userController from "../controllers/userController";
import adminController from "../controllers/adminController";
import * as neo4jController from "../controllers/neo4jController";
import { checkUserJWT, CreateJWT } from "../middleware/JWT_Action";
import checkExpiredSubscriptions from "../middleware/checkExpiredSubscriptions";
import passport from "passport";
// import apiController from "../controllers/apiController";
import { uploadCloud, uploadMedia } from "../middleware/Cloudinary_Multer";
// import socialController from "../controllers/socialController.js";
import {
	sendResetOTP,
	verifyResetOTP,
	resetPassword,
} from "../controllers/otpController.js";
import * as syncToNeo4jController from "../controllers/syncToNeo4jController";
let router = express.Router();

let initWebRoutes = (app) => {	
	router.all("*", checkUserJWT);
	// router.all("*", checkExpiredSubscriptions); // Chạy SAU khi đã có req.user
	router.post("/api/login", userController.HandleLogin);
	router.post("/api/admin/login", adminController.HandleLoginAdmin);
	router.post("/api/logout", userController.HandleLogOut);
	router.post("/api/admin/logout", adminController.HandleLogOut);
	router.get("/api/account", userController.getUserAccount);
	router.get("/api/admin/account", adminController.getAdminAccount);
	router.post("/api/refresh-token", userController.HandleRefreshToken);
	router.post("/api/admin/refresh-token", adminController.HandleRefreshAdminToken);
	// router.get("/api/get-all-user", userController.HandleGetAllUser);
	// router.put("/api/edit-user", userController.HandleEditUser);
	// router.put(
	// 	"/api/update-profile",
	// 	uploadCloud.single("image"),
	// 	userController.HandleUpdateProfile,
	// );
	router.post("/api/create-new-user", userController.HandleCreateNewUser);

	// router.post(
	// 	"/api/create-new-post",
	// 	uploadMedia.fields([
	// 		{ name: "image", maxCount: 10 },
	// 		{ name: "video", maxCount: 1 },
	// 	]),
	// 	apiController.HandleCreatePost,
	// );
	// router.post(
	// 	"/api/update-post",
	// 	uploadMedia.fields([
	// 		{ name: "image", maxCount: 10 },
	// 		{ name: "video", maxCount: 1 },
	// 	]),
	// 	apiController.HandleEditPost,
	// );
	// router.post("/api/delete-post", apiController.HandleDeletePost);
	// router.post("/payment/ZaloPay", apiController.handlePaymentZaloPay);
	// // ZaloPay status check and callback
	// router.post("/payment/ZaloPay/check", apiController.handleCheckZaloPay);
	// router.post("/payment/ZaloPay/callback", apiController.handleCallBackZaloPay);
	// router.delete("/api/delete-user", userController.HandleDeleteUser);
	// // router.post("/payment", apiController.HandlePaymentMoMo);

	// //ADMIN
	// router.get("/api/admin/get-all-users", adminController.HandleGetAllUsers);
	// router.post("/api/admin/suspend-user", adminController.HandleSuspendUser);
	// router.post("/api/admin/activate-user", adminController.HandleActivateUser);
	// router.delete("/api/admin/delete-user", adminController.HandleDeleteUser);
	// router.get("/api/admin/get-all-posts", adminController.HandleGetAllPosts);
	// router.post("/api/admin/block-post", adminController.HandleBlockPost);
	// router.post("/api/admin/unblock-post", adminController.HandleUnblockPost);
	// router.delete("/api/admin/delete-post", adminController.HandleDeletePost);
	// router.get("/api/admin/statistics", adminController.HandleGetStatistics);

	// Neo4j analytics endpoints
	router.get("/api/neo4j/heatmap", neo4jController.HandleGetJobHeatmap); //nhu cầu tuyển dụng theo ngành và địa điểm
	router.get(
		"/api/neo4j/competition",
		neo4jController.HandleGetCategoryCompetition, //tỷ lệ cạnh tranh theo ngành
	);
	router.get(
		"/api/neo4j/market-demand",
		neo4jController.HandleGetMarketDemand, // thị trường theo ngành + địa điểm
	);
	router.get(
		"/api/neo4j/hiring-criteria",
		neo4jController.HandleGetHiringCriteria, //tiêu chí tuyển dụng phổ biến theo ngành
	);
	router.get("/api/neo4j/salary-trend", neo4jController.HandleGetSalaryTrend); //xu hướng lương theo thời gian
	router.get(
		"/api/neo4j/training-dataset",
		neo4jController.HandleBuildTrainingDataset,
	); //tập dữ liệu dùng cho train XGBoost
	router.post(
		"/api/neo4j/salary-backfill", //backfill dữ liệu lương đã có trong SQL sang Neo4j
		neo4jController.HandleBackfillSalary,
	);

	// Neo4j sync endpoint
	router.post(
		"/api/neo4j/sync-all",
		syncToNeo4jController.HandleSyncAllToNeo4j,
	);

	// router.get(
	// 	"/auth/google",
	// 	passport.authenticate("google", { scope: ["profile", "email"] })
	// );

	// router.get(
	// 	"/google/redirect",
	// 	passport.authenticate("google", {
	// 		failureRedirect: "http://localhost:3000/login",
	// 	}),
	// 	function (req, res) {
	// 		const { user } = req;
	// 		if (user) {
	// 			let payload = {
	// 				id: user.id,
	// 				email: user.email,
	// 				fullName: user.fullName,
	// 			};
	// 			let token = CreateJWT(payload);

	// 			res.cookie("jwt", token, { httpOnly: true, secure: false });
	// 			res.cookie("loginSuccess", true, { httpOnly: false, secure: false });
	// 			res.redirect("http://localhost:3000/users");
	// 		} else {
	// 			res.redirect("http://localhost:3000/login");
	// 		}
	// 	}
	// );
	// app.get(
	// 	"/auth/facebook",
	// 	passport.authenticate("facebook", {
	// 		scope: "public_profile,email,user_friends",
	// 	})
	// );

	// app.get(
	// 	"/facebook/redirect",
	// 	passport.authenticate("facebook", {
	// 		failureRedirect: "http://localhost:3000/login",
	// 	}),
	// 	function (req, res) {
	// 		const { user } = req;
	// 		if (user) {
	// 			let payload = {
	// 				id: user.id,
	// 				email: user.email,
	// 				fullName: user.fullName,
	// 			};
	// 			let token = CreateJWT(payload);

	// 			res.cookie("jwt", token, { httpOnly: true, secure: false });
	// 			res.cookie("loginSuccess", true, { httpOnly: false, secure: false });
	// 			res.redirect("http://localhost:3000/users");
	// 		} else {
	// 			res.redirect("http://localhost:3000/login");
	// 		}
	// 	}
	// );

	// router.post("/api/reset-otp/send", sendResetOTP);
	// router.post("/api/reset-otp/verify", verifyResetOTP);
	// router.post("/api/reset-password", resetPassword);
	// router.get("/api/messages", socialController.handleGetMessages);
	// router.put("/api/messages/edit", socialController.handleEditMessage);

	return app.use("/", router);
};

module.exports = initWebRoutes;
