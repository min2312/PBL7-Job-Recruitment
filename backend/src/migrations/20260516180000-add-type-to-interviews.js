'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('interviews', 'type', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'online_inapp',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('interviews', 'type');
  }
};
