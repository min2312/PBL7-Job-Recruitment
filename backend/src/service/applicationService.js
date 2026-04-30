import db from "../models/index";
const { uploadToAzure } = require("./azureStorageService");

const handleApplyJob = async (data, file) => {
    try {
        const { jobId, userId, useExistingCv } = data;

        if (!jobId || !userId) {
            return {
                errCode: 1,
                errMessage: "Missing required parameters (jobId, userId)"
            };
        }

        // Check if already applied
        const existingApp = await db.Application.findOne({
            where: { jobId, userId }
        });

        if (existingApp) {
            return {
                errCode: 2,
                errMessage: "You have already applied for this job."
            };
        }

        let cvUrl = "";

        if (useExistingCv === "true" || useExistingCv === true) {
            // Option 1: Use existing CV from user profile
            const user = await db.User.findByPk(userId);
            if (!user || !user.cv_file) {
                return {
                    errCode: 3,
                    errMessage: "No existing CV found in your profile. Please upload a new one."
                };
            }
            cvUrl = user.cv_file;
        } else if (file) {
            // Option 2: Use newly uploaded file
            cvUrl = await uploadToAzure(
                file.buffer,
                file.originalname,
                file.mimetype
            );
        } else {
            return {
                errCode: 4,
                errMessage: "Please provide a CV file or use your existing one."
            };
        }

        // Create application record
        const application = await db.Application.create({
            userId,
            jobId,
            cv_file: cvUrl,
            status: "pending"
        });

        return {
            errCode: 0,
            errMessage: "Application submitted successfully!",
            data: application
        };

    } catch (error) {
        console.error("Error in handleApplyJob service:", error);
        return {
            errCode: -1,
            errMessage: "Internal server error"
        };
    }
};

const getApplicationsByEmployer = async (companyId, { jobId, status, candidateName, page = 1, limit = 10 }) => {
    try {
        const { Op } = db.Sequelize;
        const pageNum = Math.max(1, parseInt(page || "1"));
        const pageSize = Math.max(1, parseInt(limit || "10"));
        const offset = (pageNum - 1) * pageSize;

        const where = {};
        if (status && status !== "all") {
            where.status = status;
        }
        if (jobId) {
            where.jobId = jobId;
        }

        const userWhere = {};
        if (candidateName) {
            userWhere.name = { [Op.like]: `%${candidateName}%` };
        }

        const { count, rows } = await db.Application.findAndCountAll({
            where,
            include: [
                {
                    model: db.Job,
                    required: true,
                    where: { companyId }
                },
                {
                    model: db.User,
                    required: true,
                    where: userWhere,
                    attributes: ['id', 'name', 'email', 'phone', 'profilePicture']
                }
            ],
            limit: pageSize,
            offset,
            order: [['createdAt', 'DESC']],
            distinct: true
        });

        return {
            errCode: 0,
            data: {
                total: count,
                page: pageNum,
                limit: pageSize,
                applications: rows
            }
        };
    } catch (error) {
        console.error("Error in getApplicationsByEmployer service:", error);
        return { errCode: -1, errMessage: "Error fetching applications" };
    }
};

const getApplicationsByUser = async (userId) => {
    try {
        const apps = await db.Application.findAll({
            where: { userId },
            include: [
                { model: db.Job, include: [{ model: db.Company, as: "company" }] }
            ],
            order: [['createdAt', 'DESC']]
        });
        return {
            errCode: 0,
            data: apps
        };
    } catch (error) {
        console.error("Error in getApplicationsByUser service:", error);
        return { errCode: -1, errMessage: "Error fetching applications" };
    }
};

module.exports = {
    handleApplyJob,
    getApplicationsByUser,
    getApplicationsByEmployer
};
