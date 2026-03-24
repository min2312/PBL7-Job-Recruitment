import db from "../models/index";
import { Op } from "sequelize";
import { CreateJWT } from "./JWT_Action";

/**
 * Middleware to check and update expired premium users and sponsored posts
 * This runs on every authenticated request to keep the database up-to-date
 */
const checkExpiredSubscriptions = async (req, res, next) => {
	try {
		const now = new Date();
		// Check and update expired premium users
		const premiumResult = await db.User.update(
			{ isPremium: false },
			{
				where: {
					isPremium: true,
					premiumExpiresAt: {
						[Op.lt]: now,
					},
				},
			}
		);
		// Check if current logged-in user's premium just expired
		if (req.user && req.user.id) {
			const currentUser = await db.User.findByPk(req.user.id, {
				attributes: [
					"id",
					"email",
					"fullName",
					"profilePicture",
					"role",
					"isPremium",
				],
			});
			// If user's premium status in DB differs from JWT token, refresh token
			if (currentUser && currentUser.isPremium !== req.user.isPremium) {
				const payload = {
					id: currentUser.id,
					email: currentUser.email,
					fullName: currentUser.fullName,
					profilePicture: currentUser.profilePicture,
					role: currentUser.role,
					isPremium: currentUser.isPremium,
				};
				const newToken = await CreateJWT(payload);
				res.cookie("jwt", newToken, {
					httpOnly: true,
					maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
					sameSite: "none",
					secure: true,
				});
				req.user = payload; // Update req.user with new data
				res.set("X-User-Updated", "true");
				console.log(
					`[Middleware] Refreshed JWT for user ${currentUser.id} - isPremium: ${currentUser.isPremium}`
				);
			}
		}

		// Check and delete expired sponsored posts
		const expiredPosts = await db.Post.findAll({
			where: {
				isSponsored: true,
				sponsoredExpiresAt: {
					[Op.lt]: now,
				},
			},
			attributes: ["id"],
		});

		if (expiredPosts.length > 0) {
			const postIds = expiredPosts.map((post) => post.id);

			// Delete all related data (comments, likes, shares) first
			await db.Comment.destroy({ where: { postId: postIds } });
			await db.Like.destroy({ where: { postId: postIds } });
			await db.Share.destroy({ where: { postId: postIds } });

			// Then delete the posts
			await db.Post.destroy({ where: { id: postIds } });

			console.log(
				`[Middleware] Deleted ${expiredPosts.length} expired sponsored posts`
			);
		}

		next();
	} catch (error) {
		console.error("Error checking expired subscriptions:", error);
		// Don't block the request even if this fails
		next();
	}
};

export default checkExpiredSubscriptions;
