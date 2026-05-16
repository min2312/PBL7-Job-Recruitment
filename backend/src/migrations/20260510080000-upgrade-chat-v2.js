'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Create conversations table
    await queryInterface.createTable('conversations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id_1: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      user_id_2: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      last_message: {
        type: Sequelize.TEXT
      },
      last_message_at: {
        type: Sequelize.DATE
      },
      unread_count_1: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      unread_count_2: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add unique constraint for (user_id_1, user_id_2)
    await queryInterface.addIndex('conversations', ['user_id_1', 'user_id_2'], {
      unique: true,
      name: 'unique_conversation_users'
    });

    // 2. Update messages table to include conversation_id
    await queryInterface.addColumn('messages', 'conversation_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // Allow null for existing messages, then we can backfill
    });

    await queryInterface.addConstraint('messages', {
      fields: ['conversation_id'],
      type: 'foreign key',
      name: 'fk_messages_conversation_id',
      references: {
        table: 'conversations',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('messages', 'fk_messages_conversation_id');
    await queryInterface.removeColumn('messages', 'conversation_id');
    await queryInterface.dropTable('conversations');
  }
};
