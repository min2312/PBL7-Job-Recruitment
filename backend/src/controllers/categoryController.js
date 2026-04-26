const categoryService = require("../service/categoryService");

const getAllCategories = async (req, res) => {
    try {
        const data = await categoryService.getAllCategories();
        return res.status(200).json({ errCode: 0, errMessage: "OK", data });
    } catch (error) {
        console.error("Error in getAllCategories", error);
        return res.status(500).json({ errCode: -1, errMessage: "Internal server error" });
    }
};

module.exports = {
    getAllCategories,
};
