const employerService = require("../service/employerService");

const HandleGetStatistics = async (req, res) => {
    try {
        const companyId = req.user?.company?.id;
        if (!companyId) {
            return res.status(403).json({ 
                errCode: 1, 
                errMessage: "Only employers with a company can view statistics" 
            });
        }

        const result = await employerService.getEmployerStatistics(companyId);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error in HandleGetStatistics controller:", error);
        return res.status(500).json({
            errCode: -1,
            errMessage: "Internal server error"
        });
    }
};

module.exports = {
    HandleGetStatistics
};
