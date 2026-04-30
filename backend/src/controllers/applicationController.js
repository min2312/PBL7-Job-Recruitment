import applicationService from "../service/applicationService";

const HandleApplyJob = async (req, res) => {
    try {
        const data = req.body;
        const file = req.files && req.files.cv_file ? req.files.cv_file[0] : null;
        
        // Ensure userId is present (from token if not in body)
        if (!data.userId && req.user?.id) {
            data.userId = req.user.id;
        }

        const result = await applicationService.handleApplyJob(data, file);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error in HandleApplyJob controller:", error);
        return res.status(500).json({
            errCode: -1,
            errMessage: "Internal server error"
        });
    }
};

const HandleGetMyApplications = async (req, res) => {
    try {
        const userId = req.user?.id || req.query.userId;
        if (!userId) {
            return res.status(400).json({ errCode: 1, errMessage: "Missing userId" });
        }
        const result = await applicationService.getApplicationsByUser(userId);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ errCode: -1, errMessage: "Internal server error" });
    }
};

const HandleGetEmployerApplications = async (req, res) => {
    try {
        const companyId = req.user?.companyId;
        if (!companyId) {
            return res.status(403).json({ errCode: 1, errMessage: "Only employers with a company can view applications" });
        }
        
        const { jobId, status, candidateName, page, limit } = req.query;
        const result = await applicationService.getApplicationsByEmployer(companyId, {
            jobId, status, candidateName, page, limit
        });
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ errCode: -1, errMessage: "Internal server error" });
    }
};

module.exports = {
    HandleApplyJob,
    HandleGetMyApplications,
    HandleGetEmployerApplications
};
