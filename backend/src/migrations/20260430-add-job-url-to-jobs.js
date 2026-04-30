'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('jobs');
    
    // Chỉ thêm nếu cột chưa tồn tại
    if (!tableInfo.job_url) {
      await queryInterface.addColumn('jobs', 'job_url', {
        type: Sequelize.STRING,
        allowNull: true,
      });
      
      // Thêm index để crawler check trùng nhanh
      await queryInterface.addIndex('jobs', ['job_url']);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('jobs', 'job_url');
  }
};
