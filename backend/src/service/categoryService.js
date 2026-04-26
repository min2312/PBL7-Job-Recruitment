const db = require("../models");

const getAllCategories = async () => {
    try {
        const categories = await db.Category.findAll({
            order: [["name", "ASC"]],
        });
        return categories;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getAllCategories,
};
